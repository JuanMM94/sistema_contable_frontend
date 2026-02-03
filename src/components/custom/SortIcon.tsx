import { MovementContent } from '@/lib/schemas';

export type SortColumn = MovementContent;
export type SortDirection = 'asc' | 'desc' | 'default';

export function SortIcon({
  column,
  currentColumn,
  direction,
}: {
  column: SortColumn;
  currentColumn: SortColumn;
  direction: SortDirection;
}) {
  // Not the active column => neutral icon
  if (currentColumn !== column) {
    return <span className="ml-1 text-muted-foreground">-</span>;
  }

  // Active column, but default => neutral icon (no sort)
  if (direction === 'default') {
    return <span className="ml-1 text-muted-foreground">-</span>;
  }

  // Active column + sorted
  return <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>;
}
