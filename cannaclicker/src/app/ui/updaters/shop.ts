import { t } from "../../i18n";
import type { GameState } from "../../state";
import { buildItemSrcset } from "../components/media";
import { createDetail } from "../components/stats";
import { formatTierBonus } from "./stats";
import { buyItem } from "../../game";
import { save } from "../../save";
import {
  getShopEntries,
  getMaxAffordable,
  formatRoi,
  type ShopEntry,
} from "../../shop";
import { itemById } from "../../data/items";
import type { ShopCardRefs, UIRefs } from "../types";

export interface ShopUpdateOptions {
  onPurchase: () => void;
}

export function updateShop(state: GameState, refs: UIRefs, options: ShopUpdateOptions): void {
  const entries = getShopEntries(state);
  const sorted = sortShopEntries(entries);

  sorted.forEach((entry, index) => {
    let card = refs.shopEntries.get(entry.definition.id);
    if (!card) {
      card = createShopCard(entry.definition.id, state, options);
      refs.shopEntries.set(entry.definition.id, card);
    }

    const iconPath = entry.definition.icon;
    card.icon.src = iconPath;
    card.icon.srcset = buildItemSrcset(iconPath);
    card.icon.alt = entry.definition.name[state.locale];

    card.name.textContent = entry.definition.name[state.locale];
    card.description.textContent = entry.definition.description[state.locale];
    card.costLabel.textContent = t(state.locale, "shop.cost");
    card.ownedLabel.textContent = t(state.locale, "shop.owned");
    card.buyButton.textContent = t(state.locale, "actions.buy");
    card.maxButton.textContent = t(state.locale, "actions.max");

    const roiText = formatRoi(state.locale, entry.roi);
    card.roiValue.textContent = roiText;
    card.roiBadge.dataset.variant = resolveRoiVariant(entry.roi);
    card.roiBadge.setAttribute("aria-label", roiText);
    card.roiBadge.setAttribute("title", roiText);

    const stageLabel = t(state.locale, "shop.stageLabel", { level: entry.tier.stage });
    card.stageLabel.textContent = stageLabel;
    const tierTooltip = t(state.locale, "shop.stageTooltip", {
      bonus: formatTierBonus(state.locale, entry.tier.bonus),
      count: entry.tier.size,
    });
    card.stageLabel.setAttribute("title", tierTooltip);
    card.stageLabel.setAttribute("aria-label", `${stageLabel} (${tierTooltip})`);
    const stageProgressLabel = t(state.locale, "shop.stageProgress", {
      remaining: entry.tier.remainingCount,
      next: entry.tier.stage + 1,
    });
    card.stageProgressText.textContent = stageProgressLabel;
    card.stageProgressText.setAttribute("title", stageProgressLabel);
    card.stageProgressText.setAttribute("aria-label", stageProgressLabel);
    const progressPercent = Math.max(0, Math.min(1, entry.tier.completion));
    card.stageProgressBar.style.width = `${(progressPercent * 100).toFixed(2)}%`;

    if (entry.softcap.active) {
      const badgeText = t(state.locale, "shop.softcapBadge", { stacks: entry.softcap.stacks });
      const reduction = Math.max(0, 1 - entry.softcap.multiplier.toNumber());
      const reductionPercent = (reduction * 100).toFixed(1);
      const nextThreshold = entry.softcap.nextThreshold;
      const tooltipKey = nextThreshold ? "shop.softcapTooltipNext" : "shop.softcapTooltipMax";
      const tooltip = t(state.locale, tooltipKey, {
        percent: reductionPercent,
        next: nextThreshold?.toString() ?? "—",
      });
      card.softcapBadge.textContent = badgeText;
      card.softcapBadge.classList.remove("hidden");
      card.softcapBadge.setAttribute("title", tooltip);
      card.softcapBadge.setAttribute("aria-label", tooltip);
    } else {
      card.softcapBadge.textContent = "";
      card.softcapBadge.classList.add("hidden");
      card.softcapBadge.removeAttribute("title");
      card.softcapBadge.removeAttribute("aria-label");
    }

    if (entry.unlocked) {
      card.container.classList.remove("opacity-40");
      card.container.classList.remove("is-locked");
      card.buyButton.disabled = !entry.affordable;
      card.maxButton.disabled = getMaxAffordable(entry.definition, state) === 0;
    } else {
      card.container.classList.add("opacity-40");
      card.container.classList.add("is-locked");
      card.buyButton.disabled = true;
      card.maxButton.disabled = true;
    }

    card.container.dataset.locked = entry.unlocked ? "false" : "true";
    card.container.dataset.affordable = entry.affordable && entry.unlocked ? "true" : "false";
    card.container.classList.toggle("is-affordable", entry.affordable && entry.unlocked);
    card.cost.textContent = entry.formattedCost;
    card.owned.textContent = entry.owned.toString();

    const list = refs.sidePanel.shop.list;
    const currentChild = list.children.item(index);
    if (currentChild !== card.container) {
      list.insertBefore(card.container, currentChild ?? null);
    }
  });
}

