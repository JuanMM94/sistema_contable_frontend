'use client';

import { InputMovement } from '@/lib/schemas';
import { toast } from 'sonner';
import { Splitter } from '@/components/custom/Splitter';
import { FormNewMovement } from '@/components/custom/FormNewMovement';
import { useAdminContext } from '@/providers/AdminFetchProvider';
import { currencyFormatter } from '@/lib/utils';

export default function NewMovementPage() {
  const { postNewMovement } = useAdminContext();

  const onCreated = async (payload: InputMovement) => {
    try {
      await postNewMovement(payload);
      const formattedAmount = currencyFormatter(payload.amount, 'es-AR', payload.currency, true);
      toast.success('Movimiento creado exitosamente', {
        description: `${payload.payer} - ${formattedAmount} (${payload.concept})`,
      });
    } catch (error) {
      toast.error('Error al crear movimiento', {
        description: error instanceof Error ? error.message : 'No se pudo crear el movimiento',
      });
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4 items-center">
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
