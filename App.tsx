
import React from 'react';
/* Added missing Plus icon import */
import { Plus } from 'lucide-react';
import { AppTab, Product, Expense, Customer, MarketplaceOrder } from './types';
import { MOCK_PRODUCTS, MOCK_EXPENSES, MOCK_CUSTOMERS, MOCK_ORDERS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import MagicStudio from './components/MagicStudio';
import AICopilot from './components/AICopilot';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AppTab>(AppTab.DASHBOARD);
  const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
  const [expenses, setExpenses] = React.useState<Expense[]>(MOCK_EXPENSES);
  const [orders, setOrders] = React.useState<MarketplaceOrder[]>(MOCK_ORDERS);

  // Profit Calculation Logic
  const calculateMetrics = () => {
    const revenue = orders.reduce((sum, o) => sum + o.payout, 0);
    const hpp = orders.reduce((sum, o) => {
      const p = products.find(prod => prod.sku === o.sku);
      return sum + (p ? p.hpp : 0);
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const trueProfit = revenue - hpp - totalExpenses;

    return { revenue, hpp, totalExpenses, trueProfit };
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    ));
  };

  const handleUpdateImage = (id: string, imageUrl: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, image: imageUrl } : p
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard metrics={calculateMetrics()} />;
      case AppTab.INVENTORY:
        return <Inventory products={products} onUpdateStock={handleUpdateStock} onUpdateImage={handleUpdateImage} />;
      case AppTab.MAGIC_STUDIO:
        return <MagicStudio />;
      case AppTab.EXPENSES:
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in duration-500">
            <h3 className="text-xl font-bold mb-4">Jurnal Operasional</h3>
            <p className="text-slate-500 mb-8">Catat pengeluaran harian seperti Iklan, Gaji, dan Listrik untuk menghitung True Net Profit.</p>
            <div className="space-y-4 max-w-lg mx-auto">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="text-left">
                    <p className="font-bold">{e.category}</p>
                    <p className="text-xs text-slate-400">{e.description}</p>
                  </div>
                  <p className="font-bold text-rose-600">- Rp {e.amount.toLocaleString()}</p>
                </div>
              ))}
              {/* Fix: Using imported Plus icon */}
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Tambah Pengeluaran Baru
              </button>
            </div>
          </div>
        );
      case AppTab.MARKETPLACE:
        return (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Upload Data Marketplace</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Tarik file CSV Laporan Pendapatan dari Shopee atau TikTok. Selina akan menghitung profit per order secara otomatis.</p>
            <div className="flex flex-wrap gap-4 justify-center">
               <button className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all">Shopee CSV</button>
               <button className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">TikTok CSV</button>
            </div>
          </div>
        );
      case AppTab.CRM:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-bold">Customer CRM</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_CUSTOMERS.map(c => (
                <div key={c.id} className="bento-card p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 font-bold group-hover:scale-110 transition-transform">
                     {c.name.charAt(0)}
                   </div>
                   <h4 className="font-bold text-lg">{c.name}</h4>
                   <p className="text-sm text-slate-400 mb-4">{c.location}, {c.province}</p>
                   <div className="flex justify-between items-center py-2 border-t text-sm">
                      <span className="text-slate-500">Total Belanja</span>
                      <span className="font-bold text-indigo-600">Rp {c.totalSpent.toLocaleString()}</span>
                   </div>
                   <button className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Lihat History Belanja</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <Dashboard metrics={calculateMetrics()} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <AICopilot />
    </div>
  );
};

export default App;
