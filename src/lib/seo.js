export const SITE_NAME = 'SellSolar';
export const SITE_URL = 'https://sellsolar.pk';
export const SITE_EMAIL = 'info@sellsolar.pk';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

const INDEXABLE = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX = 'noindex,nofollow';

export const PAGE_SEO = {
  home: {
    title: 'SellSolar | Buy & Sell Solar Panels, Inverters & Batteries in Pakistan',
    description:
      'Pakistan solar marketplace for new and used solar panels, hybrid inverters, lithium batteries and complete systems. Compare prices in Lahore, Karachi, Islamabad and more.',
    path: '/',
    robots: INDEXABLE,
  },
  prices: {
    title: "Today's Solar Panel Rates in Pakistan (PKR) | SellSolar",
    description:
      "Live solar market rates in Pakistan: panel per-watt prices, hybrid inverter costs, and lithium battery rates. Updated daily so you can budget a 5kW–20kW system.",
    path: '/prices',
    robots: INDEXABLE,
  },
  calculator: {
    title: 'Solar Load Calculator Pakistan | kW, Panels & Battery Size | SellSolar',
    description:
      'Free Pakistan solar load calculator. Enter fans, lights, inverter ACs and motors to get system kW, panel count, inverter size and battery backup in minutes.',
    path: '/calculator',
    robots: INDEXABLE,
  },
  dealers: {
    title: 'Verified Solar Dealers in Pakistan | SellSolar',
    description:
      'Browse verified solar equipment dealers across Pakistan. Find trusted sellers of Longi, Jinko, Inverex and Homage products in your city.',
    path: '/dealers',
    robots: INDEXABLE,
  },
  login: {
    title: 'Login or Create Account | SellSolar',
    description: 'Sign in to SellSolar to post solar ads, save listings and manage your dealer profile.',
    path: '/login',
    robots: NOINDEX,
  },
  'post-ad': {
    title: 'Post a Solar Ad | SellSolar',
    description: 'List solar panels, inverters, batteries or complete systems for sale across Pakistan.',
    path: '/post-ad',
    robots: NOINDEX,
  },
  dashboard: {
    title: 'My Dashboard | SellSolar',
    description: 'Manage your SellSolar listings, enquiries and profile.',
    path: '/dashboard',
    robots: NOINDEX,
  },
  admin: {
    title: 'Admin | SellSolar',
    description: 'SellSolar admin tools.',
    path: '/admin',
    robots: NOINDEX,
  },
  'admin-dashboard': {
    title: 'Admin Dashboard | SellSolar',
    description: 'SellSolar admin dashboard.',
    path: '/admin-dashboard',
    robots: NOINDEX,
  },
  password: {
    title: 'Change Password | SellSolar',
    description: 'Update or reset your SellSolar account password.',
    path: '/password',
    robots: NOINDEX,
  },
  'forgot-password': {
    title: 'Reset Password | SellSolar',
    description: 'Request a SellSolar password reset link.',
    path: '/forgot-password',
    robots: NOINDEX,
  },
  'reset-password': {
    title: 'Set New Password | SellSolar',
    description: 'Choose a new password for your SellSolar account.',
    path: '/reset-password',
    robots: NOINDEX,
  },
  'listing-detail': {
    title: 'Solar Listing | SellSolar',
    description: 'View solar equipment listed for sale on SellSolar Pakistan.',
    path: '/listing',
    robots: INDEXABLE,
  },
};

const PAGE_ALIASES = {
  'today-prices': 'prices',
  'load-calculator': 'calculator',
  'change-password': 'password',
};

export function canonicalPage(page) {
  return PAGE_ALIASES[page] || page;
}

export function pageToPath(page, listingId, hash) {
  const key = canonicalPage(page);
  if (key === 'listing-detail' && listingId) return `/listing/${listingId}`;
  const meta = PAGE_SEO[key] || PAGE_SEO.home;
  const base = meta.path || '/';
  if (hash) return `${base}${hash.startsWith('#') ? hash : `#${hash}`}`;
  return base;
}

export function parseLocation(pathname = '/', hash = '') {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/';
  const listingMatch = path.match(/^\/listing\/([^/]+)$/);
  if (listingMatch) {
    return { page: 'listing-detail', listingId: listingMatch[1], hash };
  }

  const map = {
    '/': 'home',
    '/prices': 'prices',
    '/today-prices': 'prices',
    '/calculator': 'calculator',
    '/load-calculator': 'calculator',
    '/dealers': 'dealers',
    '/login': 'login',
    '/post-ad': 'post-ad',
    '/dashboard': 'dashboard',
    '/admin': 'admin',
    '/admin-dashboard': 'admin-dashboard',
    '/password': 'password',
    '/forgot-password': 'forgot-password',
    '/reset-password': 'reset-password',
  };

  return { page: map[path] || 'home', listingId: null, hash };
}

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value) el.setAttribute(key, value);
  });
  return el;
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function upsertJsonLd(id, data) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(id);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function originUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return window.location.origin;
  }
  return SITE_URL;
}

export function applyPageSeo(page, { listing, listingId } = {}) {
  if (typeof document === 'undefined') return;
  const key = canonicalPage(page);
  const meta = PAGE_SEO[key] || PAGE_SEO.home;
  const origin = originUrl();
  const path = pageToPath(key, listingId || listing?.id);
  const url = `${origin}${path}`;

  let title = meta.title;
  let description = meta.description;
  if (key === 'listing-detail' && listing?.title) {
    const city = listing.city ? ` in ${listing.city}` : '';
    const brand = listing.brand ? `${listing.brand} ` : '';
    title = `${listing.title}${city} | SellSolar`;
    description = `${brand}${listing.title}${city}. Buy solar equipment on SellSolar, Pakistan's solar marketplace.`.slice(0, 160);
  }

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: meta.robots || INDEXABLE });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: key === 'listing-detail' ? 'product' : 'website' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertLink('canonical', url);

  if (key === 'listing-detail' && listing) {
    upsertJsonLd('sellsolar-listing-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description || description,
      image: listing.image_url || `${origin}/og-image.svg`,
      brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
      category: listing.category,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'PKR',
        price: listing.price ?? 0,
        availability: listing.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        itemCondition:
          listing.condition === 'used' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      },
    });
  } else {
    upsertJsonLd('sellsolar-listing-jsonld', null);
  }
}
