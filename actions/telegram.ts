
'use server';

import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Membuat kode pairing unik untuk menghubungkan akun Web ke Bot Telegram
 */
export async function generatePairingCode() {
  const supabase = await createClient();
  
  // Ambil user ID yang sedang login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Generate 6 digit random number
  const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

  const { error } = await supabase
    .from('profiles')
    .update({ telegram_pairing_code: pairingCode })
    .eq('id', user.id);

  if (error) {
    console.error('Error generating pairing code:', error);
    throw new Error("Gagal membuat kode pairing.");
  }

  revalidatePath('/profile');
  return pairingCode;
}
