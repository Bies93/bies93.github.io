import type { PersistedStateV7 } from './types';

export const SAVE_KEY = 'cannabies:save:v1';
const LEGACY_SAVE_KEYS = ['biesyclicker:save:v1', 'cannaclicker:save:v1'] as const;
const MUTED_KEY = 'cannabies:muted';
const LEGACY_MUTED_KEYS = ['biesyclicker:muted', 'cannaclicker:muted'] as const;

export function readRawSave(): string | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      return raw;
    }

    for (const legacyKey of LEGACY_SAVE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw) {
        window.localStorage.setItem(SAVE_KEY, legacyRaw);
        return legacyRaw;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function writeRawSave(raw: string): boolean {
  try {
    window.localStorage.setItem(SAVE_KEY, raw);
    return true;
  } catch {
    return false;
  }
}

export function writePersistedState(
  state: PersistedStateV7,
  serialiser: (state: PersistedStateV7) => string,
): boolean {
  try {
    const payload = serialiser(state);
    return writeRawSave(payload);
  } catch {
    return false;
  }
}

export function clearPersistedState(): boolean {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    for (const legacyKey of LEGACY_SAVE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    return true;
  } catch {
    return false;
  }
}

export function ensureVersionedSave(raw: string | null): void {
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as { v?: number };
    if (!parsed.v) {
      clearPersistedState();
    }
  } catch {
    clearPersistedState();
  }
}

export function readMutedPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(MUTED_KEY);
    if (raw !== null) {
      return raw === '1';
    }

    for (const legacyKey of LEGACY_MUTED_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw !== null) {
        window.localStorage.setItem(MUTED_KEY, legacyRaw);
        return legacyRaw === '1';
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function writeMutedPreference(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}
