import React, { useState } from "react";
import { WordRecord, CertificateTheme } from "../types";
import { Search, Calendar, User, Eye, Gift, Hash, ChevronLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Certificate from "./Certificate";
import { classifyArabicWord } from "../utils";

interface WordWallProps {
  words: WordRecord[];
  onSelectWord: (word: WordRecord) => void;
}

const themeBorderStyles: Record<CertificateTheme, {
  card: string;
  badge: string;
  borderAccent: string;
  heading: string;
}> = {
  gold: {
    card: "border-amber-300 hover:border-amber-400 bg-amber-50/10 hover:shadow-lg hover:shadow-amber-100/10",
    badge: "bg-amber-100 border-amber-200 text-amber-800",
    borderAccent: "border-r-4 border-r-amber-500",
    heading: "text-neutral-850 group-hover:text-amber-805 text-neutral-800 group-hover:text-amber-800",
  },
  emerald: {
    card: "border-emerald-300 hover:border-emerald-400 bg-emerald-50/10 hover:shadow-lg hover:shadow-emerald-100/10",
    badge: "bg-emerald-100 border-emerald-200 text-emerald-800",
    borderAccent: "border-r-4 border-r-emerald-500",
    heading: "text-neutral-800 group-hover:text-emerald-800",
  },
  onyx: {
    card: "border-neutral-300 hover:border-neutral-400 bg-neutral-50/70 hover:shadow-lg hover:shadow-neutral-200/10 text-neutral-800",
    badge: "bg-neutral-100 border-neutral-200 text-neutral-800",
    borderAccent: "border-r-4 border-r-neutral-500",
    heading: "text-neutral-800 group-hover:text-neutral-950",
  },
  sapphire: {
    card: "border-blue-300 hover:border-blue-400 bg-blue-50/10 hover:shadow-lg hover:shadow-blue-100/10",
    badge: "bg-blue-100 border-blue-200 text-blue-800",
    borderAccent: "border-r-4 border-r-blue-500",
    heading: "text-neutral-800 group-hover:text-blue-850 text-neutral-850 text-neutral-800 group-hover:text-blue-800",
  },
  ruby: {
    card: "border-red-300 hover:border-red-400 bg-red-50/10 hover:shadow-lg hover:shadow-red-100/10",
    badge: "bg-red-100 border-red-200 text-red-800",
    borderAccent: "border-r-4 border-r-red-500",
    heading: "text-neutral-800 group-hover:text-red-800",
  },
};

const themeArabicLabels: Record<CertificateTheme, string> = {
  gold: "الدِّيوَانُ الذَّهَبِيُّ",
  emerald: "زُمُرُّدٌ أَنْدَلُسِيٌّ",
  onyx: "عَقِيقٌ مُلُوكِيٌّ دَافِئٌ",
  sapphire: "سَافِيرٌ نَاصِعٌ",
  ruby: "يَاقُوتُ الوَجْدِ الشَّغُوفِ"
};

const WALL_BG_THEMES = {
  sand: {
    label: "الرمل النجدي (افتراضي)",
    containerBg: "bg-gradient-to-br from-[#faf6ee] to-[#f4ecd8] border-[#ebdcb2]/70 text-[#543b14]",
    pillBg: "bg-[#faf6ee]/80 text-[#785925] border-[#ebdcb2] hover:bg-[#ebdcb5]/40",
    activePillBg: "bg-[#785925] text-white border-[#785925]",
    badgeBorder: "border-[#e0ce9a]/60",
    statsText: "text-[#785925]",
    subtitleText: "text-[#8c6d3b]",
    hubBg: "bg-white/85 border-[#ebdcb2]"
  },
  neutral: {
    label: "الرخام الكلاسيكي الأنيق",
    containerBg: "bg-slate-50/90 border-slate-200 text-neutral-800",
    pillBg: "bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-100",
    activePillBg: "bg-slate-900 text-white border-slate-900",
    badgeBorder: "border-slate-200/60",
    statsText: "text-neutral-800",
    subtitleText: "text-neutral-500",
    hubBg: "bg-white/90 border-slate-200"
  },
  dark: {
    label: "العقيق الكوني الداكن",
    containerBg: "bg-gradient-to-br from-neutral-900 via-stone-900 to-neutral-950 border-neutral-800 text-stone-100",
    pillBg: "bg-neutral-800/80 text-stone-300 border-neutral-700 hover:bg-neutral-750",
    activePillBg: "bg-amber-500 text-neutral-950 border-amber-500 font-bold",
    badgeBorder: "border-neutral-800",
    statsText: "text-white",
    subtitleText: "text-stone-400",
    hubBg: "bg-neutral-950/70 border-neutral-800"
  },
  emerald: {
    label: "الزمرد الأندلسي العتيق",
    containerBg: "bg-gradient-to-br from-emerald-50/70 to-emerald-100/50 border-emerald-200 text-emerald-950",
    pillBg: "bg-emerald-55 text-emerald-800 border-emerald-150 hover:bg-emerald-100/40",
    activePillBg: "bg-emerald-800 text-white border-emerald-800",
    badgeBorder: "border-emerald-250/50",
    statsText: "text-emerald-900",
    subtitleText: "text-emerald-700",
    hubBg: "bg-white/85 border-emerald-200"
  },
  sapphire: {
    label: "السافير النيلي الفاخر",
    containerBg: "bg-gradient-to-br from-indigo-50/70 to-indigo-100/50 border-indigo-200 text-indigo-950",
    pillBg: "bg-indigo-55 text-indigo-800 border-indigo-150 hover:bg-indigo-100/40",
    activePillBg: "bg-indigo-800 text-white border-indigo-800",
    badgeBorder: "border-indigo-250/50",
    statsText: "text-indigo-900",
    subtitleText: "text-indigo-700",
    hubBg: "bg-white/85 border-indigo-200"
  }
};

export default function WordWall({ words, onSelectWord }: WordWallProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [wallBgKey, setWallBgKey] = useState<keyof typeof WALL_BG_THEMES>('sand');

  const getCategoryKey = (categoryName: string): string => {
    if (!categoryName) return "classic";
    if (categoryName.includes("الروحانية") || categoryName.includes("أثيري")) return "spiritual";
    if (categoryName.includes("جواهر") || categoryName.includes("نادرة") || categoryName.includes("نادر")) return "rare";
    if (categoryName.includes("الوجداني") || categoryName.includes("الشاعري") || categoryName.includes("عشق")) return "poetic";
    if (categoryName.includes("النخبة") || categoryName.includes("سياد") || categoryName.includes("شرف") || categoryName.includes("وقار")) return "philosophical";
    return "classic";
  };

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTheme = themeFilter === "all" || w.theme === themeFilter;

    const wordInfo = w.category && w.price
      ? { category: w.category, finalPrice: w.price }
      : classifyArabicWord(w.word);

    const catKey = getCategoryKey(wordInfo.category);
    const matchesCategory = categoryFilter === "all" || catKey === categoryFilter;

    return matchesSearch && matchesTheme && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const activeWallTheme = WALL_BG_THEMES[wallBgKey] || WALL_BG_THEMES.sand;

  return (
    <div className={`w-full relative p-6 md:p-8 rounded-3xl border transition-all duration-500 shadow-sm ${activeWallTheme.containerBg} space-y-6 text-right`}>
      {/* Search and Filters Hub */}
      <div className={`flex flex-col gap-4 p-4 rounded-2xl border transition-colors duration-500 shadow-xs ${activeWallTheme.hubBg}`}>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Statistics info */}
          <div>
            <h3 className={`text-sm font-semibold font-kufi transition-colors ${activeWallTheme.statsText}`}>ملتقى ملاك الحروف والكلمات</h3>
            <p className={`text-xs transition-colors ${activeWallTheme.subtitleText} mt-0.5`}>
              تم تسجيل حجز <span className={`font-bold ${wallBgKey === 'dark' ? 'text-amber-400' : 'text-[#9c7717]'}`}>{words.length}</span> كلمة استثنائية في السجلات الرمزية للمنصة.
            </p>
          </div>

          {/* Filters and search box */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Literary Category Filters select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none text-neutral-800"
              id="category-select-filter"
            >
              <option value="all">كل التصنيفات الأدبية</option>
              <option value="spiritual">المجموعة الروحانية الأثيرية</option>
              <option value="rare">المجموعة البلاغية النادرة</option>
              <option value="poetic">المجموعة الوجدانيّة الشاعريّة</option>
              <option value="philosophical">مجموعة النخبة والسيادة والوقار</option>
              <option value="classic">المجموعة العامة الفصحى</option>
            </select>

            {/* Theme Filters select */}
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none text-neutral-800"
              id="theme-select-filter"
            >
              <option value="all">كل الأنماط الفاخرة</option>
              <option value="gold">الدِّيوَانُ الذَّهَبِيُّ</option>
              <option value="emerald">زُمُرُّدٌ أَنْدَلُسِيٌّ</option>
              <option value="onyx">عَقِيقٌ مُلُوكِيٌّ دَافِئٌ</option>
              <option value="sapphire">سَافِيرٌ نَاصِعٌ</option>
              <option value="ruby">يَاقُوتُ الوَجْدِ الشَّغُوفِ</option>
            </select>

            {/* Search dynamic input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 right-3 flex items-center text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="ابحث بالنص أو اسم مالك الكلمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pr-9 pl-3 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-neutral-400 text-neutral-800"
                id="wall-search-input"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Wall Color Switcher pills */}
        <div className={`flex flex-wrap items-center gap-2 pt-3 border-t border-dashed ${wallBgKey === 'dark' ? 'border-neutral-850' : 'border-neutral-200'} justify-start w-full`}>
          <span className={`text-[10px] font-bold transition-colors ${wallBgKey === 'dark' ? 'text-stone-400' : 'text-neutral-500'} ml-2 font-sans flex items-center gap-1`}>
            🎨 تخصيص لون حائط الديوان:
          </span>
          {Object.entries(WALL_BG_THEMES).map(([key, t]) => {
            const isSelected = wallBgKey === key;
            return (
              <button
                key={key}
                onClick={() => setWallBgKey(key as any)}
                type="button"
                className={`text-[9.5px] px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                  isSelected 
                    ? t.activePillBg + ' shadow-xs scale-[1.03] font-bold' 
                    : t.pillBg
                } cursor-pointer`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Grid of registered words */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-white/40 rounded-2xl border border-dashed border-neutral-200/60">
          <p className="text-sm text-neutral-500">لا توجد كلمات تناسب معايير البحث الحالية.</p>
          <button
            onClick={() => { setSearchQuery(""); setThemeFilter("all"); setCategoryFilter("all"); }}
            className="mt-3 text-xs font-semibold text-amber-700 hover:underline"
            id="clear-filters-btn"
          >
            تصفير تصفية البحث
          </button>

        </div>
      ) : (
        <>
          {/* Responsive Scaling Info indicator */}
          <div className="text-right mb-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-900 bg-amber-50/70 border border-amber-200/50 px-3 py-1 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              💡 ركن ذكي: تتكيف لوحات الحائط وتتقلص تدريجياً تلقائياً ("تصغر وتصغر") لتتسع لآلاف الملاك وبهاء الذكريات!
            </span>
          </div>

          {(() => {
            // Dynamically calculate grid columns, padding, font sizes, and layout to scale down as words multiply
            const totalWordsCount = filteredWords.length;
            
            let gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
            let paddingClass = "p-6";
            let headingSizeClass = "text-3xl";
            let quoteSizeClass = "text-xs lines-clamp-2 mt-2 leading-relaxed italic";
            let showQuoteText = true;
            let gapClass = "space-y-4";
            let footerMarginClass = "mt-6 pt-4";
            let iconSize = "w-3.5 h-3.5";
            let badgeTextSizeClass = "text-[9px]";
            let metadataSizeClass = "text-xs";
            let hideDetailsOnExtraDense = false;

            if (totalWordsCount > 24) {
              // Extra dense: super smart pebble look
              gridColsClass = "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5";
              paddingClass = "p-2.5";
              headingSizeClass = "text-base";
              quoteSizeClass = "";
              showQuoteText = false;
              gapClass = "space-y-1.5";
              footerMarginClass = "mt-2 pt-1.5 border-t border-neutral-100/30";
              iconSize = "w-2.5 h-2.5";
              badgeTextSizeClass = "text-[7.5px] px-1";
              metadataSizeClass = "text-[9.5px]";
              hideDetailsOnExtraDense = true;
            } else if (totalWordsCount > 12) {
              // Dense: medium-small compact tiles
              gridColsClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5";
              paddingClass = "p-4";
              headingSizeClass = "text-lg";
              quoteSizeClass = "text-[10px] line-clamp-1 mt-1 leading-normal";
              showQuoteText = true;
              gapClass = "space-y-2";
              footerMarginClass = "mt-3 pt-2";
              iconSize = "w-3 h-3";
              badgeTextSizeClass = "text-[8px]";
              metadataSizeClass = "text-[11px]";
            } else if (totalWordsCount > 6) {
              // Semi-dense: smaller cards
              gridColsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5";
              paddingClass = "p-5";
              headingSizeClass = "text-2xl";
              quoteSizeClass = "text-[11px] line-clamp-2 mt-1.5 leading-relaxed";
              showQuoteText = true;
              gapClass = "space-y-3";
              footerMarginClass = "mt-4 pt-3";
              iconSize = "w-3 h-3";
              badgeTextSizeClass = "text-[8.5px]";
              metadataSizeClass = "text-xs";
            }

            return (
              <div className={`grid ${gridColsClass} transition-all duration-500`}>
                <AnimatePresence>
                  {filteredWords.map((item, index) => {
                    const themeStyle = themeBorderStyles[item.theme] || themeBorderStyles.gold;
                    const wordInfo = item.category && item.price
                      ? { category: item.category, finalPrice: item.price }
                      : classifyArabicWord(item.word);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                        onClick={() => onSelectWord(item)}
                        className={`group relative ${paddingClass} border rounded-2xl cursor-pointer transition-all duration-300 ${themeStyle.card} ${themeStyle.borderAccent} cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs`}
                        id={`word-card-${item.id}`}
                      >
                        
                        {/* Gift banner */}
                        {item.isGift && !hideDetailsOnExtraDense && (
                          <span className="absolute top-2 left-2 bg-rose-50 border border-rose-100 text-rose-600 p-0.5 rounded shadow-[0_1px_3px_rgba(0,0,0,0.05)]" title="هذه كلمة مهداة">
                            <Gift className="w-2.5 h-2.5" />
                          </span>
                        )}

                        {/* Rare classification shiny badge */}
                        {(item.theme === 'ruby' || item.theme === 'onyx') && (
                          <div className={`absolute top-2 ${item.isGift && !hideDetailsOnExtraDense ? 'left-8' : 'left-2'} flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 px-1.5 py-0.5 rounded-md text-[8.5px] font-black tracking-tight select-none pointer-events-none z-10 animate-pulse`} title="تصنيف نادر">
                            <span className="relative flex h-1 w-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-500"></span>
                            </span>
                            <Sparkles className="w-2.5 h-2.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                            {!hideDetailsOnExtraDense && <span className="font-sans text-[8px] text-amber-800">نادر</span>}
                          </div>
                        )}

                        <div className={gapClass}>
                          {/* Badge theme */}
                          <div className="flex justify-between items-center whitespace-nowrap">
                            <span className={`${badgeTextSizeClass} font-bold px-1.5 py-0.5 rounded-full border ${themeStyle.badge}`}>
                              {themeArabicLabels[item.theme] || themeArabicLabels.gold}
                            </span>
                            {!hideDetailsOnExtraDense && (
                              <span className="text-[9px] text-neutral-400 font-mono">
                                #{item.id.replace("w-", "").slice(0, 4)}
                              </span>
                            )}
                          </div>

                          {/* Word Title heading */}
                          <div className="text-right">
                            <h4 className={`${headingSizeClass} font-bold font-serif-arabic ${themeStyle.heading} transition duration-300 group-hover:scale-105 inline-block origin-right`}>
                              « {item.word} »
                            </h4>
                            {showQuoteText && item.quote && (
                              <p className={`${quoteSizeClass} text-neutral-500 font-serif-arabic`}>
                                "{item.quote}"
                              </p>
                            )}
                          </div>

                          {/* Dynamic price and category bar */}
                          {!hideDetailsOnExtraDense && (
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-dashed border-neutral-200/50 text-[10px] w-full gap-2">
                              <span className="text-neutral-500 truncate text-right font-medium max-w-[70%]" title={wordInfo.category}>
                                🏷️ {wordInfo.category.replace("المجموعة", "طراز")}
                              </span>
                              <span className="font-mono text-amber-700/90 font-extrabold shrink-0 bg-amber-500/5 border border-amber-500/10 px-1 py-0.5 rounded">
                                ${wordInfo.finalPrice}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Metadata bottom row */}
                        <div className={`${footerMarginClass} border-t border-neutral-100/60 flex items-center justify-between ${metadataSizeClass} text-neutral-400 font-medium`}>
                          <div className="flex items-center gap-1.5 max-w-[70%]">
                            <User className={`${iconSize} text-neutral-400 group-hover:text-amber-700 transition shrink-0`} />
                            <span className="truncate font-bold text-neutral-650 font-kufi text-[11px]">
                              {item.owner}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!hideDetailsOnExtraDense && (
                              <div className="flex items-center gap-0.5 text-neutral-400 text-[10px]">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                            )}
                            <ChevronLeft className="w-3 h-3 text-neutral-400 group-hover:translate-x-1 hover:text-amber-800 transition transform shrink-0" />
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
