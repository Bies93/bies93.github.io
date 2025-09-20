import Decimal from 'break_infinity.js';
import { items, type ItemDefinition } from '../data/items';
import { formatDecimal, paybackSeconds } from './math';
import type { GameState } from './state';
import { t, type LocaleKey } from './i18n';

export const SHOP_TIER_SIZE = 25;
const SHOP_TIER_BONUS = 1.15;
const SHOP_TIER_SOFTCAP_STAGE = 8;
const SHOP_TIER_SOFTCAP_BONUS = 1.1;

export interface ShopEntry {
  definition: ItemDefinition;
  owned: number;
  cost: Decimal;
  nextCost: Decimal;
  formattedCost: string;
  formattedNextCost: string;
  deltaBps: Decimal;
  roi: number | null;
  payback: number | null;
  unlocked: boolean;
  affordable: boolean;
  tier: TierInfo;
  order: number;
}

export interface TierInfo {
  stage: number;
  progressCount: number;
  remainingCount: number;
  completion: number;
  size: number;
  nextThreshold: number;
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
  return items.map((definition, index) => {
    const owned = state.items[definition.id] ?? 0;
    const cost = getItemCost(definition, owned, state.temp.costMultiplier);
    const nextCost = getNextCost(definition, owned, state.temp.costMultiplier);
    const tier = getTierInfo(owned);
    const baseMultiplier = state.temp.buildingBaseMultipliers[definition.id] ?? new Decimal(1);
    const currentTierMultiplier = getTierMultiplier(owned);
    const nextTierMultiplier = getTierMultiplier(owned + 1);
    const baseProduction = new Decimal(definition.bps);
    const currentProduction = baseProduction.mul(owned).mul(baseMultiplier).mul(currentTierMultiplier);
    const nextProduction = baseProduction.mul(owned + 1).mul(baseMultiplier).mul(nextTierMultiplier);
    const deltaBase = nextProduction.sub(currentProduction);
    const deltaBps = deltaBase.mul(state.temp.totalBpsMult);
    const payback = paybackSeconds(cost, deltaBps);
    const roi = deltaBps.lessThanOrEqualTo(0) ? null : Number(cost.div(deltaBps).toFixed(2));

    return {
      definition,
      owned,
      cost,
      nextCost,
      formattedCost: formatDecimal(cost),
      formattedNextCost: formatDecimal(nextCost),
      deltaBps,
      roi,
      payback,
      unlocked: canUnlockItem(state, definition),
      affordable: state.buds.greaterThanOrEqualTo(cost),
      tier,
      order: index,
    } satisfies ShopEntry;
  });
}

export function getTierInfo(owned: number): TierInfo {
  const safeOwned = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const tiersCompleted = Math.floor(safeOwned / SHOP_TIER_SIZE);
  const stage = tiersCompleted + 1;
  const progressCount = safeOwned % SHOP_TIER_SIZE;
  const completion = SHOP_TIER_SIZE > 0 ? progressCount / SHOP_TIER_SIZE : 0;
  const remainingCount = SHOP_TIER_SIZE - progressCount;
  const nextThreshold = (tiersCompleted + 1) * SHOP_TIER_SIZE;

  return {
    stage,
    progressCount,
    remainingCount,
    completion: Math.max(0, Math.min(1, completion)),
    size: SHOP_TIER_SIZE,
    nextThreshold,
  } satisfies TierInfo;
}

export function getTierMultiplier(owned: number): Decimal {
  const safeOwned = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const tiersCompleted = Math.floor(safeOwned / SHOP_TIER_SIZE);
  if (tiersCompleted <= 0) {
    return new Decimal(1);
  }

  let multiplier = new Decimal(1);
  for (let tierIndex = 1; tierIndex <= tiersCompleted; tierIndex += 1) {
    const stepBonus = tierIndex >= SHOP_TIER_SOFTCAP_STAGE ? SHOP_TIER_SOFTCAP_BONUS : SHOP_TIER_BONUS;
    multiplier = multiplier.mul(stepBonus);
  }

  return multiplier;
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

export function formatRoi(locale: LocaleKey, value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return t(locale, 'shop.roiInfinite');
  }

  const rounded = Math.max(1, Math.round(value));
  return t(locale, 'shop.roiValue', { seconds: rounded });
}

