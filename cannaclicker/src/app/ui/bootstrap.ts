import { handleManualClick, recalcDerivedValues, evaluateAchievements } from '../game';
import { formatDecimal } from '../math';
import type { GameState } from '../state';
import { createDefaultState } from '../state';
import type { AudioManager } from '../audio';
import type { LocaleKey } from '../i18n';
import { t as defaultTranslate } from '../i18n';
import { exportSave, importSave, clearSave, save } from '../save';
import { spawnFloatingValue } from '../effects';
import { withBase } from '../paths';
import { maybeRollClickSeed } from '../seeds';
import { listAbilities } from '../abilities';
import type { ResearchFilter } from '../research';
import { createActionButton, createAbilityButton, createDangerButton } from './components/controls';
import { createPrestigeModal } from './components/prestigeModal';
import { createStatBlock } from './components/stats';
import { updateShop } from './updaters/shop';
import { updateUpgrades } from './updaters/upgrades';
import { updateResearch } from './updaters/research';
import { updateStrings } from './updaters/strings';
import { plantStageAsset, preloadPlantStage } from './updaters/plant';
import { updateStats } from './updaters/statPanel';
import { updateAbilities } from './updaters/abilities';
import { updateSidePanel } from './updaters/sidePanel';
import { updatePrestigePanel } from './updaters/prestigePanel';
import { updateAchievements } from './updaters/achievements';
import { processSeedNotifications } from './updaters/seeds';
import { updateOfflineToast } from './updaters/offline';
import type { AbilityButtonRefs, SidePanelTab, UIRefs } from './types';
import { createSidePanel } from './panels/sidePanel';
import { formatInteger } from './utils/format';
import { showToast, announce, type ToastOptions } from './services/toast';
import {
  closePrestigeModal,
  openPrestigeModal,
  updatePrestigeModal,
  setPrestigeAcknowledged,
  performPrestigeAction,
} from './components/prestigeModalController';
import { createEventScheduler } from './events/scheduler';
import { attachGlobalShortcuts } from './input/shortcuts';

interface InitI18nApi {
  t(locale: LocaleKey, key: string, params?: Record<string, string | number>): string;
}

export interface UIInitResult {
  refs: UIRefs;
  render(state: GameState): void;
  scheduler: { start(state: GameState): void; stop(): void };
}

export function initUI(
  initialState: GameState,
  audio: AudioManager,
  i18n: InitI18nApi = { t: defaultTranslate },
): UIInitResult {
  let activeResearchFilter: ResearchFilter = 'all';
  let researchFilterManuallySelected = false;
  let activeSidePanelTab: SidePanelTab = 'shop';

  const refs = buildUI(initialState);
  refs.modalOverlay = refs.prestigeModal.overlay;
  refs.eventRoot = refs.eventLayer;

  showToast.bind(refs.toastContainer ?? null);
  announce.bind(refs.announcer ?? null);

  const render = (state: GameState) => {
    if (state.temp.needsRecalc) {
      recalcDerivedValues(state);
      evaluateAchievements(state);
      state.temp.needsRecalc = false;
    }

    updateStrings(state, refs);
    updateStats(state, refs);
    processSeedNotifications(state, refs, (options: ToastOptions) => showToast(options));
    updateAbilities(state, refs);
    updateSidePanel(refs, activeSidePanelTab);

    updateShop(state, refs, {
      onPurchase: () => {
        audio.playPurchase();
        render(state);
      },
    });

    updateUpgrades(state, refs, {
      onPurchase: (definition, container) => {
        audio.playPurchase();
        const locale = state.locale;
        const title = i18n.t(locale, 'upgrades.toast.title');
        const message = i18n.t(locale, 'upgrades.toast.message', { name: definition.name[locale] });
        showToast({ title, message });
        save(state);
        spawnFloatingValue(container, i18n.t(locale, 'upgrades.fx.spark'), 'rgb(74 222 128)');
        render(state);
      },
    });

    const result = updateResearch(
      state,
      refs,
      activeResearchFilter,
      researchFilterManuallySelected,
      () => {
        audio.playPurchase();
        recalcDerivedValues(state);
        render(state);
      },
    );

    activeResearchFilter = result.activeFilter;
    researchFilterManuallySelected = result.researchFilterManuallySelected;

    updatePrestigePanel(state, refs);
    updateAchievements(state, refs);
    updatePrestigeModal(refs, state);
    updateOfflineToast(state, (options: ToastOptions) => showToast(options));
  };

  const scheduler = createEventScheduler({ refs, render });

  attachGlobalShortcuts({ refs, render }, initialState, audio);
  setupInteractions(refs, initialState, audio, i18n, render, {
    getActiveResearchFilter: () => activeResearchFilter,
    setActiveResearchFilter(value, manual) {
      activeResearchFilter = value;
      researchFilterManuallySelected = manual;
    },
    getActiveSidePanelTab: () => activeSidePanelTab,
    setActiveSidePanelTab(tab) {
      activeSidePanelTab = tab;
    },
  });

  return { refs, render, scheduler };
}

