'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Fullscreen photo viewer for listing detail: keyboard (Esc / arrows), swipe on touch,
 * thumbnail strip and "n / total" counter.
 */
export default function ListingLightbox({ images, index, onIndexChange, onClose, alt, getFallback }) {
  const touchStartX = useRef(null);
  const total = images.length;

  const go = useCallback(
    (delta) => {
      if (total < 2) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'Escape') onClose();
      else if (ev.key === 'ArrowRight') go(1);
      else if (ev.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  if (!total) return null;

  const onTouchStart = (ev) => {
    touchStartX.current = ev.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (ev) => {
    if (touchStartX.current == null) return;
    const dx = (ev.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photos`}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm font-bold tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="rounded-full bg-white/10 p-2 hover:bg-white/20 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center min-h-0 px-2 sm:px-12"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {total > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 sm:left-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <img
          src={images[index]}
          alt={`${alt} photo ${index + 1}`}
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
          onError={(e) => {
            e.currentTarget.onerror = null;
            if (getFallback) e.currentTarget.src = getFallback();
          }}
          className="max-h-full max-w-full select-none object-contain"
          draggable={false}
        />
        {total > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 sm:right-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={`${i}-${src.slice(0, 24)}`}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer ${
                i === index ? 'border-amber-400' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
