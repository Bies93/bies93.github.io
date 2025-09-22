import Decimal from "break_infinity.js";
import type { GameState } from "./state";
import { awardSeeds, getSeedCap } from "./seeds";

export type EventId = "golden_bud" | "seed_pack" | "lucky_joint";

const GOLDEN_BUD_SECONDS = 15;
const LUCKY_JOINT_MULTIPLIER = 2;
export const LUCKY_JOINT_DURATION_MS = 15000;

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

