// Dynamic Pakistan Standard Time (PKT, UTC+5) Daily Pricing Helpers
// Ensures website ALWAYS displays today's live verified benchmark date
// automatically without depending solely on external CI/cron jobs.

const DAY_MS = 24 * 60 * 60 * 1000;

const listingDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function toTimestamp(value) {
  const ts = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(ts) ? ts : null;
}

/** "10 Nov 2026" in Pakistan time, or '' if the date is missing */
export function formatListingDate(value) {
  const ts = toTimestamp(value);
  return ts === null ? '' : listingDateFormatter.format(ts);
}

/** "Today", "Yesterday", "3 days ago", else the full date */
export function formatListingDateRelative(value) {
  const ts = toTimestamp(value);
  if (ts === null) return '';
  const dayKey = (t) => listingDateFormatter.format(t);
  const now = Date.now();
  if (dayKey(ts) === dayKey(now)) return 'Today';
  if (dayKey(ts) === dayKey(now - DAY_MS)) return 'Yesterday';
  const days = Math.floor((now - ts) / DAY_MS);
  if (days >= 2 && days < 7) return `${days} days ago`;
  return formatListingDate(ts);
}

export const LISTING_DATE_RANGES = [
  { id: 'all', label: 'Any time', days: null },
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
];

/** Keeps listings posted within the selected range; listings without a date only show for 'all' */
export function filterListingsByDateRange(listings, rangeId) {
  const list = Array.isArray(listings) ? listings : [];
  const range = LISTING_DATE_RANGES.find((r) => r.id === rangeId);
  if (!range || range.days === null) return list;
  const cutoff = Date.now() - range.days * DAY_MS;
  return list.filter((l) => {
    const ts = toTimestamp(l?.created_at);
    return ts !== null && ts >= cutoff;
  });
}

export function getPakistanDateDetails() {
  const now = new Date();

  // Islamabad / Karachi Timezone
  const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
  });

  const monthFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    month: 'long',
  });

  const yearFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
  });

  const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const day = dayFormatter.format(now);
  const month = monthFormatter.format(now);
  const year = yearFormatter.format(now);
  const formattedTodayStr = `${day} ${month} ${year}`; // e.g. "11 September 2026"

  const shortDateRaw = shortDateFormatter.format(now);
  const shortDateKey = shortDateRaw.replace(/\s+/g, '-'); // e.g. "11-Sep-2026"

  // Yesterday date calculation for comparison sheets
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayShortRaw = shortDateFormatter.format(yesterday);
  const yesterdayShortKey = yesterdayShortRaw.replace(/\s+/g, '-');

  return {
    todayStr: formattedTodayStr,
    shortDate: shortDateKey,
    yesterdayShortDate: yesterdayShortKey,
    lastMidnightStr: `${shortDateKey} (Islamabad Ready Stock Verified)`,
    iso: now.toISOString(),
  };
}
