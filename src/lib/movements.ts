import 'server-only';
import API_BASE from './endpoint';
import { InputMovement } from './schemas';

export async function getMovements() {
  const res = await fetch(`${API_BASE}/movements`, {
    // opt into Next caching:
    next: { revalidate: 60, tags: ['movements'] },
  });
  if (!res.ok) throw new Error('Failed to load movements');
  return res.json();
}
