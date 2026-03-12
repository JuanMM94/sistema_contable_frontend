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
  id: z.uuid({ message: 'ID de usuario inválido' }),
  authId: z.string({ message: 'ID de autenticación requerido' }),
  name: z.string({ message: 'Nombre requerido' }).min(1, 'El nombre no puede estar vacío'),
  email: z.email({ message: 'Email inválido' }),
  role: RoleSchema.default('MEMBER'),
  passwordChangeRequired: z.boolean().optional(),
  createdAt: z.iso.datetime({ offset: true, message: 'Fecha de creación inválida' }),
  updatedAt: z.iso.datetime({ offset: true, message: 'Fecha de actualización inválida' }),
});

export const AccountSchema = z.object({
  id: z.uuid({ message: 'ID de cuenta inválido' }),
  currency: CurrencySchema,
  user: z.object({
    name: z.string({ message: 'Nombre de usuario requerido' }),
    id: z.uuidv4({ message: 'ID de usuario inválido' }),
  }),
  paidBalance: z.string({ message: 'Saldo pagado requerido' }),
  pendingBalance: z.string({ message: 'Saldo pendiente requerido' }),
  userId: z.uuid({ message: 'ID de usuario inválido' }),
  createdAt: z.iso.datetime({ message: 'Fecha de creación inválida' }),
  updatedAt: z.iso.datetime({ message: 'Fecha de actualización inválida' }),
  percentChange: z.number({ message: 'Porcentaje de cambio inválido' }).optional(),
});

// Full User schema with accounts
export const UserSchema = BaseUserSchema.extend({
  accounts: z.array(AccountSchema),
});

export const UserLoginSchema = z.object({
  email: z.email({ message: 'Email inválido' }),
  password: z.string({ message: 'Contraseña requerida' }).min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type InputMember = Omit<
  z.infer<typeof UserSchema>,
  'id' | 'authId' | 'accounts' | 'updatedAt' | 'createdAt'
> & { password: string };

export const MovementSchema = z.object({
  id: z.uuid({ message: 'ID de movimiento inválido' }),
  accountId: z.uuid({ message: 'ID de cuenta inválido' }),
  account: AccountSchema,
  payer: z.string({ message: 'Nombre del pagador requerido' }),
  concept: z.string({ message: 'Concepto requerido' }),
  amount: z.string({ message: 'Monto requerido' }), // Prisma Decimal serialized as string
  note: z.string({ message: 'Nota inválida' }).optional(),
  counterpartId: z.uuid({ message: 'ID de contraparte inválido' }).optional(),
  date: z.iso.datetime({ message: 'Fecha inválida' }),
  exchangeRate: z.string({ message: 'Tasa de cambio inválida' }).optional(), // "0" or other decimal-as-string
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  method: PaymentMethodSchema,
  type: MovementTypeSchema,
  updatedAt: z.iso.datetime({ message: 'Fecha de actualización inválida' }),
  createdAt: z.iso.datetime({ message: 'Fecha de creación inválida' }),
});

export type InputMovement = Omit<
  z.infer<typeof MovementSchema>,
  'id' | 'accountId' | 'account' | 'updatedAt' | 'createdAt'
> & { member: string };

export type EditMovement = Omit<
  z.infer<typeof MovementSchema>,
  | 'accountId'
  | 'account'
  | 'amount'
  | 'date'
  | 'exchangeRate'
  | 'currency'
  | 'updatedAt'
  | 'createdAt'
> & { member: string };

export type MovementEditFormSchema = {
  firstmovement: EditMovement;
  secondmovement?: EditMovement;
};

export const SwapSchema = z.object({
  id: z.uuid({ message: 'ID de intercambio inválido' }),
  accountId: z.uuid({ message: 'ID de cuenta inválido' }),
  account: AccountSchema,
  amount: z.string({ message: 'Monto requerido' }), // Prisma Decimal serialized as string
  date: z.iso.datetime({ message: 'Fecha inválida' }),
  exchangeRate: z.string({ message: 'Tasa de cambio inválida' }).optional(), // "0" or other decimal-as-string
  currency: CurrencySchema,
  type: MovementTypeSchema,
  updatedAt: z.iso.datetime({ message: 'Fecha de actualización inválida' }),
  createdAt: z.iso.datetime({ message: 'Fecha de creación inválida' }),
});

export const InputSwap = z.object({
  userId: z.uuid({ message: 'ID de usuario inválido' }),
  fromCurrency: CurrencySchema,
  toCurrency: CurrencySchema,
  amountChange: z.number({ message: 'Monto de cambio requerido' }).positive({ message: 'El monto debe ser mayor a 0' }),
  adminRate: z.any().optional(),
  amountTotal: z.number({ message: 'Monto total requerido' }).positive({ message: 'El monto debe ser mayor a 0' }),
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
export type MovementContent =
  | 'id'
  | 'accountId'
  | 'account'
  | 'payer'
  | 'concept'
  | 'amount'
  | 'note'
  | 'counterpartId'
  | 'date'
  | 'exchangeRate'
  | 'currency'
  | 'status'
  | 'method'
  | 'type'
  | 'updatedAt'
  | 'createdAt';
export type UsersContent =
  | 'id'
  | 'authId'
  | 'name'
  | 'email'
  | 'passwordChangeRequired'
  | 'role'
  | 'accounts'
  | 'updatedAt'
  | 'createdAt';
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
  month: z.string({ message: 'Mes requerido' }),
  income: z.string({ message: 'Ingreso requerido' }),
  egress: z.string({ message: 'Egreso requerido' }),
});

export type MovementWithLimit = z.infer<typeof movementWithLimitSchema>;

//Expand filters here-

export type Filter = {
  movementWithLimit: MovementWithLimit;
};

export type PayerData = {
  payer: string;
  paidBalance: Record<string, number>; // currency -> amount
  pendingBalance: Record<string, number>; // currency -> amount
  movements: Movement[];
};
