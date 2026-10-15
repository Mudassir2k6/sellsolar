// Realistic Ad Views Engine for SellSolar Listings
// Ensures views organically increment by 20-35 views/day per ad,
// increments on user views, persists safely, and NEVER decreases.

import { supabase, isSupabaseConfigured } from './supabase';
import { isValidUuid } from './auth';

const STORAGE_CACHE_KEY = 'sellsolar_ad_views_cache';
const STORAGE_CLICKS_KEY = 'sellsolar_ad_views_clicks';

/**
 * Deterministic hash for string ID to produce consistent per-ad daily rates (22 to 33 views/day)
 */
function hashString(str) {
  let hash = 0;
  const s = String(str || 'default_ad_seed');
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get daily increment rate for an ad (in the range of 22 to 33 views per day)
 */
export function getAdDailyRate(adId) {
  const h = hashString(adId);
  return 22 + (h % 12); // Yields 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, or 33
}

/**
 * Safely read cached views map from localStorage
 */
function getViewsCache() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Safely save cached views map to localStorage
 */
function saveViewsCache(cache) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/**
 * Safely read user clicks map from localStorage
 */
function getClicksMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_CLICKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Safely save user clicks map to localStorage
 */
function saveClicksMap(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CLICKS_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Calculate realistic, strictly non-decreasing views for a listing
 * @param {object} listing - { id, views, created_at, ... }
 * @returns {number} strictly non-decreasing view count
 */
export function getRealisticAdViews(listing) {
  if (!listing || !listing.id) return 0;

  const id = String(listing.id);
  const cache = getViewsCache();
  const cachedMax = Number(cache[id]) || 0;
  const clicksMap = getClicksMap();
  const directClicks = Number(clicksMap[id]) || 0;

  // 1. Determine baseline
  const existingViews = Number(listing.views) || 0;
  // If listing has 0 views, give it an initial realistic base of 24-38
  const h = hashString(id);
  const initialBase = existingViews > 0 ? existingViews : (24 + (h % 15));

  // 2. Calculate organic views based on days elapsed (20-35 views/day)
  let createdAt = listing.created_at ? new Date(listing.created_at).getTime() : 0;
  if (!createdAt || isNaN(createdAt)) {
    // Fallback: estimate 2 to 4 days old based on ID hash
    const fakeAgeDays = 2 + (h % 3);
    createdAt = Date.now() - fakeAgeDays * 24 * 60 * 60 * 1000;
  }

  const elapsedMs = Math.max(0, Date.now() - createdAt);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const dailyRate = getAdDailyRate(id);

  // Smooth continuous daily growth (adds fractional views as day progresses)
  const organicGrowth = Math.floor(elapsedDays * dailyRate);

  // 3. Total candidate views
  const candidateViews = initialBase + organicGrowth + directClicks;

  // 4. ABSOLUTE GUARANTEE: Never decrease (take Math.max against cachedMax, candidateViews, existingViews)
  const finalViews = Math.max(cachedMax, candidateViews, existingViews);

  if (finalViews > cachedMax) {
    cache[id] = finalViews;
    saveViewsCache(cache);
  }

  return finalViews;
}

/**
 * Increment view count for an ad when viewed, and sync to DB/local storage
 * @param {object|string} listingOrId
 * @returns {number} updated view count
 */
export function recordAndIncrementAdView(listingOrId) {
  if (!listingOrId) return 0;
  const id = typeof listingOrId === 'object' ? String(listingOrId.id) : String(listingOrId);
  if (!id) return 0;

  // 1. Increment direct clicks count
  const clicksMap = getClicksMap();
  clicksMap[id] = (Number(clicksMap[id]) || 0) + 1;
  saveClicksMap(clicksMap);

  // 2. Re-calculate views
  const listingObj = typeof listingOrId === 'object' ? listingOrId : { id };
  const updatedViews = getRealisticAdViews(listingObj);

  // 3. Ensure cache stores the latest incremented number
  const cache = getViewsCache();
  const finalViews = Math.max(Number(cache[id]) || 0, updatedViews + 1);
  cache[id] = finalViews;
  saveViewsCache(cache);

  // 4. Update custom listings in localStorage if present
  try {
    const rawListings = localStorage.getItem('sellsolar_custom_listings');
    if (rawListings) {
      const parsed = JSON.parse(rawListings);
      if (Array.isArray(parsed)) {
        let changed = false;
        const nextList = parsed.map((item) => {
          if (String(item.id) === id) {
            changed = true;
            return { ...item, views: Math.max(Number(item.views) || 0, finalViews) };
          }
          return item;
        });
        if (changed) {
          localStorage.setItem('sellsolar_custom_listings', JSON.stringify(nextList));
        }
      }
    }
  } catch {}

  // 5. Update Supabase DB asynchronously if valid UUID
  if (isValidUuid(id) && isSupabaseConfigured()) {
    try {
      supabase
        .from('solar_listings')
        .update({ views: finalViews })
        .eq('id', id)
        .then(() => {})
        .catch(() => {});
    } catch {}
  }

  return finalViews;
}
