import type { GameState } from "../../../state";
import { buyItem } from "../../../game";
import { save } from "../../../save";
import { getMaxAffordable } from "../../../shop";
import type { ItemDefinition } from "../../../../data/items";
import type { ShopCardRefs } from "../../types";
import type { ShopUpdateOptions } from "./index";

const wiredCards = new WeakSet<ShopCardRefs>();

export function wireShopCard(
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
