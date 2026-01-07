import type { AccountWithMovements, Movement as MovementRecord } from '@/lib/schemas';

export type Movement = MovementRecord;

export type User = {
  name: string;
  email: string;
  role: string;
};

export interface ServerUser extends User {
  id: string;
  accounts?: AccountWithMovements[];
  sessions?: object[];
  movements?: Movement[];
}
