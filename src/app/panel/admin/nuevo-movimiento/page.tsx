"use client"

import { NewMovementInputT } from '@/lib/schemas';
import { createMovement } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useMovements } from "@/providers/MovementProvider";
import { useSession } from '@/providers/RouteFetchProvider';
import { Splitter } from '@/components/custom/Splitter';
import { FormNewMovement } from '@/components/custom/FormNewMovement';

export default function NewMovementPage() {

  const {user} = useSession()
  const {movements, loading} = useMovements()

    const router = useRouter();
    const onCreated = async (payload: NewMovementInputT) => {
      await createMovement(payload);
      router.refresh();
    };

  return (
    <div className='p-4 flex flex-col gap-4 items-center mt-6!'>
        <div className='flex flex-row gap-4 w-[70vw]'>
          <section className='flex flex-col items-center justify-center w-full gap-4 '>
            <h4>Nuevo movimiento</h4>
            <FormNewMovement/> 
            <Splitter/>
          </section>
        </div>
    </div>
  );
}
