import { buyUpgrade } from "../../../game";
import type { GameState } from "../../../state";
import type { UpgradeEntry as UpgradeViewEntry } from "../../../upgrades";
import type { UpgradeCardRefs } from "../../types";
import type { UpgradeUpdateOptions } from "./index";

const wiredCards = new WeakSet<UpgradeCardRefs>();

export function wireUpgradeCard(
  state: GameState,
  card: UpgradeCardRefs,
  definition: UpgradeViewEntry["definition"],
  options: UpgradeUpdateOptions,
): void {
  if (wiredCards.has(card)) {
    return;
  }

  wiredCards.add(card);

  card.buyButton.addEventListener("click", () => {
    if (buyUpgrade(state, definition.id)) {
      celebrateUpgrade(card.container);
      options.onPurchase(definition, card.container);
    }
  });
}

function celebrateUpgrade(container: HTMLElement): void {
  container.classList.add("is-celebrating");
  window.setTimeout(() => {
    container.classList.remove("is-celebrating");
  }, 900);
}
