
'use server';

import { createClient } from '../utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Email atau Password salah, Juragan.' };
  }

  return { success: true, redirect: '/dashboard' };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const storeName = formData.get('storeName') as string;

  // 1. Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        store_name: storeName,
        role: 'USER',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Create Profile di public.profiles
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          store_name: storeName,
          email: email,
          role: 'USER',
          plan: 'FREE',
        },
      ]);
    
    if (profileError) console.error('Gagal buat profil:', profileError);
  }

  return { success: 'Cek email Anda untuk konfirmasi akun!' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true, redirect: '/login' };
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/update-password`,
  });

  if (error) return { error: error.message };
  return { success: 'Link reset password sudah dikirim ke email.' };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) return { error: error.message };
  return { success: true, redirect: '/login?message=Password berhasil diperbarui' };
}
