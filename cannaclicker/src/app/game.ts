import Decimal from 'break_infinity.js';
import { itemById } from '../data/items';
import { achievements } from '../data/achievements';
import { upgradeById, upgrades } from '../data/upgrades';
import { getItemCost, getTierMultiplier, getSoftcapMultiplier } from './shop';
import type { GameState } from './state';
import { sum, toDecimal } from './math';
import { applyResearchEffects } from './research';
import { abilityMultiplier } from './abilities';
import { requirementsSatisfied } from './upgrades';

export function handleManualClick(state: GameState): Decimal {
  state.buds = state.buds.add(state.bpc);
  state.total = state.total.add(state.bpc);
  state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(state.bpc);
  return state.bpc;
}

export function recalcDerivedValues(state: GameState): void {
  applyResearchEffects(state);

  const {
    globalMultiplier,
    buildingMultipliers,
    buildingCostMultipliers,
    clickMultiplier,
    autoClickRate,
  } = collectUpgradeEffects(state);
  const researchBuildingMultipliers = state.temp.researchBuildingMultipliers ?? {};
  for (const [buildingId, multiplier] of Object.entries(researchBuildingMultipliers)) {
    if (!multiplier) {
      continue;
    }
    const safeMultiplier = multiplier instanceof Decimal ? multiplier : new Decimal(multiplier);
    const current = buildingMultipliers.get(buildingId) ?? new Decimal(1);
    buildingMultipliers.set(buildingId, current.mul(safeMultiplier));
  }
  state.temp.buildingBaseMultipliers = {};
  state.temp.buildingTierMultipliers = {};

  const combinedCostMultipliers = new Map<string, Decimal>();
  const baseCostMultipliers = state.temp.buildingCostMultipliers ?? {};
  for (const [key, value] of Object.entries(baseCostMultipliers)) {
    const multiplier = value instanceof Decimal ? value : new Decimal(value);
    combinedCostMultipliers.set(key, multiplier);
  }

  for (const [target, multiplier] of buildingCostMultipliers.entries()) {
    const current = combinedCostMultipliers.get(target) ?? new Decimal(1);
    combinedCostMultipliers.set(target, current.mul(multiplier));
  }

  const nextCostMultipliers: Record<string, Decimal> = {};
  for (const [key, value] of combinedCostMultipliers.entries()) {
    nextCostMultipliers[key] = value;
  }
  state.temp.buildingCostMultipliers = nextCostMultipliers;
  state.temp.autoClickRate += autoClickRate;

  const prestigeMultiplier = state.prestige.mult;

  const buildingProduction = Array.from(itemById.entries()).map(([id, definition]) => {
    const owned = state.items[id] ?? 0;
    const baseMultiplier = buildingMultipliers.get(id) ?? new Decimal(1);
    const tierMultiplier = getTierMultiplier(definition, owned);
    const softcapMultiplier = getSoftcapMultiplier(definition, owned);
    state.temp.buildingBaseMultipliers[id] = baseMultiplier;
    state.temp.buildingTierMultipliers[id] = tierMultiplier;

    if (!owned) {
      return new Decimal(0);
    }

    const totalMultiplier = baseMultiplier.mul(tierMultiplier).mul(softcapMultiplier);
    return new Decimal(definition.bps).mul(owned).mul(totalMultiplier);
  });

  const achievementMultiplier = collectAchievementMultiplier(state);
  const baseMultiplier = globalMultiplier.mul(achievementMultiplier).mul(prestigeMultiplier);
  const researchBpsMult = state.temp.researchBpsMult ?? new Decimal(1);
  const researchBpcMult = state.temp.researchBpcMult ?? new Decimal(1);
  const abilityBpsMult = new Decimal(abilityMultiplier(state, 'overdrive'));
  const abilityBpcMult = new Decimal(abilityMultiplier(state, 'burst'));
  const eventBpsMult = state.temp.eventBpsMult ?? new Decimal(1);
  const eventBpcMult = state.temp.eventBpcMult ?? new Decimal(1);

  const totalBpsMultiplier = baseMultiplier
    .mul(researchBpsMult)
    .mul(abilityBpsMult)
    .mul(eventBpsMult);
  const totalBpcMultiplier = baseMultiplier
    .mul(clickMultiplier)
    .mul(researchBpcMult)
    .mul(abilityBpcMult)
    .mul(eventBpcMult);

  state.bps = sum(...buildingProduction).mul(totalBpsMultiplier);
  state.bpc = new Decimal(1).mul(totalBpcMultiplier);
  state.temp.totalBpsMult = totalBpsMultiplier;
  state.temp.totalBpcMult = totalBpcMultiplier;
}

