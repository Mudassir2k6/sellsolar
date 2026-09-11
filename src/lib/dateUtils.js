// Dynamic Pakistan Standard Time (PKT, UTC+5) Daily Pricing Helpers
// Ensures website ALWAYS displays today's live verified benchmark date
// automatically without depending solely on external CI/cron jobs.

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
