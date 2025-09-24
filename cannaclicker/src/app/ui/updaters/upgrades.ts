import Decimal from "break_infinity.js";
import { t } from "../../i18n";
import { formatDecimal } from "../../math";
import type { GameState } from "../../state";
import {
  getUpgradeEntries,
  getUpgradeDefinition,
  type UpgradeEntry as UpgradeViewEntry,
  type UpgradeRequirementDetail,
} from "../../upgrades";
import { itemById } from "../../data/items";
import { buyUpgrade } from "../../game";
import type { UIRefs, UpgradeCardRefs } from "../types";

export interface UpgradeUpdateOptions {
  onPurchase: (definition: UpgradeViewEntry["definition"], container: HTMLElement) => void;
}

export function updateUpgrades(state: GameState, refs: UIRefs, options: UpgradeUpdateOptions): void {
  const entries = getUpgradeEntries(state);
  entries.forEach((entry, index) => {
    let card = refs.upgradeEntries.get(entry.definition.id);
    if (!card) {
      card = createUpgradeCard(entry.definition.id, state, options);
      refs.upgradeEntries.set(entry.definition.id, card);
    }

    const definition = entry.definition;
    card.icon.src = definition.icon;
    card.icon.alt = definition.name[state.locale];
    card.name.textContent = definition.name[state.locale];
    card.description.textContent = definition.description[state.locale];
    card.category.textContent = t(state.locale, `upgrades.category.${definition.category}`);
    card.costLabel.textContent = t(state.locale, "upgrades.cost");
    card.costValue.textContent = entry.formattedCost;

    const statusState = resolveUpgradeState(entry);
    card.container.dataset.state = statusState;
    const statusKey =
      statusState === "owned"
        ? "upgrades.status.owned"
        : statusState === "affordable"
          ? "upgrades.status.affordable"
          : statusState === "ready"
            ? "upgrades.status.ready"
            : "upgrades.status.locked";
    card.status.textContent = t(state.locale, statusKey);

    const progressMessage = formatUpgradeProgressMessage(state, entry);
    if (progressMessage) {
      card.progress.textContent = progressMessage;
      card.progress.classList.remove("hidden");
    } else {
      card.progress.textContent = "";
      card.progress.classList.add("hidden");
    }

    updateUpgradeRequirements(state, card.requirementList, entry);

    card.buyButton.disabled = !entry.affordable;
    card.buyButton.setAttribute("aria-disabled", entry.affordable ? "false" : "true");
    card.container.dataset.category = definition.category;

    const list = refs.sidePanel.upgrades.list;
    const currentChild = list.children.item(index);
    if (currentChild !== card.container) {
      list.insertBefore(card.container, currentChild ?? null);
    }
  });
}

function createUpgradeCard(
  upgradeId: string,
  state: GameState,
  options: UpgradeUpdateOptions,
): UpgradeCardRefs {
  const definition = getUpgradeDefinition(upgradeId);
  if (!definition) {
    throw new Error(`Unknown upgrade ${upgradeId}`);
  }

  const container = document.createElement("article");
  container.className = "upgrade-card";
  container.dataset.upgradeId = upgradeId;

  const iconWrap = document.createElement("div");
  iconWrap.className = "upgrade-card__media";
  const icon = document.createElement("img");
  icon.className = "upgrade-card__icon";
  icon.src = definition.icon;
  icon.alt = definition.name[state.locale];
  icon.decoding = "async";
  iconWrap.appendChild(icon);

  const body = document.createElement("div");
  body.className = "upgrade-card__body";

  const header = document.createElement("div");
  header.className = "upgrade-card__header";

  const category = document.createElement("span");
  category.className = "upgrade-card__category";
  category.textContent = t(state.locale, `upgrades.category.${definition.category}`);

  const name = document.createElement("h3");
  name.className = "upgrade-card__name";
  name.textContent = definition.name[state.locale];

  header.append(category, name);

  const description = document.createElement("p");
  description.className = "upgrade-card__description";
  description.textContent = definition.description[state.locale];

  const status = document.createElement("span");
  status.className = "upgrade-card__status";

  const progress = document.createElement("p");
  progress.className = "upgrade-card__progress hidden";

  const requirementList = document.createElement("ul");
  requirementList.className = "upgrade-card__requirements hidden";

  const footer = document.createElement("div");
  footer.className = "upgrade-card__footer";

  const costWrap = document.createElement("div");
  costWrap.className = "upgrade-card__cost-wrap";
  const costLabel = document.createElement("span");
  costLabel.className = "upgrade-card__cost-label";
  costLabel.textContent = t(state.locale, "upgrades.cost");
  const costValue = document.createElement("span");
  costValue.className = "upgrade-card__cost";
  costValue.textContent = formatDecimal(new Decimal(definition.cost));
  costWrap.append(costLabel, costValue);

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "upgrade-card__button";
  buyButton.textContent = t(state.locale, "upgrades.action.buy");

  footer.append(costWrap, buyButton);

  body.append(header, description, status, progress, requirementList, footer);
  container.append(iconWrap, body);

  buyButton.addEventListener("click", () => {
    if (buyUpgrade(state, upgradeId)) {
      celebrateUpgrade(container);
      options.onPurchase(definition, container);
    }
  });

  return {
    container,
    icon,
    category,
    name,
    description,
    status,
    progress,
    requirementList,
    costLabel,
    costValue,
    buyButton,
  } satisfies UpgradeCardRefs;
}

