/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { WordRecord } from './types';
import BookingForm from './components/BookingForm';
import Certificate from './components/Certificate';
import HowItWorks from './components/HowItWorks';
import RealExamples from './components/RealExamples';
import BrandManifesto from './components/BrandManifesto';
import CollapsibleFAQ from './components/CollapsibleFAQ';
import AIChatCompanion from './components/AIChatCompanion';
import LinguisticNetwork from './components/LinguisticNetwork';
import AuthProfile from './components/AuthProfile';
import TrustSection from './components/TrustSection';
import MysticOracle from './components/MysticOracle';
import { classifyArabicWord } from './utils';
import { Sparkles, MessageCircle, Info, Award, Compass, Search, Gift, ShieldAlert, History, HelpCircle, Flame, DollarSign, CheckCircle, FileText, Mail, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const POPULAR_WORDS_LIST = [
  { word: "حُبّ", tier: "بلاتينية", price: 15, color: "text-red-700 bg-red-50 border-red-100" },
  { word: "سَلام", tier: "ذهبية", price: 10, color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { word: "صَبْر", tier: "ذهبية", price: 10, color: "text-amber-700 bg-amber-50 border-amber-100" },
  { word: "رُوح", tier: "ذهبية", price: 10, color: "text-purple-700 bg-purple-50 border-purple-100" },
  { word: "عَزِيمَة", tier: "بلاتينية", price: 15, color: "text-neutral-900 bg-neutral-100 border-neutral-300" },
  { word: "قُوَّة", tier: "فضية", price: 5, color: "text-blue-700 bg-blue-50 border-blue-100" },
  { word: "مَجْد", tier: "فضية", price: 5, color: "text-indigo-700 bg-indigo-50 border-indigo-100" }
];

const getCardStylesForTheme = (theme: string) => {
  switch (theme) {
    case 'emerald':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-600/10 hover:from-emerald-500/15 hover:to-emerald-600/15 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
        badgeBg: 'text-emerald-800 bg-emerald-100/60 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-500/20 font-black',
        wordText: 'text-emerald-900 duration-300 group-hover:text-emerald-700',
        btnText: 'text-emerald-800 hover:text-emerald-950 underline',
        sparkleColor: 'text-emerald-600',
        subText: 'text-emerald-850'
      };
    case 'ruby':
      return {
        cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-rose-600/10 hover:from-rose-500/15 hover:to-rose-600/15 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
        badgeBg: 'text-rose-800 bg-rose-100/60 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-500/20 font-black',
        wordText: 'text-rose-900 duration-300 group-hover:text-rose-700',
        btnText: 'text-rose-800 hover:text-rose-950 underline',
        sparkleColor: 'text-rose-600',
        subText: 'text-rose-850'
      };
    case 'sapphire':
      return {
        cardBg: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-600/10 hover:from-blue-500/15 hover:to-blue-600/15 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]',
        badgeBg: 'text-blue-800 bg-blue-100/60 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-500/20 font-black',
        wordText: 'text-blue-900 duration-300 group-hover:text-blue-700',
        btnText: 'text-blue-800 hover:text-blue-950 underline',
        sparkleColor: 'text-blue-600',
        subText: 'text-blue-850'
      };
    case 'onyx':
      return {
        cardBg: 'bg-gradient-to-br from-stone-500/10 via-stone-400/5 to-stone-600/10 hover:from-stone-500/15 hover:to-stone-600/15 border border-stone-500/25 shadow-[0_0_15px_rgba(120,113,108,0.05)]',
        badgeBg: 'text-stone-800 bg-stone-100/60 dark:bg-stone-500/15 dark:text-stone-300 border border-stone-500/20 font-black',
        wordText: 'text-stone-900 duration-300 group-hover:text-stone-750',
        btnText: 'text-stone-800 hover:text-stone-950 underline',
        sparkleColor: 'text-stone-600',
        subText: 'text-stone-750'
      };
    case 'gold':
    default:
      return {
        cardBg: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-600/10 hover:from-amber-500/15 hover:to-amber-600/15 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
        badgeBg: 'text-amber-800 bg-amber-100/50 dark:bg-amber-500/15 dark:text-amber-350 border border-amber-500/20 font-black',
        wordText: 'text-neutral-850 duration-300 group-hover:text-amber-850',
        btnText: 'text-amber-800 hover:text-amber-900 underline',
        sparkleColor: 'text-amber-600',
        subText: 'text-neutral-600'
      };
  }
};

