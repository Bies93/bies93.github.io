import Decimal from "break_infinity.js";
import { OFFLINE_CAP_MS } from "../app/balance";
import type { GameState, SeedPassiveConfig } from "../app/state";
import { researchById, type ResearchEffect, type StrainId } from "../data/research";

export function applyEffects(state: GameState, owned: string[]): void {
  let bpsMult = new Decimal(1);
  let bpcMult = new Decimal(1);
  let costMult = new Decimal(1);
  let autoClicks = 0;
  let abilityBonus = 0;
  let abilityDurationMult = 1;
  let offlineCapBonusHours = 0;
  let hybridPerBuff = 0;
  let strainChoice: StrainId | null = null;
  let seedClickBonus = 0;
  let passiveConfig: SeedPassiveConfig | null = null;
  let passiveScore = 0;
  const buildingMultipliers = new Map<string, Decimal>();
  const buildingCostMultipliers = new Map<string, Decimal>();

  for (const id of owned) {
    const node = researchById.get(id);
    if (!node) {
      continue;
    }

    for (const effect of node.effects) {
      applyEffect(effect, {
        bpsMultRef: () => bpsMult,
        setBps: (value) => {
          bpsMult = value;
        },
        bpcMultRef: () => bpcMult,
        setBpc: (value) => {
          bpcMult = value;
        },
        getCost: () => costMult,
        setCost: (value) => {
          costMult = value;
        },
        addAutoClicks: (value) => {
          autoClicks += value;
        },
        addAbilityBonus: (value) => {
          abilityBonus += value;
        },
        multiplyAbilityDuration: (value) => {
          abilityDurationMult *= value;
        },
        addOfflineHours: (value) => {
          offlineCapBonusHours += value;
        },
        addHybridPerBuff: (value) => {
          hybridPerBuff += value;
        },
        setStrain: (value) => {
          strainChoice = value;
        },
        multiplyBuilding: (target, value) => {
          const current = buildingMultipliers.get(target) ?? new Decimal(1);
          buildingMultipliers.set(target, current.mul(value));
        },
        addSeedClickBonus: (value) => {
          seedClickBonus += value;
        },
        setSeedPassive: (config) => {
          const expected = (config.chance * config.seeds * 3_600_000) / Math.max(1, config.intervalMs);
          if (!passiveConfig || expected > passiveScore) {
            passiveConfig = config;
            passiveScore = expected;
          }
        },
      });
    }
  }

  if (costMult.lessThan(0.8)) {
    costMult = new Decimal(0.8);
  }

  const activeBuffs = countActiveBuffs(state);
  const hybridBonus = hybridPerBuff > 0 ? hybridPerBuff * activeBuffs : 0;
  if (hybridBonus > 0) {
    const hybridMult = new Decimal(1 + hybridBonus);
    bpsMult = bpsMult.mul(hybridMult);
    bpcMult = bpcMult.mul(hybridMult);
  }

  const offlineCapMs = OFFLINE_CAP_MS + Math.max(0, offlineCapBonusHours) * 60 * 60 * 1000;

  const researchBuildingMultipliers: Record<string, Decimal> = {};
  for (const [key, value] of buildingMultipliers.entries()) {
    researchBuildingMultipliers[key] = value;
  }

  const researchBuildingCostMultipliers: Record<string, Decimal> = {};
  for (const [key, value] of buildingCostMultipliers.entries()) {
    researchBuildingCostMultipliers[key] = value;
  }

  state.temp.researchBpsMult = bpsMult;
  state.temp.researchBpcMult = bpcMult;
  state.temp.costMultiplier = costMult;
  state.temp.buildingCostMultipliers = researchBuildingCostMultipliers;
  state.temp.autoClickRate = autoClicks;
  state.temp.abilityPowerBonus = abilityBonus;
  state.temp.abilityDurationMult = abilityDurationMult;
  state.temp.offlineCapMs = offlineCapMs;
  state.temp.hybridBuffPerBuff = hybridPerBuff;
  state.temp.hybridActiveBuffs = activeBuffs;
  state.temp.strainChoice = strainChoice;
  state.temp.researchBuildingMultipliers = researchBuildingMultipliers;
  state.temp.seedClickBonus = Math.max(0, Math.min(0.05, seedClickBonus));
  state.temp.seedPassiveConfig = passiveConfig;
  if (!passiveConfig) {
    state.temp.seedPassiveProgress = 0;
    state.temp.seedPassiveThrottled = false;
  }
}

