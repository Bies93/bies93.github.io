import {
  AUTO_BUY_RESERVE_MAX,
  AUTO_BUY_RESERVE_MIN,
  AUTO_BUY_ROI_MAX,
  AUTO_BUY_ROI_MIN,
  createDefaultAutomation,
  createDefaultPreferences,
  SAVE_VERSION,
} from '../state';
import { createDefaultSettings, type SettingsState } from '../settings';
import { milestones } from '../../data/milestones';
import type { MilestoneId } from '../../data/milestones';
import { RESEARCH, type ResearchId } from '../../data/research';
import { getKickstartConfig } from '../milestones';
import type {
  PersistedAbilityRecord,
  PersistedAbilityState,
  PersistedKickstartState,
  PersistedEventStats,
  PersistedEventStatsPerEvent,
  PersistedMetaState,
  PersistedStateAny,
  PersistedStateV1Legacy,
  PersistedStateV2,
  PersistedStateV3,
  PersistedStateV4,
  PersistedStateV5,
  PersistedStateV6,
  PersistedStateV7,
  RestoredMetaState,
  RestoredSeedGainEntry,
} from './types';
import type { AbilityId, AutomationState, MetaState, PreferencesState } from '../state';
import { createDefaultEventStats, type EventStats, type EventStatsPerEvent } from '../events';
import type { EventId } from '../events';
import { SEED_SYNERGY_IDS, type SeedSynergyId } from '../seeds';

const VALID_MILESTONE_IDS = new Set(milestones.map((milestone) => milestone.id));
const ABILITY_IDS: AbilityId[] = ['overdrive', 'burst'];
const VALID_RESEARCH_IDS = new Set<string>(RESEARCH.map((entry) => entry.id));
const VALID_SEED_SYNERGY_IDS = new Set<string>(SEED_SYNERGY_IDS);
const VALID_EVENT_IDS: EventId[] = ['golden_bud', 'seed_pack', 'lucky_joint'];
const EVENT_ID_SET = new Set<EventId>(VALID_EVENT_IDS);

function isSeedSynergyId(value: unknown): value is SeedSynergyId {
  return typeof value === 'string' && VALID_SEED_SYNERGY_IDS.has(value);
}

function isEventId(value: unknown): value is EventId {
  return typeof value === 'string' && EVENT_ID_SET.has(value as EventId);
}

function isResearchId(value: unknown): value is ResearchId {
  return typeof value === 'string' && VALID_RESEARCH_IDS.has(value);
}

export function normalisePersistedState(
  data: PersistedStateV2 | PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7,
): PersistedStateV7 {
  const now = Date.now();
  const prestige = data.prestige ?? {};
  const legacyData = data as Partial<{
    lastSeenAt: unknown;
    time: unknown;
    researchOwned: unknown;
    abilities: Record<string, PersistedAbilityState>;
  }>;
  const preferences = normalisePreferences(
    (data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).preferences,
  );
  const automation = normaliseAutomation(
    (data as PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).automation,
  );
  const settings = normaliseSettings(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).settings,
  );
  const legacyLastSeen = typeof legacyData.lastSeenAt === 'number' ? legacyData.lastSeenAt : undefined;
  const legacyTime = typeof legacyData.time === 'number' ? legacyData.time : undefined;
  const meta = normaliseMeta(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).meta,
    legacyLastSeen,
    now,
  );
  const milestones = normaliseMilestoneFlags(prestige.milestones);
  const kickstart = normalisePersistedKickstart(prestige.kickstart, now);
  const rawResearch = legacyData.researchOwned;
  const researchOwned = Array.isArray(rawResearch)
    ? [...new Set(rawResearch.filter(isResearchId))]
    : [];
  const abilities = legacyData.abilities;

  return {
    v: SAVE_VERSION,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned,
    prestige: {
      seeds: prestige.seeds ?? 0,
      mult: prestige.mult ?? '1',
      lifetimeBuds: prestige.lifetimeBuds ?? data.total ?? '0',
      lastResetAt: prestige.lastResetAt ?? legacyLastSeen ?? legacyTime ?? now,
      version: Number.isFinite(prestige.version) ? Number(prestige.version) : 1,
      milestones,
      kickstart,
    },
    abilities: normalisePersistedAbilities(abilities),
    time: legacyTime ?? now,
    lastSeenAt: meta.lastSeenAt,
    locale: data.locale,
    muted: data.muted,
    preferences,
    automation,
    settings,
    meta,
  } satisfies PersistedStateV7;
}

