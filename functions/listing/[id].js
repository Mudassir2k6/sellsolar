/**
 * Cloudflare Pages Function: /listing/:id
 *
 * The site is a static export, so every /listing/<id> URL is served the same app shell
 * (`_redirects`: /listing/* -> /index.html 200). Crawlers that do not run JavaScript
 * (WhatsApp, Facebook, Telegram, X, LinkedIn link previews) therefore saw generic meta tags.
 *
 * This function looks the ad up in Supabase (public anon, read-only) and rewrites <head>
 * with the real title / description / price / image + Product JSON-LD before the response
 * leaves the edge. The SPA hydrates and behaves exactly as before. On ANY failure we fall
 * back to the untouched shell, so the page can never break because of this function.
 */

const SITE_URL = 'https://sellsolar.pk';
const SITE_NAME = 'SellSolar';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const SUPABASE_URL = 'https://zgfycrnmivfybbclflwf.supabase.co';
// Public anon key (already shipped in the client bundle; row access is governed by RLS).
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CATEGORY_LABELS = {
  panel: 'Solar Panels',
  inverter: 'Solar Inverters',
  battery: 'Solar Batteries',
  complete_system: 'Complete Solar Systems',
  ess: 'Energy Storage (ESS)',
  structure_accessories: 'Structures & Accessories',
  cables_wiring: 'Solar Cables & Wiring',
  solar_accessories: 'Protection & Accessories',
};

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

async function fetchListing(id) {
  const base = `${SUPABASE_URL}/rest/v1/solar_listings?id=eq.${encodeURIComponent(id)}&limit=1`;
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Accept: 'application/json' };
  const selects = [
    'id,title,brand,category,city,price,condition,description,image_url,image_urls,seller_name,is_sold,is_deleted,status',
    'id,title,brand,category,city,price,condition,description,image_url,seller_name',
  ];
  for (const select of selects) {
    try {
      const res = await fetch(`${base}&select=${select}`, {
        headers,
        signal: AbortSignal.timeout(2500),
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      if (!res.ok) continue;
      const rows = await res.json();
      return Array.isArray(rows) ? rows[0] || null : null;
    } catch {
      // try next select / give up
    }
  }
  return undefined; // unknown (network/schema problem) -> leave shell untouched
}

function pickImage(listing) {
  const candidates = [];
  if (typeof listing.image_url === 'string') candidates.push(listing.image_url);
  if (Array.isArray(listing.image_urls)) candidates.push(...listing.image_urls);
  const first = candidates.map((s) => (typeof s === 'string' ? s.trim() : '')).find((s) => /^https?:\/\//i.test(s));
  return first || DEFAULT_OG_IMAGE;
}

function buildHeadHtml(listing, url) {
  const city = listing.city ? ` in ${listing.city}` : '';
  const brand =
    listing.brand && !String(listing.title).toLowerCase().includes(String(listing.brand).toLowerCase())
      ? `${listing.brand} `
      : '';
  const title = `${listing.title}${city} | ${SITE_NAME}`.slice(0, 60);
  const price = Number(listing.price);
  const priceText = price > 0 ? ` Price: PKR ${price.toLocaleString('en-PK')}.` : '';
  const description = `${brand}${listing.title}${city}.${priceText} Buy solar equipment on SellSolar, Pakistan's solar marketplace.`.slice(0, 200);
  const image = pickImage(listing);
  const inactive = listing.is_deleted === true || listing.status === 'deleted' || listing.status === 'disabled';
  const robots = inactive
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const keywords = [listing.brand, CATEGORY_LABELS[listing.category] || listing.category, listing.city, 'solar Pakistan', SITE_NAME]
    .filter(Boolean)
    .join(', ');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: (listing.description || description).slice(0, 5000),
    image,
    sku: listing.id,
    category: CATEGORY_LABELS[listing.category] || listing.category,
    ...(listing.brand ? { brand: { '@type': 'Brand', name: listing.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: price > 0 ? price : 0,
      availability: listing.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: listing.condition === 'used' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: listing.seller_name || SITE_NAME },
    },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Listings', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: url },
    ],
  };
  const ld = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

  const html = [
    `<meta name="description" content="${esc(description)}"/>`,
    `<meta name="keywords" content="${esc(keywords)}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    `<meta name="googlebot" content="${robots}"/>`,
    `<link rel="canonical" href="${esc(url)}"/>`,
    `<meta property="og:title" content="${esc(title)}"/>`,
    `<meta property="og:description" content="${esc(description)}"/>`,
    `<meta property="og:url" content="${esc(url)}"/>`,
    `<meta property="og:type" content="product"/>`,
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:locale" content="en_PK"/>`,
    `<meta property="og:image" content="${esc(image)}"/>`,
    `<meta property="og:image:secure_url" content="${esc(image)}"/>`,
    `<meta property="og:image:alt" content="${esc(title)}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
    `<meta name="twitter:image" content="${esc(image)}"/>`,
    `<meta name="twitter:image:alt" content="${esc(title)}"/>`,
    ...(price > 0
      ? [
          `<meta property="product:price:amount" content="${price}"/>`,
          `<meta property="product:price:currency" content="PKR"/>`,
        ]
      : []),
    `<script type="application/ld+json" id="sellsolar-listing-jsonld">${ld(product)}</script>`,
    `<script type="application/ld+json" id="sellsolar-breadcrumb-jsonld">${ld(breadcrumb)}</script>`,
  ].join('');

  return { title, html };
}

export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);

  // Canonical host: www -> apex
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }

  let shell = await context.next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return shell;

  try {
    const isHtml = (r) => r.ok && (r.headers.get('content-type') || '').includes('text/html');
    if (!isHtml(shell) && context.env?.ASSETS) {
      // `_redirects` rewrite not applied inside the function chain: serve the app shell directly.
      const alt = await context.env.ASSETS.fetch(new Request(new URL('/', url).toString(), { method: 'GET', headers: request.headers }));
      if (isHtml(alt)) shell = alt;
    }
    if (!isHtml(shell)) return shell;

    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const id = decodeURIComponent(String(rawId || '')).trim();
    // Only DB-backed (UUID) ads can be resolved at the edge; local/seed ids keep the generic shell.
    if (!UUID_RE.test(id)) return shell;

    const listing = await fetchListing(id);
    if (listing === null) {
      // Definitively no such ad: keep the app shell (client shows "not found") but with a real 404 status.
      return new Response(request.method === 'HEAD' ? null : shell.body, { status: 404, headers: shell.headers });
    }
    if (!listing || !listing.title) return shell;

    const canonicalUrl = `${SITE_URL}/listing/${encodeURIComponent(listing.id || id)}`;
    const { title, html } = buildHeadHtml(listing, canonicalUrl);

    return new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(title);
        },
      })
      .on(
        [
          'meta[name="description"]',
          'meta[name="keywords"]',
          'meta[name="robots"]',
          'meta[name="googlebot"]',
          'meta[property^="og:"]',
          'meta[name^="twitter:"]',
          'meta[property^="product:"]',
          'meta[itemprop]',
          'link[rel="canonical"]',
          'link[rel="alternate"][hreflang]',
          'script#sellsolar-listing-jsonld',
          'script#sellsolar-breadcrumb-jsonld',
        ].join(','),
        {
          element(el) {
            el.remove();
          },
        },
      )
      .on('head', {
        element(el) {
          el.append(html, { html: true });
        },
      })
      .transform(shell);
  } catch {
    return shell;
  }
}
