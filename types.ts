
export type UserRole = 'USER' | 'ADMIN';
export type UserPlan = 'FREE' | 'JURAGAN' | 'SULTAN';

export interface Variant {
  id: string;
  sku: string;
  name: string;
  hpp: number;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  hpp: number;
  price: number;
  stock: number;
  category: string;
  image?: string;
  variants?: Variant[];
}

export interface Expense {
  id: string;
  category: 'Gaji' | 'Iklan' | 'Listrik' | 'Lainnya' | 'Sewa' | 'Marketing';
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'Cash' | 'Transfer' | 'Kartu Kredit' | 'E-Wallet';
}

export interface AnalyzedOrder {
  orderId: string;
  username: string;
  productName: string;
  variant: string;
  transactionValue: number;
  totalHpp: number;
  payout: number;
  profit: number;
  date: string;
  category: string;
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

export interface UserProfile {
  id: string;
  storeName: string;
  ownerName: string;
  whatsapp: string;
  category: string;
  email: string;
  image?: string;
  role: UserRole;
  plan: UserPlan;
  magicCredits: number;
  createdAt: string;
  status: 'ACTIVE' | 'BANNED';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionEndDate?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  total: number;
  status: 'PAID' | 'UNPAID';
  date: string;
  items: { sku: string; qty: number; price: number }[];
}

export interface MarketplaceOrder {
  id: string;
  orderId: string;
  marketplace: string;
  status: string;
  date: string;
  total: number;
}

export interface BillingHistory {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'settlement' | 'expire' | 'cancel';
  type: 'SUBSCRIPTION' | 'TOPUP';
  planType: string;
  date: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  EXPENSES = 'expenses',
  CRM = 'crm',
  MARKETPLACE = 'marketplace',
  MAGIC_STUDIO = 'magic_studio',
  PRICING = 'pricing', // Tab baru
  PROFILE = 'profile',
  ADMIN_OVERVIEW = 'admin_overview',
  ADMIN_USERS = 'admin_users',
  ADMIN_MONITOR = 'admin_monitor',
  ADMIN_SETTINGS = 'admin_settings'
}
