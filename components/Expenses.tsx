
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
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES = ['Gaji', 'Iklan', 'Listrik', 'Sewa', 'Marketing', 'Lainnya'] as const;
const PAYMENT_METHODS = ['Cash', 'Transfer', 'Kartu Kredit', 'E-Wallet'] as const;

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [formData, setFormData] = React.useState<Omit<Expense, 'id'>>({
    category: 'Lainnya',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  });

  const filteredExpenses = expenses
    .filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalThisMonth = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

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

  const downloadTemplate = () => {
    const data = [
      ['Tanggal (YYYY-MM-DD)', 'Kategori', 'Deskripsi', 'Metode Pembayaran', 'Nominal'],
      ['2024-03-25', 'Iklan', 'Top up Shopee Ads', 'Transfer', 500000],
      ['2024-03-26', 'Gaji', 'Gaji Admin Maret', 'Transfer', 3500000],
      ['2024-03-27', 'Listrik', 'Token Listrik Kantor', 'Cash', 200000]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Expenses");
    XLSX.writeFile(wb, "selina_jurnal_template.xlsx");
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
        alert(`Berhasil mengimpor ${jsonData.length} catatan pengeluaran!`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const exportToExcel = () => {
    const data = filteredExpenses.map(e => ({
      'Tanggal': e.date,
      'Kategori': e.category,
      'Deskripsi': e.description,
      'Metode': e.paymentMethod,
      'Nominal': e.amount
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal Operasional");
    XLSX.writeFile(wb, `selina_jurnal_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // Memanfaatkan print browser dengan styling khusus print
    window.print();
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Print-only Header (Hidden on screen) */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Laporan Jurnal Operasional - Selina</h1>
        <p className="text-sm text-slate-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        <p className="text-lg font-bold mt-4">Total Pengeluaran: Rp {totalThisMonth.toLocaleString()}</p>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bento-card p-6 bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <TrendingUp size={24} className="text-slate-100 group-hover:text-indigo-500/20 transition-colors" />
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
           <h3 className="text-2xl font-bold text-slate-900">Rp {totalThisMonth.toLocaleString()}</h3>
           <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
             <ArrowUpRight size={10} /> 4.2% dari target budget
           </p>
        </div>
        
        <div className="bento-card p-6 bg-white border border-slate-100 shadow-sm">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Kategori Terbesar</p>
           <h3 className="text-2xl font-bold text-slate-900">
             {expenses.length > 0 ? expenses.sort((a,b) => b.amount - a.amount)[0].category : '-'}
           </h3>
           <p className="text-[10px] text-slate-400 font-medium mt-2">Berdasarkan nominal transaksi tertinggi</p>
        </div>

        <div className="bento-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
           <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Status Cashflow</p>
           <h3 className="text-2xl font-bold">Sehat</h3>
           <p className="text-[10px] text-indigo-200 font-medium mt-2">Operasional tertutup oleh profit harian</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari deskripsi atau kategori..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <Upload size={16} /> Import Excel
          </button>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <Download size={16} /> Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <FileText size={16} /> PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold text-sm"
          >
            <Plus size={18} /> Tambah Biaya
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider print:bg-slate-200">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Deskripsi</th>
              <th className="px-6 py-4">Metode</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg print:hidden">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{e.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getCategoryColor(e.category)}`}>
                    {e.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{e.description}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CreditCard size={14} className="print:hidden" />
                    <span className="text-xs font-medium">{e.paymentMethod}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-rose-600">- Rp {e.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right print:hidden">
                  <button 
                    onClick={() => setDeleteTarget(e)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Receipt size={40} className="opacity-20" />
                    <p className="text-sm">Belum ada data pengeluaran ditemukan</p>
                  </div>
                </td>
              </tr>
            )}
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
                <h3 className="text-xl font-bold">Import Jurnal</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20}/></button>
            </div>
            <div className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-indigo-200">
                <FileSpreadsheet size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-lg">Gunakan Template Selina</h4>
                <p className="text-sm text-slate-500 px-4">Pastikan format file Anda mengikuti standar Excel kami agar data tercatat dengan benar di pembukuan.</p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={downloadTemplate}
                  className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
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
                     <span className="text-sm font-bold text-slate-400">Pilih File Excel Jurnal</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-bold hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-6 border-b flex justify-between items-center bg-rose-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Receipt size={20} /> Catat Biaya Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className={labelClasses}>Tanggal Pengeluaran</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClasses}>Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className={inputClasses}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}>Metode Bayar</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                    className={inputClasses}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>Deskripsi Pengeluaran</label>
                <input 
                  required
                  placeholder="Contoh: Bayar Iklan TikTok 24-30 Mar"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input 
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Anda akan menghapus pengeluaran senilai <strong>Rp {deleteTarget.amount.toLocaleString()}</strong> untuk <strong>{deleteTarget.description}</strong>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  onDeleteExpense(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all"
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

export default Expenses;
