import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RAW_BASE_DAILY_SHEET, makeRateItemKey } from '../src/data/todayPricesData.js';
import { AUTO_FETCHED_RATES as PREV_AUTO_SNAPSHOT } from '../src/data/autoFetchedRates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DEFAULT_SUPABASE_URL = 'https://zgfycrnmivfybbclflwf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao';

async function fetchSupabaseAdminOverrideSheet() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const supabaseUrl = String(rawUrl || '').trim().replace(/\/+$/, '');
  const supabaseKey = String(rawKey || '').trim();
  if (!supabaseUrl.startsWith('http') || supabaseKey.length < 40) return null;

  try {
    const endpoint = `${supabaseUrl}/rest/v1/site_settings?key=eq.daily_rates_override&select=value,updated_at`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    let remoteWrapper = row?.value;
    if (typeof remoteWrapper === 'string') {
      try {
        remoteWrapper = JSON.parse(remoteWrapper);
      } catch {
        return null;
      }
    }
    if (!remoteWrapper || typeof remoteWrapper !== 'object') return null;

    const remoteSheet = remoteWrapper.sheet || remoteWrapper;
    if (!remoteSheet || !Array.isArray(remoteSheet.rates) || remoteSheet.rates.length === 0) {
      return null;
    }

    const repoPublishedMs =
      Date.parse(RAW_BASE_DAILY_SHEET?.publishedIso || '2026-11-24T16:00:00+05:00') || 0;
    const remotePublishedMs =
      Date.parse(remoteWrapper.publishedAt || remoteSheet.publishedAt || row.updated_at || '') || 0;

    if (remotePublishedMs < repoPublishedMs) {
      return null;
    }

    return {
      sheet: {
        ...RAW_BASE_DAILY_SHEET,
        ...remoteSheet,
        publishedAt: remoteWrapper.publishedAt || remoteSheet.publishedAt || row.updated_at,
        reportDate: remoteWrapper.reportDate || remoteSheet.date || RAW_BASE_DAILY_SHEET?.date,
      },
      publishedAt: remoteWrapper.publishedAt || row.updated_at || null,
    };
  } catch {
    return null;
  }
}

const TIER_1_SOURCES = [
  { domain: 'roshanex.pk', type: 'wc_store', baseUrl: 'https://roshanex.pk', pages: 3 },
  { domain: 'multichoicesolar.pk', type: 'wc_store', baseUrl: 'https://multichoicesolar.pk', pages: 3 },
  { domain: 'knox.com.pk', type: 'wc_store', baseUrl: 'https://knox.com.pk', pages: 2 },
  { domain: 'pakistansolarprices.com', type: 'html_table', urls: ['https://pakistansolarprices.com/'] },
  { domain: 'solarpricepakistan.com.pk', type: 'html_table', urls: ['https://solarpricepakistan.com.pk/'] },
  { domain: 'solarbazaar.io', type: 'html_cards', urls: ['https://solarbazaar.io/'] },
  { domain: 'tradeon.pk', type: 'html_cards', urls: ['https://tradeon.pk/'] },
  { domain: 'w11stop.com', type: 'html_cards', urls: ['https://w11stop.com/solar-panels', 'https://w11stop.com/solar-inverters'] },
];

const TIER_2_SOURCES = [
  { domain: 'alladin.pk', type: 'shopify', baseUrl: 'https://alladin.pk' },
  { domain: 'sunsolar.pk', type: 'wc_store', baseUrl: 'https://sunsolar.pk', pages: 3 },
  { domain: 'jbmssolar.pk', type: 'wc_store', baseUrl: 'https://jbmssolar.pk', pages: 2 },
  { domain: 'solarpanelprices.pk', type: 'html_table', urls: ['https://solarpanelprices.pk/'] },
  { domain: 'hajverysolar.com', type: 'html_cards', urls: ['https://hajverysolar.com/'] },
  { domain: 'alphasolar.com.pk', type: 'html_cards', urls: ['https://alphasolar.com.pk/'] },
  { domain: 'kamalsolar.pk', type: 'html_cards', urls: ['https://kamalsolar.pk/'] },
  { domain: 'paksolarinsights.pk', type: 'html_table', urls: ['https://paksolarinsights.pk/'] },
  { domain: 'qeemat.com.pk', type: 'html_table', urls: ['https://qeemat.com.pk/solar-panel-price-in-pakistan/'] },
  { domain: 'hamariweb.com', type: 'html_table', urls: ['https://hamariweb.com/finance/solar-panel-price-in-pakistan/'] },
];

