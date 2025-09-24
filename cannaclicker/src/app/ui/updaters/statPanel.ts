import { t } from "../../i18n";
import { formatDecimal } from "../../math";
import type { GameState } from "../../state";
import { getPrestigePreview } from "../../prestige";
import type { UIRefs } from "../types";
import { formatInteger } from "../utils/format";
import { formatPermanentBonusSummary } from "../utils/format";
import { formatSeedRate } from "./stats";
import { updatePlantStage } from "./plant";

export function updateStats(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  refs.total.textContent = formatDecimal(state.total);
  const seedText = formatInteger(state.locale, state.prestige.seeds);
  refs.seeds.textContent = seedText;
  const seedRateValue = formatSeedRate(state.locale, state.temp.seedRatePerHour ?? 0);
  refs.seedRate.textContent = seedRateValue;
  refs.prestigeMult.textContent = `${state.prestige.mult.toFixed(2)}\u00D7`;

  refs.seedBadgeValue.textContent = seedText;
  const seedRateMeta = refs.statsMeta.get("stats.seedRate");
  if (seedRateMeta) {
    if (state.temp.seedPassiveThrottled) {
      const capText = formatSeedRate(state.locale, state.temp.seedRateCap ?? 0);
      seedRateMeta.textContent = t(state.locale, "stats.seedRate.throttled", { cap: capText });
    } else if (state.temp.seedPassiveConfig) {
      const config = state.temp.seedPassiveConfig;
      const progress = Math.round(Math.max(0, Math.min(1, state.temp.seedPassiveProgress ?? 0)) * 100);
      const chance = Math.round(Math.max(0, Math.min(1, config.chance)) * 100);
      const minutes = Math.max(1, Math.round(config.intervalMs / 60000));
      const seeds = formatInteger(state.locale, config.seeds);
      seedRateMeta.textContent = t(state.locale, "stats.seedRate.metaPassive", {
        progress,
        chance,
        minutes,
        seeds,
      });
    } else {
      seedRateMeta.textContent = t(state.locale, "stats.seedRate.metaNoPassive");
    }
  }
  const canPrestige = preview.requirementMet;
  const badgeTooltip = canPrestige
    ? t(state.locale, "prestige.badge.tooltip", {
        bonus: formatPermanentBonusSummary(state.locale, preview),
      })
    : t(state.locale, "prestige.control.locked", {
        requirement: formatDecimal(preview.requirementTarget),
      });
  refs.seedBadge.classList.toggle("is-ready", canPrestige);
  refs.seedBadge.setAttribute("title", badgeTooltip);
  refs.seedBadge.setAttribute("aria-label", badgeTooltip);

  updatePlantStage(state, refs);
}
