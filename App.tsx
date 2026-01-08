
import React from 'react';
import { Plus } from 'lucide-react';
import { AppTab, Product, Expense, Customer, MarketplaceOrder, Variant, Invoice, UserProfile } from './types';
import { MOCK_PRODUCTS, MOCK_EXPENSES, MOCK_CUSTOMERS, MOCK_ORDERS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import MagicStudio from './components/MagicStudio';
import AICopilot from './components/AICopilot';
import MarketplaceAnalytics from './components/MarketplaceAnalytics';
import Expenses from './components/Expenses';
import CRM from './components/CRM';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<AppTab>(AppTab.DASHBOARD);
  const [products, setProducts] = React.useState<Product[]>(MOCK_PRODUCTS);
  const [expenses, setExpenses] = React.useState<Expense[]>(MOCK_EXPENSES);
  const [orders, setOrders] = React.useState<MarketplaceOrder[]>(MOCK_ORDERS);
  const [customers, setCustomers] = React.useState<Customer[]>(MOCK_CUSTOMERS);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile>({
    storeName: 'Selina Fashion Store',
    ownerName: 'Juragan Selina',
    whatsapp: '08123456789',
    category: 'Fashion',
    email: 'juragan@selina.id',
    image: 'logo.png'
  });

  // Profit Calculation Logic: (Marketplace Payout + Paid Invoices) - HPP - Expenses
  const calculateMetrics = () => {
    const marketplaceRevenue = orders.reduce((sum, o) => sum + o.payout, 0);
    const invoiceRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const revenue = marketplaceRevenue + invoiceRevenue;

    const hpp = orders.reduce((sum, o) => {
      let p = products.find(prod => prod.sku === o.sku);
      if (p) return sum + p.hpp;
      for (const prod of products) {
        if (prod.variants) {
          const v = prod.variants.find(varnt => varnt.sku === o.sku);
          if (v) return sum + v.hpp;
        }
      }
      return sum;
    }, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const trueProfit = revenue - hpp - totalExpenses;

    return { revenue, hpp, totalExpenses, trueProfit };
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (id.includes('-')) {
        const [productId, variantId] = id.split('-');
        if (p.id === productId && p.variants) {
          return {
            ...p,
            variants: p.variants.map(v => v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v)
          };
        }
      }
      return p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p;
    }));
  };

  const handleAddInvoice = (newInvoice: Omit<Invoice, 'id'>) => {
    const invWithId: Invoice = {
      ...newInvoice,
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
    setInvoices(prev => [...prev, invWithId]);
    
    // Auto-deduct stock for invoice items
    newInvoice.items.forEach(item => {
      const prod = products.find(p => p.sku === item.sku);
      if (prod) {
        handleUpdateStock(prod.id, -item.qty);
      } else {
        // Check variants
        products.forEach(p => {
          const v = p.variants?.find(varnt => varnt.sku === item.sku);
          if (v) handleUpdateStock(`${p.id}-${v.id}`, -item.qty);
        });
      }
    });
  };

  const handleUpdateImage = (id: string, imageUrl: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, image: imageUrl } : p));
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...newProduct, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...newExpense, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddCustomer = (newCustomer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...newCustomer, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleEditCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard metrics={calculateMetrics()} />;
      case AppTab.INVENTORY:
        return <Inventory 
          products={products} 
          onUpdateStock={handleUpdateStock} 
          onUpdateImage={handleUpdateImage} 
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />;
      case AppTab.MAGIC_STUDIO:
        return <MagicStudio />;
      case AppTab.EXPENSES:
        return <Expenses expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case AppTab.MARKETPLACE:
        return <MarketplaceAnalytics />;
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
      case AppTab.PROFILE:
        return <Profile profile={userProfile} onUpdateProfile={setUserProfile} />;
      default:
        return <Dashboard metrics={calculateMetrics()} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile}>
        {renderContent()}
      </Layout>
      <AICopilot />
    </div>
  );
};

export default App;
