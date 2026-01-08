import type { AccountWithMovements, Movement as MovementRecord, Role } from '@/lib/schemas';

export type Movement = MovementRecord;

// export interface ServerMovement extends Movement {
//   id: string;
//   note?: string;
//   accountId?: string;
//   account?: object;
// }

export type User = {
  name: string;
  email: string;
  role: Role;
};

export interface ServerUser extends User {
  id: string;
  accounts?: AccountWithMovements[];
  sessions?: object[];
  movements?: Movement[];
}