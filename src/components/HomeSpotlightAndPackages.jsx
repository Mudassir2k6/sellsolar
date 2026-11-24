'use client';

import React from 'react';
import { Megaphone, Plus, ArrowRight, Check, Star } from 'lucide-react';
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

/**
 * Compact advertising + listing plans teaser shown after the listings (above the footer).
 * Prices come from the same admin-editable settings as the /pricing page.
 */
export function HomePackagesTeaser({ onNavigate }) {
  const { settings } = useSiteSettings();
  const adCfg = normalizeAdvertisementSettings(settings?.advertisementSettings);
  if (adCfg.enabled === false || adCfg.packagesTeaserEnabled === false) return null;

  const packages = (adCfg.packages || []).filter((p) => p.isActive !== false);
  const plans = (adCfg.listingPlans || []).filter((p) => p.isActive !== false);
  if (packages.length === 0 && plans.length === 0) return null;
  const packagesLink = adCfg.packagesPageLink || '/pricing';

  return (
    <section
      id="sellsolar-home-packages"
      aria-label="Advertising packages and listing plans"
      className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200/60 dark:border-gray-800"
    >
      <div className="container-page py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Advertise &amp; sell faster on SellSolar
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Homepage banner packages and listing plans — start free.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goTo(onNavigate, packagesLink)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-700 transition-colors"
          >
            View all plans <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {packages.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Homepage advertisement</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => goTo(onNavigate, packagesLink)}
                  className={`relative text-left rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs hover:shadow-sm transition-all cursor-pointer ${
                    pkg.highlighted
                      ? 'border-2 border-violet-500'
                      : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {pkg.highlighted && (
                    <span className="absolute -top-2.5 left-3 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                      Best value
                    </span>
                  )}
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{pkg.name}</p>
                  <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                    {pkg.priceLabel || `Rs. ${pkg.price}`}{' '}
                    <span className="text-[10px] font-medium text-gray-400">/ {pkg.period}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                    {(pkg.features || []).slice(0, 2).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {plans.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Marketplace listing plans</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => goTo(onNavigate, plan.ctaLink || 'pricing')}
                  className={`text-left rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs hover:shadow-sm transition-all cursor-pointer ${
                    plan.highlighted
                      ? 'border-2 border-primary-500'
                      : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.name}</p>
                    {plan.badge ? (
                      <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                    {plan.priceLabel}{' '}
                    <span className="text-[10px] font-medium text-gray-400">/ {plan.period}</span>
                  </p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-gray-600 dark:text-gray-300">
                    <FeatureText text={(plan.features || [])[0] || plan.description} />
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400">
                    {plan.ctaText || 'Learn more'} <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export { FeatureText };
