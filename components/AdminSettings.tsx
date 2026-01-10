
import React from 'react';
import { 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  CreditCard, 
  Globe, 
  Lock,
  Save,
  MessageSquare
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [allowNewUsers, setAllowNewUsers] = React.useState(true);
  const [veoEnabled, setVeoEnabled] = React.useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">Global System Settings</h2>
         <p className="text-sm text-slate-500">Pusat kendali fitur dan kebijakan ekosistem Selina.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Feature Flags */}
         <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-4">
               <Zap size={20} className="text-indigo-600" />
               Feature Toggles
            </h4>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:border-indigo-100 border border-transparent transition-all">
                  <div>
                     <p className="text-sm font-black text-slate-900">UGC Video Generation (Veo)</p>
                     <p className="text-[10px] text-slate-400">Aktifkan fitur pembuatan video untuk semua user PRO.</p>
                  </div>
                  <button onClick={() => setVeoEnabled(!veoEnabled)} className="text-indigo-600">
                     {veoEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                  </button>
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:border-indigo-100 border border-transparent transition-all">
                  <div>
                     <p className="text-sm font-black text-slate-900">New User Registration</p>
                     <p className="text-[10px] text-slate-400">Tutup pendaftaran jika server sedang penuh beban.</p>
                  </div>
                  <button onClick={() => setAllowNewUsers(!allowNewUsers)} className="text-indigo-600">
                     {allowNewUsers ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                  </button>
               </div>

               <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div>
                     <p className="text-sm font-black text-rose-900">System Maintenance Mode</p>
                     <p className="text-[10px] text-rose-400">Tampilkan halaman pemeliharaan dan kunci semua akses.</p>
                  </div>
                  <button onClick={() => setMaintenanceMode(!maintenanceMode)} className="text-rose-600">
                     {maintenanceMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-300" />}
                  </button>
               </div>
            </div>
         </div>

         {/* Pricing & Policy */}
         <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b pb-4">
               <CreditCard size={20} className="text-indigo-600" />
               Pricing & Economy
            </h4>
            
            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Magic Credit Price (Rp)</label>
                  <input type="number" defaultValue={25000} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Plan Limit</label>
                     <input type="number" defaultValue={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Response Time</label>
                     <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                        <option>Under 1 Hour</option>
                        <option>Under 4 Hours</option>
                        <option>Next Day</option>
                     </select>
                  </div>
               </div>
               
               <div className="pt-4">
                  <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                     <Save size={18} /> Save Global Config
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminSettings;
