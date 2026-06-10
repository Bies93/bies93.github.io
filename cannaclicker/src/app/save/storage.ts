import type { PersistedStateV7 } from './types';

export const SAVE_KEY = 'biesyclicker:save:v1';
const LEGACY_SAVE_KEY = 'cannaclicker:save:v1';
const MUTED_KEY = 'biesyclicker:muted';
const LEGACY_MUTED_KEY = 'cannaclicker:muted';

export function readRawSave(): string | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      return raw;
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacyRaw) {
      window.localStorage.setItem(SAVE_KEY, legacyRaw);
    }
    return legacyRaw;
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
    window.localStorage.removeItem(LEGACY_SAVE_KEY);
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

    const legacyRaw = window.localStorage.getItem(LEGACY_MUTED_KEY);
    if (legacyRaw !== null) {
      window.localStorage.setItem(MUTED_KEY, legacyRaw);
    }
    return legacyRaw === '1';
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
