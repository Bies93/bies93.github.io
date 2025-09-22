import Decimal from "break_infinity.js";
import { PRESTIGE_M, PRESTIGE_MIN_REQUIREMENT } from "./balance";
import { createDefaultState, type GameState } from "./state";
import { applyResearchEffects } from "./research";
import { researchById } from "../data/research";
import { activateKickstart, computeMilestones, getKickstartConfig, resolveKickstart } from "./milestones";

export interface PrestigePreview {
  requirementMet: boolean;
  requirementTarget: Decimal;
  lifetimeBuds: Decimal;
  permanentGlobalPercent: number;
  permanentBpsPercent: number;
  permanentBpcPercent: number;
  totalBpsPercent: number;
  totalBpcPercent: number;
  milestoneActiveCount: number;
  nextKickstartLevel: number;
  nextKickstartConfig: ReturnType<typeof getKickstartConfig>;
  activeKickstartLevel: number;
  activeKickstartRemainingMs: number;
  activeKickstartDurationMs: number;
  activeKickstartBpsMult: number;
  activeKickstartBpcMult: number;
  activeKickstartCostMult: number;
}

export function computePrestigeMultiplier(seeds: number): Decimal {
  const safeSeeds = Number.isFinite(seeds) ? Math.max(0, seeds) : 0;
  return new Decimal(1 + PRESTIGE_M * safeSeeds);
}

export function getPrestigePreview(state: GameState): PrestigePreview {
  const milestoneResult = computeMilestones(state);
  const milestoneEffects = milestoneResult.effects;
  const requirementTarget = new Decimal(PRESTIGE_MIN_REQUIREMENT);
  const lifetimeBuds = state.prestige.lifetimeBuds;
  const requirementMet = state.prestige.lifetimeBuds.greaterThanOrEqualTo(PRESTIGE_MIN_REQUIREMENT);
  const permanentGlobalPercent = Math.max(0, milestoneEffects.global.minus(1).mul(100).toNumber());
  const permanentBpsPercent = Math.max(0, milestoneEffects.bps.minus(1).mul(100).toNumber());
  const permanentBpcPercent = Math.max(0, milestoneEffects.bpc.minus(1).mul(100).toNumber());
  const totalBpsPercent = Math.max(
    0,
    milestoneEffects.global.mul(milestoneEffects.bps).minus(1).mul(100).toNumber(),
  );
  const totalBpcPercent = Math.max(
    0,
    milestoneEffects.global.mul(milestoneEffects.bpc).minus(1).mul(100).toNumber(),
  );
  const nextKickstartLevel = milestoneResult.highestKickstartLevel;
  const nextKickstartConfig = getKickstartConfig(nextKickstartLevel);
  const kickstartSnapshot = resolveKickstart(state, Date.now());

  return {
    requirementMet,
    requirementTarget,
    lifetimeBuds,
    permanentGlobalPercent,
    permanentBpsPercent,
    permanentBpcPercent,
    totalBpsPercent,
    totalBpcPercent,
    milestoneActiveCount: milestoneEffects.activeCount,
    nextKickstartLevel,
    nextKickstartConfig,
    activeKickstartLevel: kickstartSnapshot.active ? kickstartSnapshot.level : 0,
    activeKickstartRemainingMs: kickstartSnapshot.remainingMs,
    activeKickstartDurationMs: kickstartSnapshot.durationMs,
    activeKickstartBpsMult: kickstartSnapshot.bpsMult,
    activeKickstartBpcMult: kickstartSnapshot.bpcMult,
    activeKickstartCostMult: kickstartSnapshot.costMult,
  } satisfies PrestigePreview;
}

export function performPrestige(state: GameState): GameState {
  const preview = getPrestigePreview(state);
  if (!preview.requirementMet) {
    return state;
  }

  const now = Date.now();
  const seedsAfter = state.prestige.seeds;
  const multiplier = computePrestigeMultiplier(seedsAfter);
  const preservedResearch = state.researchOwned.filter((researchId) => {
    const node = researchById.get(researchId);
    return !node?.resetsOnPrestige;
  });
  const preservedMilestones = { ...state.prestige.milestones };

  const preserved: Partial<GameState> = {
    locale: state.locale,
    muted: state.muted,
    achievements: { ...state.achievements },
    researchOwned: preservedResearch,
    preferences: state.preferences,
    automation: state.automation,
    prestige: {
      seeds: seedsAfter,
      mult: multiplier,
      lifetimeBuds: state.prestige.lifetimeBuds,
      lastResetAt: now,
      version: 1,
      milestones: preservedMilestones,
      kickstart: null,
    },
  };

  const reset = createDefaultState(preserved);
  reset.total = new Decimal(0);
  reset.time = now;
  reset.lastSeenAt = now;
  reset.temp.offlineBuds = null;
  reset.temp.offlineDuration = 0;
  const nextState = Object.assign(state, reset);
  activateKickstart(nextState, preview.nextKickstartLevel, now);
  applyResearchEffects(nextState);
  return nextState;
}

export function updatePrestigeMultiplier(state: GameState): void {
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);
}


