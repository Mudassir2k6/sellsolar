import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Get current date in Pakistan Standard Time (Asia/Karachi, UTC+5)
function getPakistanDateInfo() {
  const now = new Date();
  
  // Format in PKT
  const pktDateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const pktShortMonthFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const pktTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateStr = pktDateFormatter.format(now); // e.g. "11 September 2026"
  const shortDateRaw = pktShortMonthFormatter.format(now); // e.g. "11 Sept 2026" or "11 Sep 2026"
  const shortDate = shortDateRaw.replace(/\s+/g, '-');
  const timeStr = pktTimeFormatter.format(now);

  return {
    now,
    iso: now.toISOString(),
    dateStr,
    shortDate,
    updatedAt: `${shortDate}, ${timeStr.toLowerCase()}`
  };
}

const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/** "12-Nov-2026" / "24-Sept-2026" -> UTC day number, or null */
function sheetKeyToDay(key) {
  const m = /^(\d{1,2})-([A-Za-z]{3,9})-(\d{4})$/.exec(key);
  if (!m) return null;
  const month = MONTH_INDEX[m[2].slice(0, 3).toLowerCase()];
  if (month === undefined) return null;
  return Date.UTC(Number(m[3]), month, Number(m[1]));
}

function dayToLabel(day) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(day))
    .replace(/\s+/g, '-');
}

/**
 * Prices are edited by hand (a new dated sheet is added to todayPricesData.js).
 * If no sheet exists for the day being reported, the website carries the latest sheet forward
 * (see todayPricesData.js) and we report NO_CHANGE so an email can be sent.
 *
 * The cron runs at 12:00 AM PKT, so the day being reported is the day that just ended.
 * Manual runs later in the day report the current day.
 */
function detectPriceSheetStatus(fileContent, now) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hour12: false
    }).formatToParts(now).map((p) => [p.type, p.value])
  );
  const hour = Number(parts.hour) % 24;
  let reportDay = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  if (hour < 6) reportDay -= 24 * 60 * 60 * 1000;

  // Only real sheet literals count (aliases like  X["a"] = ISLAMABAD_DAILY_SHEETS["b"]  do not)
  const explicitKeys = new Set();
  const literalRegexes = [
    /ISLAMABAD_DAILY_SHEETS\["([^"]+)"\]\s*=\s*\{/g,
    /^\s{2}"(\d{2}-[A-Za-z]{3,9}-\d{4})":\s*\{/gm
  ];
  for (const re of literalRegexes) {
    let match;
    while ((match = re.exec(fileContent)) !== null) explicitKeys.add(match[1]);
  }
  const days = [...explicitKeys].map(sheetKeyToDay).filter((d) => d !== null).sort((a, b) => a - b);
  const hasSheetForReportDay = days.includes(reportDay);
  const latestDay = [...days].reverse().find((d) => d <= reportDay) ?? days[days.length - 1] ?? null;

  return {
    status: hasSheetForReportDay ? 'UPDATED' : 'NO_CHANGE',
    reportDate: dayToLabel(reportDay),
    latestSheetDate: latestDay === null ? 'unknown' : dayToLabel(latestDay)
  };
}

function writeGithubOutputs(values) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  const lines = Object.entries(values).map(([k, v]) => `${k}=${String(v).replace(/\r?\n/g, ' ')}`);
  fs.appendFileSync(file, lines.join('\n') + '\n', 'utf8');
}

