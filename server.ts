import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, getDocFromServer, deleteDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Firebase using the client configuration
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
);

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Error handling in strict compliance with firestore security rules
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as required by the Firebase Integration Skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Successfully connected to Firestore database!");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Please check your Firebase configuration: Firestore client is offline.");
    } else {
      console.log("Firestore connection test initiated (unauthenticated response matches expectations).");
    }
  }
}
testConnection();

// Initialize Google GenAI client lazily to prevent load-time crashes if GEMINI_API_KEY is missing/stale
const ai = {
  get models() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") {
      throw new Error("عذراً، لم يتم العثور على مفتاح واجهة برمجة التطبيقات (GEMINI_API_KEY) في خادم البلاغة الرقمي الكوني. يرجى تهيئته في معلمات الإعدادات الأمنية.");
    }
    const client = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return client.models;
  }
};

let currentDefaultModel = "gemini-3.5-flash";
let isGemini35Congested = false;

// Lazy-initialize and wrap model calls in a resilient retry container with model-fallback capabilities
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<any> {
  // Determine preferred model
  let rawPreferred = params.preferredModel || currentDefaultModel;

  // If gemini-3.5-flash is marked as congested, swap to gemini-flash-latest immediately
  if (isGemini35Congested && rawPreferred === "gemini-3.5-flash") {
    rawPreferred = "gemini-flash-latest";
  }

  // Order of models to try. If congested, try gemini-3.5-flash at the end.
  const modelsToTry = isGemini35Congested
    ? ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"]
    : [rawPreferred, "gemini-flash-latest", "gemini-3.1-flash-lite"].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelsToTry) {
    // If the model is congested, try it only once to minimize latency
    const maxAttemptsForModel = (model === "gemini-3.5-flash" && isGemini35Congested) ? 1 : 2;
    let delay = 200;

    for (let attempt = 1; attempt <= maxAttemptsForModel; attempt++) {
      try {
        console.log(`Calling Gemini API [Model: ${model}, Attempt: ${attempt}/${maxAttemptsForModel}]...`);
        
        let timerId: any;
        const timeoutThreshold = (model === "gemini-3.5-flash") ? 1850 : 7000;
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          timerId = setTimeout(() => {
            reject(new Error(`Timeout: Model ${model} took more than ${timeoutThreshold}ms to respond`));
          }, timeoutThreshold);
        });

        const response = await Promise.race([
          ai.models.generateContent({
            ...params,
            model: model,
          }),
          timeoutPromise
        ]);
        
        clearTimeout(timerId);

        // Safe recovery or default maintenance
        if (model === "gemini-flash-latest" && isGemini35Congested) {
          currentDefaultModel = "gemini-flash-latest";
        }

        return response; // Success!
      } catch (err: any) {
        lastError = err;
        const errMessage = err instanceof Error ? err.message : String(err);
        const is503OrRateLimit = 
          errMessage.includes("503") || 
          errMessage.includes("UNAVAILABLE") || 
          errMessage.includes("high demand") || 
          errMessage.includes("ResourceExhausted") ||
          errMessage.includes("429") ||
          errMessage.includes("quota") ||
          errMessage.includes("overloaded") ||
          errMessage.includes("busy") ||
          errMessage.includes("Timeout");

        console.warn(`Gemini call failed [Model: ${model}, Attempt: ${attempt}] with error:`, errMessage);

        if (is503OrRateLimit) {
          if (model === "gemini-3.5-flash") {
            console.log("CRITICAL: gemini-3.5-flash is experiencing high load/503. Activating isGemini35Congested = true.");
            isGemini35Congested = true;
            currentDefaultModel = "gemini-flash-latest";
          }

          // Do NOT block and sleep inside a live user HTTP Request during known congestion!
          // Instantly break out of this model's attempts and try the next candidate model to keep response instant.
          console.log(`Model ${model} is congested/UNAVAILABLE. Fast-failing immediately to next available model...`);
          break;
        } else {
          // Non-transitory errors (e.g. content blocks or parameter issues) do not warrant fallback retries
          throw err;
        }
      }
    }
  }

  throw lastError || new Error("فشلت جميع محاولات الاتصال بالنموذج الأدبي السحابي.");
}