function buildUI(state: GameState): UIRefs {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('#app root missing');
  }

  root.innerHTML = '';
  root.className =
    'relative mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10';

  const heroImageSet = `image-set(url("${withBase('img/bg-hero-1920.png')}") type("image/png") 1x, url("${withBase('img/bg-hero-2560.png')}") type("image/png") 2x)`;
  document.documentElement.style.setProperty('--hero-image', heroImageSet);
  document.documentElement.style.setProperty('--bg-plants', `url("${withBase('img/bg-plants-1280.png')}")`);
  document.documentElement.style.setProperty('--bg-noise', `url("${withBase('img/bg-noise-512.png')}")`);

  const muteControl = createActionButton(withBase('icons/ui/ui-mute.png'));
  const exportControl = createActionButton(withBase('icons/ui/ui-export.png'));
  const importControl = createActionButton(withBase('icons/ui/ui-import.png'));
  const resetControl = createDangerButton(withBase('icons/ui/ui-reset.png'));

  const headerTitle = mountHeader(root, [
    muteControl.button,
    exportControl.button,
    importControl.button,
    resetControl.button,
  ]);

  const layout = document.createElement('div');
  layout.className =
    'grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-6 2xl:gap-8';

  const primaryColumn = document.createElement('div');
  primaryColumn.className = 'space-y-4';

  const secondaryColumn = document.createElement('div');
  secondaryColumn.className = 'space-y-4';

  layout.append(primaryColumn, secondaryColumn);

  const statsLabels = new Map<string, HTMLElement>();
  const statsMeta = new Map<string, HTMLElement>();

  const infoRibbon = document.createElement('section');
  infoRibbon.className = 'info-ribbon fade-in';

  const infoList = document.createElement('div');
  infoList.className = 'info-ribbon__list';
  infoRibbon.appendChild(infoList);

  const totalStat = createStatBlock('stats.total', infoList, statsLabels, statsMeta);
  const seedsStat = createStatBlock('stats.seeds', infoList, statsLabels, statsMeta);
  const seedRateStat = createStatBlock('stats.seedRate', infoList, statsLabels, statsMeta);
  const prestigeStat = createStatBlock('stats.prestigeMult', infoList, statsLabels, statsMeta);

  const infoActions = document.createElement('div');
  infoActions.className = 'info-ribbon__actions';
  infoRibbon.appendChild(infoActions);

  const seedBadge = document.createElement('button');
  seedBadge.type = 'button';
  seedBadge.className = 'prestige-badge';
  const seedIcon = new Image();
  seedIcon.src = withBase('icons/ui/ui-seed.png');
  seedIcon.alt = '';
  seedIcon.decoding = 'async';
  seedIcon.className = 'prestige-badge__icon';
  const seedBadgeValue = document.createElement('span');
  seedBadgeValue.className = 'prestige-badge__value';
  seedBadge.append(seedIcon, seedBadgeValue);
  infoActions.appendChild(seedBadge);
  root.append(infoRibbon, layout);

  const eventLayer = document.createElement('div');
  eventLayer.className = 'event-layer';
  root.appendChild(eventLayer);

  const clickCard = document.createElement('section');
  clickCard.className = 'card fade-in click-card';

  const clickHeader = document.createElement('div');
  clickHeader.className = 'click-card__header';
  const clickStats = document.createElement('div');
  clickStats.className = 'click-stats';

  clickHeader.appendChild(clickStats);
  clickCard.appendChild(clickHeader);

  const clickBody = document.createElement('div');
  clickBody.className = 'click-card__body';
  clickCard.appendChild(clickBody);

  const clickButton = document.createElement('button');
  clickButton.className = 'click-button w-full';
  clickButton.type = 'button';

  const clickIcon = document.createElement('div');
  clickIcon.className = 'click-icon';
  clickIcon.setAttribute('aria-hidden', 'true');
  clickIcon.style.setProperty('background-image', `url("${withBase(plantStageAsset(0))}")`);
  clickIcon.dataset.stage = '0';
  preloadPlantStage(0);
  preloadPlantStage(1);

  const clickLabel = document.createElement('span');
  clickLabel.className = 'click-label';

  clickButton.append(clickIcon, clickLabel);
  clickBody.appendChild(clickButton);

  const budsStat = createStatBlock('stats.buds', clickStats, statsLabels, statsMeta);
  const bpsStat = createStatBlock('stats.bps', clickStats, statsLabels, statsMeta);
  const bpcStat = createStatBlock('stats.bpc', clickStats, statsLabels, statsMeta);

  const announcer = document.createElement('p');
  announcer.setAttribute('data-sr-only', 'true');
  announcer.setAttribute('aria-live', 'polite');
  clickCard.appendChild(announcer);

  primaryColumn.appendChild(clickCard);

  const abilitySection = document.createElement('section');
  abilitySection.className = 'card fade-in space-y-4';

  const abilityTitle = document.createElement('h2');
  abilityTitle.className = 'text-xl font-semibold text-leaf-200';
  abilitySection.appendChild(abilityTitle);

  const abilityGrid = document.createElement('div');
  abilityGrid.className = 'ability-grid';
  abilitySection.appendChild(abilityGrid);

  const abilityRefs = new Map<string, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityRefs.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const sidePanel = createSidePanel('shop');
  secondaryColumn.appendChild(sidePanel.section);

  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-stack';
  root.appendChild(toastContainer);

  const prestigeModal = createPrestigeModal();
  if (prestigeModal.overlay) {
    root.appendChild(prestigeModal.overlay);
  }

  const uiRefs: UIRefs = {
    root,
    headerTitle,
    statsLabels,
    statsMeta,
    buds: budsStat,
    bps: bpsStat,
    bpc: bpcStat,
    total: totalStat,
    seeds: seedsStat,
    seedRate: seedRateStat,
    prestigeMult: prestigeStat,
    seedBadge,
    seedBadgeValue,
    clickButton,
    clickLabel,
    clickIcon,
    controls: {
      mute: muteControl,
      export: exportControl,
      import: importControl,
      reset: resetControl,
    },
    announcer,
    abilityTitle,
    abilityList: abilityRefs,
    sidePanel,
    shopEntries: new Map(),
    upgradeEntries: new Map(),
    prestigeModal,
    toastContainer,
    eventLayer,
  };

  return uiRefs;
}

