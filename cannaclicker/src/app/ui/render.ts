import { evaluateAchievements, recalcDerivedValues } from '../game';
import type { AudioManager } from '../audio';
import type { GameState } from '../state';
import type { ResearchFilter } from '../research';
import { getResearchList } from '../research';
import { getUpgradeEntries } from '../upgrades';
import {
  getFallbackSidePanelTab,
  getVisibleSidePanelTabs,
  type ProgressionPanel,
} from '../progression';
import type { InitI18nApi } from './bootstrap';
import type { UIRefs, SidePanelTab } from './types';
import { updateStrings } from './updaters/strings';
import { updateStats } from './updaters/statPanel';
import { processSeedNotifications } from './updaters/seeds';
import { updateAbilities } from './updaters/abilities';
import { updateSidePanel } from './updaters/sidePanel';
import { updateShop } from './updaters/shop';
import { updateUpgrades } from './updaters/upgrades';
import { updateResearch } from './updaters/research';
import { updatePrestigePanel } from './updaters/prestigePanel';
import { updateAchievements } from './updaters/achievements';
import { updateGreenhouse } from './updaters/greenhouse';
import { updatePrestigeModal } from './services/prestigeModal';
import { updateOfflineToast } from './updaters/offline';
import { save } from '../save';
import { pulseElement, spawnFloatingValue, spawnParticleBurst } from '../effects';
import type { ToastOptions } from './services/toast';
import { items } from '../../data/items';
import { canUnlockItem } from '../shop';

interface RendererContext {
  refs: UIRefs;
  audio: AudioManager;
  i18n: InitI18nApi;
  showToast: (options: ToastOptions) => void;
  getResearchState(): { filter: ResearchFilter; manual: boolean };
  setResearchState(filter: ResearchFilter, manual: boolean): void;
  getActiveSidePanelTab(): SidePanelTab;
  setActiveSidePanelTab(tab: SidePanelTab): void;
}

export function createRenderer(context: RendererContext): (state: GameState) => void {
  const { refs, audio, i18n, showToast } = context;
  let unlockSnapshot: ReturnType<typeof createUnlockSnapshot> | null = null;
  let eventSystemSeen = false;
  let prestigeReadySeen = false;

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
    const visibleTabs = getVisibleSidePanelTabs(state);
    let activeSidePanelTab = context.getActiveSidePanelTab();
    if (!visibleTabs.has(activeSidePanelTab as ProgressionPanel)) {
      activeSidePanelTab = getFallbackSidePanelTab(visibleTabs) as SidePanelTab;
      context.setActiveSidePanelTab(activeSidePanelTab);
    }
    updateSidePanel(state, refs, activeSidePanelTab, visibleTabs);

    updateShop(state, refs, {
      onPurchase: (feedback) => {
        const locale = state.locale;
        const milestone = feedback.milestone;
        audio.playPurchase({ milestone: Boolean(milestone) });
        if (milestone) {
          showToast({
            title: i18n.t(locale, 'shop.milestone.toast.title'),
            message: i18n.t(locale, 'shop.milestone.toast.message', {
              item: feedback.definition.name[locale],
              count: milestone,
            }),
            tone: 'success',
            durationMs: 4200,
          });
          spawnParticleBurst(
            refs.sidePanel.shop.entries.get(feedback.definition.id)?.container ?? refs.root,
            'milestone',
            10,
          );
        }
        render(state);
      },
      onCannotPurchase: (container) => {
        audio.playCannotBuy();
        pulseElement(container, 'is-denied', 340);
        spawnFloatingValue(container, i18n.t(state.locale, 'shop.cannotBuy'), 'error');
      },
    });

    updateUpgrades(state, refs, {
      onPurchase: (definition, container) => {
        audio.playPurchase();
        const locale = state.locale;
        const title = i18n.t(locale, 'upgrades.toast.title');
        const message = i18n.t(locale, 'upgrades.toast.message', { name: definition.name[locale] });
        showToast({ title, message, tone: 'success' });
        save(state);
        spawnFloatingValue(container, i18n.t(locale, 'upgrades.fx.spark'), 'achievement');
        spawnParticleBurst(container, 'achievement', 8);
        render(state);
      },
    });

    const researchState = context.getResearchState();
    const result = updateResearch(state, refs, researchState.filter, researchState.manual, () => {
      audio.playUnlock();
      recalcDerivedValues(state);
      render(state);
    });

    context.setResearchState(result.activeFilter, result.researchFilterManuallySelected);

    updatePrestigePanel(state, refs);
    updateGreenhouse(state, refs);
    updateAchievements(state, refs, (options: ToastOptions) => {
      audio.playAchievement(options.tone === 'rare' ? 'rare' : 'common');
      showToast(options);
    });
    updatePrestigeModal(refs, state);
    updateOfflineToast(state, (options: ToastOptions) => showToast(options));

    unlockSnapshot = announceUnlocks(
      state,
      unlockSnapshot,
      eventSystemSeen,
      prestigeReadySeen,
      context,
      (nextEventSeen, nextPrestigeSeen) => {
        eventSystemSeen = nextEventSeen;
        prestigeReadySeen = nextPrestigeSeen;
      },
    );
  };

  return render;
}

