'use client';

import SellSolarClient from './sellsolar-client';

/**
 * Unknown URLs render the full SellSolar app so the shared main top bar,
 * footer and the in-app 404 page (with helpful links) show up — not a stripped-down header.
 */
export default function NotFound() {
  return <SellSolarClient initialPathname="/__not-found__" initialSlug={['__not-found__']} />;
}
