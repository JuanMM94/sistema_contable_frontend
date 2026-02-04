import { PayerData } from '@/lib/schemas';
import Link from 'next/link';
import { PayerCard } from './CardPayer';
import { useMemo, useState } from 'react';
import { useSession } from '@/providers/RouteFetchProvider';
import { Input } from '../ui/input';

function PayerGrid({ payerData }: { payerData: PayerData[] }) {
  if (payerData.length === 0) {
    return <p className="text-muted-foreground">No hay movimientos disponibles</p>;
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}
    >
      {payerData.map((data) => (
        <Link
          key={data.payer}
          href={`/panel/movimiento/${encodeURIComponent(data.payer)}`}
          className="block"
        >
          <PayerCard data={data} />
        </Link>
      ))}
    </div>
  );
}

export function PayerBalances() {
  const [payerFilter, setPayerFilter] = useState('');
  const { user, movements } = useSession();
  const userName = user?.name;

  const payerData = useMemo(() => {
    const normalizedFilter = payerFilter.trim().toLowerCase();
    const filteredMovements =
      normalizedFilter.length === 0
        ? movements
        : movements.filter((movement) =>
            (movement.payer ?? '').toLowerCase().includes(normalizedFilter),
          );
    const grouped = new Map<string, PayerData>();

    filteredMovements.forEach((movement) => {
      const payerName = movement.payer || 'Sin cliente';

      if (userName && payerName.toLowerCase() === userName.toLowerCase()) {
        return;
      }

      if (!grouped.has(payerName)) {
        grouped.set(payerName, {
          payer: payerName,
          paidBalance: {},
          pendingBalance: {},
          movements: [],
        });
      }

      const data = grouped.get(payerName)!;
      data.movements.push(movement);

      const amount = parseFloat(movement.amount);
      const currency = movement.currency;
      const adjustedAmount = movement.type === 'EGRESS' ? -amount : amount;

      if (movement.status === 'PAID') {
        data.paidBalance[currency] = (data.paidBalance[currency] || 0) + adjustedAmount;
      } else if (movement.status === 'PENDING') {
        data.pendingBalance[currency] = (data.pendingBalance[currency] || 0) + adjustedAmount;
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.payer.localeCompare(b.payer));
  }, [movements, payerFilter, userName]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por cliente..."
        value={payerFilter}
        onChange={(event) => setPayerFilter(event.target.value)}
      />
      <PayerGrid payerData={payerData} />
    </div>
  );
}
