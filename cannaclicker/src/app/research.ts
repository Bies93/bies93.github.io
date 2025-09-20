import Decimal from "break_infinity.js";
import { RESEARCH, researchById, type ResearchNode } from "../data/research";
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
}

export function applyResearchEffects(state: GameState): void {
  applyEffects(state, state.researchOwned);
  reapplyAbilityEffects(state);
}

export function getResearchList(state: GameState, filter: ResearchFilter = "all"): ResearchViewModel[] {
  return RESEARCH.map((node) => {
    const owned = state.researchOwned.includes(node.id);
    const blocked = !requirementsMet(state, node);
    const affordable = !owned && canAfford(state, node);
    return {
      node,
      owned,
      blocked,
      affordable,
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
  if (!node.requires || node.requires.length === 0) {
    return true;
  }

  return node.requires.every((id) => state.researchOwned.includes(id));
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
