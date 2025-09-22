/* eslint-disable @typescript-eslint/no-explicit-any */
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
  type KickstartState,
  type SeedGainEntry,
  AUTO_BUY_ROI_MIN,
  AUTO_BUY_ROI_MAX,
  AUTO_BUY_RESERVE_MIN,
  AUTO_BUY_RESERVE_MAX,
} from './state';
import { computePrestigeMultiplier } from './prestige';
import { OFFLINE_CAP_MS, OFFLINE_GAIN_RATIO } from './balance';
import { applyResearchEffects } from './research';
import { reapplyAbilityEffects } from './abilities';
import { DEFAULT_LOCALE, resolveLocale, type LocaleKey } from './i18n';
import { createDefaultSettings, type SettingsState } from './settings';
import { milestones } from '../data/milestones';
import { getKickstartConfig } from './milestones';

const SAVE_KEY = 'cannaclicker:save:v1';

const VALID_MILESTONE_IDS = new Set(milestones.map((milestone) => milestone.id));

interface PersistedAbilityState {
  active?: boolean;
  endsAt?: number;
  readyAt?: number;
}

interface PersistedKickstartState {
  level?: number;
  endsAt?: number;
}

interface PersistedPrestigeState {
  seeds?: number;
  mult?: string;
  lifetimeBuds?: string;
  lastResetAt?: number;
  version?: number;
  milestones?: Record<string, boolean>;
  kickstart?: PersistedKickstartState | null;
}

interface PersistedSeedEntry {
  time?: number;
  amount?: number;
  source?: string;
}

interface PersistedMetaState {
  lastSeenAt?: number;
  lastBpsAtSave?: number;
  seedHistory?: PersistedSeedEntry[];
  seedSynergyClaims?: Record<string, boolean>;
  lastInteractionAt?: number;
  seedPassiveIdleMs?: number;
  seedPassiveRollsDone?: number;
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

interface PersistedStateBase {
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

export interface PersistedStateV5 extends PersistedStateBase {
  v: 5;
}

export interface PersistedStateV6 extends PersistedStateBase {
  v: 6;
}

export interface PersistedStateV7 extends PersistedStateBase {
  v: typeof SAVE_VERSION;
}

function normalisePersistedState(
  data:
    | PersistedStateV2
    | PersistedStateV3
    | PersistedStateV4
    | PersistedStateV5
    | PersistedStateV6
    | PersistedStateV7,
): PersistedStateV7 {
  const now = Date.now();
  const prestige = data.prestige ?? {};
  const preferences = normalisePreferences(
    (data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).preferences,
  );
  const automation = normaliseAutomation(
    (data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).automation,
  );
  const settings = normaliseSettings(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).settings,
  );
  const meta = normaliseMeta(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).meta,
    (data as any).lastSeenAt,
    now,
  );
  const milestones = normaliseMilestoneFlags(prestige.milestones);
  const kickstart = normalisePersistedKickstart(prestige.kickstart, now);

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
      milestones,
      kickstart,
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
  } satisfies PersistedStateV7;
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

function normaliseMilestoneFlags(flags?: Record<string, boolean>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (!flags) {
    return result;
  }

  for (const id of VALID_MILESTONE_IDS) {
    if (flags[id]) {
      result[id] = true;
    }
  }

  return result;
}

function normalisePersistedKickstart(
  kickstart: PersistedKickstartState | null | undefined,
  now: number,
): PersistedKickstartState | null {
  if (!kickstart) {
    return null;
  }

  const level = Number.isFinite(kickstart.level) ? Math.max(1, Math.floor(kickstart.level!)) : NaN;
  const config = getKickstartConfig(level);
  if (!config) {
    return null;
  }

  const endsAt = Number.isFinite(kickstart.endsAt) ? Math.max(0, Math.floor(kickstart.endsAt!)) : 0;
  if (endsAt <= now) {
    return null;
  }

  return { level: config.level, endsAt } satisfies PersistedKickstartState;
}

