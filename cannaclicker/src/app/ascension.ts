import Decimal from 'break_infinity.js';
import {
  ascensionNodeById,
  ascensionNodes,
  type AscensionEffect,
  type AscensionNodeDefinition,
  type AscensionNodeId,
} from '../data/ascension';
import type { GameState } from './state';

export interface AscensionEffects {
  globalMultiplier: Decimal;
  clickMultiplier: Decimal;
  eventRewardMultiplier: number;
  eventSpawnRateMultiplier: number;
  globalCostMultiplier: Decimal;
  researchCostMultiplier: number;
  offlineCapHours: number;
  startingBuds: number;
  startingSeedlings: number;
  autoClickRate: number;
  permanentSlots: number;
  prestigeSeedMultiplier: number;
}

export interface AscensionNodeView {
  node: AscensionNodeDefinition;
  owned: boolean;
  affordable: boolean;
  locked: boolean;
  missingRequirementIds: AscensionNodeId[];
}

export function createEmptyAscensionEffects(): AscensionEffects {
  return {
    globalMultiplier: new Decimal(1),
    clickMultiplier: new Decimal(1),
    eventRewardMultiplier: 1,
    eventSpawnRateMultiplier: 1,
    globalCostMultiplier: new Decimal(1),
    researchCostMultiplier: 1,
    offlineCapHours: 0,
    startingBuds: 0,
    startingSeedlings: 0,
    autoClickRate: 0,
    permanentSlots: 0,
    prestigeSeedMultiplier: 1,
  } satisfies AscensionEffects;
}

export function getOwnedAscensionNodes(state: GameState): AscensionNodeId[] {
  const owned = Array.isArray(state.prestige.ascensionOwned) ? state.prestige.ascensionOwned : [];
  return owned.filter((id): id is AscensionNodeId => ascensionNodeById.has(id));
}

export function getAscensionEffects(state: GameState): AscensionEffects {
  const effects = createEmptyAscensionEffects();
  for (const id of getOwnedAscensionNodes(state)) {
    const node = ascensionNodeById.get(id);
    if (!node) {
      continue;
    }
    for (const effect of node.effects) {
      applyAscensionEffect(effects, effect);
    }
  }
  return effects;
}

export function applyAscensionEffects(state: GameState): void {
  const effects = getAscensionEffects(state);
  state.temp.researchBpsMult = state.temp.researchBpsMult.mul(effects.globalMultiplier);
  state.temp.researchBpcMult = state.temp.researchBpcMult
    .mul(effects.globalMultiplier)
    .mul(effects.clickMultiplier);
  state.temp.eventRewardMult = Math.max(
    1,
    state.temp.eventRewardMult * effects.eventRewardMultiplier,
  );
  state.temp.eventSpawnRateMult = Math.max(
    0.5,
    state.temp.eventSpawnRateMult * effects.eventSpawnRateMultiplier,
  );
  state.temp.costMultiplier = state.temp.costMultiplier.mul(effects.globalCostMultiplier);
  state.temp.researchCostMult = Math.max(
    0.6,
    state.temp.researchCostMult * effects.researchCostMultiplier,
  );
  state.temp.offlineCapMs += Math.max(0, effects.offlineCapHours) * 60 * 60 * 1000;
  state.temp.autoClickRate += effects.autoClickRate;
  state.prestige.permanentSlots = effects.permanentSlots;
}

export function applyAscensionRunStart(state: GameState): void {
  const effects = getAscensionEffects(state);
  if (effects.startingBuds > 0) {
    state.buds = state.buds.add(effects.startingBuds);
    state.total = state.total.add(effects.startingBuds);
    state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(effects.startingBuds);
  }
  if (effects.startingSeedlings > 0) {
    state.items.seedling = (state.items.seedling ?? 0) + effects.startingSeedlings;
  }
}

export function getAscensionPrestigeSeedMultiplier(state: GameState): number {
  return getAscensionEffects(state).prestigeSeedMultiplier;
}

export function getAscensionViews(state: GameState): AscensionNodeView[] {
  const ownedSet = new Set(getOwnedAscensionNodes(state));
  const spendable = state.prestige.ascensionSeeds ?? 0;
  return ascensionNodes.map((node) => {
    const missingRequirementIds = (node.requires ?? []).filter((id) => !ownedSet.has(id));
    const owned = ownedSet.has(node.id);
    const locked = !owned && missingRequirementIds.length > 0;
    return {
      node,
      owned,
      locked,
      missingRequirementIds,
      affordable: !owned && !locked && spendable >= node.cost,
    } satisfies AscensionNodeView;
  });
}

export function purchaseAscensionNode(state: GameState, id: AscensionNodeId): boolean {
  const node = ascensionNodeById.get(id);
  if (!node) {
    return false;
  }

  const owned = new Set(getOwnedAscensionNodes(state));
  if (owned.has(id)) {
    return false;
  }

  if ((node.requires ?? []).some((required) => !owned.has(required))) {
    return false;
  }

  const available = state.prestige.ascensionSeeds ?? 0;
  if (available < node.cost) {
    return false;
  }

  state.prestige.ascensionSeeds = available - node.cost;
  state.prestige.ascensionSpent = (state.prestige.ascensionSpent ?? 0) + node.cost;
  state.prestige.ascensionOwned = [...owned, id];
  applyAscensionEffects(state);
  return true;
}

function applyAscensionEffect(target: AscensionEffects, effect: AscensionEffect): void {
  switch (effect.type) {
    case 'globalMultiplier':
      target.globalMultiplier = target.globalMultiplier.mul(effect.value);
      break;
    case 'clickMultiplier':
      target.clickMultiplier = target.clickMultiplier.mul(effect.value);
      break;
    case 'eventRewardMultiplier':
      target.eventRewardMultiplier *= effect.value;
      break;
    case 'eventSpawnRateMultiplier':
      target.eventSpawnRateMultiplier *= effect.value;
      break;
    case 'globalCostMultiplier':
      target.globalCostMultiplier = target.globalCostMultiplier.mul(effect.value);
      break;
    case 'researchCostMultiplier':
      target.researchCostMultiplier *= effect.value;
      break;
    case 'offlineCapHours':
      target.offlineCapHours += effect.value;
      break;
    case 'startingBuds':
      target.startingBuds += effect.value;
      break;
    case 'startingItem':
      if (effect.itemId === 'seedling') {
        target.startingSeedlings += effect.value;
      }
      break;
    case 'autoClickRate':
      target.autoClickRate += effect.value;
      break;
    case 'prestigeSeedMultiplier':
      target.prestigeSeedMultiplier *= effect.value;
      break;
    default:
      break;
  }
}
