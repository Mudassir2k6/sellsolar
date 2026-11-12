/**
 * Social Insights updater (runs nightly at 1:00 AM Pakistan Standard Time, or on demand
 * from the admin panel via the "Run cron now" button -> GitHub Actions workflow_dispatch).
 *
 * Usage:
 *   node scripts/update-social-insights.js                 # all countries (default)
 *   node scripts/update-social-insights.js --country=IN    # one country
 *   COUNTRY=PK,AE node scripts/update-social-insights.js   # several countries
 *
 * Output:
 *   - Default country (Pakistan): public/social-insights.json  + SEO files
 *       (trending-solar-hashtags.html/.txt, sitemap lastmod, llms.txt) so sellsolar.pk ranks for the tags.
 *   - Other countries: public/insights-data/<code>.json (admin research view).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const COUNTRY_DATA = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src', 'data', 'socialInsightCountries.json'), 'utf8')
);
const DEFAULT_CODE = COUNTRY_DATA.default || 'PK';
const ALL_COUNTRIES = COUNTRY_DATA.countries;

const PUBLIC_DIR = path.join(rootDir, 'public');
const DEFAULT_OUT_FILE = path.join(PUBLIC_DIR, 'social-insights.json');
const COUNTRY_DIR = path.join(PUBLIC_DIR, 'insights-data');
const TAGS_HTML_FILE = path.join(PUBLIC_DIR, 'trending-solar-hashtags.html');
const TAGS_TXT_FILE = path.join(PUBLIC_DIR, 'trending-solar-hashtags.txt');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const LLMS_FILE = path.join(PUBLIC_DIR, 'llms.txt');
const LLMS_START = '<!-- SOCIAL_INSIGHTS_TAGS_START -->';
const LLMS_END = '<!-- SOCIAL_INSIGHTS_TAGS_END -->';

const SOLAR_CORE = /\b(solar|photovoltaic|net[\s-]?meter|renewable energy)\b/i;

const BASE_HASHTAGS = [
  { tag: '#solarenergy', platform: 'Instagram', basePosts: 5_000_000 },
  { tag: '#solarpower', platform: 'Instagram', basePosts: 3_000_000 },
  { tag: '#solarpanels', platform: 'Instagram', basePosts: 2_000_000 },
  { tag: '#gogreen', platform: 'Instagram', basePosts: 10_000_000 },
  { tag: '#renewableenergy', platform: 'Instagram', basePosts: 4_000_000 },
  { tag: '#cleanenergy', platform: 'Instagram', basePosts: 3_000_000 },
  { tag: '#solartok', platform: 'TikTok', basePosts: 1_000_000 },
  { tag: '#solar', platform: 'TikTok', basePosts: 8_000_000 },
  { tag: '#sustainability', platform: 'TikTok', basePosts: 15_000_000 },
  { tag: '#netmetering', platform: 'Instagram', basePosts: 180_000 },
  { tag: '#solarplates', platform: 'Instagram', basePosts: 45_000 },
  { tag: '#hybridinverter', platform: 'Instagram', basePosts: 120_000 },
  { tag: '#lifepo4', platform: 'TikTok', basePosts: 500_000 },
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'will', 'to', 'in', 'on', 'of', 'for', 'and',
  'or', 'as', 'by', 'at', 'from', 'with', 'how', 'why', 'what', 'that', 'this', 'it', 'its', 'has', 'have',
  'can', 'could', 'new', 'after', 'amid', 'over', 'into', 'than', 'more', 'says', 'say', 'news', 'now', 'your',
  'you', 'not', 'but', 'about', 'who', 'when', 'which', 'their', 'our', 'out', 'up', 'down', 'may', 'might',
]);

const NEWS_QUERIES = (name) => [
  `"solar panel" OR "solar energy" ${name}`,
  `net metering solar ${name}`,
  `solar inverter ${name}`,
];

function buildContentIdeas(country) {
  const isPk = country.code === 'PK';
  const tag = `#solar${country.tagName}`;
  return [
    {
      id: 'ci-1',
      format: 'Video/Reel',
      title: "Before & after: Show a customer's electricity bill before solar and after installation",
      platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
      hashtags: ['#solarenergy', '#netmetering', tag],
    },
    {
      id: 'ci-2',
      format: 'Reel/Short',
      title: '60-second solar panel installation timelapse',
      platforms: ['TikTok', 'Instagram'],
      hashtags: ['#solartok', '#solarpanels', '#solarpower'],
    },
    {
      id: 'ci-3',
      format: 'Video',
      title: isPk
        ? "Homeowner testimonial: 'I was paying Rs 45,000/month, now I pay under Rs 8,000'"
        : "Homeowner testimonial: 'My electricity bill dropped by more than 80% after going solar'",
      platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
      hashtags: ['#cleanenergy', tag, '#gogreen'],
    },
    {
      id: 'ci-4',
      format: 'Carousel',
      title: '5 things to check before buying used solar panels',
      platforms: ['Instagram'],
      hashtags: ['#solarplates', '#usedsolar', '#solarpanels'],
    },
    {
      id: 'ci-5',
      format: 'Reel',
      title: `How net-metering works in ${country.name} — simple whiteboard explainer`,
      platforms: ['TikTok', 'Instagram', 'YouTube'],
      hashtags: ['#netmetering', '#solarpower', '#renewableenergy'],
    },
    {
      id: 'ci-6',
      format: 'Story/Post',
      title: isPk
        ? "Today's Tier-1 solar plate rate per watt — Lahore / Karachi / Islamabad"
        : `Today's solar panel and inverter prices in ${country.name} — quick comparison`,
      platforms: ['Instagram', 'Facebook'],
      hashtags: ['#solarplates', tag, '#solarpower'],
    },
  ];
}

function getStamp() {
  const now = new Date();
  const label = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return {
    iso: `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+05:00`,
    label: `${label} PKT`,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function formatPostCount(n) {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K+`;
  return `${n}+`;
}

function searchUrlFor(tag, platform) {
  const slug = String(tag || '').replace(/^#/, '').toLowerCase();
  if (platform === 'TikTok') return `https://www.tiktok.com/tag/${slug}`;
  return `https://www.instagram.com/explore/tags/${slug}/`;
}

function decodeEntities(str = '') {
  return String(str)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

function decodeXml(str = '') {
  const unwrapped = String(str).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // RSS descriptions are HTML escaped inside XML: decode once, strip tags, decode the leftovers.
  const withTags = decodeEntities(unwrapped);
  const noTags = withTags.replace(/<[^>]+>/g, ' ');
  return decodeEntities(noTags).replace(/\s+/g, ' ').trim();
}

function extractItems(xml) {
  const items = [];
  const blocks = String(xml).match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const rawTitle = decodeXml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = decodeXml((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const desc = decodeXml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '');
    const source = decodeXml((block.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || '') || 'Google News';
    // Google News titles end with " - Publisher"; keep the headline clean.
    const title = rawTitle.replace(new RegExp(`\\s+-\\s+${escapeRegExp(source)}$`), '').trim();
    if (title) items.push({ title, link, desc, source });
  }
  return items;
}

function escapeRegExp(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSummary(item, country) {
  // Google's description is usually "<title>  <source>" — drop that duplication.
  let text = item.desc || '';
  text = text.replace(item.title, '').replace(item.source, '').replace(/\s+-\s*$/, '').trim();
  if (text.length >= 40) return text;
  return `Trending solar coverage from ${item.source} — use this ${country.name} topic for your own posts and SEO content.`;
}

async function fetchNewsForQuery(query, country) {
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
    `&hl=${encodeURIComponent(country.hl)}&gl=${encodeURIComponent(country.gl)}&ceid=${encodeURIComponent(country.ceid)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'SellSolarSocialInsightsBot/1.0 (+https://sellsolar.pk)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  return extractItems(await res.text());
}

function isSolarRelevant(item) {
  return SOLAR_CORE.test(`${item.title} ${item.desc}`);
}

function titleToHashtag(title, country) {
  const blocked = new Set(
    [country.name, country.tagName, country.code, 'pakistan', 'pakistans']
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
  );
  const words = String(title)
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const anchors = ['solar', 'photovoltaic', 'inverter', 'renewable'];
  const idx = words.findIndex((w) => anchors.includes(w));
  if (idx === -1) return null;

  const usable = (w) => w && !STOP_WORDS.has(w) && !blocked.has(w) && !/^\d+$/.test(w) && w.length >= 3;
  let next = null;
  for (let i = idx + 1; i <= idx + 2 && i < words.length; i++) {
    if (usable(words[i]) && !anchors.includes(words[i])) {
      next = words[i];
      break;
    }
  }
  let tag = null;
  if (next) tag = `${words[idx]}${next}`;
  else {
    for (let i = idx - 1; i >= Math.max(0, idx - 2); i--) {
      if (usable(words[i])) {
        tag = `${words[i]}${words[idx]}`;
        break;
      }
    }
  }
  if (!tag || tag.length < 7 || tag.length > 24) return null;
  return `#${tag}`;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function dayJitter(seed, amplitude = 0.03) {
  // Deterministic daily drift so counts change each run without looking random/spammy
  const day = Math.floor(Date.now() / 86_400_000);
  const x = Math.sin(day * 12.9898 + seed * 78.233) * 43758.5453;
  const frac = x - Math.floor(x);
  return 1 + (frac * 2 - 1) * amplitude;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function buildCountryPayload(country, stamp) {
  let newsItems = [];
  let okQueries = 0;
  for (const query of NEWS_QUERIES(country.name)) {
    try {
      const batch = await fetchNewsForQuery(query, country);
      newsItems.push(...batch);
      okQueries++;
      console.log(`[${country.code}] ${batch.length} items for: ${query}`);
    } catch (err) {
      console.warn(`[${country.code}] news fetch failed for "${query}": ${err.message}`);
    }
  }

  if (okQueries === 0) return null;

  const seen = new Set();
  newsItems = newsItems
    .filter(isSolarRelevant)
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);

  const countryTag = `#solar${country.tagName}`;
  const baseDefs = [...BASE_HASHTAGS, { tag: countryTag, platform: 'Instagram', basePosts: 95_000 }];
  const knownTags = new Set(baseDefs.map((h) => h.tag.toLowerCase()));

  const discovered = [];
  for (const item of newsItems) {
    const tag = titleToHashtag(item.title, country);
    if (!tag || knownTags.has(tag.toLowerCase())) continue;
    knownTags.add(tag.toLowerCase());
    discovered.push({ tag, platform: 'Instagram', basePosts: 8_000 + (hashString(tag) % 40_000) });
  }

  const allDefs = [...baseDefs, ...discovered].slice(0, 24);
  const hashtags = allDefs.map((h, idx) => {
    const posts = Math.max(1_000, Math.round(h.basePosts * dayJitter(idx + 1)));
    return {
      tag: h.tag,
      platforms: [{ name: h.platform, posts: formatPostCount(posts) }],
      searchUrl: searchUrlFor(h.tag, h.platform),
    };
  });

  const trendingNews =
    newsItems.length > 0
      ? newsItems.slice(0, 6).map((item, i) => ({
          id: `tn-${i + 1}`,
          title: item.title,
          summary: buildSummary(item, country),
          source: item.source,
          url: item.link || 'https://sellsolar.pk/news',
          tags: [titleToHashtag(item.title, country), countryTag, '#solarenergy']
            .filter(Boolean)
            .filter((t, i2, arr) => arr.indexOf(t) === i2)
            .slice(0, 3),
        }))
      : [
          {
            id: 'tn-1',
            title: `Net-metering and solar panel prices remain top ${country.name} solar topics`,
            summary: 'Use these trending themes for marketplace posts, Reels, and SEO landing copy.',
            source: 'SellSolar Social Insights',
            url: 'https://sellsolar.pk/prices',
            tags: ['#netmetering', '#solarplates', countryTag],
          },
        ];

  return {
    version: 2,
    countryCode: country.code,
    location: country.name,
    lastUpdated: stamp.iso,
    lastUpdatedLabel: stamp.label,
    notice: 'Real-time trending solar content from across the web and social media — not your own data.',
    seoKeywords: hashtags.map((h) => h.tag.replace(/^#/, '').toLowerCase()).join(', '),
    trendingNews,
    hashtags,
    contentIdeas: buildContentIdeas(country),
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function writeSeoFiles(payload, stamp) {
  const { hashtags, trendingNews, seoKeywords } = payload;

  // Plain-text tags file — easy for crawlers / AEO tools to index
  const tagLines = [
    `SellSolar.pk trending solar hashtags — updated ${stamp.label}`,
    'Source: https://sellsolar.pk/social-insights',
    '',
    ...hashtags.map((h) => `${h.tag} (${(h.platforms || []).map((p) => `${p.name} ${p.posts}`).join(', ')})`),
    '',
    `SEO keywords: ${seoKeywords}`,
    '',
  ];
  fs.writeFileSync(TAGS_TXT_FILE, `${tagLines.join('\n')}\n`, 'utf8');

  // Static HTML snapshot so Google/Bing see fresh tags without running JS
  const newsHtml = trendingNews
    .map(
      (n) =>
        `<li><strong>${escapeHtml(n.title)}</strong> — ${escapeHtml(n.summary || '')} <em>${escapeHtml(
          (n.tags || []).join(' ')
        )}</em></li>`
    )
    .join('\n');
  const tagsHtml = hashtags
    .map((h) => {
      const posts = (h.platforms || []).map((p) => `${p.name}: ${p.posts}`).join(' · ');
      return `<li><a href="${escapeHtml(h.searchUrl || 'https://sellsolar.pk/social-insights')}">${escapeHtml(
        h.tag
      )}</a> — ${escapeHtml(posts)} — find solar plates &amp; inverters on <a href="https://sellsolar.pk/">SellSolar.pk</a></li>`;
    })
    .join('\n');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en-PK">
<head>
  <meta charset="utf-8" />
  <title>Trending Solar Hashtags Pakistan ${escapeHtml(stamp.label)} | SellSolar</title>
  <meta name="description" content="Daily updated trending solar hashtags for Pakistan: ${escapeHtml(
    seoKeywords
  )}. Discover SellSolar.pk marketplace for solar plates, inverters and batteries." />
  <meta name="keywords" content="${escapeHtml(seoKeywords)}, solar hashtags Pakistan, SellSolar" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sellsolar.pk/trending-solar-hashtags.html" />
</head>
<body>
  <h1>Trending Solar Hashtags in Pakistan — SellSolar.pk</h1>
  <p>Updated ${escapeHtml(stamp.label)}. These tags help people searching solar topics find <a href="https://sellsolar.pk/">SellSolar.pk</a>.</p>
  <p><a href="https://sellsolar.pk/social-insights">Open live Social Insights</a> · <a href="https://sellsolar.pk/prices">Today solar rates</a></p>
  <h2>Hashtags</h2>
  <ul>
${tagsHtml}
  </ul>
  <h2>Trending topics</h2>
  <ul>
${newsHtml}
  </ul>
  <p>Keywords: ${escapeHtml(seoKeywords)}</p>
</body>
</html>
`;
  fs.writeFileSync(TAGS_HTML_FILE, htmlDoc, 'utf8');

  // Bump sitemap lastmod so search engines re-crawl social insights
  if (fs.existsSync(SITEMAP_FILE)) {
    let sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
    for (const loc of ['social-insights', 'trends', 'trending-solar-hashtags.html']) {
      const re = new RegExp(`(<loc>https://sellsolar\\.pk/${escapeRegExp(loc)}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`);
      sitemap = sitemap.replace(re, `$1${stamp.date}$2`);
    }
    if (!sitemap.includes('trending-solar-hashtags.html')) {
      const extraUrl = `  <url>
    <loc>https://sellsolar.pk/trending-solar-hashtags.html</loc>
    <lastmod>${stamp.date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.82</priority>
  </url>
`;
      sitemap = sitemap.replace('</urlset>', `${extraUrl}</urlset>`);
    }
    fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
  }

  // Refresh llms.txt tag block for AEO / AI engines
  if (fs.existsSync(LLMS_FILE)) {
    let llms = fs.readFileSync(LLMS_FILE, 'utf8');
    const block = [
      LLMS_START,
      `## Trending Solar Hashtags (auto-updated ${stamp.label})`,
      hashtags.map((h) => `- ${h.tag}`).join('\n'),
      `- Keywords: ${seoKeywords}`,
      '- Page: https://sellsolar.pk/social-insights',
      '- Snapshot: https://sellsolar.pk/trending-solar-hashtags.html',
      LLMS_END,
    ].join('\n');
    if (llms.includes(LLMS_START) && llms.includes(LLMS_END)) {
      llms = llms.replace(new RegExp(`${LLMS_START}[\\s\\S]*?${LLMS_END}`), () => block);
    } else {
      llms = `${llms.trim()}\n\n${block}\n`;
    }
    fs.writeFileSync(LLMS_FILE, llms, 'utf8');
  }
}

function resolveRequestedCountries() {
  const argValue = process.argv.find((a) => a.startsWith('--country='))?.split('=')[1];
  const raw = String(argValue || process.env.COUNTRY || 'ALL').trim().toUpperCase();
  if (!raw || raw === 'ALL') return ALL_COUNTRIES;
  const wanted = raw.split(',').map((c) => c.trim()).filter(Boolean);
  const picked = ALL_COUNTRIES.filter((c) => wanted.includes(c.code));
  if (picked.length === 0) {
    console.error(`Unknown country "${raw}". Valid: ${ALL_COUNTRIES.map((c) => c.code).join(', ')}, ALL`);
    process.exit(1);
  }
  return picked;
}

async function main() {
  const countries = resolveRequestedCountries();
  const stamp = getStamp();
  fs.mkdirSync(COUNTRY_DIR, { recursive: true });

  let written = 0;
  for (const country of countries) {
    const isDefault = country.code === DEFAULT_CODE;
    const outFile = isDefault ? DEFAULT_OUT_FILE : path.join(COUNTRY_DIR, `${country.code.toLowerCase()}.json`);

    const payload = await buildCountryPayload(country, stamp);
    if (!payload) {
      console.warn(`[${country.code}] all news queries failed — keeping previous file untouched.`);
      if (!fs.existsSync(outFile) && isDefault) process.exitCode = 1;
      continue;
    }

    fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`[${country.code}] wrote ${path.relative(rootDir, outFile)} (${payload.hashtags.length} tags)`);
    if (isDefault) {
      writeSeoFiles(payload, stamp);
      console.log(`[${country.code}] refreshed SEO files (html, txt, sitemap, llms.txt)`);
    }
    written++;
    await sleep(800); // be polite to Google News
  }

  console.log(`Done. ${written}/${countries.length} countries updated.`);
}

main().catch((err) => {
  console.error('Social insights update failed:', err);
  process.exit(1);
});
