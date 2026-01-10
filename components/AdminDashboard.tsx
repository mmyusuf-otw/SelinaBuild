
import React from 'react';
import { Users, Zap, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

const MOCK_ADMIN_USERS: UserProfile[] = [
  { id: '1', storeName: 'Butik Cantik', ownerName: 'Siti', email: 'siti@butik.id', whatsapp: '081', category: 'Fashion', role: 'USER', plan: 'FREE', magicCredits: 1, createdAt: '2024-01-10', status: 'ACTIVE' },
  // Fix: Changed 'PRO' to 'JURAGAN' as 'PRO' is not a valid member of the UserPlan type
  { id: '2', storeName: 'Gadget Mania', ownerName: 'Budi', email: 'budi@tech.id', whatsapp: '082', category: 'Tech', role: 'USER', plan: 'JURAGAN', magicCredits: 50, createdAt: '2024-02-15', status: 'ACTIVE' },
  { id: '3', storeName: 'Kedai Kopi', ownerName: 'Andi', email: 'andi@kopi.id', whatsapp: '083', category: 'F&B', role: 'USER', plan: 'FREE', magicCredits: 0, createdAt: '2024-03-01', status: 'ACTIVE' },
];

const AdminDashboard: React.FC = () => {
  const totalUsers = MOCK_ADMIN_USERS.length;
  const totalCredits = MOCK_ADMIN_USERS.reduce((sum, u) => sum + u.magicCredits, 0);
  const lowCreditUsers = MOCK_ADMIN_USERS.filter(u => u.magicCredits < 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Overview</h2>
         <p className="text-sm text-slate-500">Monitor kesehatan ekosistem Selina secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-950 text-white rounded-2xl group-hover:scale-110 transition-transform"><Users size={24} /></div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12% New</span>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Active Users</p>
           <h3 className="text-4xl font-black text-slate-900">{totalUsers} <span className="text-slate-300 text-sm font-normal">Sellers</span></h3>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl group-hover:scale-110 transition-transform"><Zap size={24} /></div>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Circulating Credits</p>
           <h3 className="text-4xl font-black text-slate-900">{totalCredits} <span className="text-slate-300 text-sm font-normal">Magic</span></h3>
        </div>

        <div className="bg-rose-600 p-8 rounded-[32px] text-white shadow-xl shadow-rose-100 group relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform"><TrendingUp size={120} /></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3 bg-white/20 text-white rounded-2xl"><AlertTriangle size={24} /></div>
           </div>
           <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">Low Credit Sellers</p>
           <h3 className="text-4xl font-black relative z-10">{lowCreditUsers.length} <span className="text-rose-200 text-sm font-normal">Accounts</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[40px] border border-slate-200">
            <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
               <TrendingUp size={20} className="text-indigo-600" />
               Critical Accounts (Credit &lt; 2)
            </h4>
            <div className="space-y-4">
               {lowCreditUsers.map(u => (
                 <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-200">{u.storeName.charAt(0)}</div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">{u.storeName}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-rose-500">{u.magicCredits} Magic</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Needs Upsell</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
