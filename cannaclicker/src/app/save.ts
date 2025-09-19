import Decimal from 'break_infinity.js';
import {
  createDefaultState,
  createDefaultPreferences,
  createDefaultAutomation,
  ensureDecimal,
  type GameState,
  SAVE_VERSION,
  type AbilityId,
  type AbilityState,
  type AbilityRuntimeState,
  type SaveV3,
  type PreferencesState,
  type AutomationState,
  AUTO_BUY_ROI_MIN,
  AUTO_BUY_ROI_MAX,
  AUTO_BUY_RESERVE_MIN,
  AUTO_BUY_RESERVE_MAX,
} from './state';
import { computePrestigeMultiplier } from './prestige';
import { DEFAULT_LOCALE, resolveLocale, type LocaleKey } from './i18n';

const SAVE_KEY = 'cannaclicker:save:v1';

interface PersistedAbilityState {
  active?: boolean;
  endsAt?: number;
  readyAt?: number;
}

interface PersistedPrestigeState {
  seeds?: number;
  mult?: string;
  lifetimeBuds?: string;
  lastResetAt?: number;
}

export interface PersistedStateV1Legacy {
  v: 1;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Record<string, number>;
  upgrades?: Record<string, boolean>;
  achievements?: Record<string, boolean>;
  time?: number;
  locale?: LocaleKey;
  muted?: boolean;
}

