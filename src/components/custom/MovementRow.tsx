import { formatDateFromISO } from '@/lib/date_utils';
import { Movement } from '@/lib/schemas';
import {
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  getPaymentTypeLabel,
  currencyFormatter,
} from '@/lib/utils';
import { TableRow, TableCell } from '../ui/table';

export function MovementRow({ movement }: { movement: Movement }) {
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
