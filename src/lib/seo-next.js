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
