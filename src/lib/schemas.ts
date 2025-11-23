import { z } from 'zod';

// -- Movement Schema --
export const Role = z.enum(['MEMBER', 'ADMIN']);
export const PaymentMethod = z.enum(['CASH', 'DEPOSIT', 'WIRE']);
export const PaymentStatus = z.enum(['PAID', 'UNPAID', 'PENDING']);
export const MovementType = z.enum(['INCOME', 'EGRESS']);
export const Currency = z.enum(['ARS', 'USD']);

export const NewMovementInput = z.object({
  accountId: z.uuid(),
  payer: z.string().min(1),
  concept: z.string().min(1),
  note: z.string().optional(),
  date: z.coerce.date(), // accepts ISO/string → Date
  amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/),
  exchangeRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  currency: Currency,
  status: PaymentStatus,
  method: PaymentMethod,
  type: MovementType,
});

export const MovementDTO = NewMovementInput.extend({
  id: z.uuid(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  account: z
    .object({
      id: z.uuid(),
      amount: z.number().positive(),
      currency: Currency,
    })
    .optional(),
});

// -- User Schema --
export const RoleSchema = z.enum(["ADMIN", "MEMBER"]);
export type Role = z.infer<typeof RoleSchema>;
export const UserSchema = z.object({
  id: z.uuid(),
  authId: z.string(),
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema.default("MEMBER"),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  accounts: z.array(z.unknown()).optional(),
});

export const UserCreateInputSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: RoleSchema.optional(),
});

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// -- Account Schema --

export const CurrencySchema = z.enum(['USD']); // add more: 'ARS', etc.
export const PaymentStatusSchema = z.enum(['PAID', 'PENDING', 'UNPAID']);
export const PaymentMethodSchema = z.enum(['CASH', 'WIRE']); // add more: 'CHECK', etc.
export const MovementTypeSchema = z.enum(['INCOME']); // add more: 'EXPENSE', etc.

export const MovementSchema = z.object({
  id: z.uuid(),
  accountId: z.uuid(),
  payer: z.string(),
  concept: z.string(),
  amount: z.string(), // Prisma Decimal serialized as string
  note: z.string().nullable(),
  date: z.iso.datetime(),
  exchangeRate: z.string(), // "0" or other decimal-as-string
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  method: PaymentMethodSchema,
  type: MovementTypeSchema,
  updatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const AccountSchema = z.object({
  id: z.uuid(),
  currency: CurrencySchema,
  amount: z.string(), // Prisma Decimal serialized as string
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  percentChange: z.number()
});

export type Movement = z.infer<typeof MovementSchema>;
export type AccountWithMovements = z.infer<typeof AccountSchema>;
export const AccountsResponseSchema = z.array(AccountSchema);
export type NewMovementInputT = z.infer<typeof NewMovementInput>;
export type MovementDTOT = z.infer<typeof MovementDTO>;
export type User = z.infer<typeof UserSchema>;
export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserLoginResponse = {
  user: User;
  token: string;
};
