/* eslint-disable no-undef */
/* eslint-env node */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL.trim();
const key = process.env.VITE_SUPABASE_ANON_KEY.trim();

console.log('Testing URL:', url);

const supabase = createClient(url, key);

async function test() {
  // eslint-disable-next-line no-unused-vars
  const { data, error, status } = await supabase
    .from('contact_leads')
    .insert([{ name: 'Test User', email: 'test@example.com', message: 'test logic' }]);
  
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS, status:', status);
  }
}

test();
