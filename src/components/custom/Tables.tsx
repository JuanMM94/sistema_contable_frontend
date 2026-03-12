'use client';
import { User, UsersContent, Movement, MovementContent } from '@/lib/schemas';
import { DataTable, type Column } from './DataTable';
import { formatDateTimeFromISO, formatDateFromISO } from '@/lib/date_utils';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';
import EditMovementDialog from './ModalEditMovement';
import DeleteMovementDialog from './ModalDeleteMovement';

const COLUMNS: Column<User, UsersContent>[] = [
  {
    key: 'name',
    label: 'Nombre',
    allowFilter: true,
    getSortValue: (u) => u.name ?? '',
    getFilterValue: (u) => u.name ?? '',
    getValue: (u) => u.name ?? '-',
  },
  {
    key: 'email',
    label: 'Email',
    allowFilter: true,
    getSortValue: (u) => u.email ?? '',
    getFilterValue: (u) => u.email ?? '',
    getValue: (u) => u.email ?? '-',
  },
  {
    key: 'role',
    label: 'Rol',
    allowFilter: true,
    getSortValue: (u) => u.role ?? '',
    getFilterValue: (u) => u.role ?? '',
    getValue: (u) => u.role ?? '-',
  },
  {
    key: 'passwordChangeRequired',
    label: 'Cambio de clave requerido',
    allowFilter: false,
    getValue: (u) => (u.passwordChangeRequired ? 'Sí' : 'No'),
  },
  {
    key: 'createdAt',
    label: 'Creado',
    allowFilter: true,
    getSortValue: (u) => new Date(u.createdAt).getTime(),
    getFilterValue: (u) => formatDateTimeFromISO(u.createdAt),
    getValue: (u) => formatDateTimeFromISO(u.createdAt),
  },
  {
    key: 'updatedAt',
    label: 'Actualizado',
    allowFilter: true,
    getSortValue: (u) => new Date(u.updatedAt).getTime(),
    getFilterValue: (u) => formatDateTimeFromISO(u.updatedAt),
    getValue: (u) => formatDateTimeFromISO(u.updatedAt),
  },
];

type UsersTableProps = {
  users: User[];
};

export function UsersTable({ users }: UsersTableProps) {
  return <DataTable rows={users} columns={COLUMNS} />;
}

function makeMovementColumns(): Column<Movement, MovementContent>[] {
  return [
    {
      key: 'date',
      label: 'Fecha',
      allowFilter: true,
      getSortValue: (m) => new Date(m.createdAt).getTime(),
      getFilterValue: (m) => formatDateFromISO(m.createdAt),
      getValue: (m) => formatDateTimeFromISO(m.createdAt),
    },
    {
      key: 'payer',
      label: 'Pagador',
      allowFilter: true,
      getSortValue: (m) => m.payer ?? '',
      getFilterValue: (m) => m.payer ?? '',
      getValue: (m) => m.payer ?? '-',
    },
    {
      key: 'concept',
      label: 'Concepto',
      allowFilter: true,
      getSortValue: (m) => m.concept ?? '',
      getFilterValue: (m) => m.concept ?? '',
      getValue: (m) => m.payer ?? '-',
    },
    {
      key: 'amount',
      label: 'Monto',
      allowFilter: true,
      align: 'right',
      getSortValue: (m) => parseFloat(m.amount ?? '0'),
      getFilterValue: (m) => m.amount ?? '',
      getValue: (m) => currencyFormatter(m.amount, 'es-AR', m.currency, true),
      cellClassName: (m) =>
        `font-medium ${m.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`,
    },
    {
      key: 'status',
      label: 'Estado',
      allowFilter: true,
      getSortValue: (m) => m.status,
      getFilterValue: (m) => getPaymentStatusLabel(m.status),
      getValue: (m) => getPaymentStatusLabel(m.status),
    },
    {
      key: 'method',
      label: 'Método',
      allowFilter: true,
      getSortValue: (m) => m.method,
      getFilterValue: (m) => getPaymentMethodLabel(m.method),
      getValue: (m) => getPaymentMethodLabel(m.method),
    },
    {
      key: 'type',
      label: 'Tipo',
      allowFilter: true,
      getSortValue: (m) => m.type,
      getFilterValue: (m) => getPaymentTypeLabel(m.type),
      getValue: (m) => getPaymentTypeLabel(m.type),
    },
  ];
}

function makeMovementColumnsAdmin(): Column<Movement, MovementContent>[] {
  return [
    {
      key: 'date',
      label: 'Fecha',
      allowFilter: true,
      getSortValue: (m) => new Date(m.createdAt).getTime(),
      getFilterValue: (m) => formatDateFromISO(m.createdAt),
      getValue: (m) => formatDateTimeFromISO(m.createdAt),
    },
    {
      key: 'payer',
      label: 'Pagador',
      allowFilter: true,
      getSortValue: (m) => m.payer ?? '',
      getFilterValue: (m) => m.payer ?? '',
      getValue: (m) => m.payer ?? '-',
    },
    {
      key: 'concept',
      label: 'Concepto',
      allowFilter: true,
      getSortValue: (m) => m.concept ?? '',
      getFilterValue: (m) => m.concept ?? '',
      getValue: (m) => m.payer ?? '-',
    },
    {
      key: 'amount',
      label: 'Monto',
      allowFilter: true,
      align: 'right',
      getSortValue: (m) => parseFloat(m.amount ?? '0'),
      getFilterValue: (m) => m.amount ?? '',
      getValue: (m) => currencyFormatter(m.amount, 'es-AR', m.currency, true),
      cellClassName: (m) =>
        `font-medium ${m.type === 'EGRESS' ? 'text-red-600' : 'text-green-600'}`,
    },
    {
      key: 'status',
      label: 'Estado',
      allowFilter: true,
      getSortValue: (m) => m.status,
      getFilterValue: (m) => getPaymentStatusLabel(m.status),
      getValue: (m) => getPaymentStatusLabel(m.status),
    },
    {
      key: 'method',
      label: 'Método',
      allowFilter: true,
      getSortValue: (m) => m.method,
      getFilterValue: (m) => getPaymentMethodLabel(m.method),
      getValue: (m) => getPaymentMethodLabel(m.method),
    },
    {
      key: 'type',
      label: 'Tipo',
      allowFilter: true,
      getSortValue: (m) => m.type,
      getFilterValue: (m) => getPaymentTypeLabel(m.type),
      getValue: (m) => getPaymentTypeLabel(m.type),
    },
    {
      key: 'id' as MovementContent,
      label: 'Acciones',
      allowFilter: false,
      render: (m: Movement) => (
        <div className="inline-flex items-center gap-3">
          <EditMovementDialog movement={m} />
          <DeleteMovementDialog movement={m} />
        </div>
      ),
    },
  ];
}

export function MovementTable({ movements }: { movements: Movement[] }) {
  return <DataTable rows={movements} columns={makeMovementColumns()} />;
}

export function MovementTableAdmin({ movements }: { movements: Movement[] }) {
  return <DataTable rows={movements} columns={makeMovementColumnsAdmin()} />;
}
