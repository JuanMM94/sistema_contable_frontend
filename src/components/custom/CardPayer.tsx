import { PayerData } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatBalances } from '@/lib/utils';
import { Badge } from '../ui/badge';

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

export function PayerCard({ data }: { data: PayerData }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
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