interface UnlockSnapshot {
  items: Set<string>;
  upgrades: Set<string>;
  research: Set<string>;
}

function createUnlockSnapshot(state: GameState): UnlockSnapshot {
  return {
    items: new Set(items.filter((item) => canUnlockItem(state, item)).map((item) => item.id)),
    upgrades: new Set(
      getUpgradeEntries(state)
        .filter((entry) => entry.unlocked && !entry.owned)
        .map((entry) => entry.definition.id),
    ),
    research: new Set(getResearchList(state, 'available').map((entry) => entry.node.id)),
  } satisfies UnlockSnapshot;
}

function announceUnlocks(
  state: GameState,
  previous: UnlockSnapshot | null,
  eventSystemSeen: boolean,
  prestigeReadySeen: boolean,
  context: RendererContext,
  updateFlags: (eventSeen: boolean, prestigeSeen: boolean) => void,
): UnlockSnapshot {
  const next = createUnlockSnapshot(state);
  if (!previous) {
    updateFlags(isEventSystemOpen(state), getPrestigePreviewSafe(state));
    return next;
  }

  const locale = state.locale;
  const unlockedItems = items.filter(
    (item) => next.items.has(item.id) && !previous.items.has(item.id),
  );
  const unlockedUpgrade = getUpgradeEntries(state).find(
    (entry) =>
      next.upgrades.has(entry.definition.id) && !previous.upgrades.has(entry.definition.id),
  );
  const unlockedResearch = getResearchList(state, 'available').find(
    (entry) => next.research.has(entry.node.id) && !previous.research.has(entry.node.id),
  );
  const eventOpen = isEventSystemOpen(state);
  const prestigeReady = getPrestigePreviewSafe(state);

  if (unlockedItems.length > 0) {
    context.audio.playUnlock();
    context.showToast({
      title: context.i18n.t(locale, 'unlock.item.title'),
      message: context.i18n.t(locale, 'unlock.item.message', {
        item: unlockedItems[0].name[locale],
      }),
      tone: 'success',
    });
  } else if (unlockedUpgrade) {
    context.audio.playUnlock();
    context.showToast({
      title: context.i18n.t(locale, 'unlock.upgrade.title'),
      message: context.i18n.t(locale, 'unlock.upgrade.message', {
        name: unlockedUpgrade.definition.name[locale],
      }),
      tone: 'success',
    });
  } else if (unlockedResearch) {
    context.audio.playUnlock();
    context.showToast({
      title: context.i18n.t(locale, 'unlock.research.title'),
      message: context.i18n.t(locale, 'unlock.research.message', {
        name: unlockedResearch.node.name[locale],
      }),
      tone: 'success',
    });
  } else if (eventOpen && !eventSystemSeen) {
    context.audio.playUnlock();
    context.showToast({
      title: context.i18n.t(locale, 'unlock.events.title'),
      message: context.i18n.t(locale, 'unlock.events.message'),
      tone: 'success',
    });
  } else if (prestigeReady && !prestigeReadySeen) {
    context.audio.playPrestige();
    context.showToast({
      title: context.i18n.t(locale, 'unlock.prestige.title'),
      message: context.i18n.t(locale, 'unlock.prestige.message'),
      tone: 'prestige',
      durationMs: 6500,
    });
  }

  updateFlags(eventOpen || eventSystemSeen, prestigeReady || prestigeReadySeen);
  return next;
}

function isEventSystemOpen(state: GameState): boolean {
  return (
    Object.values(state.items).some((amount) => (amount ?? 0) > 0) ||
    state.total.greaterThanOrEqualTo(60)
  );
}

function getPrestigePreviewSafe(state: GameState): boolean {
  return state.prestige.lifetimeBuds.greaterThanOrEqualTo(1_000_000);
}
