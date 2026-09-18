'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/SellSolarApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading SellSolar...</span>
      </div>
    </div>
  ),
});

export default function SellSolarClient({ initialPathname, initialSlug }) {
  return <App initialPathname={initialPathname} initialSlug={initialSlug} />;
}
