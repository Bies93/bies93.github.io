import type { GameState } from "../../../state";
import { getUpgradeEntries, type UpgradeEntry as UpgradeViewEntry } from "../../../upgrades";
import type { UpgradeId } from "../../../../data/upgrades";
import type { UIRefs, UpgradeCardRefs } from "../../types";
import { createUpgradeCard } from "./makeCard";
import { renderUpgradeCard } from "./renderCard";
import { wireUpgradeCard } from "./wireCard";
import type { UpgradeUpdateOptions } from "./index";

export function renderUpgradeList(
  state: GameState,
  refs: UIRefs,
  options: UpgradeUpdateOptions,
): void {
  const entries = getUpgradeEntries(state);
  const list = refs.sidePanel.upgrades.list;

  entries.forEach((entry, index) => {
    const card = ensureUpgradeCard(state, refs.sidePanel.upgrades.entries, entry, options);
    renderUpgradeCard(state, card, entry);
    syncListOrder(list, card.container, index);
  });
}

function ensureUpgradeCard(
  state: GameState,
  entries: Map<UpgradeId, UpgradeCardRefs>,
  entry: UpgradeViewEntry,
  options: UpgradeUpdateOptions,
): UpgradeCardRefs {
  const { definition } = entry;
  let card = entries.get(definition.id);
  if (!card) {
    card = createUpgradeCard(definition, state);
    entries.set(definition.id, card);
    wireUpgradeCard(state, card, definition, options);
  }
  return card;
}

function syncListOrder(list: Element, card: HTMLElement, targetIndex: number): void {
  const currentChild = list.children.item(targetIndex);
  if (currentChild !== card) {
    list.insertBefore(card, currentChild ?? null);
  }
}
