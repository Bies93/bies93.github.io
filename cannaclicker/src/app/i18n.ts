export type LocaleKey = 'de' | 'en';

export const SUPPORTED_LOCALES: readonly LocaleKey[] = ['de', 'en'];
export const DEFAULT_LOCALE: LocaleKey = 'de';

const translations: Record<LocaleKey, Record<string, string>> = {
  de: {
    'app.title': 'CannaClicker',
    'stats.buds': 'Buds',
    'stats.bpc': 'Buds pro Klick',
    'stats.bps': 'Buds pro Sekunde',
    'stats.total': 'Gesamt geerntet',
    'actions.click': 'Ernte Buds',
    'actions.buy': 'Kaufen',
    'actions.max': 'Max',
    'actions.export': 'Export',
    'actions.import': 'Import',
    'actions.reset': 'Reset',
    'actions.close': 'Schließen',
    'actions.mute': 'Stumm',
    'actions.unmute': 'Ton',
    'actions.confirm': 'Bestätigen',
    'actions.cancel': 'Abbrechen',
    'modal.import.title': 'Spielstand importieren',
    'modal.import.hint': 'Füge hier deinen Base64-Export ein.',
    'modal.reset.title': 'Fortschritt zurücksetzen?',
    'modal.reset.body': 'Das löscht deinen aktuellen Fortschritt unwiderruflich.',
    'modal.reset.confirm': 'Ja, löschen',
    'shop.title': 'Anbau',
    'shop.empty': 'Noch keine Gebäude verfügbar. Ernte mehr Buds!',
    'shop.cost': 'Kosten',
    'shop.nextPrice': 'Naechster Preis',
    'shop.owned': 'Besitzt',
    'shop.paybackLabel': 'Amortisation',
    'shop.paybackValue': '{seconds}s',
    'upgrades.title': 'Upgrades',
    'achievements.title': 'Erfolge',
  },
  en: {
    'app.title': 'CannaClicker',
    'stats.buds': 'Buds',
    'stats.bpc': 'Buds per Click',
    'stats.bps': 'Buds per Second',
    'stats.total': 'Total Harvested',
    'actions.click': 'Harvest Buds',
    'actions.buy': 'Buy',
    'actions.max': 'Max',
    'actions.export': 'Export',
    'actions.import': 'Import',
    'actions.reset': 'Reset',
    'actions.close': 'Close',
    'actions.mute': 'Mute',
    'actions.unmute': 'Sound',
    'actions.confirm': 'Confirm',
    'actions.cancel': 'Cancel',
    'modal.import.title': 'Import save',
    'modal.import.hint': 'Paste your Base64 save code here.',
    'modal.reset.title': 'Reset progress?',
    'modal.reset.body': 'This cannot be undone and clears your current game.',
    'modal.reset.confirm': 'Yes, delete it',
    'shop.title': 'Grow Ops',
    'shop.empty': 'No buildings unlocked yet. Harvest more buds!',
    'shop.cost': 'Cost',
    'shop.nextPrice': 'Next price',
    'shop.owned': 'Owned',
    'shop.paybackLabel': 'Payback',
    'shop.paybackValue': '{seconds}s',
    'upgrades.title': 'Upgrades',
    'achievements.title': 'Achievements',
  },
};

export function t(locale: LocaleKey, key: string, params: Record<string, string | number> = {}): string {
  const source = translations[locale]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;
  return Object.entries(params).reduce((acc, [token, value]) => acc.replaceAll(`{${token}}`, String(value)), source);
}

export function resolveLocale(candidate?: string | null): LocaleKey {
  if (!candidate) {
    return DEFAULT_LOCALE;
  }

  const normalized = candidate.toLowerCase().slice(0, 2) as LocaleKey;

  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}
