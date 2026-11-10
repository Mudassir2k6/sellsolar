/** Helpers for seller ad ownership, dedupe, and soft-delete flags */

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function normalizeEmail(value) {
  return String(value || '').toLowerCase().trim();
}

export function listingFingerprint(listing) {
  if (!listing) return '';
  const title = String(listing.title || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const price = String(Number(listing.price) || 0);
  const email = normalizeEmail(listing.seller_email || listing.email);
  const phone = digitsOnly(listing.seller_phone || listing.phone);
  return `${title}|${price}|${email || phone}`;
}

export function isListingSoftDeleted(listing) {
  if (!listing) return false;
  if (listing.is_deleted === true) return true;
  const status = String(listing.status || '').toLowerCase();
  return status === 'deleted';
}

/**
 * Strict ownership: only account user_id OR seller email.
 * Never match by phone/name — that leaked other users' ads into dashboards
 * when emails changed or phones overlapped.
 */
export function listingBelongsToUser(listing, user, profile) {
  if (!listing || !user) return false;

  if (listing.user_id && user.id && String(listing.user_id) === String(user.id)) {
    return true;
  }

  const uEmail = normalizeEmail(user.email || profile?.email);
  if (!uEmail) return false;

  const listingEmail = normalizeEmail(listing.seller_email || listing.email);
  return Boolean(listingEmail && listingEmail === uEmail);
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
