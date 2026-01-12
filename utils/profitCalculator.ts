
import * as XLSX from 'xlsx';
import { AnalyzedOrder } from '../types';

export interface RawOrderRow {
  orderId: string;
  noResi: string;
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
 * Membersihkan string untuk perbandingan (lowercase, hapus spasi & simbol)
 */
const normalizeHeader = (str: any): string => {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Pembersih angka yang mendukung format Indonesia dan Internasional
 */
const cleanNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  str = str.replace(/(Rp|IDR|\s)/gi, "");
  
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(',') && !str.includes('.')) {
    str = str.replace(",", ".");
  }
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Mencari baris header dengan mencari baris yang mengandung "No Pesanan" atau "SKU"
 */
const findHeaderRow = (sheetData: any[][], criticalKeywords: string[]): number => {
  const normalizedKeywords = criticalKeywords.map(k => normalizeHeader(k));
  
  for (let i = 0; i < Math.min(sheetData.length, 100); i++) {
    const row = (sheetData[i] || []).map(cell => normalizeHeader(cell));
    // Jika baris ini mengandung salah satu keyword kritis, anggap sebagai header
    if (normalizedKeywords.some(k => row.some(cell => cell.includes(k)))) {
      return i;
    }
  }
  return -1;
};

/**
 * Mencari index kolom berdasarkan daftar alias.
 */
const getColIndex = (headers: any[], aliases: string[]): number => {
  const normalizedAliases = aliases.map(a => normalizeHeader(a));
  const normalizedHeaders = headers.map(h => normalizeHeader(h));
  
  return normalizedHeaders.findIndex(header => 
    normalizedAliases.some(alias => header.includes(alias))
  );
};

/**
 * Parsing File Pesanan
 */
export const parseOrdersExcel = async (file: File): Promise<RawOrderRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Cari baris header (Biasanya ada kata "No Pesanan" atau "SKU")
        const headerIdx = findHeaderRow(json, ["No Pesanan", "Order ID", "Nomor Pesanan", "SKU"]);
        if (headerIdx === -1) throw new Error("Format Laporan Pesanan tidak dikenali. Pastikan ini adalah file ekspor asli.");
        
        const headers = json[headerIdx];
        const rows = json.slice(headerIdx + 1);

        const orderIdCol = getColIndex(headers, ["No Pesanan", "Order ID", "Nomor Pesanan", "ID Pesanan", "Order Number"]);
        const noResiCol = getColIndex(headers, ["No. Resi", "Tracking Number", "Nomor Resi", "Tracking ID"]);
        const skuCol = getColIndex(headers, ["SKU Reference", "Nomor Referensi SKU", "SKU Induk", "Parent SKU", "SKU", "Ref SKU"]);
        const qtyCol = getColIndex(headers, ["Jumlah", "Quantity", "Qty", "Item Count", "Total Quantity"]);
        const productNameCol = getColIndex(headers, ["Nama Produk", "Product Name", "Produk", "Item Name"]);
        const variantNameCol = getColIndex(headers, ["Nama Variasi", "Variation", "Varian", "Variant Name"]);
        const dateCol = getColIndex(headers, ["Waktu Pesanan Dibuat", "Order Creation Time", "Order Date", "Tanggal", "Created At"]);

        if (orderIdCol === -1) throw new Error("Kolom 'Nomor Pesanan' tidak ditemukan di file Pesanan.");

        const parsed = rows.map(row => {
          const id = String(row[orderIdCol] || "").trim();
          if (!id || id === "undefined" || id.length < 5) return null;

          return {
            orderId: id,
            noResi: String(row[noResiCol] || "-"),
            sku: String(row[skuCol] || "").trim(),
            qty: cleanNumber(row[qtyCol]) || 1,
            productName: String(row[productNameCol] || "Produk Tanpa Nama"),
            variantName: String(row[variantNameCol] || ""),
            date: String(row[dateCol] || new Date().toISOString())
          };
        }).filter(Boolean) as RawOrderRow[];

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parsing Laporan Penghasilan / Dana Dilepas
 */
export const parseIncomeExcel = async (file: File): Promise<RawIncomeRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Shopee/TikTok sering punya header "Penghasilan" atau "Settlement"
        const headerIdx = findHeaderRow(json, ["No Pesanan", "Order ID", "Penghasilan", "Released", "Dana Dilepas"]);
        if (headerIdx === -1) throw new Error("Format Laporan Penghasilan tidak dikenali. Pastikan file benar.");
        
