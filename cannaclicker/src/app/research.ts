import Decimal from 'break_infinity.js';
import { researchById, researchNodes, type ResearchEffect, type ResearchNode } from '../data/research';
import type { GameState } from './state';
import { computePrestigeMultiplier } from './prestige';

export type ResearchFilter = 'all' | 'available' | 'owned';

export interface ResearchViewModel {
  node: ResearchNode;
  owned: boolean;
  affordable: boolean;
  blocked: boolean;
}

export interface ResearchBonuses {
  bpsMult: Decimal;
  bpcMult: Decimal;
  costMultiplier: Decimal;
  autoClickRate: number;
  overdriveDurationMult: number;
}

function createDefaultBonuses(): ResearchBonuses {
  return {
    bpsMult: new Decimal(1),
    bpcMult: new Decimal(1),
    costMultiplier: new Decimal(1),
    autoClickRate: 0,
    overdriveDurationMult: 1,
  };
}

export function getResearchList(state: GameState, filter: ResearchFilter = 'all'): ResearchViewModel[] {
  return researchNodes
    .map((node) => {
      const owned = state.researchOwned.includes(node.id);
      const blocked = !requirementsMet(state, node);
      const affordable = owned ? false : canAfford(state, node);
      return {
        node,
        owned,
        blocked,
        affordable,
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
    });
}

export function canAfford(state: GameState, node: ResearchNode): boolean {
  if (node.costType === 'buds') {
    return state.buds.greaterThanOrEqualTo(node.cost);
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

  if (node.costType === 'buds') {
    state.buds = state.buds.sub(node.cost);
  } else {
    state.prestige.seeds -= node.cost;
    state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);
  }

  state.researchOwned = [...state.researchOwned, node.id];
  return true;
}

export function collectResearchBonuses(state: GameState): ResearchBonuses {
  if (!state.researchOwned.length) {
    return createDefaultBonuses();
  }

  return state.researchOwned.reduce((acc, id) => {
    const node = researchById.get(id);
    if (!node) {
      return acc;
    }

    for (const effect of node.effects) {
      applyEffect(acc, effect);
    }

    return acc;
  }, createDefaultBonuses());
}

function applyEffect(target: ResearchBonuses, effect: ResearchEffect): void {
  switch (effect.type) {
    case 'BPC_MULT':
      target.bpcMult = target.bpcMult.mul(effect.value ?? 1);
      break;
    case 'BPS_MULT':
      target.bpsMult = target.bpsMult.mul(effect.value ?? 1);
      break;
    case 'COST_REDUCE_ALL':
      target.costMultiplier = target.costMultiplier.mul(effect.value ?? 1);
      break;
    case 'CLICK_AUTOMATION':
      target.autoClickRate += effect.value ?? 0;
      break;
    case 'ABILITY_OVERDRIVE_PLUS':
      target.overdriveDurationMult *= effect.value ?? 1;
      break;
    default:
      break;
  }
}

export function getResearchNode(id: string): ResearchNode | undefined {
  return researchById.get(id);
}
