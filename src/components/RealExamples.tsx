import React, { useState } from 'react';
import { WordRecord, CertificateTheme } from '../types';
import { User, MapPin, Calendar, Award, Sparkles, ChevronLeft, ShieldCheck, Eye, Compass, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Real examples requested by the user
export const REAL_EXAMPLES_DATA: WordRecord[] = [
  {
    id: "theme-gold",
    word: "البَلاغَة",
    owner: "المالك الوجداني للكلمة",
    ownerEmail: "owner@kilmati.com",
    isGift: false,
    theme: "gold",
    createdAt: "2026-06-02T12:00:00Z",
    quote: "البلاغة منتهى البيان وتاج لسان العرب الخالد.",
    meaning: "ملاءمة الكلام الفصيح لمقتضى الحال، وتأثيره البالغ في نفوس السامعين مع إيجاز وبلاغة تامة وجذابة.",
    story: "توارث العرب البلاغة كحلة شرف يتزين بها الخطباء والشعراء لتبلغ كلماتهم عنان القلوب والأسماع عبر الزمان."
  },
  {
    id: "theme-emerald",
    word: "اليَقين",
    owner: "المالك الوجداني للكلمة",
    ownerEmail: "owner@kilmati.com",
    isGift: false,
    theme: "emerald",
    createdAt: "2026-06-01T12:00:00Z",
    quote: "اليقين نور ساطع يهدي الحائرين ويثبّت القلوب.",
    meaning: "العلم الراسخ في القلب الذي لا يخالطه شك ولا ريب، وهو منتهى الهدى والنور الباطني المستقر.",
    story: "قيل إن اليقين حصن مانع لو تحصن به طالب الحقيقة لتهالك السعي في دروب النعيم وهانت عليه غمار الرحلات."
  },
  {
    id: "theme-onyx",
    word: "الوَقَار",
    owner: "المالك الوجداني للكلمة",
    ownerEmail: "owner@kilmati.com",
    isGift: false,
    theme: "onyx",
    createdAt: "2026-05-31T12:00:00Z",
    quote: "الوقار هيبة الوجدان وحصن الأخلاق والسيادة.",
    meaning: "رزانة النفس وغلبة الحكمة وجلال الهيئة، وهو من سمات الملوك والأعيان في مجلس العلوم والأخلاق الشريفة.",
    story: "يُحكى أن وقار الشيخ كان بمثابة دستور جلي يهاب تلاوته الجاهل، ليكون وقار الكلمات عهداً أصيلاً للأبد."
  },
  {
    id: "theme-sapphire",
    word: "السُّمُوّ",
    owner: "المالك الوجداني للكلمة",
    ownerEmail: "owner@kilmati.com",
    isGift: false,
    theme: "sapphire",
    createdAt: "2026-05-30T12:00:00Z",
    quote: "السمو ارتقاء بالروح والوجدان فوق صغائر الدنيا.",
    meaning: "الارتقاء بالنفس عن صغائر الأمور والترفع بالخلق والوجدان لمصاف النبلاء والصالحين والمبدعين والمتميزين.",
    story: "تواتر في الصحف العتيقة أن السمو رداء خفي لا يرتديه من مالت روحه لدنياً زائلة، بل من سما حظه وعلمه."
  },
  {
    id: "theme-ruby",
    word: "الوَجْد",
    owner: "المالك الوجداني للكلمة",
    ownerEmail: "owner@kilmati.com",
    isGift: false,
    theme: "ruby",
    createdAt: "2026-05-29T12:00:00Z",
    quote: "الوجد شعلة من مشاعر الشوق والحنين الممتد.",
    meaning: "فرط الحب والشوق الشديد، وحنين الروح للأرواح العاشقة المنسوجة بالرقّة والقصيد وعذب المعاني الوجدانية.",
    story: "سجلت دواوين العشق القديمة أن الوجد هو النار المقدسة التي تحرق غبار الأنا، ليبعث المحب بحياة نقية وجديدة."
  }
];

interface RealExamplesProps {
  onSelectExample: (word: WordRecord) => void;
  words?: WordRecord[]; // Accept registered words to update dynamically!
}

export default function RealExamples({ onSelectExample, words = [] }: RealExamplesProps) {
  // Use pure certificate themes data to present active views without personal names
  const deeds = REAL_EXAMPLES_DATA;

  const [activeId, setActiveId] = useState<string>("theme-gold");
  const activeDeed = deeds.find(d => d.id === activeId) || deeds[0];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const themeBorderStyles: Record<CertificateTheme, {
    card: string;
    border: string;
    bgDot: string;
    badge: string;
    label: string;
  }> = {
    gold: {
      card: "hover:border-amber-400 bg-amber-50/10 border-neutral-250/50",
      border: "border-amber-500/25",
      bgDot: "bg-amber-500",
      badge: "bg-amber-500/10 text-amber-800 border-amber-350/30",
      label: "ذهبي ملكي"
    },
    emerald: {
      card: "hover:border-[#059669]/60 bg-emerald-50/10 border-neutral-250/50",
      border: "border-emerald-500/25",
      bgDot: "bg-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-800 border-emerald-350/30",
      label: "زمردي أندلسي"
    },
    onyx: {
      card: "hover:border-neutral-600 bg-neutral-150/10 border-neutral-250/50",
      border: "border-neutral-500/25",
      bgDot: "bg-neutral-800",
      badge: "bg-neutral-800/10 text-neutral-800 border-neutral-300/30",
      label: "عقيق ملكي أسود"
    },
    sapphire: {
      card: "hover:border-[#1d4ed8]/60 bg-blue-50/10 border-neutral-250/50",
      border: "border-blue-500/25",
      bgDot: "bg-blue-600",
      badge: "bg-blue-500/10 text-blue-800 border-blue-350/30",
      label: "ياقوت أزرق"
    },
    ruby: {
      card: "hover:border-rose-500 bg-rose-50/10 border-neutral-250/50",
      border: "border-rose-500/25",
      bgDot: "bg-rose-500",
      badge: "bg-rose-500/10 text-rose-800 border-rose-350/30",
      label: "ياقوت أحمر"
    }
  };

  const themesMap = {
    gold: {
      containerBg: "bg-[#faf6eb]",
      borderClass: "border-[#d8bc74]/60",
      innerBorderClass: "border-[#d4af37]/30",
      labelColor: "text-[#8c6b12]",
      titleColor: "text-[#111111]",
      ownerLabelBg: "bg-white/90",
      ownerLabelBorder: "border-[#e9dbb5]/60",
      ownerNameText: "text-neutral-900",
      wordColor: "text-[#8c6b12]",
      wordSubText: "text-[#8c6b12]",
      certIdBg: "bg-white/80",
      certIdBorder: "border-[#eddcb3]/50",
      certIdText: "text-neutral-800",
      sealBg: "bg-[#fdfbf7]",
      sealBorder: "border-[#d4af37]",
      sealText: "text-[#8c6b12]",
      signatureColor: "text-[#8c6b12]",
      accentBarGradient: "from-amber-400 via-yellow-500 to-amber-600"
    },
    emerald: {
      containerBg: "bg-[#f2faf7]",
      borderClass: "border-[#a3dfca]/60",
      innerBorderClass: "border-[#059669]/25",
      labelColor: "text-[#065f46]",
      titleColor: "text-[#0f172a]",
      ownerLabelBg: "bg-white/85",
      ownerLabelBorder: "border-[#c4edd9]/50",
      ownerNameText: "text-emerald-950",
      wordColor: "text-[#047857]",
      wordSubText: "text-[#065f46]",
      certIdBg: "bg-white/70",
      certIdBorder: "border-[#cbf3e1]/50",
      certIdText: "text-emerald-950",
      sealBg: "bg-[#f4fbf9]",
      sealBorder: "border-[#059669]",
      sealText: "text-[#065f46]",
      signatureColor: "text-[#059669]",
      accentBarGradient: "from-emerald-400 via-teal-500 to-emerald-600"
    },
    onyx: {
      containerBg: "bg-[#fcfbf9]",
      borderClass: "border-neutral-300",
      innerBorderClass: "border-neutral-400/20",
      labelColor: "text-neutral-500",
      titleColor: "text-neutral-900",
      ownerLabelBg: "bg-neutral-100/90",
      ownerLabelBorder: "border-neutral-300",
      ownerNameText: "text-neutral-900",
      wordColor: "text-neutral-900",
      wordSubText: "text-neutral-900",
      certIdBg: "bg-neutral-100/90",
      certIdBorder: "border-neutral-250",
      certIdText: "text-neutral-600",
      sealBg: "bg-neutral-100",
      sealBorder: "border-neutral-400",
      sealText: "text-neutral-700",
      signatureColor: "text-neutral-800",
      accentBarGradient: "from-neutral-400 via-neutral-500 to-neutral-700"
    },
    sapphire: {
      containerBg: "bg-[#f4f7fc]",
      borderClass: "border-[#adc5ec]/60",
      innerBorderClass: "border-[#1d4ed8]/25",
      labelColor: "text-[#005792]",
      titleColor: "text-[#0f172a]",
      ownerLabelBg: "bg-white/85",
      ownerLabelBorder: "border-[#d0def3]/50",
      ownerNameText: "text-blue-950",
      wordColor: "text-[#005792]",
      wordSubText: "text-[#005792]",
      certIdBg: "bg-white/70",
      certIdBorder: "border-[#d8e3f4]/50",
      certIdText: "text-blue-950",
      sealBg: "bg-[#fafdff]",
      sealBorder: "border-[#005792]",
      sealText: "text-[#005792]",
      signatureColor: "text-[#005792]",
      accentBarGradient: "from-blue-400 via-indigo-500 to-blue-600"
    },
    ruby: {
      containerBg: "bg-[#fdf5f5]",
      borderClass: "border-[#efa9a9]/60",
      innerBorderClass: "border-[#b91c1c]/25",
      labelColor: "text-[#991b1b]",
      titleColor: "text-[#1d1010]",
      ownerLabelBg: "bg-white/85",
      ownerLabelBorder: "border-[#f6cfcf]/50",
      ownerNameText: "text-rose-950",
      wordColor: "text-[#b91c1c]",
      wordSubText: "text-[#991b1b]",
      certIdBg: "bg-white/70",
      certIdBorder: "border-[#fbdcdb]/50",
      certIdText: "text-rose-950",
      sealBg: "bg-[#fffafa]",
      sealBorder: "border-[#b91c1c]",
      sealText: "text-[#991b1b]",
      signatureColor: "text-[#b91c1c]",
      accentBarGradient: "from-red-400 via-rose-500 to-red-600"
    }
  };

  const selectedTheme = activeDeed.theme || 'gold';
  const styles = themesMap[selectedTheme] || themesMap.gold;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-150/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right pb-4 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-850">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ديوان الشهادات والملكيات الفخرية الرقمية</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black font-sans text-neutral-800 leading-snug">
            عرض حي تفاعلي لألوان وتصاميم الشهادات الرقمية
          </h3>
          <p className="text-xs text-neutral-500 max-w-2xl font-sans">
            تتغير الألوان والجماليات الخطية للشهادات تلقائياً بناءً على الطراز المختار. انقر على أي لون أو طراز أدناه لتشاهد رونقه الفريد.
          </p>
        </div>
        
        {/* Call to action for full document view */}
        <button
          onClick={() => onSelectExample(activeDeed)}
          className="self-start md:self-center flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black text-amber-900 bg-amber-100/80 hover:bg-amber-100 border border-amber-200/50 rounded-xl transition duration-300 active:scale-95 cursor-pointer font-sans"
          id="reveal-full-deed-btn"
        >
          <Eye className="w-4 h-4" />
          <span>استعراض طراز الشهادة بالكامل للطباعة والتحميل</span>
        </button>
      </div>

      {/* Main Interactive Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* RIGHT SIDEBAR: Certificate Styles / Colors Directory (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[380px] lg:max-h-[460px] overflow-y-auto pr-1 text-right scrollbar-thin scrollbar-thumb-neutral-200" id="deeds-directory-list">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 flex items-center justify-between">
            <span>أنواع وألوان الشهادات المتاحة</span>
            <span className="text-[9px] bg-amber-50 text-[#8c6b12] px-2 py-0.5 rounded-full font-mono font-bold">
              {deeds.length} خيارات فنية
            </span>
          </div>

          {deeds.map((item) => {
            const isSelected = item.id === activeId;
            const config = themeBorderStyles[item.theme] || themeBorderStyles.gold;

            // Premium description for each design style
            const themeStyleNames: Record<CertificateTheme, { title: string; subtitle: string }> = {
              gold: {
                title: "الطراز الذهبي الملكي",
                subtitle: "برق الذهب ونقوش الزخرفة العتيقة"
              },
              emerald: {
                title: "الطراز الزمردي الأندلسي",
                subtitle: "ثراء الطبيعة وجلال الخط المورق"
              },
              onyx: {
                title: "طراز العقيق الملكي الأسود",
                subtitle: "وقار السواد الملوكي والسيادة اللغوية"
              },
              sapphire: {
                title: "طراز الياقوت الأزرق النبيل",
                subtitle: "عمق وجلال السماء وأثير المعرفة"
              },
              ruby: {
                title: "طراز الياقوت الأحمر الشغوف",
                subtitle: "نار الوجد وعاطفة الشعر وعذب الكلمات"
              }
            };

            const styleInfo = themeStyleNames[item.theme] || themeStyleNames.gold;

            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full p-3.5 rounded-2xl text-right border transition-all duration-300 flex items-center justify-between gap-3 text-neutral-800 cursor-pointer ${
                  isSelected 
                    ? `border-neutral-900 bg-neutral-950 text-white shadow-md scale-[1.02]` 
                    : `${config.card} bg-white shadow-3xs`
                }`}
                id={`deed-item-${item.id}`}
              >
                <div className="flex-1 min-w-0 space-y-1 text-right">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${config.bgDot} ring-2 ring-white shadow-xs`}></span>
                    <span className="font-serif-arabic text-base font-bold truncate">{styleInfo.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] opacity-75 truncate">
                    <span>{styleInfo.subtitle}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1 font-sans">
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-md border ${
                    isSelected 
                      ? "bg-white/10 border-white/20 text-yellow-350" 
                      : config.badge
                  }`}>
                    {config.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* LEFT COMPANION: Beautiful Live Landscape Certificate Canvas Render (col-span-8) */}
        <div className="lg:col-span-8 bg-neutral-50 border border-neutral-200/55 rounded-3xl p-5 md:p-6 lg:p-8 flex flex-col justify-center items-stretch relative overflow-hidden shadow-inner-sm">
          
          {/* Subtle dynamic grid backgrounds depending on selection info */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDeed.id}
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -5 }}
              transition={{ duration: 0.3 }}
              className="relative w-full z-10"
            >
              
              {/* LANDSCAPE CERTIFICATE */}
              <div className={`relative p-5 md:p-6 lg:p-7 ${styles.containerBg} border-8 border-double ${styles.borderClass} rounded-[20px] shadow-lg transition-all duration-300 overflow-hidden text-right`}>
                
                {/* Top dynamic bar */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${styles.accentBarGradient}`}></div>

                {/* Inner Decorative Frame Border Line */}
                <div className={`absolute inset-2 border ${styles.innerBorderClass} rounded-[14px] pointer-events-none`}></div>

                {/* Landscape layout contents */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* Left core credentials */}
                  <div className="md:col-span-7 space-y-3.5 font-sans">
                    <div className="space-y-0.5">
                      <h2 className={`text-xl md:text-2xl font-extrabold ${styles.titleColor} tracking-tight`}>
                        شهادة ملكية وحفظ لغوي
                      </h2>
                      <div className={`text-[8.5px] ${styles.labelColor} font-black uppercase tracking-wider flex items-center gap-1.5`}>
                        <span>Property Deed Document</span>
                        <span className="w-6 h-[1px] bg-current opacity-30"></span>
                        <span>ديوان الحروف</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <p className="text-[10px] opacity-80 text-neutral-500 leading-none">
                        يُشهَد بموجبه بأن المالك الوجداني المعتمد:
                      </p>
                      <h3 className={`text-base md:text-lg font-black ${styles.ownerNameText} leading-none ${styles.ownerLabelBg} px-3 py-1 border ${styles.ownerLabelBorder} inline-block rounded-lg shadow-3xs`}>
                        {activeDeed.owner}
                      </h3>
                      <p className="text-[10px] opacity-80 text-neutral-500 leading-normal">
                        قد حاز السيادة الرمزية وثبات الحيازة التام للفظ العربي الأصيل:
                      </p>
                    </div>

                    {/* Metadata bottoms */}
                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-neutral-150/60">
                      
                      {/* Platform signature */}
                      <div className="space-y-0.5 text-right shrink-0">
                        <span className="block text-[7.5px] font-bold text-neutral-400">التوقيع الرقمي للمنصة</span>
                        <div className="h-5 flex items-center justify-start">
                          <svg className={`w-14 h-5 ${styles.signatureColor}`} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M10,18 C25,5 35,28 50,12 C60,25 75,5 85,18 C90,22 93,10 95,15" />
                          </svg>
                        </div>
                        <span className="block text-[7px] font-bold text-[#8c6b12] scale-95 origin-right">ديوان كِلْمَتِي</span>
                      </div>

                      {/* Date details */}
                      <div className="text-left shrink-0">
                        <span className="block text-[7.5px] font-bold text-neutral-400">تاريخ التوثيق</span>
                        <span className="block text-[9.5px] font-bold text-neutral-800 mt-1">
                          {formatDate(activeDeed.createdAt)}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Right big word display + official seal */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-neutral-200/50 pt-3 md:pt-0 md:pr-4 text-center space-y-3">
                    
                    <div className={`${styles.signatureColor} text-[9px] font-black tracking-widest flex items-center gap-1 justify-center opacity-85`}>
                      <span>✦</span>
                      <span>اللفظ المستملك</span>
                      <span>✦</span>
                    </div>

                    <div className="py-0.5">
                      <h4 className={`text-3xl md:text-4xl font-extrabold ${styles.wordColor} tracking-wide leading-none font-serif-arabic`}>
                        {activeDeed.word}
                      </h4>
                    </div>

                    {/* Cert ID */}
                    <div className={`${styles.certIdBg} border ${styles.certIdBorder} rounded-lg px-2.5 py-1 text-center w-full max-w-[170px] shadow-4xs`}>
                      <span className={`block text-[7.5px] font-extrabold tracking-wider ${styles.labelColor}`}>
                        رقم الصك السحابي
                      </span>
                      <span className={`block font-mono text-[8px] font-bold tracking-wider ${styles.certIdText}`}>
                        OWN-{activeDeed.id.toUpperCase().substring(0, 10)}
                      </span>
                    </div>

                    {/* Interactive Real Stamp */}
                    <div className="flex justify-center">
                      <div className={`relative flex items-center justify-center w-[60px] h-[60px] rounded-full border-2 ${styles.sealBorder} ${styles.sealBg} shadow-2xs shrink-0 animate-spin`} style={{ animationDuration: '40s' }}>
                        <div className={`absolute inset-0.5 rounded-full border border-dashed ${styles.sealBorder}/80`}></div>
                        <div className={`text-center text-[6px] font-extrabold ${styles.sealText} flex flex-col items-center justify-center leading-none`}>
                          <span className="text-[6.5px] scale-90 tracking-tighter">ختم موثق</span>
                          <span className="text-[4px] my-0.5">★ ★ ★</span>
                          <span className="scale-85 text-[5px]">كِلْمَتِي</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Dynamic explanations beneath */}
              <div className="mt-4 p-4 bg-white border border-neutral-200/50 rounded-2xl text-right space-y-2 font-sans shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>التحليل البلاغي والبيان اللغوي المعتمد للفظ:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-neutral-600 leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-extrabold text-neutral-800 text-[10.5px] block">المعنى الروحاني البليغ:</span>
                    <p className="text-justify line-clamp-2">{activeDeed.meaning}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-neutral-800 text-[10.5px] block">الشاهد والأثر التاريخي:</span>
                    <p className="text-justify line-clamp-2">{activeDeed.story}</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
