
import React from 'react';
import { AppTab, UserProfile, AnalyzedOrder, Expense, Product, Customer, Invoice, StockJournalEntry } from './types';
import { MOCK_PRODUCTS, MOCK_EXPENSES, MOCK_CUSTOMERS } from './constants';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import AdminMonitor from './components/AdminMonitor';
import AdminSettings from './components/AdminSettings';
import Inventory from './components/Inventory';
import MagicStudio from './components/MagicStudio';
import AICopilot from './components/AICopilot';
import MarketplaceAnalytics from './components/MarketplaceAnalytics';
import InternalAnalytics from './components/InternalAnalytics';
import Expenses from './components/Expenses';
import CRM from './components/CRM';
import Profile from './components/Profile';
import PricingPage from './components/PricingPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AppTab>(AppTab.DASHBOARD);
  const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
  const [expenses, setExpenses] = React.useState<Expense[]>(MOCK_EXPENSES);
  const [stockJournal, setStockJournal] = React.useState<StockJournalEntry[]>([]);
  const [analyzedOrders, setAnalyzedOrders] = React.useState<AnalyzedOrder[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>(MOCK_CUSTOMERS);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  
  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    id: 'user-123',
    storeName: 'Toko Juragan Baru',
    ownerName: 'Juragan Selina',
    whatsapp: '08123456789',
    category: 'Fashion',
    email: 'juragan@selina.id',
    image: '',
    role: 'USER',
    plan: 'FREE',
    magicCredits: 5,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  });

  // --- Inventory Handlers ---
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const productWithId: Product = { ...newProduct, id: crypto.randomUUID() };
    setProducts(prev => [...prev, productWithId]);
  };

  const handleBulkAddProducts = (newProducts: Omit<Product, 'id'>[]) => {
    const productsWithIds: Product[] = newProducts.map(p => ({ ...p, id: crypto.randomUUID() }));
    setProducts(prev => [...prev, ...productsWithIds]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateStock = (productId: string, delta: number, variantId?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        if (variantId && p.variants) {
          return {
            ...p,
            variants: p.variants.map(v => v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v)
          };
        } else {
          return { ...p, stock: Math.max(0, p.stock + delta) };
        }
      }
      return p;
    }));
  };

  const handleAddStockJournal = (entry: Omit<StockJournalEntry, 'id'>) => {
    const newEntry: StockJournalEntry = { ...entry, id: crypto.randomUUID() };
    setStockJournal(prev => [newEntry, ...prev]);
    
    const delta = entry.type === 'IN' ? entry.quantity : -entry.quantity;
    handleUpdateStock(entry.productId, delta, entry.variantId);
  };

  // --- Expense Handlers ---
  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expenseWithId: Expense = { ...newExpense, id: crypto.randomUUID() };
    setExpenses(prev => [...prev, expenseWithId]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- CRM Handlers ---
  const handleAddCustomer = (newCustomer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...newCustomer, id: crypto.randomUUID() }]);
  };

  const handleEditCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const handleAddInvoice = (newInvoice: Omit<Invoice, 'id'>) => {
    setInvoices(prev => [...prev, { ...newInvoice, id: crypto.randomUUID() }]);
  };

  const isAdminView = activeTab.startsWith('admin_');

  const handlePaymentSuccess = (planId: string, creditsToAdd: number) => {
    setUserProfile(prev => ({
      ...prev,
      plan: planId.startsWith('COIN') ? prev.plan : (planId as any),
      magicCredits: prev.magicCredits + creditsToAdd,
      subscriptionStatus: 'ACTIVE',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ADMIN_OVERVIEW:
        return <AdminDashboard />;
      case AppTab.ADMIN_USERS:
        return <AdminUserManagement />;
      case AppTab.ADMIN_MONITOR:
        return <AdminMonitor />;
      case AppTab.ADMIN_SETTINGS:
        return <AdminSettings />;
      case AppTab.DASHBOARD:
        return <Dashboard analyzedOrders={analyzedOrders} expenses={expenses} invoices={invoices} products={products} />;
      case AppTab.INVENTORY:
        return (
          <Inventory 
            products={products} 
            stockJournal={stockJournal}
            onUpdateStock={handleUpdateStock} 
            onUpdateImage={() => {}} 
            onAddProduct={handleAddProduct} 
            onBulkAddProducts={handleBulkAddProducts} 
            onEditProduct={handleEditProduct} 
            onDeleteProduct={handleDeleteProduct}
            onAddStockJournal={handleAddStockJournal}
          />
        );
      case AppTab.MAGIC_STUDIO:
        return <MagicStudio />;
      case AppTab.EXPENSES:
        return (
          <Expenses 
            expenses={expenses} 
            onAddExpense={handleAddExpense} 
            onDeleteExpense={handleDeleteExpense} 
          />
        );
      case AppTab.MARKETPLACE:
        return <MarketplaceAnalytics onSetAnalyzedOrders={(data) => setAnalyzedOrders(data)} />;
      case AppTab.INTERNAL_ANALYTICS:
        return <InternalAnalytics />;
      case AppTab.CRM:
        return (
          <CRM 
            customers={customers} 
            products={products} 
            onAddCustomer={handleAddCustomer} 
            onEditCustomer={handleEditCustomer} 
            onDeleteCustomer={handleDeleteCustomer} 
            onAddInvoice={handleAddInvoice} 
          />
        );
      case AppTab.PRICING:
        return <PricingPage currentPlan={userProfile.plan} onPaymentSuccess={handlePaymentSuccess} />;
      case AppTab.PROFILE:
        return <Profile profile={userProfile} onUpdateProfile={setUserProfile} onSwitchToAdmin={() => setActiveTab(AppTab.ADMIN_OVERVIEW)} />;
      default:
        return <Dashboard analyzedOrders={analyzedOrders} expenses={expenses} invoices={invoices} products={products} />;
    }
  };

  return (
    <div className="min-h-screen">
      {isAdminView ? (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </AdminLayout>
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile}>
          {renderContent()}
        </Layout>
      )}
      <AICopilot />
    </div>
  );
};

export default App;
