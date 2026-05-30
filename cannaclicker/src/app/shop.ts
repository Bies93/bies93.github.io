import Decimal from 'break_infinity.js';
import { items, type ItemDefinition } from '../data/items';
import { formatDecimal } from './math';
import type { GameState } from './state';
import { t, type LocaleKey } from './i18n';

const DEFAULT_TIER_SIZE = 25;
const DEFAULT_TIER_BONUS = 1.15;
const DEFAULT_MILESTONES = [10, 25, 50, 100, 150, 200, 300, 500] as const;

export interface ShopEntry {
  definition: ItemDefinition;
  owned: number;
  cost: Decimal;
  formattedCost: string;
  quantityCost: Record<PurchaseQuantity, Decimal>;
  formattedQuantityCost: Record<PurchaseQuantity, string>;
  deltaBps: Decimal;
  currentBps: Decimal;
  nextBps: Decimal;
  productionShare: number;
  roi: number | null;
  efficient: boolean;
  unlocked: boolean;
  affordable: boolean;
  purchaseOptions: Record<PurchaseQuantity, PurchaseOption>;
  tier: TierInfo;
  softcap: SoftcapInfo;
  order: number;
}

export type PurchaseQuantity = 'one' | 'ten' | 'twentyFive' | 'max';

export interface PurchaseOption {
  quantity: number;
  cost: Decimal;
  formattedCost: string;
  deltaBps: Decimal;
  affordable: boolean;
  enabled: boolean;
  roi: number | null;
}

export interface TierInfo {
  stage: number;
  progressCount: number;
  remainingCount: number;
  completion: number;
  size: number;
  nextThreshold: number;
  bonus: number;
  milestones: readonly number[];
  nextMilestone: number | null;
  softcapTier?: number;
  softcapMult?: number;
}

export interface SoftcapInfo {
  active: boolean;
  stacks: number;
  multiplier: Decimal;
  nextThreshold: number | null;
}

interface TierConfig {
  size: number;
  bonus: number;
  milestones: readonly number[];
  softcapTier?: number;
  softcapMult?: number;
}

