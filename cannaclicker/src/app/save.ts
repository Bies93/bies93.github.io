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
  type PreferencesState,
  type AutomationState,
  type MetaState,
  AUTO_BUY_ROI_MIN,
  AUTO_BUY_ROI_MAX,
  AUTO_BUY_RESERVE_MIN,
  AUTO_BUY_RESERVE_MAX,
} from './state';
import { computePrestigeMultiplier } from './prestige';
import { OFFLINE_CAP_MS } from './balance';
import { applyResearchEffects } from './research';
import { reapplyAbilityEffects } from './abilities';
import { DEFAULT_LOCALE, resolveLocale, type LocaleKey } from './i18n';
import { createDefaultSettings, type SettingsState } from './settings';

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
  version?: number;
}

interface PersistedMetaState {
  lastSeenAt?: number;
  lastBpsAtSave?: number;
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

export interface PersistedStateV2 {
  v: 2;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  researchOwned: string[];
  prestige: PersistedPrestigeState;
  abilities: Record<string, PersistedAbilityState>;
  lastSeenAt: number;
  items?: Record<string, number>;
  upgrades?: Record<string, boolean>;
  achievements?: Record<string, boolean>;
  locale?: LocaleKey;
  muted?: boolean;
}

export interface PersistedStateV3 {
  v: 3;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Record<string, number>;
  upgrades?: Record<string, boolean>;
  achievements?: Record<string, boolean>;
  researchOwned?: string[];
  prestige: PersistedPrestigeState;
  abilities?: Record<string, PersistedAbilityState>;
  time?: number;
  lastSeenAt?: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
}

export interface PersistedStateV4 {
  v: 4;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Record<string, number>;
  upgrades?: Record<string, boolean>;
  achievements?: Record<string, boolean>;
  researchOwned: string[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  time?: number;
  lastSeenAt?: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
  settings?: Partial<SettingsState>;
  meta?: PersistedMetaState;
}

export interface PersistedStateV5 {
  v: typeof SAVE_VERSION;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items: Record<string, number>;
  upgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  researchOwned: string[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  time: number;
  lastSeenAt: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
  settings: SettingsState;
  meta: PersistedMetaState;
}
function normalisePersistedState(
  data: PersistedStateV2 | PersistedStateV3 | PersistedStateV4 | PersistedStateV5,
): PersistedStateV5 {
  const now = Date.now();
  const prestige = data.prestige ?? {};
  const preferences = normalisePreferences((data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5).preferences);
  const automation = normaliseAutomation((data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5).automation);
  const settings = normaliseSettings((data as PersistedStateV4 | PersistedStateV5).settings);
  const meta = normaliseMeta((data as PersistedStateV4 | PersistedStateV5).meta, (data as any).lastSeenAt, now);

  return {
    v: SAVE_VERSION,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned: Array.isArray((data as any).researchOwned)
      ? [...new Set((data as any).researchOwned)]
      : [],
    prestige: {
      seeds: prestige.seeds ?? 0,
      mult: prestige.mult ?? '1',
      lifetimeBuds: prestige.lifetimeBuds ?? data.total ?? '0',
      lastResetAt: prestige.lastResetAt ?? (data as any).lastSeenAt ?? (data as any).time ?? now,
      version: Number.isFinite(prestige.version) ? Number(prestige.version) : 1,
    },
    abilities: normalisePersistedAbilities((data as any).abilities),
    time: (data as any).time ?? now,
    lastSeenAt: meta.lastSeenAt,
    locale: data.locale,
    muted: data.muted,
    preferences,
    automation,
    settings,
    meta,
  } satisfies PersistedStateV5;
}
function normalisePersistedAbilities(
  abilities?: Record<string, PersistedAbilityState>,
): Record<AbilityId, PersistedAbilityState> {
  const now = Date.now();
  const normalised: Record<AbilityId, PersistedAbilityState> = {
    overdrive: {},
    burst: {},
  };

  for (const id of ABILITY_IDS) {
    const legacyKey = id === "burst" ? "burst_click" : id;
    const entry = abilities?.[id] ?? abilities?.[legacyKey] ?? {};
    normalised[id] = {
      active: entry.active ?? false,
      endsAt: entry.endsAt ?? now,
      readyAt: entry.readyAt ?? now,
    };
  }

  return normalised;
}

function normaliseSettings(settings?: Partial<SettingsState>): SettingsState {
  const defaults = createDefaultSettings();
  if (!settings) {
    return defaults;
  }

  return {
    showOfflineEarnings: typeof settings.showOfflineEarnings === 'boolean' ? settings.showOfflineEarnings : defaults.showOfflineEarnings,
  } satisfies SettingsState;
}

function normaliseMeta(meta: PersistedMetaState | undefined, fallbackLastSeen: number | undefined, now: number): MetaState {
  const lastSeen = Number.isFinite(meta?.lastSeenAt) ? Number(meta!.lastSeenAt) : fallbackLastSeen ?? now;
  const safeLastSeen = lastSeen > 0 ? Math.floor(lastSeen) : now;
  const lastBps = Number.isFinite(meta?.lastBpsAtSave) ? Number(meta!.lastBpsAtSave) : 0;

  return {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: lastBps >= 0 ? lastBps : 0,
  } satisfies MetaState;
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

function upgradeFromLegacy(data: PersistedStateV1Legacy): PersistedStateV5 {
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
  abilities: Record<string, PersistedAbilityState> | undefined,
  now: number,
): AbilityState {
  const restored: AbilityState = {
    overdrive: { active: false, endsAt: now, readyAt: now, multiplier: 1 },
    burst: { active: false, endsAt: now, readyAt: now, multiplier: 1 },
  };

  for (const id of ABILITY_IDS) {
    const legacyKey = id === "burst" ? "burst_click" : id;
    const entry = abilities?.[id] ?? abilities?.[legacyKey];
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
      multiplier: 1,
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

const ABILITY_IDS: AbilityId[] = ['overdrive', 'burst'];

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

export function load(): PersistedStateV5 | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as
      | PersistedStateV5
      | PersistedStateV4
      | PersistedStateV3
      | PersistedStateV2
      | PersistedStateV1Legacy
      | null;
    if (!parsed || typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    if (parsed.v === SAVE_VERSION) {
      return normalisePersistedState(parsed as PersistedStateV5);
    }

    if (parsed.v === 4) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV4);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    if (parsed.v === 3) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV3);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    if (parsed.v === 2) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV2);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    if (parsed.v === 1) {
      const upgraded = upgradeFromLegacy(parsed as PersistedStateV1Legacy);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse save', error);
    return null;
  }
}

export function initState(saved: PersistedStateV5 | null): GameState {
  if (!saved) {
    return createDefaultState({
      locale: detectLocale(),
      muted: loadAudioPreference(),
    });
  }

  const now = Date.now();
  const prestigeSeeds = Math.max(0, Math.floor(saved.prestige?.seeds ?? 0));
  const prestigeMult = computePrestigeMultiplier(prestigeSeeds);
  const prestigeLifetime = ensureDecimal(saved.prestige?.lifetimeBuds ?? saved.total ?? '0');

  const metaLastSeen = Number.isFinite(saved.meta?.lastSeenAt)
    ? Math.floor(saved.meta!.lastSeenAt)
    : saved.lastSeenAt ?? saved.time ?? now;
  const safeLastSeen = metaLastSeen > 0 ? metaLastSeen : now;
  const metaBps = Number.isFinite(saved.meta?.lastBpsAtSave) && saved.meta!.lastBpsAtSave >= 0
    ? saved.meta!.lastBpsAtSave
    : 0;
  const initialMeta: MetaState = { lastSeenAt: safeLastSeen, lastBpsAtSave: metaBps };

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
      version: saved.prestige?.version ?? 1,
    },
    abilities: restoreAbilities(saved.abilities, now),
    time: saved.time ?? now,
    lastSeenAt: safeLastSeen,
    preferences: normalisePreferences(saved.preferences),
    automation: normaliseAutomation(saved.automation),
    settings: saved.settings,
    meta: initialMeta,
    locale: saved.locale ?? detectLocale(),
    muted: saved.muted ?? loadAudioPreference(),
  });

