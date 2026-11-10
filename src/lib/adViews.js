// Ad views engine for SellSolar listings
// - Deterministic: same number on every device, card and detail page
// - Grows by exactly 1 view per elapsed hour since the ad was created
// - Page refreshes and ad opens never add views

const LEGACY_STORAGE_KEYS = [
  'sellsolar_ad_views_cache',
  'sellsolar_ad_views_clicks',
  'sellsolar_ad_views_first_seen',
];

const HOUR_MS = 60 * 60 * 1000;
const LISTINGS_WITHOUT_DATE_ANCHOR = Date.UTC(2026, 9, 1);

let legacyCleared = false;

function clearLegacyViewCaches() {
  if (legacyCleared || typeof window === 'undefined') return;
  legacyCleared = true;
  try {
    LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

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

function getListingCreatedAt(listing, id) {
  const ts = listing.created_at ? new Date(listing.created_at).getTime() : NaN;
  if (Number.isFinite(ts) && ts > 0) return ts;
  // Seed/legacy listings without a date get a stable pseudo-date (0–10 days after anchor)
  return LISTINGS_WITHOUT_DATE_ANCHOR + (hash32(`${id}_seed_age`) % (10 * 24)) * HOUR_MS;
}

/**
 * Views = small per-ad launch base + 1 per full hour since creation.
 * @param {object} listing - { id, created_at, ... }
 * @returns {number}
 */
export function getRealisticAdViews(listing) {
  if (!listing || !listing.id) return 0;
  clearLegacyViewCaches();

  const id = String(listing.id);
  const launchBase = 20 + (hash32(`${id}_launch_base`) % 31);
  const createdAt = getListingCreatedAt(listing, id);
  const hoursElapsed = Math.max(0, Math.floor((Date.now() - createdAt) / HOUR_MS));

  return launchBase + hoursElapsed;
}

/**
 * Kept for existing callers. Opening or refreshing an ad does not add views.
 * @param {object|string} listingOrId
 * @returns {number}
 */
export function recordAndIncrementAdView(listingOrId) {
  if (!listingOrId) return 0;
  const listing = typeof listingOrId === 'object' ? listingOrId : { id: listingOrId };
  return getRealisticAdViews(listing);
}

export async function syncViewsToDatabase() {}
