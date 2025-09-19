import Decimal from 'break_infinity.js';
import { items, type ItemDefinition } from '../data/items';
import { formatDecimal, paybackSeconds } from './math';
import type { GameState } from './state';
import { t, type LocaleKey } from './i18n';

export interface ShopEntry {
  definition: ItemDefinition;
  owned: number;
  cost: Decimal;
  nextCost: Decimal;
  formattedCost: string;
  formattedNextCost: string;
  bpsGain: Decimal;
  payback: number | null;
  unlocked: boolean;
  affordable: boolean;
}

export function getItemCost(
  definition: ItemDefinition,
  owned: number,
  costMultiplier: Decimal = new Decimal(1),
): Decimal {
  const base = new Decimal(definition.baseCost).mul(costMultiplier);
  const factor = new Decimal(definition.costFactor);
  return base.mul(factor.pow(owned));
}

export function getNextCost(
  definition: ItemDefinition,
  owned: number,
  costMultiplier: Decimal = new Decimal(1),
): Decimal {
  return getItemCost(definition, owned + 1, costMultiplier);
}

export function canUnlockItem(state: GameState, definition: ItemDefinition): boolean {
  if (!definition.unlock) {
    return true;
  }

  if (definition.unlock.totalBuds && state.total.lessThan(definition.unlock.totalBuds)) {
    return false;
  }

  if (definition.unlock.itemsOwned) {
    return Object.entries(definition.unlock.itemsOwned).every(([itemId, amount]) => {
      return (state.items[itemId] ?? 0) >= amount;
    });
  }

  return true;
}

export function getShopEntries(state: GameState): ShopEntry[] {
  return items.map((definition) => {
    const owned = state.items[definition.id] ?? 0;
    const cost = getItemCost(definition, owned, state.temp.costMultiplier);
    const nextCost = getNextCost(definition, owned, state.temp.costMultiplier);
    const bpsGain = new Decimal(definition.bps);
    const payback = paybackSeconds(cost, bpsGain);

    return {
      definition,
      owned,
      cost,
      nextCost,
      formattedCost: formatDecimal(cost),
      formattedNextCost: formatDecimal(nextCost),
      bpsGain,
      payback,
      unlocked: canUnlockItem(state, definition),
      affordable: state.buds.greaterThanOrEqualTo(cost),
    } satisfies ShopEntry;
  });
}

export function getMaxAffordable(definition: ItemDefinition, state: GameState): number {
  const factor = new Decimal(definition.costFactor);
  const owned = state.items[definition.id] ?? 0;
  let iterations = 0;
  let totalCost = new Decimal(0);
  let nextCost = getItemCost(definition, owned, state.temp.costMultiplier);

  while (state.buds.greaterThanOrEqualTo(totalCost.add(nextCost)) && iterations < 999) {
    totalCost = totalCost.add(nextCost);
    nextCost = nextCost.mul(factor);
    iterations += 1;
  }

  return iterations;
}

export function formatPayback(locale: LocaleKey, value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }

  return t(locale, 'shop.paybackValue', { seconds: value });
}

