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
  exchangeRate: ExchangeData | null;
  refresh: () => Promise<void>;
  getExchangeRates: () => Promise<void>;
  postCurrencySwap: (data: CurrencySwapData) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
};

export type CurrencySwapData = {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  clientRate: ExchangeData;
};

type ExchangeData = {
  currency: string;
  market: string;
  name: string;
  buy: number;
  sell: number;
  updatedAt: Date;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function RouteFetchProvider({ children }: { children: ReactNode }) {
  // Use pathname to re-fetch.
  const pathname = usePathname();
  const [user, setUser] = useState<ServerUser | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeData | null>(null);
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
      setUser(payload.user);
    } catch (err) {
      console.error('Session fetch failed', err);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Unknown session error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getExchangeRates = useCallback(async () => {
    {
      const res = await fetch(`${API_BASE}/movements/exchange-rate`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to retrieve exchange rates');
      const resData = await res.json();
      setExchangeRate(resData);
    }
  }, []);

  const postCurrencySwap = useCallback(
    async (data: CurrencySwapData) => {
      const res = await fetch(`${API_BASE}/movements/swap`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to create currency swap');

      // Refresh client-side session/exchange data so balances update after a successful swap.
      await fetchSession();
      await getExchangeRates();
    },
    [fetchSession, getExchangeRates],
  );

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

  useEffect(() => {
    void fetchSession();
  }, [pathname, fetchSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refresh: fetchSession,
      exchangeRate,
      getExchangeRates: getExchangeRates,
      postCurrencySwap: postCurrencySwap,
      changePassword: changePassword,
    }),
    [
      user,
      loading,
      error,
      fetchSession,
      exchangeRate,
      getExchangeRates,
      postCurrencySwap,
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
