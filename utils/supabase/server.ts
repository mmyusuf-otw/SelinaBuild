
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function createClient() {
  // We avoid next/headers cookies() because it requires a request scope 
  // which may not be available during all phases of module execution in this environment.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const nameEQ = name + "=";
          const ca = document.cookie.split(';');
          for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
          }
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          let cookieString = `${name}=${value}; path=/; SameSite=Lax`;
          if (options.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
          }
          if (options.domain) {
            cookieString += `; Domain=${options.domain}`;
          }
          if (options.secure) {
            cookieString += `; Secure`;
          }
          document.cookie = cookieString;
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=/; Max-Age=-1; SameSite=Lax`;
        },
      },
    }
  );
}
