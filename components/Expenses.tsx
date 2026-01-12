
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
  ChevronDown
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
    XLSX.writeFile(wb, `selina_jurnal_${MONTHS.find(m => m.val === filterMonth)?.label}.xlsx`);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* PRINT VIEW */}
      <div className="hidden print:block font-sans">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SELINA REPORT</h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-[0.3em]">Jurnal Operasional Toko</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Laporan</p>
            <p className="text-2xl font-black text-indigo-600">{MONTHS.find(m => m.val === filterMonth)?.label} {filterYear}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 mb-12">
           <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px]">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Pengeluaran</p>
              <p className="text-3xl font-black text-slate-900">Rp {totalFiltered.toLocaleString()}</p>
           </div>
           <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-right">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Transaksi</p>
              <p className="text-3xl font-black text-slate-900">{filteredExpenses.length} Records</p>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
           <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                 <th className="px-6 py-4 border border-slate-900">Tanggal</th>
                 <th className="px-6 py-4 border border-slate-900">Kategori</th>
                 <th className="px-6 py-4 border border-slate-900">Deskripsi</th>
                 <th className="px-6 py-4 border border-slate-900 text-right">Nominal</th>
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
      </div>

      {/* SCREEN VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bento-card p-6 bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <TrendingUp size={24} className="text-slate-100 group-hover:text-indigo-500/20 transition-colors" />
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Biaya ({MONTHS.find(m => m.val === filterMonth)?.label})</p>
           <h3 className="text-2xl font-bold text-slate-900">Rp {totalFiltered.toLocaleString()}</h3>
           <p className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-1">
             Menampilkan {filteredExpenses.length} transaksi.
           </p>
        </div>
        <div className="bento-card p-6 bg-white border border-slate-100 shadow-sm">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Status Laporan</p>
           <h3 className="text-2xl font-bold text-slate-900">Siap Cetak</h3>
           <p className="text-[10px] text-slate-400 font-medium mt-2">Filter aktif: {MONTHS.find(m => m.val === filterMonth)?.label} {filterYear}</p>
        </div>
        <div className="bento-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
           <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Cetak PDF Cepat</p>
           <button onClick={() => window.print()} className="mt-2 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
             <FileText size={14} /> Download PDF Periode Ini
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="relative">
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="appearance-none bg-slate-50 border-none pl-4 pr-10 py-2 rounded-xl text-xs font-black uppercase tracking-widest outline-none">
                {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
           <div className="relative border-l pl-3 border-slate-100">
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="appearance-none bg-slate-50 border-none pl-4 pr-10 py-2 rounded-xl text-xs font-black uppercase tracking-widest outline-none">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
           <div className="relative border-l pl-3 border-slate-100">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-50 pl-9 pr-4 py-2 rounded-xl text-[11px] font-bold outline-none border border-transparent focus:border-indigo-200 w-40" />
           </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsImportModalOpen(true)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Upload size={18} /></button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all text-xs font-black uppercase tracking-widest"><FileSpreadsheet size={16} /> Excel</button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all font-black text-xs uppercase tracking-widest"><Plus size={18} /> Tambah Biaya</button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm overflow-x-auto print:hidden">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Tanggal</th>
              <th className="px-8 py-5">Klasifikasi</th>
              <th className="px-8 py-5">Deskripsi</th>
              <th className="px-8 py-5">Metode</th>
              <th className="px-8 py-5 text-right">Nominal</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5 text-xs font-bold text-slate-600">{e.date}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getCategoryColor(e.category)}`}>
                    {e.category}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-900">{e.description}</td>
                <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">{e.paymentMethod}</td>
                <td className="px-8 py-5 text-right font-black text-rose-600">- Rp {e.amount.toLocaleString()}</td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setDeleteTarget(e)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD EXPENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-rose-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Receipt size={20} /> Catat Biaya</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className={labelClasses}>Tanggal</label>
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
                  <label className={labelClasses}>Metode Bayar</label>
                  <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})} className={inputClasses}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Deskripsi</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>Nominal (Rp)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})} className={inputClasses} />
              </div>
              <button type="submit" className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-xl transition-all">Simpan Transaksi</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT EXCEL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><FileSpreadsheet size={40} /></div>
             <h3 className="text-xl font-bold mb-2">Import Jurnal Excel</h3>
             <p className="text-sm text-slate-500 mb-8">Pilih file Excel laporan biaya Anda.</p>
             <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="mb-6 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
             <button onClick={() => setIsImportModalOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Batal</button>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center animate-in zoom-in-95">
            <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 mb-8">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold">Batal</button>
              <button onClick={() => { onDeleteExpense(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
