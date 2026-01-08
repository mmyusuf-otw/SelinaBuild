
import React from 'react';
import { Product, Variant } from '../types';
import { Search, Plus, Minus, Filter, Edit2, Trash2, X, AlertTriangle, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdateStock: (id: string, delta: number) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  onUpdateStock, 
  onAddProduct,
  onEditProduct,
  onDeleteProduct 
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [hasVariants, setHasVariants] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  
  // Form State
  const [formData, setFormData] = React.useState({
    sku: '',
    name: '',
    category: 'Apparel',
    hpp: 0,
    price: 0,
    stock: 0,
    variants: [] as Variant[]
  });

  // Handle Edit Click
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setHasVariants(!!(product.variants && product.variants.length > 0));
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      hpp: product.hpp,
      price: product.price,
      stock: product.stock,
      variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  // Handle Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setHasVariants(false);
    setFormData({
      sku: '',
      name: '',
      category: 'Apparel',
      hpp: 0,
      price: 0,
      stock: 0,
      variants: []
    });
  };

  const addVariant = () => {
    if (formData.variants.length >= 20) return;
    const newVariant: Variant = {
      id: Math.random().toString(36).substr(2, 9),
      sku: `${formData.sku || 'SKU'}-VAR-${formData.variants.length + 1}`,
      name: '',
      hpp: formData.hpp || 0,
      price: formData.price || 0,
      stock: 0
    };
    setFormData({ ...formData, variants: [...formData.variants, newVariant] });
  };

  const removeVariant = (id: string) => {
    setFormData({ ...formData, variants: formData.variants.filter(v => v.id !== id) });
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      variants: hasVariants ? formData.variants : []
    };
    
    if (editingProduct) {
      onEditProduct({ ...editingProduct, ...submissionData });
    } else {
      onAddProduct(submissionData);
    }
    closeModal();
  };

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all";
  const labelClasses = "text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari SKU atau Nama Barang..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium">
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-semibold text-sm"
          >
            <Plus size={18} /> Tambah Barang
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-10"></th>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">SKU Utama</th>
              <th className="px-6 py-4 text-right">HPP</th>
              <th className="px-6 py-4 text-right">Harga Jual</th>
              <th className="px-6 py-4 text-center">Total Stok</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const isExpanded = expandedRows[p.id];
              const hasVars = p.variants && p.variants.length > 0;
              const totalStock = hasVars ? p.variants!.reduce((acc, v) => acc + v.stock, 0) : p.stock;

              return (
                <React.Fragment key={p.id}>
                  <tr className={`hover:bg-slate-50/50 transition-colors group ${isExpanded ? 'bg-indigo-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      {hasVars && (
                        <button 
                          onClick={() => toggleExpand(p.id)}
                          className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[250px]">{p.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">{p.category}</p>
                          {hasVars && (
                            <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                              <Layers size={10} /> {p.variants?.length} Varian
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <code className="text-[11px] font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200">
                         {p.sku}
                       </code>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-slate-600">
                      {hasVars ? '-' : `Rp ${p.hpp.toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right">
                      {hasVars ? '-' : `Rp ${p.price.toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                        totalStock <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {totalStock} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(p)}
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && hasVars && p.variants!.map((v) => (
                    <tr key={v.id} className="bg-slate-50/80 border-l-4 border-indigo-400 animate-in slide-in-from-top-1 duration-200">
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2 text-xs font-medium text-slate-600 italic">
                        ↳ {v.name || 'Tanpa Nama Varian'}
                      </td>
                      <td className="px-6 py-2">
                        <code className="text-[10px] font-mono text-slate-400">{v.sku}</code>
                      </td>
                      <td className="px-6 py-2 text-[11px] text-right text-slate-400 italic">
                        Rp {v.hpp.toLocaleString()}
                      </td>
                      <td className="px-6 py-2 text-[11px] text-right text-slate-500 font-semibold italic">
                        Rp {v.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-2 text-center">
                         <span className="text-[10px] font-bold text-slate-500">{v.stock} pcs</span>
                      </td>
                      <td className="px-6 py-2 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button onClick={() => onUpdateStock(p.id + '-' + v.id, -1)} className="p-1 hover:bg-rose-100 rounded text-rose-400"><Minus size={12} /></button>
                            <button onClick={() => onUpdateStock(p.id + '-' + v.id, 1)} className="p-1 hover:bg-emerald-100 rounded text-emerald-400"><Plus size={12} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingProduct ? <Edit2 size={20} /> : <Plus size={20} />}
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b pb-2">Informasi Utama</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelClasses}>Nama Produk</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: Kaos Oversize Premium"
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className={inputClasses}
                    >
                      <option>Apparel</option>
                      <option>Aksesoris</option>
                      <option>Elektronik</option>
                      <option>Makanan</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelClasses}>SKU Induk</label>
                    <input 
                      required
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      placeholder="SKU-IND-01"
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={hasVariants} 
                          onChange={e => setHasVariants(e.target.checked)} 
                        />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Punya Variasi?</span>
                    </label>
                  </div>
                </div>
              </div>

              {!hasVariants ? (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b pb-2">Harga & Stok</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className={labelClasses}>HPP (Modal)</label>
                      <input 
                        type="number"
                        required={!hasVariants}
                        value={formData.hpp}
                        onChange={e => setFormData({...formData, hpp: parseInt(e.target.value) || 0})}
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClasses}>Harga Jual</label>
                      <input 
                        type="number"
                        required={!hasVariants}
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClasses}>Stok Awal</label>
                      <input 
                        type="number"
                        required={!hasVariants}
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Variasi Produk (Maks 20)</h4>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      disabled={formData.variants.length >= 20}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-100 disabled:opacity-50 transition-all"
                    >
                      <Plus size={14} /> Tambah Variasi
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.variants.length === 0 && (
                      <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-sm text-slate-400">Belum ada variasi. Klik tombol di atas untuk menambah.</p>
                      </div>
                    )}
                    {formData.variants.map((v, index) => (
                      <div key={v.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 relative group">
                        <button 
                          type="button" 
                          onClick={() => removeVariant(v.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={labelClasses}>Nama Variasi (e.g. Merah, XL)</label>
                            <input 
                              required
                              value={v.name}
                              onChange={e => updateVariant(v.id, 'name', e.target.value)}
                              placeholder="Merah / XL"
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClasses}>SKU Variasi</label>
                            <input 
                              required
                              value={v.sku}
                              onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className={labelClasses}>HPP Variasi</label>
                            <input 
                              type="number"
                              required
                              value={v.hpp}
                              onChange={e => updateVariant(v.id, 'hpp', parseInt(e.target.value) || 0)}
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClasses}>Harga Jual Variasi</label>
                            <input 
                              type="number"
                              required
                              value={v.price}
                              onChange={e => updateVariant(v.id, 'price', parseInt(e.target.value) || 0)}
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClasses}>Stok Awal</label>
                            <input 
                              type="number"
                              required
                              value={v.stock}
                              onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className="p-6 border-t bg-slate-50 flex gap-4 shrink-0">
              <button 
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
              >
                {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Produk?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
