
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WinningFormula } from "../types";
import { CompetitorData } from "../utils/scraper";

// Fix: Using Type.OBJECT and Type.STRING constants from @google/genai
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

// Fix: Using Type constants
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

// Fix: Using Type constants
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

// Fix: Call generateContent directly on the initialized client and use the recommended model for complex reasoning
export const getChatModel = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Pro model for complex reasoning and tool use
    contents: 'Halo Selina!',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [checkStockFunction, getProfitReportFunction, analyzeCustomerFunction] }],
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
      model: 'gemini-3-pro-preview', // Reasoning task
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

/**
 * Winning Magic - Competitor Spy & Synthesis
 */
export const generateWinningFormula = async (competitors: CompetitorData[]): Promise<WinningFormula> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `Kamu adalah E-commerce SEO Expert & Copywriter kelas dunia. Tugasmu adalah meracik 'Listing Produk Sempurna' dari data 5 kompetitor terlaris.
  Lakukan:
  1. Analisa Keyword: Cari kata kunci yang selalu muncul di judul kompetitor.
  2. Analisa Pain Point: Baca deskripsi mereka, temukan fitur apa yang paling ditonjolkan.
  3. Synthesis: Buat Judul (3 opsi), Deskripsi AIDA, dan 5 Prompts untuk Image Generator.
  Output harus dalam format JSON sesuai schema. Gunakan Bahasa Indonesia.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Highly complex analysis task
      contents: `Analisa data kompetitor ini: ${JSON.stringify(competitors)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            visualPrompts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["title", "prompt", "rationale"]
              }
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["titles", "description", "visualPrompts", "analysis"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Winning Magic Error:", error);
    throw new Error("Gagal meracik formula pemenang.");
  }
};
