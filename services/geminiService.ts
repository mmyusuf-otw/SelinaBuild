
import { GoogleGenAI } from "@google/genai";

export const checkStockFunction = {
  name: 'check_stock',
  parameters: {
    type: 'OBJECT',
    description: 'Mengecek ketersediaan stok barang berdasarkan SKU.',
    properties: {
      sku: {
        type: 'STRING',
        description: 'Kode SKU barang (contoh: S-RED-XL)',
      },
    },
    required: ['sku'],
  },
};

export const getProfitReportFunction = {
  name: 'get_profit_report',
  parameters: {
    type: 'OBJECT',
    description: 'Mendapatkan ringkasan laporan profit bulanan.',
    properties: {
      month: {
        type: 'STRING',
        description: 'Bulan yang diinginkan (contoh: Maret)',
      },
    },
    required: ['month'],
  },
};

export const analyzeCustomerFunction = {
  name: 'analyze_customer',
  parameters: {
    type: 'OBJECT',
    description: 'Menganalisa profil dan sejarah belanja customer.',
    properties: {
      name: {
        type: 'STRING',
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Halo Selina!',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [checkStockFunction as any, getProfitReportFunction as any, analyzeCustomerFunction as any] }],
    }
  });
};

/**
 * AI Auditor Logic
 */
export const analyzeTransaction = async (transactionData: {
  sku: string;
  harga_jual: number;
  hpp: number;
  potongan_total: number;
  profit: number;
}): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const auditInstruction = `Kamu adalah Auditor Keuangan Selina. Tugasmu adalah menganalisa satu transaksi marketplace dan menjelaskan kepada seller KENAPA transaksi ini rugi/boncos dalam bahasa Indonesia yang santai tapi tegas. Fokus pada: Apakah biaya admin terlalu besar? Apakah ada selisih ongkir? Apakah HPP terlalu mahal dibanding harga jual? Berikan saran perbaikan singkat. Output maksimal 2 kalimat.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit transaksi ini: ${JSON.stringify(transactionData)}`,
      config: {
        systemInstruction: auditInstruction,
        temperature: 0.7,
      },
    });
    return response.text?.trim() || "Gagal menganalisa transaksi.";
  } catch (error) {
    console.error("Audit AI Error:", error);
    return "Maaf Juragan, sistem audit AI sedang sibuk. Coba sesaat lagi.";
  }
};
