/** Default homepage advertisement slots & packages (admin-editable via Site Settings). */

export const DEFAULT_ADVERTISEMENT_SETTINGS = {
  enabled: true,
  scrollEnabled: true,
  staticEnabled: true,
  packagesPageLink: '/pricing',
  packagesCtaLabel: 'View advertisement packages',
  defaultPackageId: 'free',
  /** Show Google AdSense-style slots in the same moving strip as partner ads */
  googleAdsInMarquee: true,
  googleAdSenseClientId: '',
  packages: [
    {
      id: 'free',
      name: 'Free Launch Run',
      price: 0,
      priceLabel: 'Rs. 0',
      period: '30 days',
      description: 'Run your brand on the homepage scroll strip during the free launch period.',
      features: [
        'Homepage scroll banner rotation',
        'Up to 30 days visibility',
        'SellSolar.pk “Partner” badge',
        'WhatsApp & click-through link',
      ],
      ctaText: 'Start Free',
      ctaLink: 'contact',
      highlighted: false,
      isActive: true,
    },
    {
      id: 'scroll',
      name: 'Scroll Banner',
      price: 4999,
      priceLabel: 'Rs. 4,999',
      period: '14 days',
      description: 'Premium rotating strip on the homepage hero zone — high impressions.',
      features: [
        'Always-visible scroll strip',
        'Logo + headline + CTA',
        'Mobile & desktop',
        'Performance summary on request',
      ],
      ctaText: 'Book Scroll Slot',
      ctaLink: 'contact',
      highlighted: false,
      isActive: true,
    },
    {
      id: 'static',
      name: 'Static Spotlight',
      price: 7999,
      priceLabel: 'Rs. 7,999',
      period: '14 days',
      description: 'Large static card below the hero — ideal for dealer campaigns.',
      features: [
        'Static image/banner card',
        'Pinned placement on homepage',
        'Click or WhatsApp CTA',
        'Category targeting (optional)',
      ],
      ctaText: 'Book Static Slot',
      ctaLink: 'contact',
      highlighted: false,
      isActive: true,
    },
    {
      id: 'combo',
      name: 'Scroll + Static Combo',
      price: 11999,
      priceLabel: 'Rs. 11,999',
      period: '30 days',
      description: 'Maximum reach: scroll strip plus static spotlight together.',
      features: [
        'Scroll strip + static card',
        '30-day campaign',
        'Priority scheduling',
        'Dedicated account support',
      ],
      ctaText: 'Get Combo Package',
      ctaLink: 'contact',
      highlighted: true,
      isActive: true,
    },
  ],
  scrollAds: [
    {
      id: 'scroll-aman-solutions',
      title: 'Buy Solar Here',
      subtitle: 'Aman Solutions — panels, inverters & batteries',
      imageUrl: '/og-image.jpg',
      linkUrl: '/buy-solar',
      packageId: 'free',
      isActive: true,
      advertiser: 'Aman Solutions',
    },
    {
      id: 'scroll-google-solar-1',
      adType: 'google',
      title: 'Sponsored',
      subtitle: 'Google Ads — solar deals in Pakistan',
      imageUrl: '',
      linkUrl: '',
      googleSlotId: '',
      packageId: 'google',
      isActive: true,
      advertiser: 'Google',
    },
    {
      id: 'scroll-sellsolar-free',
      title: 'Post Your Solar Ad — 100% FREE',
      subtitle: 'SellSolar.pk Marketplace',
      imageUrl: '/og-image.jpg',
      linkUrl: '/post-ad',
      packageId: 'free',
      isActive: true,
      advertiser: 'SellSolar',
    },
    {
      id: 'scroll-dealers',
      title: 'Verified Solar Dealers — 80+ Cities',
      subtitle: 'Shop with confidence',
      imageUrl: '',
      linkUrl: '/dealers',
      packageId: 'free',
      isActive: true,
      advertiser: 'SellSolar',
    },
    {
      id: 'scroll-dummy-greenvolt',
      title: '10kW Home Solar — From Rs. 899,000',
      subtitle: 'Green Volt Lahore • Free site survey',
      imageUrl: '',
      linkUrl: '/contact',
      packageId: 'scroll',
      isActive: true,
      advertiser: 'Green Volt (Demo)',
    },
    {
      id: 'scroll-dummy-sunpower',
      title: 'Growatt & Fronius Inverters — Stock Ready',
      subtitle: 'SunPower Karachi • Same-day quote',
      imageUrl: '',
      linkUrl: '/dealers',
      packageId: 'scroll',
      isActive: true,
      advertiser: 'SunPower PK (Demo)',
    },
    {
      id: 'scroll-dummy-netmeter',
      title: 'Net Metering Approved — ISB & RWP',
      subtitle: 'Capital Solar Hub (Demo)',
      imageUrl: '',
      linkUrl: '/guides',
      packageId: 'free',
      isActive: true,
      advertiser: 'Capital Solar Hub',
    },
    {
      id: 'scroll-dummy-used',
      title: 'Used 550W Panels — Tested & Warranted',
      subtitle: 'Punjab Energy Mart (Demo)',
      imageUrl: '',
      linkUrl: '/buy-solar',
      packageId: 'free',
      isActive: true,
      advertiser: 'Punjab Energy Mart',
    },
  ],
  staticAds: [
    {
      id: 'static-aman-solutions',
      title: 'Buy Solar Here',
      subtitle: 'Aman Solutions — shop new & used solar across Pakistan',
      imageUrl: '/og-image.jpg',
      linkUrl: '/buy-solar',
      packageId: 'free',
      isActive: true,
      advertiser: 'Aman Solutions',
    },
    {
      id: 'static-pricing',
      title: 'Advertise on SellSolar.pk',
      subtitle: 'Scroll & static banners • Start free',
      imageUrl: '/architecture-diagram.png',
      linkUrl: '/pricing',
      packageId: 'free',
      isActive: true,
      advertiser: 'SellSolar',
    },
    {
      id: 'static-dummy-lahore',
      title: 'Lahore Solar Store — Install in 7 Days',
      subtitle: 'Demo dealer spotlight • Panels + inverter bundle',
      imageUrl: '/architecture-diagram.png',
      linkUrl: '/dealers',
      packageId: 'static',
      isActive: true,
      advertiser: 'Lahore Solar Store (Demo)',
    },
    {
      id: 'static-dummy-battery',
      title: 'Lithium Battery Backup — 5kWh & 10kWh',
      subtitle: 'EcoCharge Pakistan (Demo) • Nationwide delivery',
      imageUrl: '',
      linkUrl: '/contact',
      packageId: 'static',
      isActive: true,
      advertiser: 'EcoCharge PK',
    },
    {
      id: 'static-dummy-finance',
      title: 'Solar on Easy Installments',
      subtitle: 'Demo campaign — 0% markup plans • Apply online',
      imageUrl: '',
      linkUrl: '/pricing',
      packageId: 'combo',
      isActive: true,
      advertiser: 'Solar Finance Demo',
    },
  ],
};

