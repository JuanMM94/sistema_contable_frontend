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
import { InputMember, InputMovement, Movement, type User } from '@/lib/schemas';

type AdminContextValue = {
  movements: Movement[] | null;
  users: User[] | null;
  loading: boolean;
  error: string | null;
  createMember: (data: InputMember) => Promise<void>;
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

  const createMemberRequest = useCallback(async (data: InputMember) => {
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
  }, [fetchAdminContext]);

  const createMovementRequest = useCallback(async (data: InputMovement) => {
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
  }, [fetchAdminContext]);

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
      createMember: createMemberRequest,
      createMovement: createMovementRequest,
      refresh: fetchAdminContext,
    }),
    [
      movements,
      users,
      loading,
      error,
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
