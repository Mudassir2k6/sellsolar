// Realistic Ad Views Engine for SellSolar Listings
// Specifications:
// 1. Updates 4 times per 24 hours (every 6 hours: 00:00, 06:00, 12:00, 18:00)
// 2. Each update cycle adds a deterministic random increment between 10 and 25 views (average ~17.5 views/quarter, ~70 views/day)
// 3. Real-time ad clicks and views are immediately added on top
// 4. Strict guarantee: Views NEVER decrease under any condition (persisted in cache & DB)

import { supabase, isSupabaseConfigured } from './supabase';
import { isValidUuid } from './auth';

const STORAGE_CACHE_KEY = 'sellsolar_ad_views_cache';
const STORAGE_CLICKS_KEY = 'sellsolar_ad_views_clicks';
const STORAGE_FIRST_SEEN_KEY = 'sellsolar_ad_views_first_seen';

/**
 * 32-bit Murmur/FNV-style hash to produce high-entropy, well-distributed deterministic random numbers
 */
function hash32(str) {
  let h = 0x811c9dc5;
  const s = String(str || 'sellsolar_default_seed');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Deterministic random increment between 10 and 25 views for an ad for a specific 6-hour quarter
 * (4 quarters in a 24-hour day)
 * @param {string} adId
 * @param {number} quarterIndex
 * @returns {number} integer in [10, 25]
 */
export function getQuarterRandomIncrement(adId, quarterIndex) {
  const h = hash32(`${adId}_quarter_${quarterIndex}`);
  return 10 + (h % 16); // strictly 10 to 25 inclusive
}

/**
 * Convert an epoch millisecond timestamp to an epoch 6-hour quarter index
 * 6 hours = 21,600,000 ms. 4 quarters = 1 day (24 hours)
 */
export function getEpochQuarter(timestamp) {
  const msInQuarter = 6 * 60 * 60 * 1000;
  return Math.floor(timestamp / msInQuarter);
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
 * Safely read first seen timestamps
 */
function getFirstSeenMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_FIRST_SEEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFirstSeenMap(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_FIRST_SEEN_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Calculate realistic, strictly non-decreasing views for a listing
 * Updates 4 times per 24 hours (10-25 random views added each time) + real-time views added on top
 * @param {object} listing - { id, views, created_at, featured, sponsored, ... }
 * @returns {number} strictly non-decreasing view count
 */
export function getRealisticAdViews(listing) {
  if (!listing || !listing.id) return 0;

  const id = String(listing.id);
  const cache = getViewsCache();
  const cachedMax = Number(cache[id]) || 0;
  const clicksMap = getClicksMap();
  const directClicks = Number(clicksMap[id]) || 0;
  const existingViews = Number(listing.views) || 0;

  // 1. Initial launch base (25 to 45 views)
  const launchBase = 25 + (hash32(`${id}_launch_base`) % 21);

  // 2. Determine created timestamp
  let createdAt = listing.created_at ? new Date(listing.created_at).getTime() : 0;
  if (!createdAt || isNaN(createdAt)) {
    const firstSeen = getFirstSeenMap();
    if (firstSeen[id]) {
      createdAt = Number(firstSeen[id]);
    } else {
      // Deterministic age between 2 to 5 days
      const simulatedAgeDays = 2 + (hash32(`${id}_seed_age`) % 4);
      createdAt = Date.now() - simulatedAgeDays * 24 * 60 * 60 * 1000;
      if (typeof window !== 'undefined') {
        firstSeen[id] = createdAt;
        saveFirstSeenMap(firstSeen);
      }
    }
  }

  // 3. Compute elapsed quarters (4 times per 24 hours = 1 quarter every 6 hours)
  const nowTs = Date.now();
  const createdQuarter = getEpochQuarter(createdAt);
  const currentQuarter = getEpochQuarter(nowTs);
  const totalElapsedQuarters = Math.max(0, currentQuarter - createdQuarter);

  // 4. Sum up 10-25 views for each elapsed quarter cycle (4 times a day)
  let quarterGrowthTotal = 0;
  const isBoosted = Boolean(listing.featured || listing.sponsored);

  // For older listings, compute average for quarters older than 30 days (120 quarters)
  const detailedQuarterLimit = 120;
  if (totalElapsedQuarters > detailedQuarterLimit) {
    const excessQuarters = totalElapsedQuarters - detailedQuarterLimit;
    const stableAvg = 17 + (hash32(`${id}_quarter_avg`) % 3); // ~17 to 19 views per cycle
    quarterGrowthTotal += excessQuarters * stableAvg;
    const startQ = currentQuarter - detailedQuarterLimit;
    for (let q = startQ; q <= currentQuarter; q++) {
      quarterGrowthTotal += getQuarterRandomIncrement(id, q);
    }
  } else {
    for (let q = createdQuarter; q <= currentQuarter; q++) {
      quarterGrowthTotal += getQuarterRandomIncrement(id, q);
    }
  }

  if (isBoosted) {
    quarterGrowthTotal = Math.round(quarterGrowthTotal * 1.25);
  }

  // 5. Total organic quarters growth + direct real-time visitor clicks
  const candidateViews = launchBase + quarterGrowthTotal + directClicks;

  // 6. ABSOLUTE GUARANTEE: Never decrease under any circumstance!
  const finalViews = Math.max(cachedMax, existingViews, candidateViews);

  if (finalViews > cachedMax) {
    cache[id] = finalViews;
    saveViewsCache(cache);
  }

  return finalViews;
}

/**
 * Increment view count for an ad when viewed, and sync to DB/local storage in real-time
 * @param {object|string} listingOrId
 * @returns {number} updated view count
 */
export function recordAndIncrementAdView(listingOrId) {
  if (!listingOrId) return 0;
  const id = typeof listingOrId === 'object' ? String(listingOrId.id) : String(listingOrId);
  if (!id) return 0;

  // 1. Increment real-time visitor clicks count
  const clicksMap = getClicksMap();
  clicksMap[id] = (Number(clicksMap[id]) || 0) + 1;
  saveClicksMap(clicksMap);

  // 2. Re-calculate views
  const listingObj = typeof listingOrId === 'object' ? listingOrId : { id };
  const updatedViews = getRealisticAdViews(listingObj);

  // 3. Ensure cache stores the latest incremented number
  const cache = getViewsCache();
  const finalViews = Math.max(Number(cache[id]) || 0, updatedViews);
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
