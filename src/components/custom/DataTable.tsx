import { useMemo, useState, type ReactNode } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Input } from '../ui/input';
import { SortColumn, SortDirection, SortIcon } from './SortIcon';

export type Column<T, K extends string = string> = {
  key: K;
  label: string;
  allowFilter: boolean;
  align?: 'left' | 'right';
  /** Render a custom cell. If omitted, falls back to `getValue`. */
  render?: (row: T) => ReactNode;
  /** Plain string/number used for sorting. */
  getSortValue?: (row: T) => string | number;
  /** Plain string used for filter matching. */
  getFilterValue?: (row: T) => string;
  /** Default cell display when `render` is not provided. */
  getValue?: (row: T) => ReactNode;
  /** Extra className(s) applied to the <TableCell>. */
  cellClassName?: (row: T) => string;
};

type DataTableProps<T extends { id: string }, K extends string> = {
  rows: T[];
  columns: Column<T, K>[];
};

export function DataTable<T extends { id: string }, K extends string>({
  rows,
  columns,
}: DataTableProps<T, K>) {
  const defaultSortKey = columns[0]?.key ?? '';
  const [sortColumn, setSortColumn] = useState<string>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const nextDirection = (dir: SortDirection): SortDirection => {
    if (dir === 'desc') return 'asc';
    if (dir === 'asc') return 'default';
    return 'desc';
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection((prev) => nextDirection(prev));
    } else {
      setSortColumn(key);
      setSortDirection('desc');
    }
  };

  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim().length > 0);
    if (activeFilters.length === 0) return rows;

    return rows.filter((row) =>
      activeFilters.every(([key, value]) => {
        const col = columns.find((c) => c.key === key);
        const field = col?.getFilterValue?.(row) ?? '';
        return field.toLowerCase().includes(value.trim().toLowerCase());
      }),
    );
  }, [rows, filters, columns]);

  const sortedRows = useMemo(() => {
    if (sortDirection === 'default') return filteredRows;

    const col = columns.find((c) => c.key === sortColumn);
    if (!col?.getSortValue) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const left = col.getSortValue!(a);
      const right = col.getSortValue!(b);
      if (left === right) return 0;
      const dir = sortDirection === 'asc' ? 1 : -1;
      return left > right ? dir : -dir;
    });
  }, [filteredRows, sortColumn, sortDirection, columns]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`whitespace-nowrap ${
                  col.allowFilter ? 'cursor-pointer hover:bg-accent' : ''
                } ${col.align === 'right' ? 'text-right' : ''}`}
                onClick={col.allowFilter ? () => handleSort(col.key) : undefined}
              >
                {col.label}{' '}
                {col.allowFilter ? (
                  <SortIcon
                    column={col.key as SortColumn}
                    currentColumn={sortColumn as SortColumn}
                    direction={sortDirection}
                  />
                ) : null}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={`${col.key}-filter`}>
                {col.allowFilter ? (
                  <Input
                    value={filters[col.key] ?? ''}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                    placeholder={`Filtrar ${col.label.toLowerCase()}`}
                  />
                ) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell
                  key={`${row.id}-${col.key}`}
                  className={`whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : ''
                  } ${col.cellClassName?.(row) ?? ''}`}
                >
                  {col.render ? col.render(row) : (col.getValue?.(row) ?? '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-1 py-0.5 text-sm"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span>
            {Math.min((page - 1) * pageSize + 1, sortedRows.length)}–
            {Math.min(page * pageSize, sortedRows.length)} de {sortedRows.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2 py-1 text-sm rounded hover:bg-accent disabled:opacity-40"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-2 py-1 text-sm rounded hover:bg-accent disabled:opacity-40"
          >
            &#8249;
          </button>
          <span className="px-3 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-2 py-1 text-sm rounded hover:bg-accent disabled:opacity-40"
          >
            &#8250;
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2 py-1 text-sm rounded hover:bg-accent disabled:opacity-40"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
