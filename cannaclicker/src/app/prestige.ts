import Decimal from 'break_infinity.js';
import { createDefaultState, type GameState } from './state';

const PRESTIGE_COEFFICIENT = 0.001; // sqrt coefficient equivalent to /1000 after sqrt

export interface PrestigePreview {
  currentSeeds: number;
  potentialSeeds: number;
  gainedSeeds: number;
  currentMultiplier: Decimal;
  nextMultiplier: Decimal;
}

export function calculateSeedGain(lifetimeBuds: Decimal): number {
  if (lifetimeBuds.lessThanOrEqualTo(0)) {
    return 0;
  }

  const sqrt = lifetimeBuds.sqrt();
  return Math.max(0, Math.floor(sqrt.mul(PRESTIGE_COEFFICIENT).toNumber()));
}

export function computePrestigeMultiplier(seeds: number): Decimal {
  const safeSeeds = Number.isFinite(seeds) ? Math.max(0, seeds) : 0;
  return new Decimal(1).add(new Decimal(safeSeeds).mul(0.05));
}

export function getPrestigePreview(state: GameState): PrestigePreview {
  const currentSeeds = Math.max(0, Math.floor(state.prestige.seeds));
  const potential = calculateSeedGain(state.prestige.lifetimeBuds);
  const gainedSeeds = Math.max(0, potential - currentSeeds);
  const currentMultiplier = computePrestigeMultiplier(currentSeeds);
  const nextMultiplier = computePrestigeMultiplier(currentSeeds + gainedSeeds);

  return {
    currentSeeds,
    potentialSeeds: potential,
    gainedSeeds,
    currentMultiplier,
    nextMultiplier,
  } satisfies PrestigePreview;
}

export function performPrestige(state: GameState): GameState {
  const preview = getPrestigePreview(state);
  const now = Date.now();
  const seedsAfter = preview.potentialSeeds;
  const multiplier = computePrestigeMultiplier(seedsAfter);

  const preserved = {
    locale: state.locale,
    muted: state.muted,
    achievements: { ...state.achievements },
    researchOwned: [...state.researchOwned],
    prestige: {
      seeds: seedsAfter,
      mult: multiplier,
      lifetimeBuds: state.prestige.lifetimeBuds,
      lastResetAt: now,
    },
  } satisfies Partial<GameState>;

  const reset = createDefaultState(preserved);
  reset.total = new Decimal(0);
  reset.time = now;
  reset.lastSeenAt = now;
  reset.temp.offlineBuds = null;
  reset.temp.offlineDuration = 0;
  return Object.assign(state, reset);
}

export function updatePrestigeMultiplier(state: GameState): void {
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);
}
