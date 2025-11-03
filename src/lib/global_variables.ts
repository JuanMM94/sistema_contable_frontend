export const locale = "es-AR";

export const currencyFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "deposit", label: "Deposito" },
  { value: "wire", label: "Transferencia Bancaria" },
];

export const STATUS_OPTIONS = [
  { value: "paid", label: "Pago" },
  { value: "not-paid", label: "No pago" },
  { value: "pending", label: "Pendiente" },
];

export const TRANSACTION_TYPES_OPTION = [
  { value: "income", label: "Ingreso" },
  { value: "egress", label: "Egreso" },
];
