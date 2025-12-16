'use client';

import { useSession } from '@/providers/RouteFetchProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const { user, loading } = useSession();
  useEffect(() => {
    if (user === undefined || loading) return;
    if (!user) {
      router.push('/ingresar');
    } else {
      router.push('/panel');
    }
  }, [user, router, loading]);
  return <></>;
}
