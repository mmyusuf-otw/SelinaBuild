
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
  Info,
  Lock,
  ShieldAlert,
  ArrowRight,
  // Fix: Added missing RefreshCw icon
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onSwitchToAdmin?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdateProfile, onSwitchToAdmin }) => {
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

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block";
  const inputClasses = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-medium";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Admin Backoffice Quick Access - Only for ADMIN */}
      {profile.role === 'ADMIN' && (
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex items-center gap-5">
             <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10">
                <ShieldAlert size={32} className="text-amber-400 animate-pulse" />
             </div>
             <div>
                <h4 className="text-xl font-black italic tracking-tighter uppercase">Admin Backoffice Access</h4>
                <p className="text-xs text-slate-400 font-medium">Anda memiliki akses root ke infrastruktur Selina.</p>
             </div>
          </div>
          <button 
            onClick={onSwitchToAdmin}
            className="relative z-10 px-8 py-4 bg-indigo-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            Buka Dashboard Admin <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-40 h-40 bg-white rounded-[40px] p-1 flex items-center justify-center shadow-2xl shadow-indigo-100 border-2 border-slate-50 overflow-hidden relative">
            {formData.image || profile.image ? (
              <img src={formData.image || profile.image} alt="Profile Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="text-indigo-600 font-black text-6xl uppercase">{profile.storeName.charAt(0)}</div>
            )}
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={32} className="text-white" />
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors">
            <Camera size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{profile.storeName}</h3>
             <span className="w-fit px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest mx-auto md:mx-0">
               {profile.plan} MEMBER
             </span>
          </div>
          <p className="text-base text-slate-500 font-medium">Dikelola oleh <span className="text-slate-900 font-bold">{profile.ownerName}</span> • Aktif sejak {new Date(profile.createdAt).toLocaleDateString('id-ID')}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-emerald-100">
               <CheckCircle2 size={14} /> Terverifikasi
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-indigo-100">
               <ShieldCheck size={14} /> Keamanan Aktif
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Store Info Form */}
        <div className="bento-card bg-white p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><Store size={24} /></div>
              <div>
                <h4 className="font-black text-slate-900">Identitas Bisnis</h4>
                <p className="text-xs text-slate-400 font-medium">Informasi publik toko Anda</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
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
            <div className="grid grid-cols-2 gap-6">
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
              className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving Changes...' : 'Update Profil Bisnis'}
            </button>
          </form>
        </div>

        {/* API & Security Section */}
        <div className="space-y-10">
          <div className="bento-card bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-8">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-xl"><ShieldCheck size={24} /></div>
              <div>
                <h4 className="font-black italic tracking-tighter uppercase">Security & API Key</h4>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest">INFRASTRUCTURE INTEGRATION</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/20 rounded-xl"><Key size={20} className="text-indigo-400" /></div>
                    <span className="text-xs font-black text-slate-200 uppercase tracking-widest">Cloud API Status</span>
                  </div>
                  {isApiKeyActive ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border border-rose-500/20">
                      <AlertTriangle size={12} /> Pending
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Selina memerlukan API Key berbayar dari Google Cloud untuk memproses model AI Vision & Video Generative di Magic Studio Anda.
                </p>
                <button 
                  onClick={handleConnectApiKey}
                  className="w-full py-4 bg-white text-slate-900 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  <Zap size={16} className="fill-indigo-600 text-indigo-600" /> 
                  {isApiKeyActive ? 'Update API Cloud' : 'Connect API Key'}
                </button>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Info size={14} className="text-indigo-500" /> Security Guidelines
                </h5>
                <ul className="space-y-3">
                   <li className="flex items-start gap-3 text-[11px] text-slate-400">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                      <span className="leading-relaxed">Gunakan API Key dari project Google Cloud dengan billing aktif agar fitur video tidak terputus.</span>
                   </li>
                   <li className="flex items-start gap-3 text-[11px] text-slate-400">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                      <span className="leading-relaxed">Data API Key Anda terenkripsi end-to-end dan tidak pernah kami simpan dalam format teks mentah.</span>
                   </li>
                </ul>
                <div className="pt-2">
                   <a 
                     href="https://ai.google.dev/gemini-api/docs/billing" 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                   >
                     Manage Billing Dashboard <ExternalLink size={12} />
                   </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card bg-white p-8 border border-slate-100 flex items-center gap-5 shadow-sm">
             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center border border-indigo-100">
                <User size={28} />
             </div>
             <div className="flex-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Login Credentials</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Saat ini login sebagai <span className="text-indigo-600 font-bold">{profile.email}</span></p>
             </div>
             <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Lock size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
