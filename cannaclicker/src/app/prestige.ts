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
import { applyDepthEffects, completeActiveChallengeIfMet } from './depth';

export interface PrestigePreview {
  requirementMet: boolean;
  requirementTarget: Decimal;
  lifetimeBuds: Decimal;
  minRunDurationMs: number;
  runDurationMs: number;
  runDurationMet: boolean;
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

export function getPrestigeRequirement(state: GameState): Decimal {
  const totalSeeds = Math.max(0, state.prestige.totalAscensionSeeds ?? 0);
  const prestigeCount = Math.max(0, state.meta.prestigeCount ?? 0);
  const seedScale = new Decimal(1 + totalSeeds * 0.22).pow(2);
  const runScale = new Decimal(1 + prestigeCount * 0.08);
  return new Decimal(PRESTIGE_MIN_REQUIREMENT).mul(seedScale).mul(runScale);
}

function getMinimumPrestigeRunDurationMs(state: GameState): number {
  void state;
  return 60 * 60 * 1000;
}

export function computePrestigeSeedGain(
  lifetimeBuds: Decimal,
  requirement: Decimal = new Decimal(PRESTIGE_MIN_REQUIREMENT),
): number {
  if (lifetimeBuds.lessThan(requirement)) {
    return 0;
  }

  const ratio = lifetimeBuds.div(requirement).toNumber();
  if (!Number.isFinite(ratio)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, ratio))));
}

function getNextSeedTarget(seedGain: number, requirement: Decimal): Decimal {
  const nextGain = Math.max(1, seedGain + 1);
  return requirement.mul(nextGain * nextGain);
}

export function getPrestigePreview(state: GameState): PrestigePreview {
  const milestoneResult = computeMilestones(state);
  const milestoneEffects = milestoneResult.effects;
  const requirementTarget = getPrestigeRequirement(state);
  const lifetimeBuds = state.prestige.lifetimeBuds;
  const now = Date.now();
  const minRunDurationMs = getMinimumPrestigeRunDurationMs(state);
  const runDurationMs = Math.max(0, now - (state.prestige.lastResetAt || state.time || now));
  const runDurationMet = runDurationMs >= minRunDurationMs;
  const requirementMet =
    state.prestige.lifetimeBuds.greaterThanOrEqualTo(requirementTarget) && runDurationMet;
  const baseSeedGain = computePrestigeSeedGain(lifetimeBuds, requirementTarget);
  const prestigeSeedMultiplier =
    getAscensionPrestigeSeedMultiplier(state) * Math.max(1, state.temp.depthPrestigeSeedMult ?? 1);
  const seedGain =
    baseSeedGain <= 0 ? 0 : Math.max(1, Math.floor(baseSeedGain * prestigeSeedMultiplier));
  const seedsBefore = state.prestige.ascensionSeeds ?? 0;
  const seedsAfter = seedsBefore + seedGain;
  const totalSeedsBefore = Math.max(state.prestige.totalAscensionSeeds ?? 0, seedsBefore);
  const totalSeedsAfter = totalSeedsBefore + seedGain;
  const nextSeedTarget = getNextSeedTarget(seedGain, requirementTarget);
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
    minRunDurationMs,
    runDurationMs,
    runDurationMet,
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
  completeActiveChallengeIfMet(state);
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
    rooms: state.rooms,
    strains: {
      selected: null,
      xp: { ...state.strains.xp },
      levels: { ...state.strains.levels },
      selections: { ...state.strains.selections },
    },
    contracts: {
      tokens: state.contracts.tokens,
      offers: [],
      activeId: null,
      completed: { ...state.contracts.completed },
      claimed: { ...state.contracts.claimed },
      pendingBuff: null,
      activeBuff: state.contracts.pendingBuff
        ? { ...state.contracts.pendingBuff, remainingRuns: 1 }
        : null,
    },
    seasons: state.seasons,
    eventMastery: state.eventMastery,
    collections: state.collections,
    challenges: {
      activeId: null,
      startedAt: 0,
      completed: { ...state.challenges.completed },
      attempts: { ...state.challenges.attempts },
      unlocked: [...state.challenges.unlocked],
    },
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
  applyDepthEffects(nextState);
  return nextState;
}

export function updatePrestigeMultiplier(state: GameState): void {
  state.prestige.totalAscensionSeeds = Math.max(
    state.prestige.totalAscensionSeeds ?? 0,
    (state.prestige.ascensionSeeds ?? 0) + (state.prestige.ascensionSpent ?? 0),
  );
  state.prestige.mult = computePrestigeMultiplier(state.prestige.totalAscensionSeeds);
}