const DAILY_WORDS = [
  { word: "الوَجْد", meaning: "نزوع النفس واشتداد الحب حتى يجلب السحر والوجد؛ وهو الغاية القصوى من فيوضات المحبة وأصالتها العشقية التي تتجاوز حواجز الصمت البليغ.", defaultTheme: "ruby" },
  { word: "الشَّغَف", meaning: "غلاف القلب وجوفه؛ وهو بلوغ الحب أقصى تلافيف الفؤاد واستيقاظ المشاعر بجمال وتلهف رفيع يفيض وجداً وألقاً.", defaultTheme: "gold" },
  { word: "اليَقِين", meaning: "العلم الراسخ الذي لا يتطرق إليه شك، وهدوء الفؤاد واطمئنانه لحقيقة الأمور وثباتها النبيل في طمأنينة تامة.", defaultTheme: "sapphire" },
  { word: "السَّمَاحَة", meaning: "بذل ما لا يجب تفضلاً، وسهولة المعاملة وعظمة النفس في الصفح والمودة دون تكلف أو انتظار مقابل.", defaultTheme: "emerald" },
  { word: "الوِفَاء", meaning: "ملازمة العهد والصدق فيه، وثبات القلوب على المحبة الصافية والوفاء بالعهود والوعود في كل مقام ومقال.", defaultTheme: "onyx" },
  { word: "النَّبَالَة", meaning: "شرف النفس وعزة الأخلاق، وترفع الفؤاد عن الصغائر مع نبل الخصال وبهاء الحضور الإنساني والأدبي الفخم.", defaultTheme: "gold" },
  { word: "البُشْرَى", meaning: "الخبر المفرح السار الذي يجلب البهجة والسرور لثنايا الروح ويملأ الدنيا أملاً وتفاؤلاً بما عند الله.", defaultTheme: "emerald" },
  { word: "الهُيَام", meaning: "أشد درجات الحب الوجداني الذي يذهب بالعقل من فرط الوجد والوله، واندماج الروح بالجمال البشري والكوني الخالد.", defaultTheme: "ruby" },
  { word: "السَّكِينَة", meaning: "الهدوء والوقار والطمأنينة التي تتنزل على قلوب المخلصين فتجعلهم في سلام داخلي ووئام مع الوجود.", defaultTheme: "sapphire" },
  { word: "النَّقَاء", meaning: "خلوص الفؤاد من الشوائب والضغينة، والصدق العذب الذي يتجلى في الكلمات والأفعال البهية كالمطر الطاهر.", defaultTheme: "emerald" },
  { word: "الجَلَد", meaning: "قوة الاحتمال والصبر الجميل في مواجهة الشدائد والخطوب بثبات ووقار يبعث المهابة في النفوس الدانية والقاصية.", defaultTheme: "onyx" },
  { word: "المَوَدَّة", meaning: "أرقى درجات المحبة وأصفى قنواتها، وهي الألفة الرحيمة والتقارب الصادق بين الأرواح برباط وثيق.", defaultTheme: "ruby" },
  { word: "الرَّصَانَة", meaning: "جودة الفكر والوقار والرزانة في القول والعمل، واتزان العقل في تقدير الأمور الثمينة وحفظ العهود.", defaultTheme: "onyx" },
  { word: "الوَلَه", meaning: "شدة الحزن أو شدة الفرح والتعلق بجمال المحبوب حتى يغلب على الوعي رقة وعشقاً فياضاً يسحر الألباب.", defaultTheme: "ruby" },
  { word: "الرَّجَاء", meaning: "ترقب الفؤاد للخير والرحمة بنور الأمل، وتطلع الروح الدافئ بمستقبل مشرق ووديد يتجاوز عثرات الحاضر.", defaultTheme: "gold" },
  { word: "البَهَاء", meaning: "لمعان الحسن والروعة الممزوجة بالهيبة، وهو الإشراق الخالص الذي ينفذ إلى وجدان الرائي ببريق مذهل.", defaultTheme: "gold" },
  { word: "الأَصَالَة", meaning: "عراقة المنبت ورسوخ المجد، والتمسك بالقيم العالية والثابتة التي لا تزعزعها السنون وصروف الدهر المتغيرة.", defaultTheme: "sapphire" },
  { word: "الضِّيَاء", meaning: "النور الساطع الذي يصفي العتمة ويكشف معالم الجمال، وينير طريق السائرين بالنبل في دروب الفضيلة.", defaultTheme: "emerald" },
  { word: "الحِكْمَة", meaning: "منتهى التبصر والعدل ووضع كل أمر في موضعه اللائق بوقار وحنكة العارف البصير المنصف الخبير.", defaultTheme: "onyx" },
  { word: "السَّنَا", meaning: "الضوء اللامع الساطع المرتفع في الأفق، وهو بريق الأمل والمجد المشرق الذي يراه الجميع ببهاء وعظمة.", defaultTheme: "gold" },
  { word: "الشَّهَامَة", meaning: "عزة النفس وإقالتها للعثرات، والمسارعة لنجدة المكروب وحماية العهود بنخوة الأحرار وأصالة الوجدان العربي.", defaultTheme: "sapphire" },
  { word: "الخُلُود", meaning: "دوام الأثر والبقاء في ذاكرة الزمان، وهو تخليد الصفات العاطفية والوجدانية الرفيعة لتظل منارة ملهمة للأجيال.", defaultTheme: "onyx" },
  { word: "الحَنَان", meaning: "رقة القلب وعطفه الفياض، والنسمة الدافئة التي تداوي جراح الروح الشاكية باللطف واللين والمحبة العميقة.", defaultTheme: "ruby" },
  { word: "العَدْل", meaning: "سيد الفضائل وأساس الملك، وهو ميزان الحق والقسط الذي تشرق به الأوطان وتطمئن به النفوس والقلوب الحيرى.", defaultTheme: "emerald" },
  { word: "الجُود", meaning: "بذل المجهود بالبهجة والسرور لأجل إسعاد الآخرين، وسخاء النفس التلقائي بغير مقابل رغبة ببقاء الأثر السامي.", defaultTheme: "gold" },
  { word: "الهِمَّة", meaning: "عزيمة الروح وقوة الإرادة التي تتخطى المصاعب وتطأ النجوم سمواً وشموخاً لا ينكسر تحت وطأة الشدائد.", defaultTheme: "emerald" },
  { word: "الوَقَار", meaning: "الرزانة والسكينة والهيبة التي تكسو صاحبها رداء الاحترام وتبث في النفوس إكباراً ومهابة وحسن تقدير.", defaultTheme: "onyx" },
  { word: "الأُنْس", meaning: "طمأنينة الفؤاد وطرد الوحشة والهم بصحبة الأحبة ومطالعة الحروف والكلمات الساحرة الدافئة التي تبرئ الفؤاد.", defaultTheme: "ruby" },
  { word: "الصَّفَاء", meaning: "خلوص الروح من كدر الضغائن والهموم، وعودة الفؤاد كمرآة مصقولة تعكس بهاء الحياة ونور الفطرة.", defaultTheme: "sapphire" },
  { word: "العِشْق", meaning: "فرط الحب وتجاوزه المألوف، وهو الاحتراق الشغوف بنور الجمال والتعلق الروحاني الفريد المتصل بأسرار الوجود.", defaultTheme: "ruby" }
];

