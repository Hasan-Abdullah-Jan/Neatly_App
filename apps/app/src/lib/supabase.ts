/**
 * Supabase client for the browser.
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from env.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
}

/**
 * Session helper: returns current session or null.
 */
export async function getSession(supabase: ReturnType<typeof createClient>) {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign in with email magic link.
 */
export async function signInWithMagicLink(
  supabase: ReturnType<typeof createClient>,
  email: string
) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

/**
 * Sign in with phone OTP.
 */
export async function signInWithPhone(
  supabase: ReturnType<typeof createClient>,
  phone: string
) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  });
  return { data, error };
}

/**
 * Verify OTP code (email or phone).
 */
export async function verifyOtp(
  supabase: ReturnType<typeof createClient>,
  { token, type }: { token: string; type: 'email' | 'phone' }
) {
  const { data, error } = await (supabase.auth as any).verifyOtp({
    token,
    type: type === 'email' ? 'email' : 'sms',
  });
  return { data, error };
}

/**
 * Sign in with OAuth provider (Google, Apple).
 */
export async function signInWithOAuth(
  supabase: ReturnType<typeof createClient>,
  provider: 'google' | 'apple'
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

/**
 * Sign out.
 */
export async function signOut(supabase: ReturnType<typeof createClient>) {
  return supabase.auth.signOut();
}
