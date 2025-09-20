import Decimal from "break_infinity.js";
import { PRESTIGE_ALPHA, PRESTIGE_K, PRESTIGE_M, PRESTIGE_MIN_REQUIREMENT } from "./balance";
import { createDefaultState, type GameState } from "./state";
import { applyResearchEffects } from "./research";

export interface PrestigePreview {
  currentSeeds: number;
  gain: number;
  nextSeeds: number;
  currentMultiplier: Decimal;
  nextMultiplier: Decimal;
  requirementMet: boolean;
}

export function calculateSeedGain(lifetimeBuds: Decimal): number {
  if (!lifetimeBuds || lifetimeBuds.lessThanOrEqualTo(0)) {
    return 0;
  }

  const powered = lifetimeBuds.pow(PRESTIGE_ALPHA);
  const scaled = powered.div(PRESTIGE_K);
  return Math.max(0, Math.floor(scaled.toNumber()));
}

export function computePrestigeMultiplier(seeds: number): Decimal {
  const safeSeeds = Number.isFinite(seeds) ? Math.max(0, seeds) : 0;
  return new Decimal(1 + PRESTIGE_M * safeSeeds);
}

export function getPrestigePreview(state: GameState): PrestigePreview {
  const currentSeeds = Math.max(0, Math.floor(state.prestige.seeds));
  const requirementMet = state.prestige.lifetimeBuds.greaterThanOrEqualTo(PRESTIGE_MIN_REQUIREMENT);
  const gain = requirementMet ? calculateSeedGain(state.prestige.lifetimeBuds) : 0;
  const nextSeeds = currentSeeds + gain;
  const currentMultiplier = computePrestigeMultiplier(currentSeeds);
  const nextMultiplier = computePrestigeMultiplier(nextSeeds);

  return {
    currentSeeds,
    gain,
    nextSeeds,
    currentMultiplier,
    nextMultiplier,
    requirementMet,
  } satisfies PrestigePreview;
}

export function performPrestige(state: GameState): GameState {
  const preview = getPrestigePreview(state);
  if (!preview.requirementMet || preview.gain <= 0) {
    return state;
  }

  const now = Date.now();
  const seedsAfter = preview.nextSeeds;
  const multiplier = computePrestigeMultiplier(seedsAfter);

  const preserved: Partial<GameState> = {
    locale: state.locale,
    muted: state.muted,
    achievements: { ...state.achievements },
    researchOwned: [...state.researchOwned],
    preferences: state.preferences,
    automation: state.automation,
    prestige: {
      seeds: seedsAfter,
      mult: multiplier,
      lifetimeBuds: state.prestige.lifetimeBuds,
      lastResetAt: now,
      version: 1,
    },
  };

  const reset = createDefaultState(preserved);
  reset.total = new Decimal(0);
  reset.time = now;
  reset.lastSeenAt = now;
  reset.temp.offlineBuds = null;
  reset.temp.offlineDuration = 0;
  const nextState = Object.assign(state, reset);
  applyResearchEffects(nextState);
  return nextState;
}

export function updatePrestigeMultiplier(state: GameState): void {
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);
}


