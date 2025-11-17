import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de control',
  description: 'Manejá y mirá todas tus transacciones.',
};

import { getMovements } from '@/lib/movements';
import HomeClient from '../Dashboard';
import { getUserInformation } from '@/lib/user';

export default async function Page() {
  const userInformation = await getUserInformation()
  const userMovements = await getMovements()

  return <HomeClient userMovements={userMovements.data} userInformation={userInformation.data} />;
}
