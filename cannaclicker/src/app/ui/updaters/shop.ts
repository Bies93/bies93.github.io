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
import type { ItemDefinition } from "../../../data/items";
import type { ShopCardRefs, UIRefs } from "../types";

export interface ShopUpdateOptions {
  onPurchase: () => void;
}

const wiredCards = new WeakSet<ShopCardRefs>();

export function renderList(
  state: GameState,
  refs: UIRefs,
  options: ShopUpdateOptions,
): void {
  const entries = sortShopEntries(getShopEntries(state));
  const list = refs.sidePanel.shop.list;

  entries.forEach((entry, index) => {
    const { definition } = entry;
    let card = refs.sidePanel.shop.entries.get(definition.id);
    if (!card) {
      card = createShopCard(definition, state);
      refs.sidePanel.shop.entries.set(definition.id, card);
      wireCard(state, card, definition, options);
    }

    renderCard(state, card, entry);

    const currentChild = list.children.item(index);
    if (currentChild !== card.container) {
      list.insertBefore(card.container, currentChild ?? null);
    }
  });
}

export function updateShop(
  state: GameState,
  refs: UIRefs,
  options: ShopUpdateOptions,
): void {
  renderList(state, refs, options);
}

export function renderCard(
  state: GameState,
  card: ShopCardRefs,
  entry: ShopEntry,
): void {
  const definition = entry.definition;
  const locale = state.locale;

  card.icon.src = definition.icon;
  card.icon.srcset = buildItemSrcset(definition.icon);
  card.icon.alt = definition.name[locale];

  card.name.textContent = definition.name[locale];
  card.description.textContent = definition.description[locale];
  card.costLabel.textContent = t(locale, "shop.cost");
  card.ownedLabel.textContent = t(locale, "shop.owned");
  card.buyButton.textContent = t(locale, "actions.buy");
  card.maxButton.textContent = t(locale, "actions.max");

  const roiText = formatRoi(locale, entry.roi);
  card.roiValue.textContent = roiText;
  card.roiBadge.dataset.variant = resolveRoiVariant(entry.roi);
  card.roiBadge.setAttribute("aria-label", roiText);
  card.roiBadge.setAttribute("title", roiText);

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

  if (entry.softcap.active) {
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
    const maxAffordable = getMaxAffordable(entry.definition, state);
    card.maxButton.disabled = maxAffordable === 0;
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
}

export function wireCard(
  state: GameState,
  card: ShopCardRefs,
  definition: ItemDefinition,
  options: ShopUpdateOptions,
): void {
  if (wiredCards.has(card)) {
    return;
  }

  wiredCards.add(card);

  card.buyButton.addEventListener("click", () => {
    if (buyItem(state, definition.id, 1)) {
      save(state);
      options.onPurchase();
    }
  });

  card.maxButton.addEventListener("click", () => {
    const count = getMaxAffordable(definition, state);
    if (count > 0 && buyItem(state, definition.id, count)) {
      save(state);
      options.onPurchase();
    }
  });
}

function createShopCard(definition: ItemDefinition, state: GameState): ShopCardRefs {
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
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm leading-snug text-neutral-400";
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