const PARTNER_ADS_ALWAYS = {
  scroll: {
    id: 'scroll-aman-solutions',
    title: 'Buy Solar Here',
    subtitle: 'Aman Solutions — panels, inverters & batteries',
    imageUrl: '/og-image.jpg',
    linkUrl: '/buy-solar',
    packageId: 'free',
    isActive: true,
    advertiser: 'Aman Solutions',
  },
  static: {
    id: 'static-aman-solutions',
    title: 'Buy Solar Here',
    subtitle: 'Aman Solutions — shop new & used solar across Pakistan',
    imageUrl: '/og-image.jpg',
    linkUrl: '/buy-solar',
    packageId: 'free',
    isActive: true,
    advertiser: 'Aman Solutions',
  },
};

const GOOGLE_SCROLL_SEED_ID = 'scroll-google-solar-1';

const DUMMY_SEED_SCROLL_IDS = [
  'scroll-dummy-greenvolt',
  'scroll-dummy-sunpower',
  'scroll-dummy-netmeter',
  'scroll-dummy-used',
];
const DUMMY_SEED_STATIC_IDS = [
  'static-dummy-lahore',
  'static-dummy-battery',
  'static-dummy-finance',
];

function findDefaultAd(list, id) {
  return list.find((a) => a.id === id);
}