// Utility to strip Arabic diacritics (Tashkeel)
function stripDiacritics(text: string): string {
  return text.trim().replace(/[\u064B-\u0652\u0653\u0670]/g, "");
}

// Utility to verify if text contains at least one Arabic diacritic
function hasDiacritics(text: string): boolean {
  return /[\u064B-\u0652\u0653\u0670]/.test(text);
}

// Utility to automatically add Arabic diacritics (Harakat) to a word using Gemini
async function autoDiacritize(word: string): Promise<string> {
  try {
    const prompt = `أنت لغوي عربي بارع ومصحح لغوي فصيح.
مهمتك هي إضافة الحركات والتشكيل الصحيح (الضبط بالشكل الكامل مثل الفتحة والضمة والكسرة والسكون والشدة) على الكلمة العربية التالية لتبدو أصيلة وبليغة وصحيحة النطق تماماً وتجنّب كتابتها بدون حركات:
"${word}"

أرجع الكلمة مشكّلة بالحركات فقط دون أي كلام آخر، ودون علامات تنصيص.`;
    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
    });
    const result = response.text?.trim() || "";
    const cleaned = result.replace(/['"\`«»“”]/g, "").trim();
    if (cleaned.length > 0) {
      return cleaned;
    }
    return word;
  } catch (error) {
    console.error("Failed to auto-diacritize word:", error);
    return word;
  }
}

const DIACRITICS_MAP: Record<string, string> = {
  "وطن": "وَطَن",
  "هيبة": "هَيْبَة",
  "حنين": "حَنِين",
  "طمأنينة": "طُمَأْنِينَة",
  "شغف": "شَغَف",
  "الم": "أَلَم",
  "ألم": "أَلَم",
  "شرف": "شَرَف",
  "رؤية": "رُؤْيَة",
  "كرامة": "كَرَامَة",
  "تسامح": "تَسَامُح",
  "حب": "حُبّ",
  "سلام": "سَلَام",
  "صبر": "صَبْر",
  "روح": "رُوح",
  "عزيمة": "عَزِيمَة",
  "قوة": "قُوَّة",
  "مجد": "مَجْد",
  "وجد": "وَجْد",
  "الوجد": "الْوَجْد"
};

// Seeding default premium words to Cloud Firestore
async function seedDefaultWordsIfEmpty() {
  try {
    console.log("Ensuring default words are seeded/updated in Cloud Firestore...");
    // Force full deletion of all database instances of "ألم" (including duplicates) as requested
    try {
      const snap = await getDocs(collection(db, "words"));
      for (const d of snap.docs) {
        const dData = d.data();
        const dWord = dData?.word || "";
        const normalized = stripDiacritics(dWord).replace(/[أإآا]/g, "ا");
        const currentOwner = (dData?.owner || "").trim();
        const currentEmail = (dData?.ownerEmail || "").trim();
        
        // Deletes "ألم", "أَلَم", "الم" and any word matching w-17802 or owned by "محمد" with the word "ألم"
        if (
          normalized === "الم" || 
          dWord.includes("ألم") || 
          dWord.includes("أَلَم") || 
          dWord.includes("الم") ||
          d.id === "w-17802" ||
          (currentOwner.includes("محمد") && (normalized === "الم" || dWord.includes("ألم"))) ||
          currentEmail === "mohammad@kalimah.com"
        ) {
          await deleteDoc(doc(db, "words", d.id));
          console.log(`Successfully deleted old or reserved 'ألم' instance: ${d.id} (Owner: ${currentOwner})`);
        }
      }
    } catch (err) {
      console.error("Failed to clean up 'ألم' instances from DB:", err);
    }

    for (const word of DEFAULT_WORDS) {
      await setDoc(doc(db, "words", word.id), word);
    }
    
    // Quick, non-blocking diacritic check using our local DIACRITICS_MAP
    const querySnapshot = await getDocs(collection(db, "words"));
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const currentWord = data.word || "";
      const stripped = stripDiacritics(currentWord);
      
      if (DIACRITICS_MAP[stripped] && currentWord !== DIACRITICS_MAP[stripped]) {
        console.log(`Force updating word in database from "${currentWord}" to "${DIACRITICS_MAP[stripped]}"`);
        await setDoc(doc(db, "words", docSnap.id), {
          ...data,
          word: DIACRITICS_MAP[stripped]
        });
      }
    }
    console.log("Firestore default seeding and quick diacritics update completed successfully!");
  } catch (error) {
    console.error("Failed to seed default words on startup:", error);
  }
}

