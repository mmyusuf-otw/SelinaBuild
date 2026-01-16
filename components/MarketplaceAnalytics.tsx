
import React from 'react';
import { 
  Upload, 
  ArrowLeft, 
  Search,
  Download,
  Zap,
  RefreshCw,
  Bot,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Calculator,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileSearch,
  LayoutGrid,
  Sparkles,
  Info,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { processReconciliation, ReconResult } from '../utils/profitCalculator';
import * as XLSX from 'xlsx';

type Platform = 'Shopee' | 'TikTok Shop';

export default function MarketplaceAnalytics() {
  const [step, setStep] = React.useState<'platform' | 'upload' | 'processing' | 'result'>('platform');
  const [selectedPlatform, setSelectedPlatform] = React.useState<Platform | null>(null);
  const [files, setFiles] = React.useState<{ [key: string]: File | null }>({
    orderReport: null,
    settlementReport: null,
    productMaster: null
  });
  const [reconData, setReconData] = React.useState<ReconResult | null>(null);
  const [search, setSearch] = React.useState("");

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const downloadMasterTemplate = () => {
    const data = [
      ['SKU', 'HPP (Modal)', 'Nama Produk'],
      ['SKU-001', 50000, 'Produk Contoh A'],
      ['SKU-002', 75000, 'Produk Contoh B']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master Data");
    XLSX.writeFile(wb, "selina_product_master_template.xlsx");
  };

  const startReconciliation = async () => {
    if (!files.orderReport || !files.settlementReport || !files.productMaster) {
      alert("Harap lengkapi ke-3 file laporan untuk memulai audit.");
      return;
    }

    setStep('processing');
    try {
      const result = await processReconciliation({
        orderReport: files.orderReport,
        settlementReport: files.settlementReport,
        productMaster: files.productMaster
      });
      setReconData(result);
      // Animasi delay untuk AI feel
      setTimeout(() => setStep('result'), 2000);
    } catch (err: any) {
      alert("Error Analisis: " + err.message);
      setStep('upload');
    }
  };

  const reset = () => {
    setStep('platform');
    setSelectedPlatform(null);
    setFiles({ orderReport: null, settlementReport: null, productMaster: null });
    setReconData(null);
  };

  const filteredOrders = reconData?.orders.filter(o => 
    o.orderId.toLowerCase().includes(search.toLowerCase()) || 
    o.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="bg-[#141b2d] -m-8 lg:-m-12 p-8 lg:p-12 min-h-screen text-slate-200 font-sans animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-5">
          {step !== 'platform' && (
            <button onClick={reset} className="p-3 bg-[#1f2940] border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Reconciliation Engine 4.0</h1>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">3-Way Financial Audit System</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Military-Grade Precision</span>
          </div>
        </div>
      </div>

      {/* STEP 1: PLATFORM SELECTION */}
      {step === 'platform' && (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Pilih Platform Marketplace</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Selina akan membedah profit riil Juragan dan membandingkan omset hulu dengan dana yang benar-benar cair di bank.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Shopee' as Platform, color: 'hover:border-orange-500', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png' },
              { name: 'TikTok Shop' as Platform, color: 'hover:border-slate-400', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/TikTok_logo.svg/2560px-TikTok_logo.svg.png' }
            ].map((p) => (
              <button 
                key={p.name} 
                onClick={() => { setSelectedPlatform(p.name); setStep('upload'); }}
                className={`group relative p-12 bg-[#1f2940] border border-slate-800 rounded-[48px] ${p.color} transition-all flex flex-col items-center text-center gap-8 shadow-2xl hover:-translate-y-2 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center p-5 shadow-inner border border-slate-700">
                  <img src={p.icon} alt={p.name} className="w-full h-full object-contain filter group-hover:brightness-125 transition-all" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-white">{p.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 italic">Start 3-Way Matching</p>
                </div>
                <div className="w-14 h-14 bg-white/5 text-slate-500 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg border border-slate-700">
                   <ArrowRight size={24} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: TRIPLE FILE UPLOADER */}
      {step === 'upload' && selectedPlatform && (
        <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-500">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Siapkan Data Audit {selectedPlatform}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Upload 3 laporan mentah berikut. Selina akan mendeteksi selisih pembayaran dan kebocoran biaya otomatis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Uploader 
              id="orderReport"
              label="1. Order Report" 
              desc="Ekspor 'Pesanan Saya' (XLSX)" 
              icon={<FileSearch className="text-indigo-400" />} 
              file={files.orderReport} 
              onFile={(f) => handleFileChange('orderReport', f)} 
            />
            <Uploader 
              id="settlementReport"
              label="2. Settlement Report" 
              desc="Ekspor 'Penghasilan Saya' (XLSX)" 
              icon={<Database className="text-emerald-400" />} 
              file={files.settlementReport} 
              onFile={(f) => handleFileChange('settlementReport', f)} 
            />
            <Uploader 
              id="productMaster"
              label="3. Product Master" 
              desc="SKU & HPP Toko Anda" 
              icon={<Calculator className="text-amber-400" />} 
              file={files.productMaster} 
              onFile={(f) => handleFileChange('productMaster', f)} 
              templateAction={downloadMasterTemplate}
            />
          </div>

          <div className="flex flex-col items-center gap-6 pt-10">
            <button 
              onClick={startReconciliation}
              className="px-16 py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!files.orderReport || !files.settlementReport || !files.productMaster}
            >
              Jalankan Rekonsiliasi <Zap size={20} fill="currentColor" />
            </button>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-[#1f2940] px-4 py-2 rounded-full border border-slate-800">
              <ShieldCheck size={14} className="text-emerald-500" /> Aman & Diproses Lokal di Browser
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROCESSING ANIMATION */}
      {step === 'processing' && (
        <div className="max-w-md mx-auto py-40 text-center space-y-10 animate-in zoom-in-95">
          <div className="relative">
            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-bounce">
               <Bot className="text-white" size={48} />
            </div>
            <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Analyzing Multi-Streams...</h3>
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Applying Self-Healing & 3-Way Cross Match</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT DASHBOARD */}
      {step === 'result' && reconData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Gross Revenue (Orders)" val={reconData.summary.totalRevenue} color="text-indigo-400" />
            <StatCard label="Actual Settlement" val={reconData.summary.totalActualPayout} color="text-emerald-400" />
            <StatCard label="Total HPP (Master)" val={reconData.summary.totalHpp} color="text-slate-400" />
            <div className="p-8 bg-indigo-600 rounded-[32px] border border-indigo-400/20 flex flex-col justify-between h-44 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><TrendingUp size={80}/></div>
               <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Net Profit After Fees</p>
               <div>
                 <h3 className="text-3xl font-black text-white">Rp {reconData.summary.totalProfit.toLocaleString()}</h3>
                 <p className="text-[9px] font-bold text-indigo-200 uppercase mt-1">Real-time Margin Analysis</p>
               </div>
            </div>
          </div>

          {/* Mismatch Alert Box */}
          {reconData.summary.totalMismatches > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-pulse">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/20">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-400 uppercase italic">Financial Discrepancy Found!</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 leading-relaxed">
                    Terdapat {reconData.summary.totalMismatches} transaksi dengan dana tidak cocok (Selisih: Rp {Math.abs(reconData.summary.totalGap).toLocaleString()}). <br/> 
                    Kemungkinan: Paket Hilang, Penalty, atau Admin Fee berubah.
                  </p>
                </div>
              </div>
              <button onClick={() => window.print()} className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2">
                <Download size={14} /> Download PDF Audit
              </button>
            </div>
          )}

          {/* Detailed Recon Ledger */}
          <div className="bg-[#1f2940] rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/40"><LayoutGrid size={24} /></div>
                <div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">3-Way Recon Ledger</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Log for {selectedPlatform}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari ID Pesanan / Pembeli..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-80 pl-11 pr-4 py-3 bg-[#141b2d] border border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all text-slate-200" 
                  />
                </div>
                <button onClick={() => window.print()} className="p-3 bg-[#141b2d] border border-slate-700 rounded-xl text-slate-400 hover:text-emerald-400 transition-all"><Download size={20}/></button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#141b2d] text-slate-500 font-black uppercase tracking-[0.15em] border-b border-slate-800/50">
                  <tr>
                    <th className="px-8 py-6">Order ID</th>
                    <th className="px-8 py-6">Buyer (Healed)</th>
                    <th className="px-8 py-6 text-right">Order Rev.</th>
                    <th className="px-8 py-6 text-right">Actual Settlement</th>
                    <th className="px-8 py-6 text-right">Cost (HPP)</th>
                    <th className="px-8 py-6 text-right">Net Profit</th>
                    <th className="px-8 py-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredOrders.map((o, idx) => (
                    <tr key={idx} className={`hover:bg-slate-800/40 transition-colors group ${o.status === 'MISMATCH' ? 'bg-rose-500/5' : ''}`}>
                      <td className="px-8 py-6 font-mono text-slate-500 group-hover:text-indigo-400 transition-colors uppercase">{o.orderId}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-500/10 text-indigo-400 rounded flex items-center justify-center font-black text-[9px] uppercase">{o.username.charAt(0)}</div>
                          <span className="font-bold text-slate-200">{o.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-slate-400">Rp {o.transactionValue.toLocaleString()}</td>
                      <td className={`px-8 py-6 text-right font-black ${o.status === 'MISMATCH' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        Rp {o.payout.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-slate-500">Rp {o.totalHpp.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-black text-white">Rp {o.profit.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] flex items-center justify-center gap-1.5 mx-auto w-24 border ${
                          o.status === 'PROOF' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        }`}>
                          {o.status === 'PROOF' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Uploader({ id, label, desc, icon, file, onFile, templateAction }: { 
  id: string, label: string, desc: string, icon: React.ReactNode, file: File | null, onFile: (f: File | null) => void, templateAction?: () => void 
}) {
  return (
    <div className="bg-[#1f2940] p-8 rounded-[40px] border border-slate-800 shadow-xl group hover:border-indigo-500 transition-all relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      
      <div className="flex flex-col items-center text-center gap-6 flex-1">
        <div className="w-16 h-16 bg-[#141b2d] border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform group-hover:rotate-6">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-black text-white uppercase tracking-tighter">{label}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{desc}</p>
        </div>

        <div className="relative w-full mt-auto">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />
          <div className={`w-full py-5 px-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border transition-all ${
            file ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'bg-[#141b2d] border-slate-700 text-slate-500 group-hover:border-slate-500'
          }`}>
            {file ? <><CheckCircle2 size={14}/> {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}</> : <><Upload size={14}/> Select File</>}
          </div>
        </div>
      </div>

      {templateAction && (
        <button 
          onClick={(e) => { e.stopPropagation(); templateAction(); }}
          className="mt-6 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <FileSpreadsheet size={14} /> Download Template
        </button>
      )}
    </div>
  );
}

function StatCard({ label, val, color }: { label: string, val: number, color: string }) {
  return (
    <div className="p-8 bg-[#1f2940] rounded-[32px] border border-slate-800 flex flex-col justify-between h-44 shadow-xl relative group">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <div>
        <h3 className={`text-2xl font-black ${color}`}>Rp {val.toLocaleString()}</h3>
        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-1">
          <ShieldCheck size={10} /> Audit Verified
        </p>
      </div>
    </div>
  );
}
