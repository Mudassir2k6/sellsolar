/** Partner “Advertise here” submissions — local store (+ optional Supabase sync later). */

export const PARTNER_AD_SUBMISSIONS_KEY = 'sellsolar_partner_ad_submissions';
export const PARTNER_AD_EVENT = 'sellsolar_partner_ads_updated';

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

export function getPartnerAdSubmissions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PARTNER_AD_SUBMISSIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePartnerAdSubmissions(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PARTNER_AD_SUBMISSIONS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    notify();
  } catch (e) {
    console.warn('Partner ad submissions save notice:', e?.message || e);
  }
}

export function addPartnerAdSubmission(payload) {
  const item = {
    id: `pad-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    title: String(payload.title || '').trim(),
    subtitle: String(payload.subtitle || '').trim(),
    advertiser: String(payload.advertiser || '').trim(),
    linkUrl: String(payload.linkUrl || '').trim(),
    imageUrl: payload.imageUrl || '',
    contactName: String(payload.contactName || '').trim(),
    contactPhone: String(payload.contactPhone || '').trim(),
    contactEmail: String(payload.contactEmail || '').trim(),
    /** pending = waiting admin, approved = live on marquee, hidden = admin removed from display */
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const next = [item, ...getPartnerAdSubmissions()];
  savePartnerAdSubmissions(next);
  return item;
}

export function updatePartnerAdSubmission(id, patch) {
  const next = getPartnerAdSubmissions().map((row) =>
    row.id === id ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row,
  );
  savePartnerAdSubmissions(next);
  return next.find((r) => r.id === id) || null;
}

export function setPartnerAdStatus(id, status) {
  return updatePartnerAdSubmission(id, { status });
}

export function deletePartnerAdSubmission(id) {
  savePartnerAdSubmissions(getPartnerAdSubmissions().filter((r) => r.id !== id));
}

/** Approved ads ready for the homepage marquee */
export function getApprovedPartnerAdsForMarquee() {
  return getPartnerAdSubmissions()
    .filter((a) => a.status === 'approved' && a.title)
    .map((a) => ({
      id: a.id,
      adType: 'partner_submission',
      title: a.title,
      subtitle: a.subtitle || a.advertiser || 'Partner',
      imageUrl: a.imageUrl || '',
      linkUrl: a.linkUrl || '',
      packageId: 'free',
      isActive: true,
      advertiser: a.advertiser || 'Partner',
    }));
}
