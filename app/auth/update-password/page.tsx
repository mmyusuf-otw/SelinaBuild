
'use client';

import React from 'react';
import { updatePassword } from '../../../actions/auth';
import { useFormStatus } from 'react-dom';
import { Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-95"
    >
      {pending ? 'Memproses...' : 'Perbarui Password'}
    </button>
  );
}

export default function UpdatePasswordPage() {
  const [error, setError] = React.useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.redirect) {
      window.location.href = result.redirect;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 blur-3xl rounded-full -mr-48 -mt-48"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <ShieldCheck size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Buat Password Baru</h2>
          <p className="text-slate-500 mt-2 font-medium">Gunakan kombinasi yang kuat untuk keamanan akun Juragan.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in zoom-in-95">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100">
          <form action={handleAction} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
