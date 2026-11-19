'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Slowly auto-scrolls a vertically scrollable element in a seamless loop.
 *
 * The element must render its content TWICE (second copy aria-hidden) so the loop point is exactly
 * half of scrollHeight. Scrolling pauses while paused (hover / touch), when the tab is hidden, and
 * never runs for users who prefer reduced motion (the list stays manually scrollable).
 *
 * @param ref       ref of the scroll container
 * @param options   enabled: only run when content is taller than the box; resetKey: change it to
 *                  restart from the top (e.g. when the tab changes); pxPerSecond: speed
 * @returns         { pause, resume } handlers for mouse/touch events
 */
export function useAutoScrollLoop(ref, { enabled = true, resetKey, pxPerSecond = 22 } = {}) {
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = 0;
    if (!el || !enabled) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let raf = 0;
    let last = performance.now();
    let pos = 0;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (pausedRef.current || document.hidden) {
        pos = el.scrollTop;
      } else {
        pos += (dt * pxPerSecond) / 1000;
        const loopAt = el.scrollHeight / 2;
        if (loopAt > 0 && pos >= loopAt) pos -= loopAt;
        el.scrollTop = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, enabled, resetKey, pxPerSecond]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  return { pause, resume };
}
