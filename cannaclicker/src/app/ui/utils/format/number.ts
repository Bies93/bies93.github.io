import { type LocaleKey } from "../../../i18n";

export function formatPercent(locale: LocaleKey, value: number): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return formatter.format(Math.max(0, value));
}

export function formatInteger(locale: LocaleKey, value: number): string {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return formatter.format(Math.max(0, Math.floor(value)));
}
