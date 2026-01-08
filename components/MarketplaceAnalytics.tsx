
import React from 'react';
import { 
  Upload, 
  FileText, 
  CreditCard, 
  Database, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';

type Marketplace = 'Shopee' | 'TikTok Shop Tokopedia' | 'Lazada';
type UploadType = 'order' | 'payout' | 'hpp';

interface MarketplaceConfig {
  name: Marketplace;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

const MARKETPLACES: MarketplaceConfig[] = [
  { 
    name: 'Shopee', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png',
    description: 'Analisa Laporan Shopee'
  },
  { 
    name: 'TikTok Shop Tokopedia', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Tokopedia_logo.svg', 
    description: 'Analisa Laporan TikTok Shop Tokopedia'
  },
  { 
    name: 'Lazada', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Lazada_logo.svg',
    description: 'Analisa Laporan Lazada'
  },
];

const MarketplaceAnalytics: React.FC = () => {
  const [selectedMarketplace, setSelectedMarketplace] = React.useState<Marketplace | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, boolean>>({});

  const handleUpload = (type: UploadType) => {
    // Simulasi parsing data
    const key = `${selectedMarketplace}-${type}`;
    setUploadStatus(prev => ({ ...prev, [key]: true }));
  };

  if (!selectedMarketplace) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">Pilih Marketplace</h3>
          <p className="text-slate-500">Pilih sumber data yang ingin Anda analisa profitnya hari ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MARKETPLACES.map((mp) => (
            <button
              key={mp.name}
              onClick={() => setSelectedMarketplace(mp.name)}
              className="group p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <ChevronRight size={24} className="text-slate-300" />
              </div>
              <div className={`w-20 h-20 ${mp.bgColor} rounded-2xl flex items-center justify-center p-4 transition-transform group-hover:scale-110`}>
                {mp.name === 'TikTok Shop Tokopedia' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" className="w-8 h-8 absolute -top-1 -left-1 z-10" alt="TikTok" />
                    <img src={mp.icon} alt={mp.name} className="w-full h-full object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                  </div>
                ) : (
                  <img src={mp.icon} alt={mp.name} className="w-full h-full object-contain" />
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold">{mp.name}</h4>
                <p className="text-sm text-slate-400">{mp.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedMarketplace(null)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3">
              Profit Analytics {selectedMarketplace}
            </h3>
            <p className="text-sm text-slate-500">
              Lengkapi 3 data utama untuk hasil yang akurat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column 1: Data Order */}
        <div className="bento-card p-8 bg-white border border-slate-100 space-y-6 flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="font-bold">1. Data Order</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Master Penjualan</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload file CSV pesanan dari Seller Center. Data ini berisi informasi SKU, jumlah, dan harga jual kotor.
          </p>

          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:bg-indigo-50/30 transition-colors"
               onClick={() => handleUpload('order')}>
            {uploadStatus[`${selectedMarketplace}-order`] ? (
              <>
                <CheckCircle2 size={40} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600">Berhasil Terpasang</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm font-semibold text-slate-400">Tarik CSV ke sini</p>
              </>
            )}
          </div>
        </div>

        {/* Upload Column 2: Dana Dilepas */}
        <div className="bento-card p-8 bg-white border border-slate-100 space-y-6 flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="font-bold">2. Dana Dilepas</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Payout Report</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Laporan saldo/pencairan. Digunakan untuk menghitung biaya admin riil dan ongkir yang dipotong platform.
          </p>

          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:bg-emerald-50/30 transition-colors"
               onClick={() => handleUpload('payout')}>
             {uploadStatus[`${selectedMarketplace}-payout`] ? (
              <>
                <CheckCircle2 size={40} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600">Berhasil Terpasang</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                <p className="text-sm font-semibold text-slate-400">Tarik CSV ke sini</p>
              </>
            )}
          </div>
        </div>

        {/* Upload Column 3: HPP */}
        <div className="bento-card p-8 bg-white border border-slate-100 space-y-6 flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-bold">3. Data HPP</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Cost Analysis</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Data modal barang. Selina akan melakukan mapping otomatis berdasarkan SKU yang terdeteksi di data order.
          </p>

          <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:bg-amber-50/30 transition-colors"
               onClick={() => handleUpload('hpp')}>
             {uploadStatus[`${selectedMarketplace}-hpp`] ? (
              <>
                <CheckCircle2 size={40} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600">Berhasil Terpasang</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                <p className="text-sm font-semibold text-slate-400">Tarik CSV ke sini</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {Object.keys(uploadStatus).filter(k => k.startsWith(selectedMarketplace)).length === 3 ? (
        <div className="bg-slate-900 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-bold text-white mb-2">Siap Menganalisa Profit?</h4>
            <p className="text-slate-400 text-sm max-w-md">Data dari {selectedMarketplace} telah berhasil dipetakan. Kami akan menghitung laba bersih setelah potongan admin dan biaya layanan.</p>
          </div>
          <button className="relative z-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/20">
            Tampilkan Laporan Profit
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-900 font-bold">Menunggu Dokumen Lengkap</p>
            <p className="text-xs text-slate-500">
              Unggah ketiga jenis file CSV untuk mendapatkan kalkulasi True Profit yang akurat hingga ke perak terakhir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAnalytics;
