import Decimal from "break_infinity.js";
import type { GameState } from "./state";
import { awardSeeds, getSeedCap } from "./seeds";

export type EventId = "golden_bud" | "seed_pack" | "lucky_joint";

const GOLDEN_BUD_SECONDS = 15;
const LUCKY_JOINT_MULTIPLIER = 2;
export const LUCKY_JOINT_DURATION_MS = 15_000;

const EVENT_SPAWN_MIN_MS = 10_000;
const EVENT_SPAWN_MAX_MS = 20_000;
const EVENT_VISIBLE_MIN_MS = 7_000;
const EVENT_VISIBLE_MAX_MS = 12_000;
const EVENT_QUEUE_TARGET_SIZE = 3;
const EVENT_HISTORY_LIMIT = 100;
const EVENT_COOLDOWN_BUFFER_MS = 5_000;
const EVENT_PITY_THRESHOLD_MS = 45_000;
const MAX_ACTIVE_EVENTS = 1;

const EVENT_IDS: EventId[] = ["golden_bud", "seed_pack", "lucky_joint"];

export const DEFAULT_EVENT_WEIGHTS: Record<EventId, number> = {
  golden_bud: 1,
  seed_pack: 0.6,
  lucky_joint: 1,
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
  lucky_joint: {
    chance: 0.04,
    weights: [
      { amount: 1, weight: 60 },
      { amount: 2, weight: 25 },
      { amount: 3, weight: 12 },
      { amount: 5, weight: 3 },
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

export type EventHistoryOutcome = "clicked" | "expired" | "cancelled";

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

function pickEventIdFromWeights(weights: Record<EventId, number>, ids: EventId[] = EVENT_IDS): EventId {
  const safeIds = ids.length > 0 ? ids : EVENT_IDS;
  const weightValues = safeIds.map((id) => Math.max(0, weights[id] ?? DEFAULT_EVENT_WEIGHTS[id] ?? 0));
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
    stats.pityTimerMs = clampTimer(stats.pityTimerMs + Math.max(0, Math.round(deltaSeconds * 1000)));
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
  if (state.events.active.length >= MAX_ACTIVE_EVENTS) {
    return;
  }
  state.events.queue.sort(compareQueueEntries);
  let spawned = false;
  while (state.events.active.length < MAX_ACTIVE_EVENTS && state.events.queue.length > 0) {
    const next = state.events.queue[0];
    if (!next || next.scheduledAt > now) {
      break;
    }
    state.events.queue.shift();
    const lifetime = Math.round(randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS));
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

function ensureQueueCapacity(state: GameState, now: number): void {
  const queue = state.events.queue;
  const stats = state.meta.eventStats;
  while (queue.length < EVENT_QUEUE_TARGET_SIZE) {
    const hasPendingPity = queue.some((entry) => entry.pity);
    const pityReady = !hasPendingPity && stats.pityTimerMs >= EVENT_PITY_THRESHOLD_MS;
    const immediate = pityReady || queue.length === 0;
    const delay = immediate ? randomBetween(1_500, 3_500) : randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);
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
  const eligible = EVENT_IDS.filter((id) => (queue.cooldowns[id] ?? 0) <= scheduledAt);
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
    outcome: "expired",
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
  if (typeof result.seedGain === "number") {
    summary.seedGain = result.seedGain;
  }
  if (typeof result.multiplier === "number") {
    summary.multiplier = result.multiplier;
  }
  if (typeof result.durationMs === "number") {
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
    outcome: "clicked",
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
    case "golden_bud": {
      const seconds = GOLDEN_BUD_SECONDS;
      let gain = state.bps.mul(seconds);

      if (!gain.greaterThan(0)) {
        const fallback = state.bpc.mul(seconds);
        gain = fallback.greaterThan(0) ? fallback : new Decimal(seconds);
      }

      state.buds = state.buds.add(gain);
      state.total = state.total.add(gain);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gain);

      const seedDrop = rollEventSeeds(state, id);
      let requiresRecalc = false;
      if (seedDrop > 0) {
        awardSeeds(state, seedDrop, "event", now);
        requiresRecalc = true;
      }

      return {
        id,
        budGain: gain,
        seedGain: seedDrop || undefined,
        requiresRecalc,
      } satisfies EventClickResult;
    }

    case "seed_pack": {
      const seeds = rollEventSeeds(state, id);
      if (seeds > 0) {
        awardSeeds(state, seeds, "event", now);
      }

      return {
        id,
        seedGain: seeds || undefined,
        requiresRecalc: seeds > 0,
      } satisfies EventClickResult;
    }

    case "lucky_joint": {
      const durationMs = LUCKY_JOINT_DURATION_MS;
      state.temp.activeEventBoost = id;
      state.temp.eventBoostEndsAt = now + durationMs;
      state.temp.eventBpsMult = new Decimal(LUCKY_JOINT_MULTIPLIER);
      state.temp.eventBpcMult = new Decimal(LUCKY_JOINT_MULTIPLIER);

      const seedDrop = rollEventSeeds(state, id);
      if (seedDrop > 0) {
        awardSeeds(state, seedDrop, "event", now);
      }

      return {
        id,
        multiplier: LUCKY_JOINT_MULTIPLIER,
        durationMs,
        seedGain: seedDrop || undefined,
        requiresRecalc: true,
      } satisfies EventClickResult;
    }

    default:
      return { id, requiresRecalc: false } satisfies EventClickResult;
  }
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
