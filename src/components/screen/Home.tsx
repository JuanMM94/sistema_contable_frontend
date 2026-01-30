'use client';

import styles from '../../app/page.module.css';
import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { useSession } from '@/providers/RouteFetchProvider';
import { ListMovementsUser } from '../custom/ListMovements';
import { PayerBalances } from '@/components/custom/PayerBalances';

export default function Home() {
  const { user, loading } = useSession();

  return (
    <div className={styles.dashboard}>
      <div className={styles.home}>
        <h3>Hola, {user?.name ?? 'usuario'}!</h3>
        <section className={styles.card_section}>
          {loading ? (
            <></>
          ) : (
            user?.accounts?.map((acc) => <CardAccount key={acc.id} accountInformation={acc} />)
          )}
        </section>

        <Splitter />

        <section>
          <h4 className="text-lg font-semibold">Saldos por cliente</h4>
          <PayerBalances movements={user?.movements ?? []} userName={user?.name} />
        </section>

        <Splitter />

        <section>
          <h4>Últimos movimientos</h4>
          <ListMovementsUser initialMovements={user?.movements ?? []} />
        </section>
      </div>
    </div>
  );
}
