'use client';

import React, { useEffect, useRef } from 'react';

let adsenseScriptRequested = false;

function loadAdSenseScript(clientId) {
  if (!clientId || typeof window === 'undefined' || adsenseScriptRequested) return;
  adsenseScriptRequested = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

export default function GoogleMarqueeAdCard({ ad, clientId, className, isLoopClone }) {
  const insRef = useRef(null);
  const slotId = ad.googleSlotId || '';
  const showLiveUnit = Boolean(clientId && slotId && !isLoopClone);

  useEffect(() => {
    if (!showLiveUnit) return;
    loadAdSenseScript(clientId);
    try {
      const el = insRef.current;
      if (el && !el.getAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      /* Ad blockers / script not ready */
    }
  }, [showLiveUnit, clientId, slotId]);

  return (
    <div
      className={`shrink-0 flex items-center gap-3 min-w-[260px] max-w-[320px] rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-2 ${className || ''}`}
      data-ad-google-marquee={ad.id}
    >
      {showLiveUnit ? (
        <ins
          ref={insRef}
          className="adsbygoogle block overflow-hidden rounded-lg"
          style={{ display: 'block', width: 280, height: 72 }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="rectangle"
        />
      ) : (
        <>
          <div className="h-10 w-14 rounded-lg bg-white dark:bg-gray-900 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center shrink-0 text-[9px] font-black text-blue-600 dark:text-blue-300">
            Ad
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {ad.title || 'Sponsored'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {ad.subtitle || 'Google Ads — scrolls with partner banners'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
