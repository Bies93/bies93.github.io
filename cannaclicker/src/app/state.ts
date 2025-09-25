import Decimal from "break_infinity.js";
import { DEFAULT_LOCALE, type LocaleKey } from "./i18n";
import { createDefaultSettings, type SettingsState } from "./settings";
import { OFFLINE_CAP_MS } from "./balance";
import type { MilestoneProgressSnapshot } from "./milestones";
import type { AbilityId } from "../data/abilities";
import type { AchievementId } from "../data/achievements";
import type { ItemId } from "../data/items";
import type { MilestoneId } from "../data/milestones";
import type { ResearchId } from "../data/research";
import type { UpgradeId } from "../data/upgrades";
import type { SeedSynergyId } from "./seeds";
import {
  createDefaultEventState,
  createDefaultEventStats,
  type EventRuntimeState,
  type EventStats,
} from "./events";
export type { AbilityId } from "../data/abilities";

export const SAVE_VERSION = 7 as const;

export type SeedGainSource = "event" | "click" | "synergy" | "passive";

export interface SeedGainEntry {
  time: number;
  amount: number;
  source: SeedGainSource;
}

export interface SeedPassiveConfig {
  intervalMs: number;
  chance: number;
  seeds: number;
}

export type SeedNotification =
  | { type: "synergy"; id: SeedSynergyId; seeds: number }
  | { type: "passive"; seeds: number };

export type DecimalLike = Decimal | number | string | null | undefined;

export interface AbilityRuntimeState {
  active: boolean;
  endsAt: number;
  readyAt: number;
  multiplier: number;
}

export type AbilityState = Record<AbilityId, AbilityRuntimeState>;

export interface PrestigeState {
  seeds: number;
  mult: Decimal;
  lifetimeBuds: Decimal;
  lastResetAt: number;
  version: number;
  milestones: Partial<Record<MilestoneId, boolean>>;
  kickstart: KickstartState | null;
}

export interface KickstartState {
  level: number;
  endsAt: number;
}

export interface TempState {
  bpsMult: Decimal;
  bpcMult: Decimal;
  totalBpsMult: Decimal;
  totalBpcMult: Decimal;
  costMultiplier: Decimal;
  buildingCostMultipliers: Partial<Record<ItemId, Decimal>>;
  autoClickRate: number;
  abilityPowerBonus: number;
  abilityDurationMult: number;
  offlineCapMs: number;
  offlineBuds: Decimal | null;
  offlineDuration: number;
  buildingBaseMultipliers: Partial<Record<ItemId, Decimal>>;
  buildingTierMultipliers: Partial<Record<ItemId, Decimal>>;
  researchBuildingMultipliers: Partial<Record<ItemId, Decimal>>;
  eventBpsMult: Decimal;
  eventBpcMult: Decimal;
  eventBoostEndsAt: number;
  activeEventBoost: string | null;
  hybridBuffPerBuff: number;
  hybridActiveBuffs: number;
  strainChoice: string | null;
  milestoneGlobalMult: Decimal;
  milestoneBpsMult: Decimal;
  milestoneBpcMult: Decimal;
  milestoneProgress: MilestoneProgressSnapshot[];
  milestoneActiveCount: number;
  nextKickstartLevel: number;
  kickstartBpsMult: Decimal;
  kickstartBpcMult: Decimal;
  kickstartCostMult: Decimal;
  kickstartLevel: number;
  kickstartDurationMs: number;
  kickstartRemainingMs: number;
  kickstartEndsAt: number;
  seedClickBonus: number;
  seedPassiveConfig: SeedPassiveConfig | null;
  seedPassiveThrottled: boolean;
  seedPassiveProgress: number;
  seedNotifications: SeedNotification[];
  seedRatePerHour: number;
  seedRateCap: number;
}

export type ShopSortMode = "price" | "bps" | "roi";

export interface PreferencesState {
  shopSortMode: ShopSortMode;
}


export interface MetaState {
  lastSeenAt: number;
  lastBpsAtSave: number;
  seedHistory: SeedGainEntry[];
  seedSynergyClaims: Partial<Record<SeedSynergyId, boolean>>;
  lastInteractionAt: number;
  seedPassiveIdleMs: number;
  seedPassiveRollsDone: number;
  eventStats: EventStats;
}


export function createDefaultPreferences(): PreferencesState {
  return { shopSortMode: "price" } satisfies PreferencesState;
}

export function createDefaultAutomation(): {} {
  return {};
}