interface EffectContext {
  bpsMultRef: () => Decimal;
  setBps: (value: Decimal) => void;
  bpcMultRef: () => Decimal;
  setBpc: (value: Decimal) => void;
  getCost: () => Decimal;
  setCost: (value: Decimal) => void;
  addAutoClicks: (value: number) => void;
  addAbilityBonus: (value: number) => void;
  multiplyAbilityDuration: (value: number) => void;
  addOfflineHours: (value: number) => void;
  addHybridPerBuff: (value: number) => void;
  setStrain: (value: StrainId | null) => void;
  multiplyBuilding: (target: string, value: number) => void;
  addSeedClickBonus: (value: number) => void;
  setSeedPassive: (config: SeedPassiveConfig) => void;
}

function applyEffect(effect: ResearchEffect, ctx: EffectContext): void {
  const value = effect.v ?? 0;
  switch (effect.id) {
    case "BPC_MULT": {
      const factor = Number.isFinite(value) && value > 0 ? value : 1;
      ctx.setBpc(ctx.bpcMultRef().mul(factor));
      break;
    }
    case "BPS_MULT": {
      const factor = Number.isFinite(value) && value > 0 ? value : 1;
      ctx.setBps(ctx.bpsMultRef().mul(factor));
      break;
    }
    case "COST_REDUCE_ALL": {
      const factor = Number.isFinite(value) && value > 0 ? value : 1;
      ctx.setCost(ctx.getCost().mul(factor));
      break;
    }
    case "CLICK_AUTOMATION": {
      const amount = Number.isFinite(value) ? value : 0;
      ctx.addAutoClicks(amount);
      break;
    }
    case "ABILITY_OVERDRIVE_PLUS": {
      const bonus = Number.isFinite(value) ? value : 0;
      ctx.addAbilityBonus(bonus);
      break;
    }
    case "BUILDING_MULT": {
      if (!effect.targets || !Number.isFinite(value) || value <= 0) {
        break;
      }
      const factor = value;
      for (const target of effect.targets) {
        if (typeof target === "string" && target.length > 0) {
          ctx.multiplyBuilding(target, factor);
        }
      }
      break;
    }
    case "OFFLINE_CAP_HOURS_ADD": {
      if (Number.isFinite(value) && value > 0) {
        ctx.addOfflineHours(value);
      }
      break;
    }
    case "ABILITY_DURATION_MULT": {
      const factor = Number.isFinite(value) && value > 0 ? value : 1;
      ctx.multiplyAbilityDuration(factor);
      break;
    }
    case "HYBRID_BUFF_PER_ACTIVE": {
      if (Number.isFinite(value) && value > 0) {
        ctx.addHybridPerBuff(value);
      }
      break;
    }
    case "STRAIN_CHOICE": {
      ctx.setStrain(effect.strain ?? null);
      break;
    }
    case "SEED_CLICK_BONUS": {
      const bonus = Number.isFinite(value) ? value : 0;
      if (bonus > 0) {
        ctx.addSeedClickBonus(bonus);
      }
      break;
    }
    case "SEED_PASSIVE": {
      if (effect.seedPassive) {
        const minutes = Number.isFinite(effect.seedPassive.intervalMinutes)
          ? Math.max(0.1, effect.seedPassive.intervalMinutes)
          : 0;
        const chance = Number.isFinite(effect.seedPassive.chance)
          ? Math.min(1, Math.max(0, effect.seedPassive.chance))
          : 0;
        const seeds = Number.isFinite(effect.seedPassive.seeds)
          ? Math.max(1, Math.floor(effect.seedPassive.seeds))
          : 0;
        if (minutes > 0 && chance > 0 && seeds > 0) {
          ctx.setSeedPassive({
            intervalMs: Math.floor(minutes * 60 * 1000),
            chance,
            seeds,
          });
        }
      }
      break;
    }
    default:
      break;
  }
}

function countActiveBuffs(state: GameState): number {
  let count = 0;

  for (const ability of Object.values(state.abilities)) {
    if (ability?.active) {
      count += 1;
    }
  }

  if (state.temp.activeEventBoost) {
    count += 1;
  }

  return count;
}
