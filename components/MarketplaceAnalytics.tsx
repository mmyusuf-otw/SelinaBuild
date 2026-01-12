
import React from 'react';
import { 
  Upload, 
  FileText, 
  CreditCard, 
  ArrowLeft, 
  Search,
  Download,
  Zap,
  RefreshCw,
  Bot,
  X,
  FileCheck2,
  FileX2,
  Calendar,
  ChevronDown,
  ShoppingBag,
  Users,
  MapPin,
  TrendingUp,
  LayoutGrid,
  TrendingDown,
  Info,
  // Fix: Added missing CheckCircle2 icon
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { AnalyzedOrder } from '../types';
import { parseOrdersExcel, parseIncomeExcel, parseHppExcel, calculateNetProfit, RawOrderRow, RawIncomeRow } from '../utils/profitCalculator';

type Marketplace = 'Shopee' | 'TikTok Shop Tokopedia' | 'Lazada';
type UploadType = 'order' | 'income' | 'hpp';

interface MarketplaceConfig {
  name: Marketplace;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  primaryColor: string;
}

const MARKETPLACES: MarketplaceConfig[] = [
  { 
    name: 'Shopee', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png',
    description: 'Laporan Pesanan & Penghasilan Shopee',
    primaryColor: '#ee4d2d'
  },
  { 
    name: 'TikTok Shop Tokopedia', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Tokopedia_logo.svg', 
    description: 'Laporan Settlement TikTok Tokopedia',
    primaryColor: '#00aa5b'
  },
  { 
    name: 'Lazada', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Lazada_logo.svg',
    description: 'Laporan Transaksi Lazada',
    primaryColor: '#00008b'
  },
];

interface UploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  fileName?: string;
  message?: string;
  rowCount?: number;
}

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const MarketplaceAnalytics: React.FC<{ onSetAnalyzedOrders: (data: AnalyzedOrder[]) => void }> = ({ onSetAnalyzedOrders }) => {
  const [selectedMarketplace, setSelectedMarketplace] = React.useState<Marketplace | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [isStatsVisible, setIsStatsVisible] = React.useState(true);
  
  const [uploadStates, setUploadStates] = React.useState<Record<UploadType, UploadState>>({
    order: { status: 'idle' },
    income: { status: 'idle' },
    hpp: { status: 'idle' }
  });

  const [rawOrders, setRawOrders] = React.useState<RawOrderRow[]>([]);
  const [rawIncome, setRawIncome] = React.useState<RawIncomeRow[]>([]);
  const [hppMap, setHppMap] = React.useState<Record<string, number>>({});
  const [analyzedData, setAnalyzedData] = React.useState<AnalyzedOrder[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStates(prev => ({ ...prev, [type]: { status: 'loading', fileName: file.name } }));
    try {
      if (type === 'order') {
        const data = await parseOrdersExcel(file);
        setRawOrders(data);
        setUploadStates(prev => ({ ...prev, order: { status: 'success', fileName: file.name, rowCount: data.length } }));
      } else if (type === 'income') {
        const data = await parseIncomeExcel(file);
        setRawIncome(data);
        setUploadStates(prev => ({ ...prev, income: { status: 'success', fileName: file.name, rowCount: data.length } }));
      } else if (type === 'hpp') {
        const data = await parseHppExcel(file);
        setHppMap(prev => ({ ...prev, ...data }));
        setUploadStates(prev => ({ ...prev, hpp: { status: 'success', fileName: file.name, rowCount: Object.keys(data).length } }));
      }
    } catch (err: any) {
      setUploadStates(prev => ({ ...prev, [type]: { status: 'error', message: err.message } }));
      alert(`Error: ${err.message}`);
    }
  };

  const handleProcessAnalysis = () => {
    if (rawOrders.length === 0 || rawIncome.length === 0) return alert("Harap upload minimal Data Pesanan dan Dana Dilepas.");
    setIsProcessing(true);
    setTimeout(() => {
      const { analyzed } = calculateNetProfit(rawOrders, rawIncome, hppMap);
      if (analyzed.length === 0) {
        alert("Tidak ada ID Pesanan yang cocok. Pastikan file benar.");
        setIsProcessing(false);
        return;
      }
      setAnalyzedData(analyzed);
      onSetAnalyzedOrders(analyzed);
      setIsProcessing(false);
      setShowUploadModal(false);
    }, 1200);
  };

  // Metrics
  const totalRevenue = analyzedData.reduce((sum, d) => sum + d.transactionValue, 0);
  const totalPayout = analyzedData.reduce((sum, d) => sum + d.payout, 0);
  const totalProfit = analyzedData.reduce((sum, d) => sum + d.profit, 0);
  const totalHpp = analyzedData.reduce((sum, d) => sum + d.totalHpp, 0);

  const microChartData = [{ value: 5 }, { value: 12 }, { value: 8 }, { value: 20 }, { value: 15 }, { value: 25 }];
  const pieData = [{ name: 'Baru', value: 65 }, { name: 'Lama', value: 35 }];
  
  const currentMPConfig = MARKETPLACES.find(m => m.name === selectedMarketplace);

  if (!selectedMarketplace) {
    return (
      <div className="space-y-12 py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Bot size={14} /> Profit Analytics
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pilih Marketplace Anda</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Selina akan membedah profit riil Juragan setelah dipotong komisi, biaya admin, dan selisih ongkir.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {MARKETPLACES.map((mp) => (
            <button 
              key={mp.name} 
              onClick={() => setSelectedMarketplace(mp.name)} 
              className="group p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center gap-6"
            >
              <div className={`w-24 h-24 ${mp.bgColor} rounded-3xl flex items-center justify-center p-5 transition-transform group-hover:scale-110 duration-500`}>
                <img src={mp.icon} alt={mp.name} className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900">{mp.name}</h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">{mp.description}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                 <TrendingUp size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141b2d] -m-8 lg:-m-12 p-8 lg:p-12 min-h-screen text-slate-200 font-sans animate-in fade-in duration-700 relative">
      
      {/* Header Dashboard Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setSelectedMarketplace(null)}
            className="p-3 bg-[#1f2940] border border-slate-800 rounded-2xl hover:bg-slate-800 text-slate-400 transition-all hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4 border-l border-slate-800 pl-5">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-3 shadow-lg">
              <img src={currentMPConfig?.icon} className="w-full h-full object-contain" alt={selectedMarketplace} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-none">{selectedMarketplace} Orders</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">Scale Up with AI Insights</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-[#1f2940] px-5 py-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 shadow-lg">
            <Calendar size={18} className="text-indigo-400" />
            <span>Bulan ini</span>
            <ChevronDown size={14} />
          </div>
          <button className="p-3.5 bg-[#1f2940] border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 shadow-lg active:scale-95 transition-all"><RefreshCw size={20} /></button>
        </div>
      </div>

      {/* Visibility Toggle Statistics */}
      <div className="flex justify-end mb-8">
        <button 
          onClick={() => setIsStatsVisible(!isStatsVisible)}
          className="flex items-center gap-2 px-6 py-2 bg-[#1f2940] border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-lg"
        >
          {isStatsVisible ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          {isStatsVisible ? 'Tutup Statistik Lengkap' : 'Buka Statistik Lengkap'}
        </button>
      </div>

      {isStatsVisible && (
        <div className="space-y-8 mb-10 animate-in slide-in-from-top-4 duration-500">
          
          {/* Row 1: Metrics Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              style={{ background: `linear-gradient(135deg, ${currentMPConfig?.primaryColor} 0%, #000 150%)` }}
              className="p-8 rounded-[32px] shadow-2xl relative overflow-hidden h-52 flex flex-col justify-between group"
            >
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Pesanan</p>
                <h3 className="text-6xl font-black">{analyzedData.length}</h3>
                <p className="text-[11px] font-bold opacity-60 mt-2 flex items-center gap-1">
                   <CheckCircle2 size={12} /> Pesanan Masuk
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag size={150} />
              </div>
            </div>

            {[
              { label: 'Quantity', val: analyzedData.length * 1.2, color: '#4f46e5', icon: <Bot size={20}/>, unit: 'Items' },
              { label: 'Gross Revenue', val: `Rp ${totalRevenue.toLocaleString()}`, color: '#10b981', icon: <Zap size={20}/>, unit: 'Bruto' },
              { label: 'Withdraw', val: `Rp ${totalPayout.toLocaleString()}`, color: '#8b5cf6', icon: <CreditCard size={20}/>, unit: 'Netto' }
            ].map((card, idx) => (
              <div key={idx} className="bg-[#1f2940] p-8 rounded-[32px] border border-slate-800 flex flex-col justify-between h-52 relative overflow-hidden group shadow-xl">
                 <div>
                    <div className="flex justify-between items-center mb-6">
                       <div className="p-3 bg-[#141b2d] rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors shadow-inner">{card.icon}</div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{card.label}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight">{card.val}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{card.unit}</p>
                 </div>
                 <div className="h-12 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={microChartData}>
                        <Area type="monotone" dataKey="value" stroke={card.color} fill={card.color} fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            ))}
          </div>

          {/* Row 2: Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total HPP', val: totalHpp, color: 'border-orange-500' },
              { label: 'Biaya Lainnya', val: 0, color: 'border-orange-400' },
              { label: 'Gross Profit', val: totalRevenue - totalHpp, color: 'border-emerald-500' },
              { label: 'Net Income Riil', val: totalProfit, color: 'border-blue-500' }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1f2940] p-7 rounded-[28px] border border-slate-800 hover:bg-slate-800/50 transition-all shadow-lg group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">{item.label}</p>
                <h4 className="text-xl font-black text-white">Rp {item.val.toLocaleString()}</h4>
                <div className="mt-4 h-1.5 w-10 bg-slate-700 rounded-full overflow-hidden">
                   <div className={`h-full border-b-2 ${item.color} w-full`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 3: Visual Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#1f2940] p-8 rounded-[32px] border border-slate-800 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Users size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Komposisi Pelanggan</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Perbandingan baru vs lama</p>
                  </div>
               </div>
               <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value">
                        <Cell fill="#4f46e5" stroke="#1f2940" strokeWidth={4} />
                        <Cell fill="#f59e0b" stroke="#1f2940" strokeWidth={4} />
                     </Pie>
                     <RechartsTooltip contentStyle={{ background: '#1f2940', border: 'none', borderRadius: '20px', fontSize: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                     <Legend verticalAlign="bottom" align="center" iconType="circle" />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-[#1f2940] p-8 rounded-[32px] border border-slate-800 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl"><MapPin size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Top 5 Provinsi</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Wilayah penjualan tertinggi</p>
                  </div>
               </div>
               <div className="h-60 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <MapPin size={48} className="opacity-20" />
                  <p className="text-xs italic font-medium">Data lokasi tidak tersedia di laporan standar</p>
               </div>
            </div>

            <div className="bg-[#1f2940] p-8 rounded-[32px] border border-slate-800 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl"><TrendingUp size={20} /></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Top 5 Customers</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pelanggan Nilai Belanja Tertinggi</p>
                  </div>
               </div>
               <div className="space-y-5">
                  {analyzedData.length > 0 ? analyzedData.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#141b2d] rounded-2xl border border-slate-800 group hover:border-indigo-500 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#1f2940] rounded-xl flex items-center justify-center text-[11px] font-black group-hover:bg-indigo-600 transition-all">{c.username.charAt(0)}</div>
                          <div>
                             <p className="text-xs font-bold text-slate-200">{c.username}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase">{c.date.split(' ')[0]}</p>
                          </div>
                       </div>
                       <p className="text-xs font-black text-emerald-400">Rp {c.transactionValue.toLocaleString()}</p>
                    </div>
                  )) : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500 italic text-xs gap-3">
                       <Users size={40} className="opacity-10" />
                       Upload data untuk melihat ranking
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar & Table */}
      <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1f2940] p-6 rounded-[28px] border border-slate-800 shadow-xl">
           <button 
             onClick={() => setShowUploadModal(true)} 
             className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-900/40"
           >
              <Upload size={18} /> Upload Laporan {selectedMarketplace}
           </button>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="Cari ID Pesanan / SKU..." 
                   className="w-full pl-12 pr-4 py-4 bg-[#141b2d] border border-slate-700 rounded-2xl text-xs outline-none focus:border-indigo-500 transition-all text-slate-200 shadow-inner" 
                 />
              </div>
              <button className="p-3.5 bg-[#141b2d] border border-slate-700 rounded-2xl text-slate-500 hover:text-indigo-400 transition-all active:scale-95"><LayoutGrid size={20}/></button>
              <button className="p-3.5 bg-[#141b2d] border border-slate-700 rounded-2xl text-slate-500 hover:text-emerald-400 transition-all active:scale-95"><Download size={20}/></button>
           </div>
        </div>

        {/* Orders Table - Dark Pro */}
        <div className="bg-[#1f2940] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
               <thead className="bg-[#141b2d] text-slate-500 font-black uppercase tracking-[0.15em] border-b border-slate-800/50">
                  <tr>
                     <th className="px-8 py-6">TANGGAL</th>
                     <th className="px-8 py-6">NO. PESANAN</th>
                     <th className="px-8 py-6">NAMA PRODUK</th>
                     <th className="px-8 py-6">VARIASI</th>
                     <th className="px-8 py-6 text-center">JUMLAH</th>
                     <th className="px-8 py-6 text-right">DIBAYAR CUSTOMER</th>
                     <th className="px-8 py-6 text-center">NO. RESI</th>
                     <th className="px-8 py-6">STATUS</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/40">
                  {analyzedData.length > 0 ? analyzedData.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                       <td className="px-8 py-6 text-slate-400 font-medium">{o.date.split(' ')[0]}</td>
                       <td className="px-8 py-6 font-mono text-slate-500 group-hover:text-indigo-400 transition-colors">{o.orderId}</td>
                       <td className="px-8 py-6 font-bold text-slate-200 truncate max-w-[220px]">{o.productName}</td>
                       <td className="px-8 py-6 text-slate-500 italic font-medium">{o.variant}</td>
                       <td className="px-8 py-6 text-center font-bold text-slate-300">1</td>
                       <td className="px-8 py-6 text-right font-black text-white">Rp {o.transactionValue.toLocaleString()}</td>
                       <td className="px-8 py-6 text-center font-mono text-slate-600 text-[10px]">{o.noResi || '-'}</td>
                       <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-black uppercase text-[9px] border border-emerald-500/10 flex items-center gap-1.5 w-fit">
                             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Selesai
                          </span>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-40 animate-pulse">
                           <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center">
                              <Search size={48} className="text-slate-600" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Tidak ada data cocok</p>
                              <p className="text-xs font-medium text-slate-600">Klik 'Upload Laporan' untuk mulai analisa profit.</p>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
             <div className="p-10 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-indigo-600 rounded-[20px] shadow-lg shadow-indigo-900/40"><Upload size={28} /></div>
                   <div>
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase">Marketplace Data Feed</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 italic">Process Engine by Selina AI</p>
                   </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-95"><X size={24}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {[
                     { type: 'order' as UploadType, title: '1. Data Pesanan', sub: 'Laporan > Pesanan Saya', icon: <FileText/>, color: 'indigo' },
                     { type: 'income' as UploadType, title: '2. Dana Dilepas', sub: 'Keuangan > Penghasilan', icon: <CreditCard/>, color: 'emerald' },
                     { type: 'hpp' as UploadType, title: '3. Master HPP', sub: 'Excel: SKU & Modal', icon: <Bot/>, color: 'amber' }
                   ].map(box => {
                     const state = uploadStates[box.type];
                     return (
                       <div key={box.type} className="bg-white p-8 rounded-[40px] border border-slate-200 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 bg-${box.color}-50 text-${box.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>{box.icon}</div>
                             <div>
                                <h4 className="font-black text-xs uppercase tracking-widest">{box.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{box.sub}</p>
                             </div>
                          </div>
                          <div className={`flex-1 border-4 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center gap-4 relative transition-all duration-500 ${state.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50/50 border-slate-200 hover:border-indigo-400 group-hover:bg-indigo-50/30'}`}>
                             <input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, box.type)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                             {state.status === 'loading' ? <RefreshCw className="animate-spin text-indigo-500" size={32} /> : 
                              state.status === 'success' ? <FileCheck2 className="text-emerald-500" size={32} /> : 
                              state.status === 'error' ? <FileX2 className="text-rose-500" size={32} /> : 
                              <Upload className="text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all" size={32} />}
                             
                             <div className="space-y-1">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                   {state.status === 'success' ? `${state.rowCount} Baris Valid` : 'Tarik File Ke Sini'}
                                </p>
                                {state.fileName && <p className="text-[10px] text-indigo-600 truncate max-w-[150px] font-bold mx-auto">{state.fileName}</p>}
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>

                <div className="bg-slate-950 p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
                   <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                         <Zap size={32} className="text-amber-400 fill-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-1">Selina Profit Engine</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">Ready to analyze your store performance</p>
                      </div>
                   </div>
                   <button 
                     disabled={rawOrders.length === 0 || rawIncome.length === 0 || isProcessing}
                     onClick={handleProcessAnalysis}
                     className="relative z-10 px-12 py-5 bg-indigo-600 rounded-[28px] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xl shadow-indigo-900/60 group/btn"
                   >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : <TrendingUp size={22} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                      {isProcessing ? 'PROCESSING...' : 'BEDAH PROFIT RIIL'}
                   </button>
                </div>
                
                <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex items-start gap-5">
                   <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Info size={24}/></div>
                   <div>
                      <h5 className="text-sm font-black text-amber-900 uppercase tracking-tight">Tips Import Data</h5>
                      <p className="text-xs text-amber-700 leading-relaxed font-medium mt-1">
                         Selina menggunakan **Fuzzy Column Matching**. Anda tidak perlu merubah nama kolom, asalkan format asli ekspor marketplace dipertahankan. Pastikan Data Pesanan dan Dana Dilepas berasal dari periode yang sama.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAnalytics;