function ensurePartnerAds(scrollAds, staticAds) {
  const scroll = Array.isArray(scrollAds) ? [...scrollAds] : [];
  const stat = Array.isArray(staticAds) ? [...staticAds] : [];
  if (!scroll.some((a) => a.id === PARTNER_ADS_ALWAYS.scroll.id)) {
    scroll.unshift({ ...PARTNER_ADS_ALWAYS.scroll });
  }
  if (!scroll.some((a) => a.id === GOOGLE_SCROLL_SEED_ID)) {
    const googleSeed = findDefaultAd(DEFAULT_ADVERTISEMENT_SETTINGS.scrollAds, GOOGLE_SCROLL_SEED_ID);
    if (googleSeed) {
      const insertAt = scroll.findIndex((a) => a.id === PARTNER_ADS_ALWAYS.scroll.id);
      const at = insertAt >= 0 ? insertAt + 1 : 1;
      scroll.splice(at, 0, { ...googleSeed });
    }
  }
  if (!stat.some((a) => a.id === PARTNER_ADS_ALWAYS.static.id)) {
    stat.unshift({ ...PARTNER_ADS_ALWAYS.static });
  }
  for (const id of DUMMY_SEED_SCROLL_IDS) {
    if (!scroll.some((a) => a.id === id)) {
      const seed = findDefaultAd(DEFAULT_ADVERTISEMENT_SETTINGS.scrollAds, id);
      if (seed) scroll.push({ ...seed });
    }
  }
  for (const id of DUMMY_SEED_STATIC_IDS) {
    if (!stat.some((a) => a.id === id)) {
      const seed = findDefaultAd(DEFAULT_ADVERTISEMENT_SETTINGS.staticAds, id);
      if (seed) stat.push({ ...seed });
    }
  }
  return { scrollAds: scroll, staticAds: stat };
}

export function normalizeAdvertisementSettings(raw) {
  const base = { ...DEFAULT_ADVERTISEMENT_SETTINGS };
  if (!raw || typeof raw !== 'object') return base;

  let scrollAds =
    Array.isArray(raw.scrollAds) && raw.scrollAds.length > 0 ? raw.scrollAds : base.scrollAds;
  let staticAds =
    Array.isArray(raw.staticAds) && raw.staticAds.length > 0 ? raw.staticAds : base.staticAds;
  ({ scrollAds, staticAds } = ensurePartnerAds(scrollAds, staticAds));

  return {
    ...base,
    ...raw,
    enabled: raw.enabled !== false,
    scrollEnabled: raw.scrollEnabled !== false,
    staticEnabled: raw.staticEnabled !== false,
    googleAdsInMarquee: raw.googleAdsInMarquee !== false,
    googleAdSenseClientId:
      typeof raw.googleAdSenseClientId === 'string' ? raw.googleAdSenseClientId : base.googleAdSenseClientId,
    packages: Array.isArray(raw.packages) && raw.packages.length > 0 ? raw.packages : base.packages,
    scrollAds,
    staticAds,
  };
}

/** Partner, Google, and static items in scroll order — one continuous marquee */
export function collectMarqueeAds(adCfg) {
  const scrollAds = (adCfg.scrollAds || []).filter((a) => a.isActive !== false);
  const staticAds = (adCfg.staticAds || []).filter((a) => a.isActive !== false);
  const stripScroll = adCfg.scrollEnabled !== false ? scrollAds : [];
  const stripStatic = adCfg.staticEnabled !== false ? staticAds : [];
  const ordered = [...stripScroll];
  for (const s of stripStatic) {
    if (!ordered.some((a) => a.id === s.id)) ordered.push(s);
  }
  if (adCfg.googleAdsInMarquee === false) {
    return ordered.filter((a) => a.adType !== 'google' && a.packageId !== 'google');
  }
  const seen = new Set();
  return ordered.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
