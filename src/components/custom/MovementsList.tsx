'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatShortDate } from '@/lib/date_utils';
import {
  formatCurrencyValue,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import styles from '../../app/page.module.css';
import { Button } from '../ui/button';
import { Movement } from '@/lib/schemas';

export default function MovementsList({
  initialMovements,
  userRole,
}: {
  initialMovements: Movement[] | [];
  userRole: string | undefined;
}) {
  // pass onCreated to ButtonDrawer
  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            {userRole == 'ADMIN' && <TableHead>Pagador</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead>Metodo</TableHead>
            <TableHead>Tipo</TableHead>
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
                {/* Cut id only for display to make it more readable to user */}
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatShortDate(new Date(movement.date))}
                </TableCell>
                {userRole == 'ADMIN' && (
                  <TableCell className="font-medium">{movement.payer}</TableCell>
                )}
                <TableCell>{getPaymentStatusLabel(movement.status)}</TableCell>
                <TableCell>{getPaymentMethodLabel(movement.method)}</TableCell>
                <TableCell>{getPaymentTypeLabel(movement.type)}</TableCell>
                <TableCell className="text-right">{formatCurrencyValue(movement.amount)}</TableCell>
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
