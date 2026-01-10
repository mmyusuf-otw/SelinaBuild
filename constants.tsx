
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  ShoppingCart, 
  Sparkles, 
  Settings,
  CreditCard,
  Crown,
  Coins
} from 'lucide-react';

export const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'magic_studio', label: 'Magic Studio', icon: <Sparkles size={20} /> },
  { id: 'marketplace', label: 'Profit Analytics', icon: <ShoppingCart size={20} /> },
  { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
  { id: 'expenses', label: 'Jurnal Operasional', icon: <Receipt size={20} /> },
  { id: 'crm', label: 'Sales & CRM', icon: <Users size={20} /> },
  { id: 'pricing', label: 'Upgrade & Koin', icon: <CreditCard size={20} /> },
  { id: 'profile', label: 'Profil Toko', icon: <Settings size={20} /> },
];

export const PRICING_TIERS = [
  {
    id: 'FREE',
    name: 'Perintis',
    price: 0,
    credits: 5,
    features: ['Profit Analytics (Manual)', 'Inventory Basic', 'CRM Lite (50 Data)', 'Magic Studio (5 Photos/mo)'],
    isPopular: false,
    color: 'bg-slate-100'
  },
  {
    id: 'JURAGAN',
    name: 'Juragan PRO',
    price: 99000,
    credits: 100,
    features: ['Semua Fitur Perintis', 'Marketplace Auto-Sync', 'Magic Studio (Unlimited Photo)', 'Voice Magic (10 Gen/mo)', 'Laporan PDF & Excel'],
    isPopular: true,
    color: 'bg-indigo-600',
    icon: <Crown size={24} className="text-amber-400" />
  },
  {
    id: 'SULTAN',
    name: 'Sultan Business',
    price: 299000,
    credits: 500,
    features: ['Semua Fitur Juragan', 'UGC Video Generator (Veo)', 'Prioritas Support WA', 'Multi-Store Analytics', 'Integrasi API Custom'],
    isPopular: false,
    color: 'bg-slate-900',
    icon: <Crown size={24} className="text-indigo-400" />
  }
];

export const TOPUP_PACKS = [
  { id: 'COIN_50', name: 'Paket Hemat', amount: 50, price: 25000, icon: <Coins size={20} className="text-amber-500" /> },
  { id: 'COIN_150', name: 'Paket Premium', amount: 150, price: 50000, icon: <Coins size={20} className="text-indigo-500" /> },
  { id: 'COIN_500', name: 'Paket Usaha', amount: 500, price: 125000, icon: <Coins size={20} className="text-emerald-500" /> },
];

export const MOCK_PRODUCTS: any[] = [];
export const MOCK_EXPENSES: any[] = [];
export const MOCK_ORDERS: any[] = [];
export const MOCK_CUSTOMERS: any[] = [];
