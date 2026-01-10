
'use client';

import React from 'react';
import { login } from '../../../actions/auth';
import { useFormStatus } from 'react-dom';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-95"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Menghubungkan...
        </span>
      ) : (
        <>Masuk Sekarang <ArrowRight size={18} /></>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.redirect) {
      window.location.href = result.redirect;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 blur-3xl rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 blur-3xl rounded-full -ml-48 -mb-48"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Sparkles size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang, Juragan!</h2>
          <p className="text-slate-500 mt-2 font-medium">Lanjutkan scale-up bisnis Anda bersama Selina.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in zoom-in-95">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100">
          <form action={handleAction} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="juragan@bisnis.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="/auth/forgot-password" size={18} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Lupa Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium">
          Belum punya akun? <Link href="/app/auth/register" className="text-indigo-600 font-bold hover:underline">Daftar Sekarang</Link>
        </p>
      </div>
    </div>
  );
}
