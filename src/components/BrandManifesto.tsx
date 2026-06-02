import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Landmark, Sunrise, Award, ArrowUpLeft, Gift, BookOpen, Quote } from 'lucide-react';

const EMOTIONAL_INTENTS = [
  {
    id: 'story',
    label: 'تعبير عن قصة شخصية',
    subLabel: 'Reflect Your Story',
    color: 'border-amber-300 hover:border-amber-500 bg-amber-50/20 text-amber-900',
    icon: Landmark,
    description: 'حفظ الكلمة التي تختصر فصلاً رئيسياً من رحلة حياتك، أو كفاحاً توجت فيه بالانتصار والأصالة.',
    stampText: 'سِجِلّ العِزّة'
  },
  {
    id: 'memory',
    label: 'تخليد وتكريم لذكرى',
    subLabel: 'Honor a Memory',
    color: 'border-purple-300 hover:border-purple-500 bg-purple-50/20 text-purple-900',
    icon: BookOpen,
    description: 'تخليد أثر باقٍ لشخص ممتد في الذاكرة، أو تدوير عبير مناسبة كانت مطلع الوفاء والمحبة.',
    stampText: 'رَسْم الوَفَاء'
  },
  {
    id: 'becoming',
    label: 'تحول ومستقبل تصبو إليه',
    subLabel: 'Who You Are Becoming',
    color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 text-emerald-900',
    icon: Sunrise,
    description: 'ربط نفسك بعهد جديد أو سمة شخصية قررت غرسها بنضوج في وجدانك؛ كالجلد أو الصبر الحكيم.',
    stampText: 'عهدُ الطُّمُوح'
  },
  {
    id: 'gift',
    label: 'إهداء نادر لمن تحب',
    subLabel: 'Gift or Showcase',
    color: 'border-rose-300 hover:border-rose-500 bg-rose-50/20 text-rose-900',
    icon: Gift,
    description: 'مفاجأة شخص استثنائي بهدية أدبية لا تفنى؛ صك تمليك يدوم باسمه ويشهد على عمق المودة.',
    stampText: 'نَبْض الوَجْدِ'
  }
];

