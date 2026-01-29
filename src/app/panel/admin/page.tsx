'use client';

import { ChartBarMultiple } from '@/components/custom/ChartBar';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import { ListMovementsAdmin } from '@/components/custom/ListMovements';
import { Loading } from '@/components/custom/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  const {loading} = useAdminContext()

  return (
    <div className="flex justify-center w-full">
      {!!loading ? <Loading /> : 
      <div className="w-[70vw] flex flex-col gap-10">
        <h3>Panel de Administrador</h3>
        <ChartBarMultiple />
        <Card>
          <CardHeader>
            <CardTitle>Movimientos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <ListMovementsAdmin/>
          </CardContent>
        </Card>
      </div>
      }
    </div>
  );
}
