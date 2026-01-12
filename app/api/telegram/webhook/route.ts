
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '../../../../utils/telegram';

// Gunakan Service Role untuk bypass RLS karena ini dipicu oleh Webhook (Internal System)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 1. Security Check: Verifikasi Secret Token dari Telegram
  const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // --- COMMAND: /start [pairing_code] ---
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await sendTelegramMessage(chatId, "❌ Silakan ketik `/start [kode_pairing]` yang Anda dapatkan dari Dashboard Selina.");
        return NextResponse.json({ ok: true });
      }

      const code = parts[1];
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          telegram_chat_id: chatId,
          telegram_pairing_code: null // Hapus kode setelah berhasil terhubung
        })
        .eq('telegram_pairing_code', code)
        .select('store_name')
        .single();

      if (error || !profile) {
        await sendTelegramMessage(chatId, "❌ Kode salah atau sudah kadaluarsa. Silakan generate kode baru di Web Selina.");
      } else {
        await sendTelegramMessage(chatId, `🎉 *Halo ${profile.store_name}!* Akun Selina Anda berhasil terhubung.\n\nSekarang Anda bisa mencatat pengeluaran dengan cepat.\n\n*Contoh:* \`/out 50000 beli bensin\``);
      }
    }

    // --- COMMAND: /out [jumlah] [keterangan] ---
    else if (text.startsWith('/out')) {
      // Lookup profile berdasarkan Chat ID
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, store_name')
        .eq('telegram_chat_id', chatId)
        .single();

      if (!profile) {
        await sendTelegramMessage(chatId, "⚠️ Akun belum terhubung. Ketik `/start [kode]` untuk memulai.");
        return NextResponse.json({ ok: true });
      }

      const parts = text.split(' ');
      if (parts.length < 3) {
        await sendTelegramMessage(chatId, "Format salah. Gunakan: `/out [jumlah] [keterangan]`\nContoh: `/out 25000 Makan Siang`.");
        return NextResponse.json({ ok: true });
      }

      // Parsing nominal (hapus karakter non-angka)
      const amountStr = parts[1].replace(/\D/g, '');
      const amount = parseInt(amountStr);
      const description = parts.slice(2).join(' ');

      if (isNaN(amount) || amount <= 0) {
        await sendTelegramMessage(chatId, "❌ Jumlah uang tidak valid. Masukkan angka saja.");
        return NextResponse.json({ ok: true });
      }

      // Simpan ke Jurnal Operasional
      const { error: insertError } = await supabaseAdmin
        .from('operational_expenses')
        .insert({
          user_id: profile.id,
          amount: amount,
          description: description,
          category: 'Operasional',
          date: new Date().toISOString().split('T')[0]
        });

      if (insertError) {
        await sendTelegramMessage(chatId, "❌ Gagal menyimpan data. Coba sesaat lagi.");
      } else {
        await sendTelegramMessage(chatId, `✅ *Berhasil Dicatat!*\n💰 Rp ${amount.toLocaleString('id-ID')}\n📝 "${description}"\n\nKetik \`/today\` untuk melihat total hari ini.`);
      }
    }

    // --- COMMAND: /today ---
    else if (text === '/today') {
       const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .single();

      if (!profile) return NextResponse.json({ ok: true });

      const today = new Date().toISOString().split('T')[0];
      const { data: expenses } = await supabaseAdmin
        .from('operational_expenses')
        .select('amount')
        .eq('user_id', profile.id)
        .eq('date', today);

      const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      await sendTelegramMessage(chatId, `📊 *Jurnal Hari Ini (${today})*\n\nTotal Pengeluaran: *Rp ${total.toLocaleString('id-ID')}*`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook Runtime Error:', err);
    return NextResponse.json({ ok: true }); // Tetap return OK agar Telegram tidak retrying terus menerus
  }
}
