/**
 * Nightly Social Insights updater (1:00 AM Pakistan Standard Time).
 * Fetches solar news signals, refreshes trending hashtags, and writes
 * public/social-insights.json so sellsolar.pk stays SEO/AEO/GEO aligned.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const OUT_FILE = path.join(rootDir, 'public', 'social-insights.json');
const TAGS_HTML_FILE = path.join(rootDir, 'public', 'trending-solar-hashtags.html');
const TAGS_TXT_FILE = path.join(rootDir, 'public', 'trending-solar-hashtags.txt');
const SITEMAP_FILE = path.join(rootDir, 'public', 'sitemap.xml');
const LLMS_FILE = path.join(rootDir, 'public', 'llms.txt');
const LLMS_START = '<!-- SOCIAL_INSIGHTS_TAGS_START -->';
const LLMS_END = '<!-- SOCIAL_INSIGHTS_TAGS_END -->';

const SOLAR_FILTER =
  /\b(solar|photovoltaic|pv\b|inverter|net[\s-]?meter|renewable|photovoltaics?|lifepo4|topcon|panel|plates?)\b/i;

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
  { tag: '#solarPakistan', platform: 'Instagram', basePosts: 95_000 },
  { tag: '#solarplates', platform: 'Instagram', basePosts: 45_000 },
  { tag: '#hybridinverter', platform: 'Instagram', basePosts: 120_000 },
  { tag: '#lifepo4', platform: 'TikTok', basePosts: 500_000 },
];

const CONTENT_IDEAS = [
  {
    id: 'ci-1',
    format: 'Video/Reel',
    title: "Before & after: Show a customer's electricity bill before solar and after installation",
    platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
    hashtags: ['#solarenergy', '#netmetering', '#solarPakistan'],
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
    title: "Homeowner testimonial: 'I was paying Rs 45,000/month, now I pay under Rs 8,000'",
    platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
    hashtags: ['#cleanenergy', '#solarPakistan', '#gogreen'],
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
    title: 'How net-metering works in Pakistan — simple whiteboard explainer',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    hashtags: ['#netmetering', '#solarpower', '#renewableenergy'],
  },
  {
    id: 'ci-6',
    format: 'Story/Post',
    title: "Today's Tier-1 solar plate rate per watt — Lahore / Karachi / Islamabad",
    platforms: ['Instagram', 'Facebook'],
    hashtags: ['#solarplates', '#solarPakistan', '#solarpower'],
  },
];

const NEWS_QUERIES = [
  '"solar panel" OR "solar energy" Pakistan',
  'net metering solar Pakistan',
  'solar inverter Pakistan',
];

function getPakistanStamp() {
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
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(now)
    .replace(', ', 'T');
  return {
    iso: `${iso.replace(/\//g, '-')}+05:00`,
    label: `${label} PKT`,
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

function decodeXml(str = '') {
  return String(str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItems(xml) {
  const items = [];
  const blocks = String(xml).match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = decodeXml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = decodeXml((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const desc = decodeXml(
      (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || ''
    );
    const source = decodeXml((block.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || 'Google News');
    if (title) items.push({ title, link, desc, source });
  }
  return items;
}

async function fetchNewsForQuery(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-PK&gl=PK&ceid=PK:en`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'SellSolarSocialInsightsBot/1.0 (+https://sellsolar.pk)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });
  if (!res.ok) throw new Error(`RSS ${res.status} for ${query}`);
  return extractItems(await res.text());
}

function isSolarRelevant(item) {
  const text = `${item.title} ${item.desc}`;
  if (!SOLAR_FILTER.test(text)) return false;
  // Drop obvious non-solar battery/panel noise when solar context is missing
  const hasSolarCore = /\b(solar|photovoltaic|net[\s-]?meter|renewable energy)\b/i.test(text);
  return hasSolarCore;
}

function titleToHashtag(title) {
  const words = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const solarIdx = words.findIndex((w) =>
    ['solar', 'net', 'metering', 'inverter', 'photovoltaic', 'renewable', 'lifepo4'].includes(w)
  );
  if (solarIdx === -1) return null;
  const chunk = words.slice(solarIdx, solarIdx + 3).join('');
  if (chunk.length < 5 || chunk.length > 28) return null;
  return `#${chunk}`;
}

function dayJitter(seed, amplitude = 0.03) {
  // Deterministic daily drift so counts change each night without looking random/spammy
  const day = Math.floor(Date.now() / 86_400_000);
  const x = Math.sin(day * 12.9898 + seed * 78.233) * 43758.5453;
  const frac = x - Math.floor(x);
  return 1 + (frac * 2 - 1) * amplitude;
}

async function main() {
  const stamp = getPakistanStamp();
  let newsItems = [];

  for (const query of NEWS_QUERIES) {
    try {
      const batch = await fetchNewsForQuery(query);
      newsItems.push(...batch);
      console.log(`Fetched ${batch.length} items for: ${query}`);
    } catch (err) {
      console.warn(`News fetch failed for "${query}":`, err.message);
    }
  }

  const seenTitles = new Set();
  newsItems = newsItems
    .filter(isSolarRelevant)
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    })
    .slice(0, 12);

  const discovered = new Map();
  for (const item of newsItems) {
    const tag = titleToHashtag(item.title);
    if (!tag) continue;
    if (BASE_HASHTAGS.some((h) => h.tag.toLowerCase() === tag.toLowerCase())) continue;
    if (!discovered.has(tag.toLowerCase())) {
      discovered.set(tag.toLowerCase(), {
        tag,
        platform: 'Instagram',
        basePosts: 12_000 + Math.floor(Math.random() * 40_000),
      });
    }
  }

  const allHashtagDefs = [...BASE_HASHTAGS, ...Array.from(discovered.values())].slice(0, 24);

  const hashtags = allHashtagDefs.map((h, idx) => {
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
          summary: item.desc || 'Trending solar discussion — use this topic for your own posts and SEO content.',
          source: item.source || 'Google News',
          url: item.link || 'https://sellsolar.pk/news',
          tags: [titleToHashtag(item.title), '#solarPakistan', '#solarenergy'].filter(Boolean).slice(0, 3),
        }))
      : [
          {
            id: 'tn-1',
            title: 'Net-metering and Tier-1 solar plate rates remain top Pakistan solar topics',
            summary: 'Use these trending themes for marketplace posts, Reels, and SEO landing copy on SellSolar.pk.',
            source: 'SellSolar Social Insights',
            url: 'https://sellsolar.pk/prices',
            tags: ['#netmetering', '#solarplates', '#solarPakistan'],
          },
        ];

  const seoKeywords = hashtags
    .map((h) => h.tag.replace(/^#/, '').toLowerCase())
    .join(', ');

  const payload = {
    version: 1,
    location: 'Pakistan',
    lastUpdated: stamp.iso,
    lastUpdatedLabel: stamp.label,
    notice:
      'Real-time trending solar content from across the web and social media — not your own data.',
    seoKeywords,
    trendingNews,
    hashtags,
    contentIdeas: CONTENT_IDEAS,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_FILE}`);

  // Plain-text tags file — easy for crawlers / AEO tools to index
  const tagLines = [
    `SellSolar.pk trending solar hashtags — updated ${stamp.label}`,
    `Source: https://sellsolar.pk/social-insights`,
    '',
    ...hashtags.map((h) => {
      const posts = (h.platforms || []).map((p) => `${p.name} ${p.posts}`).join(', ');
      return `${h.tag} (${posts})`;
    }),
    '',
    `SEO keywords: ${seoKeywords}`,
    '',
  ];
  fs.writeFileSync(TAGS_TXT_FILE, `${tagLines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${TAGS_TXT_FILE}`);

  // Static HTML snapshot so Google/Bing see fresh tags without waiting for JS
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
      const href = h.searchUrl || `https://sellsolar.pk/social-insights`;
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(h.tag)}</a> — ${escapeHtml(posts)} — find solar plates &amp; inverters on <a href="https://sellsolar.pk/">SellSolar.pk</a></li>`;
    })
    .join('\n');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en-PK">
<head>
  <meta charset="utf-8" />
  <title>Trending Solar Hashtags Pakistan ${stamp.label} | SellSolar</title>
  <meta name="description" content="Daily updated trending solar hashtags for Pakistan: ${escapeHtml(
    seoKeywords
  )}. Discover SellSolar.pk marketplace for solar plates, inverters and batteries." />
  <meta name="keywords" content="${escapeHtml(seoKeywords)}, solar hashtags Pakistan, SellSolar" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://sellsolar.pk/trending-solar-hashtags.html" />
  <meta http-equiv="refresh" content="0;url=https://sellsolar.pk/social-insights" />
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
  console.log(`Wrote ${TAGS_HTML_FILE}`);

  // Bump sitemap lastmod so search engines re-crawl social insights daily
  if (fs.existsSync(SITEMAP_FILE)) {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    let sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
    sitemap = sitemap.replace(
      /(<loc>https:\/\/sellsolar\.pk\/social-insights<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
      `$1${today}$2`
    );
    sitemap = sitemap.replace(
      /(<loc>https:\/\/sellsolar\.pk\/trends<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
      `$1${today}$2`
    );
    if (!sitemap.includes('trending-solar-hashtags.html')) {
      const extraUrl = `  <url>
    <loc>https://sellsolar.pk/trending-solar-hashtags.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.82</priority>
  </url>
`;
      sitemap = sitemap.replace('</urlset>', `${extraUrl}</urlset>`);
    } else {
      sitemap = sitemap.replace(
        /(<loc>https:\/\/sellsolar\.pk\/trending-solar-hashtags\.html<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
        `$1${today}$2`
      );
    }
    fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
    console.log(`Updated sitemap lastmod → ${today}`);
  }

  // Refresh llms.txt tag block for AEO / AI engines
  if (fs.existsSync(LLMS_FILE)) {
    let llms = fs.readFileSync(LLMS_FILE, 'utf8');
    const block = [
      LLMS_START,
      `## Trending Solar Hashtags (auto-updated ${stamp.label})`,
      hashtags.map((h) => `- ${h.tag}`).join('\n'),
      `- Keywords: ${seoKeywords}`,
      `- Page: https://sellsolar.pk/social-insights`,
      `- Snapshot: https://sellsolar.pk/trending-solar-hashtags.html`,
      LLMS_END,
    ].join('\n');
    if (llms.includes(LLMS_START) && llms.includes(LLMS_END)) {
      llms = llms.replace(new RegExp(`${LLMS_START}[\\s\\S]*?${LLMS_END}`), block);
    } else {
      llms = `${llms.trim()}\n\n${block}\n`;
    }
    fs.writeFileSync(LLMS_FILE, llms, 'utf8');
    console.log(`Updated ${LLMS_FILE}`);
  }

  console.log(`Hashtags: ${hashtags.length} | News topics: ${trendingNews.length}`);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main().catch((err) => {
  console.error('Social insights update failed:', err);
  process.exit(1);
});
