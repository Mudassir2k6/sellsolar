import SellSolarClient from '../sellsolar-client';
import { buildMetadataForSlug, getGlobalJsonLd } from '@/lib/seo-next';

const STATIC_SLUGS = [
  [],
  ['prices'],
  ['today-prices'],
  ['calculator'],
  ['load-calculator'],
  ['dealers'],
  ['install'],
  ['installation'],
  ['request-installation'],
  ['login'],
  ['post-ad'],
  ['dashboard'],
  ['admin'],
  ['admin-dashboard'],
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
  const jsonLd = getGlobalJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SellSolarClient
        key={pathname}
        initialPathname={pathname}
        initialSlug={slugArray}
      />
    </>
  );
}
