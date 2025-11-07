export type Movement = {
  date: string;
  payer: string;
  concept: string;
  currency: string;
  exchangeRate: number;
  status: string;
  amount: number;
  type: string;
  method: string;
};

export interface ServerMovement extends Movement {
  id: string;
  note?: string;
  accountId?: string;
  account?: object;
}
