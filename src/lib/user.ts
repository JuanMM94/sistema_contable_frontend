import 'server-only';
import API_BASE from './endpoint';

export async function getUserInformation() {
  const res = await fetch(`${API_BASE}/users`, {
    next: { revalidate: 60, tags: ['users'] },
  });
  if (!res.ok) throw new Error('Failed to load user information');
  return res.json();
}
