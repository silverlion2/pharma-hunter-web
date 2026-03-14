import { createClient } from '@supabase/supabase-js';

export const getEnv = (key) => {
  try {
    return import.meta.env[key] || '';
  } catch (e) {
    return '';
  }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const isSupabaseConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http');

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
