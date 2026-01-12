
import React from 'react';
import { Product, Variant, StockJournalEntry } from '../types';
import { 
  Search, Plus, Minus, Filter, Edit2, Trash2, X, AlertTriangle, 
  Layers, ChevronDown, ChevronUp, Upload, FileSpreadsheet, 
  Download, Package, History, ArrowDownCircle, ArrowUpCircle, Truck, ShoppingCart 
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryProps {
  products: Product[];
  stockJournal: StockJournalEntry[];
  onUpdateStock: (productId: string, delta: number, variantId?: string) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onBulkAddProducts: (products: Omit<Product, 'id'>[]) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddStockJournal: (entry: Omit<StockJournalEntry, 'id'>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  stockJournal,
  onUpdateStock, 
  onAddProduct,
  onBulkAddProducts,
  onEditProduct,
  onDeleteProduct,
  onAddStockJournal
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'list' | 'journal'>('list');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [hasVariants, setHasVariants] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  
  // Journal Form States
  const [journalForm, setJournalForm] = React.useState({
    productId: '',
    variantId: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: 1,
    detail: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = React.useState({
    sku: '',
    name: '',
    category: 'Apparel',
    hpp: 0,
    price: 0,
    stock: 0,
    variants: [] as Variant[]
  });

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

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === journalForm.productId);
    if (!product) return;
    
    const variant = product.variants?.find(v => v.id === journalForm.variantId);

    onAddStockJournal({
      productId: journalForm.productId,
      variantId: journalForm.variantId || undefined,
      productName: product.name,
      variantName: variant?.name,
      type: journalForm.type,
      quantity: journalForm.quantity,
      detail: journalForm.detail,
      date: journalForm.date
    });
    
    setIsJournalModalOpen(false);
    setJournalForm({
      productId: '',
      variantId: '',
      type: 'IN',
      quantity: 1,
      detail: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const downloadTemplate = () => {
    const data = [
      ['Nama Barang', 'SKU', 'Kategori', 'HPP', 'Harga Jual', 'Stok'],
      ['Contoh Kaos Polo', 'POLO-001', 'Apparel', 45000, 125000, 100]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Inventory");
    XLSX.writeFile(wb, "selina_inventory_template.xlsx");
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newProducts: Omit<Product, 'id'>[] = jsonData.map((row: any) => ({
          name: String(row['Nama Barang'] || row['nama barang'] || ''),
          sku: String(row['SKU'] || row['sku'] || ''),
          category: String(row['Kategori'] || row['kategori'] || 'Lainnya'),
          hpp: Number(row['HPP'] || row['hpp'] || 0),
          price: Number(row['Harga Jual'] || row['harga jual'] || 0),
          stock: Number(row['Stok'] || row['stok'] || 0),
          variants: []
        })).filter(p => p.name && p.sku);

        if (newProducts.length > 0) {
          onBulkAddProducts(newProducts);
          setIsBulkModalOpen(false);
          alert(`Berhasil mengimpor ${newProducts.length} barang ke Inventory!`);
        } else {
          alert("Format file tidak sesuai atau data kosong. Gunakan template excel yang tersedia.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all";
  const labelClasses = "text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveSubTab('list')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
        >
          <Package size={16} /> Daftar Barang
        </button>
        <button 
          onClick={() => setActiveSubTab('journal')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'journal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
        >
          <History size={16} /> Jurnal Mutasi
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={activeSubTab === 'list' ? "Cari SKU atau Nama Barang..." : "Cari di Jurnal Mutasi..."}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          {activeSubTab === 'list' ? (
            <>
              <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
              >
                <Upload size={18} /> Bulk Import
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-semibold text-sm"
              >
                <Plus size={18} /> Tambah Barang
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsJournalModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all font-black text-xs uppercase tracking-widest"
            >
              <Plus size={16} /> Catat Mutasi Stok
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'list' ? (
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
                            onClick={() => setExpandedRows(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
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
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && hasVars && p.variants!.map((v) => (
                      <tr key={v.id} className="bg-slate-50/80 border-l-4 border-indigo-400">
                        <td className="px-6 py-2"></td>
                        <td className="px-6 py-2 text-xs font-medium text-slate-600 italic">↳ {v.name}</td>
                        <td className="px-6 py-2"><code className="text-[10px] font-mono text-slate-400">{v.sku}</code></td>
                        <td className="px-6 py-2 text-[11px] text-right text-slate-400">Rp {v.hpp.toLocaleString()}</td>
                        <td className="px-6 py-2 text-[11px] text-right text-slate-500 font-semibold">Rp {v.price.toLocaleString()}</td>
                        <td className="px-6 py-2 text-center text-[10px] font-bold text-slate-500">{v.stock} pcs</td>
                        <td className="px-6 py-2 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button onClick={() => onUpdateStock(p.id, -1, v.id)} className="p-1 hover:bg-rose-100 rounded text-rose-400"><Minus size={12} /></button>
                              <button onClick={() => onUpdateStock(p.id, 1, v.id)} className="p-1 hover:bg-emerald-100 rounded text-emerald-400"><Plus size={12} /></button>
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
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto animate-in fade-in slide-in-from-right-2 duration-300">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Produk / Varian</th>
                <th className="px-6 py-4 text-center">Tipe</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4">Detail (Vendor/Channel)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockJournal.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{entry.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{entry.productName}</p>
                    {entry.variantName && <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight italic">↳ {entry.variantName}</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${entry.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {entry.type === 'IN' ? <ArrowDownCircle size={12}/> : <ArrowUpCircle size={12}/>}
                      {entry.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-black text-sm ${entry.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.type === 'IN' ? '+' : '-'}{entry.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {entry.type === 'IN' ? <Truck size={14} className="text-slate-400" /> : <ShoppingCart size={14} className="text-slate-400" />}
                       <span className="text-xs font-bold text-slate-700">{entry.detail}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {stockJournal.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm">Belum ada mutasi stok tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Journal Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History size={20} /> Catat Mutasi Barang
              </h3>
              <button onClick={() => setIsJournalModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleJournalSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClasses}>Jenis Mutasi</label>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setJournalForm({...journalForm, type: 'IN'})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${journalForm.type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Masuk (In)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setJournalForm({...journalForm, type: 'OUT'})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${journalForm.type === 'OUT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Keluar (Out)
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Tanggal</label>
                  <input 
                    type="date" 
                    value={journalForm.date} 
                    onChange={e => setJournalForm({...journalForm, date: e.target.value})}
                    className={inputClasses} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className={labelClasses}>Pilih Produk</label>
                    <select 
                      required 
                      value={journalForm.productId}
                      onChange={e => setJournalForm({...journalForm, productId: e.target.value, variantId: ''})}
                      className={inputClasses}
                    >
                      <option value="">-- Pilih Produk --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>

                 {journalForm.productId && products.find(p => p.id === journalForm.productId)?.variants?.length ? (
                    <div className="space-y-1 animate-in slide-in-from-top-2">
                       <label className={labelClasses}>Pilih Varian</label>
                       <select 
                         required
                         value={journalForm.variantId}
                         onChange={e => setJournalForm({...journalForm, variantId: e.target.value})}
                         className={inputClasses}
                       >
                         <option value="">-- Pilih Varian --</option>
                         {products.find(p => p.id === journalForm.productId)?.variants?.map(v => (
                           <option key={v.id} value={v.id}>{v.name} (Stok: {v.stock})</option>
                         ))}
                       </select>
                    </div>
                 ) : null}
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1 space-y-1">
                    <label className={labelClasses}>Jumlah</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={journalForm.quantity}
                      onChange={e => setJournalForm({...journalForm, quantity: parseInt(e.target.value) || 1})}
                      className={inputClasses}
                    />
                 </div>
                 <div className="col-span-2 space-y-1">
                    <label className={labelClasses}>{journalForm.type === 'IN' ? 'Nama Vendor' : 'Channel Penjualan'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={journalForm.type === 'IN' ? "Contoh: PT. Sumber Makmur" : "Contoh: Shopee / TikTok Shop"}
                      value={journalForm.detail}
                      onChange={e => setJournalForm({...journalForm, detail: e.target.value})}
                      className={inputClasses}
                    />
                 </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 ${journalForm.type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
              >
                Simpan Mutasi Stok
              </button>
            </form>
          </div>
        </div>
      )}

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
                      onClick={() => setFormData({ ...formData, variants: [...formData.variants, { id: Math.random().toString(36).substr(2, 9), sku: `${formData.sku}-VAR-${formData.variants.length + 1}`, name: '', hpp: formData.hpp, price: formData.price, stock: 0 }] })}
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
                    {formData.variants.map((v) => (
                      <div key={v.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 relative group">
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, variants: formData.variants.filter(varItem => varItem.id !== v.id) })}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={labelClasses}>Nama Variasi</label>
                            <input 
                              required
                              value={v.name}
                              onChange={e => setFormData({ ...formData, variants: formData.variants.map(varItem => varItem.id === v.id ? { ...varItem, name: e.target.value } : varItem) })}
                              className={inputClasses}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClasses}>SKU Variasi</label>
                            <input 
                              required
                              value={v.sku}
                              onChange={e => setFormData({ ...formData, variants: formData.variants.map(varItem => varItem.id === v.id ? { ...varItem, sku: e.target.value } : varItem) })}
                              className={inputClasses}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <input type="number" placeholder="HPP" className={inputClasses} value={v.hpp} onChange={e => setFormData({ ...formData, variants: formData.variants.map(varItem => varItem.id === v.id ? { ...varItem, hpp: parseInt(e.target.value) || 0 } : varItem) })} />
                           <input type="number" placeholder="Harga" className={inputClasses} value={v.price} onChange={e => setFormData({ ...formData, variants: formData.variants.map(varItem => varItem.id === v.id ? { ...varItem, price: parseInt(e.target.value) || 0 } : varItem) })} />
                           <input type="number" placeholder="Stok" className={inputClasses} value={v.stock} onChange={e => setFormData({ ...formData, variants: formData.variants.map(varItem => varItem.id === v.id ? { ...varItem, stock: parseInt(e.target.value) || 0 } : varItem) })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className="p-6 border-t bg-slate-50 flex gap-4 shrink-0">
              <button onClick={closeModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">Batal</button>
              <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl"><FileSpreadsheet size={20}/></div>
                <h3 className="text-xl font-bold">Bulk Import Barang</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 text-center space-y-6">
              <button onClick={downloadTemplate} className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 text-sm shadow-sm"><Download size={16} /> Download Template Excel</button>
              <div className="relative group">
                <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[24px] group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center gap-2">
                   <Upload size={32} className="text-slate-300 group-hover:text-indigo-500" />
                   <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-600">Pilih File Excel Juragan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8 text-center border border-slate-100">
            <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Hapus Produk?</h3>
            <p className="text-xs text-slate-500 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
              <button onClick={() => { onDeleteProduct(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