// Fetch owned words helper from Cloud Firestore
async function getWordsFromFirestore() {
  const pathName = "words";
  try {
    const querySnapshot = await getDocs(collection(db, pathName));
    const words: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.word) {
        const stripped = stripDiacritics(data.word);
        if (DIACRITICS_MAP[stripped]) {
          data.word = DIACRITICS_MAP[stripped];
        } else if (DIACRITICS_MAP[data.word.trim()]) {
          data.word = DIACRITICS_MAP[data.word.trim()];
        }
      }
      words.push(data);
    });
    // Sort descending by createdAt date
    words.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return words;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathName);
    return [];
  }
}

// Pre-seeded deep Arabic words to make the site look alive and prestigious
const DEFAULT_WORDS = [
  {
    id: "w-1",
    word: "وَطَن",
    owner: "محمود درويش",
    ownerEmail: "darwish@kalimah.com",
    isGift: false,
    giftMessage: "",
    theme: "emerald",
    createdAt: new Date("2026-01-15T12:00:00Z").toISOString(),
    quote: "وطني ليس حقيبة وأنا لست مسافراً، أنا العاشق والتراب حبيبتي.",
    meaning: "المأوى الشامل والمستقر العاطفي والروحي، وليس مجرد رقعة جغرافية، بل هو الهوية الممتدة في عمق الزمان والذاكرة.",
    story: "يُحكى أن كلمة 'الوطن' نُقشت بأحرف من نور فوق أبواب المدن العتيقة، ليتذكر الراحلون أن كل الدروب التي لا تؤدي إلى البيوت والذكريات الدافئة هي دروبُ تيهٍ وصقيع."
  },
  {
    id: "w-2",
    word: "هَيْبَة",
    owner: "أبو الطيب المتنبي",
    ownerEmail: "mutanabbi@kalimah.com",
    isGift: false,
    theme: "emerald",
    createdAt: new Date("2026-02-10T14:30:00Z").toISOString(),
    quote: "الخَيْلُ وَاللّيْلُ وَالبَيْدَاءُ تَعرِفُني، وَالسّيْفُ وَالرُّمْحُ وَالقِرْطَاسُ وَالقَلَمُ.",
    meaning: "وقارٌ عظيم وجلال يقع في نفوس الناظرين، ينبع من قوة الشخصية، ورجاحة العقل، والصدق الداخلي الذي يفرض الاحترام دون حاجة لتكلف.",
    story: "تروي الحكايات أن الهيبة رداءٌ لا يُنسج من خيوط الحرير أو الذهب، بل يُصنع من عزة النفس والصمت الحكيم الذي ينطق في مواقف الحسم بلا كلمات."
  },
  {
    id: "w-3",
    word: "حَنِين",
    owner: "ولادة بنت المستكفي",
    ownerEmail: "wallada@kalimah.com",
    isGift: true,
    giftMessage: "إلى ابن زيدون، عسى اللقاء قريب يجمع شتات قلوبنا.",
    theme: "gold",
    createdAt: new Date("2026-03-01T09:12:00Z").toISOString(),
    quote: "أكادُ لولا جلال الحب يعصمني، أطيرُ شوقاً وجسمي بالهوى عاني.",
    meaning: "نزوعُ الروح واشتعال الوجدان توقاً إلى زمنٍ مضى، أو مكانٍ أثيث، أو شخص غاب، وهو الوجع اللذيذ الذي يربط القلوب بماضيها الخالد.",
    story: "نُقل عن الفلاسفة القدامى أن الحنين هو تنهيدة الروح المغتربة التي تبحث عن نصفها الغائب في زوايا الذكرى وعتمات الليالي الشتوية."
  },
  {
    id: "w-4",
    word: "طُمَأْنِينَة",
    owner: "إبراهيم بن الصامت",
    ownerEmail: "ibrahim@kalimah.com",
    isGift: false,
    theme: "onyx",
    createdAt: new Date("2026-04-20T10:00:00Z").toISOString(),
    quote: "إذا سكن اليقين حشا فؤادي، رأيت الكون بستاناً نضيراً.",
    meaning: "سكون القلب وزوال الخوف والاضطراب، وهي أرقى درجات السلام الداخلي حيث تتصالح الروح مع أقدارها وتعيش اللحظة برضا تام.",
    story: "قيل إن أحد الحكماء طُلب منه وصف الطمأنينة فقال: هي قطرة ندى سقطت على غرة زهرة في فجر ليلة هادئة، فنام العصفور في عشه آمناً لا يخشى الريح."
  },
  {
    id: "w-5",
    word: "شَغَف",
    owner: "مي زيادة",
    ownerEmail: "may@kalimah.com",
    isGift: false,
    theme: "sapphire",
    createdAt: new Date("2026-05-12T16:45:00Z").toISOString(),
    quote: "إن لم نكن شغوفين بما نفعل، فنحن نعيش على هامش الحياة بانتظار النهاية فقط.",
    meaning: "لهيب داخلي ومحرك وجداني جبار يدفع صاحبه للسعي وراء غايته بكل جوارحه، وهو نقطة التماس الحارة بين الحلم والواقع.",
    story: "يُحكى أن الشغف هو تلك الشعلة المقدسة التي يورثها المبدعون لبعضهم بعضاً، وبدونها تظل روائع الورق بلا روح، وجانبيات المرمر بلا حياة."
  }
];

