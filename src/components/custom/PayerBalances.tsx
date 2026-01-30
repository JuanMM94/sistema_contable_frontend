'use client';

import { useState, useMemo } from 'react';
import { Movement } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import { formatDateFromISO } from '@/lib/date_utils';
import { Badge } from '@/components/ui/badge';

type PayerData = {
  payer: string;
  paidBalance: Record<string, number>; // currency -> amount
  pendingBalance: Record<string, number>; // currency -> amount
  movements: Movement[];
};

type PayerBalancesProps = {
  movements: Movement[];
  userName?: string;
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

// Movement table row component
function MovementRow({ movement }: { movement: Movement }) {
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">
        {formatDateFromISO(movement.date)}
      </TableCell>
      <TableCell className="whitespace-nowrap">{movement.concept}</TableCell>
      <TableCell className="whitespace-nowrap">{getPaymentStatusLabel(movement.status)}</TableCell>
      <TableCell className="whitespace-nowrap">{getPaymentMethodLabel(movement.method)}</TableCell>
      <TableCell className="whitespace-nowrap">{getPaymentTypeLabel(movement.type)}</TableCell>
      <TableCell className="whitespace-nowrap">{movement.currency}</TableCell>
      <TableCell
        className={`text-right font-medium whitespace-nowrap ${
          movement.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {currencyFormatter(movement.amount, 'es-AR', movement.currency, true)}
      </TableCell>
    </TableRow>
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

// Sort icon component
type SortColumn = 'date' | 'concept' | 'status' | 'method' | 'type' | 'currency' | 'amount';
type SortDirection = 'asc' | 'desc';

function SortIcon({
  column,
  currentColumn,
  direction,
}: {
  column: SortColumn;
  currentColumn: SortColumn;
  direction: SortDirection;
}) {
  if (currentColumn !== column) return <span className="ml-1 text-muted-foreground">↕</span>;
  return <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>;
}

// Movement table component with sorting
function MovementTable({ movements }: { movements: Movement[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedMovements = [...movements].sort((a, b) => {
    let compareValue = 0;

    switch (sortColumn) {
      case 'date':
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'concept':
        compareValue = a.concept.localeCompare(b.concept);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      case 'method':
        compareValue = a.method.localeCompare(b.method);
        break;
      case 'type':
        compareValue = a.type.localeCompare(b.type);
        break;
      case 'currency':
        compareValue = a.currency.localeCompare(b.currency);
        break;
      case 'amount':
        compareValue = parseFloat(a.amount) - parseFloat(b.amount);
        break;
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon column="date" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('concept')}
            >
              Concepto{' '}
              <SortIcon column="concept" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('status')}
            >
              Estado{' '}
              <SortIcon column="status" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('method')}
            >
              Método{' '}
              <SortIcon column="method" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('type')}
            >
              Tipo <SortIcon column="type" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('currency')}
            >
              Moneda{' '}
              <SortIcon column="currency" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
            <TableHead
              className="text-right whitespace-nowrap cursor-pointer hover:bg-accent"
              onClick={() => handleSort('amount')}
            >
              Cantidad{' '}
              <SortIcon column="amount" currentColumn={sortColumn} direction={sortDirection} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovements.map((movement) => (
            <MovementRow key={movement.id} movement={movement} />
          ))}
        </TableBody>
      </Table>
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
          <MovementTable movements={payerData.movements} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
export function PayerBalances({ movements, userName }: PayerBalancesProps) {
  const [selectedPayer, setSelectedPayer] = useState<PayerData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group movements by payer and calculate balances
  const payerData = useMemo(() => {
    const grouped = new Map<string, PayerData>();

    movements.forEach((movement) => {
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
  }, [movements, userName]);

  const handlePayerClick = (payer: PayerData) => {
    setSelectedPayer(payer);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PayerGrid payerData={payerData} onPayerClick={handlePayerClick} />
      <PayerDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        payerData={selectedPayer}
      />
    </div>
  );
}