export interface SaveV5 {
  v: typeof SAVE_VERSION;
  buds: Decimal;
  total: Decimal;
  bps: Decimal;
  bpc: Decimal;
  items: Partial<Record<ItemId, number>>;
  upgrades: Partial<Record<UpgradeId, boolean>>;
  achievements: Partial<Record<AchievementId, boolean>>;
  researchOwned: ResearchId[];
  prestige: PrestigeState;
  abilities: AbilityState;
  time: number;
  lastSeenAt: number;
  preferences: PreferencesState;
  automation: {};
  settings: SettingsState;
  meta: MetaState;
}

export interface GameState extends SaveV5 {
  locale: LocaleKey;
  muted: boolean;
  lastTick: number;
  temp: TempState;
  events: EventRuntimeState;
}

export function createDefaultState(partial: Partial<GameState> = {}): GameState {
  const now = Date.now();
  const lastTick = typeof performance !== "undefined" ? performance.now() : now;
  const defaultAbilities: AbilityState = {
    overdrive: { active: false, endsAt: 0, readyAt: now, multiplier: 1 },
    burst: { active: false, endsAt: 0, readyAt: now, multiplier: 1 },
  } satisfies AbilityState;

  const defaultPreferences = createDefaultPreferences();
  const defaultAutomation = createDefaultAutomation();
  const defaultSettings = createDefaultSettings();
  const defaultMeta: MetaState = { lastSeenAt: now, lastBpsAtSave: 0 };
  defaultMeta.seedHistory = [];
  defaultMeta.seedSynergyClaims = {};
  defaultMeta.lastInteractionAt = now;
  defaultMeta.seedPassiveIdleMs = 0;
  defaultMeta.seedPassiveRollsDone = 0;
  defaultMeta.eventStats = createDefaultEventStats(now);

  return {
    v: SAVE_VERSION,
    buds: new Decimal(0),
    total: new Decimal(0),
    bps: new Decimal(0),
    bpc: new Decimal(1),
    items: {},
    upgrades: {},
    achievements: {},
    researchOwned: [],
    prestige: {
      seeds: 0,
      mult: new Decimal(1),
      lifetimeBuds: new Decimal(0),
      lastResetAt: now,
      version: 1,
      milestones: {},
      kickstart: null,
    },
    abilities: defaultAbilities,
    time: now,
    lastSeenAt: now,
    preferences: defaultPreferences,
    automation: defaultAutomation,
    settings: defaultSettings,
    meta: defaultMeta,
    locale: DEFAULT_LOCALE,
    muted: false,
    lastTick,
    temp: {
      bpsMult: new Decimal(1),
      bpcMult: new Decimal(1),
      totalBpsMult: new Decimal(1),
      totalBpcMult: new Decimal(1),
      costMultiplier: new Decimal(1),
      buildingCostMultipliers: {},
      autoClickRate: 0,
      abilityPowerBonus: 0,
      abilityDurationMult: 1,
      offlineCapMs: OFFLINE_CAP_MS,
      offlineBuds: null,
      offlineDuration: 0,
      buildingBaseMultipliers: {},
      buildingTierMultipliers: {},
      researchBuildingMultipliers: {},
      eventBpsMult: new Decimal(1),
      eventBpcMult: new Decimal(1),
      eventBoostEndsAt: 0,
      activeEventBoost: null,
      hybridBuffPerBuff: 0,
      hybridActiveBuffs: 0,
      strainChoice: null,
      milestoneGlobalMult: new Decimal(1),
      milestoneBpsMult: new Decimal(1),
      milestoneBpcMult: new Decimal(1),
      milestoneProgress: [],
      milestoneActiveCount: 0,
      nextKickstartLevel: 0,
      kickstartBpsMult: new Decimal(1),
      kickstartBpcMult: new Decimal(1),
      kickstartCostMult: new Decimal(1),
      kickstartLevel: 0,
      kickstartDurationMs: 0,
      kickstartRemainingMs: 0,
      kickstartEndsAt: 0,
      seedClickBonus: 0,
      seedPassiveConfig: null,
      seedPassiveThrottled: false,
      seedPassiveProgress: 0,
      seedNotifications: [],
      seedRatePerHour: 0,
      seedRateCap: 0,
    },
    events: createDefaultEventState(now),
    ...partial,
  } satisfies GameState;
}

export function ensureDecimal(value: DecimalLike): Decimal {
  if (value instanceof Decimal) {
    return value;
  }

  if (value === null || value === undefined) {
    return new Decimal(0);
  }

  return new Decimal(value);
}

