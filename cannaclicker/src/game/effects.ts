import Decimal from "break_infinity.js";
import type { GameState } from "../app/state";
import { researchById } from "../data/research";
import type { EffectId } from "../data/research";

export function applyEffects(state: GameState, owned: string[]): void {
  let bpsMult = new Decimal(1);
  let bpcMult = new Decimal(1);
  let costMult = new Decimal(1);
  let autoClicks = 0;
  let abilityBonus = 0;

  for (const id of owned) {
    const node = researchById.get(id);
    if (!node) {
      continue;
    }

    for (const effect of node.effects) {
      applyEffect(effect.id, effect.v ?? 0, {
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
      });
    }
  }

  if (costMult.lessThan(0.8)) {
    costMult = new Decimal(0.8);
  }

  state.temp.researchBpsMult = bpsMult;
  state.temp.researchBpcMult = bpcMult;
  state.temp.costMultiplier = costMult;
  state.temp.autoClickRate = autoClicks;
  state.temp.abilityPowerBonus = abilityBonus;
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
}

function applyEffect(id: EffectId, value: number, ctx: EffectContext): void {
  switch (id) {
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
    default:
      break;
  }
}
