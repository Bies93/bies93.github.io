import type { GameState } from "../../../state";
import {
  getResearchList,
  type ResearchFilter,
  type ResearchViewModel,
} from "../../../research";
import type { UIRefs } from "../../types";
import { renderResearchList } from "./list";

export interface ResearchUpdateResult {
  activeFilter: ResearchFilter;
  researchFilterManuallySelected: boolean;
}

export function updateResearch(
  state: GameState,
  refs: UIRefs,
  activeFilter: ResearchFilter,
  researchFilterManuallySelected: boolean,
  onPurchase: () => void,
): ResearchUpdateResult {
  const lists: Record<ResearchFilter, ResearchViewModel[]> = {
    all: getResearchList(state, "all"),
    available: getResearchList(state, "available"),
    owned: getResearchList(state, "owned"),
  };

  let nextFilter = activeFilter;
  if (!researchFilterManuallySelected && nextFilter !== "all" && lists[nextFilter].length === 0) {
    nextFilter = "all";
  }

  refs.sidePanel.research.filters.forEach((button, key) => {
    const isActive = key === nextFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  renderResearchList(state, refs, nextFilter, onPurchase, lists[nextFilter]);

  return { activeFilter: nextFilter, researchFilterManuallySelected };
}

export { renderResearchList as renderList } from "./list";
export { renderResearchCard as renderCard } from "./renderCard";
export { wireResearchCard as wireCard } from "./wireCard";
