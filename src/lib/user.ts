import 'server-only';
import API_BASE from './endpoint';

export async function getUserInformation() {
  const res = await fetch(`${API_BASE}/session`, {
    next: { revalidate: 60, tags: ['session'] }, credentials: 'include',
  });
  console.log(res)
  if (!res.ok) throw new Error('Failed to reach session');
  return res.json();
}
