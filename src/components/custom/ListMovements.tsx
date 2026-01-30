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
import { Movement } from '@/lib/schemas';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import EditMovementDialog from './ModalEditMovement';

function ListMovementsUser({ initialMovements }: { initialMovements: Movement[] | [] }) {
  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
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
              <TableRow key={movement.id}>
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatToLocaleDate(new Date(movement.date))}
                </TableCell>
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

function ListMovementsAdmin() {
  const { movements, deleteMovement } = useAdminContext();
  const rows = movements ?? [];

  return (
    <section className={styles.table_section}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id de factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((movement) => {
            return (
              <TableRow key={movement.id}>
                <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
                <TableCell className="font-medium">
                  {formatToLocaleDate(new Date(movement.date))}
                </TableCell>
                <TableCell className="font-medium">{movement.account.user.name}</TableCell>
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
                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center gap-3">
                    <EditMovementDialog movement={movement} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Borrar
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción es permanente. ¿Estas seguro de borrar este movimiento?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={async () => {
                              await deleteMovement({ movementId: movement.id });
                            }}
                          >
                            Borrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

export { ListMovementsUser, ListMovementsAdmin };