  applyResearchEffects(state);
  reapplyAbilityEffects(state);

  const rawDelta = now - state.meta.lastSeenAt;
  const cappedDelta = Math.max(0, Math.min(rawDelta, OFFLINE_CAP_MS));
  const fallbackBps = state.bps.toNumber();
  const baseBps = Number.isFinite(state.meta.lastBpsAtSave)
    ? state.meta.lastBpsAtSave
    : Number.isFinite(fallbackBps) && fallbackBps > 0
      ? fallbackBps
      : 0;
  const safeBps = baseBps >= 0 ? baseBps : 0;
  state.meta.lastBpsAtSave = safeBps;
  const earnedNumber = Math.floor(safeBps * (cappedDelta / 1000));

  if (earnedNumber > 0) {
    const offlineGain = new Decimal(earnedNumber);
    state.buds = state.buds.add(offlineGain);
    state.total = state.total.add(offlineGain);
    const lifetime = state.prestige.lifetimeBuds.add(offlineGain);
    state.prestige.lifetimeBuds = lifetime.greaterThan(state.total) ? lifetime : state.total;
    state.temp.offlineBuds = offlineGain;
    state.temp.offlineDuration = cappedDelta;
  } else {
    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }

  state.meta.lastSeenAt = now;
  state.lastSeenAt = now;
  state.time = now;
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);

  cleanAbilityFlags(state.abilities, now);

  return state;
}

