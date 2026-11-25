'use client';

import React from 'react';
import { Megaphone, Plus, ArrowRight, Star } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { normalizeAdvertisementSettings, collectSpotlightAds } from '../lib/advertisementDefaults';
import { AdLink } from './HomeAdvertisementBoard';

const SPOTLIGHT_SLOTS = 2;

function goTo(onNavigate, link) {
  const path = String(link || 'pricing').replace(/^\//, '');
  if (onNavigate && path && !path.includes('/')) onNavigate(path);
  else if (typeof window !== 'undefined') window.location.href = `/${path}`;
}

/** Renders "**bold** rest" markup used by admin-editable plan features. */
function FeatureText({ text }) {
  const parts = String(text || '').split('**');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </>
  );
}

/**
 * Static Spotlight slot: large cards directly under the homepage scroll strip.
 * Sells the "Static Spotlight" / "Combo" packages. Empty slots become "Advertise here" cards.
 */
export function HomeStaticSpotlight({ onNavigate }) {
  const { settings } = useSiteSettings();
  const adCfg = normalizeAdvertisementSettings(settings?.advertisementSettings);
  if (adCfg.enabled === false || adCfg.staticEnabled === false || adCfg.spotlightEnabled === false) return null;

  const ads = collectSpotlightAds(adCfg, SPOTLIGHT_SLOTS);
  // No live spotlight ad -> show nothing (no empty "Advertise here" placeholder block).
  if (ads.length === 0) return null;
  const staticPkg = (adCfg.packages || []).find((p) => p.id === 'static' && p.isActive !== false);
  const slots = [
    ...ads.map((ad) => ({ type: 'ad', ad })),
    ...Array.from({ length: Math.max(0, SPOTLIGHT_SLOTS - ads.length) }, (_, i) => ({ type: 'empty', key: `empty-${i}` })),
  ];
  const packagesLink = adCfg.packagesPageLink || '/pricing';

  return (
    <section
      id="sellsolar-home-spotlight"
      aria-label="Featured spotlight advertisements"
      className="border-b border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-950"
    >
      <div className="container-page py-3 sm:py-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span>Featured spotlight</span>
          </div>
          <button
            type="button"
            onClick={() => goTo(onNavigate, packagesLink)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {staticPkg ? `Book a spotlight slot — ${staticPkg.priceLabel || ''}`.replace(/\s—\s$/, '') : 'Book a spotlight slot'}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot) =>
            slot.type === 'ad' ? (
              <AdLink
                key={slot.ad.id}
                ad={slot.ad}
                onNavigate={onNavigate}
                className="group flex items-stretch gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-sm transition-all"
              >
                {slot.ad.imageUrl ? (
                  <img
                    src={slot.ad.imageUrl}
                    alt={slot.ad.title || 'Sponsored'}
                    loading="lazy"
                    className="h-20 w-28 sm:h-24 sm:w-36 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-28 sm:h-24 sm:w-36 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-950/20 shrink-0">
                    <Megaphone className="h-6 w-6 text-amber-600" />
                  </div>
                )}
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Sponsored{slot.ad.advertiser ? ` · ${slot.ad.advertiser}` : ''}
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">{slot.ad.title}</p>
                  {slot.ad.subtitle ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">{slot.ad.subtitle}</p>
                  ) : null}
                </div>
              </AdLink>
            ) : (
              <button
                key={slot.key}
                type="button"
                onClick={() => goTo(onNavigate, packagesLink)}
                className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/70 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-left hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <div className="flex h-20 w-28 sm:h-24 sm:w-36 items-center justify-center rounded-xl bg-amber-200/70 dark:bg-amber-900/50 shrink-0">
                  <Plus className="h-7 w-7 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Advertise here</p>
                  <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-300">
                    Your brand on the homepage, right under the hero
                    {staticPkg?.priceLabel ? ` — from ${staticPkg.priceLabel} / ${staticPkg.period}` : ''}.
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    View packages <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export { FeatureText };
