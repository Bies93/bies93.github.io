import Decimal from "break_infinity.js";
import {
  upgradeById,
  upgrades,
  type UpgradeDefinition,
  type UpgradeId,
  type UpgradeRequirement,
} from "../data/upgrades";
import { itemById } from "../data/items";
import type { ItemId } from "../data/items";
import { formatDecimal } from "./math";
import type { GameState } from "./state";
import type { LocaleKey } from "./i18n";

export type UpgradeRequirementDetail =
  | {
      kind: "itemsOwned";
      id: ItemId;
      required: number;
      current: number;
      remaining: number;
    }
  | {
      kind: "totalBuds";
      required: number;
      current: number;
      remaining: number;
    }
  | {
      kind: "upgradesOwned";
      id: UpgradeId;
      owned: boolean;
    };

export interface UpgradeEntry {
  definition: UpgradeDefinition;
  owned: boolean;
  unlocked: boolean;
  affordable: boolean;
  cost: Decimal;
  formattedCost: string;
  requirementDetails: UpgradeRequirementDetail[];
  primaryLock: UpgradeRequirementDetail | null;
}

export function getUpgradeDefinition(id: UpgradeId): UpgradeDefinition | undefined {
  return upgradeById.get(id);
}

export function getUpgradeEntries(state: GameState): UpgradeEntry[] {
  return upgrades.map((definition) => buildUpgradeEntry(state, definition));
}

export function buildUpgradeEntry(state: GameState, definition: UpgradeDefinition): UpgradeEntry {
  const owned = Boolean(state.upgrades[definition.id]);
  const cost = new Decimal(definition.cost);
  const details = describeRequirement(state, definition.requirement);
  const unlocked = requirementMet(details);
  const affordable = !owned && unlocked && state.buds.greaterThanOrEqualTo(cost);
  const primaryLock = resolvePrimaryLock(details);

  return {
    definition,
    owned,
    unlocked,
    affordable,
    cost,
    formattedCost: formatDecimal(cost),
    requirementDetails: details,
    primaryLock,
  } satisfies UpgradeEntry;
}

export function requirementsSatisfied(state: GameState, definition: UpgradeDefinition): boolean {
  const details = describeRequirement(state, definition.requirement);
  return requirementMet(details);
}

function describeRequirement(
  state: GameState,
  requirement: UpgradeRequirement | undefined,
): UpgradeRequirementDetail[] {
  if (!requirement) {
    return [];
  }

  const details: UpgradeRequirementDetail[] = [];

  if (requirement.itemsOwned) {
    for (const [itemId, required] of Object.entries(requirement.itemsOwned) as [ItemId, number][]) {
      const current = state.items[itemId] ?? 0;
      const remaining = Math.max(0, required - current);
      details.push({
        kind: "itemsOwned",
        id: itemId,
        required,
        current,
        remaining,
      });
    }
  }

  if (requirement.totalBuds) {
    const required = requirement.totalBuds;
    const current = Math.max(0, state.total.toNumber());
    const remaining = Math.max(0, required - current);
    details.push({
      kind: "totalBuds",
      required,
      current,
      remaining,
    });
  }

  if (requirement.upgradesOwned) {
    for (const upgradeId of requirement.upgradesOwned) {
      details.push({
        kind: "upgradesOwned",
        id: upgradeId,
        owned: Boolean(state.upgrades[upgradeId]),
      });
    }
  }

  return details;
}

function requirementMet(details: UpgradeRequirementDetail[]): boolean {
  return details.every((detail) => {
    switch (detail.kind) {
      case "itemsOwned":
        return detail.current >= detail.required;
      case "totalBuds":
        return detail.current >= detail.required;
      case "upgradesOwned":
        return detail.owned;
      default:
        return true;
    }
  });
}

function resolvePrimaryLock(details: UpgradeRequirementDetail[]): UpgradeRequirementDetail | null {
  const unmetItems = details
    .filter((detail): detail is Extract<UpgradeRequirementDetail, { kind: "itemsOwned" }> => {
      return detail.kind === "itemsOwned" && detail.current < detail.required;
    })
    .sort((a, b) => a.remaining - b.remaining);

  if (unmetItems.length > 0) {
    return unmetItems[0];
  }

  const missingUpgrade = details.find((detail) => detail.kind === "upgradesOwned" && !detail.owned);
  if (missingUpgrade) {
    return missingUpgrade;
  }

  const unmetTotal = details.find((detail) => detail.kind === "totalBuds" && detail.current < detail.required);
  return unmetTotal ?? null;
}

export function getRequirementLabel(detail: UpgradeRequirementDetail, locale: LocaleKey): string {
  switch (detail.kind) {
    case "itemsOwned": {
      const item = itemById.get(detail.id);
      const name = item ? item.name[locale] : detail.id;
      return `${Math.max(0, detail.remaining)} × ${name}`;
    }
    case "totalBuds":
      return formatDecimal(new Decimal(detail.remaining));
    case "upgradesOwned":
      return detail.id;
    default:
      return "";
  }
}
