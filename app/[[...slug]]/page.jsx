import SellSolarClient from '../sellsolar-client';
import { buildMetadataForSlug, getJsonLdForSlug } from '@/lib/seo-next';
import SeoCrawlerFallback from '@/components/SeoCrawlerFallback';
import { PAGE_SEO, canonicalPage } from '@/lib/seo';

const STATIC_SLUGS = [
  [],
  ['prices'],
  ['today-prices'],
  ['solar-plates-price'],
  ['news'],
  ['solar-news'],
  ['calculator'],
  ['load-calculator'],
  ['verification'],
  ['tier-1-verification'],
  ['dealers'],
  ['install'],
  ['installation'],
  ['request-installation'],
  ['login'],
  ['post-ad'],
  ['dashboard'],
  ['admin'],
  ['admin-dashboard'],
  ['inbox'],
  ['password'],
  ['forgot-password'],
  ['reset-password'],
  ['change-password'],
  ['about'],
  ['about-us'],
  ['careers'],
  ['press'],
  ['blog'],
  ['buy-solar'],
  ['sell-solar'],
  ['used-solar'],
  ['solar-price'],
  ['solar-inverter'],
  ['solar-batteries'],
  ['solar-panels'],
  ['solar-plates'],
  ['solar-plate'],
  ['how-it-works'],
  ['pricing'],
  ['help'],
  ['help-center'],
  ['contact'],
  ['contact-us'],
  ['safety'],
  ['safety-tips'],
  ['report-issue'],
  ['report'],
  ['terms'],
  ['terms-of-service'],
  ['privacy'],
  ['privacy-policy'],
  ['cookies'],
  ['cookie-policy'],
  ['disclaimer'],
];

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = STATIC_SLUGS.map((slug) => ({ slug }));
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://zgfycrnmivfybbclflwf.supabase.co/rest/v1/solar_listings?select=id', {
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item?.id) {
            params.push({ slug: ['listing', item.id] });
          }
        });
      }
    }
  } catch (err) {
    // Non-blocking fallback to static slugs if Supabase is unreachable or times out
  }
  return params;
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  return buildMetadataForSlug(resolved?.slug);
}

export default async function CatchAllPage({ params }) {
  const resolved = await params;
  const slugArray = resolved?.slug || [];
  const pathname = slugArray.length > 0 ? `/${slugArray.join('/')}` : '/';
  const jsonLd = getJsonLdForSlug(slugArray);
  const rawKey = slugArray.length > 0 ? slugArray[0] : 'home';
  const meta = PAGE_SEO[rawKey] || PAGE_SEO[canonicalPage(rawKey)] || PAGE_SEO.home;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Search Crawler Static Content (Immediately indexed by Googlebot, Bingbot, Yahoo, and DuckDuckGo without requiring JS execution) */}
      <SeoCrawlerFallback slug={slugArray} meta={meta} />
      <SellSolarClient
        key={pathname}
        initialPathname={pathname}
        initialSlug={slugArray}
      />
    </>
  );
}
