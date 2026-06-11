import { itemById, items, type ItemId } from '../data/items';
import { getPrestigePreview } from './prestige';
import { getResearchList } from './research';
import { canUnlockItem, getShopEntries } from './shop';
import { getUpgradeEntries } from './upgrades';
import { formatDecimal } from './math';
import type { GameState } from './state';

export type ProgressionPhase =
  | 'early_click'
  | 'first_shop'
  | 'first_upgrade'
  | 'events_intro'
  | 'research_intro'
  | 'prestige_ready'
  | 'post_prestige_1'
  | 'post_prestige_2'
  | 'post_prestige_3'
  | 'late_meta';

export type ProgressionPanel =
  | 'shop'
  | 'upgrades'
  | 'research'
  | 'greenhouse'
  | 'prestige'
  | 'achievements';

export type NextActionTone =
  | 'click'
  | 'shop'
  | 'production'
  | 'upgrade'
  | 'event'
  | 'research'
  | 'prestige'
  | 'unlock';

export interface NextActionHint {
  key: string;
  tone: NextActionTone;
  params?: Record<string, string | number>;
  tab?: ProgressionPanel;
}

const PANEL_PRIORITY: readonly ProgressionPanel[] = [
  'shop',
  'upgrades',
  'research',
  'prestige',
  'greenhouse',
  'achievements',
];

export function getProgressionPhase(state: GameState, now = Date.now()): ProgressionPhase {
  const prestigeCount = Math.max(0, state.meta.prestigeCount ?? 0);
  if (prestigeCount >= 4) return 'late_meta';
  if (prestigeCount >= 3) return 'post_prestige_3';
  if (prestigeCount >= 2) return 'post_prestige_2';
  if (prestigeCount >= 1) return 'post_prestige_1';

  const prestigePreview = getPrestigePreview(state);
  if (
    prestigePreview.requirementMet ||
    state.prestige.lifetimeBuds.greaterThanOrEqualTo(prestigePreview.requirementTarget.mul(0.5))
  ) {
    return 'prestige_ready';
  }

  if (isResearchRelevant(state)) return 'research_intro';
  if (isEventIntroRelevant(state, now)) return 'events_intro';
  if (isUpgradeRelevant(state)) return 'first_upgrade';
  if (hasAnyItem(state) || state.meta.manualClicks >= 5) return 'first_shop';
  return 'early_click';
}

export function getVisibleSidePanelTabs(state: GameState, now = Date.now()): Set<ProgressionPanel> {
  const tabs = new Set<ProgressionPanel>(['shop']);

  if (isUpgradeRelevant(state)) tabs.add('upgrades');
  if (isResearchRelevant(state)) tabs.add('research');
  if (isPrestigeRelevant(state, now)) tabs.add('prestige');
  if (isGreenhouseRelevant(state)) tabs.add('greenhouse');
  if (isAchievementsRelevant(state)) tabs.add('achievements');

  return tabs;
}

export function getFallbackSidePanelTab(visibleTabs: ReadonlySet<ProgressionPanel>): ProgressionPanel {
  return PANEL_PRIORITY.find((tab) => visibleTabs.has(tab)) ?? 'shop';
}

