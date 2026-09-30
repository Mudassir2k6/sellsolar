import SellSolarClient from '../sellsolar-client';
import { buildMetadataForSlug, getJsonLdForSlug } from '@/lib/seo-next';
import SeoCrawlerFallback from '@/components/SeoCrawlerFallback';
import { PAGE_SEO, canonicalPage } from '@/lib/seo';

const STATIC_SLUGS = [
  [],
  ['prices'],
  ['today-prices'],
  ['solar-plates-price'],
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

export function generateStaticParams() {
  return STATIC_SLUGS.map((slug) => ({ slug }));
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
