
import React from 'react';
import { NAVIGATION } from '../constants';
import { AppTab, UserProfile } from '../types';
import { Menu, X, Bell, UserCircle, ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';
import { logout } from '../actions/auth';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
  userProfile: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, userProfile }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isDashboard = activeTab === AppTab.DASHBOARD;

  return (
    <div className="flex h-screen overflow-hidden relative font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">S</div>
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Selina</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Scale Up Faster</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 no-scrollbar">
            {NAVIGATION.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as AppTab)}
                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-[20px] transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <div 
              className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-3 ${activeTab === AppTab.PROFILE ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-indigo-50 hover:border-indigo-100'}`}
              onClick={() => handleTabChange(AppTab.PROFILE)}
            >
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shadow-sm overflow-hidden text-indigo-600 font-black text-lg">
                {userProfile.image ? <img src={userProfile.image} alt="Logo" className="w-full h-full object-cover" /> : userProfile.storeName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{userProfile.storeName}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{userProfile.plan} PLAN</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[20px] transition-all text-sm font-black uppercase tracking-widest"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50/50 print:overflow-visible">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-8 py-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-6">
            {!isDashboard ? (
              <button 
                onClick={() => setActiveTab(AppTab.DASHBOARD)}
                className="flex items-center justify-center p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden p-3 bg-slate-100 rounded-2xl transition-all"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
            )}
            <div>
               <h2 className="text-xl font-black capitalize tracking-tight text-slate-900">{activeTab.replace('_', ' ')}</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selina Cloud Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Magic Credits</p>
                <p className="text-sm font-black text-indigo-600">{userProfile.magicCredits} Koin</p>
             </div>
             <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto print:p-0 print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