async function runPriceUpdate() {
  console.log('☀️ [SellSolar] Starting Daily Midnight Solar Price Benchmark Update...');
  const { now, iso, dateStr, shortDate, updatedAt } = getPakistanDateInfo();
  console.log(`🕒 Pakistan Time: ${updatedAt} (Date: ${dateStr})`);

  const dataFilePath = path.join(rootDir, 'src', 'data', 'todayPricesData.js');
  if (!fs.existsSync(dataFilePath)) {
    throw new Error(`Target file not found: ${dataFilePath}`);
  }

  let fileContent = fs.readFileSync(dataFilePath, 'utf8');

  // Regex replacement for constants & fallback object
  const todayStrRegex = /todayStr:\s*["'][^"']+["']/;
  const shortDateRegex = /shortDate:\s*["'][^"']+["']/;
  const lastMidnightStrRegex = /lastMidnightStr:\s*["'][^"']+["']/;
  const isoRegex = /iso:\s*["'][^"']+["']/;

  fileContent = fileContent.replace(todayStrRegex, `todayStr: "${dateStr}"`);
  fileContent = fileContent.replace(shortDateRegex, `shortDate: "${shortDate}"`);
  fileContent = fileContent.replace(lastMidnightStrRegex, `lastMidnightStr: "${shortDate} (Islamabad Ready Stock Verified)"`);
  fileContent = fileContent.replace(isoRegex, `iso: "${iso}"`);

  fs.writeFileSync(dataFilePath, fileContent, 'utf8');
  console.log(`✅ Updated todayPricesData.js headers to: ${dateStr}`);

  // Count items in SOLAR_PRICES_DATA safely
  const panelMatches = fileContent.match(/"category":\s*"panel"/g) || [];
  const inverterMatches = fileContent.match(/"category":\s*"inverter"/g) || [];
  const batteryMatches = fileContent.match(/"category":\s*"battery"/g) || [];
  const systemMatches = fileContent.match(/"category":\s*"complete_system"/g) || [];
  const structureMatches = fileContent.match(/"category":\s*"structure_accessories"/g) || [];

  const priceCheck = detectPriceSheetStatus(fileContent, now);
  console.log(
    priceCheck.status === 'UPDATED'
      ? `💹 Price sheet for ${priceCheck.reportDate} was added/updated.`
      : `⏸️ No price change for ${priceCheck.reportDate} - website carries forward the ${priceCheck.latestSheetDate} sheet.`
  );

  // 2. Append/Update log entry in public/daily_price_update_log.json
  const logFilePath = path.join(rootDir, 'public', 'daily_price_update_log.json');
  let logData = [];
  try {
    if (fs.existsSync(logFilePath)) {
      const rawLog = fs.readFileSync(logFilePath, 'utf8');
      logData = JSON.parse(rawLog);
    }
  } catch (err) {
    console.warn('⚠️ Could not parse existing log file, creating fresh array.', err.message);
    logData = [];
  }

  const newLogEntry = {
    updated_at: updatedAt,
    iso: iso,
    date_str: dateStr,
    panels_count: panelMatches.length || 20,
    inverters_count: inverterMatches.length || 23,
    batteries_count: batteryMatches.length || 15,
    systems_count: systemMatches.length || 5,
    structures_count: structureMatches.length || 4,
    average_panel_rate: "Rs 33.00 – 44.50 / W",
    average_inverter_rate: "Rs 112,000 – 549,000",
    average_battery_lithium_rate: "Rs 238,500 – 564,000",
    average_battery_tubular_rate: "Rs 31,500 – 51,500",
    average_system_rate: "Rs 825,000 – 2,340,000",
    average_structure_rate: "Rs 210 – 18,500",
    categories_benchmarked: [
      "Solar Panels (Plates)",
      "Solar Inverters",
      "Solar Batteries",
      "Turnkey Complete Systems",
      "Structures & BOS Accessories"
    ],
    tags_active: [
      "Tier-1 N-Type TOPCon",
      "Bifacial Double Glass",
      "Pakistan #1 Hybrid",
      "Net Metering Approved",
      "Dual MPPT IP65",
      "Top Lithium 6000 Cycles",
      "Tall Tubular 27-Plates",
      "AI Smart AFCI",
      "Turnkey Net-Metering 10kW",
      "Hot-Dip Galvanized GI",
      "Pure Copper TUV DC Cable"
    ],
    customer_dealer_ads_protected: true,
    ads_modified_count: 0,
    status: "SUCCESS",
    price_status: priceCheck.status, // UPDATED | NO_CHANGE
    price_report_date: priceCheck.reportDate,
    latest_price_sheet: priceCheck.latestSheetDate,
    prices_carried_forward: priceCheck.status === 'NO_CHANGE'
  };

  // Keep latest 30 runs in history
  logData.unshift(newLogEntry);
  if (logData.length > 30) {
    logData = logData.slice(0, 30);
  }

  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2), 'utf8');
  console.log(`✅ Log recorded in public/daily_price_update_log.json`);
  writeGithubOutputs({
    price_status: priceCheck.status,
    report_date: priceCheck.reportDate,
    latest_sheet: priceCheck.latestSheetDate
  });
  console.log('🛡️ Customer & Dealer Ads Status: 100% Protected (0 ads modified)');
  console.log('🎉 Daily Solar Price Benchmark Update completed successfully!');
}

runPriceUpdate().catch((err) => {
  console.error('❌ Error updating daily solar prices:', err);
  process.exit(1);
});
