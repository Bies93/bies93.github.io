import Decimal from 'break_infinity.js';
import { DEFAULT_LOCALE, type LocaleKey } from './i18n';

export const SAVE_VERSION = 1 as const;

export type DecimalLike = Decimal | number | string | null | undefined;

export interface SaveV1 {
  v: typeof SAVE_VERSION;
  buds: Decimal;
  total: Decimal;
  bps: Decimal;
  bpc: Decimal;
  items: Record<string, number>;
  upgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  time: number;
}

export interface GameState extends SaveV1 {
  locale: LocaleKey;
  muted: boolean;
  lastTick: number;
}

export function createDefaultState(partial: Partial<GameState> = {}): GameState {
  const now = Date.now();
  const lastTick = typeof performance !== 'undefined' ? performance.now() : now;
  return {
    v: SAVE_VERSION,
    buds: new Decimal(0),
    total: new Decimal(0),
    bps: new Decimal(0),
    bpc: new Decimal(1),
    items: {},
    upgrades: {},
    achievements: {},
    time: now,
    locale: DEFAULT_LOCALE,
    muted: false,
    lastTick,
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
