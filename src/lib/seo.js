import { listingImages } from './images';

export const SITE_NAME = 'SellSolar';
export const SITE_URL = 'https://sellsolar.pk';
export const SITE_EMAIL = 'info@sellsolar.pk';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_OG_IMAGE_WIDTH = '1200';
export const DEFAULT_OG_IMAGE_HEIGHT = '630';
export const DEFAULT_KEYWORDS =
  'solar plates, solar panel price in Pakistan, solar plate price today, buy solar plates, used solar panels Pakistan, solar inverter price in Pakistan, hybrid solar inverter, solar batteries price, Tier 1 solar plates, Longi solar, Jinko solar, Canadian Solar, Inverex, calculate solar load, solar authorized dealers, Pakistan solar marketplace, sell used solar equipment, 5kw solar system price, 10kw solar system price, solar energy Pakistan, cheap solar plates';

const INDEXABLE = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NOINDEX = 'noindex,nofollow';

export const PAGE_SEO = {
  home: {
    title: 'SellSolar: #1 Solar Marketplace in Pakistan | Buy & Sell Solar Plates, Inverters & Batteries',
    description:
      "Welcome to SellSolar, Pakistan's premier solar marketplace. Buy and sell new & used Tier-1 solar plates, hybrid inverters, and lithium batteries. Check today's live solar plate prices and post free ads.",
    path: '/',
    robots: INDEXABLE,
    keywords:
      'buy solar panels in Pakistan, solar plates for sale, used solar panels Pakistan, sell used solar equipment, solar plate price in Pakistan today, solar inverter price, lithium solar batteries, Tier 1 solar panels, Longi Jinko Canadian Solar, SellSolar marketplace, 5kw solar system price Pakistan, 10kw solar system cost',
  },
  prices: {
    title: 'Today Solar Plate Price in Pakistan | Live Rates for Panels, Inverters & Batteries',
    description:
      'Check daily updated solar plate price in Pakistan. View live per-watt rates for Tier-1 solar panels (Longi, Jinko, Canadian Solar), hybrid inverters, and lithium / tubular batteries.',
    path: '/prices',
    robots: INDEXABLE,
    keywords:
      'solar plate price in Pakistan today, solar panel price per watt, solar rates today Pakistan, hybrid solar inverter price, lithium battery price Pakistan, tubular battery price, Tier 1 solar plates price, Longi solar panel rate, Jinko solar plate cost, 5kw solar system price, 10kw solar inverter price',
  },
  calculator: {
    title: 'Solar Load Calculator Pakistan | Free Solar System, Plates & Inverter Estimator',
    description:
      'Use our free solar load calculator in Pakistan to estimate your home appliances kW load, required solar plates count, optimal inverter size, and battery backup needs instantly.',
    path: '/calculator',
    robots: INDEXABLE,
    keywords:
      'calculate solar load, free solar load calculator Pakistan, estimate solar system load, how to calculate solar panels needed, inverter size calculator, solar battery backup calculator, 5kw solar load calculation, 10kw solar system estimation',
  },
  dealers: {
    title: 'Authorized Solar Dealers in Pakistan | Verified Tier-1 Equipment Sellers',
    description:
      'Find verified and authorized solar dealers across Pakistan. Connect with trusted distributors of Tier-1 solar plates (Longi, Jinko, Canadian Solar) and premium inverters (Inverex, Growatt) in Lahore, Karachi, and Islamabad.',
    path: '/dealers',
    robots: INDEXABLE,
    keywords:
      'authorized solar dealers in Pakistan, verified solar distributors, Tier 1 solar panel sellers, Longi authorized dealer, Jinko solar distributor, Inverex dealer Lahore, Growatt dealer Karachi, buy authentic solar plates Pakistan',
  },
  install: {
    title: 'Solar Installation Request | SellSolar',
    description:
      'Request professional solar installation. Share your name, address and contact number and SellSolar will arrange a site visit across Pakistan.',
    path: '/install',
    robots: INDEXABLE,
  },
  verification: {
    title: 'Tier 1 Solar Plates Verification Pakistan | Official Barcode & Serial Check',
    description:
      'Verify serial numbers and barcode authenticity for Tier-1 solar plates in Pakistan: Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.',
    path: '/verification',
    robots: INDEXABLE,
    keywords:
      'Tier 1 solar plates verification, solar plate serial check, Canadian Solar serial check, Jinko authenticity portal, LONGi barcode verify, JA Solar warranty check, solar plate authenticity',
  },
  'tier-1-verification': {
    title: 'Tier 1 Solar Plates Verification Pakistan | Official Barcode & Serial Check',
    description:
      'Verify serial numbers and barcode authenticity for Tier-1 solar plates in Pakistan: Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.',
    path: '/tier-1-verification',
    robots: INDEXABLE,
    keywords:
      'Tier 1 solar plates verification, solar plate serial check, verify solar plates Pakistan, Longi solar plate verify, Jinko barcode check, solar plate authenticity',
  },
  'used-solar': {
    title: 'Used Solar Plates & Inverters for Sale in Pakistan | Buy & Sell',
    description:
      'Buy and sell used solar equipment in Pakistan. Browse affordable second-hand Tier-1 solar plates, hybrid inverters, and lithium batteries from verified local sellers.',
    path: '/used-solar',
    robots: INDEXABLE,
    keywords:
      'used solar plates Pakistan, used solar panels for sale, buy second hand solar plates, used hybrid solar inverter, used lithium solar batteries, cheap solar plates Lahore Karachi Islamabad, sell used solar equipment, affordable solar system',
  },
  'solar-price': {
    title: 'Solar Plate Price Today Pakistan | Live Per Watt & System Rates',
    description:
      'Check solar plate price in Pakistan today for panels, inverters and batteries. Compare market rates before you buy used or new solar plates.',
    path: '/solar-price',
    robots: INDEXABLE,
    keywords:
      'solar plate price in Pakistan today, solar rates today, panel price per watt Pakistan, 550w solar plate price, 580w solar panel rate, Tier 1 solar plate price today, solar system cost Pakistan',
  },
  'solar-inverter': {
    title: 'Solar Inverter Price in Pakistan | Hybrid, On-Grid & Used Inverters',
    description:
      'Find the best solar inverter price in Pakistan. Explore new and used hybrid, off-grid, and on-grid inverters from top brands like Inverex, Growatt, Solis, Knox, and Huawei.',
    path: '/solar-inverter',
    robots: INDEXABLE,
    keywords:
      'solar inverter price Pakistan, hybrid solar inverter, Inverex inverter price, Growatt inverter price, 3kw solar inverter, 5kw hybrid inverter cost, 10kw on grid inverter price, used solar inverter Pakistan',
  },
  'solar-batteries': {
    title: 'Solar Battery Price in Pakistan | Lithium & Tubular Batteries',
    description:
      'Buy long-lasting solar batteries in Pakistan. Compare lithium LiFePO4, tubular, and gel battery prices. Find affordable new and used solar batteries for optimal backup.',
    path: '/solar-batteries',
    robots: INDEXABLE,
    keywords:
      'solar battery price Pakistan, lithium battery price in Pakistan, tubular battery cost, LiFePO4 solar battery, used solar battery for sale, 100ah lithium battery price, 200ah tubular battery rate',
  },
  'solar-panels': {
    title: 'Solar Panels in Pakistan | Tier-1 Solar Plates & Prices',
    description:
      'Top Tier-1 solar panels in Pakistan. Compare prices for new and used Longi, Jinko, JA Solar, and Canadian Solar modules. Calculate your solar setup cost today.',
    path: '/solar-panels',
    robots: INDEXABLE,
    keywords:
      'solar panels in Pakistan, solar panel price Pakistan, Tier 1 solar panels, Longi solar panels price, Jinko solar panels, JA Solar rate, Canadian solar price Pakistan, buy solar panels online',
  },
  'solar-plates': {
    title: 'Solar Plates for Sale in Pakistan | Buy New & Used Solar Plates',
    description:
      'Browse verified listings of new and used solar plates for sale in Pakistan. Find the best rates for Longi, Canadian Solar, Jinko, and JA Solar plates in Lahore, Karachi, and Islamabad.',
    path: '/solar-plates',
    robots: INDEXABLE,
    keywords:
      'solar plates for sale Pakistan, buy solar plates, used solar plates, second hand solar plates, Tier 1 solar plates price, cheap solar plates, wholesale solar plates market',
  },
  'solar-plate': {
    title: 'Solar Plate Prices & Models in Pakistan | 550W - 610W Rates',
    description:
      'Compare solar plate models, specifications, and prices (550W - 610W) in Pakistan. Buy and sell verified new and used Tier-1 solar plates on SellSolar.',
    path: '/solar-plate',
    robots: INDEXABLE,
    keywords:
      'solar plate, solar plate price in Pakistan, 550w solar plate price, 580w solar plate rate, 600w solar panel cost, Tier 1 solar plate, used solar plate',
  },
  'solar-plates-price': {
    title: 'Solar Plates Price in Pakistan Today | Live Tier-1 Panel Rates',
    description:
      'Daily updated solar plates price in Pakistan today. Check live per-watt rates for Tier-1 solar panels (Canadian Solar, Longi, Jinko, JA Solar) for 5kW to 20kW home setups.',
    path: '/solar-plates-price',
    robots: INDEXABLE,
    keywords:
      'solar plates price in Pakistan, solar plate price in Pakistan today, solar plates rate today, Tier 1 solar plates price, solar panel per watt price, Longi solar plates price, Jinko solar plate rate',
  },
  'today-prices': {
    title: 'Today Solar Rates in Pakistan | Live Solar Plates & Inverter Prices',
    description:
      'Check today live solar rates in Pakistan: panel PKR/watt cost, on-grid and hybrid inverters, and lithium battery prices updated daily for accurate budget planning.',
    path: '/today-prices',
    robots: INDEXABLE,
    keywords:
      'today solar rates, solar rates today Pakistan, solar plate price in Pakistan today, live solar rates Pakistan, today solar panel price, today inverter rate Pakistan',
  },
  'load-calculator': {
    title: 'Calculate Solar Load Free in Pakistan | Solar System Load Calculator',
    description:
      'Calculate solar load in Pakistan free. Calculate your home appliances kW load, required solar plates count, inverter kW size, and battery backup.',
    path: '/load-calculator',
    robots: INDEXABLE,
    keywords:
      'calculate solar load, solar load calculator, calculate solar system load, solar load calculator Pakistan, how to calculate solar load, calculate home solar load',
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
    title: 'Buy Solar Plates, Inverters & Batteries in Pakistan | Verified Sellers',
    description:
      'Buy used and new solar plates, inverters and batteries in Pakistan from verified sellers. Filter by city, brand and condition at best market rates.',
    path: '/buy-solar',
    robots: INDEXABLE,
    keywords: 'buy solar plates, buy solar Pakistan, buy solar panels, buy solar inverter, buy solar batteries, solar plates price',
  },
  'sell-solar': {
    title: 'Sell Solar Plates, Inverters & Batteries Free in Pakistan | SellSolar',
    description:
      'Sell used or new solar plates, inverters and batteries free on SellSolar. Reach thousands of buyers across Lahore, Karachi, Islamabad and all Pakistan.',
    path: '/sell-solar',
    robots: INDEXABLE,
    keywords: 'sell solar plates, sell used solar Pakistan, sell solar panels, post solar ad, sell solar inverter, sell solar batteries',
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
    description: 'Reach our Islamabad headquarters, WhatsApp support desk, or submit an inquiry through our contact portal.',
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
  inbox: {
    title: 'Admin Inbox | SellSolar Pakistan',
    description: 'Admin message inquiries and notifications.',
    path: '/inbox',
    robots: NOINDEX,
  },
};

const PAGE_ALIASES = {
  'today-prices': 'prices',
  'solar-plates-price': 'prices',
  'load-calculator': 'calculator',
  'tier-1-verification': 'verification',
  'panel-verification': 'verification',
  'tier1-verification': 'verification',
  'solar-plates': 'solar-panels',
  'solar-plate': 'solar-panels',
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
  if (PAGE_SEO && PAGE_SEO[page]) {
    return page;
  }
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
    '/solar-plates-price': 'prices',
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
    '/solar-plates': 'solar-panels',
    '/solar-plate': 'solar-panels',
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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '18',
        bestRating: '5',
        worstRating: '1',
      },
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
