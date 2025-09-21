import Decimal from 'break_infinity.js';
import { items, type ItemDefinition } from '../data/items';
import { formatDecimal } from './math';
import type { GameState } from './state';
import { t, type LocaleKey } from './i18n';

const DEFAULT_TIER_SIZE = 25;
const DEFAULT_TIER_BONUS = 1.15;

export interface ShopEntry {
  definition: ItemDefinition;
  owned: number;
  cost: Decimal;
  formattedCost: string;
  deltaBps: Decimal;
  roi: number | null;
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
  bonus: number;
  softcapTier?: number;
  softcapMult?: number;
}

interface TierConfig {
  size: number;
  bonus: number;
  softcapTier?: number;
  softcapMult?: number;
}

function resolveTierConfig(definition: ItemDefinition): TierConfig {
  const size = definition.tierSize ?? DEFAULT_TIER_SIZE;
  const bonus = definition.tierBonusMult ?? DEFAULT_TIER_BONUS;
  return {
    size: size > 0 ? size : DEFAULT_TIER_SIZE,
    bonus: bonus > 0 ? bonus : DEFAULT_TIER_BONUS,
    softcapTier: definition.softcapTier,
    softcapMult: definition.softcapMult,
  } satisfies TierConfig;
}

export function tierMultiplier(
  count: number,
  tierSize: number,
  bonus: number,
  softcapTier?: number,
  softcapMult?: number,
): number {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const safeSize = tierSize > 0 ? tierSize : DEFAULT_TIER_SIZE;
  const tiers = safeSize > 0 ? Math.floor(safeCount / safeSize) : 0;
  if (!softcapTier || !softcapMult || tiers <= softcapTier) {
    return Math.pow(bonus, tiers);
  }
  const pre = Math.pow(bonus, softcapTier);
  const post = Math.pow(softcapMult, tiers - softcapTier);
  return pre * post;
}

export function getTierMultiplier(definition: ItemDefinition, owned: number): Decimal {
  const config = resolveTierConfig(definition);
  const multiplier = tierMultiplier(owned, config.size, config.bonus, config.softcapTier, config.softcapMult);
  return new Decimal(multiplier);
}

export function deltaBpsNextBuy(
  definition: ItemDefinition,
  owned: number,
  baseMultiplier: Decimal,
): Decimal {
  const perUnitBase = new Decimal(definition.bps).mul(baseMultiplier);
  const currentMultiplier = getTierMultiplier(definition, owned);
  const nextMultiplier = getTierMultiplier(definition, owned + 1);
  const totalNow = perUnitBase.mul(currentMultiplier).mul(owned);
  const totalNext = perUnitBase.mul(nextMultiplier).mul(owned + 1);
  return totalNext.sub(totalNow);
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
    const tier = getTierInfo(definition, owned);
    const baseMultiplier = state.temp.buildingBaseMultipliers[definition.id] ?? new Decimal(1);
    const deltaBase = deltaBpsNextBuy(definition, owned, baseMultiplier);
    const deltaBps = deltaBase.mul(state.temp.totalBpsMult);
    const roi = deltaBps.lessThanOrEqualTo(0) ? null : Number(cost.div(deltaBps).toFixed(2));

    return {
      definition,
      owned,
      cost,
      formattedCost: formatDecimal(cost),
      deltaBps,
      roi,
      unlocked: canUnlockItem(state, definition),
      affordable: state.buds.greaterThanOrEqualTo(cost),
      tier,
      order: index,
    } satisfies ShopEntry;
  });
}

export function getTierInfo(definition: ItemDefinition, owned: number): TierInfo {
  const config = resolveTierConfig(definition);
  const size = config.size > 0 ? config.size : DEFAULT_TIER_SIZE;
  const safeOwned = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const tiersCompleted = size > 0 ? Math.floor(safeOwned / size) : 0;
  const progressCount = size > 0 ? safeOwned % size : 0;
  const remainingCount = size > 0 ? size - progressCount : 0;
  const completion = size > 0 ? progressCount / size : 0;
  const nextThreshold = size > 0 ? (tiersCompleted + 1) * size : safeOwned;

  return {
    stage: tiersCompleted,
    progressCount,
    remainingCount,
    completion: Math.max(0, Math.min(1, completion)),
    size,
    nextThreshold,
    bonus: config.bonus,
    softcapTier: config.softcapTier,
    softcapMult: config.softcapMult,
  } satisfies TierInfo;
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

export function formatRoi(locale: LocaleKey, value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return t(locale, 'shop.roiInfinite');
  }

  const rounded = Math.max(1, Math.round(value));
  return t(locale, 'shop.roiValue', { seconds: rounded });
}

