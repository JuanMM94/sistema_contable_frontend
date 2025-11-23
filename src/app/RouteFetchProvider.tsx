// src/app/RouteFetchProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import API_BASE from '@/lib/endpoint';

export function RouteFetchProvider() {
  const pathname = usePathname();

  useEffect(() => {
    void fetch(`${API_BASE}/session`, { cache: 'no-store' });
  }, [pathname]); // runs on reload (remount) and when pathname changes
  return <></>;
}
