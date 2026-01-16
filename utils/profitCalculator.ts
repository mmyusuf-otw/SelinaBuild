
import * as XLSX from 'xlsx';
import { AnalyzedOrder } from '../types';

/**
 * Normalisasi string untuk pencocokan header (lowercase & alphanumeric only)
 */
const normalize = (str: any): string => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Pembersihan angka dari format string IDR/Ribuan/Koma
 */
const cleanNum = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim().replace(/(Rp|IDR|\s)/gi, "");
  // Handle format 1.000,00 vs 1,000.00
  if (str.includes('.') && str.includes(',')) str = str.replace(/\./g, "").replace(",", ".");
  else if (str.includes(',') && !str.includes('.')) str = str.replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

interface ReconciliationFiles {
  orderReport: File;
  settlementReport: File;
  productMaster: File;
}

export interface ReconResult {
  orders: AnalyzedOrder[];
  summary: {
    totalRevenue: number;
    totalActualPayout: number;
    totalHpp: number;
    totalProfit: number;
    totalMismatches: number;
    totalGap: number;
  };
}

/**
 * Selina Reconciliation Engine: 3-Way Matching Algorithm
 * 1. Map Product Master (SKU -> HPP)
 * 2. Map Settlement (Order ID -> Actual Payout & Fees)
 * 3. Process Order Report (Self-Healing & Grouping)
 * 4. Perform 3-Way Calculation & Gap Analysis
 */
export const processReconciliation = async (files: ReconciliationFiles): Promise<ReconResult> => {
  const readExcel = (file: File): Promise<any[][]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const [orderRaw, settlementRaw, masterRaw] = await Promise.all([
    readExcel(files.orderReport),
    readExcel(files.settlementReport),
    readExcel(files.productMaster)
  ]);

  // --- STEP 1: LOOKUP MAPS ---
  
  // Product Master Map: SKU -> HPP
  const hppMap = new Map<string, number>();
  const masterHeaders = masterRaw[0].map(h => normalize(h));
  const skuIdxM = masterHeaders.findIndex(h => h.includes("sku"));
  const hppIdxM = masterHeaders.findIndex(h => h.includes("hpp") || h.includes("modal") || h.includes("cost"));
  
  masterRaw.slice(1).forEach(row => {
    const sku = String(row[skuIdxM] || "").trim();
    if (sku) hppMap.set(sku, cleanNum(row[hppIdxM]));
  });

  // Settlement Map: Order ID -> { ActualPayout, Fees }
  const settlementMap = new Map<string, { payout: number; fees: number }>();
  const setHeadersIdx = settlementRaw.findIndex(row => row.some(cell => normalize(cell).includes("nopesanan") || normalize(cell).includes("orderid")));
  const setCols = settlementRaw[setHeadersIdx].map(h => normalize(h));
  const orderIdIdxS = setCols.findIndex(h => h.includes("nopesanan") || h.includes("orderid") || h.includes("nomorpesanan"));
  const payoutIdxS = setCols.findIndex(h => h.includes("totalpenghasilan") || h.includes("releasedamount") || h.includes("payout") || h.includes("jumlahdana"));
  const feesIdxS = setCols.findIndex(h => h.includes("biayaadministrasi") || h.includes("fees") || h.includes("biayapenyelesaian"));

  settlementRaw.slice(setHeadersIdx + 1).forEach(row => {
    const id = String(row[orderIdIdxS] || "").trim();
    if (id) {
      const current = settlementMap.get(id) || { payout: 0, fees: 0 };
      settlementMap.set(id, {
        payout: current.payout + cleanNum(row[payoutIdxS]),
        fees: current.fees + cleanNum(row[feesIdxS])
      });
    }
  });

  // --- STEP 2: PROCESS ORDERS (SELF-HEALING & MERGE) ---
  
  const orderHeadersIdx = orderRaw.findIndex(row => row.some(cell => normalize(cell).includes("nopesanan") || normalize(cell).includes("orderid")));
  const orderCols = orderRaw[orderHeadersIdx].map(h => normalize(h));
  
  const idx = {
    orderId: orderCols.findIndex(h => h.includes("nopesanan") || h.includes("orderid")),
    sku: orderCols.findIndex(h => h.includes("sku") || h.includes("namaproduk")),
    price: orderCols.findIndex(h => h.includes("hargajual") || h.includes("sellingprice") || h.includes("hargasatuan")),
    qty: orderCols.findIndex(h => h.includes("jumlah") || h.includes("quantity") || h.includes("qty")),
    username: orderCols.findIndex(h => h.includes("username") || h.includes("namapembeli") || h.includes("namapenerima"))
  };

  const ordersData: Record<string, any> = {};
  let lastUsername = "";
  let lastOrderId = "";

  orderRaw.slice(orderHeadersIdx + 1).forEach(row => {
    let orderId = String(row[idx.orderId] || "").trim();
    let username = String(row[idx.username] || "").trim();

    // SELF-HEALING logic for multi-item rows
    if (orderId && orderId === lastOrderId && !username) {
      username = lastUsername;
    } else if (orderId) {
      lastOrderId = orderId;
      lastUsername = username;
    }

    if (!orderId || orderId === "undefined") return;

    if (!ordersData[orderId]) {
      ordersData[orderId] = {
        orderId,
        username: username || "Customer",
        items: [],
        revenue: 0,
        totalHpp: 0
      };
    }

    const sku = String(row[idx.sku] || "UNKNOWN").trim();
    const qty = cleanNum(row[idx.qty]) || 1;
    const price = cleanNum(row[idx.price]);
    const hpp = hppMap.get(sku) || 0;

    ordersData[orderId].items.push({ sku, qty, price });
    ordersData[orderId].revenue += (price * qty);
    ordersData[orderId].totalHpp += (hpp * qty);
  });

  // --- STEP 3: 3-WAY CALCULATION & COMPARISON ---
  
  const finalOrders: AnalyzedOrder[] = [];
  let summary = { totalRevenue: 0, totalActualPayout: 0, totalHpp: 0, totalProfit: 0, totalMismatches: 0, totalGap: 0 };

  Object.values(ordersData).forEach((order: any) => {
    const settlement = settlementMap.get(order.orderId) || { payout: 0, fees: 0 };
    
    // Logic: Expected Payout = Revenue - Deductions (Fees)
    // Gap = Actual - Expected
    const expectedPayout = order.revenue - settlement.fees;
    const gap = settlement.payout - expectedPayout;
    
    // Status flag (Small tolerance of Rp 100 for rounding)
    const isMismatch = Math.abs(gap) > 100 || settlement.payout === 0;

    const analyzed: any = {
      orderId: order.orderId,
      username: order.username,
      productName: order.items[0]?.sku || "Product",
      variant: order.items.length > 1 ? `Multi-item (${order.items.length})` : "Single",
      transactionValue: order.revenue,
      totalHpp: order.totalHpp,
      payout: settlement.payout,
      profit: settlement.payout - order.totalHpp,
      status: isMismatch ? 'MISMATCH' : 'PROOF',
      gap: gap,
      date: new Date().toLocaleDateString('id-ID')
    };

    finalOrders.push(analyzed);

    summary.totalRevenue += order.revenue;
    summary.totalActualPayout += settlement.payout;
    summary.totalHpp += order.totalHpp;
    summary.totalProfit += analyzed.profit;
    summary.totalGap += gap;
    if (isMismatch) summary.totalMismatches++;
  });

  return { orders: finalOrders, summary };
};
