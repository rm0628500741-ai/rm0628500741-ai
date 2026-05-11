import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Send, Sparkles, User, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIAssistantProps {
  onBack: () => void;
}

const AIAssistant = ({ onBack }: AIAssistantProps) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: i18n.language === 'ar' ? 'مرحباً! أنا مساعدك الذكي للهجرة. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am your AI Immigration Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت هو "MigrateAI Assistant"، خبير محترف ومحلل في شؤون الهجرة إلى كندا.
      مهمتك هي الإجابة على استفسارات المستخدمين وتحليل وضعياتهم بدقة واحترافية عالية.
      لغة المستخدم الحالية هي: ${i18n.language}.
      
      المطلوب منك:
      1. تحليل السؤال بعمق وتقديم إجابة شاملة.
      2. إذا سأل المستخدم عن الهجرة، تحدث عن Express Entry، PNP، Aracc، والمهن المطلوبة.
      3. كن موجزاً ولكن مفيداً جداً.
      4. استخدم لغة مهنية وودودة في نفس الوقت.
      
      سؤال المستخدم: ${userMessage}`
      });
      
      const responseText = result.text;
      
      setMessages(prev => [...prev, { role: 'model', content: responseText || "Empty response" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col h-screen overflow-hidden font-sans">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group">
            <ChevronLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 ring-1 ring-white/20">
                <Sparkles size={24} />
             </div>
             <h1 className="text-xl font-black text-white">{t('dashboard.aiAssistant')}</h1>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                  m.role === 'user' ? 'bg-blue-600' : 'bg-white/10 border border-white/10'
                }`}>
                  {m.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white/80" />}
                </div>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-2xl backdrop-blur-xl ${
                  m.role === 'user' 
                    ? 'bg-blue-600/90 text-white rounded-tr-none border border-white/10' 
                    : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/10'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
               <div className="flex gap-4 items-center bg-white/5 p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
                  <div className="relative">
                    <Loader2 className="animate-spin text-indigo-400" size={24} />
                    <Sparkles className="absolute -top-1 -right-1 text-indigo-300 animate-pulse" size={10} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">MigrateAI is thinking...</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={i18n.language === 'ar' ? 'اسأل أي شيء بموضوع الهجرة...' : 'Ask anything about migration...'}
            className="flex-1 p-5 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-500 font-semibold text-white/90 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-600/20 flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group"
          >
            <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
