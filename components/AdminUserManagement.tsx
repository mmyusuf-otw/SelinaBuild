
import React from 'react';
import { 
  Search, 
  MoreVertical, 
  Zap, 
  ShieldCheck, 
  ShieldX, 
  UserCircle,
  TrendingUp,
  X,
  CreditCard,
  UserCog
} from 'lucide-react';
import { UserProfile, UserPlan } from '../types';
import { addMagicCredits, changeUserPlan, impersonateUser } from '../services/adminActions';

const MOCK_USERS: UserProfile[] = [
  { id: '1', storeName: 'Butik Cantik', ownerName: 'Siti Aminah', email: 'siti@butik.id', whatsapp: '081', category: 'Fashion', role: 'USER', plan: 'FREE', magicCredits: 1, createdAt: '2024-01-10', status: 'ACTIVE' },
  // Fix: Changed 'PRO' to 'JURAGAN' as 'PRO' is not a valid UserPlan value
  { id: '2', storeName: 'Gadget Mania', ownerName: 'Budi Hartono', email: 'budi@tech.id', whatsapp: '082', category: 'Tech', role: 'USER', plan: 'JURAGAN', magicCredits: 520, createdAt: '2024-02-15', status: 'ACTIVE' },
  { id: '3', storeName: 'Bakery Lezat', ownerName: 'Ani Wijaya', email: 'ani@bakery.id', whatsapp: '083', category: 'F&B', role: 'USER', plan: 'FREE', magicCredits: 0, createdAt: '2024-03-01', status: 'ACTIVE' },
];

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = React.useState<UserProfile[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = React.useState(false);
  const [creditAmount, setCreditAmount] = React.useState(5);

  const handleAddCredits = async () => {
    if (!selectedUser) return;
    await addMagicCredits(selectedUser.id, creditAmount);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, magicCredits: u.magicCredits + creditAmount } : u));
    setIsCreditModalOpen(false);
  };

  const handleChangePlan = async (userId: string, plan: UserPlan) => {
    await changeUserPlan(userId, plan);
    setUsers(users.map(u => u.id === userId ? { ...u, plan } : u));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
           <p className="text-sm text-slate-500">Kendalikan hak akses dan kuota AI seller Selina.</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input type="text" placeholder="Cari nama toko, email, atau ID..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:border-indigo-600 transition-all text-sm" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sellers</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AI Credits</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-200 group-hover:bg-white group-hover:scale-110 transition-all">
                          {u.image ? <img src={u.image} /> : u.storeName.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">{u.storeName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col gap-1.5">
                        {/* Fix: Changed check from invalid 'PRO' string to u.plan !== 'FREE' to correctly highlight paid plans */}
                        <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black ${u.plan !== 'FREE' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                           {u.plan} PLAN
                        </span>
                        <div className="flex items-center gap-1.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                           <span className="text-[10px] font-bold text-slate-500">{u.status}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <p className={`text-sm font-black ${u.magicCredits < 5 ? 'text-rose-500' : 'text-slate-900'}`}>{u.magicCredits}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tokens</p>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-xs font-bold text-slate-600">{u.createdAt}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                           onClick={() => { setSelectedUser(u); setIsCreditModalOpen(true); }}
                           className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                           title="Add Credits"
                        >
                           <Zap size={16} />
                        </button>
                        <select 
                           onChange={(e) => handleChangePlan(u.id, e.target.value as UserPlan)}
                           value={u.plan}
                           className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                           <option value="FREE">SET FREE</option>
                           {/* Fix: Updated options to reflect correct UserPlan values JURAGAN and SULTAN */}
                           <option value="JURAGAN">SET JURAGAN</option>
                           <option value="SULTAN">SET SULTAN</option>
                        </select>
                        <button 
                           onClick={() => impersonateUser(u.id)}
                           className="p-2.5 text-slate-300 hover:text-slate-900 transition-colors"
                           title="Impersonate"
                        >
                           <UserCog size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {isCreditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
              <div className="p-8 border-b bg-indigo-600 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Add Magic Credits</h3>
                    <p className="text-[10px] font-bold text-indigo-200 mt-1">GIVING POWER TO {selectedUser.storeName}</p>
                 </div>
                 <button onClick={() => setIsCreditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 text-center">
                    <Zap size={32} className="mx-auto text-indigo-600 mb-2 animate-pulse" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sisa Kredit Saat Ini</p>
                    <p className="text-3xl font-black text-slate-900">{selectedUser.magicCredits}</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Kredit Tambahan</label>
                    <input 
                       type="number" 
                       value={creditAmount} 
                       onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-center outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                    />
                 </div>
                 <button 
                    onClick={handleAddCredits}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                 >
                    Apply New Credits
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
