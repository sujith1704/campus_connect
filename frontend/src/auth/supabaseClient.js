import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
  console.warn(
    '[Supabase] Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured in frontend/.env. ' +
    'Please add your Supabase credentials to connect live authentication.'
  );
}

// Fallback dummy URL so createClient does not crash the app bundle if keys are unset
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http'))
  ? supabaseUrl
  : 'https://placeholder.supabase.co';

const validKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