function createShopCard(itemId: string, state: GameState, options: ShopUpdateOptions): ShopCardRefs {
  const definition = itemById.get(itemId);
  if (!definition) {
    throw new Error(`Unknown item ${itemId}`);
  }

  const container = document.createElement("article");
  container.className =
    "relative grid gap-4 rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-card backdrop-blur-sm transition hover:border-emerald-400/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5";
  container.classList.add("shop-card");

  const info = document.createElement("div");
  info.className = "flex flex-col gap-3";

  const headerRow = document.createElement("div");
  headerRow.className = "flex items-start justify-between gap-3";

  const titleWrap = document.createElement("div");
  titleWrap.className = "space-y-1 flex-1";

  const name = document.createElement("h3");
  name.className = "text-lg font-semibold text-neutral-100";
  name.textContent = definition.name[state.locale];
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm leading-snug text-neutral-400";
  description.textContent = definition.description[state.locale];
  titleWrap.appendChild(description);

  const roiBadge = document.createElement("span");
  roiBadge.className = "roi-badge";

  const roiValue = document.createElement("span");
  roiValue.className = "roi-badge__value";
  roiBadge.appendChild(roiValue);

  headerRow.append(titleWrap, roiBadge);
  info.appendChild(headerRow);

  const tierHeader = document.createElement("div");
  tierHeader.className = "tier-header";

  const stageWrap = document.createElement("div");
  stageWrap.className = "flex items-center gap-2";

  const stageLabel = document.createElement("span");
  stageLabel.className = "tier-label";
  stageWrap.appendChild(stageLabel);

  const softcapBadge = document.createElement("span");
  softcapBadge.className = "softcap-badge hidden";
  stageWrap.appendChild(softcapBadge);

  tierHeader.appendChild(stageWrap);

  const stageProgressText = document.createElement("span");
  stageProgressText.className = "tier-progress-text";
  tierHeader.appendChild(stageProgressText);

  const progressTrack = document.createElement("div");
  progressTrack.className = "tier-progress-track";

  const progressBar = document.createElement("div");
  progressBar.className = "tier-progress-bar";
  progressTrack.appendChild(progressBar);

  info.append(tierHeader, progressTrack);

  const details = document.createElement("dl");
  details.className = "grid grid-cols-2 gap-x-4 gap-y-1 text-sm opacity-90";

  const cost = createDetail(details, t(state.locale, "shop.cost"));
  const owned = createDetail(details, t(state.locale, "shop.owned"));

  info.appendChild(details);

  const actions = document.createElement("div");
  actions.className = "mt-3 flex flex-wrap gap-2 sm:flex-nowrap";

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-btn h-10 flex-1";
  buyButton.textContent = t(state.locale, "actions.buy");

  const maxButton = document.createElement("button");
  maxButton.type = "button";
  maxButton.className =
    "h-10 shrink-0 rounded-lg border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300";
  maxButton.textContent = t(state.locale, "actions.max");

  actions.append(buyButton, maxButton);
  info.appendChild(actions);

  const media = document.createElement("div");
  media.className = "w-24 aspect-square shrink-0 justify-self-center sm:justify-self-end sm:w-28 md:w-32";

  const icon = document.createElement("img");
  icon.src = definition.icon;
  icon.srcset = buildItemSrcset(definition.icon);
  icon.alt = definition.name[state.locale];
  icon.decoding = "async";
  icon.className = "h-full w-full object-contain";

  media.appendChild(icon);

  container.append(info, media);

  buyButton.addEventListener("click", () => {
    if (buyItem(state, itemId, 1)) {
      save(state);
      options.onPurchase();
    }
  });

  maxButton.addEventListener("click", () => {
    const count = getMaxAffordable(definition, state);
    if (count > 0 && buyItem(state, itemId, count)) {
      save(state);
      options.onPurchase();
    }
  });

  return {
    container,
    icon,
    name,
    description,
    roiBadge,
    roiValue,
    stageLabel,
    stageProgressBar: progressBar,
    stageProgressText,
    softcapBadge,
    costLabel: cost.label,
    cost: cost.value,
    ownedLabel: owned.label,
    owned: owned.value,
    buyButton,
    maxButton,
  } satisfies ShopCardRefs;
}

function sortShopEntries(entries: ShopEntry[]): ShopEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }

    return a.order - b.order;
  });
  return sorted;
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

