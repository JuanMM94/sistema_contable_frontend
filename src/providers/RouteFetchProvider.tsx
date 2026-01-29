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
import { Movement } from '@/lib/schemas';

type SessionContextValue = {
  user: ServerUser | null;
  loading: boolean;
  error: string | null;
  movements: Movement[];
  getMovements: () => Promise<void>;
  refresh: () => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function RouteFetchProvider({ children }: { children: ReactNode }) {
  // Use pathname to re-fetch.
  const pathname = usePathname();
  const [user, setUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);

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
      setUser(payload.user);
    } catch (err) {
      console.error('Session fetch failed', err);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Unknown session error');
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false, message: 'Failed to change password' };
      return { success: true, message: 'Password changed successfully' };
    },
    [],
  );

  const getMovements = useCallback(async () => {
    const res = await fetch(`${API_BASE}/movements`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch movements');
    const payload = await res.json();
    setMovements(payload.data);
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [pathname, fetchSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      movements,
      getMovements: getMovements,
      refresh: fetchSession,
      changePassword: changePassword,
    }),
    [user, loading, error, movements, getMovements, fetchSession, changePassword],
  );

  return (
    <SessionContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center gap-4 h-lvh w-lvw">
          <Spinner className="size-12 text-foreground" />
        </div>
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a RouteFetchProvider');
  return context;
}
