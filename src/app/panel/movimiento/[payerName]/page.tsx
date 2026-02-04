'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/providers/RouteFetchProvider';
import { MoveLeft } from 'lucide-react';
import { Loading } from '@/components/custom/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Column, MovementTable } from '@/components/custom/MovementTable';
import { Movement } from '@/lib/schemas';
import { formatBalances } from '@/lib/utils';

const displayColumns = [
  { key: 'date', label: 'Fecha', allowFilter: true },
  { key: 'concept', label: 'Concepto', allowFilter: true },
  { key: 'status', label: 'Estado', allowFilter: true },
  { key: 'method', label: 'Método', allowFilter: true },
  { key: 'type', label: 'Tipo', allowFilter: true },
  { key: 'currency', label: 'Moneda', allowFilter: true },
  { key: 'amount', label: 'Cantidad', allowFilter: true },
] as Column<Movement>[];

export default function ByPayerPage() {
  const { payerName } = useParams<{ payerName: string }>();
  const { payerMovement, payerMovementStatus, getMovementByPayer } = useSession();

  const key = decodeURIComponent(payerName);
  const data = payerMovement[key];
  const status = payerMovementStatus[key];

  useEffect(() => {
    void getMovementByPayer(key);
  }, [key, getMovementByPayer]);

  const { movementsFlat, paidBalance, pendingBalance } = useMemo(() => {
    const accounts = data?.accounts ?? [];
    const movementsFlat = accounts.flatMap((a) => a.movements ?? []);

    const paidBalance: Record<string, number> = {};
    const pendingBalance: Record<string, number> = {};

    for (const m of movementsFlat) {
      const amount = Number(m.amount);
      const adjusted = m.type === 'EGRESS' ? -amount : amount;
      const c = m.currency;

      if (m.status === 'PAID') paidBalance[c] = (paidBalance[c] ?? 0) + adjusted;
      if (m.status === 'PENDING') pendingBalance[c] = (pendingBalance[c] ?? 0) + adjusted;
    }

    return { movementsFlat, paidBalance, pendingBalance };
  }, [data]);

  if (!data && status === 'loading')
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="lg:w-[70vw] w-[90vw] px-4 m-auto">
      <div
        className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
        onClick={() => history.back()}
      >
        <MoveLeft size={24} />
        <h5>Volver</h5>
      </div>

      <h3>Movimientos de {key}</h3>

      <div className="space-y-4 overflow-y-auto flex-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Saldo pagado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-green-600">{formatBalances(paidBalance)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Saldo pendiente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-orange-600">
                {formatBalances(pendingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
        <MovementTable movements={movementsFlat} columns={displayColumns} />
      </div>
    </div>
  );
}
