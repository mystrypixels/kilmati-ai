export interface WordClassification {
  category: string;
  categoryDesc: string;
  badgeColor: string;
  basePrice: number;
  letterWeightScore: number;
  phoneticMajestyScore: number;
  categoryBonus: number;
  finalPrice: number;
  features: string[];
}

export function classifyArabicWord(word: string): WordClassification {
  const cleanWord = word.trim() || 'جمال';
  const strippedWord = cleanWord.replace(/[\u064B-\u065F]/g, "");
  const len = strippedWord.length;

  // Compute absolute hash to assign group
  let hash = 0;
  for (let i = 0; i < cleanWord.length; i++) {
    hash = cleanWord.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;

  const categories = [
    {
      name: 'المجموعة الروحانية الأثيرية',
      desc: 'لألفاظ الروح والوجدان والارتقاء بالنفس والسكينة والسريرة المضيئة',
      badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      basePrice: 5,
      features: ['صياغة وجدانية بليغة بالذكاء الاصطناعي', 'نمط أثيري مخصص بالجماليات الذهبية', 'مخطوطة النبلاء المشفرة رقمياً في السجلات']
    },
    {
      name: 'المجموعة البلاغية النادرة (جواهر الضاد)',
      desc: 'للكلمات التاريخية الوحيدة وشديدة الندرة والبيان اللغوي المعجز في لسان العرب',
      badgeColor: 'bg-amber-50 border-amber-200 text-amber-900',
      basePrice: 8,
      features: ['صك تمليك مذهب الأطراف عتيق من البردي', 'شرح معجمي وبلاغي مزدوج من Gemini', 'أولوية الظهور في ديوان المنصة والوجدان الكلي']
    },
    {
      name: 'المجموعة الوجدانيّة الشاعريّة',
      desc: 'لألفاظ الحب والسهاد والشوق والأرواح العاشقة المنسوجة بالرقّة والقصيد وعذب المعاني',
      badgeColor: 'bg-rose-50 border-rose-200 text-rose-900',
      basePrice: 4,
      features: ['صك طراز العشق والياقوت الشغوف اللامع', 'ميزة الإهداء الفاخرة للأحباب مجاناً والوجدان الممتد', 'أبيات شعر تفصل عواطف الكلم الفخم']
    },
    {
      name: 'مجموعة النخبة والسيادة والوقار',
      desc: 'لألفاظ الملوك، المروءة، الشرف، الشجاعة، الأخلاق الرفيعة، والعدالة السامية الباذخة',
      badgeColor: 'bg-emerald-50 border-emerald-250 text-emerald-950',
      basePrice: 7,
      features: ['بصمة ورمز تشفير سيادي لضمان تاريخية الشهادة', 'قالب الزمرد الأندلسي الملكي مجاناً بكافة أبعاده المتاحة', 'حق التنازل والتوقيع السيادي الحصري']
    },
    {
      name: 'المجموعة العامة الفصحى',
      desc: 'للكلمات الحكيمة والدرر السائدة الأصيلة من بحور دلالات اللغة العربية العتيقة',
      badgeColor: 'bg-stone-50 border-stone-200 text-stone-900',
      basePrice: 3,
      features: ['صك تمليك رقمي كلاسيكي موثق وسحابي معتمد والأبد', 'شرح بلاغي متميز يُروى بالتفصيل', 'تنزيل الشهادة فائقة الجودة للطباعة الفورية']
    }
  ];

  const cat = categories[index];

  // Letter phonetic majesty check for classical Arabic letters (ض, ص, ط, ظ, ع, غ, ح, خ, ق)
  const majesticLetters = /[ضصطظعغحقخ]/g;
  const matches = strippedWord.match(majesticLetters);
  const phoneticCount = matches ? matches.length : 0;
  const phoneticScore = phoneticCount * 1.5;

  // Weight score (Shorter words are rarer and have higher value)
  let letterWeightScore = 0;
  if (len <= 2) letterWeightScore = 5;
  else if (len === 3) letterWeightScore = 3;
  else if (len === 4) letterWeightScore = 1;

  const categoryBonus = parseFloat(((Math.abs(hash) % 3) * 0.5).toFixed(1));

  // Minimum final price is $3 (can be up depending on scores)
  const rawPrice = cat.basePrice + phoneticScore + letterWeightScore + categoryBonus;
  const finalPrice = Math.round(rawPrice);

  return {
    category: cat.name,
    categoryDesc: cat.desc,
    badgeColor: cat.badgeColor,
    basePrice: cat.basePrice,
    letterWeightScore,
    phoneticMajestyScore: parseFloat(phoneticScore.toFixed(1)),
    categoryBonus,
    finalPrice: Math.max(3, finalPrice),
    features: cat.features
  };
}
