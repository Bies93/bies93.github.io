import type { GameState } from "../../../state";
import { getShopEntries, type ShopEntry } from "../../../shop";
import type { ItemId } from "../../../../data/items";
import type { ShopCardRefs, UIRefs } from "../../types";
import { renderShopCard } from "./renderCard";
import { createShopCard } from "./makeCard";
import { wireShopCard } from "./wireCard";
import type { ShopUpdateOptions } from "./index";

export function renderShopList(
  state: GameState,
  refs: UIRefs,
  options: ShopUpdateOptions,
): void {
  const entries = sortShopEntries(getShopEntries(state));
  const list = refs.sidePanel.shop.list;

  entries.forEach((entry, index) => {
    const card = ensureShopCard(state, refs.sidePanel.shop.entries, entry, options);
    renderShopCard(state, card, entry);
    syncListOrder(list, card.container, index);
  });
}

function ensureShopCard(
  state: GameState,
  entries: Map<ItemId, ShopCardRefs>,
  entry: ShopEntry,
  options: ShopUpdateOptions,
): ShopCardRefs {
  const { definition } = entry;
  let card = entries.get(definition.id);
  if (!card) {
    card = createShopCard(definition, state);
    entries.set(definition.id, card);
    wireShopCard(state, card, definition, options);
  }
  return card;
}

function syncListOrder(list: Element, card: HTMLElement, targetIndex: number): void {
  const currentChild = list.children.item(targetIndex);
  if (currentChild !== card) {
    list.insertBefore(card, currentChild ?? null);
  }
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
