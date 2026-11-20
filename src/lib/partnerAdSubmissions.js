/**
 * Partner “Advertise here” submissions.
 *
 * Supabase is the source of truth (table `partner_ad_submissions`, see
 * supabase/migrations/20261119_partner_ad_submissions.sql):
 *  - visitors insert rows as `pending`
 *  - only `approved` rows are publicly readable (cached locally for instant first paint)
 *  - admins list / approve / hide / delete through their signed-in Supabase session
 * When Supabase is not configured (local dev) everything falls back to localStorage.
 */
import { supabase, isSupabaseConfigured } from './supabase';

export const PARTNER_AD_SUBMISSIONS_KEY = 'sellsolar_partner_ad_submissions';
const APPROVED_CACHE_KEY = 'sellsolar_partner_ads_approved_cache';
export const PARTNER_AD_EVENT = 'sellsolar_partner_ads_updated';
const TABLE = 'partner_ad_submissions';

export const PLACEHOLDER_SLOT_COUNT = 8;

export function createAdvertiseHerePlaceholders(count = PLACEHOLDER_SLOT_COUNT) {
  return Array.from({ length: count }, (_, i) => ({
    id: `advertise-here-${i + 1}`,
    adType: 'advertise_here',
    title: 'Advertise here',
    subtitle: 'Click to submit your brand banner',
    imageUrl: '',
    linkUrl: '',
    packageId: 'free',
    isActive: true,
    advertiser: 'SellSolar',
  }));
}

function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PARTNER_AD_EVENT));
  }
}

function readJson(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeJson(key, list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
  } catch (e) {
    console.warn('Partner ad cache notice:', e?.message || e);
  }
}

/** Only allow http(s) links or site-relative paths (blocks javascript: etc.). */
export function sanitizeAdLink(url) {
  const v = String(url || '').trim();
  return /^(https?:\/\/|\/)/i.test(v) ? v : '';
}

function rowToItem(row) {
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    advertiser: row.advertiser || '',
    linkUrl: row.link_url || '',
    imageUrl: row.image_url || '',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
    contactEmail: row.contact_email || '',
    status: row.status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ───────────── local (fallback) store ───────────── */

export function getPartnerAdSubmissions() {
  return readJson(PARTNER_AD_SUBMISSIONS_KEY);
}

export function savePartnerAdSubmissions(list) {
  writeJson(PARTNER_AD_SUBMISSIONS_KEY, list);
  notify();
}

/* ───────────── public API ───────────── */

/** Visitor submits a banner. Resolves with the item; rejects with a readable Error. */
export async function addPartnerAdSubmission(payload) {
  const now = new Date().toISOString();
  const item = {
    id: `pad-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    title: String(payload.title || '').trim().slice(0, 80),
    subtitle: String(payload.subtitle || '').trim().slice(0, 100),
    advertiser: String(payload.advertiser || '').trim().slice(0, 60),
    linkUrl: sanitizeAdLink(payload.linkUrl),
    imageUrl: payload.imageUrl || '',
    contactName: String(payload.contactName || '').trim().slice(0, 120),
    contactPhone: String(payload.contactPhone || '').trim().slice(0, 30),
    contactEmail: String(payload.contactEmail || '').trim().slice(0, 160),
    /** pending = waiting admin, approved = live, hidden = admin removed from display */
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from(TABLE).insert({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      advertiser: item.advertiser,
      link_url: item.linkUrl,
      image_url: item.imageUrl,
      contact_name: item.contactName,
      contact_phone: item.contactPhone,
      contact_email: item.contactEmail,
      status: 'pending',
    });
    if (error) {
      console.warn('Partner ad submit failed:', error.message);
      throw new Error('Could not submit your ad right now. Please try again in a moment.');
    }
    return item;
  }

  savePartnerAdSubmissions([item, ...getPartnerAdSubmissions()]);
  return item;
}

/** Refreshes the public (approved-only) cache from Supabase, then notifies listeners. */
export async function syncApprovedPartnerAds() {
  if (!isSupabaseConfigured()) return;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id,title,subtitle,advertiser,link_url,image_url,status,created_at,updated_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error || !Array.isArray(data)) return;
    writeJson(APPROVED_CACHE_KEY, data.map(rowToItem));
    notify();
  } catch (e) {
    console.warn('Partner ads sync notice:', e?.message || e);
  }
}

/** Approved ads ready for the homepage marquee / hero card (sync, reads cache). */
export function getApprovedPartnerAdsForMarquee() {
  const source = isSupabaseConfigured() ? readJson(APPROVED_CACHE_KEY) : getPartnerAdSubmissions();
  return source
    .filter((a) => a.status === 'approved' && a.title)
    .map((a) => ({
      id: a.id,
      adType: 'partner_submission',
      title: a.title,
      subtitle: a.subtitle || a.advertiser || 'Partner',
      imageUrl: a.imageUrl || '',
      linkUrl: sanitizeAdLink(a.linkUrl),
      packageId: 'free',
      isActive: true,
      advertiser: a.advertiser || 'Partner',
    }));
}

/* ───────────── admin API ───────────── */

/** Admin: every submission (pending / approved / hidden). Requires the admin's Supabase session. */
export async function fetchAdminPartnerAds() {
  if (!isSupabaseConfigured()) return { items: getPartnerAdSubmissions(), error: '' };
  const { data, error } = await supabase.rpc('admin_list_partner_ads');
  if (error) {
    return {
      items: [],
      error: /not authorized|42501|JWT|permission/i.test(`${error.code} ${error.message}`)
        ? 'Sign in with your Supabase admin account to manage ad submissions.'
        : `Could not load submissions: ${error.message}`,
    };
  }
  return { items: (data || []).map(rowToItem), error: '' };
}

/** Admin: approve / hide / re-show. Returns an error string ('' on success). */
export async function setPartnerAdStatus(id, status) {
  if (!isSupabaseConfigured()) {
    savePartnerAdSubmissions(
      getPartnerAdSubmissions().map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)),
    );
    return '';
  }
  const { error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return `Could not update: ${error.message}`;
  await syncApprovedPartnerAds();
  return '';
}

/** Admin: delete permanently. Returns an error string ('' on success). */
export async function deletePartnerAdSubmission(id) {
  if (!isSupabaseConfigured()) {
    savePartnerAdSubmissions(getPartnerAdSubmissions().filter((r) => r.id !== id));
    return '';
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return `Could not delete: ${error.message}`;
  await syncApprovedPartnerAds();
  return '';
}
