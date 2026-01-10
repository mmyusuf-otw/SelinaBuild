
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { AppTab } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: AppTab.ADMIN_OVERVIEW, label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: AppTab.ADMIN_USERS, label: 'User Management', icon: <Users size={20} /> },
    { id: AppTab.ADMIN_MONITOR, label: 'AI Monitor', icon: <Activity size={20} /> },
    { id: AppTab.ADMIN_SETTINGS, label: 'Global Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Admin (Dark Theme) */}
      <aside className={`bg-slate-950 text-slate-400 transition-all duration-300 border-r border-slate-800 ${isSidebarOpen ? 'w-72' : 'w-20'} flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-4 border-b border-slate-900 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldAlert size={24} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in">
              <h1 className="text-white font-black tracking-tight leading-none">SELINA</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Super Admin</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 font-bold' 
                  : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}>
                {item.icon}
              </span>
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-900 shrink-0">
           <button 
             onClick={() => setActiveTab(AppTab.DASHBOARD)}
             className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all text-left group"
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
             {isSidebarOpen && <span className="font-bold text-sm">Keluar Backoffice</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Admin Juragan</p>
                <div className="flex items-center justify-end gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <p className="text-[10px] text-slate-400 font-bold">Root Access</p>
                </div>
             </div>
             <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400">
                <ShieldAlert size={20} />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
