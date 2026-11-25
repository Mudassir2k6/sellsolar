'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'sellsolar_deploy_build_id';

/**
 * Static export + SPA: an open tab (e.g. Cursor preview) keeps old JS after deploy.
 * Poll build-version.json (never cached) and hard-reload once when the live build changes.
 */
export default function DeployVersionWatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`/build-version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const remoteId = String(data?.buildId || '').trim();
        if (!remoteId || cancelled) return;

        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) {
          sessionStorage.setItem(STORAGE_KEY, remoteId);
          return;
        }
        if (stored !== remoteId) {
          sessionStorage.setItem(STORAGE_KEY, remoteId);
          window.location.reload();
        }
      } catch {
        // ignore offline / preview without build file
      }
    };

    check();
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(check, 3 * 60 * 1000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, []);

  return null;
}