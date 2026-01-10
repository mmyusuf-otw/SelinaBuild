
import * as XLSX from 'xlsx';
import { AnalyzedOrder, Product } from '../types';

export interface RawOrderRow {
  orderId: string;
  sku: string;
  qty: number;
  productName: string;
  variantName: string;
  date: string;
}

export interface RawIncomeRow {
  orderId: string;
  payout: number;
  revenue: number;
}

/**
 * Mendeteksi header row secara dinamis karena Shopee sering menaruh 
 * header bukan di baris pertama pada file Income.
 */
const findHeaderRow = (sheetData: any[][], targetColumn: string): number => {
  for (let i = 0; i < sheetData.length; i++) {
    if (sheetData[i].some(cell => String(cell).toLowerCase().includes(targetColumn.toLowerCase()))) {
      return i;
    }
  }
  return 0;
};

/**
 * Parsing File Pesanan (Orders)
 */
export const parseOrdersExcel = async (file: File): Promise<RawOrderRow[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headerIdx = findHeaderRow(json, "No. Pesanan");
      const rows = json.slice(headerIdx + 1);
      const headers = json[headerIdx];

      const getCol = (name: string) => headers.findIndex(h => String(h).includes(name));
      
      const parsed = rows.map(row => ({
        orderId: String(row[getCol("No. Pesanan")] || ""),
        sku: String(row[getCol("Nomor Referensi SKU")] || row[getCol("SKU")] || ""),
        qty: Number(row[getCol("Jumlah")] || 1),
        productName: String(row[getCol("Nama Produk")] || ""),
        variantName: String(row[getCol("Nama Variasi")] || ""),
        date: String(row[getCol("Waktu Pesanan Dibuat")] || new Date().toISOString())
      })).filter(r => r.orderId);

      resolve(parsed);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parsing File Dana Dilepas (Income)
 */
export const parseIncomeExcel = async (file: File): Promise<RawIncomeRow[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headerIdx = findHeaderRow(json, "No. Pesanan");
      const rows = json.slice(headerIdx + 1);
      const headers = json[headerIdx];

      const getCol = (name: string) => headers.findIndex(h => String(h).includes(name));
      
      const parsed = rows.map(row => ({
        orderId: String(row[getCol("No. Pesanan")] || ""),
        payout: Number(row[getCol("Total Penghasilan")] || row[getCol("Dana Dilepas")] || 0),
        revenue: Number(row[getCol("Harga Asli Produk")] || 0)
      })).filter(r => r.orderId);

      resolve(parsed);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parsing File Master HPP (Katalog)
 */
export const parseHppExcel = async (file: File): Promise<Record<string, number>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headerIdx = findHeaderRow(json, "SKU");
      const rows = json.slice(headerIdx + 1);
      const headers = json[headerIdx];

      const getCol = (name: string) => headers.findIndex(h => String(h).toLowerCase().includes(name.toLowerCase()));
      
      const skuCol = getCol("SKU");
      const hppCol = getCol("HPP");

      const map: Record<string, number> = {};
      rows.forEach(row => {
        const sku = String(row[skuCol] || "").trim();
        const hpp = Number(row[hppCol] || 0);
        if (sku) map[sku] = hpp;
      });

      resolve(map);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Gabungkan data untuk mendapatkan Net Profit
 */
export const calculateNetProfit = (
  rawOrders: RawOrderRow[], 
  rawIncome: RawIncomeRow[], 
  hppMap: Record<string, number>
): { analyzed: AnalyzedOrder[], missingSkus: Set<string> } => {
  
  const missingSkus = new Set<string>();
  
  // 1. Group Orders by orderId (Handle Multi-item)
  const ordersMap: Record<string, { items: RawOrderRow[], totalHpp: number, isMissingHpp: boolean }> = {};
  
  rawOrders.forEach(order => {
    if (!ordersMap[order.orderId]) {
      ordersMap[order.orderId] = { items: [], totalHpp: 0, isMissingHpp: false };
    }
    
    const hpp = hppMap[order.sku] || 0;
    if (!hppMap[order.sku] && order.sku) {
      missingSkus.add(order.sku);
      ordersMap[order.orderId].isMissingHpp = true;
    }
    
    ordersMap[order.orderId].items.push(order);
    ordersMap[order.orderId].totalHpp += (hpp * order.qty);
  });

  // 2. Match with Income
  const analyzed: AnalyzedOrder[] = rawIncome.map(income => {
    const orderData = ordersMap[income.orderId];
    if (!orderData) return null;

    const firstItem = orderData.items[0];
    const isMultiItem = orderData.items.length > 1;

    return {
      orderId: income.orderId,
      username: "Sellers", 
      productName: isMultiItem ? `${firstItem.productName} (+${orderData.items.length - 1} item)` : firstItem.productName,
      variant: isMultiItem ? "Multi-Variant" : firstItem.variantName,
      transactionValue: income.revenue || orderData.items.reduce((acc, curr) => acc + (0 * curr.qty), 0),
      totalHpp: orderData.totalHpp,
      payout: income.payout,
      profit: income.payout - orderData.totalHpp,
      date: firstItem.date,
      category: "Marketplace"
    };
  }).filter(Boolean) as AnalyzedOrder[];

  return { analyzed, missingSkus };
};
