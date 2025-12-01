'use client';

import { InputMovement } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { Splitter } from '@/components/custom/Splitter';
import { FormNewMovement } from '@/components/custom/FormNewMovement';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export default function NewMovementPage() {
  const router = useRouter();
  const { createMovement } = useAdminContext();

  const onCreated = async (payload: InputMovement) => {
    console.log('Creating movement with payload:', payload);
    createMovement(payload);
    router.refresh();
  };

  return (
    <div className="p-4 flex flex-col gap-4 items-center mt-6!">
      <div className="flex flex-row gap-4 w-[70vw]">
        <section className="flex flex-col items-center justify-center w-full gap-4 ">
          <h4>Nuevo movimiento</h4>
          <FormNewMovement onCreated={onCreated} />
          <Splitter />
        </section>
      </div>
    </div>
  );
}
