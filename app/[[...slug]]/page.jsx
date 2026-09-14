import SellSolarClient from '../sellsolar-client';

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

export default function CatchAllPage() {
  return <SellSolarClient />;
}
