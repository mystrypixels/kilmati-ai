import React, { useState } from 'react';
import { WordRecord } from '../types';
import { Sparkles, Search, Plus, Award, ShieldCheck, Heart, User, Share2 } from 'lucide-react';
import { classifyArabicWord } from '../utils';

interface LinguisticNetworkProps {
  words: WordRecord[];
  onSelectWord: (word: WordRecord) => void;
  onAddWord: () => void;
}

const THEME_CONFIGS = {
  gold: {
    bg: 'bg-amber-50/50 border-amber-200/70 hover:bg-amber-50/85',
    title: 'text-amber-900',
    accent: 'text-amber-850 bg-amber-100/60 border-amber-200/50',
    accentLabel: 'طراز مذهّب عريق',
    btn: 'bg-amber-600 hover:bg-amber-700 text-amber-50',
    textMute: 'text-amber-800/80'
  },
  emerald: {
    bg: 'bg-emerald-50/50 border-emerald-200/70 hover:bg-emerald-50/85',
    title: 'text-emerald-950',
    accent: 'text-emerald-850 bg-emerald-100/60 border-emerald-200/50',
    accentLabel: 'طراز الزمرد الفياض',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
    textMute: 'text-emerald-800/80'
  },
  onyx: {
    bg: 'bg-stone-50/50 border-stone-250 hover:bg-stone-100/40',
    title: 'text-stone-900',
    accent: 'text-stone-750 bg-stone-200/80 border-stone-300/40',
    accentLabel: 'طراز العقيق الفحم',
    btn: 'bg-stone-800 hover:bg-stone-900 text-stone-50',
    textMute: 'text-stone-600/90'
  },
  sapphire: {
    bg: 'bg-blue-50/50 border-blue-200/70 hover:bg-blue-50/85',
    title: 'text-blue-950',
    accent: 'text-blue-850 bg-blue-100/60 border-blue-200/50',
    accentLabel: 'طراز السافير الملهم',
    btn: 'bg-blue-600 hover:bg-blue-700 text-blue-50',
    textMute: 'text-blue-800/80'
  },
  ruby: {
    bg: 'bg-rose-50/50 border-rose-200/70 hover:bg-rose-50/85',
    title: 'text-rose-950',
    accent: 'text-rose-850 bg-rose-100/60 border-rose-200/50',
    accentLabel: 'طراز ياقوت الوجدان',
    btn: 'bg-rose-600 hover:bg-rose-700 text-rose-50',
    textMute: 'text-rose-800/80'
  }
};