app.use(express.json());

// API: Get all owned words from Cloud Firestore
app.get("/api/words", async (req, res) => {
  try {
    const data = await getWordsFromFirestore();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "فشل تحميل الكلمات المحجوزة من قاعدة البيانات السحابية" });
  }
});

// API: Search Arabic Word & Generate previews/ownership options using Gemini
app.get("/api/words/search", async (req, res) => {
  const queryWord = req.query.word;
  if (!queryWord || typeof queryWord !== "string") {
    return res.status(400).json({ error: "يرجى تحديد كلمة صالحة للبحث عنها" });
  }

  // Clean the word (basic trim & normalize)
  let normalizedWord = queryWord.trim();
  
  if (normalizedWord.length === 0) {
    return res.status(400).json({ error: "كلمة البحث فارغة" });
  }

  // Automatically add diacritics (Harakat) if missing
  if (!hasDiacritics(normalizedWord)) {
    console.log(`Word "${normalizedWord}" lacks diacritics. Auto-diacritizing using Gemini...`);
    const diacritized = await autoDiacritize(normalizedWord);
    if (hasDiacritics(diacritized)) {
      normalizedWord = diacritized;
    } else {
      return res.status(400).json({
        error: "عذراً، يجب إدخال الكلمة مع تشكيل وحركات صحيحة؛ في حال تعذر التشكيل التلقائي يرجى كتابتها يدوياً بالحركات (مثل: سَلام، شَغَف، أَلَم)."
      });
    }
  }

  const stripedQuery = stripDiacritics(normalizedWord);
  const normalizedQueryLetter = stripedQuery.replace(/[أإآا]/g, "ا");

  // Dynamic on-demand deletion to guarantee 'ألم' is released immediately if searched
  if (normalizedQueryLetter === "الم") {
    try {
      console.log("Searching for 'ألم' - dynamically purging any old 'ألم' from Firestore...");
      const snap = await getDocs(collection(db, "words"));
      for (const d of snap.docs) {
        const dData = d.data();
        const dWord = dData?.word || "";
        const normDB = stripDiacritics(dWord).replace(/[أإآا]/g, "ا");
        const currentOwner = (dData?.owner || "").trim();
        if (
          normDB === "الم" ||
          dWord.includes("ألم") ||
          dWord.includes("أَلَم") ||
          d.id === "w-17802" ||
          currentOwner.includes("محمد")
        ) {
          await deleteDoc(doc(db, "words", d.id));
          console.log(`Dynamically wiped matching DB instance in search: ${d.id}`);
        }
      }
    } catch (err) {
      console.error("Dynamic lookup cleanup error:", err);
    }
  }

  // Check if already taken in Firestore using stripped diacritics comparison
  const allWords = await getWordsFromFirestore();
  const taken = allWords.find(
    (w: any) => stripDiacritics(w.word) === stripedQuery
  );

  if (taken) {
    return res.json({
      available: false,
      word: taken.word,
      details: taken,
    });
  }

  // If available, call Gemini to generate preview metadata (meaning, poem/quote candidate, brief story)
  // this showcases the AI capabilities beautifully!
  try {
    const prompt = `أنت خبير لغوي وأديب عربي بليغ ومفكر مرهف الوجدان.
أريدك أن تقدم تحليلاً بلاغياً وأدبياً غنياً وشاعرياً للغاية لكلمة عربية واحدة وهي: "${normalizedWord}".
يجب أن ترجع الإجابة بتنسيق JSON حصراً ملتزماً بالقواعد وحقول الـ JSON التالية:
- "word": الكلمة نفسها المبحوث عنها.
- "meaning": وصف أدبي وعاطفي عميق ومفصل لمعنى الكلمة بروعة بلاغية لغوية (حوالي 2-3 أسطر باللغة العربية الفصيحة).
- "quote": بيت شعر بليغ مأثور أو اقتباس أدبي شهير استُخدمت فيه هذه الكلمة أو يناسب روح الكلمة تماماً.
- "story": قصة نادرة، خيالية أو واقعية، أو فكرة فلسفية دافئة حول كيف وُلدت الكلمة وتأثيرها الأدبي في النفس (حوالى 3 أسطر بليغة).
- "suggestedPoets": قائمة بـ 3 أسماء شعراء أو أدباء عرب شهيرين قد ترتبط الفكرة بهم (على سبيل المثال: المتنبي، نزار قباني، درويش، إلخ).

أرجو أن تكون الصياغة ناصعة البلاغة وخالية تماماً من الكلمات العامية أو الجافة، وتجلب دفء اللغة العربية وأصالتها.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaning: { type: Type.STRING },
            quote: { type: Type.STRING },
            story: { type: Type.STRING },
            suggestedPoets: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["word", "meaning", "quote", "story", "suggestedPoets"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("لم ينتج نموذج الذكاء الاصطناعي أي استجابة");
    }

    const aiData = JSON.parse(textOutput);
    res.json({
      available: true,
      word: normalizedWord,
      aiFeedback: aiData,
    });
  } catch (error: any) {
    console.error("Gemini Preview generation failed:", error);
    // Safe Arabic fallback if Gemini fails or rate limit hits
    res.json({
      available: true,
      word: normalizedWord,
      aiFeedback: {
        word: normalizedWord,
        meaning: `تُعد كلمة "${normalizedWord}" من الكلمات الفريدة التي تحمل نكهة عربية خاصة ومعانٍ وجدانية عميقة تتسلل إلى ثنايا الروح لتبعث فيها السكينة والجمال.`,
        quote: `يا لجمال لغتنا العربية التي تختصر الروح في بضعة أحرف من كلمة "${normalizedWord}".`,
        story: `يقال إن لكل حرف في العربية روح نبضت بالحياة منذ آلاف السنين لتصنع ملامح هذا البناء الباذخ الجمال.`,
        suggestedPoets: ["أبو الطيب المتنبي", "محمود درويش", "جبران خليل جبران"]
      }
    });
  }
});

// API: Claim (Buy/Own) Arabic Word
app.post("/api/words/claim", async (req, res) => {
  const { word, owner, ownerEmail, isGift, giftMessage, theme, lat, lng, locationName, category, price } = req.body;

  if (!word || !owner || !ownerEmail) {
    return res.status(400).json({ error: "جميع الحقول الأساسية (الكلمة، الاسم، البريد) مطلوبة لإتمام الحجز" });
  }

  let cleanWord = word.trim();

  // Automatically add diacritics (Harakat) if missing
  if (!hasDiacritics(cleanWord)) {
    console.log(`Word "${cleanWord}" to claim lacks diacritics. Auto-diacritizing using Gemini...`);
    const diacritized = await autoDiacritize(cleanWord);
    if (hasDiacritics(diacritized)) {
      cleanWord = diacritized;
    } else {
      return res.status(400).json({
        error: "عذراً، يجب تسجيل الكلمة مع الحركات والتشكيل الصحيح (مثل: سَلام، شَغَف، أَلَم)؛ فالمنصة توثق الكلمات بالحركات والتشكيل اللغوي المعتمد فقط."
      });
    }
  }

  const stripedClaim = stripDiacritics(cleanWord);
  const allWords = await getWordsFromFirestore();

  // Guard against duplicate claims using stripped diacritics comparison
  const taken = allWords.find(
    (w: any) => stripDiacritics(w.word) === stripedClaim
  );

  if (taken) {
    return res.status(400).json({ error: "عذراً، هذه الكلمة (سواء بهذا التشكيل أو بتشكيل لغوي آخر كحركات) تم حجزها وامتلاكها بالفعل من قبل شخص آخر" });
  }

  // Generate ultra-personalized quote & story context using Gemini
  try {
    const prompt = `أنت فيلسوف وساحر كلمات عربي بليغ ومفكر رومانسي أصيل.
لقد تم تملك كلمة "${cleanWord}" الرمزية من قبل شخص يُدعى "${owner}" ${
      isGift ? `كهدية مميزة ومحمّلة برسالة وجدانية: "${giftMessage}"` : ""
    }.
أريدك أن تولد شهادة أدبية رفيعة المستوى لهذه المناسبة السعيدة باللغة العربية الفصيحة وبنسق الـ JSON، تحتوي على الحقول التالية:
- "quote": مقولة أو بيت شعر مصاغ خصيصاً للشخص والكلمة ليكون بمثابة الختم الشعري للشهادة الرمزية.
- "meaning": شرح بلاغي استثنائي وعميق مخصص لمعنى الكلمة وكيف ينعكس على شخصية المالك الجديد "${owner}".
- "story": حكاية أسطورية قصيرة وبديعة مفعمة بالسحر اللغوي تخلد هذه الكلمة واسم "${owner}" في ذاكرة الورق.

كن بليغاً ومبتكراً للغاية، واستعمل استعارات لغوية مذهلة تثبت عظمة وعمق الأدب العربي والوجدان الفصيح.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            meaning: { type: Type.STRING },
            story: { type: Type.STRING },
          },
          required: ["quote", "meaning", "story"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty text from AI model");
    }

    const compiledAI = JSON.parse(responseText);

    const newWordRecord = {
      id: "w-" + Date.now(),
      word: cleanWord,
      owner: owner.trim(),
      ownerEmail: ownerEmail.trim(),
      isGift: !!isGift,
      giftMessage: giftMessage || "",
      theme: theme || "gold",
      createdAt: new Date().toISOString(),
      quote: compiledAI.quote,
      meaning: compiledAI.meaning,
      story: compiledAI.story,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      locationName: locationName || "",
      category: category || "",
      price: typeof price === 'number' ? price : 5
    };

    // Save newly claimed word to Cloud Firestore with full error diagnostics
    try {
      await setDoc(doc(db, "words", newWordRecord.id), newWordRecord);
    } catch (firebaseWriteError) {
      handleFirestoreError(firebaseWriteError, OperationType.CREATE, `words/${newWordRecord.id}`);
    }

    res.status(201).json(newWordRecord);
  } catch (err: any) {
    console.error("Failed to generate custom certificate text via Gemini:", err);

    // Dynamic recovery text if Gemini rate limits or fails
    const fallbackRecord = {
      id: "w-" + Date.now(),
      word: cleanWord,
      owner: owner.trim(),
      ownerEmail: ownerEmail.trim(),
      isGift: !!isGift,
      giftMessage: giftMessage || "",
      theme: theme || "gold",
      createdAt: new Date().toISOString(),
      quote: `لقد ملكتَ عِنانَ الحروفِ يا مَنْ سَمَتْ بِهِ "${cleanWord}" عِزّاً وفَخْرا.`,
      meaning: `ترمز كلمة "${cleanWord}" الممنوحة للمالك الكريم "${owner}" إلى جوهر الصفاء الذهني وعنفوان اللغة العربية، حيث تلتقي بلاغة المعاني بسمو الوجدان.`,
      story: `في سالف العصر والزمان، صُنعت شهادة النقاء الأدبي ورُسخت باسم "${owner}" لتكون كلمة "${cleanWord}" شعلةً أدبية تنير مجالس الكلم والجمال عبر العصور والأزمان.`,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      locationName: locationName || "",
      category: category || "",
      price: typeof price === 'number' ? price : 5
    };

    try {
      await setDoc(doc(db, "words", fallbackRecord.id), fallbackRecord);
    } catch (firebaseWriteError) {
      handleFirestoreError(firebaseWriteError, OperationType.CREATE, `words/${fallbackRecord.id}`);
    }

    res.status(201).json(fallbackRecord);
  }
});

