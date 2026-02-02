'use client';

import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { useSession } from '@/providers/RouteFetchProvider';
import { ListMovementsUser } from '../custom/ListMovements';
import { PayerBalances } from '@/components/custom/PayerBalances';

export default function Home() {
  const { user, loading } = useSession();

  return (
    <div className="lg:w-[70vw] w-[90vw] flex flex-col gap-6 m-auto">
      <h3>Hola, {user?.name ?? 'usuario'}!</h3>
      <section className="flex flex-col lg:flex-row gap-4">
        {loading ? (
          <></>
        ) : (
          user?.accounts?.map((acc) => <CardAccount key={acc.id} accountInformation={acc} />)
        )}
      </section>

      <Splitter />

      <section>
        <h4 className="text-lg font-semibold">Saldos por cliente</h4>
        <PayerBalances />
      </section>

      <Splitter />

      <section>
        <h4>Últimos movimientos</h4>
        <ListMovementsUser initialMovements={user?.movements ?? []} />
      </section>
    </div>
  );
}
