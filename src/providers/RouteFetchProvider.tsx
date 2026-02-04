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
  payerMovement: Record<string, PayerMovement | undefined>;
  payerMovementStatus: Record<string, Status>;
  payerMovementError: Record<string, string | undefined>;
  getMovementByPayer: (payerName: string, opts?: { force: boolean }) => Promise<void>;
  getMovements: () => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  fetchUserContext: () => Promise<void>;
};

type PayerMovement = {
  accounts: [
    {
      movements: Movement;
      currency: Movement['currency'];
    },
  ];
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function RouteFetchProvider({ children }: { children: ReactNode }) {
  // Use pathname to re-fetch.
  const pathname = usePathname();
  const [user, setUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [payerMovement, setPayerMovement] = useState<Record<string, PayerMovement | undefined>>({});
  const [payerMovementStatus, setPayerMovementStatus] = useState<Record<string, Status>>({});
  const [payerMovementError, setPayerMovementError] = useState<Record<string, string | undefined>>(
    {},
  );

  const fetchUserContext = useCallback(async () => {
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
      setMovements(payload.user.movements || []);
    } catch (err) {
      console.error('Session fetch failed', err);
      setUser(null);
      setMovements([]);
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

  const getMovementByPayer = useCallback(
    async (payerName: string, opts?: { force: boolean }) => {
      setPayerMovementStatus((p) => ({ ...p, [payerName]: 'loading' }));
      setPayerMovementError((p) => ({ ...p, [payerName]: undefined }));

      const force = opts?.force ?? false;

      const cached = payerMovement[payerName];
      if (cached && !force) return cached;

      const res = await fetch(`${API_BASE}/movements/byPayer/${payerName}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const msg = `Failed to fetch movements by payer (${res.status})`;
        setPayerMovementStatus((p) => ({ ...p, [payerName]: 'error' }));
        setPayerMovementError((p) => ({ ...p, [payerName]: msg }));
        throw new Error(msg);
      }
      const payload = await res.json();

      setPayerMovement((p) => ({ ...p, [payerName]: payload.data }));
      setPayerMovementStatus((p) => ({ ...p, [payerName]: 'success' }));

      return payload;
    },
    [payerMovement],
  );

  useEffect(() => {
    void fetchUserContext();
  }, [pathname, fetchUserContext]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      movements,
      payerMovement,
      payerMovementStatus,
      payerMovementError,
      getMovementByPayer,
      getMovements,
      changePassword,
      fetchUserContext,
    }),
    [
      user,
      loading,
      error,
      movements,
      payerMovement,
      payerMovementStatus,
      payerMovementError,
      getMovementByPayer,
      getMovements,
      fetchUserContext,
      changePassword,
    ],
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
