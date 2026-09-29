import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO, canonicalPage, DEFAULT_KEYWORDS } from './seo';

const SLUG_ALIASES = {
  'today-prices': 'prices',
  'solar-plates-price': 'prices',
  'plates-price': 'prices',
  'solar-rates': 'prices',
  'solar-plates': 'solar-panels',
  'solar-plate': 'solar-panels',
  'solar-invertor': 'solar-inverter',
  'solar-battery': 'solar-batteries',
  'tier-1-verification': 'verification',
  'panel-verification': 'verification',
  'tier1-verification': 'verification',
  'load-calculator': 'calculator',
  'about-us': 'about',
  'help-center': 'help',
  'contact-us': 'contact',
  'safety-tips': 'safety',
  report: 'report-issue',
  'terms-of-service': 'terms',
  'privacy-policy': 'privacy',
  'cookie-policy': 'cookies',
  installation: 'install',
  'request-installation': 'install',
  'change-password': 'password',
};

export function slugToPageKey(slug) {
  if (!slug || slug.length === 0) return 'home';
  if (slug[0] === 'listing') return 'listing-detail';
  const raw = slug.join('/');
  const first = slug[0];
  return SLUG_ALIASES[first] || SLUG_ALIASES[raw] || first;
}

export function buildMetadataForSlug(slug) {
  const key = canonicalPage(slugToPageKey(slug));
  const meta = PAGE_SEO[key] || PAGE_SEO.home;
  const path = meta.path || '/';
  const title = meta.title;
  const description = meta.description;
  const noindex = (meta.robots || '').includes('noindex');

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: meta.keywords || DEFAULT_KEYWORDS,
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    alternates: {
      canonical: path,
      languages: {
        'en-PK': path,
        'x-default': path,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export function getGlobalJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      alternateName: ['SellSolar', 'Sell Solar Pakistan', 'SellSolar.pk', 'Solar Plates Pakistan'],
      url: SITE_URL,
      logo: `${SITE_URL}/apple-touch-icon.png`,
      email: 'info@sellsolar.pk',
      sameAs: [],
      areaServed: {
        '@type': 'Country',
        name: 'Pakistan',
      },
      description:
        'Pakistan premier solar marketplace. Check live solar plates price in Pakistan, buy and sell used or new solar panels, hybrid inverters, and lithium solar batteries.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SellSolar.pk - Solar Plates, Inverters & Batteries Pakistan',
      alternateName: ['SellSolar', 'Sell Solar Pakistan'],
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function getJsonLdForSlug(slug) {
  const globalSchemas = getGlobalJsonLd();
  const key = canonicalPage(slugToPageKey(slug));
  const meta = PAGE_SEO[key] || PAGE_SEO.home;
  const path = meta.path || '/';
  const url = `${SITE_URL}${path}`;

  const schemas = [...globalSchemas];

  // BreadcrumbList schema for all pages
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ];

  if (key !== 'home' && meta.title) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: meta.title.split('|')[0].trim(),
      item: url,
    });
  }

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  });

  // Page-specific structured data
  if (key === 'calculator') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculate Solar Load & System Size in Pakistan - SellSolar',
      url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'PKR',
      },
      description:
        'Calculate solar load for home in Pakistan. Calculate total appliance wattage, required solar plates count (550W/585W), inverter capacity in kW, and lithium battery backup.',
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I calculate solar load for my home in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Add up the running wattage of all your household appliances (fans 75W–85W, LED lights 10W–18W, 1.5-ton inverter AC 1200W–1800W, refrigerator 250W). Divide total watts by 1,000 to get required continuous kW, and add a 25% safety margin to determine your ideal solar inverter and solar plates system size.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many solar plates are needed for a 5kW or 10kW solar system in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For a 5kW solar system, you need approximately 9 to 10 Tier-1 550W/585W solar plates. For a 10kW system, you need 18 to 20 solar plates producing approximately 40 to 45 units (kWh) per sunny day.',
          },
        },
      ],
    });
  } else if (key === 'dealers') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Solar Authorised Dealers & Distributors in Pakistan',
      description: 'Directory of certified and verified solar equipment dealers for Longi, Jinko, Canadian Solar, Inverex, and Growatt across Lahore, Karachi, Islamabad, Rawalpindi, and Multan.',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: '80',
    });
  } else if (key === 'prices') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: "What is today's solar plate price in Pakistan?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Today's verified wholesale benchmark rates for Tier-1 A-grade solar plates (Canadian Solar, Longi, Jinko, JA Solar, Astronergy) range between Rs 34.00 and Rs 44.50 per watt in Pakistan. A standard 550W solar plate costs around Rs 19,000 to Rs 22,500.",
          },
        },
        {
          '@type': 'Question',
          name: 'What is the price of hybrid solar inverters in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hybrid solar inverters in Pakistan typically range from Rs 112,000 for 3kW/4kW models to Rs 226,000 for 6kW units, and Rs 374,000+ for 10kW/12kW on-grid and hybrid systems (Inverex, Growatt, GoodWe, Knox, Solis).',
          },
        },
        {
          '@type': 'Question',
          name: 'How much do solar batteries cost in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A 5.12kWh 48V/51.2V 100Ah LiFePO4 lithium battery ranges from Rs 240,000 to Rs 275,000, while deep-cycle tall tubular batteries (Phoenix, Osaka, Daewoo) range from Rs 32,000 to Rs 55,000.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where can I buy and sell used solar plates in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can buy and sell verified used solar plates, inverters, and batteries directly on SellSolar.pk with zero commission across Lahore, Karachi, Islamabad, Faisalabad, and Rawalpindi.',
          },
        },
      ],
    });
  } else if (key === 'solar-panels') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Tier-1 Solar Plates & Panels in Pakistan',
      description: 'Verified Tier-1 mono PERC and TopCon solar plates for sale in Pakistan: Longi 550W/585W, Jinko 580W, Canadian Solar, and JA Solar.',
      category: 'Solar Panels & Plates',
      brand: {
        '@type': 'Brand',
        name: 'Tier-1 Solar Manufacturers',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'PKR',
        lowPrice: '18500',
        highPrice: '25500',
        offerCount: '500',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
      },
    });
  } else if (key === 'solar-inverter') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Solar Inverters & Invertors in Pakistan (Hybrid & On-Grid)',
      description: 'Find hybrid, off-grid and on-grid solar inverters for sale in Pakistan: Inverex, Growatt, GoodWe, Solis, Knox, and Huawei 3kW, 5kW, 6kW, 10kW.',
      category: 'Solar Inverters',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'PKR',
        lowPrice: '110000',
        highPrice: '550000',
        offerCount: '250',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
      },
    });
  } else if (key === 'solar-batteries') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Solar Batteries in Pakistan (Lithium LiFePO4 & Tubular)',
      description: 'Buy solar batteries in Pakistan: 48V/51.2V LiFePO4 lithium wall-mount battery packs and deep-cycle tubular backup batteries.',
      category: 'Solar Batteries',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'PKR',
        lowPrice: '32000',
        highPrice: '285000',
        offerCount: '200',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
      },
    });
  } else if (key === 'verification') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Tier 1 Solar Plates Verification Pakistan',
      serviceType: 'Solar Equipment Authenticity Verification',
      url,
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Pakistan',
      },
      description:
        'Verify serial numbers and barcode authenticity for Tier-1 solar plates in Pakistan: Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, and Sunova.',
    });
  } else if (key === 'install') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Professional Solar Installation & Net Metering Pakistan',
      serviceType: 'Solar Energy System Installation',
      url,
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Pakistan',
      },
      description:
        'Professional site assessment, rooftop mounting, hybrid inverter wiring, earthing, and net-metering assistance across major cities in Pakistan.',
    });
  } else if (key === 'contact') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact SellSolar Pakistan',
      url,
      description:
        'Get in touch with SellSolar customer support, Islamabad head office, or send an inquiry to info@sellsolar.pk.',
    });
  }

  return schemas;
}

