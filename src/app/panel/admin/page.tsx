'use client';

import { ChartBarMultiple } from '@/components/custom/ChartBar';

export default function Page() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-[70vw]">
        <h3>Panel de Administrador</h3>
        <section>
          <ChartBarMultiple />
        </section>
      </div>
    </div>
  );
}
