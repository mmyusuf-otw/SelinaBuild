
import React from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Zap, 
  Bot, 
  HelpCircle,
  X,
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
  LayoutGrid,
  Info,
  CheckCircle2,
  Trash2,
  BadgeAlert
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ZAxis, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';

interface ProductStats {
  name: string;
  traffic: number;
  cr: number;
  quadrant: 'STAR' | 'CASH_COW' | 'QUESTION' | 'DOG';
}

export default function ProductIntelligence() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [data, setData] = React.useState<ProductStats[]>([]);
  const [averages, setAverages] = React.useState({ traffic: 0, cr: 0 });
  const [search, setSearch] = React.useState("");

  const normalize = (str: any) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanPercent = (val: any) => {
    if (typeof val === 'number') return val * 100;
    if (!val) return 0;
    return parseFloat(String(val).replace('%', '').replace(',', '.')) || 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bytes = new Uint8Array(event.target?.result as ArrayBuffer);
        const wb = XLSX.read(bytes, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const headerIdx = json.findIndex(row => row.some(cell => normalize(cell).includes("halamanprodukdilihat")));
        if (headerIdx === -1) throw new Error("Format file tidak sesuai. Gunakan file 'Performa Produk' Shopee.");

        const headers = json[headerIdx].map(h => normalize(h));
        const trafficIdx = headers.findIndex(h => h.includes("halamanprodukdilihat"));
        const crIdx = headers.findIndex(h => h.includes("tingkatkonversi") && h.includes("pesanansiapdikirim"));
        const nameIdx = headers.findIndex(h => h.includes("produk") || h.includes("namaproduk"));

        const rawProducts = json.slice(headerIdx + 1)
          .filter(row => row[nameIdx] && row[trafficIdx] !== undefined)
          .map(row => ({
            name: String(row[nameIdx]),
            traffic: Number(row[trafficIdx]) || 0,
            cr: cleanPercent(row[crIdx])
          }));

        // Calculate Medians/Averages for Quadrants
        const avgTraffic = rawProducts.reduce((sum, p) => sum + p.traffic, 0) / rawProducts.length;
        const avgCr = rawProducts.reduce((sum, p) => sum + p.cr, 0) / rawProducts.length;

        const processed = rawProducts.map(p => {
          let quadrant: any = 'DOG';
          if (p.traffic >= avgTraffic && p.cr >= avgCr) quadrant = 'STAR';
          else if (p.traffic < avgTraffic && p.cr >= avgCr) quadrant = 'CASH_COW';
          else if (p.traffic >= avgTraffic && p.cr < avgCr) quadrant = 'QUESTION';
          
          return { ...p, quadrant };
        });

        setData(processed);
        setAverages({ traffic: avgTraffic, cr: avgCr });
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredData = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const getQuadrantStyle = (q: string) => {
    switch(q) {
      case 'STAR': return { label: '💎 Bintang', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', advice: 'Produk Juara. Pertahankan stok!' };
      case 'CASH_COW': return { label: 'potential Sapi Perah', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', advice: 'Iklankan produk ini sekarang!' };
      case 'QUESTION': return { label: '❓ Tanda Tanya', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', advice: 'Perbaiki Foto/Harga/Deskripsi.' };
      default: return { label: '🐶 Anjing', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', advice: 'Pertimbangkan hapus/cuci gudang.' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {!data.length && !isProcessing && (
        <div className="max-w-3xl mx-auto text-center space-y-10 py-24">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 animate-bounce">
               <Target className="text-white" size={44} />
            </div>
            <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={32} />
          </div>
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">Product Intelligence</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Upload data "Performa Produk" Shopee. Selina akan mengelompokkan produk Juragan ke dalam 4 Kuadran Strategis (BCG Matrix).</p>
          </div>
          <div className="relative group max-w-lg mx-auto">
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="border-4 border-dashed border-slate-200 bg-white rounded-[48px] p-16 transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30 flex flex-col items-center gap-5">
               <Upload size={56} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:scale-110" />
               <div className="space-y-1">
                 <p className="text-lg font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Upload Performa Produk</p>
                 <p className="text-xs text-slate-400 font-bold italic">Menu Shopee: Statistik Bisnis > Produk > Performa Produk</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="max-w-md mx-auto py-32 text-center space-y-8">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl animate-spin">
              <RefreshCw className="text-white" size={32} />
           </div>
           <h3 className="text-xl font-black text-slate-900">Menganalisa Medians Toko...</h3>
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-100">
                <Target size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Strategy Matrix</h2>
                <p className="text-sm text-slate-500 font-medium">Visualisasi performa {data.length} produk di kuadran BCG.</p>
              </div>
            </div>
            <button onClick={() => setData([])} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
               <X size={16} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* BCG SCATTER CHART */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[48px] border border-slate-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-widest text-slate-300">Y: Conversion Rate (%)</div>
               <div className="absolute bottom-8 right-8 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">X: Views (Traffic)</div>
               
               <div className="h-[500px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                     <XAxis type="number" dataKey="traffic" name="Views" hide />
                     <YAxis type="number" dataKey="cr" name="CR %" hide />
                     <ZAxis type="number" range={[100, 400]} />
                     <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            const style = getQuadrantStyle(p.quadrant);
                            return (
                              <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 max-w-[200px]">
                                <p className="text-xs font-black text-slate-900 mb-2 truncate">{p.name}</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500">Traffic: <span className="text-slate-900">{p.traffic.toLocaleString()}</span></p>
                                  <p className="text-[10px] font-bold text-slate-500">Konversi: <span className="text-slate-900">{p.cr.toFixed(2)}%</span></p>
                                  <div className={`mt-2 px-2 py-1 ${style.bg} ${style.color} rounded-lg text-[9px] font-black text-center`}>{style.label}</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                     />
                     {/* QUADRANT DIVIDERS */}
                     <ReferenceLine x={averages.traffic} stroke="#94a3b8" strokeDasharray="3 3" />
                     <ReferenceLine y={averages.cr} stroke="#94a3b8" strokeDasharray="3 3" />
                     
                     <Scatter name="Products" data={data}>
                       {data.map((entry, index) => {
                          const style = getQuadrantStyle(entry.quadrant);
                          return <Cell key={`cell-${index}`} fill={entry.quadrant === 'STAR' ? '#10b981' : entry.quadrant === 'CASH_COW' ? '#f59e0b' : entry.quadrant === 'QUESTION' ? '#4f46e5' : '#ef4444'} />;
                       })}
                     </Scatter>
                   </ScatterChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* LEGEND & QUICK STATS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl space-y-6">
                  <h4 className="font-black italic tracking-tighter uppercase flex items-center gap-2 text-indigo-400">
                    <Bot size={18} fill="currentColor" /> Strategic Map Guide
                  </h4>
                  <div className="space-y-4">
                     {[
                       { q: 'STAR', label: 'Bintang', desc: 'Produk Hero Anda. Pastikan stok melimpah & jaga rating.' },
                       { q: 'CASH_COW', label: 'Sapi Perah', desc: 'Sangat diminati tapi kurang dilihat. Tambah budget iklan!' },
                       { q: 'QUESTION', label: 'Tanda Tanya', desc: 'Dilihat banyak orang tapi gak laku. Perbaiki Foto/HPP.' },
                       { q: 'DOG', label: 'Anjing', desc: 'Produk mati. Segera cuci gudang atau hapus dari toko.' }
                     ].map(item => {
                       const style = getQuadrantStyle(item.q);
                       return (
                        <div key={item.q} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                          <p className={`text-xs font-black uppercase ${style.color}`}>{style.label}</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          </div>

          {/* RECOMMENDATION TABLE */}
          <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><LayoutGrid size={24} /></div>
                <h4 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Actionable Recommendations</h4>
              </div>
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                   type="text" 
                   placeholder="Cari produk..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                 />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-[0.15em] border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-6">Nama Produk</th>
                    <th className="px-8 py-6 text-center">Views</th>
                    <th className="px-8 py-6 text-center">Konversi</th>
                    <th className="px-8 py-6">Status Kuadran</th>
                    <th className="px-8 py-6">Saran Strategis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((p, idx) => {
                    const style = getQuadrantStyle(p.quadrant);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6 font-bold text-slate-900 max-w-xs truncate">{p.name}</td>
                        <td className="px-8 py-6 text-center font-black text-slate-500">{p.traffic.toLocaleString()}</td>
                        <td className="px-8 py-6 text-center font-black text-slate-900">{p.cr.toFixed(2)}%</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase border ${style.bg} ${style.color} ${style.border}`}>
                             {style.label}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             {p.quadrant === 'STAR' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <BadgeAlert size={14} className={style.color} />}
                             <span className="font-bold text-slate-600">{style.advice}</span>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
