
import React from 'react';
import { PRICING_TIERS, TOPUP_PACKS } from '../constants';
import { Check, Zap, Crown, Coins, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PricingPageProps {
  currentPlan: string;
  onPaymentSuccess: (planId: string, creditsToAdd: number) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentPlan, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  const handleCheckout = async (planId: string, price: number, credits: number) => {
    if (price === 0) return;
    
    setIsProcessing(planId);
    
    // Simulating Server Action to get Midtrans Token
    // const response = await fetch('/api/create-transaction', { method: 'POST', body: JSON.stringify({ planId, price }) });
    // const { token } = await response.json();
    
    // Simulasi delay server
    setTimeout(() => {
      // @ts-ignore
      window.snap.pay('DEMO_TOKEN_SNAP', {
        onSuccess: function(result: any) {
          console.log('Payment success:', result);
          onPaymentSuccess(planId, credits);
          setIsProcessing(null);
          alert('Pembayaran Berhasil! Paket Anda telah diperbarui.');
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result);
          setIsProcessing(null);
        },
        onError: function(result: any) {
          console.log('Payment error:', result);
          setIsProcessing(null);
          alert('Pembayaran Gagal. Silakan coba lagi.');
        },
        onClose: function() {
          console.log('Customer closed the popup without finishing the payment');
          setIsProcessing(null);
        }
      });
    }, 1000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
           <Sparkles size={14} /> Pilih Kekuatan Bisnismu
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Investasi Terbaik Untuk <br/> <span className="text-indigo-600 italic">Scale-up Toko Online</span></h2>
        <p className="text-slate-500 max-w-xl mx-auto">Satu harga transparan untuk fitur AI tercanggih. <br/> Tanpa biaya tersembunyi, fokuslah pada profit.</p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRICING_TIERS.map((tier) => (
          <div 
            key={tier.id} 
            className={`bento-card relative flex flex-col p-8 transition-all duration-300 ${
              tier.isPopular ? 'bg-indigo-600 text-white scale-105 shadow-2xl glow-indigo border-indigo-400 z-10' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl'
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                <Crown size={12} fill="currentColor" /> Paling Banyak Dipilih
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-black ${tier.isPopular ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h3>
                {tier.icon}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">Rp {tier.price.toLocaleString()}</span>
                <span className={`text-xs ${tier.isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>/bulan</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 ${tier.isPopular ? 'bg-white/10' : 'bg-slate-50'}`}>
               <div className={`p-2 rounded-lg ${tier.isPopular ? 'bg-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                 <Zap size={18} fill="currentColor" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Magic Credits</p>
                  <p className="text-sm font-bold">{tier.credits} Koin / bulan</p>
               </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className={`p-0.5 rounded-full mt-0.5 ${tier.isPopular ? 'bg-indigo-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Check size={14} />
                  </div>
                  <span className={tier.isPopular ? 'text-indigo-50' : 'text-slate-600'}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              disabled={currentPlan === tier.id || isProcessing !== null}
              onClick={() => handleCheckout(tier.id, tier.price, tier.credits)}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                tier.isPopular 
                  ? 'bg-white text-indigo-600 hover:bg-slate-50' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing === tier.id ? 'Memproses...' : currentPlan === tier.id ? 'Paket Aktif' : 'Mulai Upgrade'}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Topup Section */}
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Coins className="text-amber-500" /> Butuh Koin Tambahan?
               </h3>
               <p className="text-sm text-slate-500">Top-up koin tanpa ganti paket langganan. Koin berlaku selamanya.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <ShieldCheck size={16} className="text-emerald-500" /> Pembayaran Aman & Instant
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOPUP_PACKS.map((pack) => (
              <button 
                key={pack.id}
                disabled={isProcessing !== null}
                onClick={() => handleCheckout(pack.id, pack.price, pack.amount)}
                className="group p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      {pack.icon}
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900">{pack.amount} Magic Koin</h4>
                      <p className="text-sm font-bold text-indigo-600">Rp {pack.price.toLocaleString()}</p>
                   </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Zap size={18} fill="currentColor" />
                </div>
              </button>
            ))}
         </div>
      </div>

      {/* Security Footer */}
      <div className="flex flex-col items-center gap-4 py-10 bg-slate-100/50 rounded-[40px] border border-slate-200 text-center">
         <div className="flex items-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Midtrans_logo.svg/2560px-Midtrans_logo.svg.png" className="h-6 opacity-40" alt="Midtrans" />
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={14} className="text-emerald-500" /> Secured by Midtrans
            </p>
         </div>
         <p className="text-xs text-slate-400 max-w-md px-6">
            Pembayaran diproses secara aman menggunakan enkripsi standar bank. Kami tidak menyimpan data kartu atau akses finansial Juragan.
         </p>
      </div>
    </div>
  );
};

export default PricingPage;
