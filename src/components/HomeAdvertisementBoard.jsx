'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, ArrowRight, ExternalLink, Plus } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { normalizeAdvertisementSettings } from '../lib/advertisementDefaults';
import {
  createAdvertiseHerePlaceholders,
  getApprovedPartnerAdsForMarquee,
  PARTNER_AD_EVENT,
} from '../lib/partnerAdSubmissions';
import AdvertiseHereForm from './AdvertiseHereForm';

function resolveHref(linkUrl, onNavigate) {
  if (!linkUrl) return null;
  if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) return linkUrl;
  const path = linkUrl.replace(/^\//, '');
  if (onNavigate && path && !path.includes('/')) {
    return { type: 'nav', page: path };
  }
  return { type: 'href', href: linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}` };
}

function AdLink({ ad, onNavigate, className, children, onAdvertiseClick }) {
  if (ad?.adType === 'advertise_here') {
    return (
      <button type="button" onClick={onAdvertiseClick} className={`text-left ${className}`}>
        {children}
      </button>
    );
  }
  const target = resolveHref(ad.linkUrl, onNavigate);
  if (!target) {
    return <div className={className}>{children}</div>;
  }
  if (target.type === 'nav') {
    return (
      <button type="button" onClick={() => onNavigate(target.page)} className={`text-left ${className}`}>
        {children}
      </button>
    );
  }
  return (
    <a
      href={typeof target === 'string' ? target : target.href}
      className={className}
      target={typeof target === 'string' || target.href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function MarqueeRow({ ads, onNavigate, onAdvertiseClick }) {
  if (!ads.length) return null;
  const track = [...ads, ...ads];
  const baseCard =
    'shrink-0 flex items-center gap-3 min-w-[260px] max-w-[320px] rounded-xl border px-3 py-2 transition-colors';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
      <MarqueeStyles />
      <div className="ad-marquee-track flex items-stretch gap-3 py-2.5 pl-3">
        {track.map((ad, idx) => {
          const isAdvertise = ad.adType === 'advertise_here';
          const cardClass = isAdvertise
            ? `${baseCard} border-dashed border-amber-300 dark:border-amber-700/70 bg-amber-50/70 dark:bg-amber-950/30 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer`
            : `${baseCard} border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/40 hover:border-amber-300/80 dark:hover:border-amber-700/50`;

          return (
            <AdLink
              key={`${ad.id}-${idx}`}
              ad={ad}
              onNavigate={onNavigate}
              onAdvertiseClick={onAdvertiseClick}
              className={cardClass}
            >
              {isAdvertise ? (
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-900/60 shrink-0">
                  <Plus className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
              ) : ad.imageUrl ? (
                <img src={ad.imageUrl} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 shrink-0">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{ad.title}</p>
                <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {ad.subtitle || ad.advertiser || (isAdvertise ? 'Open form to submit' : 'Sponsored')}
                </p>
              </div>
            </AdLink>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeAdvertisementBoard({ onNavigate, configOverride }) {
  const { settings } = useSiteSettings();
  const adCfg = normalizeAdvertisementSettings(configOverride || settings?.advertisementSettings);
  const [formOpen, setFormOpen] = useState(false);
  const [approvedAds, setApprovedAds] = useState([]);

  const refreshApproved = () => {
    setApprovedAds(getApprovedPartnerAdsForMarquee());
  };

  useEffect(() => {
    refreshApproved();
    const onUpdate = () => refreshApproved();
    window.addEventListener(PARTNER_AD_EVENT, onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener(PARTNER_AD_EVENT, onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  if (!adCfg.enabled) return null;

  const packagesLink = adCfg.packagesPageLink || '/pricing';
  const packagesNav = resolveHref(packagesLink, onNavigate);

  // Homepage marquee: approved partner banners + "Advertise here" slots (no demo clutter)
  const movingAds = [...approvedAds, ...createAdvertiseHerePlaceholders(8)];

  return (
    <section
      id="sellsolar-home-ads"
      data-sellsolar-ad-board="true"
      className="border-b-2 border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-gray-950"
    >
      <div className="container-page space-y-3 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Megaphone className="h-3.5 w-3.5 text-amber-500" />
            <span>Partner advertisements</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] normal-case text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Advertise here — free launch slots
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
            >
              <Plus className="h-3 w-3" />
              Submit banner
            </button>
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
        </div>

        <MarqueeRow
          ads={movingAds}
          onNavigate={onNavigate}
          onAdvertiseClick={() => setFormOpen(true)}
        />
      </div>

      <AdvertiseHereForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
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
        animation: adMarquee 280s linear infinite;
        will-change: transform;
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
