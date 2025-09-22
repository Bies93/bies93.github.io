import Decimal from "break_infinity.js";
import {
  RESEARCH,
  researchById,
  type ResearchNode,
  type ResearchUnlockCondition,
} from "../data/research";
import type { GameState } from "./state";
import { computePrestigeMultiplier } from "./prestige";
import { applyEffects } from "../game/effects";
import { reapplyAbilityEffects } from "./abilities";

export type ResearchFilter = "all" | "available" | "owned";

export interface ResearchViewModel {
  node: ResearchNode;
  owned: boolean;
  affordable: boolean;
  blocked: boolean;
  lockReason: ResearchLockReason | null;
}

export type ResearchLockReason =
  | { kind: "exclusive" }
  | { kind: "unlock_all"; conditions: ResearchUnlockCondition[] }
  | { kind: "unlock_any"; conditions: ResearchUnlockCondition[] };

export function applyResearchEffects(state: GameState): void {
  applyEffects(state, state.researchOwned);
  reapplyAbilityEffects(state);
}

export function getResearchList(state: GameState, filter: ResearchFilter = "all"): ResearchViewModel[] {
  return RESEARCH.map((node) => {
    const owned = state.researchOwned.includes(node.id);
    const blocked = !owned && !requirementsMet(state, node);
    const affordable = !owned && canAfford(state, node);
    const lockReason = !owned ? getResearchLockReason(state, node) : null;
    return {
      node,
      owned,
      blocked,
      affordable,
      lockReason,
    } satisfies ResearchViewModel;
  }).filter((entry) => {
    if (filter === "available") {
      return !entry.owned && !entry.blocked;
    }

    if (filter === "owned") {
      return entry.owned;
    }

    return true;
  });
}

export function canAfford(state: GameState, node: ResearchNode): boolean {
  if (node.costType === "buds") {
    return state.buds.greaterThanOrEqualTo(new Decimal(node.cost));
  }

  return state.prestige.seeds >= node.cost;
}

export function requirementsMet(state: GameState, node: ResearchNode): boolean {
  if (node.exclusiveGroup) {
    const ownsOther = state.researchOwned.some((id) => {
      if (id === node.id) {
        return false;
      }
      const other = researchById.get(id);
      return other?.exclusiveGroup === node.exclusiveGroup;
    });
    if (ownsOther) {
      return false;
    }
  }

  if (node.requires && !node.requires.every((id) => state.researchOwned.includes(id))) {
    return false;
  }

  if (node.unlockAll && node.unlockAll.length > 0) {
    const allMet = node.unlockAll.every((condition) => meetsUnlockCondition(state, condition));
    if (!allMet) {
      return false;
    }
  }

  if (node.unlockAny && node.unlockAny.length > 0) {
    const anyMet = node.unlockAny.some((condition) => meetsUnlockCondition(state, condition));
    if (!anyMet) {
      return false;
    }
  }

  return true;
}

export function purchaseResearch(state: GameState, id: string): boolean {
  if (state.researchOwned.includes(id)) {
    return false;
  }

  const node = researchById.get(id);
  if (!node) {
    return false;
  }

  if (!requirementsMet(state, node)) {
    return false;
  }

  if (!canAfford(state, node)) {
    return false;
  }

  if (node.costType === "buds") {
    const cost = new Decimal(node.cost);
    state.buds = state.buds.sub(cost);
  } else {
    state.prestige.seeds -= node.cost;
    state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);
  }

  state.researchOwned = [...state.researchOwned, node.id];
  applyResearchEffects(state);
  return true;
}

export function getResearchNode(id: string): ResearchNode | undefined {
  return researchById.get(id);
}

function meetsUnlockCondition(state: GameState, condition: ResearchUnlockCondition): boolean {
  switch (condition.type) {
    case "total_buds":
      return state.total.greaterThanOrEqualTo(new Decimal(condition.value));
    case "prestige_seeds":
      return state.prestige.seeds >= condition.value;
    default:
      return false;
  }
}

function getResearchLockReason(state: GameState, node: ResearchNode): ResearchLockReason | null {
  if (node.exclusiveGroup) {
    const ownsOther = state.researchOwned.some((id) => {
      if (id === node.id) {
        return false;
      }
      const other = researchById.get(id);
      return other?.exclusiveGroup === node.exclusiveGroup;
    });
    if (ownsOther) {
      return { kind: "exclusive" } satisfies ResearchLockReason;
    }
  }

  if (node.unlockAll && node.unlockAll.length > 0) {
    const allMet = node.unlockAll.every((condition) => meetsUnlockCondition(state, condition));
    if (!allMet) {
      return { kind: "unlock_all", conditions: node.unlockAll } satisfies ResearchLockReason;
    }
  }

  if (node.unlockAny && node.unlockAny.length > 0) {
    const anyMet = node.unlockAny.some((condition) => meetsUnlockCondition(state, condition));
    if (!anyMet) {
      return { kind: "unlock_any", conditions: node.unlockAny } satisfies ResearchLockReason;
    }
  }

  return null;
}