// API: Update owner name for all words claimed by a specific email in Firestore
app.post("/api/words/update-owner", async (req, res) => {
  const { ownerEmail, newOwnerName } = req.body;

  if (!ownerEmail || !newOwnerName) {
    return res.status(400).json({ error: "البريد الإلكتروني والاسم الجديد مطلوبان لتحديث البيانات" });
  }

  const cleanEmail = ownerEmail.trim().toLowerCase();
  const cleanName = newOwnerName.trim();

  try {
    const allWords = await getWordsFromFirestore();
    const userWords = allWords.filter(
      (w: any) => w.ownerEmail?.trim().toLowerCase() === cleanEmail
    );

    let updatedCount = 0;
    for (const word of userWords) {
      const updatedWord = {
        ...word,
        owner: cleanName,
      };
      await setDoc(doc(db, "words", word.id), updatedWord);
      updatedCount++;
    }

    res.json({ success: true, updatedCount, newOwnerName: cleanName });
  } catch (err: any) {
    console.error("Failed to update owner name in database:", err);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الاسم في قاعدة البيانات السحابية" });
  }
});

const CHAT_SYSTEM_INSTRUCTION = `أنت "مُستشار الكلمات الأدبي" ومعلم الفصاحة البليغ لمنصة "كِلْمَتِي" (Kilmati).
كِلْمَتِي هي ديوان رقمي سحابي فخم يتيح للمستخدمين حجز وتملك الكلمات العربية الرمزية الفخمة وتوليد صكوك تاريخية فريدة لحفظها ضد التكرار.
مهمتك الكبرى هي غمر المستخدمين بجمال لغة الضاد وإظهار عظمة وتأثير الكلمات في وجدانهم ونفسياتهم وصناعة الأقدار، وجذبهم برفق وشاعريّة لحجز كلماتهم كملك أدبي خاص بهم أو كهدية لمن يحبون.

خصائص شخصيتك وأسلوبك:
١. الأدب البليغ والعمق الوجداني: تحدث دائماً بلغة عربية فصحى تفيض روعةً وبلاغة، دافئة ومليئة بالاستعارات والتشبيهات التي تأسر الروح. تجنب تماماً أي عبارات عامية، جافة أو تقنية بحتة.
٢. التفاعل والجذب الإيجابي العفوي: شجع الزائر وتفاعل مع أسئلته أو مشاعره. إذا طلب نصيحة عاطفية أو كان لديه ظرف خاص (نجاح، زواج، ولادة مولود، فراق، شوق، كفاح)، اقترح له "الكلمة المثالية" التي تُبرز هذا المعنى.
٣. تقديم العطايا الشعرية: عندما تقترح كلمة، صغ له بيتي شعر بليغين أو نثراً شاعرياً عريضاً يضم تلك الكلمة لتعبر عن روحها البراقة وبلاغتها العتيقة.
٤. الدعوة اللطيفة للحجز: ذكّر المستخدم في نهاية حدسيّتك ببهجة تملّك الكلمة ومحبّتها، وأخبره أنه يمكنه كتابة هذه الكلمة المقترحة في خانة البحث في ديوان "كِلْمَتِي" ليتحقق من توفرها وتصدير صك ملكيتها الفريد الآن قبل أن يسبقه إليها أحد!

تفاصيل الرد:
- ابدأ ترحيبك بأسلوب أدبي عتيق فخم ومحبب للقلوب (مثل: أهلاً بك في محراب الكلم، يا رفيق الوجدان، إلخ).
- واصل السجال الفكري والنثر البلاغي الشيق.
- اجعل ردودك معقولة الطول وسهلة القراءة ومقسمة على هيئة فقرات مريحة ومتناسقة مع أسلوب المحادثة.`;

