import Decimal from "break_infinity.js";
import {
  milestones,
  type MilestoneDefinition,
  type MilestoneId,
  type MilestoneRequirement,
} from "../data/milestones";
import { items } from "../data/items";
import type { GameState, KickstartState } from "./state";
import { canUnlockItem } from "./shop";

export interface MilestoneProgressDetailBase {
  type: MilestoneRequirement["type"];
}

export interface UniqueBuildingsDetail extends MilestoneProgressDetailBase {
  type: "unique_buildings";
  owned: number;
  target: number;
}

export interface BuildingsAtLeastDetail extends MilestoneProgressDetailBase {
  type: "buildings_at_least";
  satisfied: number;
  target: number;
  amount: number;
}

export interface AnyBuildingAtLeastDetail extends MilestoneProgressDetailBase {
  type: "any_building_at_least";
  best: number;
  target: number;
}

export interface UnlockedAndAnyDetail extends MilestoneProgressDetailBase {
  type: "unlocked_and_any_at_least";
  unlocked: number;
  total: number;
  best: number;
  target: number;
}

export type MilestoneProgressDetail =
  | UniqueBuildingsDetail
  | BuildingsAtLeastDetail
  | AnyBuildingAtLeastDetail
  | UnlockedAndAnyDetail;

export interface MilestoneProgressSnapshot {
  id: MilestoneId;
  definition: MilestoneDefinition;
  achieved: boolean;
  progress: number;
  detail: MilestoneProgressDetail;
}

export interface MilestoneEffectSummary {
  global: Decimal;
  bps: Decimal;
  bpc: Decimal;
  activeCount: number;
}

export interface MilestoneComputationResult {
  progress: MilestoneProgressSnapshot[];
  effects: MilestoneEffectSummary;
  highestKickstartLevel: number;
}

export interface KickstartConfig {
  level: number;
  durationMs: number;
  bpsMult: number;
  bpcMult: number;
  costMult: number;
}

export interface KickstartSnapshot extends KickstartConfig {
  active: boolean;
  remainingMs: number;
  endsAt: number;
}

const KICKSTART_LEVELS: Record<number, KickstartConfig> = {
  1: { level: 1, durationMs: 20 * 60 * 1000, bpsMult: 2, bpcMult: 2, costMult: 1 },
  2: { level: 2, durationMs: 20 * 60 * 1000, bpsMult: 3, bpcMult: 3, costMult: 1 },
  3: { level: 3, durationMs: 20 * 60 * 1000, bpsMult: 4, bpcMult: 4, costMult: 1 },
  4: { level: 4, durationMs: 25 * 60 * 1000, bpsMult: 5, bpcMult: 5, costMult: 1 },
  5: { level: 5, durationMs: 25 * 60 * 1000, bpsMult: 6, bpcMult: 6, costMult: 1 },
  6: { level: 6, durationMs: 30 * 60 * 1000, bpsMult: 8, bpcMult: 8, costMult: 0.95 },
};

export function getKickstartConfig(level: number): KickstartConfig | null {
  return KICKSTART_LEVELS[level] ?? null;
}

export function computeMilestones(state: GameState): MilestoneComputationResult {
  const progress: MilestoneProgressSnapshot[] = [];
  let global = new Decimal(1);
  let bps = new Decimal(1);
  let bpc = new Decimal(1);
  let activeCount = 0;
  let highestKickstartLevel = 0;

  for (const definition of milestones) {
    const ownedFlag = Boolean(state.prestige.milestones[definition.id]);
    const requirement = evaluateRequirement(state, definition.requirement);
    const achievedNow = requirement.completed;
    const achieved = ownedFlag || achievedNow;

    if (achieved && !ownedFlag) {
      state.prestige.milestones[definition.id] = true;
    }

    const detail = achieved ? markDetailAsComplete(requirement.detail) : requirement.detail;
    const progressValue = achieved ? 1 : requirement.progress;

    progress.push({
      id: definition.id,
      definition,
      achieved,
      progress: Math.max(0, Math.min(1, progressValue)),
      detail,
    });

    if (achieved) {
      activeCount += 1;
      for (const bonus of definition.bonuses) {
        const factor = 1 + Math.max(0, bonus.value);
        switch (bonus.type) {
          case "global": {
            global = global.mul(factor);
            break;
          }
          case "bps": {
            bps = bps.mul(factor);
            break;
          }
          case "bpc": {
            bpc = bpc.mul(factor);
            break;
          }
          default:
            break;
        }
      }

      if (definition.kickstartLevel) {
        highestKickstartLevel = Math.max(highestKickstartLevel, definition.kickstartLevel);
      }
    }
  }

  return {
    progress,
    effects: { global, bps, bpc, activeCount },
    highestKickstartLevel,
  } satisfies MilestoneComputationResult;
}

