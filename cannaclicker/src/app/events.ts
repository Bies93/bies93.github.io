import Decimal from 'break_infinity.js';
import type { EventBoostState, EventBoostTarget, GameState } from './state';
import { awardSeeds, getSeedCap } from './seeds';
import { abilityMultiplierFor } from './abilities';

export type EventId =
  | 'golden_bud'
  | 'seed_pack'
  | 'lucky_joint'
  | 'fertile_rain'
  | 'market_rush'
  | 'green_surge'
  | 'mutant_sprout'
  | 'supply_drop'
  | 'flash_harvest'
  | 'calm_growth'
  | 'overgrowth'
  | 'seed_bloom'
  | 'tiny_spark'
  | 'dew_drop'
  | 'compost_cache'
  | 'sunbeam'
  | 'mega_bud'
  | 'jackpot_canopy'
  | 'aurora_bloom'
  | 'trail_marker'
  | 'cascade_bloom'
  | 'echo_harvest'
  | 'volatile_growth'
  | 'blackout_sale'
  | 'pest_scare'
  | 'solstice_seed'
  | 'night_market'
  | 'festival_lantern';

export type EventCategory = 'minor' | 'major' | 'chain' | 'risk' | 'seasonal';
export type EventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EventSeason = 'evergreen' | 'sunshift' | 'nightMarket' | 'festival';

export interface EventDefinition {
  id: EventId;
  category: EventCategory;
  rarity: EventRarity;
  season: EventSeason;
  minTotalBuds?: number;
  minPrestigeSeeds?: number;
  risk?: boolean;
  chainNext?: EventId;
  chainChance?: number;
}

const GOLDEN_BUD_SECONDS = 12;
const LUCKY_JOINT_MULTIPLIER = 2;
export const LUCKY_JOINT_DURATION_MS = 15_000;
const FERTILE_RAIN_SECONDS = 10;
const MARKET_RUSH_MULTIPLIER = 1.6;
const MARKET_RUSH_DURATION_MS = 20_000;
const GREEN_SURGE_MULTIPLIER = 2.5;
const GREEN_SURGE_DURATION_MS = 10_000;
const MUTANT_SPROUT_SECONDS = 24;
const SUPPLY_DROP_SECONDS = 12;
const FLASH_HARVEST_SECONDS = 18;
const CALM_GROWTH_MULTIPLIER = 1.85;
const CALM_GROWTH_DURATION_MS = 24_000;
const OVERGROWTH_SECONDS = 30;
const OVERGROWTH_MULTIPLIER = 1.35;
const OVERGROWTH_DURATION_MS = 20_000;
const SEED_BLOOM_MULTIPLIER = 1.5;
const SEED_BLOOM_DURATION_MS = 18_000;
const SUPPLY_DROP_DISCOUNT = 0.85;
const SUPPLY_DROP_DURATION_MS = 16_000;

const EVENT_SPAWN_MIN_MS = 14_000;
const EVENT_SPAWN_MAX_MS = 26_000;
const FIRST_EVENT_MIN_MS = 90_000;
const EVENT_VISIBLE_MIN_MS = 7_000;
const EVENT_VISIBLE_MAX_MS = 12_000;
const EVENT_QUEUE_TARGET_SIZE = 3;
const EVENT_HISTORY_LIMIT = 100;
const EVENT_COOLDOWN_BUFFER_MS = 5_000;
const EVENT_PITY_THRESHOLD_MS = 55_000;
const EVENT_CHAIN_DELAY_MS = 850;

const EVENT_CATEGORY_PITY_MS: Record<EventCategory, number> = {
  minor: 52_000,
  chain: 92_000,
  risk: 124_000,
  major: 160_000,
  seasonal: 190_000,
};

const EVENT_CATEGORY_PRIORITY: Record<EventCategory, number> = {
  minor: 4,
  chain: 7,
  risk: 8,
  major: 9,
  seasonal: 10,
};

export const EVENT_IDS: EventId[] = [
  'golden_bud',
  'seed_pack',
  'lucky_joint',
  'fertile_rain',
  'market_rush',
  'green_surge',
  'mutant_sprout',
  'supply_drop',
  'flash_harvest',
  'calm_growth',
  'overgrowth',
  'seed_bloom',
  'tiny_spark',
  'dew_drop',
  'compost_cache',
  'sunbeam',
  'mega_bud',
  'jackpot_canopy',
  'aurora_bloom',
  'trail_marker',
  'cascade_bloom',
  'echo_harvest',
  'volatile_growth',
  'blackout_sale',
  'pest_scare',
  'solstice_seed',
  'night_market',
  'festival_lantern',
];

export const DEFAULT_EVENT_WEIGHTS: Record<EventId, number> = {
  golden_bud: 1,
  seed_pack: 0.55,
  lucky_joint: 0.75,
  fertile_rain: 0.75,
  market_rush: 0.55,
  green_surge: 0.45,
  mutant_sprout: 0.25,
  supply_drop: 0.5,
  flash_harvest: 0.35,
  calm_growth: 0.4,
  overgrowth: 0.18,
  seed_bloom: 0.28,
  tiny_spark: 0.95,
  dew_drop: 0.86,
  compost_cache: 0.7,
  sunbeam: 0.68,
  mega_bud: 0.14,
  jackpot_canopy: 0.08,
  aurora_bloom: 0.1,
  trail_marker: 0.32,
  cascade_bloom: 0.2,
  echo_harvest: 0.14,
  volatile_growth: 0.17,
  blackout_sale: 0.13,
  pest_scare: 0.15,
  solstice_seed: 0.16,
  night_market: 0.14,
  festival_lantern: 0.12,
};

export const EVENT_I18N_KEYS: Record<EventId, string> = {
  golden_bud: 'goldenBud',
  seed_pack: 'seedPack',
  lucky_joint: 'luckyJoint',
  fertile_rain: 'fertileRain',
  market_rush: 'marketRush',
  green_surge: 'greenSurge',
  mutant_sprout: 'mutantSprout',
  supply_drop: 'supplyDrop',
  flash_harvest: 'flashHarvest',
  calm_growth: 'calmGrowth',
  overgrowth: 'overgrowth',
  seed_bloom: 'seedBloom',
  tiny_spark: 'tinySpark',
  dew_drop: 'dewDrop',
  compost_cache: 'compostCache',
  sunbeam: 'sunbeam',
  mega_bud: 'megaBud',
  jackpot_canopy: 'jackpotCanopy',
  aurora_bloom: 'auroraBloom',
  trail_marker: 'trailMarker',
  cascade_bloom: 'cascadeBloom',
  echo_harvest: 'echoHarvest',
  volatile_growth: 'volatileGrowth',
  blackout_sale: 'blackoutSale',
  pest_scare: 'pestScare',
  solstice_seed: 'solsticeSeed',
  night_market: 'nightMarket',
  festival_lantern: 'festivalLantern',
};

