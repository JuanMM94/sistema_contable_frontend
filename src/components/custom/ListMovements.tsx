'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatShortDate, formatToLocaleDate } from '@/lib/date_utils';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import styles from '../../app/page.module.css';
import { Button } from '../ui/button';
import { Movement } from '@/lib/schemas';

export default function ListMovements({
  initialMovements,
  userRole,
}: {
  initialMovements: Movement[] | [];
  userRole: string | undefined;
}) {
  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            {userRole == 'ADMIN' && <TableHead>Pagador</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            {userRole == 'ADMIN' && (
              <TableHead className="text-center" colSpan={2}>
                Acciones
              </TableHead>
            )}
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
                  <TableCell className="font-medium">{movement.payer}</TableCell>
                )}
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
                {userRole == 'ADMIN' && (
                  <>
                    <TableCell className="text-center text-blue-600">
                      <Button variant="ghost" className="cursor-pointer">
                        Editar
                      </Button>
                    </TableCell>
                    <TableCell className="text-center text-red-400">
                      <Button variant="ghost" className="cursor-pointer">
                        Borrar
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
