'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatToLocaleDate } from '@/lib/date_utils';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import styles from '../../app/page.module.css';
import { Movement, Role } from '@/lib/schemas';
import { useSession } from '@/providers/RouteFetchProvider';

export default function ListMovements({
  initialMovements,
  userRole,
}: {
  initialMovements: Movement[] | [];
  userRole: Role | undefined;
}) {

  const {movements } = useSession()

  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            {userRole == 'ADMIN' && <TableHead>Usuario</TableHead>}
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialMovements.map((movement) => {
            return (
              <TableRow key={movement.id} className="cursor-pointer">
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatToLocaleDate(new Date(movement.date))}
                </TableCell>
                {userRole == 'ADMIN' && (
                  <TableCell className="font-medium">{movement.account.user.name}</TableCell>
                )}
                <TableCell className="font-medium">{movement.payer}</TableCell>
                <TableCell>{getPaymentStatusLabel(movement.status)}</TableCell>
                <TableCell>{getPaymentMethodLabel(movement.method)}</TableCell>
                <TableCell>{movement.currency}</TableCell>
                <TableCell>{getPaymentTypeLabel(movement.type)}</TableCell>
                <TableCell>{movement.concept}</TableCell>
                <TableCell
                  className={`text-right ${movement.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {currencyFormatter(movement.amount, 'es-AR', movement.currency, true)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
