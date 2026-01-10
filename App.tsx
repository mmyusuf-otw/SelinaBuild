
import React from 'react';
import { AppTab, UserProfile, AnalyzedOrder, Expense, Product, Customer, Invoice } from './types';
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
import Expenses from './components/Expenses';
import CRM from './components/CRM';
import Profile from './components/Profile';
import PricingPage from './components/PricingPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AppTab>(AppTab.DASHBOARD);
  const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
  const [expenses, setExpenses] = React.useState<Expense[]>(MOCK_EXPENSES);
  const [analyzedOrders, setAnalyzedOrders] = React.useState<AnalyzedOrder[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>(MOCK_CUSTOMERS);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  
  // Default role diset ke USER untuk keamanan UI
  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    id: 'user-123',
    storeName: 'Toko Juragan Baru',
    ownerName: 'Juragan Selina',
    whatsapp: '08123456789',
    category: 'Fashion',
    email: 'juragan@selina.id',
    image: '',
    role: 'USER', // Ubah ke 'ADMIN' secara manual jika ingin mengetes backoffice
    plan: 'FREE',
    magicCredits: 5,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  });

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
        return <Inventory products={products} onUpdateStock={() => {}} onUpdateImage={() => {}} onAddProduct={() => {}} onBulkAddProducts={() => {}} onEditProduct={() => {}} onDeleteProduct={() => {}} />;
      case AppTab.MAGIC_STUDIO:
        return <MagicStudio />;
      case AppTab.EXPENSES:
        return <Expenses expenses={expenses} onAddExpense={() => {}} onDeleteExpense={() => {}} />;
      case AppTab.MARKETPLACE:
        return <MarketplaceAnalytics onSetAnalyzedOrders={(data) => setAnalyzedOrders(data)} />;
      case AppTab.CRM:
        return <CRM customers={customers} products={products} onAddCustomer={() => {}} onEditCustomer={() => {}} onDeleteCustomer={() => {}} onAddInvoice={() => {}} />;
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