export type PersistedStateV2 = Omit<SaveV3, 'buds' | 'total' | 'bps' | 'bpc' | 'prestige' | 'abilities' | 'temp' | 'preferences' | 'automation'> & {
  v: 2;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  researchOwned: string[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  lastSeenAt: number;
  locale?: LocaleKey;
  muted?: boolean;
};

export type PersistedStateV3 = Omit<SaveV3, 'buds' | 'total' | 'bps' | 'bpc' | 'prestige' | 'abilities' | 'temp'> & {
  v: typeof SAVE_VERSION;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  researchOwned: string[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  lastSeenAt: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
};

function clampOfflineDuration(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return 0;
  }

  const max = 8 * 60 * 60 * 1000;
  return Math.min(max, Math.max(0, Math.floor(elapsedMs)));
}

interface OfflineReward {
  earned: Decimal;
  duration: number;
}

function calculateOfflineProgress(bps: Decimal, elapsedMs: number): OfflineReward {
  const clamped = clampOfflineDuration(elapsedMs);
  if (clamped <= 0) {
    return { earned: new Decimal(0), duration: 0 };
  }

  return {
    earned: ensureDecimal(bps).mul(clamped).div(1000),
    duration: clamped,
  };
}

function normalisePersistedState(data: PersistedStateV2 | PersistedStateV3): PersistedStateV3 {
  const now = Date.now();
  const prestige = data.prestige ?? {};
  const preferences = normalisePreferences(data.preferences);
  const automation = normaliseAutomation(data.automation);

  return {
    v: SAVE_VERSION,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned: Array.isArray(data.researchOwned) ? [...new Set(data.researchOwned)] : [],
    prestige: {
      seeds: prestige.seeds ?? 0,
      mult: prestige.mult ?? '1',
      lifetimeBuds: prestige.lifetimeBuds ?? data.total ?? '0',
      lastResetAt: prestige.lastResetAt ?? data.lastSeenAt ?? data.time ?? now,
    },
    abilities: normalisePersistedAbilities(data.abilities),
    time: data.time ?? now,
    lastSeenAt: data.lastSeenAt ?? data.time ?? now,
    locale: data.locale,
    muted: data.muted,
    preferences,
    automation,
  };
}

function normalisePersistedAbilities(
  abilities?: Record<AbilityId, PersistedAbilityState>,
): Record<AbilityId, PersistedAbilityState> {
  const now = Date.now();
  const normalised: Record<AbilityId, PersistedAbilityState> = {
    overdrive: {},
    burst_click: {},
  };

  for (const id of ABILITY_IDS) {
    const entry = abilities?.[id] ?? {};
    normalised[id] = {
      active: entry.active ?? false,
      endsAt: entry.endsAt ?? now,
      readyAt: entry.readyAt ?? now,
    };
  }

  return normalised;
}

function normalisePreferences(preferences?: Partial<PreferencesState>): PreferencesState {
  const defaults = createDefaultPreferences();
  const mode = preferences?.shopSortMode;
  if (mode === 'price' || mode === 'bps' || mode === 'roi') {
    return { shopSortMode: mode } satisfies PreferencesState;
  }
  return defaults;
}

function normaliseAutomation(automation?: Partial<AutomationState>): AutomationState {
  const defaults = createDefaultAutomation();
  const autoBuy = automation?.autoBuy;
  const roi = autoBuy?.roi;
  const reserve = autoBuy?.reserve;

  return {
    autoBuy: {
      enabled: typeof autoBuy?.enabled === 'boolean' ? autoBuy.enabled : defaults.autoBuy.enabled,
      roi: {
        enabled: typeof roi?.enabled === 'boolean' ? roi.enabled : defaults.autoBuy.roi.enabled,
        thresholdSeconds: clampNumber(
          roi?.thresholdSeconds,
          AUTO_BUY_ROI_MIN,
          AUTO_BUY_ROI_MAX,
          defaults.autoBuy.roi.thresholdSeconds,
        ),
      },
      reserve: {
        enabled: typeof reserve?.enabled === 'boolean' ? reserve.enabled : defaults.autoBuy.reserve.enabled,
        percent: clampNumber(
          reserve?.percent,
          AUTO_BUY_RESERVE_MIN,
          AUTO_BUY_RESERVE_MAX,
          defaults.autoBuy.reserve.percent,
        ),
      },
    },
  } satisfies AutomationState;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}

function upgradeFromLegacy(data: PersistedStateV1Legacy): PersistedStateV3 {
  const now = Date.now();
  return normalisePersistedState({
    v: SAVE_VERSION,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned: [],
    prestige: {
      seeds: 0,
      mult: '1',
      lifetimeBuds: data.total ?? '0',
      lastResetAt: data.time ?? now,
    },
    abilities: normalisePersistedAbilities(),
    time: data.time ?? now,
    lastSeenAt: data.time ?? now,
    locale: data.locale,
    muted: data.muted,
    preferences: createDefaultPreferences(),
    automation: createDefaultAutomation(),
  });
}

function restoreAbilities(
  abilities: Record<AbilityId, PersistedAbilityState> | undefined,
  now: number,
): AbilityState {
  const restored: AbilityState = {
    overdrive: { active: false, endsAt: now, readyAt: now },
    burst_click: { active: false, endsAt: now, readyAt: now },
  };

  for (const id of ABILITY_IDS) {
    const entry = abilities?.[id];
    if (!entry) {
      continue;
    }

    const endsAt = Number.isFinite(entry.endsAt) ? entry.endsAt! : now;
    const readyAt = Number.isFinite(entry.readyAt) ? entry.readyAt! : now;
    const active = !!entry.active && endsAt > now;

    restored[id] = {
      active,
      endsAt: active ? endsAt : now,
      readyAt,
    } satisfies AbilityRuntimeState;
  }

  return restored;
}

function cleanAbilityFlags(state: AbilityState, now: number): void {
  for (const id of ABILITY_IDS) {
    const ability = state[id];
    if (!ability) {
      continue;
    }

    if (ability.active && ability.endsAt <= now) {
      ability.active = false;
      ability.endsAt = now;
    }
    if (ability.readyAt < now && ability.active) {
      ability.readyAt = ability.endsAt;
    }
  }
}

function serialiseAbilities(state: AbilityState): Record<AbilityId, PersistedAbilityState> {
  return ABILITY_IDS.reduce((acc, id) => {
    const ability = state[id];
    acc[id] = {
      active: ability?.active ?? false,
      endsAt: ability?.endsAt ?? Date.now(),
      readyAt: ability?.readyAt ?? Date.now(),
    };
    return acc;
  }, {} as Record<AbilityId, PersistedAbilityState>);
}

const ABILITY_IDS: AbilityId[] = ['overdrive', 'burst_click'];

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

export function load(): PersistedStateV3 | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedStateV3 | PersistedStateV2 | PersistedStateV1Legacy | null;
    if (!parsed || typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    if (parsed.v === SAVE_VERSION) {
      return normalisePersistedState(parsed as PersistedStateV3);
    }

    if (parsed.v === 1) {
      const upgraded = upgradeFromLegacy(parsed as PersistedStateV1Legacy);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    if (parsed.v === 2) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV2);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse save', error);
    return null;
  }
}