export function activateKickstart(state: GameState, level: number, now: number): void {
  const config = getKickstartConfig(level);
  if (!config) {
    state.prestige.kickstart = null;
    return;
  }

  const endsAt = now + config.durationMs;
  state.prestige.kickstart = { level: config.level, endsAt } satisfies KickstartState;
}

export function resolveKickstart(state: GameState, now: number): KickstartSnapshot {
  const runtime = state.prestige.kickstart;
  if (!runtime) {
    return {
      level: 0,
      durationMs: 0,
      bpsMult: 1,
      bpcMult: 1,
      costMult: 1,
      active: false,
      remainingMs: 0,
      endsAt: 0,
    } satisfies KickstartSnapshot;
  }

  const config = getKickstartConfig(runtime.level);
  if (!config || now >= runtime.endsAt) {
    state.prestige.kickstart = null;
    return {
      level: 0,
      durationMs: 0,
      bpsMult: 1,
      bpcMult: 1,
      costMult: 1,
      active: false,
      remainingMs: 0,
      endsAt: 0,
    } satisfies KickstartSnapshot;
  }

  return {
    ...config,
    active: true,
    remainingMs: Math.max(0, runtime.endsAt - now),
    endsAt: runtime.endsAt,
  } satisfies KickstartSnapshot;
}

export function clearExpiredKickstart(state: GameState, now: number): boolean {
  const runtime = state.prestige.kickstart;
  if (!runtime) {
    return false;
  }

  if (now >= runtime.endsAt) {
    state.prestige.kickstart = null;
    return true;
  }

  return false;
}

function evaluateRequirement(
  state: GameState,
  requirement: MilestoneRequirement,
): { detail: MilestoneProgressDetail; progress: number; completed: boolean } {
  switch (requirement.type) {
    case "unique_buildings": {
      const owned = countOwnedTypes(state);
      const target = Math.max(1, requirement.count);
      const progress = owned / target;
      return {
        detail: { type: "unique_buildings", owned, target },
        progress,
        completed: owned >= target,
      };
    }
    case "buildings_at_least": {
      const satisfied = countTypesAtLeast(state, requirement.amount);
      const target = Math.max(1, requirement.count);
      const progress = satisfied / target;
      return {
        detail: {
          type: "buildings_at_least",
          satisfied,
          target,
          amount: requirement.amount,
        },
        progress,
        completed: satisfied >= target,
      };
    }
    case "any_building_at_least": {
      const best = highestOwned(state);
      const target = Math.max(1, requirement.amount);
      const progress = best / target;
      return {
        detail: { type: "any_building_at_least", best, target },
        progress,
        completed: best >= target,
      };
    }
    case "unlocked_and_any_at_least": {
      const unlocked = countUnlocked(state);
      const total = items.length;
      const best = highestOwned(state);
      const target = Math.max(1, requirement.amount);
      const progress = Math.min(unlocked / Math.max(1, total), best / target);
      return {
        detail: {
          type: "unlocked_and_any_at_least",
          unlocked,
          total,
          best,
          target,
        },
        progress,
        completed: unlocked >= total && best >= target,
      };
    }
    default: {
      return {
        detail: { type: "unique_buildings", owned: 0, target: 1 },
        progress: 0,
        completed: false,
      };
    }
  }
}

function markDetailAsComplete(detail: MilestoneProgressDetail): MilestoneProgressDetail {
  switch (detail.type) {
    case "unique_buildings":
      return { ...detail, owned: detail.target } satisfies UniqueBuildingsDetail;
    case "buildings_at_least":
      return { ...detail, satisfied: detail.target } satisfies BuildingsAtLeastDetail;
    case "any_building_at_least":
      return { ...detail, best: detail.target } satisfies AnyBuildingAtLeastDetail;
    case "unlocked_and_any_at_least":
      return {
        ...detail,
        unlocked: detail.total,
        best: detail.target,
      } satisfies UnlockedAndAnyDetail;
    default:
      return detail;
  }
}

function countOwnedTypes(state: GameState): number {
  let owned = 0;
  for (const definition of items) {
    if ((state.items[definition.id] ?? 0) > 0) {
      owned += 1;
    }
  }
  return owned;
}

function countTypesAtLeast(state: GameState, amount: number): number {
  const threshold = Math.max(0, Math.floor(amount));
  let satisfied = 0;
  for (const definition of items) {
    if ((state.items[definition.id] ?? 0) >= threshold) {
      satisfied += 1;
    }
  }
  return satisfied;
}

function highestOwned(state: GameState): number {
  let best = 0;
  for (const definition of items) {
    const owned = state.items[definition.id] ?? 0;
    if (owned > best) {
      best = owned;
    }
  }
  return best;
}

function countUnlocked(state: GameState): number {
  let unlocked = 0;
  for (const definition of items) {
    if (canUnlockItem(state, definition)) {
      unlocked += 1;
    }
  }
  return unlocked;
}
