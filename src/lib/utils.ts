import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { currencyFormatter } from './global_variables';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const moneyInputRegex = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{0,2})?$/;

export function formatCurrencyValue(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return '';
  }
  return currencyFormatter.format(value);
}

export function parseMoneyInput(value: string): number | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!moneyInputRegex.test(trimmedValue)) {
    return null;
  }

  const normalized = trimmedValue.replace(/\./g, '').replace(',', '.');

  const numeric = Number(normalized);

  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.round(numeric * 100) / 100;
}

export function maskCurrencyInput(rawValue: string) {
  if (!rawValue) {
    return '';
  }

  let workingValue = rawValue.replace(/\s/g, '');
  if (!workingValue) {
    return '';
  }

  const commaCount = (workingValue.match(/,/g) ?? []).length;
  const dotCount = (workingValue.match(/\./g) ?? []).length;

  if (commaCount === 0 && dotCount === 1) {
    const dotIndex = workingValue.lastIndexOf('.');
    const decimalsLength = workingValue.length - dotIndex - 1;

    if (decimalsLength > 0 && decimalsLength <= 2) {
      workingValue = workingValue.slice(0, dotIndex) + ',' + workingValue.slice(dotIndex + 1);
    }
  }

  const normalized = workingValue.replace(/\./g, '');
  const hasComma = normalized.includes(',');
  const endsWithComma = hasComma && normalized.endsWith(',');
  const [rawInteger = '', rawDecimals = ''] = normalized.split(',', 2);

  const integerDigits = rawInteger.replace(/\D/g, '');
  const decimalDigits = rawDecimals.replace(/\D/g, '').slice(0, 2);

  let normalizedInteger = integerDigits.replace(/^0+(?=\d)/, '');

  if (!normalizedInteger && (hasComma || decimalDigits)) {
    normalizedInteger = '0';
  }

  if (!normalizedInteger && !decimalDigits) {
    return '';
  }

  const groupedInteger = normalizedInteger
    ? normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '0';

  if (!hasComma) {
    return groupedInteger;
  }

  if (!decimalDigits && !endsWithComma) {
    return groupedInteger;
  }

  return `${groupedInteger},${decimalDigits}`;
}

export function countDigitsBeforeCaret(value: string, caretPosition: number) {
  let count = 0;
  for (let i = 0; i < caretPosition && i < value.length; i++) {
    if (/\d/.test(value[i])) {
      count++;
    }
  }
  return count;
}

export function caretFromDigitPosition(value: string, digitPosition: number) {
  if (digitPosition <= 0) {
    return 0;
  }

  let digitsSeen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i])) {
      digitsSeen++;
      if (digitsSeen === digitPosition) {
        return i + 1;
      }
    }
  }

  return value.length;
}

export function getTodayISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toPlainAmount(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return '';
  }

  return maskCurrencyInput(value.toFixed(2).replace('.', ','));
}