export function getNextActionHint(state: GameState, now = Date.now()): NextActionHint {
  const shopEntries = getShopEntries(state);
  const upgradeEntries = getUpgradeEntries(state);
  const researchEntries = getResearchList(state, 'available');
  const seedling = shopEntries.find((entry) => entry.definition.id === 'seedling');
  const firstAffordableShop = shopEntries.find((entry) => entry.unlocked && entry.affordable);
  const firstAffordableUpgrade = upgradeEntries.find(
    (entry) => entry.unlocked && !entry.owned && entry.affordable,
  );
  const firstAffordableResearch = researchEntries.find((entry) => entry.affordable);
  const locale = state.locale;

  if (state.meta.manualClicks <= 0 && state.total.lessThan(1)) {
    return { key: 'nextAction.firstClick', tone: 'click' };
  }

  if (seedling && seedling.owned <= 0) {
    if (seedling.affordable) {
      return {
        key: 'nextAction.buyFirstItem',
        tone: 'shop',
        tab: 'shop',
        params: { item: seedling.definition.name[locale] },
      };
    }

    const missing = seedling.cost.sub(state.buds);
    return {
      key: 'nextAction.harvestForFirstItem',
      tone: 'click',
      tab: 'shop',
      params: {
        item: seedling.definition.name[locale],
        amount: formatDecimal(missing.greaterThan(0) ? missing : 0),
      },
    };
  }

  if (state.bps.lessThanOrEqualTo(0) && firstAffordableShop) {
    return {
      key: 'nextAction.buyProduction',
      tone: 'shop',
      tab: 'shop',
      params: { item: firstAffordableShop.definition.name[locale] },
    };
  }

  if (firstAffordableUpgrade) {
    return {
      key: 'nextAction.buyUpgrade',
      tone: 'upgrade',
      tab: 'upgrades',
      params: { upgrade: firstAffordableUpgrade.definition.name[locale] },
    };
  }

  if (isWaitingForFirstEventMoment(state, now)) {
    return { key: 'nextAction.watchFirstEvent', tone: 'event' };
  }

  if (isResearchRelevant(state)) {
    if (firstAffordableResearch) {
      return {
        key: 'nextAction.buyResearch',
        tone: 'research',
        tab: 'research',
        params: { research: firstAffordableResearch.node.name[locale] },
      };
    }
    if (state.researchOwned.length <= 0) {
      return {
        key: 'nextAction.prepareResearch',
        tone: 'research',
        tab: 'research',
        params: { amount: formatDecimal(12_000) },
      };
    }
  }

  const prestigePreview = getPrestigePreview(state);
  if (prestigePreview.requirementMet) {
    return {
      key: 'nextAction.prestigeReady',
      tone: 'prestige',
      tab: 'prestige',
      params: { seeds: prestigePreview.seedGain },
    };
  }

  const nextLocked = items.find((item) => !canUnlockItem(state, item));
  if (nextLocked) {
    const unlock = nextLocked.unlock;
    if (unlock?.totalBuds) {
      return {
        key: 'nextAction.nextUnlockTotal',
        tone: 'unlock',
        tab: 'shop',
        params: {
          item: nextLocked.name[locale],
          amount: formatDecimal(Math.max(0, unlock.totalBuds - state.total.toNumber())),
        },
      };
    }
    if (unlock?.itemsOwned) {
      const [itemId, required] = Object.entries(unlock.itemsOwned)[0] ?? [];
      const current = itemId ? (state.items[itemId as ItemId] ?? 0) : 0;
      const source = itemById.get(itemId as ItemId);
      return {
        key: 'nextAction.nextUnlockItems',
        tone: 'unlock',
        tab: 'shop',
        params: {
          item: nextLocked.name[locale],
          count: Math.max(0, (required ?? 0) - current),
          source: source?.name[locale] ?? itemId,
        },
      };
    }
  }

  return { key: 'nextAction.optimize', tone: 'production', tab: 'shop' };
}

function hasAnyItem(state: GameState): boolean {
  return Object.values(state.items).some((amount) => (amount ?? 0) > 0);
}

function isUpgradeRelevant(state: GameState): boolean {
  if (state.meta.totalUpgradesPurchased > 0) return true;
  if (hasAnyItem(state)) return true;
  if (state.total.greaterThanOrEqualTo(60)) return true;
  return getUpgradeEntries(state).some((entry) => entry.unlocked && !entry.owned);
}

function isResearchRelevant(state: GameState): boolean {
  if (state.researchOwned.length > 0 || state.meta.totalResearchPurchased > 0) return true;
  if ((state.prestige.seeds ?? 0) > 0 || (state.prestige.ascensionSeeds ?? 0) > 0) return true;
  if (state.total.greaterThanOrEqualTo(8_000) || state.buds.greaterThanOrEqualTo(6_000)) return true;
  return getResearchList(state, 'available').some((entry) => entry.affordable);
}

function isPrestigeRelevant(state: GameState, now: number): boolean {
  if (state.meta.prestigeCount > 0 || (state.prestige.totalAscensionSeeds ?? 0) > 0) return true;
  const preview = getPrestigePreview(state);
  const runAgeMs = Math.max(0, now - (state.prestige.lastResetAt || state.time || now));
  return (
    preview.requirementMet ||
    runAgeMs >= 30 * 60 * 1000 ||
    state.prestige.lifetimeBuds.greaterThanOrEqualTo(preview.requirementTarget.mul(0.25))
  );
}

function isGreenhouseRelevant(state: GameState): boolean {
  return state.meta.prestigeCount >= 1 || (state.prestige.totalAscensionSeeds ?? 0) > 0;
}

function isAchievementsRelevant(state: GameState): boolean {
  const unlockedAchievements = Object.values(state.achievements).filter(Boolean).length;
  return (
    unlockedAchievements >= 3 ||
    state.meta.completedGoals.length >= 2 ||
    state.meta.prestigeCount >= 1 ||
    state.total.greaterThanOrEqualTo(25_000)
  );
}

function isEventIntroRelevant(state: GameState, now: number): boolean {
  return (
    state.meta.eventStats.totalClicks > 0 ||
    state.meta.eventStats.totalSpawns > 0 ||
    isWaitingForFirstEventMoment(state, now)
  );
}

function isWaitingForFirstEventMoment(state: GameState, now: number): boolean {
  const runAgeMs = Math.max(0, now - (state.prestige.lastResetAt || state.time || now));
  return (
    state.meta.eventStats.totalClicks <= 0 &&
    state.meta.eventStats.totalSpawns <= 0 &&
    hasAnyItem(state) &&
    state.total.greaterThanOrEqualTo(12) &&
    runAgeMs >= 60_000 &&
    runAgeMs <= 130_000
  );
}