function mountHeader(root: HTMLElement, controls: HTMLButtonElement[]): HTMLHeadingElement {
  const header = document.createElement('header');
  header.className =
    'grid w-full gap-3 rounded-3xl border border-white/10 bg-neutral-900/80 px-3 py-2 shadow-[0_20px_48px_rgba(10,12,21,0.45)] backdrop-blur-xl sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-14 sm:gap-y-2 sm:px-6 lg:px-8';

  const logoWrap = document.createElement('div');
  logoWrap.className =
    'grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime-300/35 via-emerald-300/25 to-emerald-500/30 shadow-[0_0_20px_rgba(202,255,120,0.45)] ring-1 ring-lime-200/35 sm:h-14 sm:w-14';

  const leaf = new Image();
  leaf.src = withBase('img/logo-leaf.svg');
  leaf.alt = '';
  leaf.decoding = 'async';
  leaf.className =
    'h-8 w-8 drop-shadow-[0_12px_24px_rgba(202,255,150,0.55)] saturate-150 brightness-110 sm:h-10 sm:w-10';

  logoWrap.appendChild(leaf);

  const headerTitle = document.createElement('h1');
  headerTitle.className = 'app-header__title';
  headerTitle.textContent = 'CannaBies';

  const actionWrap = document.createElement('div');
  actionWrap.className =
    'flex flex-nowrap items-center justify-self-stretch gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-1 shadow-[0_16px_30px_rgba(10,12,21,0.4)] ring-1 ring-white/10 backdrop-blur sm:justify-self-end';
  controls.forEach((control) => {
    control.classList.add('shrink-0');
    actionWrap.append(control);
  });

  header.append(logoWrap, headerTitle, actionWrap);
  root.prepend(header);
  return headerTitle;
}

