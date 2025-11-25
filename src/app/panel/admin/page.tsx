"use client"

import MovementsList from "@/components/custom/MovementsList";
import { useMovements } from "@/providers/AdminFetchProvider";
import { useSession } from "@/providers/RouteFetchProvider";

export default function Page() {

  const {user} = useSession()
  const {movements, users} = useMovements()

  return (
    <div className="flex justify-center w-full mt-6!">
      <div className='w-[70vw]'>
        <h3>Panel de Administrador</h3>
        <section>
          <h5>Últimos movimientos</h5>
          <MovementsList initialMovements={movements ?? []} userRole={user?.role}/>
        </section>
        <section>
          <h5>Usuarios</h5>
          <MovementsList initialMovements={movements ?? []} userRole={user?.role}/>
        </section>
      </div>
    </div>
  );
}