export const EVENT_DEFINITIONS: Record<EventId, EventDefinition> = {
  golden_bud: { id: 'golden_bud', category: 'minor', rarity: 'common', season: 'evergreen' },
  seed_pack: { id: 'seed_pack', category: 'minor', rarity: 'uncommon', season: 'evergreen' },
  lucky_joint: { id: 'lucky_joint', category: 'minor', rarity: 'uncommon', season: 'evergreen' },
  fertile_rain: { id: 'fertile_rain', category: 'minor', rarity: 'common', season: 'evergreen' },
  market_rush: { id: 'market_rush', category: 'minor', rarity: 'uncommon', season: 'evergreen' },
  green_surge: { id: 'green_surge', category: 'minor', rarity: 'uncommon', season: 'evergreen' },
  mutant_sprout: {
    id: 'mutant_sprout',
    category: 'major',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 50_000,
    minPrestigeSeeds: 1,
  },
  supply_drop: { id: 'supply_drop', category: 'minor', rarity: 'uncommon', season: 'evergreen' },
  flash_harvest: {
    id: 'flash_harvest',
    category: 'chain',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 2_500,
    chainNext: 'golden_bud',
    chainChance: 1,
  },
  calm_growth: {
    id: 'calm_growth',
    category: 'minor',
    rarity: 'uncommon',
    season: 'evergreen',
    minTotalBuds: 2_500,
  },
  overgrowth: {
    id: 'overgrowth',
    category: 'major',
    rarity: 'epic',
    season: 'evergreen',
    minTotalBuds: 250_000,
  },
  seed_bloom: {
    id: 'seed_bloom',
    category: 'major',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 50_000,
    minPrestigeSeeds: 1,
  },
  tiny_spark: { id: 'tiny_spark', category: 'minor', rarity: 'common', season: 'evergreen' },
  dew_drop: { id: 'dew_drop', category: 'minor', rarity: 'common', season: 'evergreen' },
  compost_cache: {
    id: 'compost_cache',
    category: 'minor',
    rarity: 'uncommon',
    season: 'evergreen',
    minTotalBuds: 600,
  },
  sunbeam: {
    id: 'sunbeam',
    category: 'minor',
    rarity: 'uncommon',
    season: 'sunshift',
    minTotalBuds: 1_200,
  },
  mega_bud: {
    id: 'mega_bud',
    category: 'major',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 110_000,
  },
  jackpot_canopy: {
    id: 'jackpot_canopy',
    category: 'major',
    rarity: 'legendary',
    season: 'festival',
    minTotalBuds: 1_800_000,
    minPrestigeSeeds: 2,
  },
  aurora_bloom: {
    id: 'aurora_bloom',
    category: 'major',
    rarity: 'epic',
    season: 'sunshift',
    minTotalBuds: 650_000,
  },
  trail_marker: {
    id: 'trail_marker',
    category: 'chain',
    rarity: 'uncommon',
    season: 'evergreen',
    minTotalBuds: 8_000,
    chainNext: 'cascade_bloom',
    chainChance: 0.68,
  },
  cascade_bloom: {
    id: 'cascade_bloom',
    category: 'chain',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 18_000,
    chainNext: 'echo_harvest',
    chainChance: 0.42,
  },
  echo_harvest: {
    id: 'echo_harvest',
    category: 'chain',
    rarity: 'epic',
    season: 'evergreen',
    minTotalBuds: 75_000,
  },
  volatile_growth: {
    id: 'volatile_growth',
    category: 'risk',
    rarity: 'rare',
    season: 'evergreen',
    minTotalBuds: 30_000,
    risk: true,
  },
  blackout_sale: {
    id: 'blackout_sale',
    category: 'risk',
    rarity: 'rare',
    season: 'nightMarket',
    minTotalBuds: 85_000,
    risk: true,
  },
  pest_scare: {
    id: 'pest_scare',
    category: 'risk',
    rarity: 'uncommon',
    season: 'evergreen',
    minTotalBuds: 22_000,
    risk: true,
  },
  solstice_seed: {
    id: 'solstice_seed',
    category: 'seasonal',
    rarity: 'epic',
    season: 'sunshift',
    minTotalBuds: 180_000,
  },
  night_market: {
    id: 'night_market',
    category: 'seasonal',
    rarity: 'epic',
    season: 'nightMarket',
    minTotalBuds: 420_000,
  },
  festival_lantern: {
    id: 'festival_lantern',
    category: 'seasonal',
    rarity: 'legendary',
    season: 'festival',
    minTotalBuds: 1_200_000,
    minPrestigeSeeds: 1,
  },
};

export function getEventDefinition(id: EventId): EventDefinition {
  return EVENT_DEFINITIONS[id];
}

interface SeedDropConfig {
  chance: number;
  weights: { amount: number; weight: number }[];
}

