import Decimal from 'break_infinity.js';
import type { GameState } from './state';
import { awardSeeds, getSeedCap } from './seeds';

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
  | 'seed_bloom';

const GOLDEN_BUD_SECONDS = 15;
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
const FIRST_EVENT_MIN_MS = 75_000;
const EVENT_VISIBLE_MIN_MS = 7_000;
const EVENT_VISIBLE_MAX_MS = 12_000;
const EVENT_QUEUE_TARGET_SIZE = 3;
const EVENT_HISTORY_LIMIT = 100;
const EVENT_COOLDOWN_BUFFER_MS = 5_000;
const EVENT_PITY_THRESHOLD_MS = 55_000;

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
};

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
  return Number.isFinite(value) ? Math.max(0.5, Math.min(2.5, value)) : 1;
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
    stats.pityTimerMs = clampTimer(
      stats.pityTimerMs + Math.max(0, Math.round(deltaSeconds * 1000)),
    );
  }
  expireEvents(state, now);
  spawnDueEvents(state, now);
  ensureQueueCapacity(state, now);
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
  if (ownsAnyItem || state.total.greaterThanOrEqualTo(60)) {
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
    const pityReady = !hasPendingPity && stats.pityTimerMs >= pityThreshold;
    const immediate = pityReady || queue.length === 0;
    const rawDelay = immediate
      ? randomBetween(1_500, 3_500)
      : randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);
    const delay = scaleSpawnDelay(state, rawDelay);
    const scheduledAt = now + Math.round(delay);
    const id = pickWeightedEventId(state, scheduledAt);
    enqueueEvent(state, id, {
      scheduledAt,
      priority: pityReady ? 10 : 0,
      pity: pityReady,
    });
  }
}

function pickWeightedEventId(state: GameState, scheduledAt: number): EventId {
  const queue = state.events;
  const eligible = EVENT_IDS.filter((id) => {
    if ((queue.cooldowns[id] ?? 0) > scheduledAt) {
      return false;
    }

    return isEventStageEligible(state, id);
  });
  if (eligible.length === 0) {
    return pickEventIdFromWeights(queue.weights);
  }
  const weights: Record<EventId, number> = { ...queue.weights };
  for (const id of EVENT_IDS) {
    if (!(id in weights)) {
      weights[id] = DEFAULT_EVENT_WEIGHTS[id];
    }
  }
  return pickEventIdFromWeights(weights, eligible);
}

function isEventStageEligible(state: GameState, id: EventId): boolean {
  const total = state.total;
  switch (id) {
    case 'mutant_sprout':
    case 'seed_bloom':
      return total.greaterThanOrEqualTo(50_000) || (state.prestige.totalSeeds ?? 0) > 0;
    case 'flash_harvest':
    case 'calm_growth':
      return total.greaterThanOrEqualTo(2_500);
    case 'overgrowth':
      return total.greaterThanOrEqualTo(250_000);
    default:
      return true;
  }
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
        seedGain: seedDrop,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    default:
      return { id, requiresRecalc: false } satisfies EventClickResult;
  }
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
  const multiplier = Math.max(1, state.temp.eventRewardMult ?? 1);
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
  target: 'bps' | 'bpc' | 'both' | 'cost' = 'both',
): number {
  const effectiveDuration = Math.round(durationMs * getEventDurationMult(state));
  state.temp.activeEventBoost = id;
  state.temp.eventBoostEndsAt = now + effectiveDuration;
  state.temp.eventBpsMult = new Decimal(target === 'bps' || target === 'both' ? multiplier : 1);
  state.temp.eventBpcMult = new Decimal(target === 'bpc' || target === 'both' ? multiplier : 1);
  state.temp.eventCostMult = new Decimal(target === 'cost' ? multiplier : 1);
  return effectiveDuration;
}

export function clearExpiredEventBoost(state: GameState, now = Date.now()): boolean {
  if (state.temp.eventBoostEndsAt > 0 && now >= state.temp.eventBoostEndsAt) {
    resetEventBoost(state);
    return true;
  }

  return false;
}

export function resetEventBoost(state: GameState): void {
  state.temp.eventBoostEndsAt = 0;
  state.temp.activeEventBoost = null;
  state.temp.eventBpsMult = new Decimal(1);
  state.temp.eventBpcMult = new Decimal(1);
  state.temp.eventCostMult = new Decimal(1);
}

export function getEventBoostRemaining(state: GameState, now = Date.now()): number {
  if (state.temp.eventBoostEndsAt <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor((state.temp.eventBoostEndsAt - now) / 1000));
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
