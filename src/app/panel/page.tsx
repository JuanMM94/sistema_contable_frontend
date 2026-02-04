'use client';

import { Splitter } from '@/components/custom/Splitter';
import { CardAccount } from '@/components/custom/CardAccount';
import { useSession } from '@/providers/RouteFetchProvider';
import { ListMovementsUser } from '@/components/custom/ListMovements';
import { PayerBalances } from '@/components/custom/GridPayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  const { user, loading } = useSession();
  return (
    <main>
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

        <Tabs defaultValue='last-movements'>
          <TabsList variant="line">
            <TabsTrigger value='last-movements'>Últimos movimientos</TabsTrigger>
            <TabsTrigger value='client-balance'>Saldos por cliente</TabsTrigger>
          </TabsList>
          <TabsContent value='last-movements'>
            <ListMovementsUser />
          </TabsContent>
          <TabsContent value='client-balance'>
            <PayerBalances />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
