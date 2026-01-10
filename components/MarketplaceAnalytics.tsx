
import React from 'react';
import { 
  Upload, 
  FileText, 
  CreditCard, 
  Database, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  PieChart as PieIcon,
  Search,
  Download,
  Filter,
  Zap,
  Save,
  RefreshCw,
  LayoutGrid,
  Bot,
  MessageSquare,
  X,
  FileCheck2,
  FileX2,
  Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { AnalyzedOrder, Product } from '../types';
import { parseOrdersExcel, parseIncomeExcel, parseHppExcel, calculateNetProfit, RawOrderRow, RawIncomeRow } from '../utils/profitCalculator';
import { analyzeTransaction } from '../services/geminiService';

type Marketplace = 'Shopee' | 'TikTok Shop Tokopedia' | 'Lazada';
type UploadType = 'order' | 'income' | 'hpp';

interface MarketplaceConfig {
  name: Marketplace;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

const MARKETPLACES: MarketplaceConfig[] = [
  { 
    name: 'Shopee', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png',
    description: 'Laporan Pesanan & Penghasilan Shopee'
  },
  { 
    name: 'TikTok Shop Tokopedia', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Tokopedia_logo.svg', 
    description: 'Laporan Settlement TikTok Tokopedia'
  },
  { 
    name: 'Lazada', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Lazada_logo.svg',
    description: 'Laporan Transaksi Lazada'
  },
];

interface UploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  fileName?: string;
  message?: string;
  rowCount?: number;
}

interface MarketplaceAnalyticsProps {
  onSetAnalyzedOrders: (data: AnalyzedOrder[]) => void;
}

const MarketplaceAnalytics: React.FC<MarketplaceAnalyticsProps> = ({ onSetAnalyzedOrders }) => {
  const [selectedMarketplace, setSelectedMarketplace] = React.useState<Marketplace | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Per-file upload states
  const [uploadStates, setUploadStates] = React.useState<Record<UploadType, UploadState>>({
    order: { status: 'idle' },
    income: { status: 'idle' },
    hpp: { status: 'idle' }
  });

  // Audit AI States
  const [aiAudits, setAiAudits] = React.useState<Record<string, { text: string, loading: boolean }>>({});
  const [activeAuditId, setActiveAuditId] = React.useState<string | null>(null);

  // File States
  const [rawOrders, setRawOrders] = React.useState<RawOrderRow[]>([]);
  const [rawIncome, setRawIncome] = React.useState<RawIncomeRow[]>([]);
  const [hppMap, setHppMap] = React.useState<Record<string, number>>({});
  const [missingSkus, setMissingSkus] = React.useState<string[]>([]);
  const [analyzedData, setAnalyzedData] = React.useState<AnalyzedOrder[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStates(prev => ({ 
      ...prev, 
      [type]: { status: 'loading', fileName: file.name } 
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (type === 'order') {
        const data = await parseOrdersExcel(file);
        setRawOrders(data);
        setUploadStates(prev => ({ 
          ...prev, 
          order: { status: 'success', fileName: file.name, rowCount: data.length } 
        }));
      } else if (type === 'income') {
        const data = await parseIncomeExcel(file);
        setRawIncome(data);
        setUploadStates(prev => ({ 
          ...prev, 
          income: { status: 'success', fileName: file.name, rowCount: data.length } 
        }));
      } else if (type === 'hpp') {
        const data = await parseHppExcel(file);
        setHppMap(prev => ({ ...prev, ...data }));
        setUploadStates(prev => ({ 
          ...prev, 
          hpp: { status: 'success', fileName: file.name, rowCount: Object.keys(data).length } 
        }));
      }
    } catch (error) {
      console.error(error);
      setUploadStates(prev => ({ 
        ...prev, 
        [type]: { status: 'error', message: 'Gagal membaca file. Pastikan format benar.' } 
      }));
    }
  };

  const downloadTemplate = (type: UploadType) => {
    let data: any[][] = [];
    let fileName = "";

    if (type === 'order') {
      data = [
        ["No. Pesanan", "Nomor Referensi SKU", "Jumlah", "Nama Produk", "Nama Variasi", "Waktu Pesanan Dibuat"],
        ["240325ABC123", "SKU-PRODUK-A", 1, "Kaos Selina Premium", "Hitam, XL", "2024-03-25 10:00:00"],
        ["240325XYZ987", "SKU-PRODUK-B", 2, "Hoodie Selina Urban", "Navy, L", "2024-03-25 11:30:00"]
      ];
      fileName = "selina_template_pesanan.xlsx";
    } else if (type === 'income') {
      data = [
        ["No. Pesanan", "Total Penghasilan", "Harga Asli Produk"],
        ["240325ABC123", 85000, 100000],
        ["240325XYZ987", 170000, 200000]
      ];
      fileName = "selina_template_dana_dilepas.xlsx";
    } else if (type === 'hpp') {
      data = [
        ["SKU", "HPP"],
        ["SKU-PRODUK-A", 45000],
        ["SKU-PRODUK-B", 65000]
      ];
      fileName = "selina_template_master_hpp.xlsx";
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, fileName);
  };

  const handleProcessAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { analyzed, missingSkus: missing } = calculateNetProfit(rawOrders, rawIncome, hppMap);
      setAnalyzedData(analyzed);
      setMissingSkus(Array.from(missing));
      onSetAnalyzedOrders(analyzed);
      setIsProcessing(false);
      setShowResults(true);
      setAiAudits({});
    }, 1500);
  };

  const handleUpdateHpp = (sku: string, value: number) => {
    const newHppMap = { ...hppMap, [sku]: value };
    setHppMap(newHppMap);
    const { analyzed, missingSkus: missing } = calculateNetProfit(rawOrders, rawIncome, newHppMap);
    setAnalyzedData(analyzed);
    setMissingSkus(Array.from(missing));
    onSetAnalyzedOrders(analyzed);
  };

  const triggerAudit = async (order: AnalyzedOrder) => {
    if (aiAudits[order.orderId]?.text) {
      setActiveAuditId(order.orderId);
      return;
    }
    setAiAudits(prev => ({ ...prev, [order.orderId]: { text: '', loading: true } }));
    setActiveAuditId(order.orderId);
    const result = await analyzeTransaction({
      sku: order.variant,
      harga_jual: order.transactionValue,
      hpp: order.totalHpp,
      potongan_total: order.transactionValue - order.payout,
      profit: order.profit
    });
    setAiAudits(prev => ({ ...prev, [order.orderId]: { text: result, loading: false } }));
  };

  const totalRevenue = analyzedData.reduce((sum, d) => sum + d.transactionValue, 0);
  const totalPayout = analyzedData.reduce((sum, d) => sum + d.payout, 0);
  const totalProfit = analyzedData.reduce((sum, d) => sum + d.profit, 0);
  const totalFees = totalRevenue > 0 ? totalRevenue - totalPayout : 0;
  const marginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const renderUploadBox = (type: UploadType, title: string, sub: string, icon: React.ReactNode, accentColor: string) => {
    const state = uploadStates[type];
    
    return (
      <div className={`bento-card p-8 bg-white border border-slate-100 flex flex-col gap-6 shadow-sm hover:border-${accentColor}-200 transition-all group overflow-hidden relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${accentColor}-50 text-${accentColor}-600 rounded-2xl`}>{icon}</div>
            <div>
              <h4 className="font-bold text-slate-900">{title}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{sub}</p>
            </div>
          </div>
          <button 
            onClick={() => downloadTemplate(type)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Download Template Excel"
          >
            <Download size={18} />
          </button>
        </div>

        <div className={`flex-1 border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center gap-3 transition-all relative
          ${state.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 
            state.status === 'error' ? 'bg-rose-50 border-rose-200' : 
            state.status === 'loading' ? 'bg-indigo-50 border-indigo-200' : 
            'bg-slate-50 border-slate-200 hover:border-indigo-400'}
        `}>
          <input type="file" accept=".xlsx" onChange={(e) => handleFileUpload(e, type)} className="absolute inset-0 opacity-0 cursor-pointer z-20" disabled={state.status === 'loading'} />
          
          {state.status === 'loading' && (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2">
              <RefreshCw size={40} className="text-indigo-500 animate-spin" />
              <p className="text-xs font-bold text-indigo-600">Membaca Excel...</p>
            </div>
          )}

          {state.status === 'success' && (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2">
              <FileCheck2 size={40} className="text-emerald-500" />
              <p className="text-sm font-black text-emerald-700">{state.rowCount} Baris Ok</p>
              <p className="text-[9px] text-emerald-600 font-medium truncate max-w-[120px]">{state.fileName}</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2">
              <FileX2 size={40} className="text-rose-500" />
              <p className="text-[10px] font-black text-rose-700 uppercase">Gagal Upload</p>
              <button onClick={(e) => { e.stopPropagation(); setUploadStates(p => ({...p, [type]: {status: 'idle'}})) }} className="text-[10px] text-rose-600 underline font-bold">Coba Lagi</button>
            </div>
          )}

          {state.status === 'idle' && (
            <>
              <Upload size={40} className="text-slate-300 group-hover:scale-110 group-hover:text-indigo-400 transition-all" />
              <p className="text-xs font-bold text-slate-400">Pilih Laporan {type}</p>
              <p className="text-[9px] text-slate-300 italic">Format: .xlsx (Shopee/TikTok)</p>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!selectedMarketplace) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-3xl font-black tracking-tight text-slate-900">Profit Analytics</h3>
          <p className="text-sm text-slate-500 font-medium">Hitung laba bersih riil setelah potongan admin & modal (HPP).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MARKETPLACES.map((mp) => (
            <button key={mp.name} onClick={() => setSelectedMarketplace(mp.name)} className="group p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className={`w-20 h-20 ${mp.bgColor} rounded-2xl flex items-center justify-center p-4 transition-transform group-hover:scale-110`}>
                <img src={mp.icon} alt={mp.name} className="w-full h-full object-contain" />
              </div>
              <div><h4 className="text-xl font-bold text-slate-900">{mp.name}</h4><p className="text-xs text-slate-400 font-medium">{mp.description}</p></div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative">
        {activeAuditId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bot size={24} className="animate-bounce" />
                  <h4 className="font-bold">Hasil Audit AI Selina</h4>
                </div>
                <button onClick={() => setActiveAuditId(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                {aiAudits[activeAuditId]?.loading ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <RefreshCw className="animate-spin text-indigo-500" size={32} />
                    <p className="text-sm font-bold text-slate-400">Sedang memelototi data...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-slate-700 text-sm leading-relaxed">
                      "{aiAudits[activeAuditId]?.text}"
                    </div>
                    <button 
                      onClick={() => setActiveAuditId(null)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Siap, Paham!
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowResults(false)} 
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
              title="Kembali ke Upload"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Hasil Analisa {selectedMarketplace}</h3>
              <p className="text-sm text-slate-500 font-medium">{analyzedData.length} Pesanan Berhasil Diproses</p>
            </div>
          </div>
        </div>

        {missingSkus.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-8 space-y-6">
             <div className="flex items-center gap-4 text-rose-700">
                <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertTriangle size={24} className="animate-pulse" /></div>
                <div>
                   <h4 className="font-black text-lg">Ada {missingSkus.length} SKU Tanpa Harga Modal!</h4>
                   <p className="text-sm opacity-80">Profit belum akurat. Masukkan HPP di bawah untuk update otomatis.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missingSkus.map(sku => (
                   <div key={sku} className="bg-white p-4 rounded-2xl border border-rose-200 flex items-center justify-between shadow-sm group hover:border-rose-400 transition-all">
                      <code className="text-xs font-mono font-bold text-slate-600 truncate mr-2">{sku}</code>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400">Rp</span>
                         <input 
                            type="number" 
                            placeholder="Input HPP..."
                            onBlur={(e) => handleUpdateHpp(sku, Number(e.target.value))}
                            className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 font-bold"
                         />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bento-card p-8 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Net Profit</p>
              <h3 className="text-2xl font-black">Rp {totalProfit.toLocaleString()}</h3>
           </div>
           <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Payout ({selectedMarketplace})</p>
              <h3 className="text-2xl font-black text-slate-900">Rp {totalPayout.toLocaleString()}</h3>
           </div>
           <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Potongan Admin</p>
              <h3 className="text-2xl font-black text-rose-500">Rp {totalFees.toLocaleString()}</h3>
           </div>
           <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Net Margin</p>
              <h3 className="text-2xl font-black text-emerald-600">{marginPercentage.toFixed(1)}%</h3>
           </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h4 className="font-black text-slate-900">Rincian Transaksi & Audit AI</h4>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all"><Download size={14}/> Export Laporan</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5">No Pesanan</th>
                    <th className="px-8 py-5">Produk Terjual</th>
                    <th className="px-8 py-5 text-right">Laba Bersih</th>
                    <th className="px-8 py-5 text-center">Audit AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analyzedData.map((order) => {
                    const isBoncos = order.profit < 0;
                    const isThinMargin = order.transactionValue > 0 && (order.profit / order.transactionValue) < 0.05;
                    const needsAudit = isBoncos || isThinMargin;

                    return (
                      <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 text-[10px] font-mono font-bold text-slate-400">{order.orderId}</td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[280px]">{order.productName}</p>
                          <p className="text-[10px] text-indigo-500 font-black uppercase">{order.variant}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${order.profit > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            Rp {order.profit.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          {needsAudit ? (
                            <button 
                              onClick={() => triggerAudit(order)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${aiAudits[order.orderId]?.text ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white'}`}
                              title="Klik untuk Audit AI"
                            >
                              <Bot size={18} className={aiAudits[order.orderId]?.loading ? 'animate-spin' : ''} />
                            </button>
                          ) : (
                            <div className="flex items-center justify-center text-emerald-500">
                               <CheckCircle2 size={18} />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedMarketplace(null)} 
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
            title="Kembali ke Pilihan Marketplace"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Upload Laporan {selectedMarketplace}</h3>
            <p className="text-sm text-slate-500 font-medium">Lengkapi data di bawah untuk menghitung profit otomatis.</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-3xl">
          <Info size={20} className="text-indigo-600 shrink-0" />
          <p className="text-[10px] font-bold text-indigo-700 leading-tight">
            Gunakan tombol <Download size={12} className="inline" /> di pojok kanan setiap kartu <br/> untuk mengunduh template format Excel yang sesuai.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {renderUploadBox('order', '1. Data Pesanan', 'File: Pesanan.xlsx', <FileText size={24} />, 'indigo')}
         {renderUploadBox('income', '2. Dana Dilepas', 'File: Penghasilan.xlsx', <CreditCard size={24} />, 'emerald')}
         {renderUploadBox('hpp', '3. Master HPP', 'File: Katalog_Modal.xlsx', <LayoutGrid size={24} />, 'amber')}
      </div>

      <div className="bg-slate-900 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between text-white gap-8 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="relative z-10 text-center md:text-left">
            <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Selina AI Profit Logic</h4>
            <p className="text-sm text-slate-400 font-medium">Pastikan No. Pesanan di kedua file cocok untuk hasil akurat.</p>
         </div>
         <button 
            disabled={uploadStates.order.status !== 'success' || uploadStates.income.status !== 'success' || isProcessing}
            onClick={handleProcessAnalysis}
            className="relative z-10 px-12 py-5 bg-indigo-600 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
          >
            {isProcessing ? <RefreshCw className="animate-spin" /> : <Zap size={20} className="fill-white"/>}
            {isProcessing ? 'Menghitung Profit...' : 'Analisa Laba Sekarang'}
          </button>
      </div>
    </div>
  );
};

export default MarketplaceAnalytics;
