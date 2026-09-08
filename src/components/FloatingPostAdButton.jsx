import React from 'react';
import { CirclePlus, Sparkles } from 'lucide-react';

export default function FloatingPostAdButton({ onPostAd, className = '' }) {
  if (!onPostAd) return null;

  return (
    <button
      type="button"
      id="floating-post-ad-btn"
      onClick={onPostAd}
      aria-label="Post Free Solar Ad"
      title="Post an Ad — Sell Solar Panels, Inverters & Batteries Free"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500 text-white font-bold text-xs sm:text-sm px-4 py-3 sm:px-5 sm:py-3.5 shadow-xl shadow-primary-600/30 hover:shadow-2xl hover:shadow-primary-600/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-200 border border-white/25 focus:outline-none focus:ring-4 focus:ring-primary-500/30 group ${className}`}
    >
      <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 group-hover:rotate-90 transition-all duration-300">
        <CirclePlus className="h-4 w-4 sm:h-5 sm:w-5 text-white stroke-[2.5]" />
      </span>
      <span className="font-extrabold tracking-wide whitespace-nowrap text-white text-xs sm:text-sm drop-shadow-xs">
        Post Ad
      </span>
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
        <Sparkles className="h-2.5 w-2.5 text-amber-200" />
        Free
      </span>
    </button>
  );
}
