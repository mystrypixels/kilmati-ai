import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  auth, 
  googleProvider 
} from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  BookOpen, 
  X, 
  Loader2, 
  UserPlus, 
  Hash, 
  Calendar,
  ExternalLink,
  ChevronLeft,
  Edit2,
  PieChart as ChartIcon,
  TrendingUp,
  Award as DiplomaIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { WordRecord } from '../types';
import { classifyArabicWord } from '../utils';

interface AuthProfileProps {
  words: WordRecord[];
  onSelectWord: (word: WordRecord) => void;
  onUserAuthChange?: (user: User | null) => void;
  onProfileUpdated?: () => void;
}

export default function AuthProfile({ words, onSelectWord, onUserAuthChange, onProfileUpdated }: AuthProfileProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Auth Modes: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile update form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (onUserAuthChange) {
        onUserAuthChange(user);
      }
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, [onUserAuthChange]);

  // Filter user's words
  const myWords = currentUser 
    ? words.filter(w => w.ownerEmail?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim())
    : [];

  // Determine user rank/tier based on word count
  const getUserRank = (wordCount: number) => {
    if (wordCount === 0) return { title: "رواة الكلمة الجدد", desc: "خطوتك الأولى في محراب الكلم السامي", color: "text-amber-500 bg-amber-500/5 border-amber-500/10" };
    if (wordCount === 1) return { title: "راوي الكلمة 📜", desc: "تملك كلمة بليغة توثق مشاعرك المخلدة", color: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10" };
    if (wordCount <= 3) return { title: "حارس الضاد البليغ ✒️", desc: "تقتني مجموعة أصيلة من الحروف والنبضات", color: "text-blue-600 bg-blue-500/5 border-blue-500/10" };
    if (wordCount <= 5) return { title: "فيلسوف الكلمة العظيم 💎", desc: "ترعى ديواناً من الكلمات النادرة والجميلة", color: "text-purple-600 bg-purple-500/5 border-purple-500/10" };
    return { title: "سيد الكلمة والأدب الرفيع 👑", desc: "ديوانك الذهبي السحابي يتردد في سماء الفصاحة", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  };

  const userRank = getUserRank(myWords.length);

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setFormError("يرجى ملء جميع الحقول المطلوبة للتسجيل");
      return;
    }

    if (password.length < 6) {
      setFormError("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل");
      return;
    }

    try {
      setAuthLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Update display name with full name
      await updateProfile(userCredential.user, {
        displayName: fullName.trim()
      });
      // Force refreshing the current state
      setCurrentUser({ ...userCredential.user, displayName: fullName.trim() });
      
      // Close modal and show profile
      setIsAuthModalOpen(false);
      setIsProfileModalOpen(true);
      resetForms();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setFormError("هذا البريد الإلكتروني مسجل بالفعل لدى عضو آخر");
      } else if (err.code === 'auth/invalid-email') {
        setFormError("عنوان البريد الإلكتروني غير صالح");
      } else if (err.code === 'auth/weak-password') {
        setFormError("كلمة المرور ضعيفة للغاية");
      } else {
        setFormError("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("يرجى إدخال اسم المستخدم/البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      setAuthLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsAuthModalOpen(false);
      setIsProfileModalOpen(true);
      resetForms();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setFormError("بيانات الدخول غير صحيحة، يرجى التحقق من البريد وكلمة المرور");
      } else {
        setFormError("فشل تسجيل الدخول. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setFormError(null);
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Display name update is handled by Google provider automatically
      setIsAuthModalOpen(false);
      setIsProfileModalOpen(true);
      resetForms();
    } catch (err: any) {
      console.error("Google authentication error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setFormError("فشلت عملية المصادقة عبر Google. يرجى المحاولة بالبريد العادي.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileModalOpen(false);
      setIsEditingProfile(false);
      setProfileSuccess(null);
      setProfileError(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Handle updating displayName and updating existing words in Firestore
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const cleanName = newDisplayName.trim();
    if (!cleanName) {
      setProfileError("يرجى إدخال اسم أدبي صحيح قبل تفعيل صكوك التوثيق الجديدة");
      return;
    }

    if (!currentUser || !currentUser.email) {
      setProfileError("خطأ في الجلسة النشطة، يرجى إعادة تسجيل الدخول");
      return;
    }

    try {
      setProfileUpdateLoading(true);

      // 1. Update Firebase Authentication displayName on the client
      await updateProfile(currentUser, {
        displayName: cleanName
      });

      // 2. Call our secure server-side API `/api/words/update-owner` to rewrite Firestore records securely!
      const response = await fetch('/api/words/update-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ownerEmail: currentUser.email,
          newOwnerName: cleanName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "خطأ في السجلات السحابية للديباجة");
      }

      // Force refreshing the current client state
      setCurrentUser({
        ...currentUser,
        displayName: cleanName
      });

      setProfileSuccess(`تم تحديث اسمك الأدبي المعتمد بنجاح إلى "${cleanName}". تم تحديث شهادات وصكوك كلماتك المحجوزة.`);
      setIsEditingProfile(false);

      // Trigger re-loading of the main Words Wall and state in App.tsx!
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileError(err.message || "حدث خطأ غير متوقع أثناء تحديث بيانات هويتك");
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const resetForms = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setFormError(null);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-400 font-bold text-xs select-none">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
        <span className="font-sans">جارٍ التحقق...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 relative [direction:rtl]">
      {currentUser ? (
        /* Logged in Button -> Opens Profile */
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-900 transition-all duration-300 font-sans cursor-pointer group hover:shadow-xs"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-800 text-[10px] sm:text-xs shrink-0 select-none">
            {currentUser.displayName ? currentUser.displayName.slice(0, 1) : currentUser.email?.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10.5px] sm:text-xs font-black truncate max-w-[65px] xs:max-w-[95px] sm:max-w-[130px]">
              {currentUser.displayName || "العضو الموثق"}
            </span>
            <span className="text-[8px] sm:text-[9px] text-amber-700 font-medium font-sans">
              {myWords.length} كلمات
            </span>
          </div>
        </button>
      ) : (
        /* Not logged in Button -> Opens Auth Modal */
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] sm:text-xs font-black border border-neutral-950 hover:shadow-md cursor-pointer transition-all duration-300 group whitespace-nowrap"
        >
          <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          <span>عضوية ديوان كلمتي</span>
        </button>
      )}

      {/* Auth Modal (Login / Register) */}
      {isAuthModalOpen && createPortal(
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl p-5 sm:p-6 w-full max-w-md relative overflow-hidden transition-all duration-300 my-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Elegant Header backgrounds */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-neutral-800 via-amber-500 to-neutral-900"></div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                resetForms();
              }}
              className="absolute top-4 left-4 text-neutral-400 hover:text-neutral-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative Icon */}
            <div className="flex justify-center mb-2.5 sm:mb-4 mt-1 sm:mt-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center shadow-xs">
                {authMode === 'login' ? (
                  <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-[#9c7717]" />
                ) : (
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-[#9c7717]" />
                )}
              </div>
            </div>

            {/* Modal Title */}
            <h3 className="text-sm sm:text-base md:text-lg font-black text-neutral-800 text-center">
              {authMode === 'login' ? 'الدخول إلى ملفك الأدبي السحابي' : 'تسجيل عضوية جديدة في ديوان كلمتي'}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 text-center mt-1">
              {authMode === 'login' 
                ? 'مرحباً بك مجدداً، أدخل بياناتك لاستعراض صكوك كلماتك المحجوزة' 
                : 'أنشئ حسابك الأدبي الآن لحفظ وتأصيل كلماتك وشهاداتك الرقمية مدى الحياة'}
            </p>

            {/* Error messaging */}
            {formError && (
              <div className="mt-2.5 sm:mt-3.5 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[10px] sm:text-[11px] font-bold text-right flex items-center gap-2">
                <span>⚠️ {formError}</span>
              </div>
            )}

            {/* Main Auth Form */}
            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3.5 text-right font-sans">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-700">الاسم والكنية الأدبية الكاملة:</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="مثال: أديب الدهر / فاطمة الزهراء"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 sm:p-2.5 text-[11px] sm:text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500/50 focus:outline-none focus:bg-white text-right font-sans"
                  />
                </div>
              )}

              <div className="space-y-1 font-sans">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-700">البريد الإلكتروني الخاص بك:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-neutral-400 font-sans">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 sm:py-2.5 pr-9 pl-4 text-[11px] sm:text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500/50 focus:outline-none focus:bg-white text-left font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1 font-sans">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-700 font-sans font-sans">كلمة السر الأمنية للديوان:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-neutral-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2 sm:py-2.5 pr-9 pl-4 text-[11px] sm:text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-amber-500/50 focus:outline-none focus:bg-white text-left font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-[11px] sm:text-xs font-bold py-2.5 sm:py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>برجاء الانتظار...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>{authMode === 'login' ? 'تأكيد دخول المحراب' : 'تأسيس الهوية وعضوية الديوان'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternating choice */}
            <div className="relative my-4 sm:my-5 flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full absolute"></div>
              <span className="bg-white px-2.5 sm:px-3.5 text-[9px] sm:text-[10px] text-neutral-400 font-black relative leading-none uppercase">أو عبر المنصات العالمية</span>
            </div>

            {/* Google Authentication Shortcut */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50 text-neutral-700 py-2 sm:py-2.5 rounded-xl border border-neutral-200 transition duration-300 flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.5l3.85 2.99C6.2 7.15 8.9 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.28 1.47-1.11 2.71-2.35 3.55l3.65 2.83c2.14-1.97 3.73-4.87 3.73-8.54z"/>
                <path fill="#FBBC05" d="M5.24 14.51c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.9C.5 8.7 0 10.74 0 12.9s.5 4.2 1.39 6l3.85-2.99s-.14-.72-.14-1.4z"/>
                <path fill="#34A853" d="M12 23c3.24 0 6-1.08 8-2.91l-3.65-2.83c-1.11.75-2.54 1.2-4.35 1.2-3.1 0-5.8-2.11-6.76-5.45l-3.85 2.99C3.37 20.35 7.35 23 12 23z"/>
              </svg>
              <span className="text-[11px] sm:text-[11.5px] font-black">تسجيل سريع بحساب Google</span>
            </button>

            {/* Swap Sign in/up Toggle */}
            <div className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs">
              {authMode === 'login' ? (
                <p className="text-neutral-500">
                  لا تملك حساب عضوية مدرج؟ {' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    type="button"
                    className="text-amber-700 hover:text-amber-800 font-black underline cursor-pointer"
                  >
                    أنشئ نسق عضوية جديدة
                  </button>
                </p>
              ) : (
                <p className="text-neutral-500">
                  لديك حساب عضوية بالفندق الرقمي؟ {' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    type="button"
                    className="text-amber-700 hover:text-amber-800 font-black underline cursor-pointer"
                  >
                    تسجيل الدخول المباشر
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Profile & Wallet Drawer/Modal (showing their registered words) */}
      {isProfileModalOpen && currentUser && createPortal(
        <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-xs z-[1000] flex items-center justify-center p-0 overflow-hidden w-full h-full" style={{ direction: 'rtl' }}>
          <div className="bg-[#faf9f6]/98 backdrop-blur-md w-full h-full max-w-full max-h-full rounded-none border-0 shadow-none relative overflow-hidden transition-all duration-300 flex flex-col font-sans">
            {/* Top decorative visual bar */}
            <div className="h-1.5 bg-gradient-to-r from-neutral-800 via-amber-500 to-neutral-900 w-full shrink-0"></div>

            {/* Drawer Header (Full-width Navbar) */}
            <div className="p-4 sm:p-5 border-b border-neutral-200/60 flex items-center justify-between bg-white shrink-0 shadow-3xs [direction:rtl]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-800 shadow-3xs">
                  <UserIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-right">
                  <h3 className="text-xs sm:text-sm font-black text-neutral-800 leading-tight">البوابة الأدبية والسحابية لتوثيق فصاحتك ونقش حروفك</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-500 font-sans mt-0.5">{currentUser.email} • المعرّف: Member-{currentUser.uid.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-rose-750 hover:bg-rose-50 border border-neutral-200 rounded-xl hover:border-rose-250 flex items-center gap-1.5 cursor-pointer transition-colors bg-white font-sans"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                  <span className="sm:hidden">خروج</span>
                </button>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-black text-white bg-[#9c7717] hover:bg-[#856404] hover:shadow-md rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>إغلاق البوابة</span>
                </button>
              </div>
            </div>

            {/* Context/Body area scrolling */}
            <div className="p-4 sm:p-8 overflow-y-auto space-y-5 sm:space-y-6 flex-1 select-none scrollbar-thin">
              {/* User Membership Card details */}
              <div className="bg-gradient-to-br from-neutral-900 via-[#181816] to-[#242421] rounded-2xl p-4 sm:p-6 border border-white/5 shadow-xl text-white relative overflow-hidden text-right">
                {/* Visual decoration overlay */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-10 blur-xs">
                  <Award className="w-32 h-32 text-amber-400" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 z-10 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-yellow-400/80 font-black tracking-widest uppercase border border-yellow-400/20 px-2 py-0.5 rounded-md bg-yellow-400/5 leading-none">
                        عضوية رسمية
                      </span>
                      <span className="text-neutral-400 text-[10px] font-sans font-medium">معرف الكود: Member-{currentUser.uid.slice(0, 5).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black text-amber-100 leading-tight">
                        {currentUser.displayName || "أديب الحروف"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setNewDisplayName(currentUser.displayName || '');
                          setProfileError(null);
                          setProfileSuccess(null);
                          setIsEditingProfile(!isEditingProfile);
                        }}
                        className="text-[9.5px] text-[#fbf0d4] hover:text-[#ffffff] font-extrabold flex items-center gap-1 bg-white/5 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer font-sans"
                        title="تعديل الاسم أو اللقب الأدبي"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-amber-400" />
                        <span>تعديل اللقب</span>
                      </button>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed max-w-2xl font-sans">
                      {userRank.desc}
                    </p>
                  </div>

                  {/* Rank Badge */}
                  <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-center font-black ${userRank.color} shadow-md shrink-0 w-full sm:w-auto`}>
                    <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400/80 font-sans">الرتبة في الديوان</span>
                    <span className="block text-[11px] sm:text-xs font-black mt-0.5 sm:mt-1 leading-none">{userRank.title}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 text-right font-sans">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[7.5px] sm:text-[8px] text-neutral-400 leading-none mb-0.5 sm:mb-1 font-sans">الكلمات المحجوزة</span>
                      <span className="text-xs sm:text-sm font-black text-amber-100 font-mono">{myWords.length} كَلِمَة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[7.5px] sm:text-[8px] text-neutral-400 leading-none mb-0.5 sm:mb-1 font-sans">تاريخ الانضمام</span>
                      <span className="text-[10.5px] sm:text-xs font-black text-neutral-200 font-mono">
                        {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('ar-EG') : 'موثق'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Column Responsive Layout Grid for rest of content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                
                {/* Right Column: Profile Edits, Status Alerts, and Analytics custom Card */}
                <div className="lg:col-span-5 space-y-5">

              {/* Collapsible Profile Editing Panel */}
              {isEditingProfile && (
                <div className="bg-white border border-amber-300/65 rounded-2xl p-4 text-right shadow-sm space-y-3 transition-all duration-300">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-neutral-800">تغيير الاسم أو اللقب التوثيقي</h4>
                  </div>
                  
                  <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                    أدخل اسمك الموثق الجديد؛ سيتم تعميمه تلقائيًا على جميع صكوك وشهادات كلماتك السابقة، وعلى شهادات أي كلمات جديدة تقوم بحجزها لاحقًا في هذا الديوان.
                  </p>

                  <form onSubmit={handleUpdateProfile} className="space-y-3 font-sans">
                    <div>
                      <label className="block text-[10px] font-bold text-[#9c7717] mb-1">الاسم الأدبي الموثق بالشهادات:</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        placeholder="أدخل الاسم بوضوح (أديب الحرف / الاسم الثلاثي)"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none focus:bg-white text-right font-sans"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileError(null);
                        }}
                        className="px-3.5 py-2 text-[10.5px] font-bold text-stone-600 hover:text-stone-850 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={profileUpdateLoading}
                        className="px-4 py-2 text-[10.1px] font-black text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {profileUpdateLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                            <span>جارٍ تحديث الشهادات...</span>
                          </>
                        ) : (
                          <>
                            <span>حفظ وتعديل الصكوك</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Status response notifications */}
              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[10.5px] font-semibold text-right rounded-xl font-sans">
                  ⚠️ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-55/10 border border-emerald-500/20 text-emerald-850 text-[10.5px] font-semibold text-right rounded-xl font-sans">
                  ✓ {profileSuccess}
                </div>
              )}

              {/* Category Analytics Pie Chart - Only visible if user has words */}
              {myWords.length > 0 && (() => {
                const categoriesMap: { [key: string]: number } = {};
                myWords.forEach(w => {
                  const cat = w.category || classifyArabicWord(w.word).category;
                  categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
                });

                const chartData = Object.keys(categoriesMap).map(categoryName => ({
                  name: categoryName.replace("المجموعة", "طراز").replace("مجموعة", "طراز"),
                  value: categoriesMap[categoryName]
                }));

                const COLORS = ['#9c7717', '#10b981', '#3b82f6', '#ec4899', '#6366f1', '#6b7280'];

                return (
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4 text-right">
                    <div className="flex justify-between items-center border-b border-[#f3ebcd] pb-2 flex-wrap gap-2">
                      <h4 className="text-[11px] sm:text-xs font-black text-neutral-800 flex items-center gap-1.5 sm:gap-2">
                        <ChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-pulse" />
                        <span>البصمة اللغوية والتصنيف الموضوعي بالديوان</span>
                      </h4>
                      <span className="text-[9px] sm:text-[10px] bg-amber-50 text-[#856404] border border-amber-200/50 px-2.5 py-0.5 rounded-full font-bold">
                        توازن فصاحتك اللغوية
                      </span>
                    </div>

                    <p className="text-[9.5px] sm:text-[10px] text-neutral-500 leading-relaxed font-sans">
                      أدناه رسم بياني موضوعي يوضح تنوع وجدانيات وحمائل كلماتك المحجوزة في محراب لغة الضاد. تنوع الكلمات يعكس ثراء ملفك التوثيقي!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                      {/* Recharts PieChart */}
                      <div className="md:col-span-5 flex justify-center items-center h-[130px] sm:h-[160px] relative">
                        <div className="absolute flex flex-col justify-center items-center pointer-events-none text-center select-none z-10 transition-all">
                          <span className="text-base sm:text-lg font-black text-neutral-800 font-mono tracking-tight leading-none">{myWords.length}</span>
                          <span className="text-[7.5px] sm:text-[8px] text-neutral-400 font-black mt-0.5 sm:mt-1">كلمات محجوزة</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={42}
                              outerRadius={58}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-neutral-900 border border-neutral-800 text-white rounded-xl p-2 shadow-lg text-[9.5px] text-right font-sans">
                                      <p className="font-black leading-none">{payload[0].name}</p>
                                      <p className="font-bold text-amber-400 mt-1">العدد: {payload[0].value} {payload[0].value === 1 ? 'كلمة' : 'كلمات'}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Categories Legend with colors & custom counts */}
                      <div className="md:col-span-7 space-y-1.5 sm:space-y-2 select-none">
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[9px] sm:text-[10.5px]">
                          {chartData.map((data, index) => {
                            const percentage = ((data.value / myWords.length) * 100).toFixed(0);
                            return (
                              <div 
                                key={data.name} 
                                className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#faf9f6] border border-neutral-200/60 text-right hover:bg-[#f6f5f0] transition duration-200"
                              >
                                <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                                  <span 
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  ></span>
                                  <span className="font-extrabold text-neutral-700 truncate max-w-[65px] sm:max-w-[120px]" title={data.name}>
                                    {data.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1 font-sans shrink-0">
                                  <span className="font-black text-[#9c7717]">{data.value}</span>
                                  <span className="text-[7.5px] sm:text-[8.5px] text-stone-400 font-semibold">({percentage}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Dynamic commentary based on largest category */}
                        {(() => {
                          let dominantName = "";
                          let maxVal = 0;
                          chartData.forEach(d => {
                            if (d.value > maxVal) {
                              maxVal = d.value;
                              dominantName = d.name;
                            }
                          });
                          
                          let tip = "اقتناؤك لكلمات من مجموعات وتفاصيل متنوعة يُثري ديوانك وصرحك الفريد!";
                          if (dominantName.includes("شاعريّة") || dominantName.includes("الشاعرية")) {
                            tip = "تطغى عذوبة الشوق وعواطف المحبة الرقيقة على ذوقك الأدبي ومحصولك الفريد 🌸";
                          } else if (dominantName.includes("وحيدة") || dominantName.includes("نادرة") || dominantName.includes("البلاغية")) {
                            tip = "يتألق محرابك بنفحات الأصالة والتراث والبيان اللغوي السامي المعجز اللامع ✨";
                          } else if (dominantName.includes("الملوك") || dominantName.includes("سيادة") || dominantName.includes("السيادة") || dominantName.includes("النخبة")) {
                            tip = "يكتسي رصيدك ثوب الوقار والمروءة والشهامة، معززاً بسمات ملوكية السرد 👑";
                          } else if (dominantName.includes("الروحانية") || dominantName.includes("الأثيرية")) {
                            tip = "نفسك سمحة أثيرية تطغى عليها مشاعر السكينة والتقى وخفقات الوجدان النقي 🕊️";
                          }
                          
                          return (
                            <div className="p-2 border border-dashed border-amber-200 rounded-xl bg-amber-50/20 text-stone-600 text-[9px] leading-relaxed text-right flex items-center gap-1.5 font-sans mt-1.5 sm:mt-2">
                              <TrendingUp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span><strong>النبض البلاغي:</strong> {tip}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })()}
                </div>

                {/* Left Column: Owned Words with extensive workspace feel */}
                <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex justify-between items-center text-right border-b border-neutral-200/50 pb-1.5 sm:pb-2">
                  <h4 className="text-xs font-black text-neutral-700 flex items-center gap-1 sm:gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9c7717]" />
                    <span>حقيبتك الأدبية الرقمية ({myWords.length})</span>
                  </h4>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400">اضغط لعرض صك الملكية للكلمة</span>
                </div>

                {myWords.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-dashed border-neutral-250 rounded-2xl">
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                      لم تحجز أي كلمة تابعة لهذا البريد الإلكتروني في الديوان حتى الآن. ابحث من الأعلى عما يجول بخاطرك ووثقه باسمك الآن!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] sm:max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
                    {myWords.map((word) => (
                      <div 
                        key={word.id}
                        className="bg-white border border-neutral-200 hover:border-amber-300 rounded-xl p-3 text-right flex flex-col justify-between hover:shadow-2xs transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center [direction:rtl]">
                            <span className="text-xs font-black text-neutral-850 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1">
                              {word.word}
                            </span>
                            <span className="text-[8px] font-mono text-stone-400">
                              {new Date(word.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-neutral-500 font-medium leading-relaxed line-clamp-2 mt-1">
                            {word.meaning}
                          </p>
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-neutral-100 flex justify-between items-center [direction:rtl]">
                          <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md ${
                            word.theme === 'emerald' ? 'bg-emerald-50 text-emerald-800' :
                            word.theme === 'ruby' ? 'bg-rose-50 text-rose-800' :
                            word.theme === 'sapphire' ? 'bg-blue-50 text-blue-800' :
                            word.theme === 'onyx' ? 'bg-stone-100 text-stone-850' :
                            'bg-amber-50 text-amber-800'
                          }`}>
                            صك {
                              word.theme === 'emerald' ? 'الزمرد' :
                              word.theme === 'ruby' ? 'الياقوت' :
                              word.theme === 'sapphire' ? 'السافير' :
                              word.theme === 'onyx' ? 'العقيق الأسود' :
                              'الذهب الملكي'
                            }
                          </span>

                          <button
                            onClick={() => {
                              setIsProfileModalOpen(false);
                              onSelectWord(word);
                            }}
                            className="text-[10px] text-amber-800 hover:text-amber-900 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>استعراض الصك</span>
                            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> {/* End of Left Column */}
          </div> {/* End of Grid container */}
        </div> {/* End of Context/Body area scrolling */}

        {/* Bottom Footer block */}
            <div className="p-4 bg-white border-t border-neutral-200/50 text-center">
              <p className="text-[9.5px] text-neutral-400 font-sans">
                صكوك كلمتي مخلدة ومحمية ومشفرة رقمياً ضد التكرار والتزييف 🛡️
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