const EVENT_SEED_DROPS: Record<EventId, SeedDropConfig> = {
  golden_bud: {
    chance: 0.05,
    weights: [
      { amount: 1, weight: 70 },
      { amount: 2, weight: 20 },
      { amount: 3, weight: 7 },
      { amount: 5, weight: 3 },
    ],
  },
  fertile_rain: {
    chance: 0.08,
    weights: [
      { amount: 1, weight: 70 },
      { amount: 2, weight: 22 },
      { amount: 3, weight: 8 },
    ],
  },
  lucky_joint: {
    chance: 0.04,
    weights: [
      { amount: 1, weight: 60 },
      { amount: 2, weight: 25 },
      { amount: 3, weight: 12 },
      { amount: 5, weight: 3 },
    ],
  },
  market_rush: {
    chance: 0.03,
    weights: [
      { amount: 1, weight: 78 },
      { amount: 2, weight: 18 },
      { amount: 3, weight: 4 },
    ],
  },
  green_surge: {
    chance: 0.05,
    weights: [
      { amount: 1, weight: 72 },
      { amount: 2, weight: 22 },
      { amount: 3, weight: 6 },
    ],
  },
  mutant_sprout: {
    chance: 1,
    weights: [
      { amount: 1, weight: 42 },
      { amount: 2, weight: 32 },
      { amount: 3, weight: 18 },
      { amount: 5, weight: 8 },
    ],
  },
  supply_drop: {
    chance: 0.85,
    weights: [
      { amount: 1, weight: 48 },
      { amount: 2, weight: 30 },
      { amount: 3, weight: 16 },
      { amount: 4, weight: 6 },
    ],
  },
  seed_pack: {
    chance: 1,
    weights: [
      { amount: 1, weight: 50 },
      { amount: 2, weight: 28 },
      { amount: 3, weight: 14 },
      { amount: 4, weight: 6 },
      { amount: 5, weight: 2 },
    ],
  },
  flash_harvest: {
    chance: 0.06,
    weights: [
      { amount: 1, weight: 80 },
      { amount: 2, weight: 16 },
      { amount: 3, weight: 4 },
    ],
  },
  calm_growth: {
    chance: 0.04,
    weights: [
      { amount: 1, weight: 82 },
      { amount: 2, weight: 18 },
    ],
  },
  overgrowth: {
    chance: 0.12,
    weights: [
      { amount: 1, weight: 60 },
      { amount: 2, weight: 28 },
      { amount: 4, weight: 12 },
    ],
  },
  seed_bloom: {
    chance: 1,
    weights: [
      { amount: 1, weight: 42 },
      { amount: 2, weight: 30 },
      { amount: 3, weight: 18 },
      { amount: 5, weight: 10 },
    ],
  },
  tiny_spark: {
    chance: 0.025,
    weights: [
      { amount: 1, weight: 92 },
      { amount: 2, weight: 8 },
    ],
  },
  dew_drop: {
    chance: 0.05,
    weights: [
      { amount: 1, weight: 86 },
      { amount: 2, weight: 14 },
    ],
  },
  compost_cache: {
    chance: 0.04,
    weights: [
      { amount: 1, weight: 82 },
      { amount: 2, weight: 16 },
      { amount: 3, weight: 2 },
    ],
  },
  sunbeam: {
    chance: 0.045,
    weights: [
      { amount: 1, weight: 82 },
      { amount: 2, weight: 18 },
    ],
  },
  mega_bud: {
    chance: 0.16,
    weights: [
      { amount: 1, weight: 64 },
      { amount: 2, weight: 25 },
      { amount: 4, weight: 11 },
    ],
  },
  jackpot_canopy: {
    chance: 0.35,
    weights: [
      { amount: 2, weight: 48 },
      { amount: 3, weight: 28 },
      { amount: 5, weight: 24 },
    ],
  },
  aurora_bloom: {
    chance: 0.22,
    weights: [
      { amount: 1, weight: 58 },
      { amount: 2, weight: 26 },
      { amount: 4, weight: 16 },
    ],
  },
  trail_marker: {
    chance: 0.05,
    weights: [
      { amount: 1, weight: 84 },
      { amount: 2, weight: 16 },
    ],
  },
  cascade_bloom: {
    chance: 0.09,
    weights: [
      { amount: 1, weight: 72 },
      { amount: 2, weight: 22 },
      { amount: 3, weight: 6 },
    ],
  },
  echo_harvest: {
    chance: 0.16,
    weights: [
      { amount: 1, weight: 60 },
      { amount: 2, weight: 28 },
      { amount: 4, weight: 12 },
    ],
  },
  volatile_growth: {
    chance: 0.14,
    weights: [
      { amount: 1, weight: 66 },
      { amount: 2, weight: 24 },
      { amount: 3, weight: 10 },
    ],
  },
  blackout_sale: {
    chance: 0.12,
    weights: [
      { amount: 1, weight: 70 },
      { amount: 2, weight: 24 },
      { amount: 3, weight: 6 },
    ],
  },
  pest_scare: {
    chance: 0.08,
    weights: [
      { amount: 1, weight: 78 },
      { amount: 2, weight: 18 },
      { amount: 3, weight: 4 },
    ],
  },
  solstice_seed: {
    chance: 1,
    weights: [
      { amount: 1, weight: 46 },
      { amount: 2, weight: 34 },
      { amount: 3, weight: 14 },
      { amount: 5, weight: 6 },
    ],
  },
  night_market: {
    chance: 0.28,
    weights: [
      { amount: 1, weight: 58 },
      { amount: 2, weight: 28 },
      { amount: 4, weight: 14 },
    ],
  },
  festival_lantern: {
    chance: 0.45,
    weights: [
      { amount: 2, weight: 48 },
      { amount: 3, weight: 30 },
      { amount: 5, weight: 22 },
    ],
  },
};

export interface EventQueueEntry {
  id: EventId;
  token: string;
  scheduledAt: number;
  priority: number;
  pity: boolean;
}

export interface ActiveEventEntry extends EventQueueEntry {
  spawnedAt: number;
  expiresAt: number;
  lifetimeMs: number;
}

export type EventHistoryOutcome = 'clicked' | 'expired' | 'cancelled';

interface EventRewardSummary {
  budGain?: string;
  seedGain?: number;
  multiplier?: number;
  durationMs?: number;
  target?: EventBoostTarget;
}

export interface EventHistoryEntry {
  id: EventId;
  token: string;
  scheduledAt: number;
  spawnedAt: number;
  resolvedAt: number;
  pity: boolean;
  outcome: EventHistoryOutcome;
  reward?: EventRewardSummary;
}

export interface EventStatsPerEvent {
  spawns: number;
  clicks: number;
  expired: number;
  pityActivations: number;
  clickRate: number;
  lastSpawnAt: number;
  lastClickAt: number;
}

export interface EventStats {
  totalSpawns: number;
  totalClicks: number;
  totalExpired: number;
  pityActivations: number;
  pityTimerMs: number;
  pityByCategory: Partial<Record<EventCategory, number>>;
  clickRate: number;
  lastSpawnAt: number;
  lastClickAt: number;
  perEvent: Partial<Record<EventId, EventStatsPerEvent>>;
}

export interface EventRuntimeState {
  queue: EventQueueEntry[];
  active: ActiveEventEntry[];
  history: EventHistoryEntry[];
  weights: Record<EventId, number>;
  cooldowns: Partial<Record<EventId, number>>;
}

export interface EventEnqueueOptions {
  scheduledAt?: number;
  priority?: number;
  pity?: boolean;
}

export interface EventClickResolution {
  event: ActiveEventEntry;
  result: EventClickResult;
}

let eventSerial = 0;

function createEventToken(seed: number): string {
  eventSerial = (eventSerial + 1) % Number.MAX_SAFE_INTEGER;
  const random = Math.random().toString(36).slice(2, 6);
  return `evt_${seed.toString(36)}_${eventSerial.toString(36)}_${random}`;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getEventSpawnRateMult(state: GameState): number {
  const value = state.temp.eventSpawnRateMult ?? 1;
  const ability = abilityMultiplierFor(state, 'event');
  const combined = (Number.isFinite(value) ? value : 1) * (Number.isFinite(ability) ? ability : 1);
  return Math.max(0.5, Math.min(3.5, combined));
}

function getEventDurationMult(state: GameState): number {
  const value = state.temp.eventDurationMult ?? 1;
  return Number.isFinite(value) ? Math.max(0.5, Math.min(2.5, value)) : 1;
}

function scaleSpawnDelay(state: GameState, delay: number): number {
  return Math.max(1_000, delay / getEventSpawnRateMult(state));
}

function getMaxActiveEvents(state: GameState): number {
  if (
    state.total.greaterThanOrEqualTo(2_500_000) ||
    state.researchOwned.includes('r_event_scouts')
  ) {
    return 2;
  }

  return 1;
}

function compareQueueEntries(a: EventQueueEntry, b: EventQueueEntry): number {
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }
  if (a.scheduledAt !== b.scheduledAt) {
    return a.scheduledAt - b.scheduledAt;
  }
  return a.token.localeCompare(b.token);
}

