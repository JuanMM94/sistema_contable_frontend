'use client';
import { Movement } from '@/lib/schemas';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import EditMovementDialog from './ModalEditMovement';
import { Column, MovementTable } from './MovementTable';
import { useSession } from '@/providers/RouteFetchProvider';
import DeleteMovementDialog from './ModalDeleteMovement';

function ListMovementsUser() {
  const { movements } = useSession();

  const displayColumns = [
    { key: 'date', label: 'Fecha', allowFilter: true },
    { key: 'payer', label: 'Cliente', allowFilter: true },
    { key: 'status', label: 'Estado', allowFilter: true },
    { key: 'method', label: 'Método', allowFilter: true },
    { key: 'currency', label: 'Moneda', allowFilter: true },
    { key: 'type', label: 'Tipo', allowFilter: true },
    { key: 'concept', label: 'Nota', allowFilter: true },
    { key: 'amount', label: 'Cantidad', allowFilter: true },
  ] as Column<Movement>[];

  return <MovementTable movements={movements} columns={displayColumns} />;
}

function ListMovementsAdmin() {
  const { movements } = useAdminContext();

  const displayColumns = [
    { key: 'date', label: 'Fecha', allowFilter: true },
    { key: 'payer', label: 'Cliente', allowFilter: true },
    { key: 'status', label: 'Estado', allowFilter: true },
    { key: 'method', label: 'Método', allowFilter: true },
    { key: 'currency', label: 'Moneda', allowFilter: true },
    { key: 'type', label: 'Tipo', allowFilter: true },
    { key: 'concept', label: 'Nota', allowFilter: true },
    { key: 'amount', label: 'Cantidad', allowFilter: true },
    {
      key: 'id',
      label: 'Acciones',
      allowFilter: false,
      render: (movement) => (
        <div className="inline-flex items-center gap-3">
          <EditMovementDialog movement={movement} />
          <DeleteMovementDialog movement={movement} />
        </div>
      ),
    },
  ] as Column<Movement>[];

  return <MovementTable movements={!movements ? [] : movements} columns={displayColumns} />;

  // return (
  //   <Table className="w-full">
  //     <TableHeader>
  //       <TableRow>
  //         <TableHead className="w-[100px]">Id de factura</TableHead>
  //         <TableHead>Fecha</TableHead>
  //         <TableHead>Usuario</TableHead>
  //         <TableHead>Cliente</TableHead>
  //         <TableHead>Estado</TableHead>
  //         <TableHead>Método</TableHead>
  //         <TableHead>Moneda</TableHead>
  //         <TableHead>Tipo</TableHead>
  //         <TableHead>Nota</TableHead>
  //         <TableHead className="text-right">Cantidad</TableHead>
  //         <TableHead className="text-center">Acciones</TableHead>
  //       </TableRow>
  //     </TableHeader>
  //     <TableBody>
  //       {rows.map((movement) => {
  //         return (
  //           <TableRow key={movement.id}>
  //             <TableCell className="font-medium">{movement.id.slice(0, 8)}...</TableCell>
  //             <TableCell className="font-medium">
  //               {formatToLocaleDate(new Date(movement.date))}
  //             </TableCell>
  //             <TableCell className="font-medium">{movement.account.user.name}</TableCell>
  //             <TableCell className="font-medium">{movement.payer}</TableCell>
  //             <TableCell>{getPaymentStatusLabel(movement.status)}</TableCell>
  //             <TableCell>{getPaymentMethodLabel(movement.method)}</TableCell>
  //             <TableCell>{movement.currency}</TableCell>
  //             <TableCell>{getPaymentTypeLabel(movement.type)}</TableCell>
  //             <TableCell>{movement.concept}</TableCell>
  //             <TableCell
  //               className={`text-right ${movement.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`}
  //             >
  //               {currencyFormatter(movement.amount, 'es-AR', movement.currency, true)}
  //             </TableCell>
  //             <TableCell className="text-center">
  //               <div className="inline-flex items-center justify-center gap-3">
  //                 <EditMovementDialog movement={movement} />
  //
  //               </div>
  //             </TableCell>
  //           </TableRow>
  //         );
  //       })}
  //     </TableBody>
  //   </Table>
  // );
}

export { ListMovementsUser, ListMovementsAdmin };
