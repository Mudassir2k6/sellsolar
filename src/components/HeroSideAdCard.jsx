'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Megaphone, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  PARTNER_AD_EVENT,
  getApprovedPartnerAdsForMarquee,
} from '../lib/partnerAdSubmissions';
import { useAutoScrollLoop } from '../lib/useAutoScrollLoop';

const cardBase =
  'rounded-2xl border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-2.5 text-left overflow-hidden';

/** One sponsored banner (approved partner ad) */
function BannerItem({ ad }) {
  const isExternal = ad.linkUrl && /^https?:\/\//i.test(ad.linkUrl);
  const body = (
    <>
      {ad.imageUrl ? (
        <img src={ad.imageUrl} alt={ad.title} className="h-16 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-16 w-full items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
          <Megaphone className="h-6 w-6 text-amber-600" />
        </div>
      )}
      <p className="mt-1.5 truncate text-xs font-extrabold text-gray-900 dark:text-white">{ad.title}</p>
      <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{ad.subtitle}</p>
    </>
  );
  const className =
    'block rounded-xl border border-amber-200/80 dark:border-amber-900/50 p-1.5 hover:border-amber-400 transition-colors';

  return ad.linkUrl ? (
    <a
      href={ad.linkUrl}
      target={isExternal ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={className}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** "Your brand here" call-to-action slot */
function AdvertiseItem({ onAdvertise }) {
  return (
    <button
      type="button"
      onClick={onAdvertise}
      className="block w-full rounded-xl border border-dashed border-amber-300 dark:border-amber-700/70 p-1.5 text-left hover:border-amber-500 transition-colors cursor-pointer"
    >
      <div className="flex h-16 w-full items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
        <Megaphone className="h-5 w-5 text-amber-500" />
      </div>
      <p className="mt-1.5 text-xs font-extrabold text-gray-900 dark:text-white">Your brand here</p>
      <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">Reach buyers across Pakistan</p>
      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
        View packages <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  );
}

/**
 * Desktop-only (xl+) right column of the home hero:
 *  - "Sponsored" box that auto-scrolls through every approved partner banner (+ an "Advertise here" slot)
 *  - "Verify plates before buy" shortcut
 */
export default function HeroSideAdCard({ onAdvertise, onVerifyPlates }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const refresh = () => {
      try {
        setAds(getApprovedPartnerAdsForMarquee());
      } catch {
        setAds([]);
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

  // Approved banners first, then one "Advertise here" slot so there is always a call-to-action.
  const items = useMemo(
    () => [...ads.map((ad) => ({ key: `ad-${ad.id}`, ad })), { key: 'advertise-here', ad: null }],
    [ads]
  );
  const loops = items.length > 1; // two or more entries -> scroll; a lone CTA stays still

  const scrollRef = useRef(null);
  const { pause, resume } = useAutoScrollLoop(scrollRef, {
    enabled: loops,
    resetKey: items.length,
    pxPerSecond: 20,
  });

  const renderItems = (prefix) =>
    items.map((item) => (
      <div key={`${prefix}-${item.key}`} className="pb-2">
        {item.ad ? <BannerItem ad={item.ad} /> : <AdvertiseItem onAdvertise={onAdvertise} />}
      </div>
    ));

  return (
    <aside
      aria-label="Sponsored"
      className="hidden xl:flex absolute right-0 inset-y-0 w-52 2xl:w-56 flex-col gap-2 overflow-hidden"
    >
      <div className={`${cardBase} flex min-h-0 flex-1 flex-col border-amber-200/80 dark:border-amber-900/50`}>
        <p className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Sponsored{ads.length > 0 ? ` · ${ads.length} banner${ads.length > 1 ? 's' : ''}` : ''}
        </p>
        <div
          ref={scrollRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          aria-label="Sponsored banners (scroll automatically, hover to pause)"
          className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div>{renderItems('a')}</div>
          {/* Duplicate copy makes the loop seamless; hidden from screen readers */}
          {loops ? <div aria-hidden="true">{renderItems('b')}</div> : null}
        </div>
      </div>

      {onVerifyPlates ? (
        <button
          type="button"
          onClick={onVerifyPlates}
          className={`${cardBase} block w-full shrink-0 border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400 transition-colors cursor-pointer`}
        >
          <p className="flex items-center gap-1 text-[11px] font-extrabold text-gray-900 dark:text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verify plates before buy
          </p>
          <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">Check used plates for Tier-1 quality.</p>
        </button>
      ) : null}
    </aside>
  );
}
