import 'server-only';
import API_BASE from './endpoint';

export async function getUserInformation() {
  const res = await fetch(`${API_BASE}/movements`, {
    next: { revalidate: 60, tags: ['movements'] },
  });
  if (!res.ok) throw new Error('Failed to load movements');
  return res.json();
}
