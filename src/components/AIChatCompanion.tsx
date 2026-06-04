import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, RefreshCw, PenTool, BookOpen, User, Compass, ArrowRight, X, MessageSquare, MessageCircle, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatCompanionProps {
  onSuggestWord: (word: string) => void;
  externalTriggerPrompt?: string | null;
  onClearExternalTrigger?: () => void;
}

const PRESET_QUICK_PROMPTS = [
  {
    text: "كلمة بليغة للزوجة 💍",
    icon: "❤️",
    prompt: "اقترح لي كلمة عربية بليغة وفريدة مناسبة لأهديها لزوجتي مع شرح بلاغيتها وصياغة بيتي شعر رائعين عنها."
  },
  {
    text: "تُعبّر عن الصمود 💪🏼",
    icon: "🔥",
    prompt: "أريد كلمة عربية فصيحة نادرة ومعبرة جداً تجسد معنى الصمود والتغلب على المحن والصعاب مع كتابة نثر أدبي رفيع حولها."
  },
  {
    text: "شعر لكلمة 'شَغَف' ✍🏼",
    icon: "✒️",
    prompt: "اكتب لي بيتين من الشعر البليغ على البحور الكلاسيكية الفصحى تضم كلمة 'شَغَف' وتبرز جلالة وروعة هذا المسمى."
  },
  {
    text: "ذكرى عاطفية لأمي 🌸",
    icon: "✨",
    prompt: "اقترح كلمة استثنائية ونبيلة تلخص معاني الحنان المطلق والأمومة، واشرح عاطفتها الجياشة مع نثر لطيف."
  }
];

