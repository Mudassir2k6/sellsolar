/** Helpers for seller ad ownership, dedupe, and soft-delete flags */

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function listingFingerprint(listing) {
  if (!listing) return '';
  const title = String(listing.title || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const price = String(Number(listing.price) || 0);
  const phone = digitsOnly(listing.seller_phone || listing.phone);
  return `${title}|${price}|${phone}`;
}

export function isListingSoftDeleted(listing) {
  if (!listing) return false;
  if (listing.is_deleted === true) return true;
  const status = String(listing.status || '').toLowerCase();
  return status === 'deleted';
}

/**
 * Does this listing belong to the logged-in seller?
 * Prefer user_id / email / phone. Do NOT match by seller_name alone
 * (that caused fake extra ads from similarly named seed/local rows).
 */
export function listingBelongsToUser(listing, user, profile) {
  if (!listing || !user) return false;

  if (listing.user_id && user.id && String(listing.user_id) === String(user.id)) {
    return true;
  }

  const uEmail = (user.email || profile?.email || '').toLowerCase().trim();
  const listingEmail = (listing.seller_email || listing.email || '').toLowerCase().trim();
  if (uEmail && listingEmail && uEmail === listingEmail) return true;

  const uPhone = digitsOnly(profile?.phone || user?.user_metadata?.phone);
  const listingPhone = digitsOnly(listing.seller_phone || listing.phone);
  if (uPhone && listingPhone && uPhone === listingPhone) {
    // Only claim orphan phone-matched ads (no other owner), or same user_id
    if (!listing.user_id || String(listing.user_id) === String(user.id)) return true;
  }

  return false;
}

/**
 * Merge remote + local listings without duplicates.
 * Prefer remote/DB rows over localStorage copies with the same fingerprint.
 */
export function mergeListingsPreferRemote(remote = [], local = []) {
  const byId = new Map();
  const byFp = new Map();

  const add = (item, prefer = false) => {
    if (!item?.id) return;
    const id = String(item.id);
    const fp = listingFingerprint(item);

    if (byId.has(id)) {
      if (prefer) byId.set(id, { ...byId.get(id), ...item });
      return;
    }
    if (fp && byFp.has(fp)) {
      // Skip local duplicate of an already-loaded listing
      if (!prefer) return;
      const existingId = byFp.get(fp);
      byId.delete(existingId);
      byId.set(id, item);
      byFp.set(fp, id);
      return;
    }

    byId.set(id, item);
    if (fp) byFp.set(fp, id);
  };

  (remote || []).forEach((r) => add(r, true));
  (local || []).forEach((l) => add(l, false));

  return Array.from(byId.values());
}

export function dedupeSellerAds(listings = []) {
  const byId = new Map();
  const byFp = new Map();
  for (const item of listings || []) {
    if (!item?.id) continue;
    const id = String(item.id);
    if (byId.has(id)) continue;
    const fp = listingFingerprint(item);
    if (fp && byFp.has(fp)) continue;
    byId.set(id, item);
    if (fp) byFp.set(fp, id);
  }
  return Array.from(byId.values());
}
