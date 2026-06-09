import Decimal from 'break_infinity.js';
import {
  RESEARCH,
  researchById,
  type ResearchId,
  type ResearchNode,
  type ResearchUnlockCondition,
} from '../data/research';
import type { GameState } from './state';
import { updatePrestigeMultiplier } from './prestige';
import { applyEffects } from '../game/effects';
import { reapplyAbilityEffects } from './abilities';
import { recordInteraction } from './seeds';

export type ResearchFilter = 'all' | 'available' | 'owned';

export interface ResearchViewModel {
  node: ResearchNode;
  owned: boolean;
  affordable: boolean;
  blocked: boolean;
  lockReason: ResearchLockReason | null;
}

export type ResearchLockReason =
  | { kind: 'exclusive' }
  | { kind: 'unlock_all'; conditions: readonly ResearchUnlockCondition[] }
  | { kind: 'unlock_any'; conditions: readonly ResearchUnlockCondition[] };

export function applyResearchEffects(state: GameState): void {
  applyEffects(state, state.researchOwned);
  reapplyAbilityEffects(state);
}

export function getResearchList(
  state: GameState,
  filter: ResearchFilter = 'all',
): ResearchViewModel[] {
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
  })
    .filter((entry) => {
      if (filter === 'available') {
        return !entry.owned && !entry.blocked;
      }

      if (filter === 'owned') {
        return entry.owned;
      }

      return true;
    })
    .sort(compareResearchEntries);
}

function compareResearchEntries(a: ResearchViewModel, b: ResearchViewModel): number {
  const stateRank = (entry: ResearchViewModel): number => {
    if (!entry.owned && !entry.blocked) {
      return entry.affordable ? 0 : 1;
    }
    if (!entry.owned && entry.blocked) {
      return 2;
    }
    return 3;
  };
  const diff = stateRank(a) - stateRank(b);
  if (diff !== 0) {
    return diff;
  }
  if (a.node.path !== b.node.path) {
    return a.node.path.localeCompare(b.node.path);
  }
  return a.node.order - b.node.order;
}

export function canAfford(state: GameState, node: ResearchNode): boolean {
  if (node.costType === 'buds') {
    return state.buds.greaterThanOrEqualTo(new Decimal(node.cost));
  }

  if (node.costType === 'ascension') {
    return (state.prestige.ascensionSeeds ?? 0) >= getResearchCost(state, node);
  }

  return state.prestige.seeds >= getResearchCost(state, node);
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

export function purchaseResearch(state: GameState, id: ResearchId): boolean {
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

  if (node.costType === 'buds') {
    const cost = new Decimal(node.cost);
    state.buds = state.buds.sub(cost);
  } else if (node.costType === 'ascension') {
    const cost = getResearchCost(state, node);
    state.prestige.ascensionSeeds -= cost;
    state.prestige.ascensionSpent = (state.prestige.ascensionSpent ?? 0) + cost;
    updatePrestigeMultiplier(state);
  } else {
    const cost = getResearchCost(state, node);
    state.prestige.seeds -= cost;
    state.meta.seedsSpent += cost;
  }

  state.researchOwned = [...state.researchOwned, node.id];
  state.meta.totalResearchPurchased += 1;
  recordInteraction(state);
  applyResearchEffects(state);
  return true;
}

export function getResearchNode(id: ResearchId): ResearchNode | undefined {
  return researchById.get(id);
}

function meetsUnlockCondition(state: GameState, condition: ResearchUnlockCondition): boolean {
  switch (condition.type) {
    case 'total_buds':
      return state.total.greaterThanOrEqualTo(new Decimal(condition.value));
    case 'prestige_seeds':
      return (state.prestige.totalAscensionSeeds ?? 0) >= condition.value;
    default:
      return false;
  }
}

export function getResearchCost(state: GameState, node: ResearchNode): number {
  if (node.costType !== 'seeds') {
    return node.cost;
  }

  const multiplier = Number.isFinite(state.temp.researchCostMult)
    ? Math.max(0.75, state.temp.researchCostMult)
    : 1;
  return Math.max(1, Math.ceil(node.cost * multiplier));
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
      return { kind: 'exclusive' } satisfies ResearchLockReason;
    }
  }

  if (node.unlockAll && node.unlockAll.length > 0) {
    const allMet = node.unlockAll.every((condition) => meetsUnlockCondition(state, condition));
    if (!allMet) {
      return { kind: 'unlock_all', conditions: node.unlockAll } satisfies ResearchLockReason;
    }
  }

  if (node.unlockAny && node.unlockAny.length > 0) {
    const anyMet = node.unlockAny.some((condition) => meetsUnlockCondition(state, condition));
    if (!anyMet) {
      return { kind: 'unlock_any', conditions: node.unlockAny } satisfies ResearchLockReason;
    }
  }

  return null;
}
