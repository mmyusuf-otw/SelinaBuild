
import React from 'react';
import { Product } from '../types';
import { Search, Plus, Minus, Filter, MoreVertical, PackageCheck, ShoppingCart, Sparkles, RefreshCw, Image as ImageIcon } from 'lucide-react';
/* Added Gemini SDK import */
import { GoogleGenAI } from "@google/genai";

interface InventoryProps {
  products: Product[];
  onUpdateStock: (id: string, delta: number) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdateStock, onUpdateImage }) => {
  const [generatingId, setGeneratingId] = React.useState<string | null>(null);

  /* Fix: Implemented real AI image generation using gemini-2.5-flash-image */
  const handleGenerateAIImage = async (productId: string, productName: string) => {
    setGeneratingId(productId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A professional studio product photograph of ${productName}, commercial quality, high resolution, clean elegant background.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Data) {
        onUpdateImage(productId, `data:image/png;base64,${base64Data}`);
      }
    } catch (error) {
      console.error("AI Image Generation failed:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari SKU atau Nama Barang..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Plus size={18} /> Tambah Barang
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-20 text-center">Foto</th>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4 text-right">HPP</th>
              <th className="px-6 py-4 text-right">Harga Jual</th>
              <th className="px-6 py-4 text-center">Stok</th>
              <th className="px-6 py-4 text-center">Stock Opname</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="relative w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        {generatingId === p.id ? (
                          <RefreshCw size={16} className="animate-spin text-indigo-500" />
                        ) : (
                          <button 
                            onClick={() => handleGenerateAIImage(p.id, p.name)}
                            title="Generate AI Image"
                            className="p-1 hover:text-indigo-600 transition-colors"
                          >
                            <Sparkles size={20} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold truncate max-w-[200px]">{p.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight">{p.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <code className="text-[11px] font-mono bg-slate-50 px-2 py-1 rounded-md text-slate-600 border border-slate-200">
                     {p.sku}
                   </code>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-right text-slate-600">
                  Rp {p.hpp.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right">
                  Rp {p.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                    p.stock <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {p.stock} Units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onUpdateStock(p.id, -1)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <button 
                      onClick={() => onUpdateStock(p.id, 1)}
                      className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900">AI Product Visuals</h4>
          <p className="text-sm text-indigo-800 leading-relaxed">
            Belum punya foto produk profesional? Gunakan fitur <b>Sparkles</b> di kolom Foto untuk menghasilkan visual produk berbasis AI secara instan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
