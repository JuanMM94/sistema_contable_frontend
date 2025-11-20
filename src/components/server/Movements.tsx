import { getMovements } from '@/lib/movements';
import MovementsList from '../custom/MovementsList';

export default async function Movements() {
  const movements = await getMovements();
  return <MovementsList initialMovements={movements} />;
}
