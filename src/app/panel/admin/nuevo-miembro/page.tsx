'use client';

import { InputMember } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { Splitter } from '@/components/custom/Splitter';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import { FormNewMember } from '@/components/custom/FormNewMember';

export default function NewMovementPage() {
  const router = useRouter();
  const { createMember } = useAdminContext();

  const onCreated = async (payload: InputMember) => {
    console.log('Creating member with payload:', payload);
    createMember(payload);
    router.refresh();
  };

  return (
    <div className="p-4 flex flex-col gap-4 items-center mt-6!">
      <div className="flex flex-row gap-4 w-[70vw]">
        <section className="flex flex-col items-center justify-center w-full gap-4 ">
          <h4>Nuevo usuario</h4>
          <FormNewMember onCreated={onCreated} />
          <Splitter />
        </section>
      </div>
    </div>
  );
}
