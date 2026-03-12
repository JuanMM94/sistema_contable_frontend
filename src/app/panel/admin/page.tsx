'use client';

import { ChartBarMultiple } from '@/components/custom/ChartBar';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import { Loading } from '@/components/custom/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementTableAdmin, UsersTable } from '@/components/custom/Tables';

export default function Page() {
  const { loading, users, movements } = useAdminContext();

  return (
    <div className="flex justify-center w-full">
      {!!loading ? (
        <Loading />
      ) : (
        <div className="w-[70vw] flex flex-col gap-10">
          <h3>Panel de Administrador</h3>
          <ChartBarMultiple />
          <Card>
            <CardHeader>
              <CardTitle>Movimientos totales</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementTableAdmin movements={movements ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable users={users ?? []} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
