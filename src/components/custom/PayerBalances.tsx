'use client';

import { useMemo, useState } from 'react';
import { Movement } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { currencyFormatter } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSession } from '@/providers/RouteFetchProvider';
import { Column, MovementTable } from './MovementTable';

type PayerData = {
  payer: string;
  paidBalance: Record<string, number>; // currency -> amount
  pendingBalance: Record<string, number>; // currency -> amount
  movements: Movement[];
};

// Helper function to format balances
const formatBalances = (balances: Record<string, number>) => {
  const currencies = Object.keys(balances);
  if (currencies.length === 0) {
    // Default to ARS with 0
    return currencyFormatter(0, 'es-AR', 'ARS', true);
  }

  return currencies
    .map((currency) =>
      currencyFormatter(balances[currency], 'es-AR', currency as 'ARS' | 'USD', true),
    )
    .join(' | ');
};

// Balance display component
function BalanceDisplay({
  label,
  balance,
  colorClass,
}: {
  label: string;
  balance: string;
  colorClass: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${colorClass}`}>{balance}</p>
    </div>
  );
}

// Payer card component
function PayerCard({ data, onClick }: { data: PayerData; onClick: () => void }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={onClick}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{data.payer}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <BalanceDisplay
          label="Saldo pagado"
          balance={formatBalances(data.paidBalance)}
          colorClass="text-green-600"
        />
        <BalanceDisplay
          label="Saldo pendiente"
          balance={formatBalances(data.pendingBalance)}
          colorClass="text-orange-600"
        />
        <div className="pt-2">
          <Badge variant="secondary" className="text-xs">
            {data.movements.length} {data.movements.length === 1 ? 'movimiento' : 'movimientos'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Balance summary cards in dialog
function BalanceSummary({
  paidBalance,
  pendingBalance,
}: {
  paidBalance: Record<string, number>;
  pendingBalance: Record<string, number>;
}) {
  return (
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
          <p className="text-lg font-semibold text-orange-600">{formatBalances(pendingBalance)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Payer grid component
function PayerGrid({
  payerData,
  onPayerClick,
}: {
  payerData: PayerData[];
  onPayerClick: (payer: PayerData) => void;
}) {
  if (payerData.length === 0) {
    return <p className="text-muted-foreground">No hay movimientos disponibles</p>;
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}
    >
      {payerData.map((data) => (
        <PayerCard key={data.payer} data={data} onClick={() => onPayerClick(data)} />
      ))}
    </div>
  );
}

// Movement details dialog component
function PayerDetailsDialog({
  isOpen,
  onOpenChange,
  payerData,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payerData: PayerData | null;
}) {
  if (!payerData) return null;

  const displayColumns = [
    { key: 'date', label: 'Fecha', allowFilter: true },
    { key: 'concept', label: 'Concepto', allowFilter: true },
    { key: 'status', label: 'Estado', allowFilter: true },
    { key: 'method', label: 'Método', allowFilter: true },
    { key: 'type', label: 'Tipo', allowFilter: true },
    { key: 'currency', label: 'Moneda', allowFilter: true },
    { key: 'amount', label: 'Cantidad', allowFilter: true },
  ] as Column<Movement>[];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Movimientos de {payerData.payer}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          <BalanceSummary
            paidBalance={payerData.paidBalance}
            pendingBalance={payerData.pendingBalance}
          />
          <MovementTable movements={payerData.movements} columns={displayColumns} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
export function PayerBalances() {
  const [selectedPayer, setSelectedPayer] = useState<PayerData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payerFilter, setPayerFilter] = useState('');
  const { user, movements } = useSession();
  const userName = user?.name;

  // Group movements by payer and calculate balances
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

      // Filter out movements where payer is the user themselves (e.g., currency swaps)
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

      // INCOME adds to balance, EGRESS subtracts from balance
      const adjustedAmount = movement.type === 'EGRESS' ? -amount : amount;

      // Calculate balances based on status
      if (movement.status === 'PAID') {
        data.paidBalance[currency] = (data.paidBalance[currency] || 0) + adjustedAmount;
      } else if (movement.status === 'PENDING') {
        data.pendingBalance[currency] = (data.pendingBalance[currency] || 0) + adjustedAmount;
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.payer.localeCompare(b.payer));
  }, [movements, payerFilter, userName]);

  const handlePayerClick = (payer: PayerData) => {
    setSelectedPayer(payer);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por cliente..."
        value={payerFilter}
        onChange={(event) => setPayerFilter(event.target.value)}
      />
      <PayerGrid payerData={payerData} onPayerClick={handlePayerClick} />
      <PayerDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        payerData={selectedPayer}
      />
    </div>
  );
}
