
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const checkStockFunction: FunctionDeclaration = {
  name: 'check_stock',
  parameters: {
    type: Type.OBJECT,
    description: 'Mengecek ketersediaan stok barang berdasarkan SKU.',
    properties: {
      sku: {
        type: Type.STRING,
        description: 'Kode SKU barang (contoh: S-RED-XL)',
      },
    },
    required: ['sku'],
  },
};

export const getProfitReportFunction: FunctionDeclaration = {
  name: 'get_profit_report',
  parameters: {
    type: Type.OBJECT,
    description: 'Mendapatkan ringkasan laporan profit bulanan.',
    properties: {
      month: {
        type: Type.STRING,
        description: 'Bulan yang diinginkan (contoh: Maret)',
      },
    },
    required: ['month'],
  },
};

export const analyzeCustomerFunction: FunctionDeclaration = {
  name: 'analyze_customer',
  parameters: {
    type: Type.OBJECT,
    description: 'Menganalisa profil dan sejarah belanja customer.',
    properties: {
      name: {
        type: Type.STRING,
        description: 'Nama customer',
      },
    },
    required: ['name'],
  },
};

export const systemInstruction = `
Kamu adalah Selina AI Assistant, Copilot cerdas untuk seller Indonesia.
Persona: Ramah, santun, profesional, dan selalu menyemangati seller. 
Gunakan Bahasa Indonesia yang natural. 
Kamu bisa membantu mengecek stok, menghitung profit, dan menganalisa pelanggan.
Jika ditanya tentang bisnis, berikan insight yang membangun.
Data Toko: Kamu memiliki akses ke database produk dan transaksi.
`;

export const getChatModel = () => {
  // Fixed: Use direct process.env.API_KEY and initialize right before usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Halo Selina!',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [checkStockFunction, getProfitReportFunction, analyzeCustomerFunction] }],
    }
  });
};