function getPakistanDateInfo() {
  const now = new Date();

  const pktDateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pktShortMonthFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const pktTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = pktDateFormatter.format(now);
  const shortDateRaw = pktShortMonthFormatter.format(now);
  const shortDate = shortDateRaw.replace(/\s+/g, '-');
  const timeStr = pktTimeFormatter.format(now);

  return {
    now,
    iso: now.toISOString(),
    dateStr,
    shortDate,
    updatedAt: `${shortDate}, ${timeStr.toLowerCase()}`,
  };
}

function decodeHtml(str) {
  return String(str || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, '-')
    .replace(/&#8360;/g, 'Rs')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function collectFromWcStore(source) {
  const listings = [];
  for (let page = 1; page <= (source.pages || 2); page++) {
    const url = `${source.baseUrl}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    const raw = await fetchWithTimeout(url, 8000);
    if (!raw) break;
    try {
      const products = JSON.parse(raw);
      if (!Array.isArray(products) || products.length === 0) break;
      for (const p of products) {
        const title = decodeHtml(p?.name || '');
        if (!title) continue;
        const minor = Number(p?.prices?.currency_minor_unit ?? 0);
        const rawPrice = Number(p?.prices?.price || 0);
        const price = rawPrice > 0 ? rawPrice / Math.pow(10, minor) : 0;
        if (price > 0 && p?.is_in_stock !== false) {
          listings.push({
            title,
            price,
            source: source.domain,
            url: p?.permalink || url,
            kind: 'product',
          });
        }
      }
      if (products.length < 100) break;
    } catch {
      break;
    }
  }
  return listings;
}

async function collectFromShopify(source) {
  const listings = [];
  const url = `${source.baseUrl}/products.json?limit=250`;
  const raw = await fetchWithTimeout(url, 8000);
  if (!raw) return listings;
  try {
    const data = JSON.parse(raw);
    const products = Array.isArray(data?.products) ? data.products : [];
    for (const p of products) {
      const title = decodeHtml(p?.title || '');
      const variant = Array.isArray(p?.variants) ? p.variants[0] : null;
      const price = Number(variant?.price || 0);
      if (title && price > 0 && variant?.available !== false) {
        listings.push({
          title,
          price,
          source: source.domain,
          url: `${source.baseUrl}/products/${p.handle || ''}`,
          kind: 'product',
        });
      }
    }
  } catch {
    // ignore invalid JSON
  }
  return listings;
}

function parsePriceNumbersFromText(text) {
  const matches = [...String(text || '').matchAll(/(?:rs\.?|pkr)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi)];
  return matches
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
}

async function collectFromHtmlTables(source) {
  const listings = [];
  for (const url of source.urls || []) {
    const html = await fetchWithTimeout(url, 8000);
    if (!html) continue;

    const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const tr of trMatches) {
      const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => decodeHtml(c[1]));
      if (cells.length < 2) continue;
      const title = cells[0];
      if (!title || /^(date|panel|solar panel types|brand|model|sno)/i.test(title)) continue;
      if (/^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/.test(title)) continue;

      const numericValues = [];
      for (const cell of cells.slice(1)) {
        if (/out of stock|unavailable/i.test(cell)) {
          numericValues.length = 0;
          break;
        }
        numericValues.push(...parsePriceNumbersFromText(cell));
      }
      if (!numericValues.length) continue;

      const perWattCandidate = numericValues.find((v) => v >= 26 && v <= 55);
      const unitCandidate = numericValues.find((v) => v >= 1000 && v <= 10000000);
      if (perWattCandidate || unitCandidate) {
        listings.push({
          title,
          perWattPrice: perWattCandidate || null,
          price: unitCandidate || perWattCandidate || 0,
          source: source.domain,
          url,
          kind: 'table_row',
        });
      }
    }

    const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const ld of ldMatches) {
      try {
        const parsed = JSON.parse(ld[1]);
        const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
        while (stack.length) {
          const node = stack.pop();
          if (!node || typeof node !== 'object') continue;
          if (Array.isArray(node['@graph'])) stack.push(...node['@graph']);
          if (node['@type'] === 'Product' && node.name && node.offers) {
            const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
            const p = Number(offer?.price || offer?.lowPrice || 0);
            if (p > 0) {
              listings.push({
                title: decodeHtml(node.name),
                price: p,
                source: source.domain,
                url: node.url || url,
                kind: 'json_ld',
              });
            }
          }
        }
      } catch {
        // ignore broken JSON-LD
      }
    }
  }
  return listings;
}

async function collectFromHtmlCards(source) {
  const listings = await collectFromHtmlTables(source);
  for (const url of source.urls || []) {
    const html = await fetchWithTimeout(url, 7000);
    if (!html) continue;
    const cardRegex = /<(?:li|div|article)[^>]*class="[^"]*(?:product|card|item)[^"]*"[^>]*>([\s\S]{30,1500}?)<\/(?:li|div|article)>/gi;
    let match;
    let count = 0;
    while ((match = cardRegex.exec(html)) !== null && count < 120) {
      count++;
      const block = match[1];
      const heading = block.match(/<(?:h[1-6]|a)[^>]*>([\s\S]{4,140}?)<\/(?:h[1-6]|a)>/i);
      const priceMatch = block.match(/(?:Rs\.?|PKR)\s*([\d,]+(?:\.\d{1,2})?)/i);
      if (heading && priceMatch) {
        const title = decodeHtml(heading[1]);
        const price = Number(priceMatch[1].replace(/,/g, ''));
        if (title.length >= 6 && price > 0) {
          listings.push({ title, price, source: source.domain, url, kind: 'html_card' });
        }
      }
    }
  }
  return listings;
}

async function collectSource(source) {
  if (source.type === 'wc_store') return collectFromWcStore(source);
  if (source.type === 'shopify') return collectFromShopify(source);
  if (source.type === 'html_table') return collectFromHtmlTables(source);
  return collectFromHtmlCards(source);
}

function normalizeStr(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BRAND_ALIASES = {
  longi: ['longi'],
  astronergy: ['astronergy', 'astro'],
  'ja solar': ['ja solar', 'ja '],
  'canadian solar': ['canadian solar', 'canadian'],
  'jinko solar': ['jinko solar', 'jinko'],
  osda: ['osda'],
  trox: ['trox'],
  korean: ['korean'],
  tcl: ['tcl'],
  inverex: ['inverex'],
  yingli: ['yingli'],
  aiko: ['aiko'],
  lefn: ['lefn'],
  trina: ['trina'],
  daewoo: ['daewoo'],
  itel: ['itel'],
  knox: ['knox'],
  'knox zapher': ['knox', 'zapher'],
  goodwe: ['goodwe'],
  growatt: ['growatt'],
  solis: ['solis'],
  sungrow: ['sungrow'],
  huawei: ['huawei'],
  saj: ['saj'],
  asw: ['asw', 'aiswei', 'solplanet'],
  xerox: ['xerox'],
  fronus: ['fronus'],
  zilo: ['zilo'],
  narada: ['narada'],
  pylontech: ['pylontech'],
  phoenix: ['phoenix'],
  osaka: ['osaka'],
  exide: ['exide'],
  ags: ['ags'],
  eastron: ['eastron'],
  chint: ['chint'],
  cnc: ['cnc'],
  tomzen: ['tomzen'],
  fast: ['fast cable', 'fast cables'],
  'pakistan cables': ['pakistan cables', 'pakistan cable'],
};

function matchesBrand(titleNorm, brand) {
  const bNorm = normalizeStr(brand);
  const aliases = BRAND_ALIASES[bNorm] || [bNorm.replace(/\s*solar$/, '').trim()];
  return aliases.some((alias) => {
    const cleanAlias = alias.trim();
    if (!cleanAlias) return false;
    return (` ${titleNorm} `).includes(` ${cleanAlias} `) || titleNorm.includes(cleanAlias);
  });
}

function isDisqualifiedTitle(titleNorm, category) {
  const bundleWords = ['combo', 'package', 'complete system', 'with panels', 'install', 'with battery', 'bracket', 'stand', 'connector'];
  if (category === 'panel') {
    if (/(inverter|battery|charger|ups|cable|breaker|structure|stand|pallet|pack of|set of|\d+\s*pcs)/i.test(titleNorm)) {
      return true;
    }
  } else if (category === 'inverter') {
    if (/(panel|battery pack|solar plate|cable|smart meter|without inverter)/i.test(titleNorm)) return true;
    if (bundleWords.some((w) => titleNorm.includes(w))) return true;
  } else if (category === 'battery') {
    if (/(inverter|solar plate|panel|bmu|wheel|stand only|cable only)/i.test(titleNorm)) return true;
    if (bundleWords.some((w) => titleNorm.includes(w))) return true;
  }
  return false;
}

function extractPanelWattage(model) {
  const m = String(model || '').match(/(\d{3})\s*W?/i);
  return m ? Number(m[1]) : null;
}

function matchPanelListing(item, listings) {
  const baseRate = Number(item.rate);
  if (!Number.isFinite(baseRate) || baseRate <= 0) return null;
  const wattage = extractPanelWattage(item.model);
  if (!wattage) return null;

  const isBfOrBifacial = /\bbf\b|bifacial|double\s*glass/i.test(`${item.model} ${item.badge || ''}`);
  const isHjt = /\bhjt\b/i.test(item.model);
  const candidates = [];

  for (const row of listings) {
    const tNorm = normalizeStr(row.title);
    if (!matchesBrand(tNorm, item.brand)) continue;
    if (isDisqualifiedTitle(tNorm, 'panel')) continue;

    const hasExactWatt = new RegExp(`\\b${wattage}\\s*(?:w|watt)?\\b`, 'i').test(tNorm);
    if (!hasExactWatt) continue;

    if (/mustang/i.test(item.model) && !tNorm.includes('mustang')) continue;
    if (/jollywood/i.test(item.model) && !tNorm.includes('jollywood')) continue;
    if (isHjt && !tNorm.includes('hjt')) continue;
    if (isBfOrBifacial && tNorm.includes('single glass') && !tNorm.includes('bi')) continue;

    let perWatt = null;
    if (row.perWattPrice && row.perWattPrice >= 28 && row.perWattPrice <= 50) {
      perWatt = row.perWattPrice;
    } else if (row.price >= 28 && row.price <= 50) {
      perWatt = row.price;
    } else if (row.price >= 14000 && row.price <= 45000) {
      const derived = Number((row.price / wattage).toFixed(2));
      if (derived >= 28 && derived <= 50) {
        perWatt = derived;
      }
    }

    if (perWatt === null) continue;
    if (Math.abs(perWatt - baseRate) / baseRate > 0.2) continue;

    candidates.push({
      rate: Number(perWatt.toFixed(2)),
      source: row.source,
      url: row.url,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => a.rate - b.rate);
  return candidates[Math.floor(candidates.length / 2)];
}

function matchUnitListing(item, category, listings) {
  const baseRate = typeof item.rate === 'number' ? item.rate : null;
  if (!baseRate || baseRate <= 0) return null;

  const modelNorm = normalizeStr(item.model);
  const kwMatch = modelNorm.match(/(\d+(?:\.\d+)?)\s*kw\b/i) || normalizeStr(item.capacity || '').match(/(\d+(?:\.\d+)?)\s*kw\b/i);
  const pvMatch = modelNorm.match(/\bpv\s*(\d{4,5})\b/i);
  const voltMatch = modelNorm.match(/\b(12|24|25|25\.6|48|51|51\.2)\s*v\b/i);
  const ahMatch = modelNorm.match(/\b(\d{2,3})\s*ah\b/i);

  const seriesTokens = ['zapher', 'krypton', 'xenon', 'zynex', 'xynex', 'nitrox', 'ip54', 'ip 54', 'ip65', 'ip 65', 'ip66', 'ip 66', 'powerwall', 'powerbase', 'powerstack', 'power tank', 'powertank', 'power rover', 'sdm630', 'tx2500', 'bmu']
    .filter((tok) => modelNorm.includes(tok.replace(/\s+/g, ' ')));

  const candidates = [];
  for (const row of listings) {
    const tNorm = normalizeStr(row.title);
    if (!matchesBrand(tNorm, item.brand)) continue;
    if (isDisqualifiedTitle(tNorm, category)) continue;

    if (kwMatch) {
      const kwVal = kwMatch[1];
      const wattsVal = Math.round(Number(kwVal) * 1000);
      const kwRegex = new RegExp(`(?:^|\\s)${kwVal.replace('.', '\\.')}\\s*kw\\b|\\b${wattsVal}\\s*w\\b`, 'i');
      if (!kwRegex.test(tNorm)) continue;
    }

    if (pvMatch) {
      if (!tNorm.includes(pvMatch[1])) continue;
    }

    if (voltMatch) {
      const vNum = Math.floor(Number(voltMatch[1]));
      const vAlternates = vNum === 25 ? ['24', '25', '25.6'] : vNum === 51 ? ['48', '51', '51.2'] : [String(vNum)];
      const hasV = vAlternates.some((v) => new RegExp(`\\b${v.replace('.', '\\.')}\\s*v\\b`, 'i').test(tNorm));
      if (!hasV) continue;
    }

    if (ahMatch) {
      if (!new RegExp(`\\b${ahMatch[1]}\\s*ah\\b`, 'i').test(tNorm)) continue;
    }

    if (seriesTokens.length > 0) {
      const hasSeries = seriesTokens.every((tok) => {
        if (tok === 'ip54' || tok === 'ip 54') return /ip\s*54/.test(tNorm);
        if (tok === 'ip65' || tok === 'ip 65') return /ip\s*65/.test(tNorm);
        if (tok === 'ip66' || tok === 'ip 66') return /ip\s*66/.test(tNorm);
        return tNorm.includes(tok);
      });
      if (!hasSeries) continue;
    }

    const p = Math.round(row.price);
    if (p < 500) continue;
    if (Math.abs(p - baseRate) / baseRate > 0.3) continue;

    candidates.push({
      rate: p,
      source: row.source,
      url: row.url,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => a.rate - b.rate);
  return candidates[Math.floor(candidates.length / 2)];
}

function formatAutoFetchedModule(snapshot) {
  return [
    '// Automated nightly solar market benchmark snapshot (Option B)',
    '// Updated every 12:00 AM PKT by scripts/update-today-prices.js',
    '// Primary Pakistani sources are queried first, then secondary fallback sites.',
    '// Items not matched reliably on any Pakistani source retain their previous verified rate',
    '// with isCarriedForward: true so the UI can lightly highlight them.',
    '',
    `export const AUTO_FETCHED_RATES = ${JSON.stringify(snapshot, null, 2)};`,
    '',
  ].join('\n');
}

function writeGithubOutputs(values) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  const lines = Object.entries(values).map(([k, v]) => `${k}=${String(v).replace(/\r?\n/g, ' ')}`);
  fs.appendFileSync(file, lines.join('\n') + '\n', 'utf8');
}

async function runPriceUpdate() {
  console.log('☀️ [SellSolar] Starting Option B Midnight Solar Price Fetch & Fallback Update...');
  const { iso, dateStr, shortDate, updatedAt } = getPakistanDateInfo();
  console.log(`🕒 Pakistan Time: ${updatedAt} (Date: ${dateStr})`);

  const adminOverride = await fetchSupabaseAdminOverrideSheet();
  const activeBaseSheet = adminOverride?.sheet || RAW_BASE_DAILY_SHEET;
  const baselineSource = adminOverride ? 'admin_supabase' : 'repo_base';
  if (adminOverride) {
    console.log(
      `📥 Using latest Admin-published Supabase baseline (${activeBaseSheet.date || activeBaseSheet.label || shortDate}, synced ${adminOverride.publishedAt || 'live'})`
    );
  } else {
    console.log(`📄 Using repository wholesale baseline (${RAW_BASE_DAILY_SHEET?.label || shortDate})`);
  }

  console.log(`🌐 Fetching Tier 1 Pakistani sources (${TIER_1_SOURCES.length} sites)...`);
  const tier1Results = await Promise.all(
    TIER_1_SOURCES.map(async (src) => {
      const items = await collectSource(src);
      console.log(`   • [Tier 1] ${src.domain}: ${items.length} catalog entries`);
      return { domain: src.domain, items };
    })
  );
  const tier1Listings = tier1Results.flatMap((r) => r.items);

  console.log(`🌐 Fetching Tier 2 fallback Pakistani sources (${TIER_2_SOURCES.length} sites)...`);
  const tier2Results = await Promise.all(
    TIER_2_SOURCES.map(async (src) => {
      const items = await collectSource(src);
      console.log(`   • [Tier 2] ${src.domain}: ${items.length} catalog entries`);
      return { domain: src.domain, items };
    })
  );
  const tier2Listings = tier2Results.flatMap((r) => r.items);

  const categoryArrayMap = [
    ['rates', 'panel'],
    ['inverterRates', 'inverter'],
    ['batteryRates', 'battery'],
    ['essRates', 'ess'],
    ['cableRates', 'cables_wiring'],
    ['accessoriesRates', 'solar_accessories'],
    ['systemRates', 'complete_system'],
    ['structureRates', 'structure_accessories'],
  ];

  const baseSheetLabel = (activeBaseSheet?.reportDate || activeBaseSheet?.label || shortDate).split(' ')[0];
  const isNewDaySheet = shortDate !== baseSheetLabel;

  let totalChecked = 0;
  let liveMatchedCount = 0;
  let updatedCount = 0;
  let carriedForwardCount = 0;
  const sourceHits = {};
  const snapshotItems = {};

  for (const [arrayProp, category] of categoryArrayMap) {
    const list = Array.isArray(activeBaseSheet?.[arrayProp]) ? activeBaseSheet[arrayProp] : [];
    for (const item of list) {
      totalChecked++;
      const key = makeRateItemKey(category, item.brand, item.model);
      const prevAuto = PREV_AUTO_SNAPSHOT?.items?.[key];

      let match =
        category === 'panel'
          ? matchPanelListing(item, tier1Listings)
          : matchUnitListing(item, category, tier1Listings);
      let tier = match ? 'primary' : null;

      if (!match) {
        match =
          category === 'panel'
            ? matchPanelListing(item, tier2Listings)
            : matchUnitListing(item, category, tier2Listings);
        if (match) tier = 'secondary';
      }

      if (match && typeof match.rate === 'number') {
        liveMatchedCount++;
        sourceHits[match.source] = (sourceHits[match.source] || 0) + 1;

        const baseRate = typeof item.rate === 'number' ? item.rate : match.rate;
        const hasSameBaseline = prevAuto && prevAuto.baseRateAtFetch === item.rate;
        const prevAnchor =
          hasSameBaseline && typeof prevAuto.externalMarketRate === 'number'
            ? prevAuto.externalMarketRate
            : null;
        const currentDisplayedRate =
          prevAnchor !== null &&
          !prevAuto.isCarriedForward &&
          typeof prevAuto.rate === 'number'
            ? prevAuto.rate
            : baseRate;

        let nextRate = currentDisplayedRate;
        let marketDelta = 0;

        if (prevAnchor !== null) {
          const rawDelta = match.rate - prevAnchor;
          marketDelta = category === 'panel'
            ? Number(rawDelta.toFixed(2))
            : Math.round(rawDelta);

          if (category === 'panel') {
            if (Math.abs(marketDelta) < 0.15 || Math.abs(marketDelta) > 2.5) {
              marketDelta = 0;
            }
          } else if (Math.abs(marketDelta) < 100 || Math.abs(rawDelta) / prevAnchor > 0.2) {
            marketDelta = 0;
          }

          if (marketDelta !== 0 && typeof currentDisplayedRate === 'number') {
            nextRate = category === 'panel'
              ? Number(Math.max(25, currentDisplayedRate + marketDelta).toFixed(2))
              : Math.max(100, Math.round(currentDisplayedRate + marketDelta));
          }
        }

        const changed = typeof currentDisplayedRate === 'number' && nextRate !== currentDisplayedRate;
        if (changed) updatedCount++;

        const changeVal = changed
          ? Number((nextRate - currentDisplayedRate).toFixed(category === 'panel' ? 2 : 0))
          : (item.change || 0);

        const statusVal = changed
          ? (changeVal > 0 ? 'up' : 'down')
          : (item.status || 'stable');

        snapshotItems[key] = {
          category,
          brand: item.brand,
          model: item.model,
          rate: nextRate,
          prevRate: changed ? currentDisplayedRate : (item.prevRate ?? currentDisplayedRate),
          change: changeVal,
          status: statusVal,
          baseRateAtFetch: item.rate,
          externalMarketRate: match.rate,
          isCarriedForward: false,
          rateSource: match.source,
          matchedUrl: match.url,
          tier,
          updatedAt: iso,
        };
      } else {
        carriedForwardCount++;
        const carriedRate =
          prevAuto && typeof prevAuto.rate === 'number' && prevAuto.baseRateAtFetch === item.rate
            ? prevAuto.rate
            : item.rate;
        snapshotItems[key] = {
          category,
          brand: item.brand,
          model: item.model,
          rate: carriedRate,
          prevRate: isNewDaySheet ? carriedRate : item.prevRate,
          change: isNewDaySheet ? 0 : (item.change || 0),
          status: isNewDaySheet ? 'stable' : (item.status || 'stable'),
          baseRateAtFetch: item.rate,
          externalMarketRate: prevAuto?.externalMarketRate ?? null,
          isCarriedForward: true,
          rateSource: 'carried_forward',
          matchedUrl: null,
          tier: null,
          updatedAt: iso,
        };
      }
    }
  }

  const activeSourcesChecked = [
    ...tier1Results.filter((r) => r.items.length > 0).map((r) => r.domain),
    ...tier2Results.filter((r) => r.items.length > 0).map((r) => r.domain),
  ];

  const snapshot = {
    lastRunIso: iso,
    reportDate: shortDate,
    version: `auto-${shortDate}-${liveMatchedCount}-${updatedCount}`,
    summary: {
      totalChecked,
      updatedCount,
      liveMatchedCount,
      carriedForwardCount,
      sourcesChecked: activeSourcesChecked,
      primarySources: TIER_1_SOURCES.map((s) => s.domain),
      secondarySources: TIER_2_SOURCES.map((s) => s.domain),
      sourceHits,
    },
    items: snapshotItems,
  };

  const autoFilePath = path.join(rootDir, 'src', 'data', 'autoFetchedRates.js');
  fs.writeFileSync(autoFilePath, formatAutoFetchedModule(snapshot), 'utf8');
  console.log(
    `✅ Saved Option B snapshot -> live matched: ${liveMatchedCount}/${totalChecked}, price updates: ${updatedCount}, carried forward (highlighted): ${carriedForwardCount}`
  );

  const logFilePath = path.join(rootDir, 'public', 'daily_price_update_log.json');
  let logData = [];
  try {
    if (fs.existsSync(logFilePath)) {
      logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
    }
  } catch {
    logData = [];
  }

  const priceStatus = updatedCount > 0 ? 'UPDATED' : 'NO_CHANGE';

  const newLogEntry = {
    updated_at: updatedAt,
    iso,
    date_str: dateStr,
    panels_count: (activeBaseSheet?.rates || []).length,
    inverters_count: (activeBaseSheet?.inverterRates || []).length,
    batteries_count: (activeBaseSheet?.batteryRates || []).length,
    ess_count: (activeBaseSheet?.essRates || []).length,
    systems_count: (activeBaseSheet?.systemRates || []).length,
    structures_count: (activeBaseSheet?.structureRates || []).length,
    customer_dealer_ads_protected: true,
    ads_modified_count: 0,
    status: 'SUCCESS',
    price_status: priceStatus,
    price_report_date: shortDate,
    latest_price_sheet: baseSheetLabel,
    baseline_source: baselineSource,
    auto_fetch_mode: 'OPTION_B_PRIMARY_THEN_SECONDARY',
    auto_fetch_live_matched: liveMatchedCount,
    auto_fetch_updated_count: updatedCount,
    carried_forward_count: carriedForwardCount,
    sources_checked: activeSourcesChecked,
    source_hits: sourceHits,
    prices_carried_forward: carriedForwardCount > 0,
  };

  logData.unshift(newLogEntry);
  if (logData.length > 30) {
    logData = logData.slice(0, 30);
  }
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2), 'utf8');
  console.log('✅ Log recorded in public/daily_price_update_log.json');

  writeGithubOutputs({
    price_status: priceStatus,
    report_date: shortDate,
    latest_sheet: baseSheetLabel,
    live_matched_count: liveMatchedCount,
    auto_updated_count: updatedCount,
    carried_forward_count: carriedForwardCount,
  });

  console.log('🛡️ Customer & Dealer Ads Status: 100% Protected (0 ads modified)');
  console.log('🎉 Option B Midnight Solar Price Update completed successfully!');
}

runPriceUpdate().catch((err) => {
  console.error('❌ Error updating daily solar prices:', err);
  process.exit(1);
});
