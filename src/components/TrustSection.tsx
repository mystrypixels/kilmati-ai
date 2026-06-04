import React from 'react';
import { Sparkles, Layout, Database, Compass, Quote, User } from 'lucide-react';

export default function TrustSection() {
  const features = [
    {
      title: "توليد الوصف الأدبي",
      desc: "صياغة تعابير بلاغية ووجدانية تصف جوهر اللفظ وأبعاده اللغوية العميقة بلمسة ذكية فورية.",
      icon: Sparkles,
      iconClass: "text-[#B8891B] bg-amber-50"
    },
    {
      title: "تصميم شهادة رقمية فاخرة",
      desc: "تهيئة بطاقة جمالية عالية الجودة بروابط مشاركة وبأنماط فنية ساحرة مستوحاة من التاريخ العربي العريق.",
      icon: Layout,
      iconClass: "text-emerald-700 bg-emerald-50"
    },
    {
      title: "أرشفة وحفظ المبادرة الرقمية",
      desc: "تسجيل حجز كلمتك لمنع التكرار ودعم فكرة توثيق وحيازة الألفاظ الوجدانية في فهرس الديوان.",
      icon: Database,
      iconClass: "text-blue-700 bg-blue-50"
    },
    {
      title: "تجربة تفاعلية وبحث بلاغي",
      desc: "مشاركة كلمتك على الخريطة اليدوية والتفاعل مع شبكة العلاقات اللغوية الحية لعشاق لغة الضاد.",
      icon: Compass,
      iconClass: "text-rose-700 bg-rose-50"
    }
  ];

  const testimonials = [
    {
      name: "عبد الرحمن الشمري",
      role: "مهتم بالأدب واللغة",
      rating: 4,
      initials: "ع ش",
      avatarBg: "bg-amber-50 text-amber-800 border-amber-200/40",
      quote: "كانت تجربة ممتعة وفكرة مختلفة. الفكرة لطيفة للغاية لصياغة بطاقة تعبيرية مخصصة للكلمات العربية ومظهرها نظيف وأنيق."
    },
    {
      name: "مريم الفاسي",
      role: "هاوية لغة وصناعة محتوى",
      rating: 5,
      initials: "م ف",
      avatarBg: "bg-amber-50 text-amber-800 border-amber-200/40",
      quote: "تصاميم الشهادات المتوفرة جميلة جداً ومستوحاة من تراثنا. صغت كلمة كهدية لصديقتي وجاء النمط كلاسيكي وبليغ للغاية."
    },
    {
      name: "خالد يوسف",
      role: "مدرس متقاعد",
      rating: 4,
      initials: "خ ي",
      avatarBg: "bg-amber-50 text-amber-800 border-amber-200/40",
      quote: "فكرة ممتازة وتطبيقها غاية في البساطة. يعطي صياغة نثرية سريعة وممتازة تفيد كبطاقة تذكارية أو إهداء غير تقليدي."
    }
  ];

  return (
    <section className="space-y-12 pt-20" id="trust-reviews-section">
      {/* What does Kilmati offer? */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-800 font-heading-arabic">
          ماذا يقدم موقع كِلْمَتِي؟
        </h3>
        <p className="text-xs sm:text-sm text-neutral-550 font-medium font-body-arabic max-w-2xl mx-auto leading-relaxed">
          نحن نوفر بيئة فصيحة تجمع بين أصالة الثقافة العربية وإبداع الذكاء الاصطناعي لإنشاء شهادات أدبية خالدة.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const IconComp = feature.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-neutral-150/70 p-6 rounded-[24px] text-right space-y-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-[#B8891B]/40 duration-300 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
              id={`trust-feature-card-${idx}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-100 ${feature.iconClass}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-neutral-800 font-heading-arabic">
                  {feature.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-body-arabic">
                  {feature.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Testimonials divider separator */}
      <div className="pt-8 border-t border-neutral-200/50">
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#B8891B] tracking-wider uppercase bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-full leading-none inline-block">
            قالوا عن كِلْمَتِي
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-neutral-800 font-heading-arabic">
            آراء لبعض زوار ومستخدمي المنصة
          </h4>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, index) => (
            <div 
              key={index}
              className="bg-white/60 backdrop-blur-xs border border-stone-200/60 p-6 rounded-[24px] flex flex-col justify-between text-right space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:bg-white duration-300 transition-all"
              id={`testimonial-card-${index}`}
            >
              <div className="space-y-2">
                <div className="text-amber-500 flex items-center gap-0.5 justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < test.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed italic font-body-arabic">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-100 [direction:rtl]">
                <div className={`w-9 h-9 rounded-full ${test.avatarBg} border flex items-center justify-center text-xs font-bold font-heading-arabic`}>
                  {test.initials}
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-neutral-800 font-heading-arabic">{test.name}</span>
                  <span className="block text-[10px] text-neutral-400 font-medium font-body-arabic">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
