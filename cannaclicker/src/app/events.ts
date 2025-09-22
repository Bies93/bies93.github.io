import Decimal from "break_infinity.js";
import type { GameState } from "./state";
import { updatePrestigeMultiplier } from "./prestige";

export type EventId = "golden_bud" | "seed_pack" | "lucky_joint";

const GOLDEN_BUD_SECONDS = 15;
const SEED_PACK_MIN = 2;
const SEED_PACK_MAX = 5;
const LUCKY_JOINT_MULTIPLIER = 2;
export const LUCKY_JOINT_DURATION_MS = 15000;

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

      return { id, budGain: gain, requiresRecalc: false } satisfies EventClickResult;
    }

    case "seed_pack": {
      const seeds = randomInt(SEED_PACK_MIN, SEED_PACK_MAX);
      state.prestige.seeds += seeds;
      updatePrestigeMultiplier(state);

      return { id, seedGain: seeds, requiresRecalc: true } satisfies EventClickResult;
    }

    case "lucky_joint": {
      const durationMs = LUCKY_JOINT_DURATION_MS;
      state.temp.activeEventBoost = id;
      state.temp.eventBoostEndsAt = now + durationMs;
      state.temp.eventBpsMult = new Decimal(LUCKY_JOINT_MULTIPLIER);
      state.temp.eventBpcMult = new Decimal(LUCKY_JOINT_MULTIPLIER);

      return {
        id,
        multiplier: LUCKY_JOINT_MULTIPLIER,
        durationMs,
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

function randomInt(min: number, max: number): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

