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
}

export { ListMovementsUser, ListMovementsAdmin };
