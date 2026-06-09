import Decimal from 'break_infinity.js';
import { PRESTIGE_M, PRESTIGE_MIN_REQUIREMENT } from './balance';
import { createDefaultState, type GameState } from './state';
import { applyResearchEffects } from './research';
import { researchById } from '../data/research';
import {
  activateKickstart,
  computeMilestones,
  getKickstartConfig,
  resolveKickstart,
} from './milestones';
import { applyAscensionRunStart, getAscensionPrestigeSeedMultiplier } from './ascension';

export interface PrestigePreview {
  requirementMet: boolean;
  requirementTarget: Decimal;
  lifetimeBuds: Decimal;
  seedGain: number;
  seedsBefore: number;
  seedsAfter: number;
  totalSeedsBefore: number;
  totalSeedsAfter: number;
  runSeedsBefore: number;
  runSeedsTotalBefore: number;
  nextSeedTarget: Decimal;
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

export function computePrestigeSeedGain(lifetimeBuds: Decimal): number {
  if (lifetimeBuds.lessThan(PRESTIGE_MIN_REQUIREMENT)) {
    return 0;
  }

  const ratio = lifetimeBuds.div(PRESTIGE_MIN_REQUIREMENT).toNumber();
  if (!Number.isFinite(ratio)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, ratio))));
}

function getNextSeedTarget(seedGain: number): Decimal {
  const nextGain = Math.max(1, seedGain + 1);
  return new Decimal(PRESTIGE_MIN_REQUIREMENT).mul(nextGain * nextGain);
}

export function getPrestigePreview(state: GameState): PrestigePreview {
  const milestoneResult = computeMilestones(state);
  const milestoneEffects = milestoneResult.effects;
  const requirementTarget = new Decimal(PRESTIGE_MIN_REQUIREMENT);
  const lifetimeBuds = state.prestige.lifetimeBuds;
  const requirementMet = state.prestige.lifetimeBuds.greaterThanOrEqualTo(PRESTIGE_MIN_REQUIREMENT);
  const baseSeedGain = computePrestigeSeedGain(lifetimeBuds);
  const prestigeSeedMultiplier = getAscensionPrestigeSeedMultiplier(state);
  const seedGain =
    baseSeedGain <= 0 ? 0 : Math.max(1, Math.floor(baseSeedGain * prestigeSeedMultiplier));
  const seedsBefore = state.prestige.ascensionSeeds ?? 0;
  const seedsAfter = seedsBefore + seedGain;
  const totalSeedsBefore = Math.max(state.prestige.totalAscensionSeeds ?? 0, seedsBefore);
  const totalSeedsAfter = totalSeedsBefore + seedGain;
  const nextSeedTarget = getNextSeedTarget(seedGain);
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
    seedGain,
    seedsBefore,
    seedsAfter,
    totalSeedsBefore,
    totalSeedsAfter,
    runSeedsBefore: state.prestige.seeds,
    runSeedsTotalBefore: state.prestige.totalSeeds,
    nextSeedTarget,
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
  const seedsAfter = preview.seedsAfter;
  const multiplier = computePrestigeMultiplier(preview.totalSeedsAfter);
  const preservedResearch = state.researchOwned.filter((researchId) => {
    const node = researchById.get(researchId);
    return !node?.resetsOnPrestige;
  });
  const preservedMilestones = { ...state.prestige.milestones };
  const runBuds = preview.lifetimeBuds.toNumber();
  const safeRunBuds = Number.isFinite(runBuds) ? Math.max(0, Math.floor(runBuds)) : 0;
  const preservedMeta = {
    ...state.meta,
    prestigeCount: state.meta.prestigeCount + 1,
    lastRunBuds: safeRunBuds,
    bestRunBuds: Math.max(state.meta.bestRunBuds, safeRunBuds),
  };

  const preserved: Partial<GameState> = {
    locale: state.locale,
    muted: state.muted,
    achievements: { ...state.achievements },
    researchOwned: preservedResearch,
    preferences: state.preferences,
    automation: state.automation,
    settings: state.settings,
    meta: preservedMeta,
    prestige: {
      seeds: state.prestige.seeds,
      totalSeeds: state.prestige.totalSeeds,
      ascensionSeeds: seedsAfter,
      totalAscensionSeeds: preview.totalSeedsAfter,
      ascensionSpent: state.prestige.ascensionSpent ?? 0,
      ascensionOwned: state.prestige.ascensionOwned ?? [],
      permanentSlots: state.prestige.permanentSlots ?? 0,
      permanentUpgradeIds: state.prestige.permanentUpgradeIds ?? [],
      mult: multiplier,
      lifetimeBuds: new Decimal(0),
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
  applyAscensionRunStart(nextState);
  activateKickstart(nextState, preview.nextKickstartLevel, now);
  applyResearchEffects(nextState);
  return nextState;
}

export function updatePrestigeMultiplier(state: GameState): void {
  state.prestige.totalAscensionSeeds = Math.max(
    state.prestige.totalAscensionSeeds ?? 0,
    (state.prestige.ascensionSeeds ?? 0) + (state.prestige.ascensionSpent ?? 0),
  );
  state.prestige.mult = computePrestigeMultiplier(state.prestige.totalAscensionSeeds);
}
