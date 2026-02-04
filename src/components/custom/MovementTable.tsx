import { Movement, MovementContent } from '@/lib/schemas';
import { useMemo, useState, type ReactNode } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Input } from '../ui/input';
import { SortColumn, SortDirection, SortIcon } from './SortIcon';
import { formatDateFromISO, formatDateTimeFromISO } from '@/lib/date_utils';
import {
  currencyFormatter,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from '@/lib/utils';

export type Column<T> = {
  key: MovementContent;
  label: string;
  allowFilter: boolean;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
};

type MovementTableProps = {
  movements: Movement[];
  columns: Column<Movement>[];
};

function getSortValue(movement: Movement, column: SortColumn) {
  switch (column) {
    case 'date':
    case 'updatedAt':
    case 'createdAt':
      return new Date(movement[column]).getTime();
    case 'amount':
    case 'exchangeRate': {
      const numericValue = parseFloat(movement[column] ?? '0');
      return Number.isNaN(numericValue) ? 0 : numericValue;
    }
    case 'account':
      return movement.account?.user?.name ?? movement.account?.id ?? '';
    default: {
      const value = movement[column];
      return value ?? '';
    }
  }
}

function renderCellValue(movement: Movement, column: MovementContent) {
  switch (column) {
    case 'date':
    case 'updatedAt':
    case 'createdAt':
      return formatDateTimeFromISO(movement[column]);
    case 'status':
      return getPaymentStatusLabel(movement.status);
    case 'method':
      return getPaymentMethodLabel(movement.method);
    case 'type':
      return getPaymentTypeLabel(movement.type);
    case 'amount':
      return currencyFormatter(movement.amount, 'es-AR', movement.currency, true);
    case 'currency':
      return movement.currency;
    case 'account':
      return movement.account?.user?.name ?? movement.account?.id ?? '-';
    default: {
      const value = movement[column];
      return value ?? '-';
    }
  }
}

function getFilterValue(movement: Movement, column: MovementContent) {
  switch (column) {
    case 'date':
    case 'updatedAt':
    case 'createdAt':
      return formatDateFromISO(movement[column]);
    case 'status':
      return getPaymentStatusLabel(movement.status);
    case 'method':
      return getPaymentMethodLabel(movement.method);
    case 'type':
      return getPaymentTypeLabel(movement.type);
    case 'amount':
      return movement.amount;
    case 'currency':
      return movement.currency;
    case 'account':
      return movement.account?.user?.name ?? '';
    default: {
      const value = movement[column];
      return value ?? '';
    }
  }
}

export function MovementTable({ movements, columns }: MovementTableProps) {
  const defaultSortColumn = columns[0]?.key ?? 'date';
  const [sortColumn, setSortColumn] = useState<SortColumn>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);

  const effectiveSortColumn = useMemo<SortColumn>(() => {
    return columnKeys.includes(sortColumn) ? sortColumn : defaultSortColumn;
  }, [columnKeys, defaultSortColumn, sortColumn]);

  const nextDirection = (dir: SortDirection): SortDirection => {
    if (dir === 'desc') return 'asc';
    if (dir === 'asc') return 'default';
    return 'desc';
  };

  const handleSort = (column: SortColumn) => {
    if (effectiveSortColumn === column) {
      setSortDirection((prev) => nextDirection(prev));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const filteredMovements = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([, value]) => value.trim().length > 0);
    if (activeFilters.length == 0) return movements;

    return movements.filter((movement) =>
      activeFilters.every(([key, value]) => {
        const field = getFilterValue(movement, key as MovementContent);
        return field.toString().toLowerCase().includes(value.trim().toLowerCase());
      }),
    );
  }, [movements, filters]);

  const sortedMovements = useMemo(() => {
    if (sortDirection === 'default') return filteredMovements;

    return [...filteredMovements].sort((a, b) => {
      const left = getSortValue(a, sortColumn);
      const right = getSortValue(b, sortColumn);

      if (left === right) return 0;

      const dir = sortDirection === 'asc' ? 1 : -1;
      return left > right ? dir : -dir;
    });
  }, [filteredMovements, sortColumn, sortDirection]);

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`whitespace-nowrap ${
                  column.allowFilter ? 'cursor-pointer hover:bg-accent' : ''
                } ${column.align === 'right' ? 'text-right' : ''}`}
                onClick={column.allowFilter ? () => handleSort(column.key) : undefined}
              >
                {column.label}{' '}
                {column.allowFilter ? (
                  <SortIcon
                    column={column.key}
                    currentColumn={sortColumn}
                    direction={sortDirection}
                  />
                ) : null}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={`${column.key}-filter`}>
                {column.allowFilter ? (
                  <Input
                    value={filters[column.key] ?? ''}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        [column.key]: event.target.value,
                      }))
                    }
                    placeholder={`Filtrar ${column.label.toLowerCase()}`}
                  />
                ) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovements.map((movement) => (
            <TableRow key={movement.id}>
              {columns.map((column) => (
                <TableCell
                  key={`${movement.id}-${column.key}`}
                  className={`whitespace-nowrap ${
                    column.align === 'right' ? 'text-right' : ''
                  } ${column.key === 'amount' ? 'font-medium' : ''} ${
                    column.key === 'amount' && movement.type === 'EGRESS' ? 'text-red-600' : ''
                  } ${
                    column.key === 'amount' && movement.type !== 'EGRESS' ? 'text-green-600' : ''
                  }`}
                >
                  {column.render ? column.render(movement) : renderCellValue(movement, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
