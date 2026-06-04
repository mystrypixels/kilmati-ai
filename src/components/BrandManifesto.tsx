import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Landmark, Sunrise, Award, BookOpen, Gift, ShieldCheck } from 'lucide-react';

const EMOTIONAL_INTENTS = [
  {
    id: 'story',
    label: 'قصة شخصية',
    subLabel: 'Personal Journey',
    color: 'border-amber-300 hover:border-amber-500 bg-amber-50/20 text-amber-900',
    icon: Landmark,
    description: 'توثيق كلمة تختصر فصلاً من حياتك، أو كفاحاً توجته بالانتصار لتخليد الأثر.',
    stampText: 'سِجِلّ العِزّة'
  },
  {
    id: 'memory',
    label: 'تخليد ذكرى',
    subLabel: 'Honor a Memory',
    color: 'border-purple-300 hover:border-purple-500 bg-purple-50/20 text-purple-900',
    icon: BookOpen,
    description: 'تخليد أثر باقٍ لشخص ممتد في الذاكرة، أو مناسبة كانت مطلع الوفاء والمحبة.',
    stampText: 'رَسْم الوَفَاء'
  },
  {
    id: 'becoming',
    label: 'أثر وتطلع',
    subLabel: 'Future Aspirations',
    color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 text-emerald-900',
    icon: Sunrise,
    description: 'ربط نفسك بعهد أو سمة شخصية قررت غرسها بنضوج؛ كالجلد أو الصبر الحكيم.',
    stampText: 'عهدُ الطُّمُوح'
  },
  {
    id: 'gift',
    label: 'إهداء نادر',
    subLabel: 'Unique Gift',
    color: 'border-rose-300 hover:border-rose-500 bg-rose-50/20 text-rose-900',
    icon: Gift,
    description: 'إهداء شخص غالي صك تمليك رمزي فخم يدوم باسمه ويشهد على عمق وخصائص المودة.',
    stampText: 'نَبْض الوَجْدِ'
  }
];

export default function BrandManifesto() {
  const [selectedIntent, setSelectedIntent] = useState<string>('story');
  const activeIntent = EMOTIONAL_INTENTS.find(i => i.id === selectedIntent) || EMOTIONAL_INTENTS[0];

  return (
    <div dir="rtl" className="bg-gradient-to-tr from-[#fcfbfa] to-[#faf6f0] rounded-3xl p-6 md:p-8 text-neutral-800 relative overflow-hidden shadow-xs border border-stone-200/80">
      {/* Decorative ambient lights representing luxury */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Corner borders */}
      <div className="absolute inset-4 pointer-events-none rounded-[20px] border border-stone-200/40"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Side: Shortened Manifesto + Merged Story (col-span-7) */}
        <div className="lg:col-span-7 space-y-5 text-right p-2">
          <div className="flex items-center gap-2 justify-start">
            <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              مِيثاق الحِيَازَة الأَبَدِيَّة وقِصَّتُنا
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-stone-900 font-sans leading-tight">
              الأسطورة العاطفية للحرف ورسالة منصة كلمتي
            </h2>
          </div>

          {/* Poetic yet highly consolidated paragraphs (shrunk by 50%+) */}
          <div className="space-y-3 text-stone-700">
            <p className="text-xs md:text-sm leading-relaxed text-stone-850 font-medium">
              نشأ <strong className="text-amber-800 font-black">ديوان كِلْمَتِي™</strong> من شغف كوني بلغة الضاد ورسالة وجدانية تخلّد الكلمات والصفات النبيلة. نحن لا نبيع مفردات اللغة؛ بل نمنح الأحباب والأدباء <strong>مساحة اعتراف، وتوثيق رمزي حقيقي لمشاعرهم</strong> ضد التكرار والضياع.
            </p>
          </div>

          {/* Core Mini-Story Merged Grid (shrunk & consolidated) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-200/50 space-y-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 justify-start">
                <Heart className="w-3.5 h-3.5 text-amber-600" />
                لماذا تملك الكلمات؟
              </span>
              <p className="text-[11px] text-stone-500 leading-normal">
                لنمنح مفرداتنا الأثيرة موطناً هادئاً يقيها عادية النسيان، لتتوارثها الأجيال كصكٍ أدبي ناصع.
              </p>
            </div>

            <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-200/50 space-y-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 justify-start">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                عهد الموثوقية والرؤية
              </span>
              <p className="text-[11px] text-stone-500 leading-normal">
                حماية الحروف الأدبية بسجلات سحابية آمنة خالية من السهو، لتأسيس أعظم حائط تخليد عربي.
              </p>
            </div>
          </div>

          {/* Micro announcement footer card */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-900">
              كل حيازة تُخلّد للأبد في جدار الحائط العام (Owners Wall) وتكتسب رقماً عالمياً فريداً.
            </span>
          </div>
        </div>

        {/* Right Side: Interactive Intent Picker (col-span-4 or 5) */}
        <div className="lg:col-span-5 bg-stone-50/90 border border-stone-200/60 p-4 rounded-2xl space-y-3 text-right">
          <div className="space-y-0.5">
            <span className="text-[9px] text-[#8c6b12] font-black uppercase tracking-wider">دليل بواعث الحيازة</span>
            <p className="text-xs font-bold text-stone-800">اختر الغرض وشاهد دمجه التلقائي في وثيقتك:</p>
          </div>

          {/* Interactive button rows */}
          <div className="grid grid-cols-2 gap-1.5">
            {EMOTIONAL_INTENTS.map((intent) => {
              const IconComp = intent.icon;
              const isSelected = selectedIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => setSelectedIntent(intent.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all duration-300 ${
                    isSelected
                      ? `${intent.color} ring-2 ring-amber-500/10 scale-102 font-bold bg-white`
                      : 'border-stone-200 hover:border-stone-300 bg-white/50 text-stone-500 hover:text-stone-700'
                  }`}
                  id={`intent-btn-${intent.id}`}
                >
                  <div className="flex items-center justify-between pointer-events-none mb-0.5">
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                  </div>
                  <span className="text-[10.5px] block leading-none">{intent.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Detail representation */}
          <div className="bg-white p-3 rounded-xl border border-stone-200/80 min-h-[75px] flex flex-col justify-between relative overflow-hidden shadow-3xs">
            <div className="space-y-0.5">
              <span className="text-[9.5px] text-amber-800 font-extrabold block">كيف يُدمج في صك الحيازة؟</span>
              <p className="text-[10.5px] text-stone-500 leading-relaxed">{activeIntent.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-stone-150 pt-2 mt-2 shrink-0">
              <span className="text-[8.5px] text-stone-400">شعار الختم بأعلى الصك:</span>
              <div className="relative w-18 h-5.5 bg-amber-50 border border-amber-200/50 rounded flex items-center justify-center p-0.5 select-none">
                <span className="text-[8.5px] text-amber-800 font-extrabold font-serif-arabic">
                  {activeIntent.stampText}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
