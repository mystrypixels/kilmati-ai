import React, { useState } from 'react';
import { Sparkles, Compass, RotateCw, Crown, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MoodConfig {
  id: string;
  label: string;
  englishLabel: string;
  icon: string;
  gradient: string;
  words: {
    word: string;
    meaning: string;
    purity: number;
    vibe: string;
    famousUser?: string;
  }[];
}

const MOODS: MoodConfig[] = [
  {
    id: 'passion',
    label: 'شغفٌ ووَلَه',
    englishLabel: 'Deep Passion',
    icon: '🔥',
    gradient: 'from-rose-500 via-pink-600 to-red-650',
    words: [
      { word: 'الوَجْد', meaning: 'الغليان اللغوي للمحبة العظمى، وتأجج الجوارح بالهيام الصامت حتى يستحوذ المحبوب على سويداء القلب.', purity: 98, vibe: 'كثافة عاطفية ملتهبة', famousUser: 'امرؤ القيس' },
      { word: 'الشَّغَف', meaning: 'ملامسة غلاف القلب الباطن وحفره بالثبات الأبدي للجمال، وهو المرتبة الخامسة في تصنيف العشق العربي.', purity: 95, vibe: 'سمو روحي ولهان', famousUser: 'مجنون ليلى' },
      { word: 'التَّوْق', meaning: 'نزوع الروح العذري الملحّ وحرقة الاشتياق البالغ غايته دون قيد أو قدرة على المواراة.', purity: 94, vibe: 'شطحات العشاق النبيلة' }
    ]
  },
  {
    id: 'serenity',
    label: 'سكينةٌ وتجلٍّ',
    englishLabel: 'Mystic Serenity',
    icon: '🧘',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    words: [
      { word: 'المَلَاذ', meaning: 'الملجأ الروحي المنيع الذي تفر إليه النفوس عند احتدام العالم بحثاً عن الأمان المطلق وعافية الفكرة.', purity: 96, vibe: 'طمأنينة وهيبة مصقولة' },
      { word: 'السَّكِينَة', meaning: 'الهدوء الإلهي المكتنف بالوقار والطهر الصادق الذي يتنزل على القلوب فيمحو حيرتها الدائمة.', purity: 97, vibe: 'نور نقي هادئ', famousUser: 'المعلم الأكبر' },
      { word: 'الهَدِيل', meaning: 'صوت الحمام الوديع المتناسق، الذي يبرئ السمع ويبث السبات والرضا في روع المتأمل.', purity: 91, vibe: 'لطف خفي ناعم' }
    ]
  },
  {
    id: 'yearning',
    label: 'حنينٌ وشَجَن',
    englishLabel: 'Sacred Yearning',
    icon: '🌙',
    gradient: 'from-amber-500 via-yellow-650 to-amber-700',
    words: [
      { word: 'الصَّبَابَة', meaning: 'رقة الحنين ولوعته الصافية، وبقايا دمع الشوق المتسلل على ضفاف القوافي والمراسلات الخفية.', purity: 99, vibe: 'شجن كلاسيكي دافئ', famousUser: 'البحتري' },
      { word: 'الغَسَق', meaning: 'أول ظلمة الليل البليغة، حينما تغلف المشاعر غزارة الذكريات ويهدأ الوجود لنشيد الأرواح الممتد.', purity: 93, vibe: 'غموض عارم ساحر' },
      { word: 'الشََّوْق', meaning: 'حركة الفؤاد الأزلية نحو الغائبين والبلدان الأولى ومنابت الطفولة والوفاء الصادق.', purity: 92, vibe: 'وفاء نبيل متواصل' }
    ]
  },
  {
    id: 'might',
    label: 'عنفوانٌ وهَيْبَة',
    englishLabel: 'Vigor & Might',
    icon: '⚡',
    gradient: 'from-blue-500 via-indigo-600 to-violet-750',
    words: [
      { word: 'الذِّمَار', meaning: 'كل ما يلزمك حمايته والدفاع عنه من الأهل والأوطان والكرامة وحياض الحروف ببسالة الملوك.', purity: 98, vibe: 'شهامة وفخر راسخ' },
      { word: 'الصَّمْد', meaning: 'السيد الجليل المطاع الذي لا يُقضى أمرٌ دونه، والصخرة الخالدة التي يستند إليها الضعفاء ترفعاً.', purity: 96, vibe: 'سيادة أبدية وقفت بهدوء' },
      { word: 'الهِمَّة', meaning: 'التوطين الصلب للعزائم المتجاوزة للأنواء، والتحليق بالروح ترفعاً عن الصغائر لتطأ منازل الجوزاء والهلال.', purity: 95, vibe: 'قوة لغوية مذهلة', famousUser: 'المتنبي' }
    ]
  },
  {
    id: 'wisdom',
    label: 'حِكْمةٌ ووَقَار',
    englishLabel: 'Wise Dignity',
    icon: '📜',
    gradient: 'from-stone-600 via-stone-750 to-neutral-900',
    words: [
      { word: 'الرَّصَانَة', meaning: 'الاتزان الإدراكي العالي، والتروي الشريف في معالجة القضايا والوزن البليغ للمفردات بغير عبث.', purity: 97, vibe: 'إرث كلاسيكي ثمين' },
      { word: 'اليَقِين', meaning: 'العلم اليقظ الذي يطرد ريب الشك، فيستقر الإيمان في تلافيف الصدر في سلام دائم ومثمر.', purity: 99, vibe: 'روحانية بالغة الاستنارة' },
      { word: 'الحِكْمَة', meaning: 'وضع اللفظ والأثر والقرار في صميم موضعه الأصيل بوقار الكبار وحنكة من خاض بحور الدهر المجيد.', purity: 94, vibe: 'وقار موروث عبر الدهور', famousUser: 'لقمان' }
    ]
  },
  {
    id: 'fantasy',
    label: 'تِيهٌ وفُلْك',
    englishLabel: 'Mystic Cosmos',
    icon: '🌌',
    gradient: 'from-purple-500 via-fuchsia-600 to-indigo-700',
    words: [
      { word: 'السَّدِيم', meaning: 'سحب الغبار الكونية اللامعة المشعة بالأحلام اللغوية، أو رقة الضباب الناعم الممتد على حقول الفكرة.', purity: 95, vibe: 'خيال كوني باهر' },
      { word: 'الأَزَل', meaning: 'القدم الروحاني المستمر الذي لا بداية له، مجمع الأسرار وعناوين الروح الأولى ونقطة تلاشي الصدر.', purity: 96, vibe: 'انعتاق روحي لانهائي' },
      { word: 'النَّسَق', meaning: 'الترتيب البديع والاتساق الفلكي الفسيح الذي يربط النجوم والحروف والسطور بسحر فريد.', purity: 92, vibe: 'انسجام غنائي نادر' }
    ]
  }
];

interface MysticOracleProps {
  onSelectWord: (wordText: string) => void;
  onAskChat: (prompt: string) => void;
}

export default function MysticOracle({ onSelectWord, onAskChat }: MysticOracleProps) {
  const [activeMoodId, setActiveMoodId] = useState<string>('passion');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [revealedWord, setRevealedWord] = useState<typeof MOODS[0]['words'][0] | null>(null);
  const [scanningProgress, setScanningProgress] = useState<number>(0);

  const activeMoodObj = MOODS.find(m => m.id === activeMoodId) || MOODS[0];

  const handleStartScan = () => {
    setIsScanning(true);
    setRevealedWord(null);
    setScanningProgress(0);

    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const wordsPool = activeMoodObj.words;
          const randomIndex = Math.floor(Math.random() * wordsPool.length);
          setRevealedWord(wordsPool[randomIndex]);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <div className="bg-white border border-amber-600/10 rounded-2xl p-4 md:p-5 space-y-3 text-right shadow-[0_8px_24px_rgba(184,137,27,0.02)] relative overflow-hidden [direction:rtl]">
      {/* Decorative Golden Ambient Line */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-amber-500/20 via-yellow-500/30 to-amber-500/10" />

      {/* Header section with small badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 text-[8.5px] text-amber-905 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold select-none leading-none">
            <Sparkles className="w-2.5 h-2.5 text-[#B8891B]" />
            <span>مِجَسُّ المَزَاج ✦ LINGUISTIC COMPASS</span>
          </div>
          <h3 className="text-base md:text-lg font-black text-neutral-800 font-heading-arabic">
            عَرَّافَة الرَّنِين الوجْدَانِي الغَامِض 🔮
          </h3>
          <p className="text-[11px] text-neutral-500 font-body-arabic leading-tight">
            اختر الطور الوجداني وسيقبض مسبار الحروف على اللفظ الشريف المتسلل من بطون دهر الفصاحة.
          </p>
        </div>
      </div>

      {/* Compact Grid of Mood Action Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
        {MOODS.map((mood) => {
          const isActive = mood.id === activeMoodId;
          return (
            <button
              key={mood.id}
              onClick={() => {
                if (!isScanning) {
                  setActiveMoodId(mood.id);
                  setRevealedWord(null);
                }
              }}
              disabled={isScanning}
              className={`p-2 border rounded-xl flex flex-col items-center justify-center text-center gap-0.5 duration-200 transition-all select-none cursor-pointer relative ${
                isActive
                  ? 'border-amber-500 bg-neutral-900 text-white shadow-sm font-bold z-10'
                  : 'border-slate-100 bg-stone-50/60 text-stone-600 hover:border-amber-500/20 hover:bg-white active:scale-95'
              }`}
              id={`mood-btn-${mood.id}`}
            >
              <span className="text-base shrink-0">{mood.icon}</span>
              <span className="text-[10px] font-black font-heading-arabic leading-none">{mood.label}</span>
              <span className={`text-[7px] uppercase tracking-wider font-mono scale-95 leading-none ${isActive ? 'text-amber-300' : 'text-neutral-400'}`}>
                {mood.englishLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Compact Scan Area */}
      <div className="bg-stone-50/70 border border-neutral-200/50 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden min-h-[160px]">
        
        <AnimatePresence mode="wait">
          {!isScanning && !revealedWord ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-2 max-w-md z-10"
            >
              <div className="text-stone-550 text-base font-bold">
                الطور المستشعر: <span className="text-amber-700 font-extrabold">{activeMoodObj.label} {activeMoodObj.icon}</span>
              </div>
              <button
                type="button"
                onClick={handleStartScan}
                className={`bg-gradient-to-r ${activeMoodObj.gradient} text-white font-black text-xs px-5 py-2 rounded-lg hover:opacity-95 active:scale-95 duration-150 shadow-sm flex items-center justify-center gap-1.5 mx-auto cursor-pointer`}
                id="start-probe-button"
              >
                <Compass className="w-3.5 h-3.5 animate-[spin_5s_linear_infinite]" />
                <span className="font-heading-arabic">التقاط اللفظ الشريف ✦</span>
              </button>
            </motion.div>
          ) : isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 max-w-sm z-10"
            >
              <div className="space-y-1">
                <span className="block text-[11px] font-black text-neutral-800 font-heading-arabic animate-pulse">
                  جاري قياس الذبذبة اللغوية... {scanningProgress}%
                </span>
                <div className="w-32 h-1 bg-stone-200 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-amber-500 duration-100 transition-all"
                    style={{ width: `${scanningProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="space-y-3 w-full max-w-lg z-10 text-center"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-0.5 text-[8px] text-emerald-850 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold select-none leading-none">
                  <span>✦ قُبِض على اللفظ المناسب لذبذبتك</span>
                </div>
                
                {/* Word Display */}
                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-[#8c6b12] tracking-wide font-serif-arabic transition cursor-default select-none">
                    « {revealedWord?.word} »
                  </h4>
                </div>

                {/* Poetic definition */}
                <p className="text-[11.5px] text-stone-700 leading-normal font-body-arabic bg-amber-500/5 px-3.5 py-2 rounded-lg border border-amber-500/5">
                  {revealedWord?.meaning}
                </p>
              </div>

              {/* Grid indicators */}
              <div className="flex items-center justify-center gap-4 max-w-xs mx-auto text-right">
                <div className="bg-white border border-stone-200/50 rounded-lg px-2.5 py-1">
                  <span className="block text-[7px] text-stone-400 font-bold uppercase">الفصاحة</span>
                  <span className="block text-[11px] font-mono font-black text-amber-700 leading-none">{revealedWord?.purity}%</span>
                </div>
                <div className="bg-white border border-stone-200/50 rounded-lg px-2.5 py-1">
                  <span className="block text-[7px] text-stone-400 font-bold uppercase">المزاج اللفظي</span>
                  <span className="block text-[9.5px] font-extrabold text-neutral-850 font-heading-arabic leading-none mt-0.5">{revealedWord?.vibe}</span>
                </div>
                {revealedWord?.famousUser && (
                  <div className="bg-white border border-stone-200/50 rounded-lg px-2.5 py-1">
                    <span className="block text-[7px] text-stone-400 font-bold uppercase">تردد شاعر</span>
                    <span className="block text-[9.5px] font-extrabold text-stone-605 font-heading-arabic leading-none mt-0.5">{revealedWord?.famousUser}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => revealedWord && onSelectWord(revealedWord.word)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition cursor-pointer font-heading-arabic flex items-center gap-1"
                  id="claim-mystic-word-btn"
                >
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  <span>احجز الملكية</span>
                </button>
                <button
                  type="button"
                  onClick={() => revealedWord && onAskChat(`أريد استشارتك حول الكلمة العربية الشريفة « ${revealedWord.word} »، أطلعني على بعض الأبيات الشعرية الكلاسيكية البديعة التي تغنت بهذا اللفظ وعرّفني على فلسفتها الكامنة.`)}
                  className="bg-stone-100 hover:bg-stone-200/70 text-stone-800 font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition cursor-pointer font-heading-arabic flex items-center gap-1 border border-stone-200/30"
                  id="consult-mystic-word-btn"
                >
                  <Wand2 className="w-3 h-3 text-amber-600" />
                  <span>استشر عرافة الذكاء 🔮</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="bg-white hover:bg-stone-50 text-neutral-750 font-extrabold text-xs px-2.5 py-2 rounded-lg transition cursor-pointer border border-stone-200 flex items-center justify-center shrink-0"
                  id="reprobe-mystic-word-btn"
                  title="سبر مجدد"
                >
                  <RotateCw className="w-3 h-3 text-stone-550" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
