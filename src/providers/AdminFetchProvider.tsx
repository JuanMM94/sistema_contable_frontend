'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import API_BASE from '@/lib/endpoint';
import { Spinner } from '@/components/ui/spinner';
import { CurrencySwapData, ExchangeRate, InputMember, InputMovement, Movement, User } from '@/lib/schemas';

type AdminContextValue = {
  movements: Movement[] | null;
  users: User[] | null;
  loading: boolean;
  error: string | null;
  exchangeRate: ExchangeRate | null;
  getExchangeRates: () => Promise<void>;
  getUserToCurrencySwap: (userId: string) => Promise<void>;
  userToCurrencySwap: User | null;
  userToCurrencySwapLoading: boolean;
  userToCurrencySwapError: string | null;
  postCurrencySwap: (data: CurrencySwapData) => Promise<void>;
  createMember: (data: InputMember) => Promise<void>;
  createMovement: (data: InputMovement) => Promise<void>;
  refresh: () => Promise<void>;
};


const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminFetchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Scale context if needed from useStates.
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [userToCurrencySwapLoading, setUserToCurrencySwapLoading] = useState(false);
  const [userToCurrencySwapError, setUserToCurrencySwapError] = useState<string | null>(null);
  const [userToCurrencySwap, setUserToCurrencySwap] = useState<User | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminContext = useCallback(async () => {
    if (!API_BASE) {
      setError('Missing API base URL');
      setLoading(false);
      setMovements(null);
      setUsers(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [movementsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/movements`, {
          cache: 'no-store',
          credentials: 'include',
        }),
        fetch(`${API_BASE}/users`, {
          cache: 'no-store',
          credentials: 'include',
        }),
      ]);

      if (movementsRes.status === 401 || usersRes.status === 401) {
        setMovements(null);
        setUsers(null);
        setLoading(false);
        return;
      }
      if (!movementsRes.ok || !usersRes.ok) {
        throw new Error(
          `Failed to fetch admin context (movements: ${movementsRes.status}, users: ${usersRes.status})`,
        );
      }
      const [movementsPayload, usersPayload] = await Promise.all([
        movementsRes.json(),
        usersRes.json(),
      ]);
      setMovements(movementsPayload.data);
      setUsers(usersPayload.data);
    } catch (err) {
      setMovements(null);
      setUsers(null);
      setError(err instanceof Error ? err.message : 'Unknown admin context error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMemberRequest = useCallback(
    async (data: InputMember) => {
      const res = await fetch(`${API_BASE}/users/create`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || 'No se pudo crear el usuario');
      }
      await fetchAdminContext(); // Refresh data after creation
    },
    [fetchAdminContext],
  );

  const createMovementRequest = useCallback(
    async (data: InputMovement) => {
      const res = await fetch(`${API_BASE}/movements`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || 'No se pudo crear el movimiento');
      }
      await fetchAdminContext(); // Refresh data after creation
    },
    [fetchAdminContext],
  );

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

  const getUserToCurrencySwap = useCallback(async (userId: string) => {
    try {
      setUserToCurrencySwapLoading(true);
      setUserToCurrencySwapError(null);

      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to retrieve user');

      const payload = await res.json();
      console.log(payload)
      setUserToCurrencySwap(payload?.data ?? payload);
    } catch (e) {
      setUserToCurrencySwap(null);
      setUserToCurrencySwapError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setUserToCurrencySwapLoading(false);
    }
  }, []);

  const postCurrencySwap = useCallback(
    async (data: CurrencySwapData) => {

      console.log('Posting currency swap with data:', data);

      console.log("SWAP URL:", `${API_BASE}/movements/swap`);

      const res = await fetch(`${API_BASE}/movements/swap`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      console.log(await res.json());
      if (!res.ok) throw new Error('Failed to create currency swap');
      getUserToCurrencySwap(data.userId)
      console.log('Currency swap created successfully', res);
      // Refresh client-side session/exchange data so balances update after a successful swap.
      await fetchAdminContext();
    },
    [fetchAdminContext, getUserToCurrencySwap],
  );

  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    void fetchAdminContext();
  }, [pathname, fetchAdminContext]);

  const value = useMemo(
    () => ({
      movements,
      users,
      loading,
      error,
      exchangeRate,
      userToCurrencySwap,
      userToCurrencySwapLoading,
      userToCurrencySwapError,
      getExchangeRates: getExchangeRates,
      getUserToCurrencySwap: getUserToCurrencySwap,
      postCurrencySwap: postCurrencySwap,
      createMember: createMemberRequest,
      createMovement: createMovementRequest,
      refresh: fetchAdminContext,
    }),
    [
      movements,
      users,
      loading,
      error,
      exchangeRate,
      userToCurrencySwap,
      userToCurrencySwapLoading,
      userToCurrencySwapError,
      getExchangeRates,
      getUserToCurrencySwap,
      postCurrencySwap,
      createMemberRequest,
      createMovementRequest,
      fetchAdminContext,
    ],
  );

  return (
    <AdminContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center gap-4 h-lvh w-lvw">
          <Spinner className="size-12 text-foreground" />
        </div>
      ) : (
        children
      )}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within a AdminFetchProvider');
  return context;
}
