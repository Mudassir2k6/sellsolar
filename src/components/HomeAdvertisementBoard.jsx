'use client';

import React from 'react';
import { Megaphone, ArrowRight, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { normalizeAdvertisementSettings, collectMarqueeAds } from '../lib/advertisementDefaults';
import GoogleMarqueeAdCard from './GoogleMarqueeAdCard';

function isGoogleMarqueeAd(ad) {
  return ad?.adType === 'google' || ad?.packageId === 'google';
}

function resolveAdSenseClientId(adCfg) {
  const fromSettings = (adCfg.googleAdSenseClientId || '').trim();
  if (fromSettings) return fromSettings;
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
    return String(process.env.NEXT_PUBLIC_ADSENSE_CLIENT).trim();
  }
  return '';
}

function resolveHref(linkUrl, onNavigate) {
  if (!linkUrl) return null;
  if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) return linkUrl;
  const path = linkUrl.replace(/^\//, '');
  if (onNavigate && path && !path.includes('/')) {
    return { type: 'nav', page: path };
  }
  return { type: 'href', href: linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}` };
}

function MarqueeRow({ ads, onNavigate, adSenseClientId, reverse }) {
  if (!ads.length) return null;
  const track = [...ads, ...ads];
  const cardClass =
    'shrink-0 flex items-center gap-3 min-w-[260px] max-w-[320px] rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/40 px-3 py-2 hover:border-amber-300/80 dark:hover:border-amber-700/50 transition-colors';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
      <MarqueeStyles />
      <div
        className={`ad-marquee-track flex items-stretch gap-3 py-2.5 pl-3 ${
          reverse ? 'ad-marquee-track--reverse' : ''
        }`}
      >
        {track.map((ad, idx) => {
          const isLoopClone = idx >= ads.length;
          if (isGoogleMarqueeAd(ad)) {
            return (
              <GoogleMarqueeAdCard
                key={`${ad.id}-${idx}`}
                ad={ad}
                clientId={adSenseClientId}
                isLoopClone={isLoopClone}
              />
            );
          }
          return (
            <AdLink
              key={`${ad.id}-${idx}`}
              ad={ad}
              onNavigate={onNavigate}
              className={cardClass}
            >
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt=""
                  className="h-10 w-14 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-14 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{ad.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {ad.subtitle || ad.advertiser || 'Sponsored'}
                </p>
              </div>
            </AdLink>
          );
        })}
      </div>
    </div>
  );
}

function AdLink({ ad, onNavigate, className, children }) {
  const target = resolveHref(ad.linkUrl, onNavigate);
  if (!target) {
    return <div className={className}>{children}</div>;
  }
  if (target.type === 'nav') {
    return (
      <button
        type="button"
        onClick={() => onNavigate(target.page)}
        className={`text-left ${className}`}
      >
        {children}
      </button>
    );
  }
  return (
    <a href={target.href} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function HomeAdvertisementBoard({ onNavigate, configOverride }) {
  const { settings } = useSiteSettings();
  const adCfg = normalizeAdvertisementSettings(
    configOverride || settings?.advertisementSettings
  );

  if (!adCfg.enabled) return null;

  const packagesLink = adCfg.packagesPageLink || '/pricing';
  const packagesNav = resolveHref(packagesLink, onNavigate);
  const adSenseClientId = resolveAdSenseClientId(adCfg);
  const movingAds = collectMarqueeAds(adCfg);
  if (movingAds.length === 0) return null;

  return (
    <section
      id="sellsolar-home-ads"
      data-sellsolar-ad-board="true"
      className="border-b-2 border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-gray-950"
    >
      <div className="container-page py-3 sm:py-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Megaphone className="h-3.5 w-3.5 text-amber-500" />
            <span>Partner advertisements</span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] normal-case">
              Free launch slots running
            </span>
          </div>
          {packagesNav?.type === 'nav' ? (
            <button
              type="button"
              onClick={() => onNavigate(packagesNav.page)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {adCfg.packagesCtaLabel || 'View packages'}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <a
              href={packagesNav?.href || '/pricing'}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {adCfg.packagesCtaLabel || 'View packages'}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <MarqueeRow ads={movingAds} onNavigate={onNavigate} adSenseClientId={adSenseClientId} />
      </div>
    </section>
  );
}

function MarqueeStyles() {
  return (
    <style>{`
      @keyframes adMarquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ad-marquee-track {
        width: max-content;
        /* Match top LIVE RATES ticker pace (280s for -50% seamless loop) */
        animation: adMarquee 280s linear infinite;
        will-change: transform;
      }
      .ad-marquee-track--reverse {
        animation-direction: reverse;
        animation-duration: 300s;
      }
      .ad-marquee-track:hover {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .ad-marquee-track {
          animation-duration: 420s;
        }
      }
    `}</style>
  );
}
