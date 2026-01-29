import { z } from 'zod';

export const CurrencySchema = z.enum(['ARS', 'USD']); // add more: 'ARS', etc.
export const PaymentStatusSchema = z.enum(['PAID', 'PENDING', 'UNPAID']);
export const PaymentMethodSchema = z.enum(['CASH', 'WIRE', 'DEPOSIT']); // add more: 'CHECK', etc.
export const MovementTypeSchema = z.enum(['INCOME', 'EGRESS']); // add more: 'EXPENSE', etc.

// -- User Schema --
export const RoleSchema = z.enum(['ADMIN', 'MEMBER']);
export type Role = z.infer<typeof RoleSchema>;

// Base User schema without accounts (to avoid circular reference)
const BaseUserSchema = z.object({
  id: z.uuid(),
  authId: z.string(),
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema.default('MEMBER'),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const AccountSchema = z.object({
  id: z.uuid(),
  currency: CurrencySchema,
  user: z.object({ name: z.string(), id: z.uuidv4() }),
  amount: z.string(),
  userId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  percentChange: z.number().optional(),
});

// Full User schema with accounts
export const UserSchema = BaseUserSchema.extend({
  accounts: z.array(AccountSchema),
});

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type InputMember = Omit<
  z.infer<typeof UserSchema>,
  'id' | 'authId' | 'accounts' | 'updatedAt' | 'createdAt'
> & { password: string };

export const MovementSchema = z.object({
  id: z.uuid(),
  accountId: z.uuid(),
  account: AccountSchema,
  payer: z.string(),
  concept: z.string(),
  amount: z.string(), // Prisma Decimal serialized as string
  note: z.string().optional(),
  date: z.iso.datetime(),
  exchangeRate: z.string().optional(), // "0" or other decimal-as-string
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  method: PaymentMethodSchema,
  type: MovementTypeSchema,
  updatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export type InputMovement = Omit<
  z.infer<typeof MovementSchema>,
  'id' | 'accountId' | 'account' | 'updatedAt' | 'createdAt'
> & { member: string };

export type EditMovement = Partial<InputMovement> & { movementId: typeof z.uuid, payer: string, concept: string, note:string, status:typeof PaymentStatusSchema, type: typeof MovementTypeSchema, method: typeof PaymentMethodSchema };

export const SwapSchema = z.object({
  id: z.uuid(),
  accountId: z.uuid(),
  account: AccountSchema,
  amount: z.string(), // Prisma Decimal serialized as string
  date: z.iso.datetime(),
  exchangeRate: z.string().optional(), // "0" or other decimal-as-string
  currency: CurrencySchema,
  type: MovementTypeSchema,
  updatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const InputSwap = z.object({
  userId: z.uuid(),
  fromCurrency: CurrencySchema,
  toCurrency: CurrencySchema,
  amountChange: z.number().positive({ message: 'El monto debe ser mayor a 0.' }),
  adminRate: z.any().optional(),
  amountTotal: z.number().positive({ message: 'El monto debe ser mayor a 0.' }),
});

export type InputSwap = z.infer<typeof InputSwap>;

export type CurrencySwapData = {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amountChange: number;
  adminRate: number;
  amountTotal: number;
};

export type ExchangeRate = {
  currency: string;
  market: string;
  name: string;
  buy: number;
  sell: number;
  updatedAt: Date;
};

export type Movement = z.infer<typeof MovementSchema>;
export type AccountWithMovements = z.infer<typeof AccountSchema>;
export const AccountsResponseSchema = z.array(AccountSchema);
export type User = z.infer<typeof UserSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserLoginResponse = {
  user: User;
  token: string;
};

export const movementWithLimitSchema = z.object({
  month: z.string(),
  income: z.string(),
  egress: z.string(),
});

export type MovementWithLimit = z.infer<typeof movementWithLimitSchema>;

//Expand filters here-

export type Filter = {
  movementWithLimit: MovementWithLimit;
};
