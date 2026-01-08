
import React from 'react';
import { NAVIGATION } from '../constants';
import { AppTab, UserProfile } from '../types';
import { Menu, X, Bell, UserCircle, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
  userProfile: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, userProfile }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Tutup sidebar otomatis saat berpindah tab di mobile
  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isDashboard = activeTab === AppTab.DASHBOARD;

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img src="logo.png" alt="Selina Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Selina</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Seller Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {NAVIGATION.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as AppTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-indigo-50 transition-all group" onClick={() => handleTabChange(AppTab.PROFILE)}>
            <p className="text-xs font-semibold text-slate-500 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Akun Juragan</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-sm overflow-hidden">
                <img src={userProfile.image || 'logo.png'} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-700 truncate">{userProfile.storeName}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">{userProfile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Navigasi Back / Hamburger */}
            {!isDashboard ? (
              <button 
                onClick={() => setActiveTab(AppTab.DASHBOARD)}
                className="flex items-center justify-center p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft size={20} className="group-active:-translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
            )}
            
            <h2 className="text-lg font-bold capitalize tracking-tight flex items-center gap-2">
              <span className="text-slate-300 font-light lg:hidden">/</span>
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block p-2 text-slate-400 hover:text-slate-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleTabChange(AppTab.PROFILE)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none group-hover:text-indigo-600 transition-colors">{userProfile.storeName}</p>
                <p className="text-[10px] text-slate-400">Platinum Member</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-indigo-100 group-hover:border-indigo-400 p-1.5 transition-all shadow-sm overflow-hidden">
                <img src={userProfile.image || 'logo.png'} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
