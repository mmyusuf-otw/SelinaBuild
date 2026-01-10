
import React from 'react';
import { Customer, Product, Invoice } from '../types';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  MessageCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Trash2, 
  UserPlus,
  Edit2,
  X,
  UserCheck,
  Globe,
  FileText,
  Printer,
  ShoppingBag,
  Award,
  Users,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CRMProps {
  customers: Customer[];
  products: Product[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
}

const CRM: React.FC<CRMProps> = ({ customers, products, onAddCustomer, onEditCustomer, onDeleteCustomer, onAddInvoice }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = React.useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = React.useState<{ sku: string; qty: number; price: number }[]>([]);
  
  const [formData, setFormData] = React.useState<Omit<Customer, 'id'>>({
    name: '', email: '', phone: '', location: '', province: '', totalSpent: 0
  });

  const topSpender = customers.length > 0 
    ? [...customers].sort((a: Customer, b: Customer) => (b.totalSpent || 0) - (a.totalSpent || 0))[0] 
    : null;

  const provinceStats = customers.reduce((acc, curr) => {
    acc[curr.province] = (acc[curr.province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedProvinces: [string, number][] = (Object.entries(provinceStats) as [string, number][])
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleWhatsApp = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const downloadTemplate = () => {
    const data = [
      ['Nama', 'Email', 'Telepon', 'Kota', 'Provinsi'],
      ['Budi Santoso', 'budi@example.com', '08123456789', 'Jakarta Barat', 'DKI Jakarta']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Pelanggan");
    XLSX.writeFile(wb, "selina_customer_template.xlsx");
  };

  const exportData = () => {
    const wsData = customers.map(c => ({
      'ID': c.id,
      'Nama': c.name,
      'Email': c.email,
      'Telepon': c.phone,
      'Kota': c.location,
      'Provinsi': c.province,
      'Total Belanja': c.totalSpent
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pelanggan");
    XLSX.writeFile(wb, `selina_customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        jsonData.forEach((row: any) => {
          onAddCustomer({
            name: String(row['Nama'] || row['nama'] || ''),
            email: String(row['Email'] || row['email'] || ''),
            phone: String(row['Telepon'] || row['telepon'] || ''),
            location: String(row['Kota'] || row['kota'] || ''),
            province: String(row['Provinsi'] || row['provinsi'] || ''),
            totalSpent: 0
          });
        });
        setIsImportModalOpen(false);
        alert(`Berhasil mengimpor ${jsonData.length} pelanggan!`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-card bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between overflow-hidden relative group">
            <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
               <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Pelanggan</p>
               <h3 className="text-4xl font-black">{customers.length}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/20 w-fit px-3 py-1 rounded-full relative z-10">
              <Plus size={10} /> 12 Pelanggan baru bulan ini
            </div>
          </div>

          <div className="bento-card bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Award size={24} /></div>
              <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-lg">Top Spender</span>
            </div>
            <div className="mt-4">
               <p className="text-slate-400 text-xs font-medium">Pelanggan Setia</p>
               <h4 className="text-xl font-bold text-slate-900 truncate">{topSpender?.name || '-'}</h4>
               <p className="text-indigo-600 font-bold text-sm">Rp {topSpender?.totalSpent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bento-card bg-white p-6 border border-slate-100 shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Sebaran Provinsi
          </h4>
          <div className="space-y-3">
            {sortedProvinces.map(([province, count]: [string, number]) => {
              const denominator = customers.length || 1;
              const percentage = ((count as number) / denominator) * 100;
              return (
                <div key={province} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>{province}</span>
                    <span>{count} Orang</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {sortedProvinces.length === 0 && <p className="text-center text-xs text-slate-300 py-10">Belum ada data lokasi</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari pelanggan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <Download size={16} /> Export Excel
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <Upload size={16} /> Import Excel
          </button>
          <button 
            onClick={() => { setEditingCustomer(null); setFormData({name:'', email:'', phone:'', location:'', province:'', totalSpent:0}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold text-sm"
          >
            <UserPlus size={18} /> Tambah
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Identitas Pelanggan</th>
              <th className="px-8 py-5">Informasi Kontak</th>
              <th className="px-8 py-5">Domisili</th>
              <th className="px-8 py-5 text-right">Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-lg border border-indigo-100 shadow-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Reguler Buyer</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-600">
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-2 text-slate-500"><Mail size={12} className="text-slate-300"/> {c.email}</span>
                    <span className="flex items-center gap-2 text-slate-500"><Phone size={12} className="text-slate-300"/> {c.phone}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                   <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-slate-800"><MapPin size={12} className="text-indigo-400"/> {c.location}</span>
                      <span className="pl-5 text-[10px] text-slate-400">{c.province}</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { setInvoiceCustomer(c); setInvoiceItems([]); setIsInvoiceModalOpen(true); }}
                      className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      title="Buat Invoice"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(c.phone)} 
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button 
                      onClick={() => { setEditingCustomer(c); setFormData(c); setIsModalOpen(true); }}
                      className="p-2.5 text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteCustomer(c.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl"><Upload size={20}/></div>
                <h3 className="text-xl font-bold">Import Pelanggan</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            <div className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-indigo-200">
                <FileSpreadsheet size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-lg">Gunakan Template Selina</h4>
                <p className="text-sm text-slate-500 px-4">Pastikan format file Anda mengikuti standar Excel kami agar tidak terjadi kesalahan sinkronisasi data.</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={downloadTemplate}
                  className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download Template Excel
                </button>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleImportExcel}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full py-8 border-2 border-dashed border-indigo-100 rounded-3xl group-hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center gap-2">
                     <Plus size={24} className="text-indigo-400" />
                     <span className="text-sm font-bold text-slate-400">Pilih File Excel Anda</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-bold hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
              >
                Mulai Sinkronisasi Data
              </button>
            </div>
          </div>
        </div>
      )}

      {isInvoiceModalOpen && invoiceCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg"><FileText size={20}/></div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Invoice Generator</h3>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag size={14}/> Pilih Produk
                </h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {products.map(p => (
                    <div key={p.id} className="p-4 border rounded-2xl flex items-center justify-between hover:border-indigo-300 transition-colors">
                      <div>
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {p.sku} | Stok: {p.stock}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-sm font-bold text-indigo-600">Rp {p.price.toLocaleString()}</span>
                        <button 
                          onClick={() => {
                            const existing = invoiceItems.find(i => i.sku === p.sku);
                            if (existing) {
                              setInvoiceItems(invoiceItems.map(i => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i));
                            } else {
                              setInvoiceItems([...invoiceItems, { sku: p.sku, qty: 1, price: p.price }]);
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kepada:</p>
                    <h5 className="font-bold text-slate-900">{invoiceCustomer.name}</h5>
                    <p className="text-xs text-slate-500">{invoiceCustomer.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal:</p>
                    <p className="text-xs font-bold">{new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                      <div className="flex-1">
                        <p className="font-bold">{item.sku}</p>
                        <p className="text-[10px] text-slate-500">{item.qty} x Rp {item.price.toLocaleString()}</p>
                      </div>
                      <span className="font-bold">Rp {(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-300">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-500 uppercase">Total Tagihan</span>
                    <span className="text-xl font-black text-indigo-600">
                      Rp {invoiceItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const total = invoiceItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
                      onAddInvoice({
                        customerId: invoiceCustomer.id,
                        total,
                        status: 'PAID',
                        date: new Date().toISOString().split('T')[0],
                        items: invoiceItems
                      });
                      setIsInvoiceModalOpen(false);
                      setInvoiceItems([]);
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={18}/> Print & Bayar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingCustomer ? <Edit2 size={20} /> : <UserPlus size={20} />}
                {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingCustomer) { onEditCustomer({ ...editingCustomer, ...formData }); } 
              else { onAddCustomer(formData); }
              setIsModalOpen(false);
            }} className="p-8 space-y-5">
              <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">No. Telepon</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Kota</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Provinsi</label>
                <input required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                {editingCustomer ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
