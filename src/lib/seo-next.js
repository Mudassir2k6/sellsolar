import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO, canonicalPage, DEFAULT_KEYWORDS } from './seo';

const SLUG_ALIASES = {
  'today-prices': 'prices',
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
      url: SITE_URL,
      logo: `${SITE_URL}/apple-touch-icon.png`,
      email: 'info@sellsolar.pk',
      sameAs: [],
      areaServed: {
        '@type': 'Country',
        name: 'Pakistan',
      },
      description:
        'Pakistan marketplace to sell and buy used and new solar panels, inverters and batteries with live solar prices.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
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
      name: 'SellSolar Pakistan Solar Load & System Calculator',
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
        'Accurately calculate household appliance wattage, required solar inverter size, solar panel count, and battery backup requirements in Pakistan.',
    });
  } else if (key === 'prices') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: "What is today's solar panel price per watt in Pakistan?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Today's verified benchmark rates for Tier-1 A-grade solar panels (Canadian Solar, Aiko, Jinko, LONGi, JA Solar) range between Rs 34.00 and Rs 44.50 per watt in Pakistan.",
          },
        },
        {
          '@type': 'Question',
          name: 'What is the price of hybrid solar inverters in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hybrid solar inverters in Pakistan typically range from Rs 112,000 for 3kW/4kW models to Rs 226,000 for 6kW units, and Rs 374,000+ for 10kW/12kW on-grid and hybrid systems.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much do lithium solar batteries cost in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A 5.12kWh 48V/51.2V 100Ah LiFePO4 lithium battery ranges from Rs 240,000 to Rs 275,000, while tubular batteries range from Rs 32,000 to Rs 55,000.',
          },
        },
      ],
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

