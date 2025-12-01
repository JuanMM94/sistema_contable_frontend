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
import { Spinner } from '@/components/ui/spinner';
import { InputMovement, Movement, type User } from '@/lib/schemas';

type AdminContextValue = {
  movements: Movement[] | null;
  users: User[] | null;
  loading: boolean;
  error: string | null;
  createMovement: (data: InputMovement) => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminFetchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Scale context if needed from useStates.
  const [movements, setMovements] = useState<Movement[] | null>(null);
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

      console.log(movementsPayload, usersPayload);

      setMovements(movementsPayload.data);
      setUsers(usersPayload.data);
    } catch (err) {
      console.error('Admin context fetch failed', err);
      setMovements(null);
      setUsers(null);
      setError(err instanceof Error ? err.message : 'Unknown admin context error');
    } finally {
      setLoading(false);
      console.log(`SERVER MOVEMENTS CONTEXT RESPONSE: ${JSON.stringify(movements, null, 2)}`);
      console.log(`SERVER USERS CONTEXT RESPONSE: ${JSON.stringify(users, null, 2)}`);
    }
  }, [movements, users]);

  const createMovementRequest = useCallback(async (data: InputMovement) => {
    {
      const res = await fetch(`${API_BASE}/movements`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to create movement');
    }
  }, []);

  useEffect(() => {
    void fetchAdminContext();
  }, [pathname, fetchAdminContext]);

  const value = useMemo(
    () => ({
      movements,
      users,
      loading,
      error,
      createMovement: createMovementRequest,
      refresh: fetchAdminContext,
    }),
    [movements, users, loading, error, createMovementRequest, fetchAdminContext],
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
