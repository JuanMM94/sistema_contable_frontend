import 'server-only';

const API_BASE =
  process.env.NODE_ENV == 'development' ? process.env.BACKEND_API_DEV : process.env.BACKEND_API;

export async function getMovements() {
  const res = await fetch(`${API_BASE}/api/v1/movements`, {
    // opt into Next caching:
    next: { revalidate: 60, tags: ['movements'] },
  });
  if (!res.ok) throw new Error('Failed to load movements');
  return res.json();
}
