import { listingImages } from './images';

export const SITE_NAME = 'SellSolar';
export const SITE_URL = 'https://sellsolar.pk';
export const SITE_EMAIL = 'info@sellsolar.pk';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_OG_IMAGE_WIDTH = '1200';
export const DEFAULT_OG_IMAGE_HEIGHT = '630';
export const DEFAULT_KEYWORDS =
  'solar Pakistan, solar price Pakistan, used solar, used solar panels, solar inverter price, solar batteries, lithium battery Pakistan, sell solar, buy solar, solar marketplace Pakistan, Longi, Jinko, Inverex';

const INDEXABLE = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX = 'noindex,nofollow';

export const PAGE_SEO = {
  home: {
    title: 'Solar Price, Used Solar & Inverters Pakistan | SellSolar',
    description:
      'Sell & buy used solar panels, inverters and batteries in Pakistan. Check solar price today and find verified sellers in Lahore, Karachi and Islamabad.',
    path: '/',
    robots: INDEXABLE,
    keywords:
      'solar Pakistan, solar price, used solar, solar inverter, solar batteries, sell solar Pakistan',
  },
  prices: {
    title: 'Solar Price Today Pakistan | Panels Inverters Batteries',
    description:
      'Live solar price in Pakistan: panel PKR/watt, hybrid inverter cost and lithium battery rates. Updated daily for 5kW–20kW system budgeting.',
    path: '/prices',
    robots: INDEXABLE,
    keywords: 'solar price Pakistan, solar panel price, inverter price, battery price today',
  },
  calculator: {
    title: 'Solar Load Calculator Pakistan | System Size kW',
    description:
      'Free Pakistan solar load calculator. Enter fans, lights and ACs to get system kW, panel count, inverter size and battery backup.',
    path: '/calculator',
    robots: INDEXABLE,
    keywords: 'solar load calculator Pakistan, solar system size, inverter size calculator',
  },
  dealers: {
    title: 'Verified Solar Dealers Pakistan | SellSolar',
    description:
      'Browse verified solar equipment dealers across Pakistan. Find trusted sellers of Longi, Jinko, Inverex and Homage products in your city.',
    path: '/dealers',
    robots: INDEXABLE,
  },
  install: {
    title: 'Solar Installation Request | SellSolar',
    description:
      'Request professional solar installation. Share your name, address and contact number and SellSolar will arrange a site visit across Pakistan.',
    path: '/install',
    robots: INDEXABLE,
  },
  verification: {
    title: 'Tier 1 Solar Panels Verification Pakistan | Official Manufacturer Portals',
    description:
      'Verify serial numbers and barcode authenticity for Tier-1 solar panels: Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.',
    path: '/verification',
    robots: INDEXABLE,
    keywords:
      'Tier 1 solar panel verification, Canadian Solar serial check, Jinko authenticity portal, LONGi barcode verify, JA Solar warranty check, Trina Solar query, Sunova Pakistan',
  },
  'tier-1-verification': {
    title: 'Tier 1 Solar Panels Verification Pakistan | Official Manufacturer Portals',
    description:
      'Verify serial numbers and barcode authenticity for Tier-1 solar panels: Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.',
    path: '/tier-1-verification',
    robots: INDEXABLE,
    keywords:
      'Tier 1 solar panel verification, Canadian Solar serial check, Jinko authenticity portal, LONGi barcode verify, JA Solar warranty check, Trina Solar query',
  },
  'used-solar': {
    title: 'Used Solar for Sale Pakistan | Panels Inverters Batteries',
    description:
      'Buy and sell used solar equipment in Pakistan. Browse used solar panels, hybrid inverters and batteries from sellers in major cities.',
    path: '/used-solar',
    robots: INDEXABLE,
    keywords: 'used solar Pakistan, used solar panels for sale, second hand solar system',
  },
  'solar-price': {
    title: 'Solar Price Pakistan Today | Panel Inverter Battery Rates',
    description:
      'Check solar price Pakistan today for panels, inverters and batteries. Compare market rates before you buy used or new solar equipment.',
    path: '/solar-price',
    robots: INDEXABLE,
    keywords: 'solar price Pakistan, solar rates today, panel price per watt',
  },
  'solar-inverter': {
    title: 'Solar Inverter Price & Used Inverters Pakistan',
    description:
      'Find solar inverter price and used inverters for sale in Pakistan — hybrid and on-grid brands like Inverex, Homage, Growatt and GoodWe.',
    path: '/solar-inverter',
    robots: INDEXABLE,
    keywords: 'solar inverter price Pakistan, used inverter, hybrid inverter for sale',
  },
  'solar-batteries': {
    title: 'Solar Batteries & Lithium Battery Price Pakistan',
    description:
      'Buy solar batteries in Pakistan — lithium, tubular and gel. Compare lithium battery price and used battery listings from local sellers.',
    path: '/solar-batteries',
    robots: INDEXABLE,
    keywords: 'solar batteries Pakistan, lithium battery price, used solar battery',
  },
  'solar-panels': {
    title: 'Solar Panels for Sale Pakistan | Used & New Modules',
    description:
      'Solar panels for sale in Pakistan — used and new Longi, Jinko, JA and Canadian modules. Filter by city, wattage and condition on SellSolar.',
    path: '/solar-panels',
    robots: INDEXABLE,
    keywords: 'solar panels Pakistan, used solar panels, solar panel price',
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
  inbox: {
    title: 'Inbox & Inquiries | SellSolar',
    description: 'SellSolar message inbox and customer inquiry desk.',
    path: '/inbox',
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
  'not-found': {
    title: 'Page Not Found (404) | SellSolar',
    description: 'This SellSolar page does not exist. Return to the homepage to browse solar listings and tools.',
    path: '/404',
    robots: NOINDEX,
  },
  about: {
    title: 'About Us | SellSolar Pakistan',
    description: 'Learn about SellSolar.pk, Pakistan’s dedicated clean energy and solar equipment marketplace.',
    path: '/about',
    robots: INDEXABLE,
  },
  careers: {
    title: 'Careers at SellSolar | Solar Jobs PK',
    description: 'Join our mission-driven team solving renewable energy challenges across Pakistan.',
    path: '/careers',
    robots: INDEXABLE,
  },
  press: {
    title: 'Press & Media | SellSolar Pakistan',
    description: 'Latest news releases, media kit, and industry insights from SellSolar.pk.',
    path: '/press',
    robots: INDEXABLE,
  },
  blog: {
    title: 'Solar Blog & Net Metering Guides | SellSolar',
    description: 'Solar buying tips, Tier-1 module comparisons, inverter reviews and net-metering guides for Pakistan.',
    path: '/blog',
    robots: INDEXABLE,
  },
  'buy-solar': {
    title: 'Buy Used & New Solar Pakistan | Panels Inverters Batteries',
    description:
      'Buy used and new solar panels, inverters and batteries in Pakistan from verified sellers. Filter by city, brand and condition.',
    path: '/buy-solar',
    robots: INDEXABLE,
    keywords: 'buy solar Pakistan, buy used solar panels, buy solar inverter',
  },
  'sell-solar': {
    title: 'Sell Used Solar Free in Pakistan | SellSolar',
    description:
      'Sell used or new solar panels, inverters and batteries free on SellSolar. Reach buyers across Lahore, Karachi, Islamabad and more.',
    path: '/sell-solar',
    robots: INDEXABLE,
    keywords: 'sell used solar Pakistan, sell solar panels, post solar ad',
  },
  'how-it-works': {
    title: 'How It Works | SellSolar Pakistan',
    description: 'Learn how to easily buy, sell and trade verified solar equipment on SellSolar.pk.',
    path: '/how-it-works',
    robots: INDEXABLE,
  },
  pricing: {
    title: 'Pricing & Packages | SellSolar',
    description: 'Transparent free individual ad listing and premium verified dealer plans.',
    path: '/pricing',
    robots: INDEXABLE,
  },
  help: {
    title: 'Help Center & FAQs | SellSolar',
    description: 'Frequently asked questions, troubleshooting and customer support for SellSolar users.',
    path: '/help',
    robots: INDEXABLE,
  },
  contact: {
    title: 'Contact Us | SellSolar Pakistan',
    description: 'Reach our Islamabad headquarters, WhatsApp support desk, or email info@sellsolar.pk.',
    path: '/contact',
    robots: INDEXABLE,
  },
  safety: {
    title: 'Solar Safety Tips | SellSolar Pakistan',
    description: 'Essential guidelines to avoid fake solar panels, check barcodes and transact safely in Pakistan.',
    path: '/safety',
    robots: INDEXABLE,
  },
  'report-issue': {
    title: 'Report an Issue | SellSolar Pakistan',
    description: 'Report counterfeit equipment, scams or technical issues for swift investigation.',
    path: '/report-issue',
    robots: INDEXABLE,
  },
  terms: {
    title: 'Terms of Service | SellSolar',
    description: 'Terms and conditions governing the use of SellSolar.pk online solar marketplace.',
    path: '/terms',
    robots: INDEXABLE,
  },
  privacy: {
    title: 'Privacy Policy | SellSolar Pakistan',
    description: 'How SellSolar collects, protects and handles personal data and listing information.',
    path: '/privacy',
    robots: INDEXABLE,
  },
  cookies: {
    title: 'Cookie Policy | SellSolar Pakistan',
    description: 'Information regarding browser storage and cookies utilized by SellSolar.pk.',
    path: '/cookies',
    robots: INDEXABLE,
  },
  disclaimer: {
    title: 'Disclaimer | SellSolar Pakistan',
    description: 'Important disclaimers on solar equipment warranties, rates and net metering regulations.',
    path: '/disclaimer',
    robots: INDEXABLE,
  },
};

const PAGE_ALIASES = {
  'today-prices': 'prices',
  'load-calculator': 'calculator',
  'tier-1-verification': 'verification',
  'panel-verification': 'verification',
  'tier1-verification': 'verification',
  'change-password': 'password',
  'about-us': 'about',
  'help-center': 'help',
  'contact-us': 'contact',
  'safety-tips': 'safety',
  'report': 'report-issue',
  'terms-of-service': 'terms',
  'privacy-policy': 'privacy',
  'cookie-policy': 'cookies',
};

export function canonicalPage(page) {
  return PAGE_ALIASES[page] || page;
}

export function pageToPath(page, listingId, hash) {
  if (typeof page === 'string' && page.startsWith('/')) {
    return page;
  }
  if (typeof page === 'string' && page.startsWith('custom:')) {
    return page.replace('custom:', '');
  }
  const key = canonicalPage(page);
  if (key === 'listing-detail' && listingId) return `/listing/${listingId}`;
  if (typeof key === 'string' && key.startsWith('/')) return key;
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
    '/verification': 'verification',
    '/tier-1-verification': 'verification',
    '/tier1-verification': 'verification',
    '/panel-verification': 'verification',
    '/dealers': 'dealers',
    '/install': 'install',
    '/installation': 'install',
    '/request-installation': 'install',
    '/login': 'login',
    '/auth': 'login',
    '/auth/callback': 'home',
    '/post-ad': 'post-ad',
    '/dashboard': 'dashboard',
    '/admin': 'admin',
    '/admin-dashboard': 'admin-dashboard',
    '/inbox': 'inbox',
    '/password': 'password',
    '/forgot-password': 'forgot-password',
    '/reset-password': 'reset-password',
    '/about': 'about',
    '/about-us': 'about',
    '/careers': 'careers',
    '/press': 'press',
    '/blog': 'blog',
    '/buy-solar': 'buy-solar',
    '/sell-solar': 'sell-solar',
    '/used-solar': 'used-solar',
    '/solar-price': 'solar-price',
    '/solar-inverter': 'solar-inverter',
    '/solar-batteries': 'solar-batteries',
    '/solar-panels': 'solar-panels',
    '/how-it-works': 'how-it-works',
    '/pricing': 'pricing',
    '/help': 'help',
    '/help-center': 'help',
    '/contact': 'contact',
    '/contact-us': 'contact',
    '/safety': 'safety',
    '/safety-tips': 'safety',
    '/report': 'report-issue',
    '/report-issue': 'report-issue',
    '/terms': 'terms',
    '/terms-of-service': 'terms',
    '/privacy': 'privacy',
    '/privacy-policy': 'privacy',
    '/cookies': 'cookies',
    '/cookie-policy': 'cookies',
    '/disclaimer': 'disclaimer',
  };

  if (map[path]) {
    return { page: map[path], listingId: null, hash };
  }

  // Check if it matches a custom CMS page in localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawCustom = localStorage.getItem('sellsolar_custom_pages');
      if (rawCustom) {
        const customPages = JSON.parse(rawCustom);
        const cleanP = path.toLowerCase();
        const match = customPages.find((p) => {
          const itemPath = (p.path || '').toLowerCase();
          return (
            itemPath === cleanP ||
            itemPath === cleanP + '/' ||
            '/' + itemPath.replace(/^\//, '') === cleanP
          );
        });
        if (match) {
          return { page: `custom:${match.path}`, customPage: match, listingId: null, hash };
        }
      }
    } catch {}
  }

  return { page: 'not-found', listingId: null, hash };
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

function upsertLink(rel, href, attrs = {}) {
  const attrSelector = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('');
  let el = document.head.querySelector(`link[rel="${rel}"]${attrSelector}`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value) el.setAttribute(key, value);
    });
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function breadcrumbFor(page, listing, path, origin) {
  const items = [
    { name: 'Home', item: `${origin}/` },
  ];
  const key = canonicalPage(page);
  if (key === 'home') return items;
  const meta = PAGE_SEO[key];
  if (key === 'listing-detail' && listing?.title) {
    items.push({ name: 'Listings', item: `${origin}/` });
    items.push({ name: listing.title, item: `${origin}${path}` });
  } else if (meta) {
    items.push({
      name: meta.title.split('|')[0].trim(),
      item: `${origin}${meta.path || path}`,
    });
  }
  return items;
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
  const ogImage =
    key === 'listing-detail' && listing
      ? listingImages(listing)[0] || DEFAULT_OG_IMAGE
      : DEFAULT_OG_IMAGE;

  let title = meta.title;
  let description = meta.description;
  let keywords = meta.keywords || DEFAULT_KEYWORDS;
  if (key === 'listing-detail' && listing?.title) {
    const city = listing.city ? ` in ${listing.city}` : '';
    const brand = listing.brand ? `${listing.brand} ` : '';
    title = `${listing.title}${city} | SellSolar`.slice(0, 60);
    description = `${brand}${listing.title}${city}. Buy solar equipment on SellSolar, Pakistan's solar marketplace.`.slice(
      0,
      160,
    );
    keywords = [listing.brand, listing.category, listing.city, 'solar Pakistan', 'SellSolar']
      .filter(Boolean)
      .join(', ');
  }

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: meta.robots || INDEXABLE });
  upsertMeta('meta[name="googlebot"]', {
    name: 'googlebot',
    content: meta.robots || INDEXABLE,
  });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: key === 'listing-detail' ? 'product' : 'website',
  });
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_PK' });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
  upsertMeta('meta[property="og:image:secure_url"]', {
    property: 'og:image:secure_url',
    content: ogImage,
  });
  upsertMeta('meta[property="og:image:type"]', {
    property: 'og:image:type',
    content: ogImage.endsWith('.png') ? 'image/png' : 'image/jpeg',
  });
  upsertMeta('meta[property="og:image:width"]', {
    property: 'og:image:width',
    content: DEFAULT_OG_IMAGE_WIDTH,
  });
  upsertMeta('meta[property="og:image:height"]', {
    property: 'og:image:height',
    content: DEFAULT_OG_IMAGE_HEIGHT,
  });
  upsertMeta('meta[property="og:image:alt"]', {
    property: 'og:image:alt',
    content: title,
  });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
  upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: title });
  upsertMeta('meta[itemprop="name"]', { itemprop: 'name', content: title });
  upsertMeta('meta[itemprop="description"]', { itemprop: 'description', content: description });
  upsertMeta('meta[itemprop="image"]', { itemprop: 'image', content: ogImage });
  upsertLink('canonical', url);
  upsertLink('alternate', url, { hreflang: 'en-PK' });
  upsertLink('alternate', url, { hreflang: 'x-default' });

  const crumbs = breadcrumbFor(key, listing, path, origin);
  upsertJsonLd('sellsolar-breadcrumb-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  });

  if (key === 'listing-detail' && listing) {
    upsertJsonLd('sellsolar-listing-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description || description,
      image: listingImages(listing)[0] || DEFAULT_OG_IMAGE,
      brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
      category: listing.category,
      sku: listing.id,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'PKR',
        price: listing.price ?? 0,
        availability: listing.is_sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        itemCondition:
          listing.condition === 'used' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: listing.seller_name || SITE_NAME,
        },
      },
    });
  } else {
    upsertJsonLd('sellsolar-listing-jsonld', null);
  }
}
