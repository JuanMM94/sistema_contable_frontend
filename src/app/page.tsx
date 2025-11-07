import { getMovements } from '@/lib/movements';
import HomeClient from './HomeClient';

export default async function Page() {
  // quick sanity check: uncomment to verify the route renders
  // return <div>It works</div>;

  const movements = await getMovements(); // runs on the server
  return <HomeClient initialMovements={movements.data} />;
}
