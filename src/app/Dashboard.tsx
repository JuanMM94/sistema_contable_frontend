'use client';

import styles from './page.module.css';
import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import MovementsList from '@/components/custom/ListMovements';
import { useSession } from '@/providers/RouteFetchProvider';

export default function HomeClient() {
  const { user, loading } = useSession();

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
            <h4>Últimos movimientos</h4>
            <MovementsList initialMovements={user?.movements ?? []} userRole={user?.role} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
