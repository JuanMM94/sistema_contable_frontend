import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de control',
  description: 'Manejá y mirá todas tus transacciones.',
};

import { getMovements } from '@/lib/movements';
import HomeClient from '../Dashboard';

export default async function Page() {
  const userMovements = await getMovements()

  return <HomeClient userMovements={userMovements.data} />;
}
