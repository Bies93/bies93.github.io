import Decimal from "break_infinity.js";
import { t } from "../../../i18n";
import { formatDecimal } from "../../../math";
import type { GameState } from "../../../state";
import {
  getUpgradeDefinition,
  type UpgradeEntry as UpgradeViewEntry,
  type UpgradeRequirementDetail,
} from "../../../upgrades";
import { itemById } from "../../../../data/items";
import type { UpgradeCardRefs } from "../../types";

export function renderUpgradeCard(
  state: GameState,
  card: UpgradeCardRefs,
  entry: UpgradeViewEntry,
): void {
  updateCardBasics(state, card, entry);
  updateCardStatus(state, card, entry);
  updateCardProgress(state, card, entry);
  updateRequirements(state, card.requirementList, entry);
  updateCostDisplay(card, entry);
}

function updateCardBasics(state: GameState, card: UpgradeCardRefs, entry: UpgradeViewEntry): void {
  const definition = entry.definition;
  card.icon.src = definition.icon;
  card.icon.alt = definition.name[state.locale];
  card.name.textContent = definition.name[state.locale];
  card.description.textContent = definition.description[state.locale];
  card.category.textContent = t(state.locale, `upgrades.category.${definition.category}`);
  card.costLabel.textContent = t(state.locale, "upgrades.cost");
  card.container.dataset.category = definition.category;
}

function updateCardStatus(state: GameState, card: UpgradeCardRefs, entry: UpgradeViewEntry): void {
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

  card.buyButton.disabled = !entry.affordable;
  card.buyButton.setAttribute("aria-disabled", entry.affordable ? "false" : "true");
}

function updateCardProgress(state: GameState, card: UpgradeCardRefs, entry: UpgradeViewEntry): void {
  const progressMessage = formatUpgradeProgressMessage(state, entry);
  if (progressMessage) {
    card.progress.textContent = progressMessage;
    card.progress.classList.remove("hidden");
  } else {
    card.progress.textContent = "";
    card.progress.classList.add("hidden");
  }
}

function updateCostDisplay(card: UpgradeCardRefs, entry: UpgradeViewEntry): void {
  card.costValue.textContent = entry.formattedCost;
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

function updateRequirements(
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