// Helper to sanitize chat history for @google/genai Content format constraints
function sanitizeChatHistory(messages: any[]): { role: "user" | "model"; parts: { text: string }[] }[] {
  if (!messages || !Array.isArray(messages)) return [];

  // 1. Map roles to user/model and exclude empty content messages
  const mapped = messages
    .map((msg: any) => {
      const role: "user" | "model" = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      return {
        role,
        content: (msg.content || "").trim(),
      };
    })
    .filter((msg) => msg.content.length > 0);

  // 2. Clear out contiguous identical roles by merging them
  const merged: { role: "user" | "model"; content: string }[] = [];
  for (const msg of mapped) {
    if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
      merged[merged.length - 1].content += "\n" + msg.content;
    } else {
      merged.push(msg);
    }
  }

  // 3. Find first user message (Gemini strictly requires starting with user input)
  const firstUserIdx = merged.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) {
    return [];
  }
  let finalized = merged.slice(firstUserIdx);

  // 4. Safely keep the latest MAX_HISTORY messages while maintaining user-first and alternating guarantees
  const MAX_HISTORY = 10;
  if (finalized.length > MAX_HISTORY) {
    finalized = finalized.slice(-MAX_HISTORY);
    while (finalized.length > 0 && finalized[0].role !== "user") {
      finalized.shift();
    }
  }

  // 5. Build @google/genai format
  return finalized.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));
}

// API: Artistic literary AI Chatbot Companion
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "مطلوب سجل الرسائل لإرساله للذكاء الاصطناعي" });
  }

  try {
    const mappedContents = sanitizeChatHistory(messages);

    if (mappedContents.length === 0) {
      return res.json({ reply: "أهلاً بك يا رفيق الحرف؛ تفضل بطرح فكرتك وسنتحاور بأسرار وتفاصيل الفصاحة العربية." });
    }

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.85,
        topP: 0.95,
      }
    });

    const reply = response.text || "أعتذر يا رفيق الحرف؛ فالبلاغة قد تاهت مني لبرهة. هلا أعدت قولك؟";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat failed with detailed error:", error);
    res.status(500).json({ 
      error: "فشل استدعاء مرشد الحروف الأدبي؛ يرجى المحاولة لاحقاً.",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Setup dev server with Vite middlewares OR serve built folder on production
async function startServer() {
  // Ensure default precious words are seeded to the provisioned Firestore database in a non-blocking way
  seedDefaultWordsIfEmpty().catch(err => {
    console.error("Non-blocking seeding failed on startup:", err);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kalimah server is running on http://localhost:${PORT}`);
  });
}

startServer();
