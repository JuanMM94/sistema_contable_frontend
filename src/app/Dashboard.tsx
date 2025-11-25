'use client';

import styles from './page.module.css';
import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { ButtonDrawer } from '@/components/custom/DrawerNewMovement';
import MovementsList from '@/components/custom/MovementsList';
import { NewMovementInputT } from '@/lib/schemas';
import { createMovement } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useSession } from '@/providers/RouteFetchProvider';

export default function HomeClient() {
  const { user, loading } = useSession();

  const router = useRouter();
  const onCreated = async (payload: NewMovementInputT) => {
    await createMovement(payload);
    router.refresh();
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.home}>
        <h3>Hola, {user?.username ?? 'usuario'}!</h3>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            {loading ? (
              <></>
            ) : (
              user?.accounts?.map((acc) => <CardAccount key={acc.id} accountInformation={acc} />)
            )}
          </section>
        </div>
        <div className={styles.information_container}>
          <section className={styles.table_section}>
            <h4>Ultimos movimientos</h4>
            <MovementsList initialMovements={user?.movements ?? []} userRole={user?.role}/>
            <ButtonDrawer onCreated={onCreated} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
