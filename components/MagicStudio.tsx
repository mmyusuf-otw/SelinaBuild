
import React from 'react';
// Fixed: Consolidated icons and moved RefreshCw to the top imports
import { Camera, Music, Video, Sparkles, Wand2, Download, Trash2, Mic, RefreshCw } from 'lucide-react';

const MagicStudio: React.FC = () => {
  const [activeTool, setActiveTool] = React.useState<'photo' | 'voice' | 'video'>('photo');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const handleMagic = () => {
    setIsProcessing(true);
    // Simulate Gemini generation
    setTimeout(() => {
      setIsProcessing(false);
      setResult('https://picsum.photos/800/800?random=' + Math.random());
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b pb-4 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => { setActiveTool('photo'); setResult(null); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${activeTool === 'photo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <Camera size={18} /> Photo Magic
        </button>
        <button 
          onClick={() => { setActiveTool('voice'); setResult(null); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${activeTool === 'voice' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <Music size={18} /> Voice Magic
        </button>
        <button 
          onClick={() => { setActiveTool('video'); setResult(null); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${activeTool === 'video' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <Video size={18} /> Video Magic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Area */}
        <div className="bento-card bg-white p-8 border border-slate-100 flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="text-amber-500" />
              {activeTool === 'photo' && 'Ganti Background Estetik'}
              {activeTool === 'voice' && 'Iklan Suara AI'}
              {activeTool === 'video' && 'Slideshow Produk Otomatis'}
            </h3>
            <p className="text-sm text-slate-500">
              {activeTool === 'photo' && 'Unggah foto produk, biarkan Selina mengganti latarnya secara ajaib.'}
              {activeTool === 'voice' && 'Ubah teks iklan Anda menjadi suara narator profesional.'}
              {activeTool === 'video' && 'Gabungkan foto produk Anda menjadi video promosi yang menarik.'}
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {activeTool === 'photo' && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="text-slate-400" size={32} />
                </div>
                <p className="font-bold text-slate-600">Klik untuk Unggah Foto</p>
                <p className="text-xs text-slate-400">PNG, JPG (Maks. 5MB)</p>
              </div>
            )}

            {activeTool === 'voice' && (
              <textarea 
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                placeholder="Contoh: Dapatkan diskon 50% untuk koleksi Selina Red XL terbaru kami! Hubungi kami segera..."
              />
            )}

            {activeTool === 'video' && (
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="music" defaultChecked />
                    <label htmlFor="music" className="text-sm font-medium">Tambah Musik Latar</label>
                 </div>
                 <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option>Energetic Pop</option>
                    <option>Corporate Clean</option>
                    <option>Relaxing Acoustic</option>
                 </select>
              </div>
            )}

            <button 
              disabled={isProcessing}
              onClick={handleMagic}
              className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" /> Sedang Mengolah Ajaib...
                </>
              ) : (
                <>
                  <Wand2 size={20} /> Generate Magic Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="bento-card bg-slate-900 min-h-[400px] flex items-center justify-center p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent"></div>
          
          {result ? (
            <div className="z-10 w-full animate-in zoom-in duration-500 flex flex-col items-center">
              <img src={result} alt="AI Result" className="rounded-2xl shadow-2xl max-h-[400px] object-cover border-4 border-white/10" />
              <div className="mt-6 flex gap-3">
                <button className="flex items-center gap-2 px-6 py-2 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors">
                  <Download size={18} /> Download
                </button>
                <button 
                  onClick={() => setResult(null)}
                  className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="z-10 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Sparkles className="text-white/20" size={40} />
              </div>
              <p className="text-white/40 font-medium">Pratinjau konten Anda akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicStudio;
