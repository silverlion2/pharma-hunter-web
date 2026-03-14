import { createClient } from '@supabase/supabase-js';

export const getEnv = (key) => {
  try {
    const val = import.meta.env[key];
    return val ? val.trim() : '';
  } catch {
    return '';
  }
};

let SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
if (SUPABASE_URL && !SUPABASE_URL.startsWith('http')) {
  SUPABASE_URL = 'https://' + SUPABASE_URL;
}

const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
      }
    };
