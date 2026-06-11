import { getPrestigePreview } from '../../prestige';
import { getResearchList } from '../../research';
import { getShopEntries } from '../../shop';
import { getUpgradeEntries } from '../../upgrades';
import { getContractViews, getRoomViews } from '../../depth';
import type { ProgressionPanel } from '../../progression';
import type { GameState } from '../../state';
import type { SidePanelTab, UIRefs } from '../types';

export function updateSidePanel(
  state: GameState,
  refs: UIRefs,
  activeTab: SidePanelTab,
  visibleTabs: ReadonlySet<ProgressionPanel>,
): void {
  const badges = getTabBadges(state);
  refs.sidePanel.tabList.dataset.visibleCount = String(visibleTabs.size);
  refs.sidePanel.tabs.forEach((button, tab) => {
    const isVisible = visibleTabs.has(tab as ProgressionPanel);
    const isActive = tab === activeTab;
    button.hidden = !isVisible;
    button.disabled = !isVisible;
    button.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isVisible ? (isActive ? 0 : -1) : -1;
    const badge = badges[tab];
    if (isVisible && badge) {
      button.dataset.badge = badge;
    } else {
      delete button.dataset.badge;
    }
  });

  (Object.entries(refs.sidePanel.views) as [SidePanelTab, HTMLElement][]).forEach(([tab, view]) => {
    const isVisible = visibleTabs.has(tab as ProgressionPanel);
    if (tab === activeTab) {
      view.classList.remove('hidden');
      view.setAttribute('aria-hidden', 'false');
    } else {
      view.classList.add('hidden');
      view.setAttribute('aria-hidden', 'true');
    }
    view.hidden = !isVisible && tab !== activeTab;
  });
}

function getTabBadges(state: GameState): Partial<Record<SidePanelTab, string>> {
  const affordableItems = getShopEntries(state).filter(
    (entry) => entry.unlocked && entry.affordable,
  ).length;
  const availableUpgrades = getUpgradeEntries(state).filter(
    (entry) => entry.unlocked && !entry.owned,
  ).length;
  const availableResearch = getResearchList(state, 'available').length;
  const prestigePreview = getPrestigePreview(state);
  const unlockedAchievements = Object.values(state.achievements).filter(Boolean).length;
  const greenhouseActions =
    getRoomViews(state).filter((room) => room.affordable).length +
    getContractViews(state).filter((contract) => contract.active && contract.completed && !contract.claimed)
      .length;

  return {
    shop: affordableItems > 0 ? String(affordableItems) : '',
    upgrades: availableUpgrades > 0 ? String(availableUpgrades) : '',
    research: availableResearch > 0 ? String(availableResearch) : '',
    greenhouse: greenhouseActions > 0 ? String(greenhouseActions) : '',
    prestige: prestigePreview.requirementMet ? `+${prestigePreview.seedGain}` : '',
    achievements: unlockedAchievements > 0 ? String(unlockedAchievements) : '',
  } satisfies Partial<Record<SidePanelTab, string>>;
}