function clampTimer(value: number): number {
  return Math.max(0, Math.min(3_600_000, value));
}

export function createDefaultEventState(now = Date.now()): EventRuntimeState {
  const weights = { ...DEFAULT_EVENT_WEIGHTS } satisfies Record<EventId, number>;
  const queue: EventQueueEntry[] = [];
  for (let i = 0; i < EVENT_QUEUE_TARGET_SIZE; i += 1) {
    const delay = randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);
    const scheduledAt = now + Math.round(delay) + i * 250;
    queue.push({
      id: pickEventIdFromWeights(weights),
      token: createEventToken(scheduledAt + i),
      scheduledAt,
      priority: 0,
      pity: false,
    });
  }
  queue.sort(compareQueueEntries);
  return {
    queue,
    active: [],
    history: [],
    weights,
    cooldowns: {},
  } satisfies EventRuntimeState;
}

export function createDefaultEventStats(now = Date.now()): EventStats {
  return {
    totalSpawns: 0,
    totalClicks: 0,
    totalExpired: 0,
    pityActivations: 0,
    pityTimerMs: 0,
    pityByCategory: {},
    clickRate: 0,
    lastSpawnAt: now,
    lastClickAt: 0,
    perEvent: {},
  } satisfies EventStats;
}

function pickEventIdFromWeights(
  weights: Record<EventId, number>,
  ids: EventId[] = EVENT_IDS,
): EventId {
  const safeIds = ids.length > 0 ? ids : EVENT_IDS;
  const weightValues = safeIds.map((id) =>
    Math.max(0, weights[id] ?? DEFAULT_EVENT_WEIGHTS[id] ?? 0),
  );
  const total = weightValues.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return safeIds[Math.floor(Math.random() * safeIds.length)];
  }
  let roll = Math.random() * total;
  for (let i = 0; i < safeIds.length; i += 1) {
    roll -= weightValues[i];
    if (roll <= 0) {
      return safeIds[i];
    }
  }
  return safeIds[safeIds.length - 1];
}

export function enqueueEvent(
  state: GameState,
  id: EventId,
  options: EventEnqueueOptions = {},
): EventQueueEntry {
  const now = Date.now();
  const scheduledAt = Math.max(now, Math.floor(options.scheduledAt ?? now));
  const entry: EventQueueEntry = {
    id,
    token: createEventToken(scheduledAt),
    scheduledAt,
    priority: options.priority ?? 0,
    pity: !!options.pity,
  };
  state.events.queue.push(entry);
  state.events.queue.sort(compareQueueEntries);
  return entry;
}

export function dequeueEvent(state: GameState, token?: string): EventQueueEntry | undefined {
  if (token) {
    const index = state.events.queue.findIndex((entry) => entry.token === token);
    if (index === -1) {
      return undefined;
    }
    const [removed] = state.events.queue.splice(index, 1);
    return removed;
  }
  return state.events.queue.shift();
}

export function setEventWeight(state: GameState, id: EventId, weight: number): void {
  const safe = Number.isFinite(weight) && weight > 0 ? weight : 0;
  state.events.weights[id] = safe;
}

export function resetEventWeights(state: GameState): void {
  for (const id of EVENT_IDS) {
    state.events.weights[id] = DEFAULT_EVENT_WEIGHTS[id];
  }
}

export function getEventCooldown(state: GameState, id: EventId): number {
  return state.events.cooldowns[id] ?? 0;
}

export function setEventCooldown(state: GameState, id: EventId, readyAt: number): void {
  state.events.cooldowns[id] = Math.max(0, Math.floor(readyAt));
}

export function advanceEventPipeline(
  state: GameState,
  deltaSeconds: number,
  now = Date.now(),
): void {
  const stats = state.meta.eventStats;
  if (state.events.active.length === 0) {
    const elapsedMs = Math.max(0, Math.round(deltaSeconds * 1000));
    stats.pityTimerMs = clampTimer(stats.pityTimerMs + elapsedMs);
    tickEventPityTimers(stats, elapsedMs);
  }
  expireEvents(state, now);
  spawnDueEvents(state, now);
  ensureQueueCapacity(state, now);
}

function tickEventPityTimers(stats: EventStats, elapsedMs: number): void {
  const timers = getMutablePityByCategory(stats);
  for (const category of Object.keys(EVENT_CATEGORY_PITY_MS) as EventCategory[]) {
    timers[category] = clampTimer((timers[category] ?? 0) + elapsedMs);
  }
}

function getMutablePityByCategory(stats: EventStats): Partial<Record<EventCategory, number>> {
  if (!stats.pityByCategory || typeof stats.pityByCategory !== 'object') {
    stats.pityByCategory = {};
  }
  return stats.pityByCategory;
}

function resetPityForCategory(stats: EventStats, category: EventCategory): void {
  getMutablePityByCategory(stats)[category] = 0;
}

function expireEvents(state: GameState, now: number): void {
  if (state.events.active.length === 0) {
    return;
  }
  const remaining: ActiveEventEntry[] = [];
  for (const active of state.events.active) {
    if (active.expiresAt > now) {
      remaining.push(active);
      continue;
    }
    recordExpiry(state, active, now);
  }
  state.events.active = remaining;
}

function spawnDueEvents(state: GameState, now: number): void {
  const maxActiveEvents = getMaxActiveEvents(state);
  if (state.events.active.length >= maxActiveEvents) {
    return;
  }
  if (!isEarlyEventGateOpen(state, now)) {
    return;
  }
  state.events.queue.sort(compareQueueEntries);
  let spawned = false;
  while (state.events.active.length < maxActiveEvents && state.events.queue.length > 0) {
    const next = state.events.queue[0];
    if (!next || next.scheduledAt > now) {
      break;
    }
    state.events.queue.shift();
    if (!isEventStageEligible(state, next.id)) {
      enqueueEvent(state, pickWeightedEventId(state, now + 2_000), {
        scheduledAt: now + Math.round(scaleSpawnDelay(state, randomBetween(2_000, 6_000))),
      });
      continue;
    }
    const lifetime = Math.round(
      randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS) * getEventDurationMult(state),
    );
    const active: ActiveEventEntry = {
      ...next,
      spawnedAt: now,
      expiresAt: now + lifetime,
      lifetimeMs: lifetime,
    };
    state.events.active.push(active);
    recordSpawn(state, active, now);
    spawned = true;
  }
  if (spawned) {
    state.events.queue.sort(compareQueueEntries);
  }
}

