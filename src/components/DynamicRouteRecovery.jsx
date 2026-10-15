'use client';

import { useState, useEffect } from 'react';
import SellSolarClient from '../../app/sellsolar-client';
import { LoaderCircle } from 'lucide-react';

export default function DynamicRouteRecovery({ children }) {
  const [targetPath, setTargetPath] = useState(null);
  const [isDynamicRoute, setIsDynamicRoute] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname || '';
      if (p.startsWith('/listing/') || p.startsWith('/listing')) {
        setIsDynamicRoute(true);
        setTargetPath(p);
      }
    }
  }, []);

  if (isDynamicRoute && targetPath) {
    const slug = targetPath.replace(/^\//, '').split('/').filter(Boolean);
    return (
      <SellSolarClient
        key={targetPath}
        initialPathname={targetPath}
        initialSlug={slug}
      />
    );
  }

  return children;
}