export function save(state: GameState): void {
  const timestamp = Date.now();
  state.lastSeenAt = timestamp;
  state.time = timestamp;
  const bpsNumber = state.bps.toNumber();
  const safeBps = Number.isFinite(bpsNumber) && bpsNumber >= 0 ? bpsNumber : 0;
  state.meta.lastSeenAt = timestamp;
  state.meta.lastBpsAtSave = safeBps;

  const payload: PersistedStateV5 = {
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
      version: state.prestige.version,
    },
    abilities: serialiseAbilities(state.abilities),
    time: timestamp,
    lastSeenAt: timestamp,
    locale: state.locale,
    muted: state.muted,
    preferences: state.preferences,
    automation: state.automation,
    settings: state.settings,
    meta: {
      lastSeenAt: state.meta.lastSeenAt,
      lastBpsAtSave: state.meta.lastBpsAtSave,
    },
  } satisfies PersistedStateV5;

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function exportSave(state: GameState): string {
  const timestamp = Date.now();
  state.lastSeenAt = timestamp;
  state.time = timestamp;
  const bpsNumber = state.bps.toNumber();
  const safeBps = Number.isFinite(bpsNumber) && bpsNumber >= 0 ? bpsNumber : 0;
  state.meta.lastSeenAt = timestamp;
  state.meta.lastBpsAtSave = safeBps;

  const payload: PersistedStateV5 = {
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
      version: state.prestige.version,
    },
    abilities: serialiseAbilities(state.abilities),
    time: timestamp,
    lastSeenAt: timestamp,
    locale: state.locale,
    muted: state.muted,
    preferences: state.preferences,
    automation: state.automation,
    settings: state.settings,
    meta: {
      lastSeenAt: state.meta.lastSeenAt,
      lastBpsAtSave: state.meta.lastBpsAtSave,
    },
  } satisfies PersistedStateV5;

  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importSave(encoded: string): GameState {
  const decoded = decodeURIComponent(escape(atob(encoded.trim())));
  const parsed = JSON.parse(decoded) as
    | PersistedStateV5
    | PersistedStateV4
    | PersistedStateV3
    | PersistedStateV2
    | PersistedStateV1Legacy;

  if (!parsed || !parsed.v) {
    throw new Error('Unbekanntes Save-Format');
  }

  let normalised: PersistedStateV5;
  if (parsed.v === 1) {
    normalised = upgradeFromLegacy(parsed as PersistedStateV1Legacy);
  } else if (parsed.v === 2) {
    normalised = normalisePersistedState(parsed as PersistedStateV2);
  } else if (parsed.v === 3) {
    normalised = normalisePersistedState(parsed as PersistedStateV3);
  } else if (parsed.v === 4) {
    normalised = normalisePersistedState(parsed as PersistedStateV4);
  } else if (parsed.v === SAVE_VERSION) {
    normalised = normalisePersistedState(parsed as PersistedStateV5);
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















