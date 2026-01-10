
'use client';

import React from 'react';
import { signup } from '../../../actions/auth';
import { useFormStatus } from 'react-dom';
import { Mail, Lock, Store, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-95"
    >
      {pending ? 'Membangun Toko...' : 'Daftar Gratis'}
    </button>
  );
}

export default function RegisterPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const result = await signup(formData);
    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(result.success);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Email Verifikasi Terkirim!</h2>
          <p className="text-slate-500 font-medium">{success}</p>
          <Link href="/login" className="block w-full py-4 bg-slate-950 text-white rounded-2xl font-bold">Kembali ke Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 blur-3xl rounded-full -mr-48 -mt-48"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mulai SaaS Unicorn-mu!</h2>
          <p className="text-slate-500 mt-2 font-medium">Buka akses ke Analytics, Magic Studio, dan CRM Selina.</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100">
          <form action={handleAction} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Toko/Brand</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  name="storeName"
                  required
                  placeholder="Contoh: Butik Selina"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 Karakter"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium">
          Sudah punya akun? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Login Disini</Link>
        </p>
      </div>
    </div>
  );
}