function isEarlyEventGateOpen(state: GameState, now: number): boolean {
  const ownsAnyItem = Object.values(state.items).some((amount) => (amount ?? 0) > 0);
  if (ownsAnyItem || state.total.greaterThanOrEqualTo(120)) {
    return true;
  }

  const runStartedAt = state.prestige.lastResetAt || state.time || now;
  return now - runStartedAt >= FIRST_EVENT_MIN_MS;
}

function ensureQueueCapacity(state: GameState, now: number): void {
  const queue = state.events.queue;
  const stats = state.meta.eventStats;
  while (queue.length < EVENT_QUEUE_TARGET_SIZE) {
    const hasPendingPity = queue.some((entry) => entry.pity);
    const pityThreshold = EVENT_PITY_THRESHOLD_MS / getEventSpawnRateMult(state);
    const pityCategory = !hasPendingPity ? pickPityCategory(state, pityThreshold) : null;
    const pityReady =
      Boolean(pityCategory) || (!hasPendingPity && stats.pityTimerMs >= pityThreshold);
    const immediate = pityReady || queue.length === 0;
    const rawDelay = immediate
      ? randomBetween(1_500, 3_500)
      : randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);
    const delay = scaleSpawnDelay(state, rawDelay);
    const scheduledAt = now + Math.round(delay);
    const id = pityCategory
      ? pickWeightedEventId(state, scheduledAt, pityCategory)
      : pickWeightedEventId(state, scheduledAt);
    enqueueEvent(state, id, {
      scheduledAt,
      priority: pityCategory ? EVENT_CATEGORY_PRIORITY[pityCategory] : pityReady ? 5 : 0,
      pity: pityReady,
    });
  }
}

function pickPityCategory(state: GameState, fallbackThreshold: number): EventCategory | null {
  const timers = getMutablePityByCategory(state.meta.eventStats);
  const categories = (Object.keys(EVENT_CATEGORY_PITY_MS) as EventCategory[]).sort(
    (a, b) => EVENT_CATEGORY_PRIORITY[b] - EVENT_CATEGORY_PRIORITY[a],
  );
  const rate = getEventSpawnRateMult(state);
  for (const category of categories) {
    const threshold = Math.max(fallbackThreshold, EVENT_CATEGORY_PITY_MS[category] / rate);
    if ((timers[category] ?? 0) < threshold) {
      continue;
    }
    const eligible = getEligibleEventIds(state, Date.now(), category);
    if (eligible.length > 0) {
      return category;
    }
  }
  return null;
}

function pickWeightedEventId(
  state: GameState,
  scheduledAt: number,
  category?: EventCategory,
): EventId {
  const queue = state.events;
  const eligible = getEligibleEventIds(state, scheduledAt, category);
  if (eligible.length === 0) {
    return pickEventIdFromWeights(queue.weights);
  }
  const weights: Record<EventId, number> = { ...queue.weights };
  for (const id of EVENT_IDS) {
    if (!(id in weights)) {
      weights[id] = DEFAULT_EVENT_WEIGHTS[id];
    }
    weights[id] = Math.max(0, weights[id] * getEventQualityWeightMultiplier(state, id));
  }
  return pickEventIdFromWeights(weights, eligible);
}

function getEventQualityWeightMultiplier(state: GameState, id: EventId): number {
  const category = EVENT_DEFINITIONS[id].category;
  let multiplier = 1;
  if (category === 'major' || category === 'seasonal') {
    if (state.upgrades.event_spotters) {
      multiplier *= 1.12;
    }
    if (state.researchOwned.includes('r_event_quality_control')) {
      multiplier *= 1.16;
    }
  }
  if (category === 'chain') {
    if (state.upgrades.event_magnet_array) {
      multiplier *= 1.14;
    }
    if (state.researchOwned.includes('r_event_chain_study')) {
      multiplier *= 1.18;
    }
  }
  if (category === 'risk' && state.researchOwned.includes('r_event_quality_control')) {
    multiplier *= 0.92;
  }
  return multiplier;
}

function getEligibleEventIds(
  state: GameState,
  scheduledAt: number,
  category?: EventCategory,
): EventId[] {
  const queue = state.events;
  return EVENT_IDS.filter((id) => {
    if (category && EVENT_DEFINITIONS[id].category !== category) {
      return false;
    }
    if ((queue.cooldowns[id] ?? 0) > scheduledAt) {
      return false;
    }

    return isEventStageEligible(state, id);
  });
}

function isEventStageEligible(state: GameState, id: EventId): boolean {
  const definition = EVENT_DEFINITIONS[id];
  const prestigeSeeds = state.prestige.totalSeeds ?? 0;
  if (definition.minPrestigeSeeds && prestigeSeeds >= definition.minPrestigeSeeds) {
    return true;
  }
  if (definition.minTotalBuds && !state.total.greaterThanOrEqualTo(definition.minTotalBuds)) {
    return false;
  }
  return true;
}

function recordSpawn(state: GameState, event: ActiveEventEntry, now: number): void {
  const cooldown = Math.max(event.lifetimeMs, EVENT_COOLDOWN_BUFFER_MS);
  setEventCooldown(state, event.id, now + cooldown);
  const stats = state.meta.eventStats;
  stats.totalSpawns += 1;
  stats.lastSpawnAt = now;
  if (event.pity) {
    stats.pityActivations += 1;
  }
  stats.pityTimerMs = 0;
  resetPityForCategory(stats, EVENT_DEFINITIONS[event.id].category);
  stats.clickRate = computeClickRate(stats.totalClicks, stats.totalSpawns);
  const per = getOrCreatePerEvent(stats, event.id);
  per.spawns += 1;
  per.lastSpawnAt = now;
  if (event.pity) {
    per.pityActivations += 1;
  }
  per.clickRate = computeClickRate(per.clicks, per.spawns);
}

function recordExpiry(state: GameState, event: ActiveEventEntry, now: number): void {
  pushHistory(state, {
    id: event.id,
    token: event.token,
    scheduledAt: event.scheduledAt,
    spawnedAt: event.spawnedAt,
    resolvedAt: now,
    pity: event.pity,
    outcome: 'expired',
  });
  const stats = state.meta.eventStats;
  stats.totalExpired += 1;
  const per = getOrCreatePerEvent(stats, event.id);
  per.expired += 1;
}