export function buyItem(state: GameState, itemId: string, quantity = 1): boolean {
  const definition = itemById.get(itemId);
  if (!definition) {
    return false;
  }

  const owned = state.items[itemId] ?? 0;
  let totalCost = new Decimal(0);
  const buildingCostMult = state.temp.buildingCostMultipliers?.[itemId] ?? new Decimal(1);
  const totalCostMult = state.temp.costMultiplier.mul(buildingCostMult);

  for (let i = 0; i < quantity; i += 1) {
    const price = getItemCost(definition, owned + i, totalCostMult);
    totalCost = totalCost.add(price);
  }

  if (state.buds.lessThan(totalCost)) {
    return false;
  }

  state.buds = state.buds.sub(totalCost);
  state.items[itemId] = owned + quantity;
  recalcDerivedValues(state);
  evaluateAchievements(state);
  return true;
}

export function buyUpgrade(state: GameState, upgradeId: string): boolean {
  if (state.upgrades[upgradeId]) {
    return false;
  }

  const definition = upgradeById.get(upgradeId);
  if (!definition) {
    return false;
  }

  if (!requirementsSatisfied(state, definition)) {
    return false;
  }

  const cost = new Decimal(definition.cost);
  if (state.buds.lessThan(cost)) {
    return false;
  }

  state.buds = state.buds.sub(cost);
  state.upgrades[upgradeId] = true;
  recalcDerivedValues(state);
  evaluateAchievements(state);
  return true;
}

export function evaluateAchievements(state: GameState): void {
  for (const achievement of achievements) {
    if (state.achievements[achievement.id]) {
      continue;
    }

    const ownsItems = !achievement.requirement.itemsOwned
      || Object.entries(achievement.requirement.itemsOwned).every(([id, amount]) => {
        return (state.items[id] ?? 0) >= amount;
      });

    const meetsTotal = !achievement.requirement.totalBuds
      || state.total.greaterThanOrEqualTo(achievement.requirement.totalBuds);

    if (ownsItems && meetsTotal) {
      state.achievements[achievement.id] = true;
    }
  }

  recalcDerivedValues(state);
}

function collectUpgradeEffects(state: GameState): {
  globalMultiplier: Decimal;
  buildingMultipliers: Map<string, Decimal>;
  buildingCostMultipliers: Map<string, Decimal>;
  clickMultiplier: Decimal;
  autoClickRate: number;
} {
  const buildingMultipliers = new Map<string, Decimal>();
  const buildingCostMultipliers = new Map<string, Decimal>();
  let globalMultiplier = new Decimal(1);
  let clickMultiplier = new Decimal(1);
  let autoClickRate = 0;

  for (const upgrade of upgrades) {
    if (!state.upgrades[upgrade.id]) {
      continue;
    }

    for (const effect of upgrade.effects) {
      switch (effect.type) {
        case 'globalMultiplier': {
          globalMultiplier = globalMultiplier.mul(toDecimal(effect.value));
          break;
        }
        case 'clickMultiplier': {
          clickMultiplier = clickMultiplier.mul(toDecimal(effect.value));
          break;
        }
        case 'buildingMultiplier': {
          const targets = effect.targets;
          const multiplier = toDecimal(effect.value);
          for (const target of targets) {
            const current = buildingMultipliers.get(target) ?? new Decimal(1);
            buildingMultipliers.set(target, current.mul(multiplier));
          }
          break;
        }
        case 'buildingCostMultiplier': {
          const targets = effect.targets;
          const multiplier = toDecimal(effect.value);
          for (const target of targets) {
            const current = buildingCostMultipliers.get(target) ?? new Decimal(1);
            buildingCostMultipliers.set(target, current.mul(multiplier));
          }
          break;
        }
        case 'autoClick': {
          autoClickRate += effect.value;
          break;
        }
        default:
          break;
      }
    }
  }

  return { globalMultiplier, buildingMultipliers, buildingCostMultipliers, clickMultiplier, autoClickRate };
}

function collectAchievementMultiplier(state: GameState): Decimal {
  return achievements.reduce((acc, achievement) => {
    if (!state.achievements[achievement.id]) {
      return acc;
    }

    if (!achievement.rewardMultiplier) {
      return acc;
    }

    return acc.mul(achievement.rewardMultiplier);
  }, new Decimal(1));
}


