import React, { useRef, useState } from 'react';
import { WordRecord } from '../types';
import { Award, Share2, Printer, X, Gift, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  record: WordRecord;
  onClose?: () => void;
  standalone?: boolean;
}

export default function Certificate({ record, onClose, standalone = false }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    const printContent = certRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl" lang="ar">
            <head>
              <title>شهادة ملكية الكلمة - ${record.word}</title>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;950&display=swap" />
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body {
                  font-family: 'Cairo', sans-serif;
                  background-color: #ffffff;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @media print {
                  @page {
                    size: landscape;
                    margin: 0;
                  }
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="w-[800px] p-2 bg-white">
                ${printContent}
              </div>
              <script>
                setTimeout(() => {
                  window.print();
                }, 800);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleShare = () => {
    const shareText = `أمتلكُ اليوم رمزياً كلمة "${record.word}" باللغة العربية عبر منصة كِلْمَتِي! روعتها البلاغية: ${record.quote}`;
    const shareUrl = `${window.location.origin}?word=${encodeURIComponent(record.word)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `ملكية كلمة: ${record.word}`,
        text: shareText,
        url: shareUrl,
      })
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        navigator.clipboard.writeText(`${shareText} - شاهده هنا: ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - شاهده هنا: ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={`flex flex-col items-center max-w-4xl mx-auto w-full ${standalone ? '' : 'p-2'}`}>
      
      {/* Action toolbox */}
      <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-neutral-100">
        <div className="flex items-center gap-2 font-sans">
          {record.isGift ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-semibold text-rose-600 animate-pulse">
              <Gift className="w-3.5 h-3.5" />
              هذه كلمة مُهداة بقلبٍ صافٍ
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-amber-700">
              <Award className="w-3.5 h-3.5" />
              تم حجز وتملك الكلمة بنجاح
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-sans">
          {copied ? (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all duration-200"
              id={`share-btn-${record.id}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              تم نسخ الرابط!
            </button>
          ) : (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer"
              title="مشاركة الرابط والشهادة"
              id={`share-btn-${record.id}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              مشاركة الكلمة
            </button>
          )}
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer"
            title="تحميل أو طباعة نسخة ورقية فخمة"
            id={`print-btn-${record.id}`}
          >
            <Printer className="w-3.5 h-3.5" />
            طباعة الشهادة الفخمة
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 transition cursor-pointer"
              id={`close-btn-${record.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Decorative Landscape Certificate View */}
      <div 
        ref={certRef}
        className="w-full relative transition-all duration-300"
      >
        {(() => {
          const activeTheme = record.theme || 'gold';
          const themesMap = {
            gold: {
              containerBg: "bg-[#faf6eb]",
              borderClass: "border-[#d8bc74]/60",
              innerBorderClass: "border-[#d4af37]/30",
              labelColor: "text-[#8c6b12]",
              titleColor: "text-[#111111]",
              ownerLabelBg: "bg-white/90",
              ownerLabelBorder: "border-[#e9dbb5]/60",
              ownerNameText: "text-neutral-900",
              wordColor: "text-[#8c6b12]",
              wordSubText: "text-[#8c6b12]",
              certIdBg: "bg-white/80",
              certIdBorder: "border-[#eddcb3]/50",
              certIdText: "text-neutral-800",
              sealBg: "bg-[#fdfbf7]",
              sealBorder: "border-[#d4af37]",
              sealText: "text-[#8c6b12]",
              signatureColor: "text-[#8c6b12]",
              accentBarGradient: "from-amber-400 via-yellow-500 to-amber-600"
            },
            emerald: {
              containerBg: "bg-[#f2faf7]",
              borderClass: "border-[#a3dfca]/60",
              innerBorderClass: "border-[#059669]/25",
              labelColor: "text-[#065f46]",
              titleColor: "text-[#0f172a]",
              ownerLabelBg: "bg-white/85",
              ownerLabelBorder: "border-[#c4edd9]/50",
              ownerNameText: "text-emerald-950",
              wordColor: "text-[#047857]",
              wordSubText: "text-[#065f46]",
              certIdBg: "bg-white/70",
              certIdBorder: "border-[#cbf3e1]/50",
              certIdText: "text-emerald-950",
              sealBg: "bg-[#f4fbf9]",
              sealBorder: "border-[#059669]",
              sealText: "text-[#065f46]",
              signatureColor: "text-[#059669]",
              accentBarGradient: "from-emerald-400 via-teal-500 to-emerald-600"
            },
            onyx: {
              containerBg: "bg-[#fcfbf9]",
              borderClass: "border-neutral-300",
              innerBorderClass: "border-neutral-400/20",
              labelColor: "text-neutral-500",
              titleColor: "text-neutral-900",
              ownerLabelBg: "bg-neutral-100/90",
              ownerLabelBorder: "border-neutral-300",
              ownerNameText: "text-neutral-900",
              wordColor: "text-neutral-900",
              wordSubText: "text-neutral-900",
              certIdBg: "bg-neutral-100/90",
              certIdBorder: "border-neutral-250",
              certIdText: "text-neutral-600",
              sealBg: "bg-neutral-100",
              sealBorder: "border-neutral-400",
              sealText: "text-neutral-700",
              signatureColor: "text-neutral-800",
              accentBarGradient: "from-neutral-400 via-neutral-500 to-neutral-700"
            },
            sapphire: {
              containerBg: "bg-[#f4f7fc]",
              borderClass: "border-[#adc5ec]/60",
              innerBorderClass: "border-[#1d4ed8]/25",
              labelColor: "text-[#005792]",
              titleColor: "text-[#0f172a]",
              ownerLabelBg: "bg-white/85",
              ownerLabelBorder: "border-[#d0def3]/50",
              ownerNameText: "text-blue-950",
              wordColor: "text-[#005792]",
              wordSubText: "text-[#005792]",
              certIdBg: "bg-white/70",
              certIdBorder: "border-[#d8e3f4]/50",
              certIdText: "text-blue-950",
              sealBg: "bg-[#fafdff]",
              sealBorder: "border-[#005792]",
              sealText: "text-[#005792]",
              signatureColor: "text-[#005792]",
              accentBarGradient: "from-blue-400 via-indigo-500 to-blue-600"
            },
            ruby: {
              containerBg: "bg-[#fdf5f5]",
              borderClass: "border-[#efa9a9]/60",
              innerBorderClass: "border-[#b91c1c]/25",
              labelColor: "text-[#991b1b]",
              titleColor: "text-[#1d1010]",
              ownerLabelBg: "bg-white/85",
              ownerLabelBorder: "border-[#f6cfcf]/50",
              ownerNameText: "text-rose-950",
              wordColor: "text-[#b91c1c]",
              wordSubText: "text-[#991b1b]",
              certIdBg: "bg-white/70",
              certIdBorder: "border-[#fbdcdb]/50",
              certIdText: "text-rose-950",
              sealBg: "bg-[#fffafa]",
              sealBorder: "border-[#b91c1c]",
              sealText: "text-[#991b1b]",
              signatureColor: "text-[#b91c1c]",
              accentBarGradient: "from-red-400 via-rose-500 to-red-600"
            }
          };
          const styles = themesMap[activeTheme] || themesMap.gold;

          return (
            <div className={`relative p-6 md:p-8 ${styles.containerBg} border-8 border-double ${styles.borderClass} rounded-[24px] shadow-2xl transition-all duration-300 overflow-hidden select-none max-w-3xl mx-auto text-right`}>
              
              {/* Top aesthetic style accent line bar */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${styles.accentBarGradient}`}></div>

              {/* Inner Styled Border Line Frame */}
              <div className={`absolute inset-2.5 border ${styles.innerBorderClass} rounded-[16px] pointer-events-none`}></div>

              {/* Landscape grid containing metadata left & info right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                
                {/* Column 1: Certificate Text Content (cols-7) */}
                <div className="md:col-span-7 space-y-4 font-sans">
                  <div className="space-y-1">
                    <h2 className={`text-2xl md:text-3xl font-extrabold ${styles.titleColor} tracking-wide`}>
                      شهادة ملكية
                    </h2>
                    <div className={`text-[9px] ${styles.labelColor} font-bold uppercase tracking-widest flex items-center gap-1.5`}>
                      <span>Certificate of Ownership</span>
                      <span className={`w-8 h-[1px] ${styles.labelColor === 'text-white' ? 'bg-amber-300/45' : 'bg-current opacity-40'}`}></span>
                      <span>ديوان الحروف</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] opacity-75 font-medium text-neutral-500">
                      يُشهَد بأن الأديب / والمالك الوجداني:
                    </p>
                    <h3 className={`text-xl md:text-2xl font-black ${styles.ownerNameText} tracking-tight leading-none ${styles.ownerLabelBg} p-2 border ${styles.ownerLabelBorder} inline-block rounded-xl`}>
                      {record.owner}
                    </h3>
                    <p className="text-[11px] opacity-75 font-medium text-neutral-500">
                      قد تفرّد وحاز السيادة الرمزية الكاملة للفظ العربي الأصيل:
                    </p>
                  </div>

                  {/* Verified Badge and digital signature row */}
                  <div className="pt-3 flex items-center justify-between gap-4 border-t border-neutral-150">
                    
                    {/* Platform Signature of Kilemati */}
                    <div className="space-y-1 text-right shrink-0">
                      <span className="block text-[8px] font-bold text-neutral-450">التوقيع الرقمي للمنصة</span>
                      <div className="h-6 flex items-center justify-start">
                        {/* Seamless Vector Calligraphic signature flow */}
                        <svg className={`w-20 h-7 ${styles.signatureColor}`} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M10,18 C25,5 35,28 50,12 C60,25 75,5 85,18 C90,22 93,10 95,15" />
                          <path d="M15,22 Q50,4 85,24" strokeWidth="1" strokeDasharray="2 2" />
                        </svg>
                      </div>
                      <span className="block text-[8px] font-bold text-[#8c6b12]">منصة كِلْمَتِي الموثقة</span>
                    </div>

                    {/* Date & Registry info */}
                    <div className="text-left shrink-0">
                      <span className="block text-[8px] font-bold text-neutral-450">تاريخ التوثيق</span>
                      <span className="block text-[10px] font-bold mt-1 text-neutral-800">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Word Focus & Golden Seal (cols-5) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-neutral-150 pt-4 md:pt-0 md:pr-6 text-center space-y-4">
                  
                  {/* Star Ornament logo */}
                  <div className={`${styles.signatureColor} text-xs font-semibold select-none flex items-center gap-1 justify-center`}>
                    <span>✦</span>
                    <span className="text-[10px] tracking-widest font-extrabold uppercase">اللفظ المحجوز</span>
                    <span>✦</span>
                  </div>

                  {/* Styled Word displays elegant gold colors */}
                  <div className="py-1">
                    <h4 className={`text-4xl md:text-5xl font-black ${styles.wordColor} tracking-wide leading-none select-all drop-shadow-sm font-serif-arabic`}>
                      {record.word}
                    </h4>
                  </div>

                  {/* Balanced box container for Certificate Number ID directly */}
                  <div className={`${styles.certIdBg} border ${styles.certIdBorder} rounded-xl px-4 py-1.5 text-center w-full max-w-[210px] shadow-3xs`}>
                    <span className={`block text-[8px] font-bold uppercase tracking-wider mb-0.5 ${styles.labelColor}`}>
                      رقم الصك السحابي
                    </span>
                    <span className={`block font-mono text-[9px] font-bold tracking-wider ${styles.certIdText}`}>
                      OWN-{record.id.toUpperCase().substring(0, 10)}
                    </span>
                  </div>

                  {/* Real Traditional Gold Round Seal Stamp */}
                  <div className="flex justify-center pt-0.5">
                    <div className={`relative flex items-center justify-center w-[74px] h-[74px] rounded-full border-2 ${styles.sealBorder} ${styles.sealBg} shadow-sm shrink-0`}>
                      <div className={`absolute inset-0.5 rounded-full border border-dashed ${styles.sealBorder}/80`}></div>
                      <div className={`text-center text-[7px] font-extrabold ${styles.sealText} flex flex-col items-center justify-center leading-none`}>
                        <span className="text-[8px] scale-90 mb-0.5 tracking-tight">ختم الحروف</span>
                        <span className="text-[6px] tracking-widest my-0.5">★ ★ ★</span>
                        <span className="scale-85 text-[6.5px]">ديوان كِلْمَتِي</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          );
        })()}
      </div>

      {/* Modern, extremely gorgeous backing information and AI-generated text beneath */}
      <div className="w-full max-w-2xl mx-auto mt-6 bg-[#fafafa]/90 border border-neutral-200/50 rounded-2xl p-5 md:p-6 space-y-5 text-right font-sans shadow-sm">
        <h5 className="text-xs font-extrabold text-neutral-700 border-b border-neutral-200 pb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>سجل البيان وتراجم المفهوم اللغوي المعتمد:</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-neutral-600 leading-relaxed">
          <div className="space-y-1.5">
            <span className="font-bold text-neutral-800 text-[11px] block">الجوهر والمعنى البليغ للفظ:</span>
            <p className="text-justify">{record.meaning || 'يجري حالياً الكشف التلقائي عن خلاصة الفصاحة...'}</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-neutral-800 text-[11px] block">الرواية الرمادية والولادة:</span>
            <p className="text-justify">{record.story || 'شغف وحنين الكلمة بين طيات كبار اللغويين...'}</p>
          </div>
        </div>

        {/* Quote Block */}
        <div className="bg-white p-3 border border-neutral-150/40 rounded-xl text-center space-y-1">
          <span className="block text-[9.5px] text-neutral-400 font-semibold">الاقتباس الأدبي الملازم</span>
          <p className="text-xs font-bold text-neutral-800 italic">" {record.quote || 'إن البيان ليدرك طي العيون صمتاً'} "</p>
        </div>

        {record.isGift && record.giftMessage && (
          <div className="p-3 bg-rose-50/50 border border-rose-100/40 rounded-xl text-right">
            <span className="text-[10px] text-rose-800 font-bold block mb-1">رسالة الإهداء المرفقة:</span>
            <p className="text-xs text-rose-700 italic font-sans leading-relaxed">"{record.giftMessage}"</p>
          </div>
        )}
      </div>

    </div>
  );
}