function normaliseMeta(meta: PersistedMetaState | undefined, fallbackLastSeen: number | undefined, now: number): MetaState {
  const lastSeen = Number.isFinite(meta?.lastSeenAt) ? Number(meta!.lastSeenAt) : fallbackLastSeen ?? now;
  const safeLastSeen = lastSeen > 0 ? Math.floor(lastSeen) : now;
  const lastBps = Number.isFinite(meta?.lastBpsAtSave) ? Number(meta!.lastBpsAtSave) : 0;

  const rawHistory = Array.isArray(meta?.seedHistory) ? meta!.seedHistory : [];
  const history: SeedGainEntry[] = rawHistory
    .map((entry) => {
      const time = Number.isFinite(entry?.time) ? Math.floor(entry!.time!) : 0;
      const amount = Number.isFinite(entry?.amount) ? Math.floor(entry!.amount!) : 0;
      const source = entry?.source;
      if (time <= 0 || amount <= 0) {
        return null;
      }
      const safeSource =
        source === 'event' || source === 'click' || source === 'synergy' || source === 'passive'
          ? source
          : 'event';
      return { time, amount, source: safeSource } satisfies SeedGainEntry;
    })
    .filter((entry): entry is SeedGainEntry => !!entry);

  const trimmedHistory = history.slice(-200);

  const synergyClaims: Record<string, boolean> = {};
  if (meta?.seedSynergyClaims) {
    for (const [key, value] of Object.entries(meta.seedSynergyClaims)) {
      if (typeof value === 'boolean') {
        synergyClaims[key] = value;
      }
    }
  }

  const lastInteraction = Number.isFinite(meta?.lastInteractionAt)
    ? Math.max(0, Math.floor(meta!.lastInteractionAt!))
    : safeLastSeen;
  const idleMs = Number.isFinite(meta?.seedPassiveIdleMs)
    ? Math.max(0, Math.floor(meta!.seedPassiveIdleMs!))
    : 0;
  const rollsDone = Number.isFinite(meta?.seedPassiveRollsDone)
    ? Math.max(0, Math.floor(meta!.seedPassiveRollsDone!))
    : 0;

  return {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: lastBps >= 0 ? lastBps : 0,
    seedHistory: trimmedHistory,
    seedSynergyClaims: synergyClaims,
    lastInteractionAt: lastInteraction,
    seedPassiveIdleMs: idleMs,
    seedPassiveRollsDone: rollsDone,
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

function upgradeFromLegacy(data: PersistedStateV1Legacy): PersistedStateV7 {
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
      milestones: {},
      kickstart: null,
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

function restoreKickstart(kickstart: PersistedKickstartState | null | undefined): KickstartState | null {
  if (!kickstart) {
    return null;
  }

  const level = Number.isFinite(kickstart.level) ? Math.max(1, Math.floor(kickstart.level!)) : NaN;
  const config = getKickstartConfig(level);
  if (!config) {
    return null;
  }

  const now = Date.now();
  const endsAt = Number.isFinite(kickstart.endsAt) ? Math.max(0, Math.floor(kickstart.endsAt!)) : 0;
  if (endsAt <= now) {
    return null;
  }

  return { level: config.level, endsAt } satisfies KickstartState;
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

export function load(): PersistedStateV7 | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as
      | PersistedStateV7
      | PersistedStateV6
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
      const normalised = normalisePersistedState(parsed as PersistedStateV7);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(normalised));
      return normalised;
    }

    if (parsed.v === 6) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV6);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    if (parsed.v === 5) {
      const upgraded = normalisePersistedState(parsed as PersistedStateV5);
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(upgraded));
      return upgraded;
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

export function initState(saved: PersistedStateV7 | null): GameState {
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
  const seedHistory = Array.isArray(saved.meta?.seedHistory) ? [...saved.meta.seedHistory] : [];
  const seedSynergyClaims = saved.meta?.seedSynergyClaims ? { ...saved.meta.seedSynergyClaims } : {};
  const lastInteraction = Number.isFinite(saved.meta?.lastInteractionAt)
    ? Math.max(0, Math.floor(saved.meta!.lastInteractionAt!))
    : safeLastSeen;
  const idleMs = Number.isFinite(saved.meta?.seedPassiveIdleMs)
    ? Math.max(0, Math.floor(saved.meta!.seedPassiveIdleMs!))
    : 0;
  const rollsDone = Number.isFinite(saved.meta?.seedPassiveRollsDone)
    ? Math.max(0, Math.floor(saved.meta!.seedPassiveRollsDone!))
    : 0;

  const initialMeta: MetaState = {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: metaBps,
    seedHistory,
    seedSynergyClaims,
    lastInteractionAt: lastInteraction,
    seedPassiveIdleMs: idleMs,
    seedPassiveRollsDone: rollsDone,
  } satisfies MetaState;

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
      milestones: normaliseMilestoneFlags(saved.prestige?.milestones),
      kickstart: restoreKickstart(saved.prestige?.kickstart),
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
  const offlineCap = Number.isFinite(state.temp.offlineCapMs)
    ? Math.max(0, state.temp.offlineCapMs)
    : OFFLINE_CAP_MS;
  const cappedDelta = Math.max(0, Math.min(rawDelta, offlineCap));
  const fallbackBps = state.bps.toNumber();
  const baseBps = Number.isFinite(state.meta.lastBpsAtSave)
    ? state.meta.lastBpsAtSave
    : Number.isFinite(fallbackBps) && fallbackBps > 0
      ? fallbackBps
      : 0;
  const safeBps = baseBps >= 0 ? baseBps : 0;
  state.meta.lastBpsAtSave = safeBps;
  const earnedNumber = Math.floor(safeBps * (cappedDelta / 1000) * OFFLINE_GAIN_RATIO);

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

  const payload: PersistedStateV7 = {
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
      milestones: state.prestige.milestones,
      kickstart: state.prestige.kickstart,
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
      seedHistory: state.meta.seedHistory.slice(-200),
      seedSynergyClaims: state.meta.seedSynergyClaims,
      lastInteractionAt: state.meta.lastInteractionAt,
      seedPassiveIdleMs: state.meta.seedPassiveIdleMs,
      seedPassiveRollsDone: state.meta.seedPassiveRollsDone,
    },
  } satisfies PersistedStateV7;

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

  const payload: PersistedStateV7 = {
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
      milestones: state.prestige.milestones,
      kickstart: state.prestige.kickstart,
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
      seedHistory: state.meta.seedHistory.slice(-200),
      seedSynergyClaims: state.meta.seedSynergyClaims,
      lastInteractionAt: state.meta.lastInteractionAt,
      seedPassiveIdleMs: state.meta.seedPassiveIdleMs,
      seedPassiveRollsDone: state.meta.seedPassiveRollsDone,
    },
  } satisfies PersistedStateV7;

  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importSave(encoded: string): GameState {
  const decoded = decodeURIComponent(escape(atob(encoded.trim())));
  const parsed = JSON.parse(decoded) as
    | PersistedStateV7
    | PersistedStateV6
    | PersistedStateV5
    | PersistedStateV4
    | PersistedStateV3
    | PersistedStateV2
    | PersistedStateV1Legacy;

  if (!parsed || !parsed.v) {
    throw new Error('Unbekanntes Save-Format');
  }

  let normalised: PersistedStateV7;
  if (parsed.v === 1) {
    normalised = upgradeFromLegacy(parsed as PersistedStateV1Legacy);
  } else if (parsed.v === 2) {
    normalised = normalisePersistedState(parsed as PersistedStateV2);
  } else if (parsed.v === 3) {
    normalised = normalisePersistedState(parsed as PersistedStateV3);
  } else if (parsed.v === 4) {
    normalised = normalisePersistedState(parsed as PersistedStateV4);
  } else if (parsed.v === 5) {
    normalised = normalisePersistedState(parsed as PersistedStateV5);
  } else if (parsed.v === 6) {
    normalised = normalisePersistedState(parsed as PersistedStateV6);
  } else if (parsed.v === SAVE_VERSION) {
    normalised = normalisePersistedState(parsed as PersistedStateV7);
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















