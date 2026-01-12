
import React from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  CreditCard, 
  Zap, 
  Bot, 
  BarChart3,
  Calendar,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  History,
  MousePointer2,
  // Fix: Added missing icons
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from "@google/genai";

interface AnalyticsResult {
  feesVsSubsidy: number;
  totalFees: number;
  totalSubsidy: number;
  shippingStats: { name: string; value: number }[];
  voucherRatio: number;
  topCities: { name: string; count: number }[];
  paymentMethods: { name: string; count: number }[];
  weeklyTrend: { day: string; sales: number }[];
  avgOrderCompleteTime: number; // in hours
  peakHour: number;
  avgProcessSpeed: number; // in hours
  aiSummary: string;
  rowCount: number;
}

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function InternalAnalytics() {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<AnalyticsResult | null>(null);

  const normalizeHeader = (str: any) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const cleanNumber = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).replace(/(Rp|IDR|\s|\.)/gi, "").replace(",", ".");
    return parseFloat(str) || 0;
  };

  const parseExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const headerIdx = json.findIndex(row => row.some(cell => normalizeHeader(cell).includes("nopesanan")));
        if (headerIdx === -1) throw new Error("Format file tidak dikenali. Pastikan file ekspor dari Shopee.");

        const headers = json[headerIdx].map(h => normalizeHeader(h));
        const rows = json.slice(headerIdx + 1);

        const col = (aliases: string[]) => headers.findIndex(h => aliases.some(a => h.includes(normalizeHeader(a))));
        
        const idx = {
          orderId: col(["nopesanan"]),
          adminFee: col(["biayaadministrasi", "biayalayanan"]),
          shopeeSubsidy: col(["subsidiongkirdarishopee"]),
          voucherShopee: col(["voucherditanggungshopee"]),
          revenue: col(["hargaproduk", "totalpenjualan"]),
          city: col(["kota", "kabupaten"]),
          payment: col(["metodepembayaran"]),
          created: col(["waktupesanandibuat"]),
          shipped: col(["waktupengirimandiatur"]),
          completed: col(["waktupesananselesai"])
        };

        let totalFees = 0, totalSubsidy = 0, totalVoucher = 0, totalRevenue = 0;
        let subsidizedCount = 0, nonSubsidizedCount = 0;
        const citiesMap: Record<string, number> = {};
        const paymentMap: Record<string, number> = {};
        const hoursMap: Record<number, number> = {};
        const daysMap: Record<string, number> = { 'Sen': 0, 'Sel': 0, 'Rab': 0, 'Kam': 0, 'Jum': 0, 'Sab': 0, 'Min': 0 };
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        let processTimeSum = 0, completeTimeSum = 0, timeCount = 0;

        rows.forEach(row => {
          if (!row[idx.orderId]) return;

          const adminFee = cleanNumber(row[idx.adminFee]);
          const subsidy = cleanNumber(row[idx.shopeeSubsidy]);
          const voucher = cleanNumber(row[idx.voucherShopee]);
          const rev = cleanNumber(row[idx.revenue]);

          totalFees += adminFee;
          totalSubsidy += subsidy;
          totalVoucher += voucher;
          totalRevenue += rev;

          if (subsidy > 0) subsidizedCount++; else nonSubsidizedCount++;

          const city = String(row[idx.city] || "Lainnya").replace("KOTA ", "").replace("KAB. ", "");
          citiesMap[city] = (citiesMap[city] || 0) + 1;

          const pay = String(row[idx.payment] || "Lainnya");
          paymentMap[pay] = (paymentMap[pay] || 0) + 1;

          const createdDate = new Date(row[idx.created]);
          if (!isNaN(createdDate.getTime())) {
            hoursMap[createdDate.getHours()] = (hoursMap[createdDate.getHours()] || 0) + 1;
            daysMap[dayNames[createdDate.getDay()]] += 1;
          }

          const completeDate = new Date(row[idx.completed]);
          const shippedDate = new Date(row[idx.shipped]);
          
          if (!isNaN(createdDate.getTime()) && !isNaN(shippedDate.getTime())) {
            processTimeSum += (shippedDate.getTime() - createdDate.getTime()) / (1000 * 3600);
            timeCount++;
          }
          if (!isNaN(createdDate.getTime()) && !isNaN(completeDate.getTime())) {
            completeTimeSum += (completeDate.getTime() - createdDate.getTime()) / (1000 * 3600);
          }
        });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analisislah data performa toko Shopee ini secara tajam dalam 3 kalimat:
            Total Omset: Rp${totalRevenue.toLocaleString()}, 
            Biaya Admin: Rp${totalFees.toLocaleString()}, 
            Subsidi Ongkir Shopee: Rp${totalSubsidy.toLocaleString()},
            Rasio Voucher Shopee: ${(totalVoucher / (totalRevenue || 1) * 100).toFixed(2)}%,
            Kecepatan Proses: ${(processTimeSum / (timeCount || 1)).toFixed(1)} jam.`,
          config: { 
            systemInstruction: "Kamu adalah Senior eCommerce Strategist Selina. Berikan kesimpulan finansial dan operasional yang sangat profesional." 
          }
        });

        setResult({
          feesVsSubsidy: totalSubsidy - totalFees,
          totalFees,
          totalSubsidy,
          shippingStats: [
            { name: 'Disubsidi', value: subsidizedCount },
            { name: 'Non-Subsidi', value: nonSubsidizedCount }
          ],
          voucherRatio: (totalVoucher / (totalRevenue || 1)) * 100,
          topCities: Object.entries(citiesMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5),
          paymentMethods: Object.entries(paymentMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5),
          weeklyTrend: Object.entries(daysMap).map(([day, sales]) => ({ day, sales })),
          avgOrderCompleteTime: completeTimeSum / (timeCount || 1),
          peakHour: Number(Object.entries(hoursMap).sort((a,b) => b[1] - a[1])[0]?.[0] || 0),
          avgProcessSpeed: processTimeSum / (timeCount || 1),
          aiSummary: aiResponse.text || "Data berhasil dianalisis.",
          rowCount: rows.length
        });
      } catch (err: any) {
        alert("Gagal membaca file: " + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {!result && !isProcessing && (
        <div className="max-w-3xl mx-auto text-center space-y-10 py-24">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 animate-bounce">
               <Activity className="text-white" size={44} />
            </div>
            <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={32} />
          </div>
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">Marketplace Deep Analytics</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Bedah efisiensi operasional dan finansial toko Shopee Juragan. Temukan kebocoran biaya yang selama ini tidak terlihat.</p>
          </div>
          <div className="relative group max-w-lg mx-auto">
            <input type="file" accept=".xlsx,.xls" onChange={parseExcel} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="border-4 border-dashed border-slate-200 bg-white rounded-[48px] p-16 transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30 flex flex-col items-center gap-5">
               <Upload size={56} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:scale-110" />
               <div className="space-y-1">
                 <p className="text-lg font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Tarik File Pesanan</p>
                 <p className="text-xs text-slate-400 font-bold italic">Gunakan file "Laporan Pesanan Saya" dari Shopee</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="max-w-md mx-auto py-32 text-center space-y-8 animate-in zoom-in-95">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl animate-spin">
              <RefreshCw className="text-white" size={32} />
           </div>
           <div className="space-y-2">
             <h3 className="text-xl font-black text-slate-900">Menyisir Data Shopee...</h3>
             <p className="text-sm text-slate-500 font-medium">Selina AI sedang menghitung efisiensi promosi dan kecepatan logistik Juragan.</p>
           </div>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-100">
                <BarChart3 size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Intelligence</h2>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-emerald-500" /> Analisis terhadap {result.rowCount} baris data pesanan berhasil.
                </p>
              </div>
            </div>
            <button onClick={() => setResult(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
               <X size={16} /> Reset Analisis
            </button>
          </div>

          {/* AI SUMMARY CARD */}
          <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                <Bot size={44} className="text-indigo-400" />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Selina AI Strategic Insights</p>
                <h4 className="text-xl font-bold leading-relaxed italic">"{result.aiSummary}"</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm flex flex-col justify-between group">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Zap size={24} /></div>
                  <HelpCircle size={16} className="text-slate-300" />
               </div>
               <div className="mt-8">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Efisiensi Biaya Shopee</p>
                  <h3 className={`text-3xl font-black ${result.feesVsSubsidy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.feesVsSubsidy >= 0 ? '+' : ''} Rp {result.feesVsSubsidy.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-tight">
                    Selisih antara Subsidi Ongkir (Shopee) VS Biaya Admin (Juragan).
                  </p>
               </div>
            </div>

            <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm flex flex-col justify-between group">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all"><TrendingUp size={24} /></div>
               </div>
               <div className="mt-8">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Impact Voucher Shopee</p>
                  <h3 className="text-3xl font-black text-slate-900">{result.voucherRatio.toFixed(2)}%</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-tight">
                    Rasio nilai Voucher Shopee terhadap total omset kotor toko.
                  </p>
               </div>
            </div>

            <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm flex flex-col justify-between group">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><Clock size={24} /></div>
               </div>
               <div className="mt-8">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Peak Checkout Hour</p>
                  <h3 className="text-3xl font-black text-slate-900">{result.peakHour}:00 - {(result.peakHour + 1) % 24}:00</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-tight">
                    Jam paling ramai pembeli melakukan checkout pesanan.
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Charts Section */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2">
                 <Calendar size={18} className="text-indigo-600" /> Tren Mingguan Penjualan (Qty)
               </h4>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                      />
                      <Bar dataKey="sales" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2">
                 <CreditCard size={18} className="text-indigo-600" /> Metode Pembayaran Terpopuler
               </h4>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={result.paymentMethods} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={100} 
                        paddingAngle={5} 
                        dataKey="count"
                      >
                        {result.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2">
                 <MapPin size={18} className="text-indigo-600" /> Sebaran Kota Pembeli Terbanyak
               </h4>
               <div className="space-y-4">
                  {result.topCities.map((city, i) => (
                    <div key={city.name} className="flex items-center gap-4">
                       <span className="w-6 text-[10px] font-black text-slate-300">#0{i+1}</span>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                             <span>{city.name}</span>
                             <span>{city.count} Pesanan</span>
                          </div>
                          <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                             <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${(city.count / result.topCities[0].count) * 100}%` }} 
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center gap-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0 border border-emerald-100">
                     <History size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Process Speed</p>
                     <h5 className="text-2xl font-black text-slate-900">{result.avgProcessSpeed.toFixed(1)} Jam</h5>
                     <p className="text-xs text-slate-500 font-medium">Waktu rata-rata dari Pesanan Dibuat hingga Pengiriman Diatur.</p>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0 border border-blue-100">
                     <MousePointer2 size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Completion Lead Time</p>
                     <h5 className="text-2xl font-black text-slate-900">{result.avgOrderCompleteTime.toFixed(1)} Jam</h5>
                     <p className="text-xs text-slate-500 font-medium">Waktu rata-rata dari Pesanan Dibuat hingga Pesanan Selesai (Diterima).</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
