import Decimal from 'break_infinity.js';
import { itemById } from '../data/items';
import type { ItemId } from '../data/items';
import { achievements } from '../data/achievements';
import { upgradeById, upgrades, type UpgradeId } from '../data/upgrades';
import { canUnlockItem, getBulkCost, getTierMultiplier, getSoftcapMultiplier } from './shop';
import type { GameState } from './state';
import { sum, toDecimal } from './math';
import { applyResearchEffects } from './research';
import { abilityAutoClickRate, abilityMultiplierFor } from './abilities';
import { requirementsSatisfied } from './upgrades';
import { computeMilestones, resolveKickstart } from './milestones';
import { recordInteraction, checkSeedSynergies } from './seeds';
import { achievementRequirementMet, getAchievementScoreMultiplier } from './achievements';
import { applyAscensionEffects } from './ascension';
import { getItemSynergyMultiplier } from './itemSynergies';
import { applyDepthEffects, awardStrainXp } from './depth';

export function handleManualClick(state: GameState): Decimal {
  const now = Date.now();
  recordInteraction(state);
  state.meta.manualClicks += 1;
  const comboMultiplier = resolveManualClickCombo(state, now);
  const critMultiplier = resolveManualClickCrit(state);
  const gained = state.bpc.mul(comboMultiplier).mul(critMultiplier);
  state.buds = state.buds.add(gained);
  state.total = state.total.add(gained);
  state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gained);
  awardStrainXp(state, state.temp.lastClickCritical ? 3 : 1);
  return gained;
}