export default function App() {
  const [words, setWords] = useState<WordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  // Search input on the hero dashboard
  const [heroSearch, setHeroSearch] = useState('');

  // Selected word for Certificate detail modal or examples
  const [selectedWord, setSelectedWord] = useState<WordRecord | null>(null);

  // Active form view modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPrefilledWord, setBookingPrefilledWord] = useState('');

  // Success Toast Notification
  const [showToast, setShowToast] = useState<{ word: string; owner: string } | null>(null);

  // Stats
  const [mostRareTheme, setMostRareTheme] = useState('onyx');

  // Chat automated prompt triggering
  const [chatTriggerPrompt, setChatTriggerPrompt] = useState<string | null>(null);

  // Mouse coordinate tracking for very slow, subtle parallax glows
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Calculate remaining time until midnight (next word update)
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Midnight tonight
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 12,
        y: (e.clientY / window.innerHeight - 0.5) * 12
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load words from backend on mount
  const fetchWords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/words');
      if (!res.ok) {
        throw new Error('فشل فحص وتحميل الكلمات والبيانات من الخادم');
      }
      const data = await res.json();
      setWords(data);

      const counts: Record<string, number> = { gold: 0, emerald: 0, onyx: 0, sapphire: 0, ruby: 0 };
      data.forEach((w: WordRecord) => {
        if (counts[w.theme] !== undefined) counts[w.theme]++;
      });
      const rarest = Object.entries(counts).sort((a, b) => a[1] - b[1])[0]?.[0] || 'onyx';
      setMostRareTheme(rarest);
    } catch (err: any) {
      console.error(err);
      setErrorHeader('تعذر التواصل مع خادم ديوان الحروف السحابي حالياً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();

    const params = new URLSearchParams(window.location.search);
    const sharedWord = params.get('word');
    if (sharedWord) {
      const loadShared = async () => {
        try {
          const res = await fetch('/api/words');
          if (res.ok) {
            const data: WordRecord[] = await res.json();
            const matched = data.find(w => w.word.toLowerCase() === sharedWord.trim().toLowerCase());
            if (matched) {
              setSelectedWord(matched);
            } else {
              setHeroSearch(sharedWord.trim());
              setBookingPrefilledWord(sharedWord.trim());
              setShowBookingModal(true);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadShared();
    }
  }, []);

  const handleHeroSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    
    setBookingPrefilledWord(heroSearch.trim());
    setShowBookingModal(true);
  };

  const handleClaimSuccess = (newWord: WordRecord) => {
    setShowBookingModal(false);
    setSelectedWord(newWord);
    setWords(prev => [newWord, ...prev]);

    // Triggers custom success Toast 
    setShowToast({
      word: newWord.word,
      owner: newWord.owner
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setShowToast(prev => {
        if (prev?.word === newWord.word) return null;
        return prev;
      });
    }, 6000);
  };

  const startClaimWord = (wordText: string) => {
    setHeroSearch(wordText);
    setBookingPrefilledWord(wordText);
    setShowBookingModal(true);
  };

  // Dynamic daily selected word of the day
  const getWordOfTheDay = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % DAILY_WORDS.length;
    return DAILY_WORDS[index];
  };

  const currentDailyWordObj = getWordOfTheDay();

  // Find inside the words array (it can have diacritics or plain word)
  const featuredRecord = words.find(
    w =>
      w.word === currentDailyWordObj.word ||
      w.word.replace(/[ًٌٍَُِّْـ]/g, '') === currentDailyWordObj.word.replace(/[ًٌٍَُِّْـ]/g, '')
  );

  const featuredTheme = featuredRecord ? featuredRecord.theme : currentDailyWordObj.defaultTheme;
  const cardStyle = getCardStylesForTheme(featuredTheme);

  return (
    <div className="min-h-screen bg-parchment selection:bg-amber-100 selection:text-amber-900 font-sans relative overflow-hidden pb-10">
      {/* Top Beautiful Sticky Navigation Bar */}
      <nav className="w-full bg-white/75 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-[100] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between [direction:rtl]">
          {/* Logo Brand / Beautiful Connected Text */}
          <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center font-bold text-base sm:text-lg text-amber-850 shadow-3xs hover:scale-105 active:scale-95 duration-200 shrink-0 select-none">
              ✒️
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl sm:text-2xl font-black text-[#9c7717] font-serif-arabic select-none leading-tight">
                كِلْمَتِي
              </span>
              <span className="text-[8px] sm:text-[9.5px] text-neutral-400 font-bold hidden xs:inline mt-0.5 sm:mt-1 uppercase">
                ديوان الحروف الرقمية
              </span>
            </div>
          </div>

          {/* Members Auth Portal / User Profile button */}
          <div className="flex items-center gap-2">
            <AuthProfile words={words} onSelectWord={setSelectedWord} onProfileUpdated={fetchWords} />
          </div>
        </div>
      </nav>

      {/* Subtle glowing parallax spots in the outer container background */}
      <div 
        className="absolute top-20 right-[15%] w-[300px] h-[300px] bg-amber-300/5 rounded-full blur-[50px] pointer-events-none -z-10 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div 
        className="absolute bottom-40 left-[15%] w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[45px] pointer-events-none -z-10 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)` }}
      />

      {/* Hero Banner Grid layout */}
      <header className="relative pt-12 sm:pt-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 overflow-hidden">
        
        {/* Logo Shield / Branding - Beautiful connected non-cut Arabic brand */}
        <div className="flex flex-col items-center justify-center space-y-2 select-none mb-1.5">
          <div className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#B8891B] via-[#E2B33A] to-[#996e11] hover:scale-102 transition-transform duration-300 pointer-events-none drop-shadow-3xs font-serif-arabic select-none py-2 leading-normal">
            كِلْمَتِي
          </div>
          <span className="text-[10px] sm:text-xs font-black tracking-wide text-[#B8891B]/80 font-heading-arabic uppercase">
            المنصة السحابية الموثوقة لحيازة كلمات لغة الضاد
          </span>
        </div>

        {/* Brand visual typography (Stage 1.2 Copywriting) */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-800 leading-tight font-heading-arabic">
            أنشئ شهادة رقمية فريدة لكلماتك
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-2xl mx-auto font-body-arabic">
            أنشئ وصفاً أدبياً لكلمتك واحصل على شهادة رقمية فريدة بالذكاء الاصطناعي
          </p>
        </div>

        {/* Dynamic unified search box (Stage 1.1 / 6 Mobile version) */}
        <div className="max-w-xl mx-auto pt-4">
          <form onSubmit={handleHeroSearchSubmit} className="relative group/search bg-white p-1.5 rounded-[24px] border border-neutral-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-[#B8891B]/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center px-3 gap-2 relative">
                <Search className="w-5 h-5 text-[#B8891B] shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="اكتب كلمة عربية (مثال: شغف، طمأنينة)... أو اختر كلمة وأنشئ شهادتها الرقمية"
                  className="w-full py-3 pl-8 pr-1 text-[16px] sm:text-[18px] bg-transparent outline-none placeholder:text-neutral-450 text-neutral-800 font-bold leading-normal font-heading-arabic"
                  id="hero-word-search"
                />
                {heroSearch && (
                  <button
                    type="button"
                    onClick={() => setHeroSearch('')}
                    className="absolute left-3 text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer flex items-center justify-center"
                    aria-label="مسح البحث"
                    id="clear-hero-search-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-extrabold px-8 py-3 sm:py-0 h-12 sm:h-14 rounded-2xl transition-all duration-300 shrink-0 shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-heading-arabic"
                id="hero-claim-submit"
              >
                <span>أنشئ شهادتي</span>
              </button>
            </div>
          </form>

          {/* Featured Word of the Day directly underneath Search (as requested) */}
          <div id="word-of-the-day-card" className="max-w-lg mx-auto mt-6 rounded-[24px] p-6 text-center space-y-4 transition duration-300 group royal-gradient-card border border-amber-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative overflow-hidden bg-neutral-900 text-white animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 text-[10px] px-3 py-1 rounded-full w-max mx-auto leading-none uppercase bg-amber-500/20 text-amber-200 border border-amber-500/30 backdrop-blur-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>كَلِمَةُ اليَوْم</span>
            </div>
            <div className="space-y-2">
              <span className="block text-2xl md:text-3xl font-black font-serif-arabic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-105 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">« {currentDailyWordObj.word} »</span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed px-4 font-body-arabic text-stone-200">
                "{currentDailyWordObj.meaning}"
              </p>
            </div>
            {featuredRecord ? (
              <button
                type="button"
                onClick={() => setSelectedWord(featuredRecord)}
                className="text-xs font-black text-amber-300 hover:text-amber-100 underline block mx-auto pt-1 cursor-pointer duration-200 hover:scale-102"
                id="word-of-the-day-view-cert"
              >
                حيزت بملك: {featuredRecord.owner} ✦ عاين شهادة الحيازة الفاخرة 📜
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startClaimWord(currentDailyWordObj.word)}
                className="text-xs font-black text-amber-300 hover:text-amber-100 underline block mx-auto pt-1 cursor-pointer duration-200 hover:scale-102"
                id="word-of-the-day-claim"
              >
                طالع وأثبت تملك « {currentDailyWordObj.word} » الآن ✦
              </button>
            )}

            {/* Subtle Countdown Timer */}
            <div className="text-[11px] text-stone-300/80 font-medium font-body-arabic flex items-center justify-center gap-1.5 mt-2 pt-3 border-t border-white/5 select-none text-center">
              <span>تتغير الكلمة تلقائياً بعد:</span>
              <span className="font-mono text-amber-300 font-extrabold tracking-wider bg-black/30 px-2 py-0.5 rounded border border-white/10">{timeLeft || "00:00:00"}</span>
            </div>
          </div>
        </div>

      </header>

      {/* Main Container / Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        
        {/* Error Header notifications */}
        {errorHeader && (
          <div className="p-4 bg-red-50 border-r-4 border-red-600 rounded-2xl text-xs text-red-900 font-medium flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              {errorHeader}{' '}
              <button onClick={fetchWords} className="underline font-bold text-red-800 ml-2" id="retry-header-btn">
                أعد المحاولة
              </button>
            </div>
          </div>
        )}

        {/* 1. إحصاءات المنصة الموثوقة (Lifted to the absolute top of the main container for immediate trust building) */}
        <div className="py-6 px-4 bg-white border border-stone-200 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-around text-center gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-200 relative z-10 -mt-6">
          <div className="flex-1 px-4 py-2 sm:py-0">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#B8891B] leading-none font-heading-arabic">50,000+</span>
            <span className="block text-xs text-stone-500 font-extrabold mt-2 font-body-arabic">كلمة فريدة مولدة</span>
          </div>
          <div className="flex-1 px-4 py-2 sm:py-0 w-full sm:w-auto">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#B8891B] leading-none font-heading-arabic">2,000+</span>
            <span className="block text-xs text-stone-500 font-extrabold mt-2 font-body-arabic">أديب ومستخدم فعال</span>
          </div>
          <div className="flex-1 px-4 py-2 sm:py-0 w-full sm:w-auto">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#B8891B] leading-none font-heading-arabic">99.9%</span>
            <span className="block text-xs text-stone-500 font-extrabold mt-2 font-body-arabic">معدل وقت عمل المنصة</span>
          </div>
        </div>

        {/* 2. مثال شهادة وتخصيص الأنماط (Immediate Visual Showcase of the product) */}
        <section id="certificate-example-section" className="space-y-12">
          
          <RealExamples 
            words={words}
            onSelectExample={(exampleRecord) => setSelectedWord(exampleRecord)}
          />

        </section>

        {/* مِسبار المزاج اللغوي المتكامل */}
        <section id="mystic-oracle-section" className="pt-8 border-t border-neutral-200/50">
          <MysticOracle 
            onSelectWord={startClaimWord}
            onAskChat={(prompt) => setChatTriggerPrompt(prompt)}
          />
        </section>

        {/* 3. الكلمات الشائعة وقائمة الاختيار الأكثر طلباً بالديوان (Popular Words checklist) */}
        <section id="popular-words-checklist" className="pt-8 border-t border-[#dfdfdf]/50 space-y-8">
          
          {/* Popular Words checklist dashboard */}
          <div className="bg-stone-50 border border-neutral-200 rounded-[24px] p-6 md:p-8 space-y-6 text-right shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100 font-bold font-heading-arabic">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>الطلب غير المسبوق</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-neutral-800 font-heading-arabic">الألفاظ الأكثر طلباً وبحثاً بالديوان</h3>
              <p className="text-xs text-neutral-500 font-body-arabic">مجموعة من الكلمات الأكثر تكراراً ورغبةً في التراكم الوجداني واللغوي. يتاح لك تصميم شهادتها وحفظها لك.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {POPULAR_WORDS_LIST.map((p) => {
                const classification = classifyArabicWord(p.word);
                return (
                  <div
                    key={p.word}
                    onClick={() => startClaimWord(p.word)}
                    className={`p-4 border rounded-2xl cursor-pointer hover:shadow-xs transition hover:scale-103 text-center flex flex-col justify-between ${p.color}`}
                    id={`popular-item-${p.word}`}
                  >
                    <div>
                      <span className="block text-lg font-bold mb-1 font-heading-arabic">{p.word}</span>
                      <span className="text-[9px] opacity-80 font-bold block line-clamp-1 font-body-arabic" title={classification.category}>
                        {classification.category.replace("المجموعة", "طراز")}
                      </span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-mono font-black">
                      <span className="text-[10px] opacity-75">القيمة:</span>
                      <span>${classification.finalPrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* 4. حائط المبادلات والملكيات (Adoption & registry search proof - Beautiful, clean & simplified wall) */}
        <section id="words-wall-section" className="pt-16 border-t border-neutral-200/50 space-y-6">
          <div id="words-wall" className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 [direction:rtl]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#B8891B]" />
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-800 font-heading-arabic">حائط المِلْكِيّات للكلمات 🌌 (Word Owners Wall)</h2>
              </div>
              <div className="flex items-center gap-2">
                {loading && <span className="text-[10px] text-neutral-400 font-medium font-mono">تحديث الفهرس...</span>}
                <button
                  type="button"
                  onClick={() => {
                    setBookingPrefilledWord('');
                    setShowBookingModal(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer font-heading-arabic"
                  id="nav-create-word-btn"
                >
                  <span>احجز كلمتك الحالية</span>
                  <span className="text-[9px] opacity-70">✦</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-[#B8891B] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-neutral-500 font-semibold font-body-arabic">جاري تحميل الفهرس اللغوي للألفاظ المحجوزة...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <LinguisticNetwork
                  words={words}
                  onSelectWord={(wordRecord) => setSelectedWord(wordRecord)}
                  onAddWord={() => {
                    setBookingPrefilledWord('');
                    setShowBookingModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* 5. النماذج الجاهزة للتوليد البليغ (Engagement Playground feature) */}
        <section id="ready-made-templates" className="pt-16 border-t border-neutral-200/50 space-y-6">
          <div className="flex items-center gap-1.5 justify-start">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-950 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase leading-none">
              <Sparkles className="w-3" />
              <span>قِسْمُ النَّمَاجِذ الجَاهِزَة للتَّوْلِيد البَلِيغ</span>
            </span>
          </div>
          <div className="space-y-1 text-right">
            <h3 className="text-base sm:text-lg font-extrabold text-neutral-800 font-heading-arabic leading-none">
              ثق بجمال الحروف في صياغة خطاباتك المتنوعة
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-550 font-medium font-body-arabic">
              انقر على أحد النماذج الراقية ليقوم مساعدك المستشار الذكي بتطويع البلاغة فوراً:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "كتابة مقال أدبي",
                desc: "مقال رصين يجسد روح اللغة وبلاغة الفصحى العريقة.",
                icon: FileText,
                iconColor: "text-[#B8891B] bg-amber-50",
                prompt: "أريد كتابة مقال أدبي فصيح وبليغ للغاية مسترشداً بمقام الكلمات الكبرى بالديوان الوجداني، واشمل فيه بعض الفرائد اللغوية الرصينة."
              },
              {
                title: "منشور لمنصة (X)",
                desc: "عبارات بليغة رنانة تلامس أسماع ومحبي ومتابعيصفحتك.",
                icon: Sparkles,
                iconColor: "text-emerald-700 bg-emerald-50",
                prompt: "صغ لي ثلاثة منشورات بليغة وجذابة للغاية لمنصة X (تويتر سابقاً) تعبر عن المشاعر الوجدانية العميقة كالشغف والسلام واليقين بنثر ساحر."
              },
              {
                title: "وصف منتج فاخر",
                desc: "صيغة تسويقية أدبية راقية تبرز فرادة ونفاسة منتجك النبيل.",
                icon: ShoppingBag,
                iconColor: "text-purple-600 bg-purple-50",
                prompt: "أحتاج إلى كتابة وصف تسويقي أدبي فاخر جداً لمنتج نخبوي وراقٍ مستخدماً من أرقى وجواهر البلاغة والمفردات العربية الفصيحة ما يبرز فخامة القيمة."
              },
              {
                title: "رسالة بريد بليغة",
                desc: "صياغة خطابات رسمية وشخصية رصينة ومؤثرة للاحترام والوفاء.",
                icon: Mail,
                iconColor: "text-rose-600 bg-rose-50",
                prompt: "صغ لي مسودة بريد إلكتروني رسمي رفيع المستوى يفيض بالتقدير والامتنان والاحترام البالغ باللغة العربية الفصحى الشريفة."
              }
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setChatTriggerPrompt(item.prompt)}
                  className="bg-white border border-stone-200/80 p-5 rounded-[24px] flex flex-col items-start text-right space-y-3.5 hover:border-[#B8891B] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] duration-300 transition-all cursor-pointer group active:scale-97 shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
                  id={`template-btn-${index}`}
                >
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border border-stone-150/40 ${item.iconColor} group-hover:scale-105 duration-200`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1 w-full">
                    <span className="block text-xs font-black text-stone-900 transition duration-200 group-hover:text-[#B8891B] font-heading-arabic">
                      {item.title}
                    </span>
                    <p className="text-[11.5px] text-stone-500 leading-relaxed font-body-arabic">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-full text-left pt-2 px-1 border-t border-stone-100 mt-1">
                    <span className="text-[10px] font-black text-[#B8891B] hover:underline inline-flex items-center gap-0.5 font-heading-arabic">
                      جرّب التوليد الآن ✦
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. آراء المستخدمين والزوار في مجتمعنا (Social Validation) */}
        <section id="reviews-section" className="pt-16 border-t border-neutral-200/50">
          <TrustSection />
        </section>

        {/* 7. دليل الميثاق وفلسفة منصة ديوان كلمتي (Brand Deep Connection Story) */}
        <section id="ownership-details-section" className="pt-16 border-t border-neutral-200/50 space-y-6">
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold font-heading-arabic">
              <Award className="w-3.5 h-3.5 text-[#B8891B]" />
              <span>دليل الميثاق والتملك الأدبي</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-neutral-800 mt-2 font-heading-arabic">
              عن آلية الحيازة والتملك وفلسفة المنصة
            </h2>
          </div>
          <BrandManifesto />
        </section>

        {/* 8. الأسئلة الشائعة وتدابير السداد (Objection clearing before finalizing action) */}
        <section id="faq-section" className="pt-16 border-t border-neutral-200/50">
          <CollapsibleFAQ />
        </section>

        {/* 9. كيف يعمل ديوان كلمتي؟ (Explaining steps right after clarifying FAQs - as requested) */}
        <section id="how-it-works-section" className="pt-16 border-t border-neutral-200/50 space-y-6">
          <HowItWorks />
        </section>

      </main>

      {/* Decorative Traditional Footer */}
      <footer className="border-t border-neutral-200/60 bg-neutral-900 text-neutral-400 py-10 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold tracking-wide text-neutral-200">صُنع بحب وتقدير لأجل عظمة ومقام كنز الثقافة العربية وحروفها الأبدية</p>
          <p className="text-[10px] text-neutral-500 font-mono">جميع الحقوق الرمزية والأدبية مسجلة ومرخصة سحابياً © ٢٠٢٦ — ديوان كِلْمَتِي الموثق</p>
        </div>
      </footer>

      {/* MODAL OVERLAYS */}
      <AnimatePresence>
        
        {/* Modal 1: Certificate Showcase details */}
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
            onClick={() => setSelectedWord(null)}
            id="certificate-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-4xl w-full my-4 sm:my-8 bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <Certificate
                record={selectedWord}
                onClose={() => setSelectedWord(null)}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Modal 2: Booking and Ownership Form */}
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
            onClick={() => setShowBookingModal(false)}
            id="booking-form-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-2xl w-full my-4 sm:my-8 bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <BookingForm
                prefilledWord={bookingPrefilledWord}
                onSuccess={handleClaimSuccess}
                onCancel={() => setShowBookingModal(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Success Toast Notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            dir="rtl"
            className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md bg-neutral-900 border border-amber-500/40 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 z-50 overflow-hidden flex flex-col gap-3 font-sans"
            id="success-toast-notification"
          >
            {/* Ambient gold glow decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 select-none animate-pulse">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              
              <div className="flex-1 space-y-1 text-right font-sans">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5 leading-none">
                  <span>اكتمل التوثيق بنجاح!</span>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded leading-none">مؤكد</span>
                </h4>
                <p className="text-xs text-stone-200 leading-relaxed font-sans">
                  تم تسجيل الكلمة الوجدانية الكبرى <span className="font-serif-arabic text-amber-300 font-bold text-sm">« {showToast.word} »</span> في ديوان كِلْمَتِي وتخصيص الصك الفريد باسم المالك: <span className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">{showToast.owner}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowToast(null)}
                className="text-stone-400 hover:text-white transition text-xs p-1 rounded-lg hover:bg-white/5 font-sans border-0 cursor-pointer bg-transparent"
                id="close-toast-btn"
              >
                ✕
              </button>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-white/5 relative z-10">
              <span className="text-[9px] text-stone-400 font-medium font-sans">ديوان كِلْمَتِي • الحفظ السحابي الآمن</span>
              <button
                type="button"
                onClick={() => {
                  // Find the newly claimed word record and open its details
                  const matched = words.find(w => w.word === showToast.word);
                  if (matched) {
                    setSelectedWord(matched);
                  }
                  setShowToast(null);
                }}
                className="text-[10px] text-neutral-900 bg-amber-400 hover:bg-amber-300 transition duration-300 font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer border-0"
                id="view-cert-toast-btn"
              >
                <span>استعراض الصك الملكي</span>
              </button>
            </div>

            {/* Bottom progress bar indicating auto-timeout limit */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-amber-400"
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Floating AI Chat Companion widget */}
      <AIChatCompanion 
        onSuggestWord={startClaimWord} 
        externalTriggerPrompt={chatTriggerPrompt}
        onClearExternalTrigger={() => setChatTriggerPrompt(null)}
      />
    </div>
  );
}
