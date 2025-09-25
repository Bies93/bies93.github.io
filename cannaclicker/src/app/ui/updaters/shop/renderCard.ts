import { t } from "../../../i18n";
import type { GameState } from "../../../state";
import { formatTierBonus } from "../stats";
import { createItemSrcset } from "../../components/media";
import {
  formatRoi,
  getMaxAffordable,
  type ShopEntry,
} from "../../../shop";
import type { ShopCardRefs } from "../../types";

export function renderShopCard(
  state: GameState,
  card: ShopCardRefs,
  entry: ShopEntry,
): void {
  const locale = state.locale;

  updateCoreDetails(card, entry, locale);
  updateRoi(card, entry, locale);
  updateTierProgress(card, entry, locale);
  updateSoftcapBadge(card, entry, locale);
  updateAffordability(card, entry, state);
  updateCostAndOwned(card, entry);
}

function updateCoreDetails(card: ShopCardRefs, entry: ShopEntry, locale: GameState["locale"]): void {
  const definition = entry.definition;
  card.icon.src = definition.icon;
  card.icon.srcset = createItemSrcset(definition.icon);
  card.icon.alt = definition.name[locale];

  card.name.textContent = definition.name[locale];
  card.description.textContent = definition.description[locale];
  card.costLabel.textContent = t(locale, "shop.cost");
  card.ownedLabel.textContent = t(locale, "shop.owned");
  card.buyButton.textContent = t(locale, "actions.buy");
  card.maxButton.textContent = t(locale, "actions.max");
}

function updateRoi(card: ShopCardRefs, entry: ShopEntry, locale: GameState["locale"]): void {
  const roiText = formatRoi(locale, entry.roi);
  card.roiValue.textContent = roiText;
  card.roiBadge.dataset.variant = resolveRoiVariant(entry.roi);
  card.roiBadge.setAttribute("aria-label", roiText);
  card.roiBadge.setAttribute("title", roiText);
}

function updateTierProgress(card: ShopCardRefs, entry: ShopEntry, locale: GameState["locale"]): void {
  const stageLabel = t(locale, "shop.stageLabel", { level: entry.tier.stage });
  card.stageLabel.textContent = stageLabel;

  const tierTooltip = t(locale, "shop.stageTooltip", {
    bonus: formatTierBonus(locale, entry.tier.bonus),
    count: entry.tier.size,
  });
  card.stageLabel.setAttribute("title", tierTooltip);
  card.stageLabel.setAttribute("aria-label", `${stageLabel} (${tierTooltip})`);

  const stageProgressLabel = t(locale, "shop.stageProgress", {
    remaining: entry.tier.remainingCount,
    next: entry.tier.stage + 1,
  });
  card.stageProgressText.textContent = stageProgressLabel;
  card.stageProgressText.setAttribute("title", stageProgressLabel);
  card.stageProgressText.setAttribute("aria-label", stageProgressLabel);

  const progressPercent = Math.max(0, Math.min(1, entry.tier.completion));
  card.stageProgressBar.style.width = `${(progressPercent * 100).toFixed(2)}%`;
}

function updateSoftcapBadge(card: ShopCardRefs, entry: ShopEntry, locale: GameState["locale"]): void {
  if (!entry.softcap.active) {
    card.softcapBadge.textContent = "";
    card.softcapBadge.classList.add("hidden");
    card.softcapBadge.removeAttribute("title");
    card.softcapBadge.removeAttribute("aria-label");
    return;
  }

  const badgeText = t(locale, "shop.softcapBadge", { stacks: entry.softcap.stacks });
  const reduction = Math.max(0, 1 - entry.softcap.multiplier.toNumber());
  const reductionPercent = (reduction * 100).toFixed(1);
  const nextThreshold = entry.softcap.nextThreshold;
  const tooltipKey = nextThreshold ? "shop.softcapTooltipNext" : "shop.softcapTooltipMax";
  const tooltip = t(locale, tooltipKey, {
    percent: reductionPercent,
    next: nextThreshold?.toString() ?? "—",
  });

  card.softcapBadge.textContent = badgeText;
  card.softcapBadge.classList.remove("hidden");
  card.softcapBadge.setAttribute("title", tooltip);
  card.softcapBadge.setAttribute("aria-label", tooltip);
}

function updateAffordability(card: ShopCardRefs, entry: ShopEntry, state: GameState): void {
  if (entry.unlocked) {
    card.container.classList.remove("opacity-40");
    card.container.classList.remove("is-locked");
    card.buyButton.disabled = !entry.affordable;
    const maxAffordable = getMaxAffordable(entry.definition, state);
    card.maxButton.disabled = maxAffordable === 0;
  } else {
    card.container.classList.add("opacity-40");
    card.container.classList.add("is-locked");
    card.buyButton.disabled = true;
    card.maxButton.disabled = true;
  }

  const affordable = entry.affordable && entry.unlocked;
  card.container.dataset.locked = entry.unlocked ? "false" : "true";
  card.container.dataset.affordable = affordable ? "true" : "false";
  card.container.classList.toggle("is-affordable", affordable);
}

function updateCostAndOwned(card: ShopCardRefs, entry: ShopEntry): void {
  card.cost.textContent = entry.formattedCost;
  card.owned.textContent = entry.owned.toString();
}

function resolveRoiVariant(roi: number | null): "fast" | "medium" | "slow" | "none" {
  if (roi === null || !Number.isFinite(roi)) {
    return "none";
  }

  if (roi < 120) {
    return "fast";
  }

  if (roi <= 600) {
    return "medium";
  }

  return "slow";
}
