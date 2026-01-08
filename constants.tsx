
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  ShoppingCart, 
  Sparkles, 
  Settings,
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Upload,
  Bot
} from 'lucide-react';

export const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'magic_studio', label: 'Magic Studio', icon: <Sparkles size={20} /> },
  { id: 'marketplace', label: 'Profit Analytics', icon: <ShoppingCart size={20} /> },
  { id: 'inventory', label: 'Gudang Digital', icon: <Package size={20} /> },
  { id: 'expenses', label: 'Jurnal Operasional', icon: <Receipt size={20} /> },
  { id: 'crm', label: 'Sales & CRM', icon: <Users size={20} /> },
  { id: 'profile', label: 'Profil Toko', icon: <Settings size={20} /> },
];

export const MOCK_PRODUCTS: any[] = [
  { id: '1', sku: 'S-RED-XL', name: 'Kaos Selina Red XL', hpp: 45000, price: 85000, stock: 120, category: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '2', sku: 'S-BLUE-M', name: 'Kaos Selina Blue M', hpp: 45000, price: 85000, stock: 5, category: 'Apparel', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '3', sku: 'T-WHITE-L', name: 'Tote Bag Selina', hpp: 25000, price: 50000, stock: 50, category: 'Aksesoris', image: 'https://images.unsplash.com/photo-1544816153-12ad5d714481?auto=format&fit=crop&q=80&w=200&h=200' },
];

export const MOCK_EXPENSES: any[] = [
  { id: 'e1', category: 'Iklan', amount: 500000, description: 'FB Ads Minggu 1', date: '2024-03-20', paymentMethod: 'Transfer' },
  { id: 'e2', category: 'Listrik', amount: 200000, description: 'PLN Maret', date: '2024-03-21', paymentMethod: 'E-Wallet' },
  { id: 'e3', category: 'Gaji', amount: 3500000, description: 'Gaji Admin Gudang', date: '2024-03-25', paymentMethod: 'Transfer' },
  { id: 'e4', category: 'Marketing', amount: 150000, description: 'Cetak Sticker Branding', date: '2024-03-22', paymentMethod: 'Cash' },
];

export const MOCK_ORDERS: any[] = [
  { id: 'o1', orderId: 'SH-1234', sku: 'S-RED-XL', payout: 78000, status: 'Completed', source: 'Shopee', date: '2024-03-20' },
  { id: 'o2', orderId: 'TT-5678', sku: 'S-BLUE-M', payout: 75000, status: 'Completed', source: 'TikTok Shop Tokopedia', date: '2024-03-21' },
];

export const MOCK_CUSTOMERS: any[] = [
  { id: 'c1', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '08123456789', location: 'Jakarta', province: 'DKI Jakarta', totalSpent: 250000 },
  { id: 'c2', name: 'Siti Aminah', email: 'siti@yahoo.com', phone: '08987654321', location: 'Surabaya', province: 'Jawa Timur', totalSpent: 450000 },
];
