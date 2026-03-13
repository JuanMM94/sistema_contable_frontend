'use client';

import { useSession } from '@/providers/RouteFetchProvider';
import { MoveLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementTableFixCurrency } from '@/components/custom/Tables';
import Link from 'next/link';

export default function Page() {
  const { loading, movements } = useSession();
  const searchParams = useSearchParams();
  const filterBy = searchParams.get('currency');

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
            <CardTitle>Últimos movimientos en {filterBy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pb-4">
              {filterBy === 'ARS' ? (
                <Link href="/panel/ultimos-movimientos?currency=USD">
                  <Button variant="outline" size="sm">
                    Ir a movimientos en USD
                  </Button>
                </Link>
              ) : (
                <Link href="/panel/ultimos-movimientos?currency=ARS">
                  <Button variant="outline" size="sm">
                    Ir a movimientos en ARS
                  </Button>
                </Link>
              )}
            </div>
            <MovementTableFixCurrency
              movements={movements ?? []}
              currency={filterBy as 'ARS' | 'USD'}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
