'use client';

import ListMovements from '@/components/custom/ListMovements';
import ListUsers from '@/components/custom/ListUsers';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import { useSession } from '@/providers/RouteFetchProvider';

export default function Page() {
  const { user } = useSession();
  const { movements } = useAdminContext();

  return (
    <div className="flex justify-center w-full mt-6!">
      <div className="w-[70vw]">
        <h3>Panel de Administrador</h3>
        <section>
          <h5>Lista de últimos movimientos</h5>
          <ListMovements initialMovements={movements ?? []} userRole={user?.role} />
        </section>
        <section>
          <h5>Lista de usuarios</h5>
          <ListUsers />
        </section>
      </div>
    </div>
  );
}
