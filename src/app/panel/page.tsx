import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de control',
  description: 'Manejá y mirá todas tus transacciones.',
};

import HomeClient from '../Dashboard';

export default async function Page() {
  return <HomeClient />;
}
