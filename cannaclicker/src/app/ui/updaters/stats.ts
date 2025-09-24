import type { LocaleKey } from "../../i18n";

export function formatSeedRate(locale: LocaleKey, rate: number): string {
  const safe = Number.isFinite(rate) ? rate : 0;
  const options: Intl.NumberFormatOptions =
    safe > 0 && safe < 10
      ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
      : { maximumFractionDigits: 0 };
  return new Intl.NumberFormat(locale, options).format(safe);
}

export function formatTierBonus(locale: LocaleKey, value: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
