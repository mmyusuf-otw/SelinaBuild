
import React from 'react';
import { TrendingUp, TrendingDown, Package, AlertCircle, ShoppingBag, DollarSign, ArrowUpRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Sen', profit: 4000 },
  { name: 'Sel', profit: 3000 },
  { name: 'Rab', profit: 2000 },
  { name: 'Kam', profit: 2780 },
  { name: 'Jum', profit: 1890 },
  { name: 'Sab', profit: 2390 },
  { name: 'Min', profit: 3490 },
];

const Dashboard: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bento-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
           <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform" />
           <p className="text-indigo-100 text-sm font-medium mb-1">True Net Profit</p>
           <h3 className="text-3xl font-bold mb-4">Rp {metrics.trueProfit.toLocaleString()}</h3>
           <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-full">
             <TrendingUp size={12} />
             <span>+12.5% vs bulan lalu</span>
           </div>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8%</span>
          </div>
          <p className="text-slate-500 text-sm">Total Revenue</p>
          <h3 className="text-2xl font-bold">Rp {metrics.revenue.toLocaleString()}</h3>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ShoppingBag size={20} /></div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-2%</span>
          </div>
          <p className="text-slate-500 text-sm">HPP Terjual</p>
          <h3 className="text-2xl font-bold">Rp {metrics.hpp.toLocaleString()}</h3>
        </div>

        <div className="bento-card p-6 bg-white shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={20} /></div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">3 Alert</span>
          </div>
          <p className="text-slate-500 text-sm">Low Stock Alert</p>
          <h3 className="text-2xl font-bold">5 SKU</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bento-card p-8 bg-white shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Tren Profit Harian</h4>
              <p className="text-sm text-slate-500">Visualisasi laba bersih 7 hari terakhir</p>
            </div>
            <select className="text-sm border-none bg-slate-100 rounded-lg px-3 py-1 font-medium outline-none">
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Low Stock */}
        <div className="space-y-6">
          <div className="bento-card p-6 bg-white border border-slate-100">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Low Stock Alert
            </h4>
            <div className="space-y-4">
              {[
                { sku: 'S-BLUE-M', stock: 5, name: 'Kaos Selina Blue M' },
                { sku: 'ACC-RING-01', stock: 2, name: 'Cincin Titanium Silver' },
              ].map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{item.sku}</p>
                    <p className="text-[10px] text-slate-500">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-600">{item.stock} left</p>
                    <button className="text-[10px] text-indigo-600 font-bold hover:underline">Restock Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-6 bg-indigo-50 border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">💡 Selina Insight</h4>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Penjualan produk <b>S-RED-XL</b> sedang naik 20%! Pertimbangkan untuk menambah stok 50 pcs sebelum akhir bulan.
            </p>
            <button className="mt-4 flex items-center gap-2 text-indigo-700 font-bold text-sm hover:translate-x-1 transition-transform">
              Lihat Analisa Detail <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