function resolveTierConfig(definition: ItemDefinition): TierConfig {
  const size = definition.tierSize ?? DEFAULT_TIER_SIZE;
  const bonus = definition.milestoneBonusMult ?? definition.tierBonusMult ?? DEFAULT_TIER_BONUS;
  const milestones = definition.milestoneThresholds?.length
    ? [...definition.milestoneThresholds].filter((value) => value > 0).sort((a, b) => a - b)
    : [...DEFAULT_MILESTONES];
  return {
    size: size > 0 ? size : DEFAULT_TIER_SIZE,
    bonus: bonus > 0 ? bonus : DEFAULT_TIER_BONUS,
    milestones,
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
  const safeOwned = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const completed = config.milestones.filter((threshold) => safeOwned >= threshold).length;
  const multiplier =
    completed > 0
      ? tierMultiplier(completed, 1, config.bonus, config.softcapTier, config.softcapMult)
      : 1;
  return new Decimal(multiplier);
}

function getSoftcapStacks(definition: ItemDefinition, owned: number): number {
  const copies = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const step = definition.softcapCopies ?? 0;
  if (!step || step <= 0) {
    return 0;
  }
  return Math.max(0, Math.floor(copies / step));
}

export function getSoftcapMultiplier(definition: ItemDefinition, owned: number): Decimal {
  const penalty = definition.softcapPenalty;
  if (!penalty || penalty <= 0 || penalty >= 1) {
    return new Decimal(1);
  }
  const stacks = getSoftcapStacks(definition, owned);
  if (stacks <= 0) {
    return new Decimal(1);
  }
  return new Decimal(penalty).pow(stacks);
}

export function getSoftcapInfo(definition: ItemDefinition, owned: number): SoftcapInfo {
  const multiplier = getSoftcapMultiplier(definition, owned);
  const stacks = getSoftcapStacks(definition, owned);
  const step = definition.softcapCopies ?? null;
  const nextThreshold = step && step > 0 ? (stacks + 1) * step : null;
  const active = stacks > 0 && multiplier.lessThan(1);

  return {
    active,
    stacks,
    multiplier,
    nextThreshold,
  } satisfies SoftcapInfo;
}

export function deltaBpsNextBuy(
  definition: ItemDefinition,
  owned: number,
  baseMultiplier: Decimal,
): Decimal {
  return deltaBpsForQuantity(definition, owned, 1, baseMultiplier);
}

export function getBuildingProductionAt(
  definition: ItemDefinition,
  owned: number,
  baseMultiplier: Decimal,
): Decimal {
  const perUnitBase = new Decimal(definition.bps).mul(baseMultiplier);
  const tier = getTierMultiplier(definition, owned);
  const softcap = getSoftcapMultiplier(definition, owned);
  return perUnitBase.mul(tier).mul(softcap).mul(Math.max(0, owned));
}

export function deltaBpsForQuantity(
  definition: ItemDefinition,
  owned: number,
  quantity: number,
  baseMultiplier: Decimal,
): Decimal {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
  if (safeQuantity <= 0) {
    return new Decimal(0);
  }
  const totalNow = getBuildingProductionAt(definition, owned, baseMultiplier);
  const totalNext = getBuildingProductionAt(definition, owned + safeQuantity, baseMultiplier);
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

export function getBulkCost(
  definition: ItemDefinition,
  owned: number,
  quantity: number,
  costMultiplier: Decimal = new Decimal(1),
): Decimal {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
  if (safeQuantity <= 0) {
    return new Decimal(0);
  }

  let total = new Decimal(0);
  for (let i = 0; i < safeQuantity; i += 1) {
    total = total.add(getItemCost(definition, owned + i, costMultiplier));
  }
  return total;
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
      return (state.items[itemId] ?? 0) >= (amount ?? 0);
    });
  }

  return true;
}

export function getShopEntries(state: GameState): ShopEntry[] {
  return items.map((definition, index) => {
    const owned = state.items[definition.id] ?? 0;
    const buildingCostMult = state.temp.buildingCostMultipliers?.[definition.id] ?? new Decimal(1);
    const totalCostMult = state.temp.costMultiplier.mul(buildingCostMult);
    const cost = getItemCost(definition, owned, totalCostMult);
    const tier = getTierInfo(definition, owned);
    const softcap = getSoftcapInfo(definition, owned);
    const baseMultiplier = state.temp.buildingBaseMultipliers[definition.id] ?? new Decimal(1);
    const currentBaseBps = getBuildingProductionAt(definition, owned, baseMultiplier);
    const deltaBase = deltaBpsNextBuy(definition, owned, baseMultiplier);
    const deltaBps = deltaBase.mul(state.temp.totalBpsMult);
    const currentBps = currentBaseBps.mul(state.temp.totalBpsMult);
    const nextBps = currentBps.add(deltaBps);
    const roi = deltaBps.lessThanOrEqualTo(0) ? null : Number(cost.div(deltaBps).toFixed(2));
    const purchaseOptions = createPurchaseOptions(
      state,
      definition,
      owned,
      baseMultiplier,
      totalCostMult,
    );

    return {
      definition,
      owned,
      cost,
      formattedCost: formatDecimal(cost),
      quantityCost: {
        one: purchaseOptions.one.cost,
        ten: purchaseOptions.ten.cost,
        twentyFive: purchaseOptions.twentyFive.cost,
        max: purchaseOptions.max.cost,
      },
      formattedQuantityCost: {
        one: purchaseOptions.one.formattedCost,
        ten: purchaseOptions.ten.formattedCost,
        twentyFive: purchaseOptions.twentyFive.formattedCost,
        max: purchaseOptions.max.formattedCost,
      },
      deltaBps,
      currentBps,
      nextBps,
      productionShare: state.bps.greaterThan(0)
        ? Math.max(0, Math.min(1, currentBps.div(state.bps).toNumber()))
        : 0,
      roi,
      efficient: roi !== null && roi <= 180,
      unlocked: canUnlockItem(state, definition),
      affordable: state.buds.greaterThanOrEqualTo(cost),
      purchaseOptions,
      tier,
      softcap,
      order: index,
    } satisfies ShopEntry;
  });
}

