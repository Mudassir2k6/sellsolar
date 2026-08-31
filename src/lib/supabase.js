import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://iinmjmhqnleafhsbrboa.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!anonKey) {
  console.warn(
    '[SellSolar] Missing VITE_SUPABASE_ANON_KEY in .env. The page will render, but listings and login will not load until you add the public anon key.'
  );
}

export const supabase = createClient(url, anonKey || 'public-anon-key');
