
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      // Fixed: Initialize GoogleGenAI with exactly the required named parameter and no fallbacks
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        })), { role: 'user', parts: [{ text: userMsg }] }],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [checkStockFunction, getProfitReportFunction, analyzeCustomerFunction] }],
        }
      });

      // Fixed: Use .text property directly
      const text = response.text || 'Maaf Juragan, saya sedang berpikir keras. Bisa diulangi?';
      
      // Handle potential tool calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: `⚙️ Menjalankan perintah: **${fc.name}**...` 
        }]);
        
        // Simulating logic for this front-end demo
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
      {/* Floating Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-[100] ${
          isOpen ? 'bg-rose-500 rotate-90' : 'bg-indigo-600 hover:scale-110 float-anim'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <Bot className="text-white" size={32} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-28 right-8 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden transition-all duration-300 transform border border-slate-100 ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-bold">Selina AI Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-indigo-100">Ready to help</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg" onClick={() => setMessages([{ role: 'model', content: 'Halo Juragan! Ada yang bisa dibantu lagi?' }])}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
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
              <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50/50">
          {['Cek stok SKU...', 'Laporan profit...', 'Analisa Budi...'].map((s, i) => (
            <button 
              key={i} 
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Selina apa saja..."
              className="flex-1 bg-slate-50 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 transition-all"
            />
            <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">Selina AI bisa berbuat kesalahan. Cek ulang info penting.</p>
        </div>
      </div>
    </>
  );
};

export default AICopilot;