export function normalisePersistedAbilities(
  abilities?: Record<string, PersistedAbilityState>,
): PersistedAbilityRecord {
  const now = Date.now();
  const normalised: PersistedAbilityRecord = {
    overdrive: {},
    burst: {},
  };

  for (const id of ABILITY_IDS) {
    const legacyKey = id === 'burst' ? 'burst_click' : id;
    const entry = abilities?.[id] ?? abilities?.[legacyKey] ?? {};
    normalised[id] = {
      active: entry.active ?? false,
      endsAt: entry.endsAt ?? now,
      readyAt: entry.readyAt ?? now,
    };
  }

  return normalised;
}

export function normaliseSettings(settings?: Partial<SettingsState>): SettingsState {
  const defaults = createDefaultSettings();
  if (!settings) {
    return defaults;
  }

  return {
    showOfflineEarnings:
      typeof settings.showOfflineEarnings === 'boolean' ? settings.showOfflineEarnings : defaults.showOfflineEarnings,
  } satisfies SettingsState;
}

export function normaliseMilestoneFlags(
  flags?: Record<string, boolean>,
): Partial<Record<MilestoneId, boolean>> {
  const result: Partial<Record<MilestoneId, boolean>> = {};
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

export function normalisePersistedKickstart(
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

function toPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function toRate(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}

function toTimestamp(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function createDefaultPerEventStats(): EventStatsPerEvent {
  return {
    spawns: 0,
    clicks: 0,
    expired: 0,
    pityActivations: 0,
    clickRate: 0,
    lastSpawnAt: 0,
    lastClickAt: 0,
  } satisfies EventStatsPerEvent;
}

function normaliseEventStats(
  stats: PersistedEventStats | undefined,
  fallbackLastSeen: number,
  now: number,
): EventStats {
  const defaults = createDefaultEventStats(now);
  if (!stats) {
    return defaults;
  }

  const safe: EventStats = {
    totalSpawns: toPositiveInteger(stats.totalSpawns, defaults.totalSpawns),
    totalClicks: toPositiveInteger(stats.totalClicks, defaults.totalClicks),
    totalExpired: toPositiveInteger(stats.totalExpired, defaults.totalExpired),
    pityActivations: toPositiveInteger(stats.pityActivations, defaults.pityActivations),
    pityTimerMs: toPositiveInteger(stats.pityTimerMs, defaults.pityTimerMs),
    clickRate: toRate(stats.clickRate, defaults.clickRate),
    lastSpawnAt: toTimestamp(stats.lastSpawnAt, fallbackLastSeen ?? defaults.lastSpawnAt),
    lastClickAt: toTimestamp(stats.lastClickAt, defaults.lastClickAt),
    perEvent: {},
  } satisfies EventStats;

  if (stats.perEvent) {
    for (const [key, value] of Object.entries(stats.perEvent)) {
      if (!isEventId(key) || !value) {
        continue;
      }
      const entry = value as PersistedEventStatsPerEvent;
      const defaultsPer = createDefaultPerEventStats();
      const per: EventStatsPerEvent = {
        spawns: toPositiveInteger(entry.spawns, defaultsPer.spawns),
        clicks: toPositiveInteger(entry.clicks, defaultsPer.clicks),
        expired: toPositiveInteger(entry.expired, defaultsPer.expired),
        pityActivations: toPositiveInteger(entry.pityActivations, defaultsPer.pityActivations),
        clickRate: toRate(entry.clickRate, defaultsPer.clickRate),
        lastSpawnAt: toTimestamp(entry.lastSpawnAt, defaultsPer.lastSpawnAt),
        lastClickAt: toTimestamp(entry.lastClickAt, defaultsPer.lastClickAt),
      } satisfies EventStatsPerEvent;
      safe.perEvent[key] = per;
    }
  }

  return safe;
}

export function normaliseMeta(
  meta: PersistedMetaState | undefined,
  fallbackLastSeen: number | undefined,
  now: number,
): RestoredMetaState {
  const lastSeen = Number.isFinite(meta?.lastSeenAt) ? Number(meta!.lastSeenAt) : fallbackLastSeen ?? now;
  const safeLastSeen = lastSeen > 0 ? Math.floor(lastSeen) : now;
  const lastBps = Number.isFinite(meta?.lastBpsAtSave) ? Number(meta!.lastBpsAtSave) : 0;

  const rawHistory = Array.isArray(meta?.seedHistory) ? meta!.seedHistory : [];
  const history: RestoredSeedGainEntry[] = rawHistory
    .map((entry) => {
      const time = Number.isFinite(entry?.time) ? Math.floor(entry!.time!) : 0;
      const amount = Number.isFinite(entry?.amount) ? Math.floor(entry!.amount!) : 0;
      const source = entry?.source;
      if (time <= 0 || amount <= 0) {
        return null;
      }
      const safeSource = source === 'event' || source === 'click' || source === 'synergy' || source === 'passive' ? source : 'event';
      return { time, amount, source: safeSource } satisfies RestoredSeedGainEntry;
    })
    .filter((entry): entry is RestoredSeedGainEntry => !!entry);

  const trimmedHistory = history.slice(-200);

  const synergyClaims: Partial<Record<SeedSynergyId, boolean>> = {};
  if (meta?.seedSynergyClaims) {
    for (const [key, value] of Object.entries(meta.seedSynergyClaims)) {
      if (typeof value === 'boolean' && isSeedSynergyId(key)) {
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
  const eventStats = normaliseEventStats(meta?.eventStats, safeLastSeen, now);

  return {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: lastBps >= 0 ? lastBps : 0,
    seedHistory: trimmedHistory,
    seedSynergyClaims: synergyClaims,
    lastInteractionAt: lastInteraction,
    seedPassiveIdleMs: idleMs,
    seedPassiveRollsDone: rollsDone,
    eventStats,
  } satisfies MetaState;
}

export function normalisePreferences(preferences?: Partial<PreferencesState>): PreferencesState {
  const defaults = createDefaultPreferences();
  const mode = preferences?.shopSortMode;
  if (mode === 'price' || mode === 'bps' || mode === 'roi') {
    return { shopSortMode: mode } satisfies PreferencesState;
  }
  return defaults;
}

export function normaliseAutomation(automation?: Partial<AutomationState>): AutomationState {
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

export function upgradeFromLegacy(data: PersistedStateV1Legacy): PersistedStateV7 {
  const now = Date.now();
  return normalisePersistedState({
    v: 2,
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
  } satisfies PersistedStateV2);
}

export function upgradePersistedState(data: PersistedStateAny): PersistedStateV7 | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if ('v' in data) {
    switch (data.v) {
      case 1:
        return upgradeFromLegacy(data as PersistedStateV1Legacy);
      case 2:
        return normalisePersistedState(data as PersistedStateV2);
      case 3:
        return normalisePersistedState(data as PersistedStateV3);
      case 4:
        return normalisePersistedState(data as PersistedStateV4);
      case 5:
        return normalisePersistedState(data as PersistedStateV5);
      case 6:
        return normalisePersistedState(data as PersistedStateV6);
      case SAVE_VERSION:
        return normalisePersistedState(data as PersistedStateV7);
      default:
        return null;
    }
  }

  return null;
}
