'use client';

/** Lightweight first paint while the main SellSolarApp chunk downloads */
export default function SellSolarBootShell() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="container-page flex h-14 items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 font-black text-lg tracking-tight text-slate-900 dark:text-white">
            <span className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center text-white text-sm">☀</span>
            <span>Sell<span className="text-amber-500">Solar</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <a href="/prices" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Today&apos;s Rates</a>
            <a href="/blog" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Blog</a>
            <a href="/calculator" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Load Calculator</a>
            <a href="/dealers" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Verified Dealers</a>
            <a href="/verification" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Verify Plates</a>
            <a href="/install" className="px-2.5 py-1.5 rounded-lg hover:text-amber-600">Installation</a>
          </nav>
        </div>
      </div>

      <div className="container-page pt-20 sm:pt-24 pb-6">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <SkeletonBlock className="mx-auto h-6 w-48 rounded-full" />
          <SkeletonBlock className="mx-auto h-10 w-full max-w-xl" />
          <SkeletonBlock className="mx-auto h-10 w-full max-w-lg" />
          <SkeletonBlock className="mx-auto mt-4 h-11 w-full max-w-md rounded-xl" />
        </div>
      </div>

      <div className="container-page pb-4">
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Loading SellSolar marketplace…
      </p>
    </div>
  );
}

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`rounded-md bg-slate-200/80 dark:bg-slate-800/80 animate-pulse ${className}`}
      aria-hidden
    />
  );
}
