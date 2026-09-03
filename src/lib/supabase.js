import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zgfycrnmivfybbclflwf.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao';

export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key || typeof key !== 'string' || !url || typeof url !== 'string') return false;
  const trimmedKey = key.trim();
  const trimmedUrl = url.trim();
  if (
    !trimmedKey ||
    trimmedKey.includes('dummy') ||
    trimmedKey.startsWith('MY_') ||
    trimmedKey.startsWith('YOUR_') ||
    trimmedKey.length < 50 ||
    !trimmedUrl ||
    trimmedUrl.includes('placeholder')
  ) {
    return false;
  }
  return trimmedKey.split('.').length === 3;
}

function getValidSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return DEFAULT_SUPABASE_URL;
  }
  let trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.startsWith('MY_') ||
    trimmed.startsWith('YOUR_')
  ) {
    return DEFAULT_SUPABASE_URL;
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.includes('.')) {
      trimmed = `https://${trimmed}`;
    } else {
      return DEFAULT_SUPABASE_URL;
    }
  }
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
}

function getValidAnonKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') {
    return DEFAULT_ANON_KEY;
  }
  const trimmed = rawKey.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.startsWith('MY_') ||
    trimmed.startsWith('YOUR_') ||
    trimmed.includes('dummy') ||
    trimmed.includes('placeholder')
  ) {
    return DEFAULT_ANON_KEY;
  }
  if (trimmed.startsWith('sb_publishable_')) return trimmed;
  const parts = trimmed.split('.');
  if (parts.length !== 3 || parts.some((part) => part.length < 8)) {
    return DEFAULT_ANON_KEY;
  }
  return trimmed;
}

const supabaseUrl = getValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (err) {
  console.warn('[SellSolar] Supabase client init fallback:', err);
  client = createClient(DEFAULT_SUPABASE_URL, DEFAULT_ANON_KEY);
}

export const supabase = client;
