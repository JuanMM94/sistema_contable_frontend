// src/app/RouteFetchProvider.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import API_BASE from '@/lib/endpoint';
import type { ServerUser } from '@/types/movement';
import { Spinner } from '@/components/ui/spinner';

type SessionContextValue = {
  user: ServerUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function RouteFetchProvider({ children }: { children: ReactNode }) {
  // Use pathname to re-fetch.
  const pathname = usePathname();
  const [user, setUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!API_BASE) {
      setError('Missing API base URL');
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/session`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.status === 401) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch session (${res.status})`);

      const payload = await res.json();
      console.log(`SERVER USER SESSION RESPONSE: ${JSON.stringify(payload, null, 2)}`);
      setUser(payload.user);
    } catch (err) {
      console.error('Session fetch failed', err);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Unknown session error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [pathname, fetchSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refresh: fetchSession,
    }),
    [user, loading, error, fetchSession],
  );

  return (
    <SessionContext.Provider value={value}>
      {loading ?     
      <div className="flex items-center justify-center gap-4 h-lvh w-lvw">
        <Spinner className='size-12 text-foreground'/>
      </div> : children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a RouteFetchProvider');
  return context;
}
