import { achievements } from '../../../data/achievements';
import type { AchievementId } from '../../../data/achievements';
import type { ItemId } from '../../../data/items';
import type { ResearchId } from '../../../data/research';
import type { UpgradeId } from '../../../data/upgrades';
import type { ResearchFilter } from '../../research';
import { createAchievementCard } from '../components/achievementCard';
import { createPrestigePanel } from '../components/prestigePanel';
import type {
  AchievementCardRefs,
  AchievementFilter,
  ResearchCardRefs,
  ShopCardRefs,
  SidePanelRefs,
  SidePanelTab,
  UpgradeCardRefs,
} from '../types';

export function createSidePanel(activeSidePanelTab: SidePanelTab): SidePanelRefs {
  const section = document.createElement('section');
  section.className = 'side-panel-shell fade-in space-y-5';

  const tabList = document.createElement('div');
  tabList.className = 'tab-strip';
  tabList.setAttribute('role', 'tablist');
  section.appendChild(tabList);

  const tabs = new Map<SidePanelTab, HTMLButtonElement>();
  (
    ['shop', 'upgrades', 'research', 'prestige', 'achievements', 'settings'] as SidePanelTab[]
  ).forEach((tab) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = tab;
    button.dataset.role = 'side-panel-tab';
    button.dataset.kind = 'side-panel';
    button.className = 'tab-button';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('role', 'tab');
    tabList.appendChild(button);
    tabs.set(tab, button);
  });

  const viewsContainer = document.createElement('div');
  viewsContainer.className = 'space-y-5';
  section.appendChild(viewsContainer);

  const shopView = document.createElement('div');
  shopView.className = 'space-y-4';
  const shopList = document.createElement('div');
  shopList.className = 'grid gap-3';
  shopView.appendChild(shopList);
  viewsContainer.appendChild(shopView);

  const upgradesView = document.createElement('div');
  upgradesView.className = 'space-y-4';
  const upgradeList = document.createElement('div');
  upgradeList.className = 'grid gap-3';
  upgradesView.appendChild(upgradeList);
  viewsContainer.appendChild(upgradesView);

  const researchView = document.createElement('div');
  researchView.className = 'space-y-4';
  const researchControls = document.createElement('div');
  researchControls.className = 'research-controls';
  const filterWrap = document.createElement('div');
  filterWrap.className = 'research-filters';
  const researchFilters = new Map<ResearchFilter, HTMLButtonElement>();
  (['all', 'available', 'owned'] as ResearchFilter[]).forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = key;
    button.dataset.role = 'research-filter';
    button.dataset.kind = 'research';
    button.className = 'filter-pill';
    filterWrap.appendChild(button);
    researchFilters.set(key, button);
  });
  researchControls.appendChild(filterWrap);
  researchView.appendChild(researchControls);
  const researchList = document.createElement('div');
  researchList.className = 'grid gap-3';
  researchView.appendChild(researchList);
  const researchEmpty = document.createElement('p');
  researchEmpty.className = 'research-empty text-sm text-neutral-400';
  viewsContainer.appendChild(researchView);

  const prestigePanel = createPrestigePanel();
  viewsContainer.appendChild(prestigePanel.container);

  const achievementsView = document.createElement('div');
  achievementsView.className = 'space-y-4';
  const achievementFilterWrap = document.createElement('div');
  achievementFilterWrap.className = 'achievement-filters';
  const achievementFilters = new Map<AchievementFilter, HTMLButtonElement>();
  (['all', 'unlocked', 'near', 'hidden'] as AchievementFilter[]).forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = key;
    button.dataset.role = 'achievement-filter';
    button.dataset.kind = 'achievement';
    button.className = 'filter-pill';
    achievementFilterWrap.appendChild(button);
    achievementFilters.set(key, button);
  });
  achievementsView.appendChild(achievementFilterWrap);
  const achievementsList = document.createElement('div');
  achievementsList.className = 'grid gap-3';
  achievementsView.appendChild(achievementsList);
  viewsContainer.appendChild(achievementsView);

  const achievementRefs = new Map<AchievementId, AchievementCardRefs>();
  achievements.forEach((definition) => {
    const card = createAchievementCard(definition);
    achievementRefs.set(definition.id, card);
    achievementsList.appendChild(card.container);
  });

  const settingsView = document.createElement('div');
  settingsView.className = 'settings-panel';

  const offlineSetting = createSettingRow('offline');
  const offlineToggle = document.createElement('input');
  offlineToggle.type = 'checkbox';
  offlineToggle.className = 'settings-toggle';
  offlineToggle.dataset.role = 'settings-offline-toggle';
  offlineToggle.dataset.kind = 'settings';
  offlineSetting.action.appendChild(offlineToggle);
  settingsView.appendChild(offlineSetting.row);

  const soundSetting = createSettingRow('sound');
  const soundButton = document.createElement('button');
  soundButton.type = 'button';
  soundButton.className = 'settings-action';
  soundButton.dataset.role = 'settings-sound-toggle';
  soundButton.dataset.kind = 'settings';
  soundSetting.action.appendChild(soundButton);
  settingsView.appendChild(soundSetting.row);

  const tools = document.createElement('div');
  tools.className = 'settings-tools';

  const exportButton = createSettingsButton('export');
  const importButton = createSettingsButton('import');
  const resetButton = createSettingsButton('reset');
  resetButton.classList.add('is-danger');
  tools.append(exportButton, importButton, resetButton);
  settingsView.appendChild(tools);
  viewsContainer.appendChild(settingsView);

  const views: Record<SidePanelTab, HTMLElement> = {
    shop: shopView,
    upgrades: upgradesView,
    research: researchView,
    prestige: prestigePanel.container,
    achievements: achievementsView,
    settings: settingsView,
  };

  Object.entries(views).forEach(([tab, view]) => {
    if (tab === activeSidePanelTab) {
      view.setAttribute('aria-hidden', 'false');
    } else {
      view.classList.add('hidden');
      view.setAttribute('aria-hidden', 'true');
    }
  });

  return {
    section,
    tabList,
    tabs,
    views,
    shop: {
      list: shopList,
      entries: new Map<ItemId, ShopCardRefs>(),
    },
    upgrades: {
      list: upgradeList,
      entries: new Map<UpgradeId, UpgradeCardRefs>(),
    },
    research: {
      container: researchView,
      filters: researchFilters,
      list: researchList,
      entries: new Map<ResearchId, ResearchCardRefs>(),
      emptyState: researchEmpty,
    },
    prestige: prestigePanel,
    achievements: {
      filters: achievementFilters,
      activeFilter: 'all',
      list: achievementsList,
      entries: achievementRefs,
    },
    settings: {
      offlineToggle,
      offlineTitle: offlineSetting.title,
      offlineDescription: offlineSetting.description,
      soundTitle: soundSetting.title,
      soundDescription: soundSetting.description,
      soundButton,
      exportButton,
      importButton,
      resetButton,
    },
  } satisfies SidePanelRefs;
}

function createSettingRow(id: string): {
  row: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  action: HTMLElement;
} {
  const row = document.createElement('div');
  row.className = 'settings-row';
  row.dataset.id = id;

  const copy = document.createElement('div');
  copy.className = 'settings-row__copy';

  const title = document.createElement('h3');
  title.className = 'settings-row__title';

  const description = document.createElement('p');
  description.className = 'settings-row__description';

  copy.append(title, description);

  const action = document.createElement('div');
  action.className = 'settings-row__action';

  row.append(copy, action);
  return { row, title, description, action };
}

function createSettingsButton(id: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'settings-action';
  button.dataset.id = id;
  button.dataset.role = `settings-${id}`;
  button.dataset.kind = 'settings';
  return button;
}
