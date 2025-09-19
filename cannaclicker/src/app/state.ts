import Decimal from 'break_infinity.js';
import { DEFAULT_LOCALE, type LocaleKey } from './i18n';

export const SAVE_VERSION = 2 as const;

export type DecimalLike = Decimal | number | string | null | undefined;

export type AbilityId = 'overdrive' | 'burst_click';

export interface AbilityRuntimeState {
  active: boolean;
  endsAt: number;
  readyAt: number;
}

export type AbilityState = Record<AbilityId, AbilityRuntimeState>;

export interface PrestigeState {
  seeds: number;
  mult: Decimal;
  lifetimeBuds: Decimal;
  lastResetAt: number;
}

export interface TempState {
  bpsMult: Decimal;
  bpcMult: Decimal;
  costMultiplier: Decimal;
  autoClickRate: number;
  overdriveDurationMult: number;
  offlineBuds: Decimal | null;
  offlineDuration: number;
}

export interface SaveV2 {
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
}

export interface GameState extends SaveV2 {
  locale: LocaleKey;
  muted: boolean;
  lastTick: number;
  temp: TempState;
}

export function createDefaultState(partial: Partial<GameState> = {}): GameState {
  const now = Date.now();
  const lastTick = typeof performance !== 'undefined' ? performance.now() : now;
  const defaultAbilities: AbilityState = {
    overdrive: { active: false, endsAt: 0, readyAt: now },
    burst_click: { active: false, endsAt: 0, readyAt: now },
  } satisfies AbilityState;

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
    },
    abilities: defaultAbilities,
    time: now,
    lastSeenAt: now,
    locale: DEFAULT_LOCALE,
    muted: false,
    lastTick,
    temp: {
      bpsMult: new Decimal(1),
      bpcMult: new Decimal(1),
      costMultiplier: new Decimal(1),
      autoClickRate: 0,
      overdriveDurationMult: 1,
      offlineBuds: null,
      offlineDuration: 0,
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
