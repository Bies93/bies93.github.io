import Decimal from 'break_infinity.js';
import { itemById } from '../data/items';
import { achievements } from '../data/achievements';
import { upgrades } from '../data/upgrades';
import { getItemCost } from './shop';
import type { GameState } from './state';
import { sum, toDecimal } from './math';

export function handleManualClick(state: GameState): Decimal {
  state.buds = state.buds.add(state.bpc);
  state.total = state.total.add(state.bpc);
  return state.bpc;
}

export function recalcDerivedValues(state: GameState): void {
  const { globalMultiplier, buildingMultipliers, clickMultiplier } = collectUpgradeMultipliers(state);

  const buildingProduction = Array.from(itemById.entries()).map(([id, definition]) => {
    const owned = state.items[id] ?? 0;
    if (!owned) {
      return new Decimal(0);
    }

    const multiplier = buildingMultipliers.get(id) ?? new Decimal(1);
    return new Decimal(definition.bps).mul(owned).mul(multiplier);
  });

  const achievementMultiplier = collectAchievementMultiplier(state);
  const totalMultiplier = globalMultiplier.mul(achievementMultiplier);

  state.bps = sum(...buildingProduction).mul(totalMultiplier);
  state.bpc = new Decimal(1).mul(clickMultiplier).mul(totalMultiplier);
}

export function buyItem(state: GameState, itemId: string, quantity = 1): boolean {
  const definition = itemById.get(itemId);
  if (!definition) {
    return false;
  }

  const owned = state.items[itemId] ?? 0;
  const factor = new Decimal(definition.costFactor);
  let nextCost = getItemCost(definition, owned);
  let totalCost = new Decimal(0);

  for (let i = 0; i < quantity; i += 1) {
    totalCost = totalCost.add(nextCost);
    nextCost = nextCost.mul(factor);
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

function collectUpgradeMultipliers(state: GameState): {
  globalMultiplier: Decimal;
  buildingMultipliers: Map<string, Decimal>;
  clickMultiplier: Decimal;
} {
  const buildingMultipliers = new Map<string, Decimal>();
  let globalMultiplier = new Decimal(1);
  let clickMultiplier = new Decimal(1);

  for (const upgrade of upgrades) {
    if (!state.upgrades[upgrade.id]) {
      continue;
    }

    const multiplier = toDecimal(upgrade.multiplier);
    if (upgrade.kind === 'global') {
      globalMultiplier = globalMultiplier.mul(multiplier);
    } else if (upgrade.kind === 'click') {
      clickMultiplier = clickMultiplier.mul(multiplier);
    } else if (upgrade.kind === 'building' && upgrade.appliesTo) {
      const current = buildingMultipliers.get(upgrade.appliesTo) ?? new Decimal(1);
      buildingMultipliers.set(upgrade.appliesTo, current.mul(multiplier));
    }
  }

  return { globalMultiplier, buildingMultipliers, clickMultiplier };
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
