
import React from 'react';
import { 
  Zap, 
  Cpu, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Timer, 
  HardDrive,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const USAGE_DATA = [
  { time: '10:00', tokens: 1200 },
  { time: '10:05', tokens: 1500 },
  { time: '10:10', tokens: 900 },
  { time: '10:15', tokens: 2400 },
  { time: '10:20', tokens: 1800 },
  { time: '10:25', tokens: 2800 },
  { time: '10:30', tokens: 2100 },
];

const AdminMonitor: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Engine Monitor</h2>
         <p className="text-sm text-slate-500">Pemantauan real-time infrastruktur AI Selina.</p>
      </div>

      {/* Real-time Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-50">
               <Cpu size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini 3 Pro</p>
               <h4 className="text-lg font-black text-slate-900">HEALTHY</h4>
               <p className="text-[10px] text-emerald-500 font-bold">Latency: 1.2s</p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
               <Activity size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veo 3.1 Video</p>
               <h4 className="text-lg font-black text-slate-900">ACTIVE</h4>
               <p className="text-[10px] text-indigo-500 font-bold">Avg. Render: 45s</p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
               <Timer size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Token Usage</p>
               <h4 className="text-lg font-black text-slate-900">NORMAL</h4>
               <p className="text-[10px] text-amber-600 font-bold">1.2M / Day</p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
               <HardDrive size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Cache</p>
               <h4 className="text-lg font-black text-slate-900">82% FREE</h4>
               <p className="text-[10px] text-slate-400 font-bold">UGC Video Cache</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Token Usage Chart */}
         <div className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                     <BarChart3 size={20} className="text-indigo-600" />
                     Token Consumption (TPM)
                  </h4>
                  <p className="text-xs text-slate-500">Visualisasi penggunaan token per menit untuk deteksi anomali.</p>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USAGE_DATA}>
                     <defs>
                        <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                     <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                     <Area type="monotone" dataKey="tokens" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorTokens)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Incident Log */}
         <div className="lg:col-span-4 bg-slate-950 p-8 rounded-[40px] text-white">
            <h4 className="font-black mb-6 flex items-center gap-2">
               <AlertCircle size={20} className="text-amber-500" />
               Live System Logs
            </h4>
            <div className="space-y-4">
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">10:32:01</p>
                     <p className="text-[11px] font-bold">Veo rendering completed for UserID: 882</p>
                  </div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">10:30:45</p>
                     <p className="text-[11px] font-bold">Gemini 3 Pro token limit auto-scaled</p>
                  </div>
               </div>
               <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-[10px] font-black text-amber-500 uppercase">10:28:12</p>
                     <p className="text-[11px] font-bold">High latency detected in Tokyo-Node-1</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminMonitor;
