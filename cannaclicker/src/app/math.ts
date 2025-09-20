import Decimal from "break_infinity.js";
import type { LocaleKey } from "./i18n";

export interface FormatOptions {
  precision?: number;
}

const SUFFIXES = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"];
const LOCALE_FORMATS: Record<LocaleKey, string> = { de: "de-DE", en: "en-US" } as const;

export function formatDecimal(value: Decimal | number | string, options: FormatOptions = {}): string {
  const { precision = 2 } = options;
  const decimal = toDecimal(value);

  if (!Number.isFinite(decimal.mantissa) || !Number.isFinite(decimal.exponent)) {
    return "0";
  }

  if (decimal.lessThan(1000)) {
    return decimal.toFixed(decimal.lessThan(10) ? Math.min(precision, 2) : 0);
  }

  let index = -1;
  let scaled = new Decimal(decimal);

  while (scaled.greaterThanOrEqualTo(1000) && index < SUFFIXES.length - 1) {
    scaled = scaled.div(1000);
    index += 1;
  }

  const suffix = SUFFIXES[index] ?? `e${Math.floor(decimal.log10())}`;
  return `${scaled.toFixed(precision)}${suffix}`;
}

export function toDecimal(value: Decimal | number | string): Decimal {
  return value instanceof Decimal ? value : new Decimal(value ?? 0);
}

export function pow(base: Decimal, factor: number): Decimal {
  return base.pow(factor);
}

export function mul(...values: (Decimal | number)[]): Decimal {
  return values.reduce((acc, curr) => acc.mul(toDecimal(curr)), new Decimal(1));
}

export function sum(...values: (Decimal | number)[]): Decimal {
  return values.reduce((acc, curr) => acc.add(toDecimal(curr)), new Decimal(0));
}

export function paybackSeconds(cost: Decimal, gainPerSecond: Decimal): number | null {
  if (gainPerSecond.lessThanOrEqualTo(0)) {
    return null;
  }

  return Number(cost.div(gainPerSecond).toFixed(2));
}

const COMPACT_THRESHOLDS: { limit: number; suffix: string }[] = [
  { limit: 1_000_000_000, suffix: "B" },
  { limit: 1_000_000, suffix: "M" },
  { limit: 1_000, suffix: "k" },
];

export function formatCompact(value: Decimal | number | string, locale: LocaleKey): string {
  const decimal = toDecimal(value);

  if (!Number.isFinite(decimal.mantissa) || !Number.isFinite(decimal.exponent)) {
    return "0";
  }

  const numeric = decimal.toNumber();
  const absolute = Math.abs(numeric);

  for (const { limit, suffix } of COMPACT_THRESHOLDS) {
    if (absolute >= limit) {
      const scaled = numeric / limit;
      const formatted = scaled.toLocaleString(LOCALE_FORMATS[locale], {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
      return `${formatted} ${suffix}`;
    }
  }

  const fractionDigits = absolute < 10 ? 1 : 0;
  return numeric.toLocaleString(LOCALE_FORMATS[locale], {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatMultiplier(value: Decimal | number | string): string {
  const decimal = toDecimal(value);

  if (!Number.isFinite(decimal.mantissa) || !Number.isFinite(decimal.exponent)) {
    return "1.00×";
  }

  return `${decimal.toNumber().toFixed(2)}×`;
}