export function recalcDerivedValues(state: GameState): void {
  applyResearchEffects(state);
  applyAscensionEffects(state);
  applyDepthEffects(state);

  const milestoneResult = computeMilestones(state);
  state.temp.milestoneProgress = milestoneResult.progress;
  state.temp.milestoneGlobalMult = milestoneResult.effects.global;
  state.temp.milestoneBpsMult = milestoneResult.effects.bps;
  state.temp.milestoneBpcMult = milestoneResult.effects.bpc;
  state.temp.milestoneActiveCount = milestoneResult.effects.activeCount;
  state.temp.nextKickstartLevel = milestoneResult.highestKickstartLevel;

  const kickstartSnapshot = resolveKickstart(state, Date.now());
  const kickstartBpsMult = new Decimal(kickstartSnapshot.bpsMult);
  const kickstartBpcMult = new Decimal(kickstartSnapshot.bpcMult);
  const kickstartCostMult = new Decimal(kickstartSnapshot.costMult);
  state.temp.kickstartBpsMult = kickstartBpsMult;
  state.temp.kickstartBpcMult = kickstartBpcMult;
  state.temp.kickstartCostMult = kickstartCostMult;
  state.temp.kickstartLevel = kickstartSnapshot.active ? kickstartSnapshot.level : 0;
  state.temp.kickstartDurationMs = kickstartSnapshot.durationMs;
  state.temp.kickstartRemainingMs = kickstartSnapshot.remainingMs;
  state.temp.kickstartEndsAt = kickstartSnapshot.endsAt;

  const {
    globalMultiplier,
    buildingMultipliers,
    buildingCostMultipliers,
    clickMultiplier,
    autoClickRate,
    seedClickBonus,
    eventRewardMultiplier,
    eventSpawnRateMultiplier,
    eventDurationMultiplier,
    clickBpsSeconds,
    clickCritChance,
    automationBpsShare,
    softcapRelief,
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

  const combinedCostMultipliers = new Map<ItemId, Decimal>();
  const baseCostMultipliers = state.temp.buildingCostMultipliers ?? {};
  for (const [key, value] of Object.entries(baseCostMultipliers) as [ItemId, Decimal][]) {
    const multiplier = value instanceof Decimal ? value : new Decimal(value);
    combinedCostMultipliers.set(key, multiplier);
  }

  for (const [target, multiplier] of buildingCostMultipliers.entries()) {
    const current = combinedCostMultipliers.get(target) ?? new Decimal(1);
    combinedCostMultipliers.set(target, current.mul(multiplier));
  }

  const nextCostMultipliers: Partial<Record<ItemId, Decimal>> = {};
  for (const [key, value] of combinedCostMultipliers.entries()) {
    nextCostMultipliers[key] = value;
  }
  state.temp.buildingCostMultipliers = nextCostMultipliers;
  state.temp.autoClickRate += autoClickRate;
  state.temp.autoClickRate += abilityAutoClickRate(state);
  state.temp.automationBpsShare = Math.max(
    0,
    Math.min(0.25, (state.temp.automationBpsShare ?? 0) + automationBpsShare),
  );
  state.temp.seedClickBonus = Math.max(
    0,
    Math.min(0.05, (state.temp.seedClickBonus ?? 0) + seedClickBonus),
  );
  state.temp.clickBpsSeconds = Math.max(
    0,
    Math.min(0.4, (state.temp.clickBpsSeconds ?? 0) + clickBpsSeconds),
  );
  state.temp.clickCritChance = Math.max(
    0,
    Math.min(0.45, (state.temp.clickCritChance ?? 0) + clickCritChance),
  );
  state.temp.softcapRelief = Math.max(
    0,
    Math.min(0.8, (state.temp.softcapRelief ?? 0) + softcapRelief),
  );
  state.temp.eventRewardMult = Math.max(
    1,
    (state.temp.eventRewardMult ?? 1) * eventRewardMultiplier,
  );
  state.temp.eventSpawnRateMult = Math.max(
    0.5,
    (state.temp.eventSpawnRateMult ?? 1) * eventSpawnRateMultiplier,
  );
  state.temp.eventDurationMult = Math.max(
    0.5,
    (state.temp.eventDurationMult ?? 1) * eventDurationMultiplier,
  );

  const prestigeMultiplier = state.prestige.mult;
  const milestoneGlobalMult = state.temp.milestoneGlobalMult ?? new Decimal(1);
  const milestoneBpsMult = state.temp.milestoneBpsMult ?? new Decimal(1);
  const milestoneBpcMult = state.temp.milestoneBpcMult ?? new Decimal(1);
  const kickstartGlobalCost = state.temp.kickstartCostMult ?? new Decimal(1);
  const kickstartBps = state.temp.kickstartBpsMult ?? new Decimal(1);
  const kickstartBpc = state.temp.kickstartBpcMult ?? new Decimal(1);
  const abilityCostMult = new Decimal(abilityMultiplierFor(state, 'cost'));
  const eventCostMult = state.temp.eventCostMult ?? new Decimal(1);
  state.temp.costMultiplier = state.temp.costMultiplier
    .mul(kickstartGlobalCost)
    .mul(state.temp.depthCostMult ?? new Decimal(1))
    .mul(abilityCostMult)
    .mul(eventCostMult);

  const buildingProduction = Array.from(itemById.entries()).map(([id, definition]) => {
    const owned = state.items[id] ?? 0;
    const baseMultiplier = buildingMultipliers.get(id) ?? new Decimal(1);
    const synergyMultiplier = getItemSynergyMultiplier(state, id);
    const totalBaseMultiplier = baseMultiplier.mul(synergyMultiplier);
    const tierMultiplier = getTierMultiplier(definition, owned);
    const softcapMultiplier = getSoftcapMultiplier(
      definition,
      owned,
      state.temp.softcapRelief ?? 0,
    );
    state.temp.buildingBaseMultipliers[id] = totalBaseMultiplier;
    state.temp.buildingTierMultipliers[id] = tierMultiplier;

    if (!owned) {
      return new Decimal(0);
    }

    const totalMultiplier = totalBaseMultiplier.mul(tierMultiplier).mul(softcapMultiplier);
    return new Decimal(definition.bps).mul(owned).mul(totalMultiplier);
  });

  const achievementMultiplier = collectAchievementMultiplier(state);
  const baseMultiplier = globalMultiplier
    .mul(achievementMultiplier)
    .mul(prestigeMultiplier)
    .mul(milestoneGlobalMult)
    .mul(state.temp.depthGlobalMult ?? new Decimal(1));
  const researchBpsMult = state.temp.researchBpsMult ?? new Decimal(1);
  const researchBpcMult = state.temp.researchBpcMult ?? new Decimal(1);
  const abilityBpsMult = new Decimal(abilityMultiplierFor(state, 'bps'));
  const abilityBpcMult = new Decimal(abilityMultiplierFor(state, 'bpc'));
  const eventBpsMult = state.temp.eventBpsMult ?? new Decimal(1);
  const eventBpcMult = state.temp.eventBpcMult ?? new Decimal(1);

  const totalBpsMultiplier = baseMultiplier
    .mul(researchBpsMult)
    .mul(abilityBpsMult)
    .mul(eventBpsMult)
    .mul(milestoneBpsMult)
    .mul(kickstartBps);
  const totalBpcMultiplier = baseMultiplier
    .mul(clickMultiplier)
    .mul(state.temp.depthBpcMult ?? new Decimal(1))
    .mul(researchBpcMult)
    .mul(abilityBpcMult)
    .mul(eventBpcMult)
    .mul(milestoneBpcMult)
    .mul(kickstartBpc);

  state.bps = state.temp.challengeDisablePassiveProduction
    ? new Decimal(0)
    : sum(...buildingProduction).mul(totalBpsMultiplier);
  const bpsClickComponent = state.bps.mul(Math.max(0, state.temp.clickBpsSeconds ?? 0));
  state.bpc = new Decimal(1).add(bpsClickComponent).mul(totalBpcMultiplier);
  state.temp.totalBpsMult = totalBpsMultiplier;
  state.temp.totalBpcMult = totalBpcMultiplier;
}

export function buyItem(state: GameState, itemId: ItemId, quantity = 1): boolean {
  const definition = itemById.get(itemId);
  if (!definition) {
    return false;
  }

  if (!canUnlockItem(state, definition)) {
    return false;
  }

  const owned = state.items[itemId] ?? 0;
  if (
    state.temp.challengeMaxPerItem !== null &&
    owned + quantity > state.temp.challengeMaxPerItem
  ) {
    return false;
  }
  const buildingCostMult = state.temp.buildingCostMultipliers?.[itemId] ?? new Decimal(1);
  const totalCostMult = state.temp.costMultiplier.mul(buildingCostMult);
  const totalCost = getBulkCost(definition, owned, quantity, totalCostMult);

  if (state.buds.lessThan(totalCost)) {
    return false;
  }

  state.buds = state.buds.sub(totalCost);
  state.items[itemId] = owned + quantity;
  state.meta.totalItemsPurchased += quantity;
  awardStrainXp(state, Math.max(1, quantity));
  checkSeedSynergies(state);
  recordInteraction(state);
  recalcDerivedValues(state);
  evaluateAchievements(state);
  return true;
}

export function buyUpgrade(state: GameState, upgradeId: UpgradeId): boolean {
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
  state.meta.totalUpgradesPurchased += 1;
  awardStrainXp(state, 12);
  recordInteraction(state);
  recalcDerivedValues(state);
  evaluateAchievements(state);
  return true;
}

export function evaluateAchievements(state: GameState): void {
  for (const achievement of achievements) {
    if (state.achievements[achievement.id]) {
      continue;
    }

    if (achievementRequirementMet(state, achievement)) {
      state.achievements[achievement.id] = true;
    }
  }

  recalcDerivedValues(state);
}

function collectUpgradeEffects(state: GameState): {
  globalMultiplier: Decimal;
  buildingMultipliers: Map<ItemId, Decimal>;
  buildingCostMultipliers: Map<ItemId, Decimal>;
  clickMultiplier: Decimal;
  autoClickRate: number;
  seedClickBonus: number;
  eventRewardMultiplier: number;
  eventSpawnRateMultiplier: number;
  eventDurationMultiplier: number;
  clickBpsSeconds: number;
  clickCritChance: number;
  automationBpsShare: number;
  softcapRelief: number;
} {
  const buildingMultipliers = new Map<ItemId, Decimal>();
  const buildingCostMultipliers = new Map<ItemId, Decimal>();
  let globalMultiplier = new Decimal(1);
  let clickMultiplier = new Decimal(1);
  let autoClickRate = 0;
  let seedClickBonus = 0;
  let eventRewardMultiplier = 1;
  let eventSpawnRateMultiplier = 1;
  let eventDurationMultiplier = 1;
  let clickBpsSeconds = 0;
  let clickCritChance = 0;
  let automationBpsShare = 0;
  let softcapRelief = 0;

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
        case 'seedClickBonus': {
          seedClickBonus += effect.value;
          break;
        }
        case 'clickBpsSeconds': {
          clickBpsSeconds += effect.value;
          break;
        }
        case 'clickCritChance': {
          clickCritChance += effect.value;
          break;
        }
        case 'automationBpsShare': {
          automationBpsShare += effect.value;
          break;
        }
        case 'softcapRelief': {
          softcapRelief += effect.value;
          break;
        }
        case 'eventRewardMultiplier': {
          eventRewardMultiplier *= effect.value;
          break;
        }
        case 'eventSpawnRateMultiplier': {
          eventSpawnRateMultiplier *= effect.value;
          break;
        }
        case 'eventDurationMultiplier': {
          eventDurationMultiplier *= effect.value;
          break;
        }
        default:
          break;
      }
    }
  }

  return {
    globalMultiplier,
    buildingMultipliers,
    buildingCostMultipliers,
    clickMultiplier,
    autoClickRate,
    seedClickBonus,
    eventRewardMultiplier,
    eventSpawnRateMultiplier,
    eventDurationMultiplier,
    clickBpsSeconds,
    clickCritChance,
    automationBpsShare,
    softcapRelief,
  };
}

