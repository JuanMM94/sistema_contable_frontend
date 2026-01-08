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
  id: z.uuidv4(),
  authId: z.string(),
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema.default('MEMBER'),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const AccountSchema = z.object({
  id: z.uuidv4(),
  currency: CurrencySchema,
  amount: z.string(),
  userId: z.uuidv4(),
  user: BaseUserSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  percentChange: z.number().optional(),
});

// Full User schema with accounts
export const UserSchema = BaseUserSchema.extend({
  accounts: z.array(AccountSchema).optional(),
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
  id: z.uuidv4(),
  accountId: z.uuidv4(),
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

export type Movement = z.infer<typeof MovementSchema>;
export type AccountWithMovements = z.infer<typeof AccountSchema>;
export const AccountsResponseSchema = z.array(AccountSchema);
export type User = z.infer<typeof UserSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserLoginResponse = {
  user: User;
  token: string;
};
