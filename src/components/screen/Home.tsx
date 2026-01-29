'use client';

import styles from '../../app/page.module.css';
import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { useSession } from '@/providers/RouteFetchProvider';
import { ListMovementsUser } from '../custom/ListMovements';

export default function Home() {
  const { user, loading, movements } = useSession();

  return (
    <div className={styles.dashboard}>
      <div className={styles.home}>
        <h3>Hola, {user?.name ?? 'usuario'}!</h3>
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
            <ListMovementsUser initialMovements={movements ?? []} />
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
