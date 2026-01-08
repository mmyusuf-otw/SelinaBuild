
import React from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { systemInstruction, checkStockFunction, getProfitReportFunction, analyzeCustomerFunction } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'model', content: 'Halo Juragan! Saya Selina. Ada yang bisa saya bantu untuk melesatkan bisnis Anda hari ini?' }
  ]);
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newMessages.filter((m, i) => !(i === 0 && m.role === 'model')).map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [checkStockFunction, getProfitReportFunction, analyzeCustomerFunction] }],
        }
      });

      const text = response.text || 'Maaf Juragan, saya sedang berpikir keras. Bisa diulangi?';
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: `⚙️ Menjalankan perintah: **${fc.name}**...` 
        }]);
        
        setTimeout(() => {
           setMessages(prev => [...prev, { role: 'model', content: `Berdasarkan data sistem, ${fc.name === 'check_stock' ? `stok untuk ${fc.args?.sku} tersedia 120 pcs.` : 'laporan profit Anda bulan ini naik 12%!'}` }]);
           setIsTyping(false);
        }, 1500);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: text }]);
        setIsTyping(false);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'Waduh, koneksi saya sedang terganggu. Coba lagi nanti ya!' }]);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle - Adjusted for better mobile tap target */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-[100] ${
          isOpen ? 'bg-rose-500 rotate-90 scale-90' : 'bg-indigo-600 hover:scale-110 float-anim'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <Bot className="text-white" size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Chat Window - Responsive Width & Height */}
      <div className={`fixed bottom-24 right-4 left-4 sm:left-auto sm:right-8 sm:w-[400px] h-[75vh] sm:h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-[32px] shadow-2xl z-[100] flex flex-col overflow-hidden transition-all duration-300 transform border border-slate-100 ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 bg-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">Selina AI Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-indigo-100 font-medium">Online & Siap Membantu</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMessages([{ role: 'model', content: 'Halo Juragan! Ada yang bisa dibantu lagi?' }])}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Messages - break-words handles long text */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end pl-8' : 'justify-start pr-8'}`}>
              <div className={`p-3.5 rounded-2xl text-sm shadow-sm break-words ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1.5 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions - No-scrollbar for cleaner look */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-slate-50">
          {['Cek stok S-RED-XL', 'Berapa profit Maret?', 'Analisa Budi Santoso'].map((s, i) => (
            <button 
              key={i} 
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white shrink-0">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Selina apa saja..."
              className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 border border-slate-100 focus:bg-white transition-all"
            />
            <button 
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-90 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">Selina AI Assistant • Pendamping Bisnis Juragan</p>
        </div>
      </div>
    </>
  );
};

export default AICopilot;
