import React from 'react';
import { BookOpen, Sparkles, Heart, Compass, History, ShieldAlert } from 'lucide-react';

export default function OurStory() {
  return (
    <section id="our-story-section" dir="rtl" className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-10 text-right space-y-8 relative overflow-hidden shadow-xs">
      {/* Decorative top corner elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-stone-100/80 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Editorial Header */}
      <div className="border-b border-stone-100 pb-5 space-y-2">
        <div className="flex items-center gap-2 justify-start">
          <span className="text-[10px] text-amber-850 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            رواية الرحلة ✦ Our Story
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-neutral-800 font-sans leading-tight">
          كيف وُلدت فكرة ديوان "كِلْمَتِي"؟
        </h3>
        <p className="text-xs text-neutral-500 font-medium font-mono leading-none">
          The heritage of preserving linguistic milestones forever
        </p>
      </div>

      {/* Narrative grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Right column: Graphic illustration of standard ink quill or luxury book wrapper */}
        <div className="lg:col-span-4 bg-gradient-to-tr from-stone-50 to-amber-50/20 border border-stone-200/60 rounded-2xl p-6 space-y-4 text-center relative group">
          <div className="w-16 h-16 bg-white border border-stone-150 rounded-2xl flex items-center justify-center mx-auto shadow-3xs">
            <Heart className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-800">شغف لا يدركه الفناء</h4>
            <p className="text-[11px] text-neutral-500 leading-normal">
              حفظنا حتى الآن مئات الكلمات التي أثرت شغاف قلوب الأدباء وألهمت حكايات الأحباب الكرام.
            </p>
          </div>

          <div className="bg-neutral-900 text-white rounded-xl p-3.5 space-y-1 text-right">
            <span className="text-[9.5px] text-amber-400 font-bold block uppercase leading-none">أثر باقٍ ومديد</span>
            <span className="text-[11px] leading-relaxed block text-stone-300">
              "الكلمات لست عبارات عابرة، بل هي قوالب سكنية لمشاعرنا، نسجلها لنبقي دقات قلوبنا حية في جدار الزمن."
            </span>
          </div>
        </div>

        {/* Left column: Historical storytelling prose */}
        <div className="lg:col-span-8 space-y-5 leading-relaxed text-sm text-neutral-600">
          <p className="font-serif-arabic font-medium text-stone-850">
            نشأت منصة <strong className="text-amber-800 font-black">ديوان كِلْمَتِي™</strong> من قلب ولعنا بلغة الضاد، وعقيدة راسخة بأن المفردات تحمل جرسًا عاطفيًا فريدًا لا يضمحل. وعبر هذه التجربة نمنح كل محب للضاد زاوية ملكية فريدة.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50 space-y-1 text-right">
              <span className="text-xs font-bold text-neutral-800 flex items-center justify-start gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                لماذا الكلمات؟
              </span>
              <p className="text-xs text-neutral-500 leading-normal">
                لأننا عندما نستملك كلمة، فإننا نمنحها موطناً في سيرتنا ونطهرها من عبث النسيان والاندثار. إنها تذكرة متوهجة نعود إليها حباً وتقديرًا.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50 space-y-1 text-right">
              <span className="text-xs font-bold text-neutral-800 flex items-center justify-start gap-1.5">
                <History className="w-4 h-4 text-amber-600" />
                رؤيتنا ورسالتنا
              </span>
              <p className="text-xs text-neutral-500 leading-normal">
                تأسيس أكبر جدار أدبي وتراكمي مفتوح للكلمات على الويب العربي، محمي من التكرار والتدليس، كمعلم يتصفحه أجيال القراء بتباهٍ وفخر.
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-neutral-500 pt-2 border-t border-stone-100">
            فلسفتنا لا ترمي لبيع اللغة، فاللغة ملك للجميع؛ بل نبيع **مساحة تخليد واعتراف وتملك استثنائي** على خريطة ديواننا السحابي، ليكون لك صك حقيقي تعتز به أو تهديه لأغلى من يسكن في فؤادك.
          </p>
        </div>

      </div>
    </section>
  );
}
