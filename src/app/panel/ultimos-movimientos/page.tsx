'use client';

import { ListMovementsUser } from '@/components/custom/ListMovements';
import { useSession } from '@/providers/RouteFetchProvider';
import { MoveLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  const { user, loading } = useSession();
  const searchParams = useSearchParams();
  const [filterBy, setFilterBy] = useState<string | null>(searchParams.get('currency'));

  const filteredMovements = filterBy
    ? user?.movements?.filter((movement) => movement.currency === filterBy)
    : user?.movements;

  return (
    <div className="lg:w-[70vw] w-[90vw] p-4 flex flex-col gap-8 m-auto">
      <div
        className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
        onClick={() => history.back()}
      >
        <MoveLeft size={24} />
        <h5>Volver</h5>
      </div>
      {loading ? (
        <></>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Últimos movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ButtonGroup>
                <Button
                  onClick={() => setFilterBy(null)}
                  variant="outline"
                  size="sm"
                  className={filterBy === null ? 'text-primary' : 'opacity-70'}
                >
                  Todos
                </Button>
                <Button
                  onClick={() => setFilterBy('ARS')}
                  variant="outline"
                  size="sm"
                  className={filterBy === 'ARS' ? 'text-primary' : 'opacity-70'}
                >
                  ARS
                </Button>
                <Button
                  onClick={() => setFilterBy('USD')}
                  variant="outline"
                  size="sm"
                  className={filterBy === 'USD' ? 'text-primary' : 'opacity-70'}
                >
                  USD
                </Button>
              </ButtonGroup>
            </div>
            <ListMovementsUser initialMovements={filteredMovements ?? []} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
