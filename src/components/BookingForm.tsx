import React, { useState, useEffect } from 'react';
import { SearchResult, WordRecord, CertificateTheme } from '../types';
import { Sparkles, Gift, Check, ArrowRight, User, Mail, Award, AlertCircle, Loader2, CreditCard, ChevronRight, Globe, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { classifyArabicWord, WordClassification } from '../utils';

interface BookingFormProps {
  onSuccess: (newRecord: WordRecord) => void;
  onCancel?: () => void;
  prefilledWord?: string;
}

const themeCards: {
  id: CertificateTheme;
  name: string;
  desc: string;
  previewBg: string;
  borderColor: string;
  accentText: string;
}[] = [
  {
    id: 'gold',
    name: 'الدِّيوَانُ الذَّهَبِيُّ',
    desc: 'ورقة بردي مشبعة ببريق الذهب العتيق والوقار البديع',
    previewBg: 'bg-[#faf6eb]',
    borderColor: 'border-[#d4af37]',
    accentText: 'text-[#8c6b12]',
  },
  {
    id: 'emerald',
    name: 'زُمُرُّدٌ أَنْدَلُسِيٌّ',
    desc: 'قصيدة خطت بماء الزمرد والورع الأندلسي العريق',
    previewBg: 'bg-[#eefcf7]',
    borderColor: 'border-[#10b981]',
    accentText: 'text-[#065f46]',
  },
  {
    id: 'onyx',
    name: 'عَقِيقٌ مُلُوكِيٌّ دَافِئٌ',
    desc: 'نمط معاصر بلون العقيق الأسود اللامع بتبغ كوفي ذهبي',
    previewBg: 'bg-[#1a1a1a]',
    borderColor: 'border-[#666]',
    accentText: 'text-amber-200',
  },
  {
    id: 'sapphire',
    name: 'سَافِيرٌ نَاصِعٌ',
    desc: 'زرقة اليم العميقة في مكاتيب الملوك المعرفية الفاخرة',
    previewBg: 'bg-[#f0f5fc]',
    borderColor: 'border-[#005792]',
    accentText: 'text-[#005792]',
  },
  {
    id: 'ruby',
    name: 'يَاقُوتُ الوَجْدِ الشَّغُوفِ',
    desc: 'حمراء صبغت بدماء النبض والقصة العشقية التي لا تذبل',
    previewBg: 'bg-[#fdf3f3]',
    borderColor: 'border-[#b91c1c]',
    accentText: 'text-[#991b1b]',
  }
];

// Arab countries list for requested formatted profiles
const countriesList = [
  "السعودية",
  "الإمارات",
  "الكويت",
  "قطر",
  "البحرين",
  "عمان",
  "مصـر",
  "الأردن",
  "العراق",
  "فلسطين",
  "لبنان",
  "سوريا",
  "اليمن",
  "السودان",
  "ليبيا",
  "تونس",
  "المغرب",
  "الجزائر",
  "موريتانيا",
  "الصومال",
  "جيبوتي",
  "جزر القمر",
  "أخرى"
];

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  "السعودية": { lat: 24.7136, lng: 46.6753 }, // Riyadh
  "الإمارات": { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
  "الكويت": { lat: 29.3759, lng: 47.9774 }, // Kuwait City
  "قطر": { lat: 25.2854, lng: 51.5310 }, // Doha
  "البحرين": { lat: 26.2285, lng: 50.5860 }, // Manama
  "عمان": { lat: 23.5859, lng: 58.4059 }, // Muscat
  "مصـر": { lat: 30.0444, lng: 31.2357 }, // Cairo
  "الأردن": { lat: 31.9522, lng: 35.2332 }, // Amman
  "العراق": { lat: 33.3152, lng: 44.3661 }, // Baghdad
  "فلسطين": { lat: 31.9522, lng: 35.2332 }, // Jerusalem
  "لبنان": { lat: 33.8547, lng: 35.8623 }, // Beirut
  "سوريا": { lat: 34.8021, lng: 38.9968 }, // Damascus
  "اليمن": { lat: 15.5527, lng: 48.5164 }, // Sana'a
  "السودان": { lat: 15.5007, lng: 32.5599 }, // Khartoum
  "ليبيا": { lat: 26.3351, lng: 17.2283 }, // Tripoli
  "تونس": { lat: 36.8065, lng: 10.1815 }, // Tunis
  "المغرب": { lat: 34.0209, lng: -6.8416 }, // Rabat
  "الجزائر": { lat: 36.7538, lng: 3.0588 }, // Algiers
  "موريتانيا": { lat: 21.0079, lng: -10.9408 }, // Nouakchott
  "الصومال": { lat: 5.1521, lng: 46.1996 }, // Mogadishu
  "جيبوتي": { lat: 11.8251, lng: 42.5903 }, // Djibouti
  "جزر القمر": { lat: -12.1888, lng: 44.2201 }, // Moroni
  "أخرى": { lat: 26.0, lng: 45.0 } // Middle East general center
};

export default function BookingForm({ onSuccess, onCancel, prefilledWord = '' }: BookingFormProps) {
  // Phase logic: 'check' | 'details' | 'payment' | 'submitting'
  const [phase, setPhase] = useState<'check' | 'details' | 'payment'>('check');
  
  // Form State
  const [word, setWord] = useState(prefilledWord);
  const [owner, setOwner] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [country, setCountry] = useState('السعودية');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('السعودية');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Synchronize country selection with coordinate presets
  useEffect(() => {
    const coords = COUNTRY_COORDS[country];
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      setLocationName(country);
    }
  }, [country]);

  const isExcludedCoordinates = (latitude: number, longitude: number) => {
    // Palestine/Israel area bounding box
    if (latitude >= 29.3 && latitude <= 33.6 && longitude >= 34.0 && longitude <= 36.0) {
      return true;
    }
    // Iran area bounding box
    if (latitude >= 25.0 && latitude <= 40.0 && longitude >= 44.0 && longitude <= 63.5) {
      if (latitude > 26.0 && longitude > 45.5) {
        if (longitude > 48.5) {
          return true;
        }
      }
    }
    return false;
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMSG("عذراً، متصفحك أو بيئة المتصفح لا تدعم تحديد المواقع الجغرافية.");
      return;
    }
    setGpsLoading(true);
    setErrorMSG(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = pos.coords.latitude;
        const detectedLng = pos.coords.longitude;
        if (isExcludedCoordinates(detectedLat, detectedLng)) {
          console.log("Detected coordinates inside restricted territory, falling back...");
          const preset = COUNTRY_COORDS[country] || COUNTRY_COORDS["السعودية"];
          setLat(preset.lat);
          setLng(preset.lng);
          setLocationName(`${country} (افتراضي)`);
          setErrorMSG("نظراً لمحدودية النطاق التفاعلي المتاح، تم اعتماد الإحداثيات القياسية للبلد المختار.");
        } else {
          setLat(detectedLat);
          setLng(detectedLng);
          setLocationName(`موقعك الحالي المحدد 🛰️`);
        }
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS identification failed:", err);
        const preset = COUNTRY_COORDS[country] || COUNTRY_COORDS["السعودية"];
        setLat(preset.lat);
        setLng(preset.lng);
        setLocationName(`${country} (افتراضي)`);
        setErrorMSG("تعذر رصد الإحداثيات الحية بدقة؛ تم اعتماد الإحداثيات القياسية للبلد المختار.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme>('gold');

  // Status logs
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const wordClassification = classifyArabicWord(word);
  const activeTierDetails = {
    id: 'dynamic',
    name: wordClassification.category,
    price: wordClassification.finalPrice,
    badge: 'ملكيتي الموثقة',
    desc: wordClassification.categoryDesc,
    features: wordClassification.features
  };

  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  // Load standard PayPal SDK dynamically when on payment screen
  useEffect(() => {
    if (phase !== 'payment') return;

    // Check if script is already added
    const existingScript = document.getElementById('paypal-sdk-script');
    if (existingScript) {
      if ((window as any).paypal) {
        setSdkLoaded(true);
        return;
      }
      existingScript.remove();
    }

    setSdkLoaded(false);
    setSdkError(false);

    // Read the client ID from environment or default to sandbox 'sb' for testing
    const clientId = (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || 'sb';
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    // Dynamic PayPal smart payment button URL config
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;

    script.onload = () => {
      setSdkLoaded(true);
      setSdkError(false);
    };

    script.onerror = (e) => {
      console.error("PayPal SDK failed to load:", e);
      setSdkError(true);
    };

    document.body.appendChild(script);

    return () => {
      const scr = document.getElementById('paypal-sdk-script');
      if (scr) scr.remove();
    };
  }, [phase]);

  // Handle rendering of actual PayPal buttons in the active container element
  useEffect(() => {
    if (!sdkLoaded || !(window as any).paypal || phase !== 'payment') return;

    const el = document.getElementById('paypal-button-container');
    if (!el) return;
    el.innerHTML = ''; // clear any existing children
    
    try {
      (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: activeTierDetails.price.toString()
              },
              description: `توثيق حيازة كلمة « ${word} » في ديوان كِلْمَتِي الموثق`
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          return actions.order.capture().then(async (details: any) => {
            console.log("PayPal payment completed successfully:", details);
            const payerEmail = details.payer?.email_address || ownerEmail;
            await triggerFinalizeBooking(payerEmail);
          });
        },
        onError: (err: any) => {
          console.error("PayPal Smart Button Error:", err);
          setErrorMSG("لم يكتمل سداد القيمة عبر PayPal. يرجى تجربة بطاقة أخرى أو استخدام خيار المحاكاة لتجاوز خطوة السداد.");
        }
      }).render('#paypal-button-container');
    } catch (e) {
      console.error("Failed to render PayPal Smart Buttons:", e);
    }
  }, [sdkLoaded, phase, activeTierDetails.price, word, ownerEmail]);

  // Main submission handler that bypasses forms and records the word in db
  const triggerFinalizeBooking = async (buyerPaypalEmail: string) => {
    setErrorMSG(null);
    setSubmitting(true);
    try {
      const combinedOwner = `${owner.trim()} (${country})`;

      const resp = await fetch('/api/words/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.trim(),
          owner: combinedOwner,
          ownerEmail: ownerEmail.trim(),
          isGift,
          giftMessage: isGift ? giftMessage.trim() : '',
          theme: selectedTheme,
          lat: lat !== null ? lat : (COUNTRY_COORDS[country]?.lat || 24.7136),
          lng: lng !== null ? lng : (COUNTRY_COORDS[country]?.lng || 46.6753),
          locationName: locationName || country,
          category: activeTierDetails.name,
          price: activeTierDetails.price
        })
      });

      const resultData = await resp.json();

      if (!resp.ok) {
        throw new Error(resultData.error || "فشل إتمام حجز وتمليك الكلمة.");
      }

      onSuccess(resultData);
    } catch (err: any) {
      setErrorMSG(err.message || "حدث خطأ غير متوقع أثناء إتمام حجز الكلمة.");
    } finally {
      setSubmitting(false);
    }
  };



  // Search Availability
  const handleCheckWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG(null);
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setErrorMSG("يرجى إدخال كلمة عربية صالحة أولاً للفحص.");
      return;
    }
    
    if (trimmedWord.includes(' ')) {
      setErrorMSG("مفهوم تملك الكلمات ينطبق على كلمة عربية مفردة فريدة، يرجى عدم تضمين مسافات.");
      return;
    }

    setChecking(true);
    try {
      const response = await fetch(`/api/words/search?word=${encodeURIComponent(trimmedWord)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "فشل فحص توافر الكلمة، يرجى المحاولة لاحقاً.");
      }
      
      setSearchResult(data);
      
      if (data.word) {
        setWord(data.word);
      }
      
      if (data.available) {
        setPhase('details');
      } else {
        setErrorMSG(`عذراً، هذه الكلمة (${data.word || trimmedWord}) محجوزة ومملوكة مسبقاً لصالح: ${data.details?.owner}`);
      }
    } catch (e: any) {
      setErrorMSG(e.message || "فشلت عملية التحقق من الكلمة.");
    } finally {
      setChecking(false);
    }
  };

  // Validate and go to payment screen
  const handleProceedToPayment = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMSG(null);

    const trimmedOwner = owner.trim();
    const trimmedEmail = ownerEmail.trim();

    if (!trimmedOwner) {
      setErrorMSG("يرجى إدخال الاسم الكامل لصاحب السجل.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMSG("يرجى إدخال عنوان بريد إلكتروني صالح للمراسلات واستلام صكوك الملكيات.");
      return;
    }

    // Lean email structure check
    if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      setErrorMSG("يرجى إدخال بريد إلكتروني صحيح يحتوي على علامة @ (مثال: name@example.com).");
      return;
    }

    // Go to payment screen
    setPhase('payment');
  };



  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Visual Header with elegant clean design */}
      <div className="bg-gradient-to-l from-neutral-900 to-neutral-800 p-4 sm:p-6 md:p-8 text-right relative text-white">
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-6 -translate-y-6"></div>
        <div className="flex items-center gap-2 mb-1.5 justify-end">
          <span className="text-xs bg-amber-400 text-neutral-950 font-bold px-2 py-0.5 rounded-full">
            ديوان كِلْمَتِي الموثق
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-bold font-sans">
          {phase === 'payment' ? 'بوابة سداد الرسوم الآمنة عبر PayPal' : 'تسجيل ملكية الكلمة الرمزية'}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed font-sans">
          {phase === 'payment' 
            ? 'سدد رسم الحيازة الرمزية لتوليد الصك الفاخر وتسجيل الكلمة باسمك في قاعدة البيانات السحابية برعاية PayPal.'
            : 'اختر باقة التوثيق، وصغ بلمحات الذكاء الاصطناعي معانٍ شاعريّة تُسجّل لأول مرة وتصان ضد التكرار للأبد.'
          }
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-8 text-right">
        {/* Error notification banner */}
        {errorMSG && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-r-4 border-red-600 rounded-xl text-xs text-red-950 font-sans flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div>{errorMSG}</div>
          </motion.div>
        )}

        {/* Phase 1: Search Word */}
        {phase === 'check' && (
          <form onSubmit={handleCheckWord} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 font-sans">الكلمة التي تود امتلاكها في ديوان العرب:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="أدخل كلمة مفردة، مثال: طمأنينة، إصرار، عدالة، تسامح..."
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                    setErrorMSG(null);
                  }}
                  disabled={checking}
                  className="w-full py-4 pr-11 pl-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-md font-bold text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition"
                  required
                  id="book-word-input"
                />
                <span className="absolute right-4 inset-y-0 flex items-center text-neutral-400 pointer-events-none">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                💡 بمجرد تسجيل الكلمة رمزياً باسم المالك، يُغلق باب حيازتها لغيره في ديوان كِلْمَتِي الموثق، ويصدُر لها صك تاريخي بنسق وخط فريد.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-5 py-3 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-2xl transition font-sans text-center cursor-pointer"
                  id="cancel-booking-btn"
                >
                  تراجع
                </button>
              )}
              <button
                type="submit"
                disabled={checking}
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 font-sans text-center cursor-pointer disabled:opacity-75"
                id="check-availability-btn"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>جاري التقصي في السجلات...</span>
                  </>
                ) : (
                  <>
                    <span>التحقق من التوفر وتحديد السعر</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Phase 2: Details & Choices */}
        {phase === 'details' && searchResult && (
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            
            {/* Word status verification header */}
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full inline-block">
                  متاحة بالكامل للحيازة
                </span>
                <span className="block text-2xl font-bold text-neutral-800 tracking-wide font-sans mt-1">« {word} »</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-neutral-400 font-semibold font-sans">القيمة التقديرية الحالية</span>
                <span className="text-xl font-extrabold text-amber-600 font-mono">${activeTierDetails.price}</span>
              </div>
            </div>

             {/* Owner Credentials & Countries selection */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-sans">
               <div className="space-y-1.5 sm:col-span-2">
                 <label className="block text-xs font-bold text-neutral-700 font-sans">اسم مالك الصك المقيد بالوثيقة:</label>
                 <div className="relative">
                   <span className="absolute inset-y-0 right-3 flex items-center text-[#9c7717]">
                     <User className="w-4 h-4" />
                   </span>
                   <input
                     type="text"
                     placeholder="مثال: محمد العمري"
                     value={owner}
                     onChange={(e) => setOwner(e.target.value)}
                     className="w-full py-2.5 pr-9 pl-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-neutral-400 font-sans font-medium"
                     id="owner-name-input"
                   />
                 </div>
               </div>
 
               <div className="space-y-1.5">
                 <label className="block text-xs font-bold text-neutral-700 font-sans">البلد / الجنسية:</label>
                 <div className="relative">
                   <span className="absolute inset-y-0 right-3 flex items-center text-neutral-400 font-sans">
                     <Globe className="w-4 h-4" />
                   </span>
                   <select
                     value={country}
                     onChange={(e) => setCountry(e.target.value)}
                     className="w-full py-2.5 pr-9 pl-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-outline focus:outline-none font-sans font-semibold cursor-pointer"
                     id="owner-country-select"
                   >
                     {countriesList.map((c) => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                 </div>
               </div>
             </div>

            {/* GPS/Coordinates section for thematic Word Map */}
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5 text-right flex-1">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 font-sans justify-end md:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>تحديد موقع الكلمة على خريطة ديوان كلمتي</span>
                  </span>
                  <p className="text-[10px] text-neutral-500 leading-normal font-sans">
                    سيتم عرض كلمتك ومشاركتها مع مجتمع عشاق الضاد على الخريطة التفاعلية الكبرى.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={gpsLoading}
                  className="text-[10px] font-bold bg-amber-400 hover:bg-amber-305 disabled:opacity-50 text-neutral-950 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-center shrink-0 transition font-sans"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>رصد...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3 rotate-45 text-neutral-900" />
                      <span>🛰️ حدد موقعي الحالي بدقة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mapped position coordinates feedback */}
              <div className="text-[11px] font-mono text-stone-600 bg-white border border-neutral-150 p-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-right sm:text-left [direction:rtl]">
                <div className="flex items-center gap-1 font-sans justify-between w-full sm:w-auto">
                  <span className="text-[10px] text-stone-450 font-medium">موقع كلمتك على الخريطة:</span>
                  <span className="font-extrabold text-[#785b0d]">{locationName}</span>
                </div>
                <div className="flex items-center gap-4 justify-center w-full sm:w-auto font-mono text-[10px]">
                  <span>خط عرض: <strong className="text-amber-700">{lat?.toFixed(4) || "—"}</strong></span>
                  <span>خط طول: <strong className="text-amber-700">{lng?.toFixed(4) || "—"}</strong></span>
                </div>
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 font-sans">البريد الإلكتروني للتوثيق والإستلام الرقمي:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3 flex items-center text-neutral-400 font-sans">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="name@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full py-2.5 pr-9 pl-4 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-left font-sans"
                  id="owner-email-input"
                />
              </div>
            </div>

             {/* Dynamic Word Valuation & Group Classification breakdown */}
             <div className="space-y-4">
               <label className="block text-xs font-bold text-neutral-700 font-sans">تصنيف الكلمة وتقييمها اللغوي التلقائي:</label>
               
               <div className="p-4 sm:p-5 bg-stone-50 border border-neutral-200/85 rounded-2xl space-y-4">
                 
                 {/* Top row: Arabic group badge & description */}
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 text-right w-full">
                   <div className="space-y-1.5 w-full">
                     <div className="flex items-center gap-2 flex-wrap [direction:rtl]">
                       <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-3xs leading-none ${wordClassification.badgeColor}`}>
                         {wordClassification.category}
                       </span>
                       <span className="text-[10px] bg-neutral-900 border border-neutral-800/20 text-yellow-400 font-black px-2 py-1 rounded-full leading-none">
                         صنف موثق
                       </span>
                     </div>
                     <p className="text-xs text-stone-600 mt-1 pb-1 font-sans leading-relaxed">{wordClassification.categoryDesc}</p>
                   </div>
                 </div>

                 {/* Price breakdown and metrics bento grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-right">
                   
                   {/* Left column: Mathematical breakdown of pricing valuation */}
                   <div className="space-y-2.5 bg-white p-4 border border-neutral-150 rounded-xl font-sans flex flex-col justify-between">
                     <span className="block text-[11px] font-bold text-neutral-500">تفاصيل تثمين القيمة لـ « {word} »:</span>
                     <div className="space-y-2 text-xs text-neutral-700 font-medium">
                       <div className="flex items-center justify-between gap-2">
                         <span>السعر الأساسي للفئة اللغوية:</span>
                         <span className="font-mono font-bold">${wordClassification.basePrice}.00</span>
                       </div>
                       
                       {wordClassification.phoneticMajestyScore > 0 && (
                         <div className="flex items-center justify-between gap-2">
                           <span>علاوة الفخامة الصوتية (مخرج الحروف):</span>
                           <span className="font-mono font-bold text-emerald-600 font-semibold">+${wordClassification.phoneticMajestyScore}</span>
                         </div>
                       )}

                       {wordClassification.letterWeightScore > 0 && (
                         <div className="flex items-center justify-between gap-2">
                           <span>ميزة قصر اللفظ وشرف الندرة:</span>
                           <span className="font-mono font-bold text-emerald-600 font-semibold">+${wordClassification.letterWeightScore}</span>
                         </div>
                       )}

                       {wordClassification.categoryBonus > 0 && (
                         <div className="flex items-center justify-between gap-2">
                           <span>موازنة نبض التردد الوجداني للفظ:</span>
                           <span className="font-mono font-bold text-emerald-600 font-semibold">+${wordClassification.categoryBonus}</span>
                         </div>
                       )}
                       
                       <div className="pt-2.5 mt-1 border-t border-dashed border-neutral-200 flex items-center justify-between font-bold text-neutral-900">
                         <span>إجمالي القيمة المستحقة:</span>
                         <span className="font-mono text-base font-black text-amber-700">${wordClassification.finalPrice} USD</span>
                       </div>
                     </div>
                   </div>

                   {/* Right column: Highlights and features */}
                   <div className="space-y-2 bg-white p-4 border border-neutral-150 rounded-xl flex flex-col justify-between font-sans">
                     <div>
                       <span className="block text-[11px] font-bold text-neutral-500 mb-2">المزايا والحقوق المكفولة لحيازتك:</span>
                       <ul className="space-y-2 text-[11px] text-neutral-700 font-semibold">
                         {wordClassification.features.map((feat, fidx) => (
                           <li key={fidx} className="flex items-center justify-end gap-1.5 text-right w-full">
                             <span className="font-medium text-stone-605">{feat}</span>
                             <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                           </li>
                         ))}
                       </ul>
                     </div>
                     <p className="text-[10px] text-amber-900 bg-amber-50/70 rounded-lg p-2 border border-amber-200/50 leading-relaxed font-sans text-right mt-2">
                       💡 يتم قفل حيازة الكلمة بالكامل باسمك في ديوان كلمتي المعتمد سحابياً للأبد لمنع التكرار وتوليد الصك فور إتمام السداد.
                     </p>
                   </div>

                 </div>

               </div>
             </div>

            {/* Gift Sub-section option */}
            <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100/50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="w-4 h-4 text-rose-600 border-neutral-300 rounded focus:ring-rose-500"
                  id="is-gift-checkbox"
                />
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1 font-sans">
                  <Gift className="w-3.5 h-3.5 text-rose-600" />
                  أود إرسال وثيقة التمليك كاهداء خاص لشخص عزيز
                </span>
              </label>

              {isGift && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5 pt-2 border-t border-rose-200/40"
                >
                  <label className="block text-[11px] text-neutral-600 font-bold font-sans">رسالة كرم وأدب ترفق بالشهادة:</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: أهديك حرفاً لغوياً فخماً يعبر عن نبل فؤادك وشغف قلبك الجميل..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 font-sans leading-relaxed"
                    id="gift-message-input"
                  />
                </motion.div>
              )}
            </div>

            {/* Premium Theme Pattern selector */}
             <div className="space-y-3 font-sans">
               <label className="block text-xs font-bold text-neutral-700 font-sans">اختر طراز النمط الجمالي للشهادة:</label>
               
               <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                 {themeCards.map((t) => {
                   const isSelected = selectedTheme === t.id;
                   return (
                     <div
                       key={t.id}
                       onClick={() => setSelectedTheme(t.id)}
                       className={`relative p-2.5 sm:p-3 border rounded-xl cursor-pointer transition flex flex-col justify-between h-20 sm:h-24 ${t.previewBg} ${isSelected ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-3xs' : 'border-neutral-200 hover:border-neutral-300'}`}
                       id={`theme-card-${t.id}`}
                     >
                       {isSelected && (
                         <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                           <Check className="w-2.5 h-2.5" />
                         </span>
                       )}
                       
                       <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${t.accentText} font-sans leading-none block`}>
                         {t.name}
                       </span>
 
                       <span className="text-[8px] sm:text-[9px] text-neutral-500 leading-tight block line-clamp-2 font-sans">
                         {t.desc}
                       </span>
                     </div>
                   );
                 })}
               </div>
 
               {/* Dynamic Interactive Certificate Live Sample Previews requested by user */}
               <div className="mt-4 pt-1 space-y-3 bg-neutral-50/50 border border-neutral-200/50 rounded-2xl p-3 sm:p-5">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-200/60 pb-2">
                   <span className="text-[10px] text-amber-900 bg-amber-100/65 border border-amber-200/50 font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none shadow-3xs self-start">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                     معاينة حية ومثال لشكل صك التوثيق الجديد الخاص بك
                   </span>
                   <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold font-sans self-end sm:self-center">النمط المفعل: {
                     selectedTheme === 'gold' ? 'الدِّيوَانُ الذَّهَبِيُّ' :
                     selectedTheme === 'emerald' ? 'زُمُرُّدٌ أَنْدَلُسِيٌّ' :
                     selectedTheme === 'onyx' ? 'عَقِيقٌ مُلُوكِيٌّ دَافِئٌ' :
                     selectedTheme === 'sapphire' ? 'سَافِيرٌ نَاصِعٌ' :
                     'يَاقُوتُ الوَجْدِ الشَّغُوفِ'
                   }</span>
                 </div>
 
                 {(() => {
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
                       sealBg: "bg-[#fffafa]",
                       sealBorder: "border-[#b91c1c]",
                       sealText: "text-[#991b1b]",
                       signatureColor: "text-[#b91c1c]",
                       accentBarGradient: "from-red-400 via-rose-500 to-red-600"
                     }
                   };
                   const styles = themesMap[selectedTheme] || themesMap.gold;
 
                   return (
                     <div className={`relative p-3 sm:p-5 ${styles.containerBg} border-2 sm:border-4 border-double ${styles.borderClass} rounded-2xl shadow-sm transition-all duration-300 overflow-hidden select-none text-right flex flex-col sm:flex-row items-center gap-4`}>
                       
                       {/* Top colored margin bar */}
                       <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${styles.accentBarGradient}`}></div>
 
                       {/* Inner styling line frame */}
                       <div className={`absolute inset-1 sm:inset-1.5 border ${styles.innerBorderClass} rounded-xl pointer-events-none`}></div>
 
                       {/* Left text column */}
                       <div className="flex-1 space-y-1.5 z-10 w-full">
                         <div className="space-y-0.5">
                           <span className={`block text-xs sm:text-sm font-extrabold ${styles.titleColor} leading-none`}>شهادة ملكية أدبية</span>
                           <span className={`text-[7.5px] sm:text-[8px] uppercase tracking-wider ${styles.labelColor} block opacity-85 font-black`}>Certificate of Ownership • ديوان كِلْمَتِي</span>
                         </div>
 
                         <div className="space-y-0.5">
                           <p className="text-[8px] sm:text-[9px] opacity-75 text-neutral-500">يُقيد بأن الأديب والمالك الوجداني:</p>
                           <span className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-black ${styles.ownerNameText} ${styles.ownerLabelBg} border ${styles.ownerLabelBorder} rounded-[6px] leading-tight break-all max-w-full`}>
                             {owner.trim() ? `${owner.trim()} (${country})` : `« اسم السجل (${country}) »`}
                           </span>
                         </div>
 
                         <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-250/10">
                           {/* Stamp signature */}
                           <div className="shrink-0 leading-none">
                             <span className="text-[6.5px] sm:text-[7px] text-neutral-400 block mb-0.5">منصة كِلْمَتِي الموثقة</span>
                             <svg className={`w-12 h-4 sm:w-14 sm:h-5 ${styles.signatureColor}`} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5">
                               <path d="M10,18 C25,5 35,28 50,12 C60,25 75,5 85,18" />
                             </svg>
                           </div>
                           {/* Certificate Number mock */}
                           <div className="text-left">
                             <span className="text-[6.5px] sm:text-[7px] text-neutral-400 block">رقم الصك السحابي</span>
                             <span className="font-mono text-[7.5px] sm:text-[8px] font-bold text-stone-700">OWN-{(word.trim() || 'WORD').toUpperCase()}-XXXX</span>
                           </div>
                         </div>
                       </div>
 
                       {/* Divider line (desktops) */}
                       <div className="hidden sm:block w-[1px] self-stretch bg-neutral-200/50"></div>
 
                       {/* Right column with featured word and seal - highly mobile responsive layout */}
                       <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center text-center gap-4 sm:gap-1.5 z-10 shrink-0 w-full sm:w-auto min-w-0 sm:min-w-[124px] pt-1.5 sm:pt-0 border-t sm:border-t-0 border-neutral-200/30 sm:border-transparent">
                         <div className="text-right sm:text-center w-full">
                           <span className={`text-[7px] sm:text-[8px] font-bold tracking-widest uppercase ${styles.labelColor} block`}>اللفظ المحجوز</span>
                           <span className={`text-sm sm:text-base md:text-xl font-black font-serif-arabic tracking-wide leading-none py-0.5 block ${styles.wordColor}`}>
                             « {word.trim() ? word.trim() : 'طمأنينة'} »
                           </span>
                         </div>
                         
                         {/* Round official seal layout */}
                         <div className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border-1.5 ${styles.sealBorder} ${styles.sealBg} shadow-3xs shrink-0`}>
                           <div className={`absolute inset-0.5 rounded-full border border-dashed ${styles.sealBorder}/75`}></div>
                           <div className={`text-[4.5px] sm:text-[5px] font-bold ${styles.sealText} flex flex-col items-center leading-none scale-85`}>
                             <span>ختم معتمد</span>
                             <span>ديوان العرب</span>
                           </div>
                         </div>
                       </div>
 
                     </div>
                   );
                 })()}
               </div>
             </div>
 
             {/* Proceed buttons */}
             <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-neutral-150/45">
               <button
                 type="button"
                 onClick={() => setPhase('check')}
                 className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl text-xs transition font-sans text-center cursor-pointer"
                 id="back-to-check-btn"
               >
                 تغيير الكلمة
               </button>
 
               <button
                 type="submit"
                 className="w-full sm:w-auto px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm font-sans cursor-pointer text-center"
                 id="submit-booking-claim-btn"
               >
                 <span>الانتقال للدفع الآمن (${activeTierDetails.price})</span>
                 <ChevronRight className="w-4 h-4 rotate-180 shrink-0" />
               </button>
             </div>
            
          </form>
        )}

        {/* Phase 3: Payment Overlay with authentic PayPal smart buttons and sandbox bypass */}
        {phase === 'payment' && (
          <div className="space-y-6">
            
            {/* Payment Summary Cart */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-neutral-800">بيان ملخص المعاملة الأدبية:</h4>
              <div className="space-y-2 border-t border-neutral-200/50 pt-2.5 text-xs text-neutral-600">
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <span>الكلمة العربية الفصيحة:</span>
                  <span className="font-bold text-neutral-950 text-base break-all text-left">« {word} »</span>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <span>اسم المالك والبلد:</span>
                  <span className="font-medium text-neutral-950 text-left">{owner} • {country}</span>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <span>باقة التوثيق المعتمدة:</span>
                  <span className="font-bold text-amber-800 font-sans text-amber-800 text-left">{activeTierDetails.name}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-neutral-200 text-sm gap-3 flex-wrap sm:flex-nowrap">
                  <span className="font-bold text-neutral-950">إجمالي رسوم التوثيق:</span>
                  <span className="font-extrabold text-amber-700 font-mono text-base text-left">${activeTierDetails.price} USD</span>
                </div>
              </div>
            </div>

            {/* Unified PayPal Smart Button secure container */}
            <div className="space-y-4 rounded-2xl border border-neutral-150 bg-white p-4 sm:p-5 shadow-sm text-right">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <span className="text-xs font-black text-neutral-800 flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                  بوابة السداد الآمنة والرسمية عبر PayPal
                </span>
                <span className="text-[10px] text-neutral-400 font-bold font-mono">SECURE SSL 256-BIT</span>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 text-right space-y-2 font-sans text-xs leading-relaxed text-neutral-700">
                <p>
                  الدفع آمن ومحمي بالكامل برعاية **PayPal**. يتيح لك النظام السداد عبر حساب بايبال الخاص بك أو عبر **البطاقة الائتمانية وصراف مدى مباشرة** دون الحاجة لتسجيل حساب.
                </p>
                <p className="text-[11px] text-neutral-500 font-bold">
                  💡 للسداد الفوري بالبطاقة دون حساب، يرجى النقر على زر <span className="font-sans font-extrabold text-neutral-900">Debit or Credit Card</span> الأسود بالأسفل.
                </p>
              </div>

              {/* Status and SDK Button Container */}
              {!sdkLoaded && !sdkError && (
                <div className="py-10 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-xs font-bold text-neutral-500 font-sans">جاري استدعاء وتجهيز منصة الدفع الآمنة PayPal لإنشاء الصك...</p>
                </div>
              )}

              {sdkError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed space-y-2">
                  <p className="font-bold">⚠️ تعذر تحميل واجهة PayPal الخارجية حالياً.</p>
                  <p className="text-[11px] text-neutral-600">
                    يمكنك دوماً حجز وامتلاك الكلمة تجريبياً وسحابياً عبر زر المحاكاة الفوري بالأسفل لتجاوز الخطوة بنجاح بنقرة واحدة!
                  </p>
                </div>
              )}

              <div id="paypal-button-container" className="my-2 min-h-[100px] transition-all duration-300"></div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 font-bold pt-3 border-t border-neutral-100">
                <span className="flex items-center gap-1">🔒 سداد ممتد مشفر</span>
                <span className="flex items-center gap-1">✅ معتمد رسمياً</span>
                <span className="flex items-center gap-1">💳 بطاقات وحسابات</span>
              </div>
            </div>

            {/* Developer Testing Bypass option */}
            <div className="relative py-4 border-t border-dashed border-neutral-200 mt-4 text-center">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] text-neutral-400 font-bold font-sans">أو تجربة فورية للتطوير</span>
              <button
                type="button"
                onClick={() => triggerFinalizeBooking("dev-sandbox-buyer@paypal.com")}
                disabled={submitting}
                className="w-full py-3.5 px-3 bg-[#fbfbfb] hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 text-neutral-800 hover:text-amber-900 font-bold rounded-2xl text-[11px] transition flex items-center justify-center gap-2 group-hover:scale-101 shadow-3xs cursor-pointer"
                id="dev-simulate-pay-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <span className="leading-normal">محاكاة دفع سحابية سريعة وتأكيد تسجيل وتمليك الكلمة</span>
              </button>
            </div>

            {/* Navigation back and manual check action */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPhase('details')}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-600 font-bold rounded-xl text-xs transition font-sans text-center cursor-pointer disabled:opacity-50"
                id="back-to-details-btn"
              >
                تعديل البيانات
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
