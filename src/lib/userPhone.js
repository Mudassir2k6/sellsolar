import { supabase, isSupabaseConfigured } from './supabase';
import { isValidPhone, isValidUuid, normalizePhone } from './auth';

const LOCAL_USER_PHONES_KEY = 'sellsolar_user_phones';
const LOCAL_USERS_KEY = 'sellsolar_custom_auth_users';
const LOCAL_LISTINGS_KEY = 'sellsolar_custom_listings';

/**
 * Persist a verified 11-digit PK phone against the logged-in user and
 * attach it to every ad they own (local cache + Supabase solar_listings).
 */
export async function persistUserPhoneAndAttachToAds({
  phone,
  user,
  profile,
  setProfile,
} = {}) {
  const clean = normalizePhone(phone);
  if (!isValidPhone(clean)) {
    throw new Error('Phone number must be exactly 11 digits (e.g. 03001234567).');
  }

  const userId = user?.id || profile?.id || null;
  const email = (user?.email || profile?.email || '').toLowerCase().trim();
  const sellerName = profile?.full_name || user?.user_metadata?.full_name || null;

  if (typeof window !== 'undefined') {
    // 1) Local phone map (used by listing cards / detail when seller_phone missing)
    try {
      const raw = localStorage.getItem(LOCAL_USER_PHONES_KEY);
      const pMap = raw ? JSON.parse(raw) : {};
      if (email) pMap[email] = clean;
      if (userId) pMap[userId] = clean;
      if (sellerName) pMap[sellerName] = clean;
      localStorage.setItem(LOCAL_USER_PHONES_KEY, JSON.stringify(pMap));
    } catch (e) {
      console.warn('Phone map save notice:', e?.message || e);
    }

    // 2) Local stored users
    try {
      const rawUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
      const keys = [email, userId].filter(Boolean).map((k) => String(k).toLowerCase());
      for (const [k, v] of Object.entries(rawUsers || {})) {
        const uEmail = (v?.user?.email || v?.profile?.email || '').toLowerCase();
        const uId = String(v?.user?.id || v?.profile?.id || '').toLowerCase();
        if (keys.includes(k.toLowerCase()) || (uEmail && keys.includes(uEmail)) || (uId && keys.includes(uId))) {
          if (v.profile) v.profile.phone = clean;
          if (v.user?.user_metadata) v.user.user_metadata.phone = clean;
        }
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(rawUsers));
    } catch (e) {
      console.warn('Local user phone save notice:', e?.message || e);
    }

    // 3) Attach phone onto local custom listings owned by this user
    try {
      const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let changed = false;
          const next = list.map((item) => {
            const sameUser =
              (userId && item.user_id === userId) ||
              (email && (item.seller_email || '').toLowerCase() === email);
            if (!sameUser) return item;
            if (item.seller_phone === clean) return item;
            changed = true;
            return { ...item, seller_phone: clean, phone: clean };
          });
          if (changed) localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(next));
        }
      }
    } catch (e) {
      console.warn('Local listings phone attach notice:', e?.message || e);
    }
  }

  // 4) Supabase profiles + listings
  if (isSupabaseConfigured() && supabase) {
    const profilePayload = { phone: clean, mobile: clean, contact_phone: clean };
    try {
      if (userId && isValidUuid(userId)) {
        await supabase.from('profiles').update(profilePayload).eq('id', userId);
      } else if (email) {
        await supabase.from('profiles').update(profilePayload).ilike('email', email);
      }
    } catch (e) {
      console.warn('Supabase profile phone update notice:', e?.message || e);
    }

    try {
      let q = supabase.from('solar_listings').update({ seller_phone: clean });
      if (userId && isValidUuid(userId)) {
        q = q.eq('user_id', userId);
      } else if (email) {
        q = q.ilike('seller_email', email);
      } else {
        q = null;
      }
      if (q) await q;
    } catch (e) {
      console.warn('Supabase listings phone attach notice:', e?.message || e);
    }
  }

  // 5) In-memory profile (React state)
  if (typeof setProfile === 'function') {
    setProfile((prev) => (prev ? { ...prev, phone: clean } : prev));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_users_updated'));
    window.dispatchEvent(new Event('sellsolar_auth_updated'));
  }

  return clean;
}

export function isGoogleAuthUser(user) {
  if (!user) return false;
  if (user.app_metadata?.provider === 'google') return true;
  if (Array.isArray(user.identities) && user.identities.some((i) => i?.provider === 'google')) return true;
  const email = (user.email || '').toLowerCase();
  return Boolean(email && email.includes('@gmail.') && !email.endsWith('@sellsolar.local'));
}