export default function LinguisticNetwork({ words, onSelectWord, onAddWord }: LinguisticNetworkProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');
  const [copiedWordId, setCopiedWordId] = useState<string | null>(null);

  const handleShareWord = (word: WordRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `أمتلكُ اليوم رمزياً كلمة "${word.word}" باللغة العربية عبر منصة كِلْمَتِي! روعتها البلاغية: ${word.quote || word.meaning || ''}`;
    const shareUrl = `${window.location.origin}?word=${encodeURIComponent(word.word)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `ملكية كلمة: ${word.word}`,
        text: shareText,
        url: shareUrl,
      })
      .then(() => {
        setCopiedWordId(word.id);
        setTimeout(() => setCopiedWordId(null), 2000);
      })
      .catch(() => {
        navigator.clipboard.writeText(`${shareText} - شاهده هنا: ${shareUrl}`);
        setCopiedWordId(word.id);
        setTimeout(() => setCopiedWordId(null), 2000);
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - شاهده هنا: ${shareUrl}`);
      setCopiedWordId(word.id);
      setTimeout(() => setCopiedWordId(null), 2000);
    }
  };

  // Filter words
  const filteredWords = words.filter((w) => {
    const matchesSearch = 
      w.word.includes(searchTerm) || 
      w.owner.includes(searchTerm) || 
      (w.meaning && w.meaning.includes(searchTerm));
    
    const matchesTheme = selectedThemeFilter === 'all' || w.theme === selectedThemeFilter;
    
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="space-y-6 [direction:rtl]">
      {/* Top filter and search bar for the simplified wall */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/70 p-4 border border-stone-200/60 rounded-2xl shadow-3xs">
        
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث عن كلمة، أو مالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/70 duration-200 font-heading-arabic"
          />
        </div>

        {/* Style/Theme categories quick filters */}
        <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end w-full md:w-auto">
          <span className="text-[11px] text-stone-500 font-bold ml-1 font-body-arabic select-none">ترشيح الطراز:</span>
          {[
            { value: 'all', label: 'الكل' },
            { value: 'gold', label: 'مذهب 👑' },
            { value: 'ruby', label: 'ياقوتي 🌹' },
            { value: 'sapphire', label: 'سافير 🌌' },
            { value: 'emerald', label: 'زمردي 🌿' },
            { value: 'onyx', label: 'عقيقي ♟️' }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedThemeFilter(cat.value)}
              className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition duration-200 cursor-pointer font-heading-arabic ${
                selectedThemeFilter === cat.value
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of registered words */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {filteredWords.map((word) => {
          const cfg = THEME_CONFIGS[word.theme] || THEME_CONFIGS.gold;
          const classification = classifyArabicWord(word.word);
          
          return (
            <div
              key={word.id}
              className={`p-6 rounded-[24px] border flex flex-col justify-between text-right space-y-4 group transition-all duration-300 hover:shadow-md hover:scale-[1.015] ${cfg.bg}`}
              id={`wall-item-${word.id}`}
            >
              {/* Card Header badges */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-200/10 pb-3">
                <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md uppercase border ${cfg.accent} font-heading-arabic`}>
                  {cfg.accentLabel}
                </span>
                <span className="text-[11px] font-mono text-stone-400 font-bold">
                  {new Date(word.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Word Details */}
              <div className="space-y-2">
                <h4 className={`text-2xl font-black font-serif-arabic tracking-wide flex items-center gap-1.5 ${cfg.title}`}>
                  « {word.word} »
                </h4>
                <p className={`text-xs ml-1 font-body-arabic leading-relaxed line-clamp-2 ${cfg.textMute}`} title={word.meaning}>
                  "{word.meaning}"
                </p>
              </div>

              {/* Ownership row */}
              <div className="border-t border-stone-200/15 pt-3.5 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1 text-stone-850 font-body-arabic">
                  <User className="w-3.5 h-3.5 text-amber-600/70" />
                  <span className="text-stone-500 text-[10px] sm:text-[11px]">بملك الأديب:</span>
                  <span className="text-stone-800 font-extrabold">{word.owner}</span>
                </div>
                
                <span className="text-[11.5px] font-mono font-black text-amber-700/90">
                  ${classification.finalPrice}
                </span>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectWord(word)}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition duration-200 shadow-3xs cursor-pointer flex items-center justify-center gap-1 font-heading-arabic ${cfg.btn}`}
                id={`wall-item-action-${word.id}`}
              >
                <span>عاين الشهادة الفاخرة</span>
                <span>📜</span>
              </button>
            </div>
          );
        })}

        {/* Dynamic Plus Add Card as requested: "والكلمة اللي بعده اكتب اضف كلمتك هنا مثلا" */}
        <div
          onClick={onAddWord}
          className="p-6 rounded-[24px] border-2 border-dashed border-stone-300 hover:border-amber-400 bg-amber-50/10 hover:bg-amber-50/20 flex flex-col items-center justify-center text-center space-y-4 group transition-all duration-300 cursor-pointer hover:shadow-xs min-h-[220px]"
          id="wall-item-add-new-trigger"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100/60 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 duration-300 shadow-3xs">
            <Plus className="w-6 h-6 text-[#9c7717]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-stone-800 font-heading-arabic group-hover:text-amber-800 transition">
              أضف كَلِمتك هنا للديوان
            </h4>
            <p className="text-xs text-stone-500 font-body-arabic max-w-xs leading-relaxed px-4">
              احجز لفظك العربي المميّز الآن، صغ معناه ببلاغة، وثبّته باسمك وصكّ تملّكك للأبد
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:underline font-heading-arabic">
            <span>احجز كلمتك الآن ✨</span>
          </div>
        </div>

      </div>

      {/* Empty search results fallback */}
      {filteredWords.length === 0 && (
        <div className="py-12 text-center bg-white border border-stone-200/60 rounded-2xl space-y-2">
          <p className="text-stone-500 font-bold font-body-arabic text-xs">لم يُعثر على كلمات تطابق البحث بالأرشيف اللغوي.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedThemeFilter('all'); }}
            className="text-xs text-amber-700 hover:underline font-heading-arabic font-extrabold cursor-pointer"
          >
            مسح عوامل التصفية والتحديث
          </button>
        </div>
      )}
    </div>
  );
}
