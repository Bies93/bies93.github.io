import { createDefaultState, ensureDecimal, type GameState, SAVE_VERSION, type SaveV1 } from './state';
import { DEFAULT_LOCALE, resolveLocale, type LocaleKey } from './i18n';

const SAVE_KEY = 'cannaclicker:save:v1';

export type PersistedStateV1 = Omit<SaveV1, 'buds' | 'total' | 'bps' | 'bpc'> & {
  v: typeof SAVE_VERSION;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  locale?: LocaleKey;
  muted?: boolean;
};

export function migrate(): void {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as { v?: number };
    if (!parsed.v) {
      window.localStorage.removeItem(SAVE_KEY);
    }
  } catch {
    window.localStorage.removeItem(SAVE_KEY);
  }
}

export function load(): PersistedStateV1 | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    const data = JSON.parse(raw) as PersistedStateV1;
    if (!data || data.v !== SAVE_VERSION) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to parse save', error);
    return null;
  }
}

export function initState(saved: PersistedStateV1 | null): GameState {
  if (!saved) {
    return createDefaultState({
      locale: detectLocale(),
      muted: loadAudioPreference(),
    });
  }

  return createDefaultState({
    v: saved.v,
    buds: ensureDecimal(saved.buds),
    total: ensureDecimal(saved.total),
    bps: ensureDecimal(saved.bps),
    bpc: ensureDecimal(saved.bpc),
    items: saved.items ?? {},
    upgrades: saved.upgrades ?? {},
    achievements: saved.achievements ?? {},
    time: saved.time ?? Date.now(),
    locale: saved.locale ?? detectLocale(),
    muted: saved.muted ?? loadAudioPreference(),
  });
}

export function save(state: GameState): void {
  const payload: PersistedStateV1 = {
    v: SAVE_VERSION,
    buds: state.buds.toString(),
    total: state.total.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    items: state.items,
    upgrades: state.upgrades,
    achievements: state.achievements,
    time: Date.now(),
    locale: state.locale,
    muted: state.muted,
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function exportSave(state: GameState): string {
  const payload: PersistedStateV1 = {
    v: SAVE_VERSION,
    buds: state.buds.toString(),
    total: state.total.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    items: state.items,
    upgrades: state.upgrades,
    achievements: state.achievements,
    time: Date.now(),
    locale: state.locale,
    muted: state.muted,
  };

  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importSave(encoded: string): GameState {
  const decoded = decodeURIComponent(escape(atob(encoded.trim())));
  const parsed = JSON.parse(decoded) as PersistedStateV1;

  if (!parsed || !parsed.v) {
    throw new Error('Unbekanntes Save-Format');
  }

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
  return initState(parsed);
}

export function clearSave(): void {
  window.localStorage.removeItem(SAVE_KEY);
}

function detectLocale(): LocaleKey {
  return resolveLocale(window.navigator.language ?? DEFAULT_LOCALE);
}

function loadAudioPreference(): boolean {
  try {
    return window.localStorage.getItem('cannaclicker:muted') === '1';
  } catch {
    return false;
  }
}

export function persistAudioPreference(muted: boolean): void {
  try {
    window.localStorage.setItem('cannaclicker:muted', muted ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}