function getOrCreatePerEvent(stats: EventStats, id: EventId): EventStatsPerEvent {
  const existing = stats.perEvent[id];
  if (existing) {
    return existing;
  }
  const created: EventStatsPerEvent = {
    spawns: 0,
    clicks: 0,
    expired: 0,
    pityActivations: 0,
    clickRate: 0,
    lastSpawnAt: 0,
    lastClickAt: 0,
  };
  stats.perEvent[id] = created;
  return created;
}

function computeClickRate(clicks: number, spawns: number): number {
  if (spawns <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, clicks / spawns));
}

function pushHistory(state: GameState, entry: EventHistoryEntry): void {
  state.events.history.push(entry);
  if (state.events.history.length > EVENT_HISTORY_LIMIT) {
    state.events.history.splice(0, state.events.history.length - EVENT_HISTORY_LIMIT);
  }
}

function summariseReward(result: EventClickResult): EventRewardSummary | undefined {
  const summary: EventRewardSummary = {};
  if (result.budGain) {
    summary.budGain = result.budGain.toString();
  }
  if (typeof result.seedGain === 'number') {
    summary.seedGain = result.seedGain;
  }
  if (typeof result.multiplier === 'number') {
    summary.multiplier = result.multiplier;
  }
  if (typeof result.durationMs === 'number') {
    summary.durationMs = result.durationMs;
  }
  if (result.target) {
    summary.target = result.target;
  }
  return Object.keys(summary).length > 0 ? summary : undefined;
}

function recordClick(
  state: GameState,
  event: ActiveEventEntry,
  result: EventClickResult,
  now: number,
): void {
  pushHistory(state, {
    id: event.id,
    token: event.token,
    scheduledAt: event.scheduledAt,
    spawnedAt: event.spawnedAt,
    resolvedAt: now,
    pity: event.pity,
    outcome: 'clicked',
    reward: summariseReward(result),
  });
  const stats = state.meta.eventStats;
  stats.totalClicks += 1;
  stats.lastClickAt = now;
  stats.pityTimerMs = 0;
  resetPityForCategory(stats, EVENT_DEFINITIONS[event.id].category);
  stats.clickRate = computeClickRate(stats.totalClicks, stats.totalSpawns);
  const per = getOrCreatePerEvent(stats, event.id);
  per.clicks += 1;
  per.lastClickAt = now;
  per.clickRate = computeClickRate(per.clicks, per.spawns);
}

export function resolveEventClick(
  state: GameState,
  token: string,
  now = Date.now(),
): EventClickResolution | null {
  const index = state.events.active.findIndex((entry) => entry.token === token);
  if (index === -1) {
    return null;
  }
  const [event] = state.events.active.splice(index, 1);
  const result = applyEventReward(state, event.id, now);
  if (result.requiresRecalc) {
    state.temp.needsRecalc = true;
  }
  recordClick(state, event, result, now);
  ensureQueueCapacity(state, now);
  return { event, result } satisfies EventClickResolution;
}

export interface EventClickResult {
  id: EventId;
  budGain?: Decimal;
  seedGain?: number;
  multiplier?: number;
  durationMs?: number;
  target?: EventBoostTarget;
  chainTriggered?: boolean;
  riskOutcome?: 'win' | 'soft_fail';
  requiresRecalc: boolean;
}

