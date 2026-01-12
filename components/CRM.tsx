
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
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle
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
  const [invoiceItems, setInvoiceItems] = React.useState<{ sku: string; qty: number; price: number; name?: string }[]>([]);
  
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

  const handlePrintAndPay = () => {
    if (!invoiceCustomer || invoiceItems.length === 0) {
      alert("Harap pilih minimal satu produk, Juragan!");
      return;
    }

    const total = invoiceItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    onAddInvoice({
      customerId: invoiceCustomer.id,
      total,
      status: 'PAID',
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems.map(({sku, qty, price}) => ({sku, qty, price}))
    });

    setTimeout(() => {
      window.print();
      setIsInvoiceModalOpen(false);
      setInvoiceItems([]);
      setInvoiceCustomer(null);
    }, 100);
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

  const downloadTemplate = () => {
    const data = [
      ['Nama Pelanggan', 'Email', 'Telepon', 'Kota', 'Provinsi'],
      ['Budi Santoso', 'budi@gmail.com', '081234567890', 'Jakarta Selatan', 'DKI Jakarta'],
      ['Siti Aminah', 'siti@yahoo.com', '085712345678', 'Bandung', 'Jawa Barat']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template CRM");
    XLSX.writeFile(wb, "selina_crm_template.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

        if (jsonData.length === 0) {
          alert("File kosong, Juragan!");
          return;
        }

        // Helper untuk normalisasi header
        const normalize = (key: string) => key.toLowerCase().replace(/[^a-z]/g, "");
        
        let successCount = 0;
        jsonData.forEach((row: any) => {
          // Cari field dengan normalisasi (agar tidak sensitif terhadap huruf besar/kecil atau spasi)
          const findField = (aliases: string[]) => {
            const key = Object.keys(row).find(k => aliases.some(a => normalize(k).includes(normalize(a))));
            return key ? String(row[key]) : "";
          };

          const name = findField(['nama', 'name', 'pelanggan', 'customer']);
          const email = findField(['email', 'surel', 'mail']);
          const phone = findField(['telepon', 'phone', 'wa', 'whatsapp', 'hp', 'no']);
          const location = findField(['kota', 'city', 'kabupaten', 'location', 'alamat']);
          const province = findField(['provinsi', 'province', 'wilayah']);

          if (name && (phone || email)) {
            onAddCustomer({
              name,
              email: email || `${normalize(name)}@selina.user`,
              phone: phone || '-',
              location: location || '-',
              province: province || '-',
              totalSpent: 0
            });
            successCount++;
          }
        });

        setIsImportModalOpen(false);
        alert(`Berhasil mengimpor ${successCount} pelanggan baru!`);
      } catch (err) {
        console.error("Import Error:", err);
        alert("Gagal membaca file. Pastikan formatnya .xlsx atau .csv");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* AREA PRINT (Invoice) tetap ada... */}
      <div className="hidden print:block p-10 bg-white font-sans text-slate-900">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
           <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">INVOICE</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Selina Cloud Billing</p>
           </div>
           <div className="text-right">
              <h2 className="text-xl font-black">SELINA STORE</h2>
              <p className="text-xs text-slate-500">Jl. Teknologi Masa Depan No. 1</p>
              <p className="text-xs text-slate-500">admin@selina.id</p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-10 mb-10">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Untuk:</p>
              <p className="text-lg font-black">{invoiceCustomer?.name}</p>
              <p className="text-xs text-slate-600">{invoiceCustomer?.location}, {invoiceCustomer?.province}</p>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail:</p>
              <p className="text-xs font-bold">INV-{Math.floor(Date.now()/1000)}</p>
              <p className="text-xs font-bold">{new Date().toLocaleDateString('id-ID')}</p>
           </div>
        </div>
        <table className="w-full text-left mb-10 border-collapse">
           <thead>
              <tr className="bg-slate-100 text-[10px] font-black uppercase tracking-widest">
                 <th className="px-6 py-4">Item</th>
                 <th className="px-6 py-4 text-center">Qty</th>
                 <th className="px-6 py-4 text-right">Total</th>
              </tr>
           </thead>
           <tbody>
              {invoiceItems.map((item, idx) => (
                <tr key={idx} className="text-xs font-bold border-b border-slate-100">
                  <td className="px-6 py-4">{item.name || item.sku}</td>
                  <td className="px-6 py-4 text-center">{item.qty}</td>
                  <td className="px-6 py-4 text-right">Rp {(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
           </tbody>
        </table>
        <div className="flex justify-end pt-5 border-t">
           <div className="text-right">
              <p className="text-xs font-bold text-slate-400">Total Tagihan</p>
              <p className="text-2xl font-black text-indigo-600">Rp {invoiceItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-card bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between overflow-hidden relative group">
            <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
               <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Pelanggan</p>
               <h3 className="text-4xl font-black">{customers.length}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/20 w-fit px-3 py-1 rounded-full relative z-10">
              <Plus size={10} /> Database Terintegrasi
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
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={14} /> Sebaran Wilayah</h4>
          <div className="space-y-3">
            {sortedProvinces.map(([province, count]: [string, number]) => (
              <div key={province} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-600"><span>{province}</span><span>{count}</span></div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(count / (customers.length || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
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
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"><Download size={16} /> Export</button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all text-sm font-bold"><Upload size={16} /> Import</button>
          <button onClick={() => { setEditingCustomer(null); setFormData({ name: '', email: '', phone: '', location: '', province: '', totalSpent: 0 }); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all font-bold text-sm"><UserPlus size={18} /> Tambah</button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto print:hidden">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Identitas Pelanggan</th>
              <th className="px-8 py-5">Kontak</th>
              <th className="px-8 py-5">Domisili</th>
              <th className="px-8 py-5 text-right">Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg border border-indigo-100">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Total Spent: Rp {c.totalSpent?.toLocaleString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2"><Mail size={12} className="text-slate-300"/> {c.email}</span>
                    <span className="flex items-center gap-2"><Phone size={12} className="text-slate-300"/> {c.phone}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                   <span className="flex items-center gap-2 text-slate-800"><MapPin size={12} className="text-indigo-400"/> {c.location}, {c.province}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setInvoiceCustomer(c); setInvoiceItems([]); setIsInvoiceModalOpen(true); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><FileText size={16} /></button>
                    <button onClick={() => handleWhatsApp(c.phone)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle size={16} /></button>
                    <button onClick={() => { setEditingCustomer(c); setFormData({ name: c.name, email: c.email, phone: c.phone, location: c.location, province: c.province, totalSpent: c.totalSpent }); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteCustomer(c.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL IMPORT CRM */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b bg-indigo-600 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl"><FileSpreadsheet size={24}/></div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Import Customer</h3>
               </div>
               <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={24}/></button>
            </div>
            <div className="p-10 text-center space-y-8">
               <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-left">
                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><HelpCircle size={18}/></div>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed">Gunakan template kami agar data Nama, Email, dan Telepon terdeteksi otomatis oleh AI Selina.</p>
                  </div>
                  <button onClick={downloadTemplate} className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                     <Download size={14}/> Download Template Excel
                  </button>
               </div>
               
               <div className="relative group">
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="w-full py-12 border-4 border-dashed border-slate-100 rounded-[40px] group-hover:bg-indigo-50/50 group-hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-3">
                     <Upload size={40} className="text-slate-300 group-hover:text-indigo-600" />
                     <span className="text-sm font-black text-slate-400 group-hover:text-indigo-600">Klik Untuk Upload File</span>
                  </div>
               </div>
               
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Format didukung: XLSX, XLS, CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD/EDIT CUSTOMER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-white/20">
             <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingCustomer ? <Edit2 size={20} /> : <UserPlus size={20} />}
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
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
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Telepon/WA</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Kota</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Provinsi</label>
                <input required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg">Simpan Pelanggan</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INVOICE GENERATOR tetap ada... */}
      {isInvoiceModalOpen && invoiceCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg"><FileText size={20}/></div>
                  <h3 className="text-xl font-bold italic tracking-tighter uppercase">Invoice Generator</h3>
               </div>
               <button onClick={() => setIsInvoiceModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
               <div className="lg:col-span-7 p-8 overflow-y-auto space-y-6 border-r border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={14}/> Pilih Produk</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(p => (
                      <div key={p.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-indigo-300 transition-all">
                        <div>
                          <p className="text-sm font-black text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Stok: {p.stock}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-black text-indigo-600">Rp {p.price.toLocaleString()}</span>
                          <button 
                            onClick={() => {
                              const existing = invoiceItems.find(i => i.sku === p.sku);
                              if (existing) setInvoiceItems(invoiceItems.map(i => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i));
                              else setInvoiceItems([...invoiceItems, { sku: p.sku, qty: 1, price: p.price, name: p.name }]);
                            }}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                          >Tambah</button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="lg:col-span-5 bg-slate-50 p-8 flex flex-col">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex-1 flex flex-col">
                     <div className="mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tagihan Ke</p>
                        <h5 className="font-black text-slate-900 text-lg leading-none">{invoiceCustomer.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold mt-2">{invoiceCustomer.location}</p>
                     </div>
                     <div className="flex-1 space-y-3 overflow-y-auto">
                        {invoiceItems.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl">
                              <div><p className="font-bold">{item.name}</p><p className="text-[10px] text-slate-400">{item.qty} x Rp {item.price.toLocaleString()}</p></div>
                              <p className="font-black">Rp {(item.qty * item.price).toLocaleString()}</p>
                           </div>
                        ))}
                     </div>
                     <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
                           <span className="text-xl font-black text-indigo-600">Rp {invoiceItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}</span>
                        </div>
                        <button 
                          disabled={invoiceItems.length === 0}
                          onClick={handlePrintAndPay}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                          <Printer size={18} /> Print & Bayar
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
