'use server';

import { revalidateTag } from 'next/cache';
import { NewMovementInputT } from './schemas';

export async function createMovement(data: NewMovementInputT) {
  const res = await fetch(`${process.env.API_BASE!}/api/v1/movements`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to create movement');
  revalidateTag('movements', 'max');
}
