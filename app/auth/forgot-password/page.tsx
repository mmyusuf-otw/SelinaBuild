
'use client';

import React from 'react';
import { forgotPassword } from '../../../actions/auth';
import { useFormStatus } from 'react-dom';
import { Mail, ArrowRight, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-95"
    >
      {pending ? 'Sedang Mengirim...' : 'Kirim Link Reset'}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const result = await forgotPassword(formData);
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
          <h2 className="text-2xl font-black text-slate-900">Email Terkirim!</h2>
          <p className="text-slate-500 font-medium">{success}</p>
          <Link href="/login" className="block w-full py-4 bg-slate-950 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <ChevronLeft size={18} /> Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/20 blur-3xl rounded-full -mr-48 -mt-48"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mb-6">
            <ChevronLeft size={14} /> Kembali ke Login
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 mt-2 font-medium">Masukkan email terdaftar untuk menerima link pemulihan.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in zoom-in-95">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100">
          <form action={handleAction} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="juragan@bisnis.com"
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
