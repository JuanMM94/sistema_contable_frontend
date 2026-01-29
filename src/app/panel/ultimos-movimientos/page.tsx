'use client';

import styles from '../../page.module.css';
import { Splitter } from '@/components/custom/Splitter';
import { ListMovementsUser } from '@/components/custom/ListMovements';
import { useSession } from '@/providers/RouteFetchProvider';
import { MoveLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Page() {
  const { user, loading } = useSession();
  const searchParams = useSearchParams();
  const [filterBy, setFilterBy] = useState<string | null>(searchParams.get('currency'));

  const filteredMovements = filterBy
    ? user?.movements?.filter((movement) => movement.currency === filterBy)
    : user?.movements;

  return (
    <div className={styles.dashboard}>
      <div className="w-[70vw] p-4 flex flex-col gap-8">
        <div
          className="flex flex-row items-center gap-2 mb-4 cursor-pointer"
          onClick={() => history.back()}
        >
          <MoveLeft size={24} />
          <h5>Volver</h5>
        </div>
        <div className={styles.information_container}>
          <section className={styles.card_section}>
            {loading ? (
              <></>
            ) : (
              <section className={styles.table_section}>
                <h4>Últimos movimientos</h4>
                <div className="flex justify-center">
                  <ButtonGroup>
                    <Button onClick={() => setFilterBy(null)} variant="outline" size="sm">
                      Todos
                    </Button>
                    <Button onClick={() => setFilterBy('ARS')} variant="outline" size="sm">
                      ARS
                    </Button>
                    <Button onClick={() => setFilterBy('USD')} variant="outline" size="sm">
                      USD
                    </Button>
                  </ButtonGroup>
                </div>
                <ListMovementsUser initialMovements={filteredMovements ?? []} />
              </section>
            )}
          </section>
        </div>
      </div>
      <Splitter />
    </div>
  );
}