function createPurchaseOptions(
  state: GameState,
  definition: ItemDefinition,
  owned: number,
  baseMultiplier: Decimal,
  costMultiplier: Decimal,
): Record<PurchaseQuantity, PurchaseOption> {
  const maxQuantity = getMaxAffordable(definition, state);
  const fixedOptions = {
    one: 1,
    ten: 10,
    twentyFive: 25,
    max: maxQuantity,
  } satisfies Record<PurchaseQuantity, number>;

  return Object.fromEntries(
    (Object.entries(fixedOptions) as [PurchaseQuantity, number][]).map(([key, quantity]) => {
      const cost = getBulkCost(definition, owned, quantity, costMultiplier);
      const deltaBase = deltaBpsForQuantity(definition, owned, quantity, baseMultiplier);
      const deltaBps = deltaBase.mul(state.temp.totalBpsMult);
      const affordable = quantity > 0 && state.buds.greaterThanOrEqualTo(cost);
      const roi = deltaBps.lessThanOrEqualTo(0) ? null : Number(cost.div(deltaBps).toFixed(2));
      return [
        key,
        {
          quantity,
          cost,
          formattedCost: formatDecimal(cost),
          deltaBps,
          affordable,
          enabled: canUnlockItem(state, definition) && affordable && quantity > 0,
          roi,
        } satisfies PurchaseOption,
      ];
    }),
  ) as Record<PurchaseQuantity, PurchaseOption>;
}

export function getTierInfo(definition: ItemDefinition, owned: number): TierInfo {
  const config = resolveTierConfig(definition);
  const size = config.size > 0 ? config.size : DEFAULT_TIER_SIZE;
  const safeOwned = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const milestones = config.milestones;
  const tiersCompleted = milestones.filter((threshold) => safeOwned >= threshold).length;
  const nextMilestone = milestones.find((threshold) => safeOwned < threshold) ?? null;
  const previousMilestone = tiersCompleted > 0 ? milestones[tiersCompleted - 1] : 0;
  const nextThreshold = nextMilestone ?? safeOwned;
  const span = nextMilestone ? Math.max(1, nextMilestone - previousMilestone) : size;
  const progressCount = nextMilestone ? Math.max(0, safeOwned - previousMilestone) : size;
  const remainingCount = nextMilestone ? Math.max(0, nextMilestone - safeOwned) : 0;
  const completion = nextMilestone ? progressCount / span : 1;

  return {
    stage: tiersCompleted,
    progressCount,
    remainingCount,
    completion: Math.max(0, Math.min(1, completion)),
    size,
    nextThreshold,
    bonus: config.bonus,
    milestones,
    nextMilestone,
    softcapTier: config.softcapTier,
    softcapMult: config.softcapMult,
  } satisfies TierInfo;
}

export function getMaxAffordable(definition: ItemDefinition, state: GameState): number {
  if (!canUnlockItem(state, definition)) {
    return 0;
  }

  const factor = new Decimal(definition.costFactor);
  const owned = state.items[definition.id] ?? 0;
  let iterations = 0;
  let totalCost = new Decimal(0);
  const buildingCostMult = state.temp.buildingCostMultipliers?.[definition.id] ?? new Decimal(1);
  const totalCostMult = state.temp.costMultiplier.mul(buildingCostMult);
  let nextCost = getItemCost(definition, owned, totalCostMult);

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
