import { t, type LocaleKey } from "../../../i18n";
import { formatDecimal } from "../../../math";
import type { GameState } from "../../../state";
import type { ResearchLockReason } from "../../../research";
import type { ResearchEffect, ResearchUnlockCondition } from "../../../../data/research";

export function formatResearchEffect(locale: LocaleKey, effect: ResearchEffect): string {
  if (effect.labelKey) {
    if (effect.id === "BUILDING_MULT") {
      const factor = Number.isFinite(effect.v) && effect.v ? effect.v : 1;
      return t(locale, effect.labelKey, { value: factor.toFixed(2) });
    }

    if (effect.id === "HYBRID_BUFF_PER_ACTIVE") {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, effect.labelKey, { percent });
    }

    if (effect.id === "STRAIN_CHOICE") {
      return t(locale, effect.labelKey);
    }
  }

  switch (effect.id) {
    case "BPC_MULT":
      return t(locale, "research.effect.bpc", { value: (effect.v ?? 1).toFixed(2) });
    case "BPS_MULT":
      return t(locale, "research.effect.bps", { value: (effect.v ?? 1).toFixed(2) });
    case "COST_REDUCE_ALL": {
      const percent = Math.round((1 - (effect.v ?? 1)) * 100);
      return t(locale, "research.effect.cost", { value: percent });
    }
    case "CLICK_AUTOMATION":
      return t(locale, "research.effect.autoclick", { value: effect.v ?? 0 });
    case "ABILITY_OVERDRIVE_PLUS": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.overdrive", { value: percent });
    }
    case "OFFLINE_CAP_HOURS_ADD": {
      const hours = Math.round(effect.v ?? 0);
      return t(locale, "research.effect.offline", { value: hours });
    }
    case "ABILITY_DURATION_MULT": {
      const percent = Math.round(((effect.v ?? 1) - 1) * 100);
      return t(locale, "research.effect.abilityDuration", { value: percent });
    }
    case "HYBRID_BUFF_PER_ACTIVE": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.hybridBuff", { percent });
    }
    case "STRAIN_CHOICE":
      return "";
    case "SEED_CLICK_BONUS": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.seedClick", { value: percent });
    }
    case "SEED_PASSIVE": {
      if (effect.seedPassive) {
        const minutes = Math.round(effect.seedPassive.intervalMinutes);
        const chance = Math.round(effect.seedPassive.chance * 100);
        const seeds = Math.max(1, Math.floor(effect.seedPassive.seeds));
        return t(locale, "research.effect.seedPassive", {
          minutes,
          chance,
          seeds,
        });
      }
      return "";
    }
    default:
      return "";
  }
}

export function formatResearchLockReason(state: GameState, reason: ResearchLockReason): string {
  const locale = state.locale;
  if (reason.kind === "exclusive") {
    return t(locale, "research.lock.exclusive");
  }

  const entries = reason.conditions
    .map((condition) => describeUnlockCondition(state, condition))
    .filter((text): text is string => text.length > 0);

  const list = entries.join(", ");
  if (reason.kind === "unlock_all") {
    return t(locale, "research.lock.all", { list });
  }

  return t(locale, "research.lock.any", { list });
}

export function describeUnlockCondition(
  state: GameState,
  condition: ResearchUnlockCondition,
): string {
  const locale = state.locale;
  switch (condition.type) {
    case "total_buds":
      return t(locale, "research.lock.totalBuds", { value: formatDecimal(condition.value) });
    case "prestige_seeds":
      return t(locale, "research.lock.prestigeSeeds", {
        value: condition.value,
        current: state.prestige.seeds,
      });
    default:
      return "";
  }
}
