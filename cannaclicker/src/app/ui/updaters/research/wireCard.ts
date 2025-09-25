import { t } from "../../../i18n";
import type { GameState } from "../../../state";
import {
  canAfford,
  getResearchNode,
  purchaseResearch,
  requirementsMet,
} from "../../../research";
import type { ResearchCardRefs } from "../../types";

const wiredCards = new WeakSet<ResearchCardRefs>();

export function wireResearchCard(
  state: GameState,
  card: ResearchCardRefs,
  onPurchase: () => void,
): void {
  if (wiredCards.has(card)) {
    return;
  }

  wiredCards.add(card);

  card.button.addEventListener("click", () => {
    const node = getResearchNode(card.id);
    if (!node) {
      return;
    }

    if (state.researchOwned.includes(card.id)) {
      return;
    }

    if (!requirementsMet(state, node) || !canAfford(state, node)) {
      return;
    }

    if (node.confirmKey) {
      const confirmation = t(state.locale, node.confirmKey);
      if (!window.confirm(confirmation)) {
        return;
      }
    }

    const purchased = purchaseResearch(state, card.id);
    if (purchased) {
      onPurchase();
    }
  });
}
