import { getPrestigePreview } from './prestige';
import { getResearchList } from './research';
import { getUpgradeEntries } from './upgrades';
import type { GameState } from './state';

export type StrategyTone = 'active' | 'shop' | 'upgrade' | 'research' | 'prestige';

export interface StrategySnapshot {
  tone: StrategyTone;
  titleKey: string;
  bodyKey: string;
  detailKey: string;
  detailParams?: Record<string, string | number>;
}

export function getStrategySnapshot(state: GameState): StrategySnapshot {
  const preview = getPrestigePreview(state);
  if (preview.requirementMet && preview.seedGain > 0) {
    return {
      tone: 'prestige',
      titleKey: 'strategy.prestige.title',
      bodyKey: 'strategy.prestige.body',
      detailKey: 'strategy.prestige.detail',
      detailParams: { seeds: preview.seedGain },
    };
  }

  const availableResearch = getResearchList(state, 'available');
  if (availableResearch.some((entry) => entry.affordable)) {
    return {
      tone: 'research',
      titleKey: 'strategy.research.title',
      bodyKey: 'strategy.research.body',
      detailKey: 'strategy.research.detail',
      detailParams: { count: availableResearch.length },
    };
  }

  const affordableUpgrade = getUpgradeEntries(state).find((entry) => entry.affordable);
  if (affordableUpgrade) {
    return {
      tone: 'upgrade',
      titleKey: 'strategy.upgrade.title',
      bodyKey: 'strategy.upgrade.body',
      detailKey: 'strategy.upgrade.detail',
      detailParams: { name: affordableUpgrade.definition.name[state.locale] },
    };
  }

  let itemCount = 0;
  for (const value of Object.values(state.items)) {
    itemCount += value ?? 0;
  }
  if (itemCount < 10) {
    return {
      tone: 'active',
      titleKey: 'strategy.active.title',
      bodyKey: 'strategy.active.body',
      detailKey: 'strategy.active.detail',
    };
  }

  return {
    tone: 'shop',
    titleKey: 'strategy.shop.title',
    bodyKey: 'strategy.shop.body',
    detailKey: 'strategy.shop.detail',
  };
}