interface InteractionHandlers {
  getActiveResearchFilter(): ResearchFilter;
  setActiveResearchFilter(value: ResearchFilter, manual: boolean): void;
  getActiveSidePanelTab(): SidePanelTab;
  setActiveSidePanelTab(tab: SidePanelTab): void;
}

function setupInteractions(
  refs: UIRefs,
  state: GameState,
  audio: AudioManager,
  i18n: InitI18nApi,
  render: (state: GameState) => void,
  handlers: InteractionHandlers,
): void {
  refs.clickButton.addEventListener('click', () => {
    const gained = handleManualClick(state);
    const seedResult = maybeRollClickSeed(state);
    audio.playClick();
    spawnFloatingValue(refs.clickButton, `+${formatDecimal(gained)}`);
    if (seedResult.gained > 0) {
      const seedsText = formatInteger(state.locale, seedResult.gained);
      spawnFloatingValue(refs.seedBadge, `+${seedsText}🌱`, 'rgb(252 211 77)');
      showToast({
        title: i18n.t(state.locale, 'seeds.toast.click.title'),
        message: i18n.t(state.locale, 'seeds.toast.click.body', { seeds: seedsText }),
      });
    }
    if (announce.shouldAnnounce(state.buds)) {
      announce(`Buds: ${formatDecimal(state.buds)}`);
    }
    render(state);
  });

  refs.controls.mute.button.addEventListener('click', () => {
    state.muted = audio.toggleMute();
    updateStrings(state, refs);
  });

  refs.controls.export.button.addEventListener('click', async () => {
    const payload = exportSave(state);
    try {
      await navigator.clipboard.writeText(payload);
      alert('Save kopiert.');
    } catch {
      window.prompt('Save kopieren:', payload);
    }
  });

  refs.controls.import.button.addEventListener('click', () => {
    const payload = window.prompt('Bitte Base64-Spielstand einfügen:');
    if (!payload) {
      return;
    }

    try {
      const nextState = importSave(payload);
      Object.assign(state, nextState);
      recalcDerivedValues(state);
      evaluateAchievements(state);
      audio.setMuted(state.muted);
      render(state);
    } catch (error) {
      console.error(error);
      alert('Import fehlgeschlagen.');
    }
  });

  refs.controls.reset.button.addEventListener('click', () => {
    const confirmReset = window.confirm('Spielstand wirklich löschen?');
    if (!confirmReset) {
      return;
    }

    clearSave();
    const fresh = createDefaultState({ locale: state.locale, muted: state.muted });
    Object.assign(state, fresh);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    render(state);
  });

  refs.seedBadge.addEventListener('click', () => {
    openPrestigeModal(refs, state);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.addEventListener('click', () => {
      const next = key as ResearchFilter;
      if (handlers.getActiveResearchFilter() === next) {
        return;
      }
      handlers.setActiveResearchFilter(next, next !== 'all');
      render(state);
    });
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    button.addEventListener('click', () => {
      if (handlers.getActiveSidePanelTab() === tab) {
        return;
      }
      handlers.setActiveSidePanelTab(tab);
      render(state);
    });
  });

  refs.sidePanel.prestige.actionButton.addEventListener('click', () => {
    openPrestigeModal(refs, state);
  });

  refs.prestigeModal.checkbox.addEventListener('change', (event) => {
    setPrestigeAcknowledged((event.target as HTMLInputElement).checked);
    updatePrestigeModal(refs, state);
  });

  refs.prestigeModal.cancelButton.addEventListener('click', () => {
    closePrestigeModal(refs);
  });

  refs.prestigeModal.overlay?.addEventListener('click', (event) => {
    if (event.target === refs.prestigeModal.overlay) {
      closePrestigeModal(refs);
    }
  });

  refs.prestigeModal.confirmButton.addEventListener('click', () => {
    const before = state.temp.needsRecalc;
    performPrestigeAction(state, refs);
    if (!before && state.temp.needsRecalc) {
      render(state);
    }
  });
}
