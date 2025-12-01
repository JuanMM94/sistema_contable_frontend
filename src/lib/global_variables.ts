export const locale = 'es-AR';

type PaymentCurrency = (typeof PAYMENT_AVAILABLE_CURRENCY)[number]['value'];

export const currencyFormatter = (currency: PaymentCurrency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
});

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'DEPOSIT', label: 'Depósito' },
  { value: 'WIRE', label: 'Transferencia Bancaria' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Pago' },
  { value: 'UNPAID', label: 'No pago' },
  { value: 'PENDING', label: 'Pendiente' },
];

export const PAYMENT_TYPES_OPTIONS = [
  { value: 'INCOME', label: 'Ingreso' },
  { value: 'EGRESS', label: 'Egreso' },
];

export const PAYMENT_AVAILABLE_CURRENCY = [
  { value: 'ARS', label: 'ARS (Pesos Argentinos)' },
  { value: 'USD', label: 'USD (Dólares Estadounidenses)' },
] as const;

export const paymentMethodLabelMap = new Map(
  PAYMENT_METHOD_OPTIONS.map(({ value, label }) => [value, label] as const),
);
export const paymentStatusLabelMap = new Map(
  PAYMENT_STATUS_OPTIONS.map(({ value, label }) => [value, label] as const),
);
export const paymentTypeLabelMap = new Map(
  PAYMENT_TYPES_OPTIONS.map(({ value, label }) => [value, label] as const),
);
export const paymentCurrencyLabelMap = new Map(
  PAYMENT_AVAILABLE_CURRENCY.map(({ value, label }) => [value, label] as const),
);