export function initState(saved: PersistedStateV3 | null): GameState {
  if (!saved) {
    return createDefaultState({
      locale: detectLocale(),
      muted: loadAudioPreference(),
    });
  }

  const now = Date.now();
  const lastSeen = saved.lastSeenAt ?? saved.time ?? now;
  const prestigeSeeds = Math.max(0, Math.floor(saved.prestige?.seeds ?? 0));
  const prestigeMult = computePrestigeMultiplier(prestigeSeeds);
  const prestigeLifetime = ensureDecimal(saved.prestige?.lifetimeBuds ?? saved.total ?? '0');

  const state = createDefaultState({
    v: SAVE_VERSION,
    buds: ensureDecimal(saved.buds),
    total: ensureDecimal(saved.total),
    bps: ensureDecimal(saved.bps),
    bpc: ensureDecimal(saved.bpc),
    items: saved.items ?? {},
    upgrades: saved.upgrades ?? {},
    achievements: saved.achievements ?? {},
    researchOwned: Array.from(new Set(saved.researchOwned ?? [])),
    prestige: {
      seeds: prestigeSeeds,
      mult: prestigeMult,
      lifetimeBuds: prestigeLifetime,
      lastResetAt: saved.prestige?.lastResetAt ?? saved.time ?? now,
    },
    abilities: restoreAbilities(saved.abilities, now),
    time: saved.time ?? now,
    lastSeenAt: lastSeen,
    preferences: normalisePreferences(saved.preferences),
    automation: normaliseAutomation(saved.automation),
    locale: saved.locale ?? detectLocale(),
    muted: saved.muted ?? loadAudioPreference(),
  });

  const offline = calculateOfflineProgress(state.bps, now - lastSeen);
  if (offline.earned.greaterThan(0)) {
    state.buds = state.buds.add(offline.earned);
    state.total = state.total.add(offline.earned);
    const lifetime = state.prestige.lifetimeBuds.add(offline.earned);
    state.prestige.lifetimeBuds = lifetime.greaterThan(state.total) ? lifetime : state.total;
    state.temp.offlineBuds = offline.earned;
    state.temp.offlineDuration = offline.duration;
  } else {
    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }

  state.lastSeenAt = now;
  state.time = now;
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);

  cleanAbilityFlags(state.abilities, now);

  return state;
}

export function save(state: GameState): void {
  const timestamp = Date.now();
  state.lastSeenAt = timestamp;
  const payload: PersistedStateV3 = {
    v: SAVE_VERSION,
    buds: state.buds.toString(),
    total: state.total.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    items: state.items,
    upgrades: state.upgrades,
    achievements: state.achievements,
    researchOwned: state.researchOwned,
    prestige: {
      seeds: state.prestige.seeds,
      mult: state.prestige.mult.toString(),
      lifetimeBuds: state.prestige.lifetimeBuds.toString(),
      lastResetAt: state.prestige.lastResetAt,
    },
    abilities: serialiseAbilities(state.abilities),
    time: timestamp,
    lastSeenAt: timestamp,
    locale: state.locale,
    muted: state.muted,
    preferences: state.preferences,
    automation: state.automation,
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function exportSave(state: GameState): string {
  const timestamp = Date.now();
  const payload: PersistedStateV3 = {
    v: SAVE_VERSION,
    buds: state.buds.toString(),
    total: state.total.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    items: state.items,
    upgrades: state.upgrades,
    achievements: state.achievements,
    researchOwned: state.researchOwned,
    prestige: {
      seeds: state.prestige.seeds,
      mult: state.prestige.mult.toString(),
      lifetimeBuds: state.prestige.lifetimeBuds.toString(),
      lastResetAt: state.prestige.lastResetAt,
    },
    abilities: serialiseAbilities(state.abilities),
    time: timestamp,
    lastSeenAt: state.lastSeenAt,
    locale: state.locale,
    muted: state.muted,
    preferences: state.preferences,
    automation: state.automation,
  };

  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importSave(encoded: string): GameState {
  const decoded = decodeURIComponent(escape(atob(encoded.trim())));
  const parsed = JSON.parse(decoded) as PersistedStateV3 | PersistedStateV2 | PersistedStateV1Legacy;

  if (!parsed || !parsed.v) {
    throw new Error('Unbekanntes Save-Format');
  }

  let normalised: PersistedStateV3;
  if (parsed.v === 1) {
    normalised = upgradeFromLegacy(parsed as PersistedStateV1Legacy);
  } else if (parsed.v === 2) {
    normalised = normalisePersistedState(parsed as PersistedStateV2);
  } else if (parsed.v === SAVE_VERSION) {
    normalised = normalisePersistedState(parsed as PersistedStateV3);
  } else {
    throw new Error('Unbekannte Save-Version');
  }

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(normalised));
  return initState(normalised);
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