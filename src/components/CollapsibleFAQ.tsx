import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
  isImportant?: boolean;
}

export default function CollapsibleFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = [
    {
      question: "هل رسوم تملك الكلمة قابلة للاسترداد؟ (سياسة الاسترداد)",
      answer: "بسبب الطبيعة الفورية والمخصصة كلياً لصك الملكية والتحليل البلاغي الرقمي الفريد الذي يولده نظام الذكاء الاصطناعي، ولأنه يتم حجز الاسم وتعطيل الكلمة في السجل السحابي العام فور السداد فورًا لمنع شخص آخر من تملكها؛ فإن الرسوم المدفوعة تُعتبر نهائية وغير قابلة للاسترداد وتستقر للأبد باسم المالك الأول في ديوان لوحة الملاك الكبرى (WOW) لضمان حصرية الملكية.",
      isImportant: true,
    },
    {
      question: "كيف أحصل على شهادة وصك التوثيق الوجداني؟",
      answer: "بعد إتمام السداد السريع والآمن ببطاقتك الفيزا أو موقع PayPal، يصار إلى توليد وتوثيق لوحة التمليك الفاخرة فورياً. ستحصل على بريد ترحيبي برابط تشاركي رسمي لعرض الصك على الأصدقاء في مجالس الأدب، كما تتاح إمكانية تنزيل اللوحة بصيغة PDF فائقة الدقة مهيأة وجاهزة للطباعة الفاخرة.",
    },
    {
      question: "هل يمكنني تعديل الاسم أو الاقتباس المهدى لاحقاً؟",
      answer: "لا، لا يمكن للأسف تعديل أو تغيير الاسم أو الاقتباس أو الكلمة المستملكة نهائياً بعد إتمام عملية الدفع وصدور صك التوثيق. نظراً لربط الصك والتحليل البلاغي والخطوط بنظام تشفير فوري وثباته تاريخياً في جدار ملاك الكلمات لمنع التلاعب وحفظ حصرية التملك؛ فإن البيانات المسجلة تسكن السحاب بصفة نهائية وأبدية. نهيب بروادنا الكرام فحص ومراجعة كافة الحروف الإملائية بدقة بالغة واختيار الاسم الصحيح بعناية تامة قبل تأكيد الحجز.",
    },
    {
      question: "كيف يتم تصنيف الكلمة وتحديد سعر تملكها؟",
      answer: "لا تعتمد منصتنا الباقات الثابتة التقليدية؛ بل يتم تقييم وتثمين كل كلمة عربية بشكل ديناميكي فريد لتحديد قيمتها العادلة والرمزية التي تبتدئ من 3$ أو 5$ فما فوق. يعتمد التقييم على تصنيف الكلمة السحابي ضمن مجموعات لغوية بليغة (مثل المجموعة الروحانية الأثيرية، البلاغية النادرة، الشاعرية الوجدانية، أو مجموعة السيادة والوقار)، بجانب معايير حروفيّة دقيقة مثل الفخامة الصوتية ومخارج الحروف (كوجود الضاد والصاد والقاف والعين) ومدى قصر وشرف ندرة اللفظ (حيث الكلمات الثنائية والثلاثية تعتبر بمثابة الجواهر النادرة).",
    },
    {
      question: "كيف يمكنني السداد إذا لم يكن لدي حساب PayPal؟",
      answer: "يتيح النظام الدفع المباشر والآمن بواسطة بطاقة الائتمان أو بطاقة الدفع المباشر (Visa / Mastercard / Amex) دون الحاجة لامتلاك حساب على قنوات PayPal؛ ما عليك سوى النقر على زر السداد واختيار خيار الدفع بواسطة البطاقة.",
    },
    {
      question: "ما هو حائط ملاك الكلمات (Word Owners Wall)?",
      answer: "هو جدار أدبي وتفاعلي ممتد عبر الويب لتوثيق قصص وأسماء الأشخاص الذين استملكوا كلماتهم. إنه بمثابة معلم أدبي خالد في تاريخ لغتنا العربية، حيث تبقى كلمتك وقصتها راسخة على جدار المنصة ليتصفحها جميع زوار ديوان كِلْمَتِي في الحاضر والمستقبل.",
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-collapsible-section" dir="rtl" className="bg-[#fdfcf7] border-2 border-stone-200/50 rounded-3xl p-6 md:p-8 text-right space-y-6 relative overflow-hidden shadow-xs">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-stone-150 pb-4 gap-4 w-full">
        <div className="flex items-center gap-3 w-full justify-start">
          <div className="text-right">
            <h3 className="text-base font-extrabold text-neutral-800 font-sans flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              الأسئلة الشائعة وعن آلية الحيازة والتملك
            </h3>
            <p className="text-xs text-neutral-500 font-medium">كل تفاصيل وإجابات ديوان التوثيق الأدبي والعاطفي الموثق</p>
          </div>
        </div>
        <span className="text-[10px] text-amber-850 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full font-bold shrink-0">
          منسدلة تفاعلية
        </span>
      </div>

      {/* Accordion Wrapper */}
      <div className="space-y-3 max-w-4xl mx-auto w-full">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`border rounded-2xl transition hover:shadow-2xs overflow-hidden ${
                isOpen 
                  ? 'border-amber-300 bg-white shadow-3xs' 
                  : item.isImportant 
                    ? 'border-rose-150 bg-rose-50/20'
                    : 'border-stone-200 bg-white/60'
              }`}
            >
              {/* Trigger Button or Bar */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full text-right p-4 md:p-5 flex items-center justify-between gap-4 outline-none focus:ring-1 focus:ring-amber-500/20 transition-all duration-300 pointer"
                id={`faq-trigger-${index}`}
              >
                {/* 1st Child in RTL: Title on the Right */}
                <div className="flex items-center gap-2 text-right">
                  {item.isImportant && (
                    <span className="text-[9px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 font-extrabold leading-none shrink-0">
                      هام! سياسة الاسترداد
                    </span>
                  )}
                  <span className={`text-xs md:text-sm font-bold ${isOpen ? 'text-amber-900' : 'text-neutral-700'}`}>
                    {item.question}
                  </span>
                </div>

                {/* 2nd Child in RTL: Chevron on the Left */}
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </button>

              {/* Explanatory Dropdown view */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="p-4 md:p-5 pt-0 border-t border-stone-100 text-xs text-neutral-600 leading-relaxed font-medium bg-stone-50/30">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-amber-50/40 border border-amber-200/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-right">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-[11px] text-stone-600 leading-normal font-medium">
            <strong>تنويه قانوني عاطفي:</strong> ديوان كِلْمَتِي يقدم حيازة أدبية وذات بعد رمزي عاطفي لملاك ومحبي اللغة ولا يستهدف ممارسة السيادة الإجرائية على قواميس المعاجم العامة الصادرة عن مجامع اللغة الرسمية للبلدان العربية.
          </p>
        </div>
      </div>
    </section>
  );
}
