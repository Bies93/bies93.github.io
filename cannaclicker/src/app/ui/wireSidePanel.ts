import type { ResearchFilter } from "../research";
import { openPrestigeModal } from "./components/prestigeModalController";
import type { WireContext } from "./wire";

export function wireSidePanel(context: WireContext): void {
  const { refs, state, render } = context;

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.addEventListener("click", () => {
      const next = key as ResearchFilter;
      if (context.getActiveResearchFilter() === next) {
        return;
      }

      context.setActiveResearchFilter(next, next !== "all");
      render(state);
    });
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    button.addEventListener("click", () => {
      if (context.getActiveSidePanelTab() === tab) {
        return;
      }

      context.setActiveSidePanelTab(tab);
      render(state);
    });
  });

  refs.sidePanel.prestige.actionButton.addEventListener("click", () => {
    openPrestigeModal(refs, state);
  });
}
