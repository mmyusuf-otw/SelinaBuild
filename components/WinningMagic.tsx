
import React from 'react';
import { 
  Search, 
  Link as LinkIcon, 
  Zap, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  Layout, 
  Type, 
  ImageIcon, 
  ChevronRight, 
  AlertCircle,
  Wand2,
  Trash2,
  Plus
} from 'lucide-react';
import { scrapeShopeeProduct, CompetitorData } from '../utils/scraper';
import { generateWinningFormula } from '../services/geminiService';
import { WinningFormula } from '../types';

interface WinningMagicProps {
  onAutoFillPrompt?: (prompt: string) => void;
}

const WinningMagic: React.FC<WinningMagicProps> = ({ onAutoFillPrompt }) => {
  const [urls, setUrls] = React.useState<string[]>(['', '', '']);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [loadingMsg, setLoadingMsg] = React.useState('');
  const [result, setResult] = React.useState<WinningFormula | null>(null);
  const [activeTab, setActiveTab] = React.useState<'titles' | 'desc' | 'visual'>('titles');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const messages = [
    "Sedang mengintip toko sebelah...",
    "Menganalisa keyword maut kompetitor...",
    "Mempelajari pola sukses mereka...",
    "Meracik formula produk pemenang...",
    "Optimasi SEO & Psikologi Sales..."
  ];

  const handleUrlChange = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
  };

  const addField = () => {
    if (urls.length < 5) setUrls([...urls, '']);
  };

  const removeField = (index: number) => {
    if (urls.length > 3) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = async () => {
    const filteredUrls = urls.filter(u => u.trim() !== '');
    if (filteredUrls.length < 3) return alert("Masukkan minimal 3 URL kompetitor!");

    setIsProcessing(true);
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMsg(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 2500);

    try {
      const scrapedData: CompetitorData[] = [];
      for (const url of filteredUrls) {
        const data = await scrapeShopeeProduct(url);
        scrapedData.push(data);
      }

      const formula = await generateWinningFormula(scrapedData);
      setResult(formula);
      setActiveTab('titles');
    } catch (err: any) {
      alert(err.message || "Waduh, koneksi sedang sibuk Juragan.");
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="relative mb-8">
           <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl animate-bounce">
              <Search size={40} className="text-white" />
           </div>
           <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Zap size={20} className="fill-slate-900" />
           </div>
        </div>
        <h4 className="text-2xl font-black text-slate-900 tracking-tight text-center">{loadingMsg}</h4>
        <p className="text-sm text-slate-500 mt-2">Selina AI sedang bekerja keras meracik formula maut.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {!result ? (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} /> Premium Feature
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">Winning Magic Formula</h3>
             <p className="text-sm text-slate-500 font-medium">Input 3-5 Link Produk Kompetitor terlaris. Selina akan meracik formula produk yang lebih superior untuk Anda.</p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-100/20 space-y-6">
             <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">URL Produk Kompetitor (Shopee)</label>
               {urls.map((url, idx) => (
                 <div key={idx} className="flex gap-2 group animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="relative flex-1">
                      <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        value={url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        placeholder={`Paste Link Shopee ${idx + 1}...`}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                    {urls.length > 3 && (
                      <button onClick={() => removeField(idx)} className="p-4 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                 </div>
               ))}
               
               {urls.length < 5 && (
                 <button onClick={addField} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Plus size={16} /> Tambah URL Kompetitor
                 </button>
               )}
             </div>

             <div className="pt-4">
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 group"
                >
                   <Wand2 size={20} className="group-hover:rotate-12 transition-transform" /> Analisa & Racik Formula
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                   <AlertCircle size={14} /> Membutuhkan 1 Magic Credit
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in zoom-in-95 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <button onClick={() => setResult(null)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                   <ChevronRight size={20} className="rotate-180" />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Formula Pemenang Anda</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                     {result.analysis.keywords.slice(0, 5).map(k => (
                       <span key={k} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">#{k}</span>
                     ))}
                  </div>
                </div>
             </div>
             <button onClick={handleAnalyze} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                <RefreshCw size={14} /> Riset Ulang
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm w-fit">
                   <button onClick={() => setActiveTab('titles')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'titles' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <Type size={14} /> Judul Produk
                   </button>
                   <button onClick={() => setActiveTab('desc')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'desc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <Layout size={14} /> Deskripsi AIDA
                   </button>
                   <button onClick={() => setActiveTab('visual')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'visual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <ImageIcon size={14} /> Konsep Visual
                   </button>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 lg:p-10 min-h-[400px]">
                   {activeTab === 'titles' && (
                     <div className="space-y-6 animate-in slide-in-from-left-4">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-slate-900">Opsi Judul Berperforma Tinggi</h4>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Optimized</span>
                        </div>
                        <div className="space-y-4">
                           {result.titles.map((title, i) => (
                             <div key={i} className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between gap-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{title}</p>
                                <button 
                                  onClick={() => copyToClipboard(title, `title-${i}`)}
                                  className={`shrink-0 p-3 rounded-xl transition-all ${copiedId === `title-${i}` ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-indigo-600 shadow-sm'}`}
                                >
                                   {copiedId === `title-${i}` ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'desc' && (
                     <div className="space-y-6 animate-in slide-in-from-left-4">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-slate-900">Deskripsi Copywriting (AIDA)</h4>
                           <button onClick={() => copyToClipboard(result.description, 'desc')} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                              {copiedId === 'desc' ? 'Copied!' : <><Copy size={14}/> Copy All</>}
                           </button>
                        </div>
                        <textarea 
                          defaultValue={result.description}
                          className="w-full h-[500px] p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-sm leading-relaxed text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all resize-none"
                        />
                     </div>
                   )}

                   {activeTab === 'visual' && (
                     <div className="space-y-8 animate-in slide-in-from-left-4">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-slate-900">Konsep Visual & Mockup</h4>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Conversion Style</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {result.visualPrompts.map((vp, i) => (
                             <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 group hover:border-indigo-400 transition-all flex flex-col justify-between">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Slide {i + 1}: {vp.title}</p>
                                   <p className="text-xs text-slate-500 italic leading-relaxed">"{vp.prompt}"</p>
                                </div>
                                <div className="space-y-3">
                                   <div className="p-3 bg-slate-50 rounded-xl text-[9px] text-slate-400 font-medium leading-tight">
                                      <b>Rationale:</b> {vp.rationale}
                                   </div>
                                   <button 
                                      onClick={() => onAutoFillPrompt?.(vp.prompt)}
                                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95"
                                   >
                                      <Sparkles size={14} className="fill-white" /> Buat Gambar Ini
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <div className="bento-card bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                   <h4 className="font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2">
                      <Zap size={18} className="text-amber-400 fill-amber-400" /> Competitor Insight
                   </h4>
                   <div className="space-y-6 relative z-10">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pain Points Utama</p>
                         <div className="space-y-2">
                            {result.analysis.painPoints.map((p, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                 <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5"></div>
                                 <p className="text-[11px] font-bold text-slate-200">{p}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                      <div className="p-6 bg-indigo-600/30 border border-indigo-400/20 rounded-3xl space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest">Strategic Advice</p>
                         <p className="text-[11px] text-indigo-100 leading-relaxed font-medium italic">
                            "Kompetitor Anda kuat di harga, tapi lemah di visual lifestyle. Fokuslah pada foto produk yang terlihat mewah untuk menjustifikasi harga Anda."
                         </p>
                      </div>
                   </div>
                </div>

                <div className="bento-card bg-white p-8 border border-slate-100 shadow-sm space-y-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Keyword Map</h4>
                   <div className="flex flex-wrap gap-2">
                      {result.analysis.keywords.map(k => (
                        <div key={k} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold border border-slate-100">
                           {k}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinningMagic;
