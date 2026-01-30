'use client';

import { AccountWithMovements } from '@/lib/schemas';
import { CardAccount } from './CardAccount';

type AccountCardsProps = {
  accounts: AccountWithMovements[] | undefined;
  loading: boolean;
};

export function AccountCards({ accounts, loading }: AccountCardsProps) {
  if (loading) {
    return null;
  }

  return (
    <>
      {accounts?.map((acc) => (
        <CardAccount key={acc.id} accountInformation={acc} />
      ))}
    </>
  );
}