function resolveManualClickCombo(state: GameState, now: number): number {
  const previousExpiresAt = state.temp.clickComboExpiresAt ?? 0;
  const previousCount = previousExpiresAt > now ? state.temp.clickComboCount : 0;
  const count = Math.min(80, previousCount + 1);
  const chainMultiplier = abilityMultiplierFor(state, 'chain');
  const comboPower = Math.max(1, state.temp.clickComboMult ?? 1);
  const stepBonus = 0.012 * comboPower * chainMultiplier;
  const bonus = Math.min(0.9, Math.floor(count / 5) * stepBonus);

  state.temp.clickComboCount = count;
  state.temp.clickComboExpiresAt = now + 1600;
  return 1 + bonus;
}

function resolveManualClickCrit(state: GameState): number {
  const chance = Math.max(0, Math.min(0.5, state.temp.clickCritChance ?? 0));
  const critical = chance > 0 && Math.random() < chance;
  state.temp.lastClickCritical = critical;
  if (!critical) {
    return 1;
  }

  return Math.max(1, state.temp.clickCritMult ?? 2);
}

function collectAchievementMultiplier(state: GameState): Decimal {
  return achievements.reduce(
    (acc, achievement) => {
      if (!state.achievements[achievement.id]) {
        return acc;
      }

      if (!achievement.rewardMultiplier) {
        return acc;
      }

      return acc.mul(achievement.rewardMultiplier);
    },
    new Decimal(getAchievementScoreMultiplier(state)),
  );
}
