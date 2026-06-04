import React from 'react';
import { Search, CreditCard, Award, ArrowUpLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function HowItWorks() {
  return (
    <div className="bg-neutral-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl border border-neutral-800">
      {/* Decorative ambient spots */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative text-center space-y-3 mb-10 md:mb-12">
        <h3 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-amber-400">
          كيف يعمل ديوان كِلْمَتِي؟
        </h3>
        <p className="text-xs text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
          ثلاث خطوات بسيطة للغاية تفصلك عن تصميم وثيقتك اللغوية وتوثيقها في السجل العام بشهادة رقمية فاخرة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center space-y-4 p-4 relative group" id="how-it-works-step-1">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/80 text-amber-400 group-hover:scale-110 transition duration-300">
            <Search className="w-6 h-6" />
            <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-amber-500/90 text-neutral-950 font-bold rounded-full text-[11px] flex items-center justify-center">
              01
            </span>
          </div>
          <div className="space-y-1.5 px-2">
            <h4 className="text-sm font-bold text-neutral-200 font-sans">01. ابحث في الديوان</h4>
            <p className="text-[11.5px] text-neutral-400 font-sans leading-relaxed">
              ابحث عن أي كلمة عربية تلامس قلبك. تحقق من توفر وحالة الحجز فوراً وشاهد السعر التقديري حسب أهميتها ونمطها المحدد.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center space-y-4 p-4 relative group" id="how-it-works-step-2">
          {/* Connecting arrow line on desktop */}
          <div className="hidden md:block absolute top-7 -right-[15%] w-[30%] h-[1px] border-t border-dashed border-neutral-700 pointer-events-none"></div>
          
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/80 text-amber-400 group-hover:scale-110 transition duration-300">
            <CreditCard className="w-6 h-6" />
            <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-amber-500/90 text-neutral-950 font-bold rounded-full text-[11px] flex items-center justify-center">
              02
            </span>
          </div>
          <div className="space-y-1.5 px-2">
            <h4 className="text-sm font-bold text-neutral-200 font-sans">02. أكمل الطلب مباشرة</h4>
            <p className="text-[11.5px] text-neutral-400 font-sans leading-relaxed">
              أكمل عملية التسجيل والدفع الآمن عبر PayPal أو بطاقتك لتأكيد طلبك وتوليد خصائص الشهادة مباشرة بنقرة واحدة.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center space-y-4 p-4 relative group" id="how-it-works-step-3">
          {/* Connecting arrow line on desktop */}
          <div className="hidden md:block absolute top-7 -right-[15%] w-[30%] h-[1px] border-t border-dashed border-neutral-700 pointer-events-none"></div>

          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/80 text-amber-400 group-hover:scale-110 transition duration-300">
            <Award className="w-6 h-6" />
            <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-amber-500/90 text-neutral-950 font-bold rounded-full text-[11px] flex items-center justify-center">
              03
            </span>
          </div>
          <div className="space-y-1.5 px-2">
            <h4 className="text-sm font-bold text-neutral-200 font-sans">03. استلام الشهادة الرقمية</h4>
            <p className="text-[11.5px] text-neutral-400 font-sans leading-relaxed">
              احصل على شهادتك الأدبية الرقمية الفاخرة مصاغة بالذكاء الاصطناعي بالنمط المختار. شاركها، حملها، أو قدمها كهدية مخصصة تبقى خالدة لمن تحب.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badge Trust indicator */}
      <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-center gap-6 text-[10.5px] text-neutral-400 font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          معالج بواسطة نظام PayPal ومؤمن بالكامل
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 animate-pulse" />
          توليد أدبي فوري بدعم الذكاء الاصطناعي
        </span>
      </div>
    </div>
  );
}