        const headers = json[headerIdx];
        const rows = json.slice(headerIdx + 1);

        // Alias yang lebih luas untuk Order ID di file finansial
        const orderIdCol = getColIndex(headers, ["No Pesanan", "Order ID", "Nomor Pesanan", "ID Pesanan", "Order Number", "Nomor Referensi"]);
        const payoutCol = getColIndex(headers, ["Total Penghasilan", "Released Amount", "Dana Dilepas", "Net Payout", "Settlement Amount", "Total Payout"]);
        const revenueCol = getColIndex(headers, ["Harga Asli Produk", "Product Price", "Original Price", "Order Amount", "Total Penjualan", "Gross Revenue"]);

        if (orderIdCol === -1) throw new Error("Kolom 'Nomor Pesanan' tidak ditemukan di file Penghasilan.");
        if (payoutCol === -1) throw new Error("Kolom 'Dana Dilepas' atau 'Total Penghasilan' tidak ditemukan.");

        const parsed = rows.map(row => {
          const id = String(row[orderIdCol] || "").trim();
          const amount = cleanNumber(row[payoutCol]);
          if (!id || id === "undefined" || amount === 0) return null;

          return {
            orderId: id,
            payout: amount,
            revenue: cleanNumber(row[revenueCol]) || amount
          };
        }).filter(Boolean) as RawIncomeRow[];

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parsing Master HPP
 */
export const parseHppExcel = async (file: File): Promise<Record<string, number>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Master HPP biasanya sederhana, cari "SKU" atau "HPP"
        const headerIdx = findHeaderRow(json, ["SKU", "HPP", "Modal", "Harga Beli"]);
        if (headerIdx === -1) throw new Error("Format Master HPP tidak dikenali. Pastikan ada judul kolom 'SKU' dan 'HPP'.");
        
        const headers = json[headerIdx];
        const rows = json.slice(headerIdx + 1);

        const skuCol = getColIndex(headers, ["SKU", "Kode Barang", "Item Code", "Product ID", "Referansi"]);
        const hppCol = getColIndex(headers, ["HPP", "Modal", "Harga Beli", "Cost", "Harga Modal", "COGS"]);

        if (skuCol === -1 || hppCol === -1) throw new Error("File HPP harus memiliki kolom 'SKU' dan 'HPP' (atau Modal).");

        const map: Record<string, number> = {};
        rows.forEach(row => {
          const sku = String(row[skuCol] || "").trim();
          const hpp = cleanNumber(row[hppCol]);
          if (sku && sku !== "undefined") {
            map[sku] = hpp;
          }
        });

        resolve(map);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const calculateNetProfit = (
  rawOrders: RawOrderRow[], 
  rawIncome: RawIncomeRow[], 
  hppMap: Record<string, number>
): { analyzed: AnalyzedOrder[], missingSkus: Set<string> } => {
  
  const missingSkus = new Set<string>();
  const ordersMap: Record<string, { items: RawOrderRow[], totalHpp: number }> = {};
  
  rawOrders.forEach(order => {
    if (!ordersMap[order.orderId]) {
      ordersMap[order.orderId] = { items: [], totalHpp: 0 };
    }
    
    const hpp = hppMap[order.sku] || 0;
    if (hpp === 0 && order.sku) {
      missingSkus.add(order.sku);
    }
    
    ordersMap[order.orderId].items.push(order);
    ordersMap[order.orderId].totalHpp += (hpp * order.qty);
  });

  const analyzed: AnalyzedOrder[] = rawIncome.map(income => {
    const orderData = ordersMap[income.orderId];
    if (!orderData) return null;

    const firstItem = orderData.items[0];
    const isMultiItem = orderData.items.length > 1;

    return {
      orderId: income.orderId,
      noResi: firstItem.noResi,
      username: "Customer", 
      productName: isMultiItem ? `${firstItem.productName} (+${orderData.items.length - 1} item)` : firstItem.productName,
      variant: isMultiItem ? "Multi-Variant" : (firstItem.variantName || "-"),
      transactionValue: income.revenue,
      totalHpp: orderData.totalHpp,
      payout: income.payout,
      profit: income.payout - orderData.totalHpp,
      date: firstItem.date,
      category: "Marketplace"
    };
  }).filter(Boolean) as AnalyzedOrder[];

  return { analyzed, missingSkus };
};
