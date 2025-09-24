import type { SidePanelTab, UIRefs } from "../types";

export function updateSidePanel(refs: UIRefs, activeTab: SidePanelTab): void {
  refs.sidePanel.tabs.forEach((button, tab) => {
    const isActive = tab === activeTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  (Object.entries(refs.sidePanel.views) as [SidePanelTab, HTMLElement][]).forEach(([tab, view]) => {
    if (tab === activeTab) {
      view.classList.remove("hidden");
      view.setAttribute("aria-hidden", "false");
    } else {
      view.classList.add("hidden");
      view.setAttribute("aria-hidden", "true");
    }
  });
}
