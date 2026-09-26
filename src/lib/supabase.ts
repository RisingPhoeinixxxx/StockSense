import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

let validUrl = false;
try {
  const parsed = new URL(rawUrl || '');
  validUrl = parsed.protocol === 'https:' && Boolean(parsed.hostname);
} catch {
  validUrl = false;
}

export const isSupabaseConfigured = validUrl && Boolean(anonKey);
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const supabaseConfigError = !rawUrl
  ? 'VITE_SUPABASE_URL is missing.'
  : !validUrl
    ? 'VITE_SUPABASE_URL is not a valid HTTPS URL.'
    : !anonKey
      ? 'VITE_SUPABASE_ANON_KEY is missing.'
      : '';
