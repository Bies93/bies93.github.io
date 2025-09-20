import Decimal from "break_infinity.js";
import { DEFAULT_LOCALE, type LocaleKey } from "./i18n";
import { createDefaultSettings, type SettingsState } from "./settings";

export const SAVE_VERSION = 5 as const;

export type DecimalLike = Decimal | number | string | null | undefined;

export type AbilityId = "overdrive" | "burst";

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
}

export interface TempState {
  bpsMult: Decimal;
  bpcMult: Decimal;
  totalBpsMult: Decimal;
  totalBpcMult: Decimal;
  costMultiplier: Decimal;
  autoClickRate: number;
  abilityPowerBonus: number;
  offlineBuds: Decimal | null;
  offlineDuration: number;
  buildingBaseMultipliers: Record<string, Decimal>;
  buildingTierMultipliers: Record<string, Decimal>;
}

export type ShopSortMode = "price" | "bps" | "roi";

export interface PreferencesState {
  shopSortMode: ShopSortMode;
}

export interface AutoBuyRoiConfig {
  enabled: boolean;
  thresholdSeconds: number;
}

export interface AutoBuyReserveConfig {
  enabled: boolean;
  percent: number;
}

export interface AutoBuyState {
  enabled: boolean;
  roi: AutoBuyRoiConfig;
  reserve: AutoBuyReserveConfig;
}

export interface AutomationState {
  autoBuy: AutoBuyState;
}

export interface MetaState {
  lastSeenAt: number;
  lastBpsAtSave: number;
}

export const AUTO_BUY_ROI_MIN = 60;
export const AUTO_BUY_ROI_MAX = 600;
export const AUTO_BUY_RESERVE_MIN = 0;
export const AUTO_BUY_RESERVE_MAX = 30;

export function createDefaultPreferences(): PreferencesState {
  return { shopSortMode: "price" } satisfies PreferencesState;
}

export function createDefaultAutomation(): AutomationState {
  return {
    autoBuy: {
      enabled: false,
      roi: { enabled: false, thresholdSeconds: 180 },
      reserve: { enabled: false, percent: 0 },
    },
  } satisfies AutomationState;
}

export interface SaveV5 {
  v: typeof SAVE_VERSION;
  buds: Decimal;
  total: Decimal;
  bps: Decimal;
  bpc: Decimal;
  items: Record<string, number>;
  upgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  researchOwned: string[];
  prestige: PrestigeState;
  abilities: AbilityState;
  time: number;
  lastSeenAt: number;
  preferences: PreferencesState;
  automation: AutomationState;
  settings: SettingsState;
  meta: MetaState;
}

export interface GameState extends SaveV5 {
  locale: LocaleKey;
  muted: boolean;
  lastTick: number;
  temp: TempState;
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
      autoClickRate: 0,
      abilityPowerBonus: 0,
      offlineBuds: null,
      offlineDuration: 0,
      buildingBaseMultipliers: {},
      buildingTierMultipliers: {},
    },
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

