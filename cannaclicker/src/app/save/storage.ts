import type { PersistedStateV7 } from './types';

export const SAVE_KEY = 'cannaclicker:save:v1';
const MUTED_KEY = 'cannaclicker:muted';

export function readRawSave(): string | null {
  try {
    return window.localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

export function writeRawSave(raw: string): void {
  window.localStorage.setItem(SAVE_KEY, raw);
}

export function writePersistedState(state: PersistedStateV7, serialiser: (state: PersistedStateV7) => string): void {
  const payload = serialiser(state);
  writeRawSave(payload);
}

export function clearPersistedState(): void {
  window.localStorage.removeItem(SAVE_KEY);
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
    return window.localStorage.getItem(MUTED_KEY) === '1';
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
