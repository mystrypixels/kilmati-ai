import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function getDB() {
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG!);
  if (!getApps().length) initializeApp(firebaseConfig);
  return getFirestore(getApps()[0], firebaseConfig.firestoreDatabaseId);
}

function stripDiacritics(text: string): string {
  return text.trim().replace(/[\u064B-\u0652\u0653\u0670]/g, "");
}

function hasDiacritics(text: string): boolean {
  return /[\u064B-\u0652\u0653\u0670]/.test(text);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const queryWord = req.query.word;
  if (!queryWord || typeof queryWord !== "string") {
    return res.status(400).json({ error: "يرجى تحديد كلمة صالحة" });
  }

  let normalizedWord = queryWord.trim();
  const db = getDB();

  if (!hasDiacritics(normalizedWord)) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const r = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `أضف الحركات والتشكيل على هذه الكلمة فقط بدون أي كلام آخر: "${normalizedWord}"`,
      });
      const result = (r.text || "").trim().replace(/['"\`«»""]/g, "").trim();
      if (hasDiacritics(result)) normalizedWord = result;
    } catch (e) {
      return res.status(400).json({ error: "يرجى كتابة الكلمة مع التشكيل" });
    }
  }

  const stripped = stripDiacritics(normalizedWord);
  const snapshot = await getDocs(collection(db, "words"));
  const words: any[] = [];
  snapshot.forEach(d => words.push(d.data()));

  const taken = words.find((w: any) => stripDiacritics(w.word) === stripped);
  if (taken) {
    return res.json({ available: false, word: taken.word, details: taken });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `أنت خبير لغوي عربي بليغ. قدم تحليلاً أدبياً للكلمة: "${normalizedWord}". أرجع JSON فقط بالحقول: word, meaning, quote, story, suggestedPoets (مصفوفة 3 أسماء).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaning: { type: Type.STRING },
            quote: { type: Type.STRING },
            story: { type: Type.STRING },
            suggestedPoets: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["word", "meaning", "quote", "story", "suggestedPoets"],
        }
      }
    });
    const aiData = JSON.parse(response.text || "{}");
    res.json({ available: true, word: normalizedWord, aiFeedback: aiData });
  } catch (e) {
    res.json({
      available: true,
      word: normalizedWord,
      aiFeedback: {
        word: normalizedWord,
        meaning: `كلمة "${normalizedWord}" تحمل معاني عميقة في اللغة العربية.`,
        quote: `يا لجمال كلمة "${normalizedWord}" في لغة الضاد.`,
        story: `لكل كلمة حكاية، و"${normalizedWord}" من أجملها.`,
        suggestedPoets: ["المتنبي", "محمود درويش", "نزار قباني"]
      }
    });
  }
}