export default function BrandManifesto() {
  const [selectedIntent, setSelectedIntent] = useState<string>('story');

  const activeIntent = EMOTIONAL_INTENTS.find(i => i.id === selectedIntent) || EMOTIONAL_INTENTS[0];

  return (
    <div dir="rtl" className="bg-gradient-to-tr from-[#fcfbfa] to-[#faf6f0] rounded-3xl p-6 md:p-10 text-neutral-800 relative overflow-hidden shadow-sm border border-stone-200/80">
      {/* Elegantly styled light radial gold/amber ambient lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Decorative vintage lines on corners */}
      <div className="absolute inset-4 pointer-events-none rounded-[20px] border border-stone-200/60"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Editorial emotional copy requested by user in detail - Bilingual Style */}
        <div className="lg:col-span-7 space-y-6 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-amber-850 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              فلسفة ديوان كِلْمَتِي ✦ Brand Manifesto
            </span>
          </div>

          {/* Bilingual Title Header */}
          <div className="space-y-1">
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-stone-900 font-sans leading-tight">
              السطوة العاطفية للكلمات وثباتها الأبدي
            </h2>
          </div>

          {/* Elegant Arabic interpretation block */}
          <div className="space-y-4 max-w-2xl text-stone-700">
            <p className="text-sm md:text-base leading-relaxed text-stone-850 font-serif-arabic font-medium">
              في <strong className="text-amber-850 font-black">ديوان كِلْمَتِي™</strong>، نؤمن بالسطوة العاطفية البالغة للغة ومكانة الكلمات في صياغة الأقدار. كلمة واحدة بمقدورها أن تروي سيرتك الطليقة، أو تخلّد ذكرى غالية تسكن في أعماق مهجتك، أو تحتضن ملامح شخص يافع بدأت تتشكل ملامحه وتتحول روحه كل يوم لتصبح ما تشاء.
            </p>
            <p className="text-xs md:text-sm leading-relaxed text-stone-600">
              نجعل من الممكن لك أن تستملك وتُخلد تملك تلك الكلمة الاستثنائية التي تلامس شغاف قلبك للأبد. يتم تسجيلها رقمياً بصفة مبرهنة ومصونة سحابياً ضد التكرار، لتقدمها كعطاء أو إهداء، أو كشاهد فريد يُبرز جلال قصتك الشخصية ومحطات الوجدان البارزة.
            </p>
            
            {/* The WOW Announcement banner style */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl block space-y-1 text-right">
              <span className="text-[10px] text-amber-900 font-extrabold flex items-center justify-end gap-1.5 leading-none">
                <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                جدار الكلمات الحقيقي الموثق (WOW - Word Owners Wall)
              </span>
              <p className="text-[11px] text-stone-600 leading-normal font-medium">
                ستُدرج كلمتك للأبد في جدار ملاك الكلمات الشهير التفاعلي بالمنصة ليبقى معلماً أدبياً شاهداً على روعة تفاصيلك وقصصك الإنسانية وملامحك الشاعرية.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Milestone Dedication Engine (Unique features) */}
        <div className="lg:col-span-5 bg-stone-50/80 border border-stone-200/70 p-5 rounded-2xl space-y-4 text-right">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-600 font-bold block bg-amber-50 py-1 px-2.5 rounded border border-amber-200 w-max ml-0">بواعث وأغراض التملك</span>
            <p className="text-xs font-bold text-stone-800">اختر باعث تملكك وشاهد كيف يُوثق صكك عاطفياً:</p>
          </div>

          {/* Interactive buttons rows */}
          <div className="grid grid-cols-2 gap-2">
            {EMOTIONAL_INTENTS.map((intent) => {
              const IconComp = intent.icon;
              const isSelected = selectedIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`p-3 rounded-xl border text-right transition-all duration-300 transition-scale ${
                    isSelected
                      ? `${intent.color} ring-2 ring-amber-500/10 scale-102 font-bold bg-white`
                      : 'border-stone-200 hover:border-stone-300 bg-white/50 text-stone-500 hover:text-stone-700'
                  }`}
                  id={`intent-btn-${intent.id}`}
                >
                  <div className="flex items-center justify-between pointer-events-none mb-1">
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span className="text-[9px] font-mono opacity-80 uppercase leading-none">{intent.subLabel.split(' ')[0]}</span>
                  </div>
                  <span className="text-[11px] block leading-snug">{intent.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Details Area */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 min-h-[90px] flex flex-col justify-between relative overflow-hidden shadow-3xs">
            <div className="space-y-1 pb-2">
              <span className="text-[10px] text-amber-850 font-extrabold block">كيف يتم دمجه في صك الملكية؟</span>
              <p className="text-[11px] text-stone-600 leading-relaxed font-sans">{activeIntent.description}</p>
            </div>

            {/* Custom visual wax stamp representing the exact dedication */}
            <div className="flex items-center justify-between border-t border-stone-150 pt-2 shrink-0">
              <span className="text-[9px] text-stone-400">تمثيل الختم المدمج برأس الورقة</span>
              <div className="relative w-18 h-6 bg-amber-50 border border-amber-200/60 rounded flex items-center justify-center p-0.5 select-none">
                <span className="text-[9px] text-amber-800 font-extrabold font-serif-arabic animate-pulse">
                  {activeIntent.stampText}
                </span>
                <div className="absolute inset-0 rounded border border-dashed border-amber-400/10 pointer-events-none"></div>
              </div>
            </div>
          </div>

          <div className="text-[9.5px] text-stone-500 leading-normal text-center bg-stone-100/50 p-2.5 rounded-lg border border-stone-200/60">
            * عند قيامك بالبحث والشراء في ديوان الكلمات، يمكنك اختيار أحد هذه البواعث الأربعة ليُختم به صك حيازتك وتحليلك الوجداني الفاخر للأبد.
          </div>
        </div>

      </div>
    </div>
  );
}
