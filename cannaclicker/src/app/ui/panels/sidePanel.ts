import { achievements } from "../../../data/achievements";
import type { ResearchFilter } from "../../research";
import { createAchievementCard } from "../components/achievementCard";
import { createPrestigePanel } from "../components/prestigePanel";
import type { AchievementCardRefs, SidePanelRefs, SidePanelTab } from "../types";

export function createSidePanel(
  activeSidePanelTab: SidePanelTab,
): SidePanelRefs {
  const section = document.createElement("section");
  section.className = "card fade-in space-y-5";

  const tabList = document.createElement("div");
  tabList.className = "tab-strip";
  tabList.setAttribute("role", "tablist");
  section.appendChild(tabList);

  const tabs = new Map<SidePanelTab, HTMLButtonElement>();
  (['shop', 'upgrades', 'research', 'prestige', 'achievements'] as SidePanelTab[]).forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.tab = tab;
    button.className = "tab-button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("role", "tab");
    tabList.appendChild(button);
    tabs.set(tab, button);
  });

  const viewsContainer = document.createElement("div");
  viewsContainer.className = "space-y-5";
  section.appendChild(viewsContainer);

  const shopView = document.createElement("div");
  shopView.className = "space-y-4";
  const shopList = document.createElement("div");
  shopList.className = "grid gap-3";
  shopView.appendChild(shopList);
  viewsContainer.appendChild(shopView);

  const upgradesView = document.createElement("div");
  upgradesView.className = "space-y-4";
  const upgradeList = document.createElement("div");
  upgradeList.className = "grid gap-3";
  upgradesView.appendChild(upgradeList);
  viewsContainer.appendChild(upgradesView);

  const researchView = document.createElement("div");
  researchView.className = "space-y-4";
  const researchControls = document.createElement("div");
  researchControls.className = "research-controls";
  const filterWrap = document.createElement("div");
  filterWrap.className = "research-filters";
  const researchFilters = new Map<string, HTMLButtonElement>();
  (['all', 'available', 'owned'] as ResearchFilter[]).forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.filter = key;
    button.className = "filter-pill";
    filterWrap.appendChild(button);
    researchFilters.set(key, button);
  });
  researchControls.appendChild(filterWrap);
  researchView.appendChild(researchControls);
  const researchList = document.createElement("div");
  researchList.className = "grid gap-3";
  researchView.appendChild(researchList);
  const researchEmpty = document.createElement("p");
  researchEmpty.className = "research-empty text-sm text-neutral-400";
  viewsContainer.appendChild(researchView);

  const prestigePanel = createPrestigePanel();
  viewsContainer.appendChild(prestigePanel.container);

  const achievementsView = document.createElement("div");
  achievementsView.className = "space-y-4";
  const achievementsList = document.createElement("div");
  achievementsList.className = "grid gap-3";
  achievementsView.appendChild(achievementsList);
  viewsContainer.appendChild(achievementsView);

  const achievementRefs = new Map<string, AchievementCardRefs>();
  achievements.forEach((definition) => {
    const card = createAchievementCard(definition);
    achievementRefs.set(definition.id, card);
    achievementsList.appendChild(card.container);
  });

  const views: Record<SidePanelTab, HTMLElement> = {
    shop: shopView,
    upgrades: upgradesView,
    research: researchView,
    prestige: prestigePanel.container,
    achievements: achievementsView,
  };

  Object.entries(views).forEach(([tab, view]) => {
    if (tab === activeSidePanelTab) {
      view.setAttribute("aria-hidden", "false");
    } else {
      view.classList.add("hidden");
      view.setAttribute("aria-hidden", "true");
    }
  });

  return {
    section,
    tabList,
    tabs,
    views,
    shop: {
      list: shopList,
    },
    upgrades: {
      list: upgradeList,
      entries: new Map(),
    },
    research: {
      container: researchView,
      filters: researchFilters,
      list: researchList,
      entries: new Map(),
      emptyState: researchEmpty,
    },
    prestige: prestigePanel,
    achievements: {
      list: achievementsList,
      entries: achievementRefs,
    },
  } satisfies SidePanelRefs;
}
