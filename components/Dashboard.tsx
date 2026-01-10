
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertCircle, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  Zap, 
  Calendar,
  ChevronDown,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyzedOrder, Expense, Invoice, Product } from '../types';

type DateFilter = 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

interface DashboardProps {
  analyzedOrders: AnalyzedOrder[];
  expenses: Expense[];
  invoices: Invoice[];
  products: Product[];
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const YEARS = [2023, 2024, 2025];

const Dashboard: React.FC<DashboardProps> = ({ analyzedOrders, expenses, invoices, products }) => {
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('last30');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const filterByDate = (dateStr: string) => {
    const itemDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateFilter === 'today') {
      return itemDate.setHours(0, 0, 0, 0) === today.getTime();
    }
    if (dateFilter === 'yesterday') {
      return itemDate.setHours(0, 0, 0, 0) === yesterday.getTime();
    }
    if (dateFilter === 'last7') {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      return itemDate >= last7;
    }
    if (dateFilter === 'last30') {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      return itemDate >= last30;
    }
    if (dateFilter === 'custom') {
      return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
    }
    return true;
  };

  const filteredOrders = analyzedOrders.filter(o => filterByDate(o.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));
  const filteredInvoices = invoices.filter(inv => inv.status === 'PAID' && filterByDate(inv.date));

  // Metrics Calculation
  const revenue = filteredOrders.reduce((sum, o) => sum + o.transactionValue, 0) + 
                  filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  const hpp = filteredOrders.reduce((sum, o) => sum + o.totalHpp, 0);
  
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const payoutNet = filteredOrders.reduce((sum, o) => sum + o.payout, 0);
  
  // Profit riil = Dana yang diterima (Payout) + Invoice Paid - HPP (jika belum dihitung di payout) - Operasional
  // Namun berdasarkan Profit Analytics, profit per order sudah dihitung (Payout - HPP).
  const profitRiil = filteredOrders.reduce((sum, o) => sum + o.profit, 0) + 
                     filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) - 
                     totalExpenses;

  const lowStockCount = products.filter(p => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.some(v => v.stock <= 5);
    }
    return p.stock <= 5;
  }).length;

  // Chart Data preparation
  const chartMap: Record<string, number> = {};
  filteredOrders.forEach(o => {
    const d = new Date(o.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    chartMap[d] = (chartMap[d] || 0) + o.profit;
  });

  const chartData = Object.entries(chartMap).map(([name, profit]) => ({ name, profit })).sort((a,b) => a.name.localeCompare(b.name));

  const filterButtons = [
    { id: 'today', label: 'Hari Ini' },
    { id: 'yesterday', label: 'Kemarin' },
    { id: 'last7', label: '7 Hari' },
    { id: 'last30', label: '30 Hari' },
    { id: 'custom', label: 'Bulan & Tahun' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dashboard Header with Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ringkasan Bisnis</h2>
           <p className="text-sm text-slate-500">Pantau performa toko dari semua channel dalam satu layar.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm">
           {filterButtons.map(btn => (
             <button
               key={btn.id}
               onClick={() => setDateFilter(btn.id as DateFilter)}
               className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateFilter === btn.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               {btn.label}
             </button>
           ))}
           {dateFilter === 'custom' && (
             <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-2 animate-in slide-in-from-left-2">
               <select 
                 value={selectedMonth} 
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="bg-slate-50 border-none text-[11px] font-bold rounded-lg py-1 px-2 focus:ring-2 focus:ring-indigo-500/20 outline-none"
               >
                 {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
               </select>
               <select 
                 value={selectedYear} 
                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                 className="bg-slate-50 border-none text-[11px] font-bold rounded-lg py-1 px-2 focus:ring-2 focus:ring-indigo-500/20 outline-none"
               >
                 {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
             </div>
           )}
        </div>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bento-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
           <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform" />
           <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">True Net Profit</p>
           <h3 className="text-3xl font-black mb-4">Rp {profitRiil.toLocaleString()}</h3>
           <div className="flex items-center gap-2 text-[10px] bg-white/20 w-fit px-3 py-1.5 rounded-full font-bold">
             {profitRiil >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
             <span>{profitRiil >= 0 ? 'Profit Stabil' : 'Potensi Rugi Operasional'}</span>
           </div>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><DollarSign size={20} /></div>
            <ArrowUpRight size={16} className="text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {revenue.toLocaleString()}</h3>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all"><ShoppingBag size={20} /></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total HPP</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {hpp.toLocaleString()}</h3>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all"><AlertCircle size={20} /></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Low Stock SKU</p>
          <h3 className="text-2xl font-black text-slate-900">{lowStockCount} Item</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bento-card p-8 bg-white shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Visualisasi Profit</h4>
              <p className="text-sm text-slate-500">Laba bersih harian berdasarkan filter terpilih.</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={20} /></div>
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfitDashboard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorProfitDashboard)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <Calendar size={40} />
                </div>
                <p className="text-sm font-bold text-slate-400">Tidak ada data di periode ini.</p>
                <p className="text-xs text-slate-300">Coba ubah filter atau upload data di Profit Analytics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-8">
          <div className="bento-card p-8 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-400">
              <Zap size={18} fill="currentColor" />
              Selina Smart Action
            </h4>
            <div className="space-y-4 relative z-10">
              {lowStockCount > 0 ? (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-bold">!</div>
                   <div>
                     <p className="text-[11px] font-bold">Stok Menipis!</p>
                     <p className="text-[9px] text-slate-400">Ada {lowStockCount} SKU yang harus restok agar omzet tidak drop.</p>
                   </div>
                </div>
              ) : (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold">✓</div>
                   <div>
                     <p className="text-[11px] font-bold">Semua Aman</p>
                     <p className="text-[9px] text-slate-400">Gudang Juragan terpantau sehat hari ini.</p>
                   </div>
                </div>
              )}
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center"><Filter size={18}/></div>
                 <div>
                   <p className="text-[11px] font-bold">Analisa Selesai</p>
                   <p className="text-[9px] text-slate-400">Filter aktif: <b>{dateFilter.replace('last', 'Terakhir ')}</b></p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 bg-indigo-50 border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-indigo-600 fill-indigo-600" /> 
              Selina Insight
            </h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              {revenue > 1000000 
                ? "Performa yang luar biasa Juragan! Revenue bulan ini melampaui rata-rata. Jangan lupa cek biaya marketing agar profit tetap maksimal."
                : "Ayo naikkan omzet dengan Magic Studio! Konten video UGC terbukti menaikkan CTR hingga 3x lipat."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