export function applyEventReward(
  state: GameState,
  id: EventId,
  now = Date.now(),
): EventClickResult {
  switch (id) {
    case 'golden_bud': {
      const gain = grantScaledBudReward(state, GOLDEN_BUD_SECONDS);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'seed_pack': {
      const seeds = grantEventSeeds(state, id, now);

      return {
        id,
        seedGain: seeds || undefined,
        requiresRecalc: seeds > 0,
      } satisfies EventClickResult;
    }

    case 'lucky_joint': {
      const durationMs = applyEventBoost(
        state,
        id,
        LUCKY_JOINT_MULTIPLIER,
        LUCKY_JOINT_DURATION_MS,
        now,
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        multiplier: LUCKY_JOINT_MULTIPLIER,
        durationMs,
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'fertile_rain': {
      const gain = grantScaledBudReward(state, FERTILE_RAIN_SECONDS);
      const durationMs = applyEventBoost(state, id, 1.25, 12_000, now, 'bps');
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 1.25,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'market_rush': {
      const durationMs = applyEventBoost(
        state,
        id,
        MARKET_RUSH_MULTIPLIER,
        MARKET_RUSH_DURATION_MS,
        now,
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        multiplier: MARKET_RUSH_MULTIPLIER,
        durationMs,
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'green_surge': {
      const durationMs = applyEventBoost(
        state,
        id,
        GREEN_SURGE_MULTIPLIER,
        GREEN_SURGE_DURATION_MS,
        now,
        'bpc',
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        multiplier: GREEN_SURGE_MULTIPLIER,
        durationMs,
        target: 'bpc',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'mutant_sprout': {
      const gain = grantScaledBudReward(state, MUTANT_SPROUT_SECONDS);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'supply_drop': {
      const gain = grantScaledBudReward(state, SUPPLY_DROP_SECONDS);
      const durationMs = applyEventBoost(
        state,
        id,
        SUPPLY_DROP_DISCOUNT,
        SUPPLY_DROP_DURATION_MS,
        now,
        'cost',
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: SUPPLY_DROP_DISCOUNT,
        durationMs,
        target: 'cost',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'flash_harvest': {
      const gain = grantScaledBudReward(state, FLASH_HARVEST_SECONDS);
      enqueueEvent(state, 'golden_bud', { scheduledAt: now + 700, priority: 8 });
      enqueueEvent(state, 'golden_bud', { scheduledAt: now + 1_500, priority: 7 });
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'calm_growth': {
      const idleMs = now - (state.meta.lastInteractionAt || now);
      const multiplier = idleMs >= 15_000 ? 2.2 : CALM_GROWTH_MULTIPLIER;
      const durationMs = applyEventBoost(
        state,
        id,
        multiplier,
        CALM_GROWTH_DURATION_MS,
        now,
        'bps',
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        multiplier,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'overgrowth': {
      const gain = grantScaledBudReward(state, OVERGROWTH_SECONDS);
      const durationMs = applyEventBoost(
        state,
        id,
        OVERGROWTH_MULTIPLIER,
        OVERGROWTH_DURATION_MS,
        now,
        'bps',
      );
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: OVERGROWTH_MULTIPLIER,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'seed_bloom': {
      const durationMs = applyEventBoost(
        state,
        id,
        SEED_BLOOM_MULTIPLIER,
        SEED_BLOOM_DURATION_MS,
        now,
        'bpc',
      );
      let seedDrop = grantEventSeeds(state, id, now);
      if (seedDrop <= 0) {
        seedDrop = awardSeeds(state, 1, 'event', now);
      }

      return {
        id,
        multiplier: SEED_BLOOM_MULTIPLIER,
        durationMs,
        target: 'bpc',
        seedGain: seedDrop,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'tiny_spark': {
      const gain = grantScaledBudReward(state, 5);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'dew_drop': {
      const gain = grantScaledBudReward(state, 7);
      const durationMs = applyEventBoost(state, id, 1.12, 8_000, now, 'bps');
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 1.12,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'compost_cache': {
      const gain = grantScaledBudReward(state, 8);
      const durationMs = applyEventBoost(state, id, 0.92, 12_000, now, 'cost');
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 0.92,
        durationMs,
        target: 'cost',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'sunbeam': {
      const durationMs = applyEventBoost(state, id, 1.45, 14_000, now, 'bpc');
      const gain = grantScaledBudReward(state, 4);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 1.45,
        durationMs,
        target: 'bpc',
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'mega_bud': {
      const gain = grantScaledBudReward(state, 42);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'jackpot_canopy': {
      const gain = grantScaledBudReward(state, 70);
      let seedDrop = grantEventSeeds(state, id, now);
      if (seedDrop <= 0) {
        seedDrop = awardSeeds(state, 2, 'event', now);
      }

      return {
        id,
        budGain: gain,
        seedGain: seedDrop,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'aurora_bloom': {
      const gain = grantScaledBudReward(state, 18);
      const durationMs = applyEventBoost(state, id, 2.05, 18_000, now);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 2.05,
        durationMs,
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'trail_marker': {
      const gain = grantScaledBudReward(state, 9);
      const chained = enqueueChainEvent(state, id, now);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        chainTriggered: chained,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'cascade_bloom': {
      const gain = grantScaledBudReward(state, 12);
      const durationMs = applyEventBoost(state, id, 1.5, 12_000, now, 'bps');
      const chained = enqueueChainEvent(state, id, now);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 1.5,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        chainTriggered: chained,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'echo_harvest': {
      const gain = grantScaledBudReward(state, 24);
      let seedDrop = grantEventSeeds(state, id, now);
      if (seedDrop <= 0 && Math.random() < 0.35) {
        seedDrop = awardSeeds(state, 1, 'event', now);
      }

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc: seedDrop > 0,
      } satisfies EventClickResult;
    }

    case 'volatile_growth': {
      const win = Math.random() < getRiskWinChance(state, 0.68);
      const gain = grantScaledBudReward(state, win ? 52 : 7);
      const multiplier = win ? 1.75 : 0.82;
      const durationMs = applyEventBoost(state, id, multiplier, win ? 16_000 : 10_000, now, 'bps');
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier,
        durationMs,
        target: 'bps',
        seedGain: seedDrop || undefined,
        riskOutcome: win ? 'win' : 'soft_fail',
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'blackout_sale': {
      const win = Math.random() < getRiskWinChance(state, 0.72);
      const multiplier = win ? 0.72 : 1.08;
      const durationMs = applyEventBoost(state, id, multiplier, win ? 16_000 : 9_000, now, 'cost');
      const gain = grantScaledBudReward(state, win ? 10 : 4);
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier,
        durationMs,
        target: 'cost',
        seedGain: seedDrop || undefined,
        riskOutcome: win ? 'win' : 'soft_fail',
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'pest_scare': {
      const win = Math.random() < getRiskWinChance(state, 0.76);
      const gain = grantScaledBudReward(state, win ? 14 : 5);
      const durationMs = applyEventBoost(state, id, win ? 1.18 : 0.9, 11_000, now, 'bpc');
      let seedDrop = grantEventSeeds(state, id, now);
      if (win && seedDrop <= 0 && Math.random() < 0.22) {
        seedDrop = awardSeeds(state, 1, 'event', now);
      }

      return {
        id,
        budGain: gain,
        multiplier: win ? 1.18 : 0.9,
        durationMs,
        target: 'bpc',
        seedGain: seedDrop || undefined,
        riskOutcome: win ? 'win' : 'soft_fail',
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'solstice_seed': {
      const gain = grantScaledBudReward(state, 12);
      const durationMs = applyEventBoost(state, id, 1.45, 20_000, now, 'bps');
      let seedDrop = grantEventSeeds(state, id, now);
      if (seedDrop <= 0) {
        seedDrop = awardSeeds(state, 1, 'event', now);
      }

      return {
        id,
        budGain: gain,
        multiplier: 1.45,
        durationMs,
        target: 'bps',
        seedGain: seedDrop,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'night_market': {
      const gain = grantScaledBudReward(state, 12);
      const durationMs = applyEventBoost(state, id, 0.76, 18_000, now, 'cost');
      const chained = Math.random() < 0.45;
      if (chained) {
        enqueueEvent(state, 'supply_drop', {
          scheduledAt: now + EVENT_CHAIN_DELAY_MS,
          priority: EVENT_CATEGORY_PRIORITY.seasonal,
        });
      }
      const seedDrop = grantEventSeeds(state, id, now);

      return {
        id,
        budGain: gain,
        multiplier: 0.76,
        durationMs,
        target: 'cost',
        seedGain: seedDrop || undefined,
        chainTriggered: chained,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    case 'festival_lantern': {
      const gain = grantScaledBudReward(state, 35);
      const durationMs = applyEventBoost(state, id, 1.7, 22_000, now);
      enqueueEvent(state, 'golden_bud', {
        scheduledAt: now + EVENT_CHAIN_DELAY_MS,
        priority: EVENT_CATEGORY_PRIORITY.seasonal,
      });
      let seedDrop = grantEventSeeds(state, id, now);
      if (seedDrop <= 0) {
        seedDrop = awardSeeds(state, 1, 'event', now);
      }

      return {
        id,
        budGain: gain,
        multiplier: 1.7,
        durationMs,
        seedGain: seedDrop,
        chainTriggered: true,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    default:
      return { id, requiresRecalc: false } satisfies EventClickResult;
  }
}

function enqueueChainEvent(state: GameState, id: EventId, now: number): boolean {
  const definition = EVENT_DEFINITIONS[id];
  if (!definition.chainNext) {
    return false;
  }
  if (Math.random() > getChainChance(state, definition)) {
    return false;
  }
  enqueueEvent(state, definition.chainNext, {
    scheduledAt: now + EVENT_CHAIN_DELAY_MS,
    priority: EVENT_CATEGORY_PRIORITY.chain,
  });
  return true;
}

function getChainChance(state: GameState, definition: EventDefinition): number {
  let chance = definition.chainChance ?? 1;
  if (state.upgrades.event_magnet_array) {
    chance += 0.05;
  }
  if (state.researchOwned.includes('r_event_chain_study')) {
    chance += 0.08;
  }
  if (state.researchOwned.includes('r_event_quality_control')) {
    chance += 0.04;
  }
  return Math.max(0, Math.min(0.95, chance));
}

function getRiskWinChance(state: GameState, baseChance: number): number {
  let chance = baseChance;
  if (state.upgrades.event_spotters) {
    chance += 0.03;
  }
  if (state.researchOwned.includes('r_event_quality_control')) {
    chance += 0.07;
  }
  if (state.researchOwned.includes('r_event_chain_study')) {
    chance += 0.03;
  }
  return Math.max(0.45, Math.min(0.92, chance));
}

function grantScaledBudReward(state: GameState, seconds: number): Decimal {
  const eventRewardMult = Math.max(1, state.temp.eventRewardMult ?? 1);
  let gain = state.bps.mul(seconds).mul(eventRewardMult);

  if (!gain.greaterThan(0)) {
    const fallback = state.bpc.mul(Math.max(4, Math.ceil(seconds * 0.45))).mul(eventRewardMult);
    gain = fallback.greaterThan(0) ? fallback : new Decimal(Math.max(4, Math.ceil(seconds * 0.45)));
  }

  state.buds = state.buds.add(gain);
  state.total = state.total.add(gain);
  state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gain);
  return gain;
}

function grantEventSeeds(state: GameState, id: EventId, now: number): number {
  const seedFocus = abilityMultiplierFor(state, 'seed');
  const multiplier = Math.max(1, (state.temp.eventRewardMult ?? 1) * seedFocus);
  const seeds = Math.max(0, Math.floor(rollEventSeeds(state, id) * multiplier));
  if (seeds > 0) {
    awardSeeds(state, seeds, 'event', now);
  }
  return seeds;
}

function applyEventBoost(
  state: GameState,
  id: EventId,
  multiplier: number,
  durationMs: number,
  now: number,
  target: EventBoostTarget = 'both',
): number {
  const effectiveDuration = Math.max(1_000, Math.round(durationMs * getEventDurationMult(state)));
  const boosts = getMutableEventBoosts(state).filter((boost) => boost.endsAt > now);
  const safeMultiplier = Number.isFinite(multiplier) ? Math.max(0.05, multiplier) : 1;
  const nextBoost: EventBoostState = {
    id,
    target,
    multiplier: safeMultiplier,
    startedAt: now,
    endsAt: now + effectiveDuration,
  };
  const existingIndex = boosts.findIndex((boost) => boost.id === id && boost.target === target);
  if (existingIndex >= 0) {
    boosts[existingIndex] = nextBoost;
  } else {
    boosts.push(nextBoost);
  }

  state.temp.eventBoosts = boosts;
  recomputeEventBoostMultipliers(state, now);
  return effectiveDuration;
}

export function clearExpiredEventBoost(state: GameState, now = Date.now()): boolean {
  const before = getMutableEventBoosts(state).length;
  recomputeEventBoostMultipliers(state, now);
  return getMutableEventBoosts(state).length !== before;
}

export function resetEventBoost(state: GameState): void {
  state.temp.eventBoosts = [];
  state.temp.eventBoostEndsAt = 0;
  state.temp.activeEventBoost = null;
  state.temp.eventBpsMult = new Decimal(1);
  state.temp.eventBpcMult = new Decimal(1);
  state.temp.eventCostMult = new Decimal(1);
}

export function getEventBoostRemaining(state: GameState, now = Date.now()): number {
  recomputeEventBoostMultipliers(state, now);
  if (state.temp.eventBoostEndsAt <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor((state.temp.eventBoostEndsAt - now) / 1000));
}

export function getActiveEventBoosts(
  state: GameState,
  now = Date.now(),
): { id: string; multiplier: number; target: EventBoostTarget; remainingSeconds: number }[] {
  recomputeEventBoostMultipliers(state, now);
  return getMutableEventBoosts(state).map((boost) => ({
    id: boost.id,
    multiplier: boost.multiplier,
    target: boost.target,
    remainingSeconds: Math.max(0, Math.ceil((boost.endsAt - now) / 1000)),
  }));
}

function getMutableEventBoosts(state: GameState): EventBoostState[] {
  if (!Array.isArray(state.temp.eventBoosts)) {
    state.temp.eventBoosts = [];
  }

  return state.temp.eventBoosts;
}

function recomputeEventBoostMultipliers(state: GameState, now = Date.now()): void {
  const activeBoosts = getMutableEventBoosts(state).filter(
    (boost): boost is EventBoostState =>
      !!boost &&
      typeof boost.id === 'string' &&
      typeof boost.target === 'string' &&
      Number.isFinite(boost.multiplier) &&
      Number.isFinite(boost.endsAt) &&
      boost.endsAt > now,
  );

  state.temp.eventBoosts = activeBoosts;

  let bpsMult = new Decimal(1);
  let bpcMult = new Decimal(1);
  let costMult = new Decimal(1);
  let latestBoost: EventBoostState | null = null;
  let latestEnd = 0;

  for (const boost of activeBoosts) {
    const multiplier = Math.max(0.05, boost.multiplier);
    if (boost.target === 'bps' || boost.target === 'both') {
      bpsMult = bpsMult.mul(multiplier);
    }
    if (boost.target === 'bpc' || boost.target === 'both') {
      bpcMult = bpcMult.mul(multiplier);
    }
    if (boost.target === 'cost') {
      costMult = costMult.mul(multiplier);
    }
    if (boost.endsAt >= latestEnd) {
      latestEnd = boost.endsAt;
      latestBoost = boost;
    }
  }

  state.temp.eventBpsMult = bpsMult;
  state.temp.eventBpcMult = bpcMult;
  state.temp.eventCostMult = costMult;
  state.temp.eventBoostEndsAt = latestEnd;
  state.temp.activeEventBoost = latestBoost?.id ?? null;
}

function rollEventSeeds(state: GameState, id: EventId): number {
  const config = EVENT_SEED_DROPS[id];
  if (!config) {
    return 0;
  }

  const cap = state.temp.seedRateCap || getSeedCap(state);
  const rate = state.temp.seedRatePerHour ?? 0;
  if (cap > 0 && rate >= cap) {
    return 0;
  }

  const chance = Math.max(0, Math.min(1, config.chance));
  if (chance < 1 && Math.random() >= chance) {
    return 0;
  }

  const totalWeight = config.weights.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return 0;
  }

  const roll = Math.random() * totalWeight;
  let accumulator = 0;
  for (const entry of config.weights) {
    accumulator += entry.weight;
    if (roll < accumulator) {
      return Math.max(1, Math.min(5, Math.floor(entry.amount)));
    }
  }

  const fallback = config.weights[config.weights.length - 1];
  return fallback ? Math.max(1, Math.min(5, Math.floor(fallback.amount))) : 0;
}
