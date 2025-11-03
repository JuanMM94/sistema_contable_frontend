export const locale = "es-AR"

export const currencyFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
})