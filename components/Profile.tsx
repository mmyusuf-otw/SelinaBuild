
import React from 'react';
import { 
  User, 
  Store, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Camera,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = React.useState<UserProfile>(profile);
  const [isApiKeyActive, setIsApiKeyActive] = React.useState<boolean | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    try {
      // @ts-ignore
      const active = await window.aistudio.hasSelectedApiKey();
      setIsApiKeyActive(active);
    } catch (e) {
      setIsApiKeyActive(false);
    }
  };

  const handleConnectApiKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsApiKeyActive(true);
    } catch (e) {
      console.error("Gagal membuka dialog API Key", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
    }, 800);
  };

  const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block";
  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 bg-white rounded-[32px] p-1 flex items-center justify-center shadow-xl shadow-indigo-100 border border-slate-50 overflow-hidden relative">
            <img src={formData.image || 'logo.png'} alt="Profile Photo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors">
            <Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-2xl font-black text-slate-900">{profile.storeName}</h3>
          <p className="text-sm text-slate-500 font-medium">{profile.ownerName} • Platinum Merchant</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Lvl 4: Unicorn</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified Identity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Store Info Form */}
        <div className="bento-card bg-white p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Store size={20} /></div>
            <h4 className="font-bold text-slate-900">Informasi Toko</h4>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClasses}>Nama Brand/Toko</label>
              <input 
                value={formData.storeName}
                onChange={e => setFormData({...formData, storeName: e.target.value})}
                className={inputClasses}
                placeholder="Contoh: Selina Fashion Store"
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Nama Pemilik</label>
              <input 
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                className={inputClasses}
                placeholder="Nama sesuai KTP"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClasses}>Kategori Bisnis</label>
                <select 
                   value={formData.category}
                   onChange={e => setFormData({...formData, category: e.target.value})}
                   className={inputClasses}
                >
                  <option>Fashion</option>
                  <option>F&B</option>
                  <option>Electronics</option>
                  <option>Beauty</option>
                  <option>Home Living</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClasses}>WhatsApp CRM</label>
                <input 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  className={inputClasses}
                  placeholder="08123xxx"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Email Notifikasi</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={inputClasses}
                placeholder="toko@gmail.com"
              />
            </div>
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Zap className="animate-spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Menyimpan...' : 'Perbarui Profil Toko'}
            </button>
          </form>
        </div>

        {/* API & Security Section */}
        <div className="space-y-8">
          <div className="bento-card bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
              <div className="p-2 bg-indigo-500 rounded-xl"><ShieldCheck size={20} /></div>
              <h4 className="font-bold">Keamanan & API Key</h4>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300">Status Google Cloud API</span>
                  </div>
                  {isApiKeyActive ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[8px] font-black uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-md text-[8px] font-black uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> Belum Terhubung
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  API Key digunakan secara aman untuk menjalankan model kecerdasan buatan Gemini Pro & Veo untuk konten Magic Studio Juragan.
                </p>
                <button 
                  onClick={handleConnectApiKey}
                  className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} className="fill-indigo-600 text-indigo-600" /> 
                  {isApiKeyActive ? 'Ganti API Key' : 'Hubungkan API Key'}
                </button>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                   <Info size={12} /> Penting untuk Juragan
                </h5>
                <ul className="space-y-2">
                   <li className="flex items-start gap-2 text-[10px] text-slate-400">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1 shrink-0"></div>
                      <span>Gunakan API Key dari project Google Cloud dengan billing aktif.</span>
                   </li>
                   <li className="flex items-start gap-2 text-[10px] text-slate-400">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1 shrink-0"></div>
                      <span>Selina tidak pernah menyimpan API Key Anda di database server kami.</span>
                   </li>
                </ul>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:underline"
                >
                  Pelajari Billing API <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          <div className="bento-card bg-white p-6 border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <User size={24} />
             </div>
             <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">Login Session Aktif</p>
                <p className="text-[10px] text-slate-400">Juragan saat ini login menggunakan akun <span className="text-slate-600 font-bold">{profile.email}</span></p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
