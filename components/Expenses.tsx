
import React from 'react';
import { Expense } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  CreditCard, 
  X, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Printer,
  ShieldCheck,
  Sparkles,
  // Fix: Added missing CheckCircle2 icon
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES = ['Gaji', 'Iklan', 'Listrik', 'Sewa', 'Marketing', 'Lainnya'] as const;
const PAYMENT_METHODS = ['Cash', 'Transfer', 'Kartu Kredit', 'E-Wallet'] as const;

const MONTHS = [
  { val: '01', label: 'Januari' },
  { val: '02', label: 'Februari' },
  { val: '03', label: 'Maret' },
  { val: '04', label: 'April' },
  { val: '05', label: 'Mei' },
  { val: '06', label: 'Juni' },
  { val: '07', label: 'Juli' },
  { val: '08', label: 'Agustus' },
  { val: '09', label: 'September' },
  { val: '10', label: 'Oktober' },
  { val: '11', label: 'November' },
  { val: '12', label: 'Desember' }
];

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: (currentYearNum + 2) - 2023 + 1 }, (_, i) => String(2023 + i));

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [filterMonth, setFilterMonth] = React.useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filterYear, setFilterYear] = React.useState<string>(String(new Date().getFullYear()));

  const [formData, setFormData] = React.useState<Omit<Expense, 'id'>>({
    category: 'Lainnya',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  });

  const filteredExpenses = expenses
    .filter(e => {
      const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
      const dateParts = e.date.split('-');
      const expenseYear = dateParts[0];
      const expenseMonth = dateParts[1];
      return matchSearch && expenseMonth === filterMonth && expenseYear === filterYear;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense(formData);
    setIsModalOpen(false);
    setFormData({
      category: 'Lainnya',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash'
    });
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
          onAddExpense({
            date: String(row['Tanggal (YYYY-MM-DD)'] || row['tanggal'] || new Date().toISOString().split('T')[0]),
            category: (row['Kategori'] || 'Lainnya') as any,
            description: String(row['Deskripsi'] || row['deskripsi'] || 'Tanpa Deskripsi'),
            paymentMethod: (row['Metode Pembayaran'] || 'Cash') as any,
            amount: Number(row['Nominal'] || row['nominal'] || 0)
          });
        });
        setIsImportModalOpen(false);
        alert(`Berhasil mengimpor ${jsonData.length} catatan!`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const exportToExcel = () => {
    const data = filteredExpenses.map(e => ({
      'Tanggal': e.date, 'Kategori': e.category, 'Deskripsi': e.description, 'Metode': e.paymentMethod, 'Nominal': e.amount
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal");
    XLSX.writeFile(wb, `selina_jurnal_${MONTHS.find(m => m.val === filterMonth)?.label}_${filterYear}.xlsx`);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Gaji': return 'bg-indigo-50 text-indigo-600';
      case 'Iklan': return 'bg-rose-50 text-rose-600';
      case 'Listrik': return 'bg-amber-50 text-amber-600';
      case 'Marketing': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all";
  const labelClasses = "text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider";

  const handlePrintPDF = () => {
    if (filteredExpenses.length === 0) {
      alert("Tidak ada data untuk periode yang dipilih, Juragan.");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* PRINT VIEW (Hidden on Screen) */}
      <div className="hidden print:block font-sans text-slate-900">
        <div className="flex justify-between items-start border-b-8 border-indigo-600 pb-8 mb-10">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">S</div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SELINA CLOUD REPORT</h1>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-[0.3em]">Smart Operational Journal</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Laporan</p>
            <p className="text-2xl font-black text-indigo-600">{MONTHS.find(m => m.val === filterMonth)?.label} {filterYear}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Generated by Selina AI Assistant</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
           <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px]">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Pengeluaran</p>
              <p className="text-3xl font-black text-rose-600">Rp {totalFiltered.toLocaleString()}</p>
           </div>
           <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px]">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jumlah Transaksi</p>
              <p className="text-3xl font-black text-slate-900">{filteredExpenses.length} Records</p>
           </div>
           <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[32px]">
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Status Audit</p>
              <div className="flex items-center gap-2 text-indigo-600 font-black">
                 <ShieldCheck size={20} /> <span className="text-xl">VERIFIED</span>
              </div>
           </div>
        </div>

        <table className="w-full text-left border-collapse rounded-3xl overflow-hidden shadow-sm border border-slate-200">
           <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                 <th className="px-6 py-5 border border-slate-900">Tanggal</th>
                 <th className="px-6 py-5 border border-slate-900">Kategori</th>
                 <th className="px-6 py-5 border border-slate-900">Deskripsi</th>
                 <th className="px-6 py-5 border border-slate-900 text-right">Nominal</th>
              </tr>
           </thead>
           <tbody>
              {filteredExpenses.map(e => (
                <tr key={e.id} className="text-[11px] font-bold text-slate-700 border border-slate-200">
                  <td className="px-6 py-4 border border-slate-200">{e.date}</td>
                  <td className="px-6 py-4 border border-slate-200 uppercase">{e.category}</td>
                  <td className="px-6 py-4 border border-slate-200">{e.description}</td>
                  <td className="px-6 py-4 border border-slate-200 text-right">Rp {e.amount.toLocaleString()}</td>
                </tr>
              ))}
           </tbody>
        </table>
        
        <div className="mt-20 flex justify-between items-end border-t border-slate-100 pt-10">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dicetak Pada</p>
              <p className="text-xs font-bold text-slate-900">{new Date().toLocaleString('id-ID')}</p>
           </div>
           <div className="text-center">
              <div className="w-32 h-1 border-b-2 border-slate-900 mx-auto mb-2"></div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Bagian Keuangan</p>
           </div>
        </div>
      </div>

      {/* SCREEN VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        <div className="bento-card p-8 bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <TrendingUp size={24} className="text-slate-100 group-hover:text-indigo-500/20 transition-colors" />
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Biaya {MONTHS.find(m => m.val === filterMonth)?.label}</p>
           <h3 className="text-3xl font-black text-slate-900">Rp {totalFiltered.toLocaleString()}</h3>
           <div className="flex items-center gap-2 mt-4 text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-lg">
             <CheckCircle2 size={12} /> {filteredExpenses.length} Records Terfilter
           </div>
        </div>

        <div className="bento-card p-8 bg-slate-900 text-white shadow-xl shadow-slate-100 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform"><FileText size={100} /></div>
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status Laporan</p>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Audit Ready</h3>
           </div>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Periode: {MONTHS.find(m => m.val === filterMonth)?.label} {filterYear}</p>
        </div>

        <div className="bento-card p-8 bg-indigo-600 text-white shadow-2xl shadow-indigo-100 flex flex-col justify-between group">
           <div className="space-y-2">
              <h4 className="font-black italic tracking-tighter uppercase flex items-center gap-2">
                 <Sparkles size={16} fill="currentColor" /> Quick Export Engine
              </h4>
              <p className="text-[10px] text-indigo-100 font-medium">Laporan periode yang dipilih siap untuk didownload atau dicetak.</p>
           </div>
           <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={handlePrintPDF}
                className="flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95"
              >
                 <Printer size={14} /> Cetak PDF
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-lg active:scale-95"
              >
                 <FileSpreadsheet size={14} /> Excel
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm w-full lg:w-auto">
           <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              <Filter size={14} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Laporan</span>
           </div>
           <div className="relative">
              <select 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(e.target.value)} 
                className="appearance-none bg-slate-50 border border-slate-100 pl-4 pr-10 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
              >
                {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
           <div className="relative">
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(e.target.value)} 
                className="appearance-none bg-slate-50 border border-slate-100 pl-4 pr-10 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
           <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-50 pl-11 pr-4 py-2.5 rounded-xl text-[11px] font-bold outline-none border border-slate-100 focus:border-indigo-500 transition-all" 
              />
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)} 
            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm group"
          >
             <Upload size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all font-black text-xs uppercase tracking-[0.2em] active:scale-95"
          >
             <Plus size={20} /> Catat Pengeluaran
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm overflow-x-auto print:hidden">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Tanggal</th>
              <th className="px-8 py-6">Klasifikasi</th>
              <th className="px-8 py-6">Deskripsi</th>
              <th className="px-8 py-6">Metode</th>
              <th className="px-8 py-6 text-right">Nominal</th>
              <th className="px-8 py-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-6 text-[11px] font-black text-slate-500">{e.date}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getCategoryColor(e.category)}`}>
                    {e.category}
                  </span>
                </td>
                <td className="px-8 py-6 font-bold text-slate-900">{e.description}</td>
                <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.paymentMethod}</td>
                <td className="px-8 py-6 text-right font-black text-rose-600">- Rp {e.amount.toLocaleString()}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setDeleteTarget(e)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic text-sm font-medium">Tidak ada pengeluaran tercatat untuk periode ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD EXPENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b flex justify-between items-center bg-rose-600 text-white">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-xl"><Receipt size={24} /></div>
                 <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Catat Pengeluaran</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className={labelClasses}>Tanggal Transaksi</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClasses} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClasses}>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className={inputClasses}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Metode Pembayaran</label>
                  <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})} className={inputClasses}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Deskripsi Pengeluaran</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClasses} placeholder="Beli bensin kurir / bayar listrik..." />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Nominal (Rp)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})} className={`${inputClasses} text-lg font-black text-rose-600`} />
              </div>
              <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all active:scale-95">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT EXCEL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-indigo-100 shadow-inner"><FileSpreadsheet size={48} /></div>
             <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Import Jurnal Excel</h3>
             <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed">Pilih file Excel laporan biaya Anda. <br/> Gunakan format kolom yang sesuai untuk hasil akurat.</p>
             <div className="relative group mb-10">
                <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[32px] group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-all flex flex-col items-center gap-2">
                   <Upload className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih File XLSX</span>
                </div>
             </div>
             <button onClick={() => setIsImportModalOpen(false)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-all">Batal & Tutup</button>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-rose-100"><AlertTriangle size={40} /></div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 font-medium mb-10">Data pengeluaran senilai Rp {deleteTarget.amount.toLocaleString()} akan dihapus permanen.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteTarget(null)} className="py-4 bg-slate-100 text-slate-600 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Batal</button>
              <button onClick={() => { onDeleteExpense(deleteTarget.id); setDeleteTarget(null); }} className="py-4 bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
