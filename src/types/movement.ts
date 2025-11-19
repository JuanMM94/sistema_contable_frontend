import type { AccountWithMovements, Movement as MovementRecord } from "@/lib/schemas";

export type Movement = MovementRecord;

// export interface ServerMovement extends Movement {
//   id: string;
//   note?: string;
//   accountId?: string;
//   account?: object;
// }

export type User = {
  username: string;
  email: string;
  role: string;
}

export interface ServerUser extends User {
  id: string;
  accounts?: AccountWithMovements[];
  sessions?: object[];
  movements?: Movement[]
}
