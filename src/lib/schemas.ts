import { z } from 'zod';

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

export type NewMovementInputT = z.infer<typeof NewMovementInput>;
export type MovementDTOT = z.infer<typeof MovementDTO>;
