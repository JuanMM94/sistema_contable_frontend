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
import {
  CurrencySwapData,
  EditMovement,
  ExchangeRate,
  Filter,
  InputMember,
  InputMovement,
  Movement,
  User,
} from '@/lib/schemas';

type AdminContextValue = {
  movements: Movement[] | null;
  users: User[] | null;
  filter: Filter[] | null;
  loading: boolean;
  error: string | null;
  exchangeRate: ExchangeRate | null;
  getExchangeRates: () => Promise<void>;
  getUserToCurrencySwap: (userId: string) => Promise<void>;
  userToCurrencySwap: User | null;
  userToCurrencySwapLoading: boolean;
  userToCurrencySwapError: string | null;
  movementById: Map<string, Movement>;
  postCurrencySwap: (data: CurrencySwapData) => Promise<void>;
  createMember: (data: InputMember) => Promise<void>;
  createMovement: (data: InputMovement) => Promise<void>;
  updateMovement: (data: EditMovement) => Promise<void>;
  deleteMovement: (data: { movementId: string }) => Promise<void>;
  movementsLoading: boolean;
  requestMovements: (data: { target: string; from: string; to: string }) => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminFetchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Scale context if needed from useStates.
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [movementsLoading, setMovementsLoading] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [userToCurrencySwapLoading, setUserToCurrencySwapLoading] = useState(false);
  const [userToCurrencySwapError, setUserToCurrencySwapError] = useState<string | null>(null);
  const [userToCurrencySwap, setUserToCurrencySwap] = useState<User | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [filter, setFilter] = useState<Filter[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminContext = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!API_BASE) {
      setError('Missing API base URL');
      if (!silent) {
        setLoading(false);
        setMovements(null);
        setUsers(null);
      }
      return;
    }

    if (!silent) {
      setLoading(true);
    }
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

      if (movementsRes.status != 200 || usersRes.status !== 200) {
        if (!silent) {
          setMovements(null);
          setUsers(null);
          setLoading(false);
        }
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
      setMovements(movementsPayload?.data ?? movementsPayload);
      setUsers(usersPayload?.data ?? usersPayload);
    } catch (err) {
      if (!silent) {
        setMovements(null);
        setUsers(null);
      }
      setError(err instanceof Error ? err.message : 'Unknown admin context error');
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
      const res = await fetch(`${API_BASE}/movements/swap`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to create currency swap');
      getUserToCurrencySwap(data.userId);
      await fetchAdminContext();
    },
    [fetchAdminContext, getUserToCurrencySwap],
  );

  const updateMovementRequest = useCallback(
    async (data: EditMovement) => {
      setMovementsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/movements/update`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
          cache: 'no-store',
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || 'Failed to update movement');
        }

        await fetchAdminContext({ silent: true });
      } finally {
        setMovementsLoading(false);
      }
    },
    [fetchAdminContext],
  );

  const deleteMovementRequest = useCallback(
    async (data: { movementId: string }) => {
      setMovementsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/movements/delete`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to delete movement');
        }

        await fetchAdminContext({ silent: true });
      } finally {
        setMovementsLoading(false);
      }
    },
    [fetchAdminContext],
  );

  const getMovementFilterRequest = useCallback(
    async (data: { target: string; from: string; to: string }) => {
      const request = `${API_BASE}/filter/?target=${data.target}&from=${data.from}&to=${data.to}`;
      const res = await fetch(request, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message || errorData?.error || 'No pudimos obtener esa información',
        );
      }
      const resData = await res.json();
      const nextFilter = Array.isArray(resData?.data) ? resData.data : resData;

      setFilter(nextFilter ?? null);
    },
    [],
  );

  const movementById = useMemo(() => {
    const map = new Map<string, Movement>();
    for (const m of movements ?? []) map.set(m.id, m);
    return map;
  }, [movements]);

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
      filter,
      loading,
      error,
      exchangeRate,
      userToCurrencySwap,
      userToCurrencySwapLoading,
      userToCurrencySwapError,
      movementsLoading,
      movementById: movementById,
      getExchangeRates: getExchangeRates,
      getUserToCurrencySwap: getUserToCurrencySwap,
      postCurrencySwap: postCurrencySwap,
      createMember: createMemberRequest,
      createMovement: createMovementRequest,
      updateMovement: updateMovementRequest,
      deleteMovement: deleteMovementRequest,
      requestMovements: getMovementFilterRequest,
      refresh: fetchAdminContext,
    }),
    [
      movements,
      users,
      filter,
      loading,
      error,
      exchangeRate,
      userToCurrencySwap,
      userToCurrencySwapLoading,
      userToCurrencySwapError,
      movementsLoading,
      movementById,
      getExchangeRates,
      getUserToCurrencySwap,
      postCurrencySwap,
      createMemberRequest,
      createMovementRequest,
      updateMovementRequest,
      deleteMovementRequest,
      getMovementFilterRequest,
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