export default function AIChatCompanion({ onSuggestWord, externalTriggerPrompt, onClearExternalTrigger }: AIChatCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "أهلاً بك يا رفيق الوجدان في محراب كِلْمَتِي. أنا مُستشار الكلمات الأدبي؛ رفيقك في سبر أغوار لغة الضاد الساحرة.\n\nحدثني عن خاطرة تسكن فؤادك، أو إهداء تنشده لشخص عزيز، أو مشاعر عريضة تود تجسيدها في كلمة أبدية، وسأغزل لك من فرائد وبلاغة لغتنا ما تقرّ به عينك، ونصيغ معاً صكاً نادراً يليق بقصتك.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false); // Alert badge when assistant replies and chat is minimized
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (externalTriggerPrompt) {
      setIsVisible(true);
      setIsOpen(true);
      handleSendMessage(externalTriggerPrompt);
      if (onClearExternalTrigger) {
        onClearExternalTrigger();
      }
    }
  }, [externalTriggerPrompt]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `m-${Date.now()}-user`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyBuffer = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: historyBuffer })
      });

      if (!response.ok) {
        let errMsg = 'فشل جلب الاستجابة من مرشد الكلمات الآن';
        try {
          const errData = await response.json();
          if (errData && errData.details) {
            errMsg = `[${errData.error || 'خطأ'}] ${errData.details}`;
          } else if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `m-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error: any) {
      console.error("Chat communication failure detail:", error);
      const errText = error instanceof Error ? error.message : String(error);
      setMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}-error`,
          role: 'assistant',
          content: `عذراً يا رفيق الحرف، لقد انقطع حبل الوصال اللغوي لبرهة جراء عائق في خادم البلاغة السحابي.\n\nتفاصيل العائق الأدبي: ${errText}\n\nهل تجرّب إرسال خاطرتك مرةً أخرى؟`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: "أهلاً بك مجدداً في حضرة الحروف الفصيحة. أنا هنا كخادم وبليغ يترجم نبضك لدرور وكلمات فريدة. تفضل بنثر مشاعرك وسنتخير الكلمة الأوفى لخلودها.",
        timestamp: new Date()
      }
    ]);
  };

  const extractWords = (text: string): string[] => {
    const found: string[] = [];
    const regex = /[«“"']([\u0621-\u064A\u0650-\u0652\u064B-\u064F\u0610-\u0614]+)[»”"']/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1] && match[1].length > 1 && !found.includes(match[1])) {
        found.push(match[1]);
      }
    }
    return found.slice(0, 3);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Trigger Button - Pin fixed to bottom-right with high priority index */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 [direction:rtl]">
        
        {/* Interactive inviting speech tooltip bubble */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-neutral-900 to-stone-900 text-neutral-100 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-xl cursor-pointer hover:border-amber-400 select-none transition group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
              <span className="text-[11px] font-bold font-sans text-neutral-200">مُستشار الكلمات ✍🏼</span>
              <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1 py-0.5 rounded-md border border-amber-400/20 group-hover:bg-amber-400/20 duration-300">اسألني</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Badge Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-11 h-11 rounded-full flex items-center justify-center relative shadow-xl transition duration-300 cursor-pointer overflow-hidden border ${
            isOpen 
              ? 'bg-neutral-950 border-white/20 text-white rotate-90' 
              : 'bg-amber-400 hover:bg-amber-300 border-amber-500/20 text-neutral-950 scale-100 hover:scale-105'
          }`}
          title="افتح محادثة مستشار الكلمات والأدب"
          id="ai-floating-chat-trigger"
        >
          {/* Animated decorative golden ring glow */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border border-dashed border-neutral-950/20 animate-spin" style={{ animationDuration: '10s' }} />
          )}

          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {/* Pulsating notification dot when there's an unseen message from previous turns */}
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-amber-400 animate-ping"></span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Main Expanded Floating Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-6 w-[360px] md:w-[410px] max-w-[95vw] h-[580px] max-h-[82vh] bg-neutral-900/98 backdrop-blur-md border border-amber-500/20 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 text-right [direction:rtl]"
            id="ai-floating-chat-window"
          >
            {/* Background glowing particles inside the floating window */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header section */}
            <div className="bg-neutral-950 p-4 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg border border-amber-500/20">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-100 font-serif-arabic">مُستشار الحروف والكلمات</h3>
                  <p className="text-[10px] text-stone-400">بليغ ديوان كِلْمَتِي التفاعلي</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Reset button inside floating window */}
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                  title="مسح الحوار وإعادة البدء"
                  id="floating-chat-reset"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {/* Minimize window button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                  title="إغلاق المحادثة"
                  id="floating-chat-close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable messages and suggestions flow */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 relative z-10 flex flex-col">
              
              {/* Introduction floating state card */}
              <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-3 text-center space-y-1 mb-2 shrink-0">
                <span className="text-[10px] font-bold text-amber-400 block">💡 هل تبحث عن فكرة لغوية ملهمة؟</span>
                <p className="text-[9.5px] text-stone-300 leading-normal">
                  اكتب خاطرتك، مشاعرك، أو اسأله عن صياغة إهداء بليغ في صك ملكيتك.
                </p>
              </div>

              {/* Messages wrapper */}
              <div className="flex-1 space-y-4">
                {messages.map((msg) => {
                  const wordsFound = msg.role === 'assistant' ? extractWords(msg.content) : [];
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2.5 max-w-[90%] ${
                        msg.role === 'user' ? 'mr-auto flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border select-none text-[10px] ${
                        msg.role === 'user' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-stone-800 border-white/5 text-amber-400'
                      }`}>
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
                      </div>

                      {/* Content Box */}
                      <div className="space-y-2">
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-sans ${
                          msg.role === 'user'
                            ? 'bg-amber-400 text-neutral-950 font-bold rounded-tr-none'
                            : 'bg-white/5 border border-white/5 text-neutral-200 rounded-tl-none whitespace-pre-wrap'
                        }`}>
                          {msg.content}
                        </div>

                        {/* Interactive dynamic word claim buttons directly in the floating chat flow */}
                        {msg.role === 'assistant' && wordsFound.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 px-1">
                            {wordsFound.map((recWord) => (
                              <button
                                key={recWord}
                                onClick={() => {
                                  onSuggestWord(recWord);
                                  // Keep it open or close so they can see booking dialog, closing heightens usability
                                  setIsOpen(false);
                                }}
                                className="text-[9px] font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 hover:border-amber-400/50 px-2 py-0.5 rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer"
                                title={`احجز كلمة «${recWord}» الآن فوراً بالديوان الموثق`}
                                id={`claim-from-floating-${recWord}`}
                              >
                                <span>حجز « {recWord} »</span>
                                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-2.5 max-w-[90%]">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 border-white/5 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-450" />
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[9px] text-stone-400 font-medium font-sans">يصوغ بياناً أدبياً...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Slider list of quick preset tags */}
              <div className="pt-2 border-t border-white/5 space-y-1.5 shrink-0">
                <span className="text-[9.5px] text-neutral-450 font-bold block">مواضيع مقترحة للمشورة:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none [direction:rtl]">
                  {PRESET_QUICK_PROMPTS.map((quick, ix) => (
                    <button
                      key={ix}
                      onClick={() => handleSendMessage(quick.prompt)}
                      disabled={isLoading}
                      className="text-[9.5px] whitespace-nowrap text-stone-300 hover:text-amber-200 bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/20 px-2.5 py-1 rounded-lg transition duration-200 flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-40"
                      id={`floating-quick-btn-${ix}`}
                    >
                      <span>{quick.icon}</span>
                      <span>{quick.text}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Input field & send action triggers bar */}
            <div className="border-t border-white/5 p-3 bg-neutral-950 shrink-0 relative z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب خاطرتك، مشاعرك، أو اطلب كلمة..."
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 text-[11px] text-neutral-100 bg-white/5 hover:bg-white/10 focus:bg-stone-850 outline-none border border-white/5 focus:border-amber-400/40 rounded-xl placeholder:text-stone-500 font-medium transition"
                  id="floating-chat-input-text"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="w-8 h-8 bg-amber-400 hover:bg-amber-300 disabled:opacity-20 disabled:scale-100 text-neutral-950 font-black rounded-lg flex items-center justify-center shrink-0 transition-transform hover:scale-103 cursor-pointer"
                  title="إرسال"
                  id="floating-chat-send-submit"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
