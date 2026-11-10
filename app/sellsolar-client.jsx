'use client';

import dynamic from 'next/dynamic';
import SellSolarBootShell from '@/components/SellSolarBootShell';

function loadSellSolarApp() {
  return import('@/SellSolarApp').catch((err) => {
    if (typeof window !== 'undefined') {
      try {
        const lastReload = parseInt(sessionStorage.getItem('sellsolar_chunk_reload') || '0', 10);
        if (Date.now() - lastReload > 15000) {
          sessionStorage.setItem('sellsolar_chunk_reload', String(Date.now()));
          window.location.reload();
          return new Promise(() => {});
        }
      } catch {
        window.location.reload();
        return new Promise(() => {});
      }
    }
    throw err;
  });
}

if (typeof window !== 'undefined') {
  void loadSellSolarApp();
}

const App = dynamic(loadSellSolarApp, {
  ssr: false,
  loading: () => <SellSolarBootShell />,
});

export default function SellSolarClient({ initialPathname, initialSlug }) {
  return <App initialPathname={initialPathname} initialSlug={initialSlug} />;
}
