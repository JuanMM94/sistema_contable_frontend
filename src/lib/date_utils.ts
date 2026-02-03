export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function formatToLocaleDate(date: Date, remove?: string) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).padStart(4, '0');

  if (remove == 'day') {
    return `${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

export function formatDateFromISO(iso: string, remove?: 'day') {
  const datePart = iso.split('T')[0]; // YYYY-MM-DD
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return '';

  return remove === 'day' ? `${m}/${y}` : `${d}/${m}/${y}`;
}

export function formatDateTimeFromISO(
  isoString: string,
  locale: string = 'es-AR',
  opts?: {
    useLocalTimeZone?: boolean;
    // default: 2-digit time
    hour12?: boolean;
    // default: show seconds
    showSeconds?: boolean;
  },
) {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const useLocalTimeZone = opts?.useLocalTimeZone ?? true;
  const showSeconds = opts?.showSeconds ?? true;
  const hour12 = opts?.hour12 ?? false;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12,
    timeZone: useLocalTimeZone ? 'America/Argentina/Buenos_Aires' : 'UTC',
  };

  // es-AR => "31/01/2026 14:27:31" (depending on TZ)
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatISODate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).padStart(4, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return undefined;
  }

  const [year, month, day] = match.slice(1);
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  if (!isValidDate(parsed)) {
    return undefined;
  }

  return parsed;
}

export function maskShortDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 6);

  return [day, month, year].filter(Boolean).join('/');
}

export function isCompleteShortDate(value: string) {
  return /^\d{2}\/\d{2}\/\d{2}$/.test(value);
}

export function maskFullDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('/');
}

export function isCompleteFullDate(value: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

export function resolveFullYear(twoDigitYear: number, contextDate?: Date) {
  if (Number.isNaN(twoDigitYear) || twoDigitYear < 0 || twoDigitYear > 99) {
    return null;
  }

  const reference = contextDate ?? new Date();
  const referenceYear = reference.getFullYear();
  const century = Math.floor(referenceYear / 100) * 100;

  let candidate = century + twoDigitYear;

  if (candidate > referenceYear + 20) {
    candidate -= 100;
  } else if (candidate < referenceYear - 80) {
    candidate += 100;
  }

  return candidate;
}

export function shortDateToISO(value: string, contextDate?: Date) {
  if (!isCompleteShortDate(value)) {
    return null;
  }

  const [dayString, monthString, yearString] = value.split('/');
  const day = Number(dayString);
  const month = Number(monthString);
  const shortYear = Number(yearString);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const fullYear = resolveFullYear(shortYear, contextDate);
  if (fullYear === null) {
    return null;
  }

  const candidate = new Date(fullYear, month - 1, day);
  if (!isValidDate(candidate)) {
    return null;
  }

  if (
    candidate.getFullYear() !== fullYear ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return formatISODate(candidate);
}

export function fullDateToISO(value: string) {
  if (!isCompleteFullDate(value)) {
    return null;
  }

  const [dayString, monthString, yearString] = value.split('/');
  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const candidate = new Date(year, month - 1, day);
  if (!isValidDate(candidate)) {
    return null;
  }

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return formatISODate(candidate);
}
