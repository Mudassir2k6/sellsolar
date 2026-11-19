'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  PARTNER_AD_EVENT,
  getApprovedPartnerAdsForMarquee,
} from '../lib/partnerAdSubmissions';

/**
 * Desktop-only (xl+) sponsored slot on the right of the home hero.
 * - Shows the first approved partner banner when one exists (same source as the marquee).
 * - Otherwise shows an "Advertise here" call-to-action that opens the packages page.
 */
export default function HeroSideAdCard({ onAdvertise, onVerifyPlates }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const refresh = () => {
      try {
        setAd(getApprovedPartnerAdsForMarquee()[0] || null);
      } catch {
        setAd(null);
      }
    };
    refresh();
    window.addEventListener(PARTNER_AD_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PARTNER_AD_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const isExternal = ad?.linkUrl && /^https?:\/\//i.test(ad.linkUrl);
  const cardBase =
    'block rounded-2xl border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-2.5 text-left overflow-hidden';

  return (
    <aside
      aria-label="Sponsored"
      className="hidden xl:flex absolute right-0 inset-y-0 w-52 2xl:w-56 flex-col gap-2 overflow-hidden"
    >
      {ad ? (
        <a
          href={isExternal ? ad.linkUrl : ad.linkUrl || undefined}
          target={isExternal ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`${cardBase} min-h-0 flex-1 border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 transition-colors`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sponsored</p>
          {ad.imageUrl ? (
            <img src={ad.imageUrl} alt={ad.title} className="mt-1 h-16 w-full rounded-lg object-cover" />
          ) : (
            <div className="mt-1 flex h-16 w-full items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <Megaphone className="h-6 w-6 text-amber-600" />
            </div>
          )}
          <p className="mt-2 truncate text-xs font-extrabold text-gray-900 dark:text-white">{ad.title}</p>
          <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{ad.subtitle}</p>
        </a>
      ) : (
        <button
          type="button"
          onClick={onAdvertise}
          className={`${cardBase} min-h-0 w-full flex-1 border-dashed border-amber-300 dark:border-amber-700/70 hover:border-amber-500 transition-colors cursor-pointer`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sponsored slot</p>
          <div className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
            <Megaphone className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-1.5 text-xs font-extrabold text-gray-900 dark:text-white">Your brand here</p>
          <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">Reach buyers across Pakistan</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            View packages <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      )}

      {onVerifyPlates ? (
        <button
          type="button"
          onClick={onVerifyPlates}
          className={`${cardBase} w-full shrink-0 border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400 transition-colors cursor-pointer`}
        >
          <p className="flex items-center gap-1 text-[11px] font-extrabold text-gray-900 dark:text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verify before you buy
          </p>
          <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">Check used plates for Tier-1 quality.</p>
        </button>
      ) : null}
    </aside>
  );
}
