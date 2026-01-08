
export interface Product {
  id: string;
  sku: string;
  name: string;
  hpp: number;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  sku: string;
  type: 'IN' | 'OUT';
  qty: number;
  note: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'Gaji' | 'Iklan' | 'Listrik' | 'Lainnya';
  amount: number;
  description: string;
  date: string;
}

export interface MarketplaceOrder {
  id: string;
  orderId: string;
  sku: string;
  payout: number;
  status: 'Completed' | 'Returned';
  source: 'Shopee' | 'TikTok';
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  province: string;
  totalSpent: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  total: number;
  status: 'PAID' | 'UNPAID';
  date: string;
  items: { sku: string; qty: number; price: number }[];
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  EXPENSES = 'expenses',
  CRM = 'crm',
  MARKETPLACE = 'marketplace',
  MAGIC_STUDIO = 'magic_studio'
}
