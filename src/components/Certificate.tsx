import React, { useRef, useState } from 'react';
import { WordRecord } from '../types';
import { Award, Share2, Printer, X, Gift, ShieldCheck, Instagram, Download, Copy, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';

interface CertificateProps {
  record: WordRecord;
  onClose?: () => void;
  standalone?: boolean;
}

export default function Certificate({ record, onClose, standalone = false }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const igPostRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [igCopiedText, setIgCopiedText] = useState(false);

  const generateCertificateImage = async () => {
    setIsGenerating(true);
    setInstagramModalOpen(true);
    setGeneratedImageSrc(null);
    try {
      // Small timeout to guarantee DOM rendering stabilizes
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (!igPostRef.current) {
        throw new Error("Instagram target post container ref is not ready.");
      }
      const dataUrl = await toPng(igPostRef.current, {
        quality: 1.0,
        backgroundColor: '#faf6eb',
        width: 1080,
        height: 1080,
        style: {
          transform: 'scale(1)',
          borderRadius: '0px',
          boxShadow: 'none'
        }
      });
      setGeneratedImageSrc(dataUrl);
    } catch (error) {
      console.error('Error generating image for Instagram sharing:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyIGCaption = () => {
    const caption = `أمتلكُ اليوم رمزياً كلمة « ${record.word} » باللغة العربية عبر منصة كِلْمَتِي! ✨📜\n\nالجوهر والمعنى: "${record.meaning}"\nالبيان الشعري: "${record.quote}"\n\nشاهد شهادة توثيقي الحصري عبر الرابط التالي:\n${window.location.origin}?word=${encodeURIComponent(record.word)}\n\n#كلمتي #اللغة_العربية #أدب #فصاحة #لغتي_الجميلة`;
    navigator.clipboard.writeText(caption);
    setIgCopiedText(true);
    setTimeout(() => setIgCopiedText(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImageSrc) return;
    const link = document.createElement('a');
    link.download = `شهادة_ملكية-${record.word}.png`;
    link.href = generatedImageSrc;
    link.click();
  };

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
      ownerLabelBg: "bg-neutral-150/90",
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
      accentBarGradient: "from-blue-400 via-indigo-505 to-blue-600"
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
      accentBarGradient: "from-red-400 via-rose-505 to-red-600"
    }
  };
  const styles = themesMap[activeTheme as keyof typeof themesMap] || themesMap.gold;

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

        <div className="flex items-center gap-2 font-sans flex-wrap sm:flex-nowrap">
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
            onClick={generateCertificateImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-705 hover:to-orange-505 text-white rounded-xl text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer shadow-3xs"
            title="مشاركة صورة الشهادة الفاخرة على إنستجرام"
            id={`instagram-btn-${record.id}`}
          >
            <Instagram className="w-3.5 h-3.5 animate-pulse" />
            <span>مشاركة على إنستقرام 📸</span>
          </button>
          
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
                      رقم الشهادة الرقمية
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
      </div>

      {/* Hidden Instagram Square Post Container for HQ capturing (1080x1080px ratio) */}
      {/* Wrapped in a fixed offscreen bounds container to guarantee Chrome's rendering engine computes all text layouts and typography, preventing blank screenshots */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '200vh', 
          left: '0px', 
          width: '1080px', 
          height: '1080px', 
          zIndex: -100, 
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <div 
          ref={igPostRef}
          style={{ 
            width: '1080px', 
            height: '1080px', 
            boxSizing: 'border-box'
          }}
          className={`${styles.containerBg} flex flex-col justify-between p-14 border-[16px] border-double ${styles.borderClass} text-right select-none font-sans overflow-hidden`}
        >
          {/* Top aesthetic style accent line bar */}
          <div className={`absolute top-0 inset-x-0 h-4 bg-gradient-to-r ${styles.accentBarGradient}`}></div>

          {/* Inner Styled Border Line Frame */}
          <div className={`absolute inset-6 border-2 ${styles.innerBorderClass} rounded-[20px] pointer-events-none`}></div>

          {/* Corner decorative ornaments for the square card */}
          <div className={`absolute top-8 right-8 text-xl ${styles.signatureColor} opacity-70`}>✦</div>
          <div className={`absolute top-8 left-8 text-xl ${styles.signatureColor} opacity-70`}>✦</div>
          <div className={`absolute bottom-8 right-8 text-xl ${styles.signatureColor} opacity-70`}>✦</div>
          <div className={`absolute bottom-8 left-8 text-xl ${styles.signatureColor} opacity-70`}>✦</div>

          {/* BRAND HEADER */}
          <div className="text-center space-y-2 mt-4 font-sans">
            <div className={`text-sm font-extrabold tracking-widest ${styles.labelColor} uppercase flex items-center justify-center gap-2`}>
              <span>✦</span>
              <span>ديوان الحروف العربية الأنيقة</span>
              <span>✦</span>
            </div>
            <h1 className="text-4xl font-black text-neutral-900 font-heading-arabic mt-1">شَهاَدَةُ مِلْكِيّةٍ رَمْزِيّة</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="w-16 h-[1.5px] bg-neutral-300/60"></span>
              <span className={`text-xs font-black ${styles.labelColor}`}>مَنَصَّة كِلْمَتِي ✦ kilmati.com</span>
              <span className="w-16 h-[1.5px] bg-neutral-300/60"></span>
            </div>
          </div>

          {/* CENTER FOCUS: THE WORD & OWNER */}
          <div className="my-auto text-center space-y-8 py-4">
            <div className="space-y-3 font-sans">
              <p className="text-sm tracking-wide text-neutral-500 font-bold font-body-arabic">أُشْهِدَ كَمَا فيِ السِّجِلَّاتِ الرَّقمِيّـةِ لِلْمَنَصَّةِ بِأَنَّ الأَدِيبْ:</p>
              <div className={`inline-block px-12 py-3.5 ${styles.ownerLabelBg} border-2 ${styles.ownerLabelBorder} rounded-2xl shadow-xs`}>
                <h2 className={`text-4xl font-black ${styles.ownerNameText} tracking-tight font-heading-arabic`}>
                  {record.owner}
                </h2>
              </div>
            </div>

            <div className="relative py-4 flex flex-col items-center justify-center font-sans">
              {/* Elegant watermark */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-10">
                <span className="text-[150px] font-black tracking-widest font-serif-arabic font-extrabold select-none">كِلْمَتِي</span>
              </div>
              
              <p className="text-xs text-neutral-400 font-black uppercase tracking-widest mb-3 z-10">قَدْ حَازَ الْسِّيَادَةَ الرَّمْزِيَّةَ الْكَامِلَةَ لِلَفْظِ:</p>
              <div className="z-10 py-1">
                <h3 className={`text-8xl font-black ${styles.wordColor} tracking-wide leading-none drop-shadow-sm font-serif-arabic`}>
                  « {record.word} »
                </h3>
              </div>
            </div>

            {/* Meaning / Quote context wrapper */}
            <div className="max-w-2xl mx-auto space-y-3 bg-[#ffffff]/60 border border-neutral-200/40 rounded-2xl p-5 shadow-xs font-sans">
              <span className={`text-[10px] font-black uppercase tracking-wider ${styles.labelColor}`}>
                الجوهر والمعنى البليغ للفظ
              </span>
              <p className="text-neutral-800 text-sm font-bold font-body-arabic leading-relaxed text-center px-4">
                "{record.meaning || 'يجري حالياً الكشف التلقائي عن خلاصة الفصاحة...'}"
              </p>
              {record.quote && (
                <div className="pt-2 border-t border-dashed border-neutral-350/50">
                  <p className="text-neutral-500 text-xs italic font-medium">✨ "{record.quote}"</p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER: CERT ID, GOLD SEAL & DIGITAL SIGNATURE */}
          <div className="grid grid-cols-3 items-end border-t border-dashed border-neutral-300/70 pt-6 mb-2 font-sans">
            
            {/* Left Column: Cert ID */}
            <div className="text-right space-y-2">
              <div className={`${styles.certIdBg} border ${styles.certIdBorder} rounded-xl px-4 py-2 text-center inline-block shadow-3xs`}>
                <span className={`block text-[9px] font-black uppercase tracking-wider mb-0.5 ${styles.labelColor}`}>
                  رقم التوثيق الرقمي
                </span>
                <span className="block font-mono text-[10px] font-extrabold tracking-wider text-neutral-700">
                  OWN-{record.id.toUpperCase().substring(0, 10)}
                </span>
              </div>
              <div className="text-right pr-2">
                <span className="block text-[10px] font-bold text-neutral-450">تاريخ التوثيق</span>
                <span className="block text-xs font-bold text-neutral-800">{formatDate(record.createdAt)}</span>
              </div>
            </div>

            {/* Center Column: Traditional Gold Seal Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className={`relative flex items-center justify-center w-[100px] h-[100px] rounded-full border-2 ${styles.sealBorder} ${styles.sealBg} shadow-xs`}>
                <div className={`absolute inset-1 rounded-full border border-dashed ${styles.sealBorder}/80`}></div>
                <div className={`text-center text-[9px] font-black ${styles.sealText} flex flex-col items-center justify-center leading-none`}>
                  <span className="text-[10px] scale-90 mb-1 tracking-tight font-heading-arabic">ختم الحروف</span>
                  <span className="text-[8px] tracking-widest my-0.5">★ ★ ★</span>
                  <span className="scale-85 text-[9px] font-heading-arabic">مَنَصَّة كِلْمَتِي</span>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Digital Signature */}
            <div className="text-left flex flex-col items-end space-y-1">
              <span className="block text-[10px] font-bold text-neutral-450">التوقيع الرقمي للمنصة</span>
              <div className="h-10 flex items-center justify-end">
                <svg className={`w-28 h-9 ${styles.signatureColor}`} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10,18 C25,5 35,28 50,12 C60,25 75,5 85,18 C90,22 93,10 95,15" />
                  <path d="M15,22 Q50,4 85,24" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
              <span className="block text-[10px] font-extrabold text-[#8c6b12] font-heading-arabic">ديوان كِلْمَتِي المعتمد</span>
            </div>

          </div>

          {/* BOTTOM EXPLICIT BRAND watermark: Shows website name clearly */}
          <div className="absolute bottom-2 inset-x-0 text-center font-sans">
            <span className="text-[10px] font-black tracking-widest text-[#8c6b12] font-mono uppercase bg-white/95 border border-stone-200 px-5 py-1 rounded-full shadow-3xs">
              صُنِعَتْ وَثِيقَةُ الْفَخْرِ عَبْرَ: kilmati.com ❁ كِلْمَتِي
            </span>
          </div>
        </div>
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

      {/* Instagram Stories / Post Sharing Modal Guidance */}
      {instagramModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 [direction:rtl]">
          <div className="bg-white border border-stone-200 shadow-2xl rounded-[32px] w-full max-w-lg overflow-hidden p-6 md:p-8 space-y-6 relative transition-all duration-300">
            
            {/* Close button */}
            <button
              onClick={() => setInstagramModalOpen(false)}
              className="absolute left-4 top-4 w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title block */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
                <Instagram className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-stone-900 font-heading-arabic">مشاركة الشهادة الفاخرة على إنستقرام 📸</h3>
              <p className="text-xs text-stone-500 font-body-arabic">اتبع الخطوات البسيطة التالية لنشر رونق الكلمة على حسابك الشخصي</p>
            </div>

            {/* Step 1: Image Capture & Download Preview */}
            <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">الخطوة 1: حفظ صورة التملّك</span>
                <span className="text-[10px] text-stone-400 font-mono">JPG / PNG</span>
              </div>
              
              <div className="flex items-center justify-center min-h-[160px] bg-white border border-stone-200 rounded-xl overflow-hidden relative shadow-3xs p-1">
                {isGenerating || !generatedImageSrc ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 space-y-3 text-stone-700">
                    <div className="w-8 h-8 rounded-full border-3 border-amber-600/20 border-t-amber-600 animate-spin" />
                    <span className="text-xs font-bold font-heading-arabic">جاري حياكة وصياغة صورة الشهادة الفاخرة...</span>
                    <span className="text-[10px] text-stone-400">بجودة فائقة الدقة للتواصل</span>
                  </div>
                ) : (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={generatedImageSrc}
                      alt="شهادة ملكية الكلمة لإنستقرام"
                      className="max-h-[160px] w-auto object-contain rounded-lg border border-stone-100 shadow-3xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 duration-200 flex items-center justify-center rounded-lg">
                      <span className="text-xs text-white font-semibold">جاهزة للنشر ✨</span>
                    </div>
                  </div>
                )}
              </div>

              {generatedImageSrc && (
                <button
                  onClick={handleDownloadImage}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-stone-50 rounded-xl text-xs font-black transition duration-200 shadow-3xs cursor-pointer flex items-center justify-center gap-2 font-heading-arabic"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>تحميل الصورة إلى جهازك 📥</span>
                </button>
              )}
            </div>

            {/* Step 2: Copy Caption for Caption / Stories link card */}
            <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl space-y-2 text-right">
              <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 block w-max">الخطوة 2: نسخ الوصف الأدبي</span>
              <p className="text-[11px] text-stone-500 font-body-arabic leading-relaxed pt-1">الوصف البليغ والهاشتاجات المجهزة لمنشورك أو قصتك:</p>
              
              <div className="bg-white p-3 border border-stone-200 rounded-xl relative select-all">
                <p className="text-[11px] font-bold text-stone-800 font-sans leading-relaxed whitespace-pre-wrap select-all">
                  {`أمتلكُ اليوم رمزياً كلمة « ${record.word} » باللغة العربية عبر منصة كِلْمَتِي! ✨📜\n\nالجوهر والمعنى: "${record.meaning}"\nالبيان الشعري: "${record.quote}"\n\n#كلمتي #اللغة_العربية #أدب`}
                </p>
              </div>

              <button
                onClick={handleCopyIGCaption}
                className={`w-full py-2 rounded-xl text-xs font-bold transition duration-200 shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 font-heading-arabic ${
                  igCopiedText
                    ? 'bg-emerald-100 border border-emerald-200 text-emerald-700'
                    : 'bg-white hover:bg-stone-100 border border-stone-250 text-stone-800'
                }`}
              >
                {igCopiedText ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>تم نسخ النص المجهّز! ✦</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الوصف والهاشتاج 📋</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 3: Publish */}
            <div className="bg-amber-50/50 border border-amber-200/50 p-3.5 rounded-2xl flex gap-2.5 items-start">
              <span className="text-base select-none">💡</span>
              <div className="space-y-0.5">
                <span className="block text-xs font-extrabold text-amber-900 font-heading-arabic">الخطوة 3: النشر والمشاركة</span>
                <p className="text-[11px] text-amber-850 font-body-arabic leading-relaxed">
                  افتح تطبيق **إِنْسْتِقْرَام**، وشارك الصورة كمنشور أو قصة (Story)، وألصق النص، وشارك تملّكك الفاخر مع أصدقائك بوضع رابط الموقع! 🌟
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