function resolveUpgradeState(entry: UpgradeViewEntry): "owned" | "affordable" | "ready" | "locked" {
  if (entry.owned) {
    return "owned";
  }
  if (!entry.unlocked) {
    return "locked";
  }
  if (entry.affordable) {
    return "affordable";
  }
  return "ready";
}

function formatUpgradeProgressMessage(state: GameState, entry: UpgradeViewEntry): string | null {
  if (entry.owned) {
    return t(state.locale, "upgrades.progress.active");
  }

  if (!entry.unlocked && entry.primaryLock) {
    return formatLockMessage(state, entry.primaryLock);
  }

  return null;
}

function formatLockMessage(state: GameState, detail: UpgradeRequirementDetail): string {
  switch (detail.kind) {
    case "itemsOwned": {
      const item = itemById.get(detail.id);
      const name = item ? item.name[state.locale] : detail.id;
      return t(state.locale, "upgrades.lock.items", { remaining: detail.remaining, name });
    }
    case "totalBuds": {
      const amount = formatDecimal(new Decimal(detail.remaining));
      return t(state.locale, "upgrades.lock.total", { amount });
    }
    case "upgradesOwned": {
      const upgrade = getUpgradeDefinition(detail.id);
      const name = upgrade ? upgrade.name[state.locale] : detail.id;
      return t(state.locale, "upgrades.lock.upgrade", { name });
    }
    default:
      return "";
  }
}

function updateUpgradeRequirements(
  state: GameState,
  list: HTMLElement,
  entry: UpgradeViewEntry,
): void {
  const shouldShow = entry.requirementDetails.length > 0 && !entry.owned;
  list.innerHTML = "";

  if (!shouldShow) {
    list.classList.add("hidden");
    return;
  }

  list.classList.remove("hidden");
  entry.requirementDetails.forEach((detail) => {
    const text = formatRequirementDetailText(state, detail);
    if (!text) {
      return;
    }
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
}

function formatRequirementDetailText(state: GameState, detail: UpgradeRequirementDetail): string {
  switch (detail.kind) {
    case "itemsOwned": {
      const item = itemById.get(detail.id);
      const name = item ? item.name[state.locale] : detail.id;
      return t(state.locale, "upgrades.requirement.items", {
        current: detail.current,
        required: detail.required,
        name,
      });
    }
    case "totalBuds": {
      const current = formatDecimal(new Decimal(detail.current));
      const required = formatDecimal(new Decimal(detail.required));
      return t(state.locale, "upgrades.requirement.total", { current, required });
    }
    case "upgradesOwned": {
      const upgrade = getUpgradeDefinition(detail.id);
      const name = upgrade ? upgrade.name[state.locale] : detail.id;
      return t(state.locale, "upgrades.requirement.upgrade", { name });
    }
    default:
      return "";
  }
}

function celebrateUpgrade(container: HTMLElement): void {
  container.classList.add("is-celebrating");
  window.setTimeout(() => {
    container.classList.remove("is-celebrating");
  }, 900);
}

