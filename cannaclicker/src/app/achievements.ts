import Decimal from 'break_infinity.js';
import {
  achievements,
  type AchievementCategory,
  type AchievementDefinition,
  type AchievementRequirement,
} from '../data/achievements';
import { items } from '../data/items';
import type { AbilityId } from '../data/abilities';
import type { EventId } from './events';
import type { GameState } from './state';
import { canUnlockItem } from './shop';

export interface AchievementProgress {
  complete: boolean;
  progress: number;
  current: number;
  target: number;
}

type NumericRequirementKey =
  | 'manualClicks'
  | 'totalItemsOwned'
  | 'upgradeCount'
  | 'researchCount'
  | 'eventClicks'
  | 'currentSeeds'
  | 'seedsEarned'
  | 'seedsSpent'
  | 'prestigeCount'
  | 'offlineBuds'
  | 'offlineReturns'
  | 'abilityUses'
  | 'activeBuffCount'
  | 'achievementScore';

const NUMERIC_KEYS: readonly NumericRequirementKey[] = [
  'manualClicks',
  'totalItemsOwned',
  'upgradeCount',
  'researchCount',
  'eventClicks',
  'currentSeeds',
  'seedsEarned',
  'seedsSpent',
  'prestigeCount',
  'offlineBuds',
  'offlineReturns',
  'abilityUses',
  'activeBuffCount',
  'achievementScore',
];

export interface AchievementCategorySummary {
  total: number;
  unlocked: number;
}

export interface AchievementSummary {
  total: number;
  unlocked: number;
  hiddenTotal: number;
  hiddenUnlocked: number;
  nearCount: number;
  score: number;
  maxScore: number;
  multiplier: number;
  categories: Partial<Record<AchievementCategory, AchievementCategorySummary>>;
}

export function getAchievementProgress(
  state: GameState,
  definition: AchievementDefinition,
): AchievementProgress {
  return getRequirementProgress(state, definition.requirement);
}

export function achievementRequirementMet(
  state: GameState,
  definition: AchievementDefinition,
): boolean {
  return getAchievementProgress(state, definition).complete;
}

export function getRequirementProgress(
  state: GameState,
  requirement: AchievementRequirement,
): AchievementProgress {
  const checks: AchievementProgress[] = [];

  addDecimalCheck(checks, state.total, requirement.totalBuds);
  addDecimalCheck(checks, state.buds, requirement.currentBuds);
  addDecimalCheck(checks, state.bps, requirement.bps);
  addDecimalCheck(checks, state.bpc, requirement.bpc);

  for (const key of NUMERIC_KEYS) {
    const target = requirement[key];
    if (typeof target === 'number') {
      checks.push(createProgress(resolveNumericValue(state, key), target));
    }
  }

  if (requirement.itemsOwned) {
    for (const [itemId, amount] of Object.entries(requirement.itemsOwned)) {
      checks.push(createProgress(state.items[itemId] ?? 0, amount ?? 0));
    }
  }

  if (requirement.eventTypeClicks) {
    for (const [eventId, amount] of Object.entries(requirement.eventTypeClicks)) {
      const perEvent = state.meta.eventStats.perEvent[eventId as EventId];
      checks.push(createProgress(perEvent?.clicks ?? 0, amount ?? 0));
    }
  }

  if (requirement.abilityUse) {
    for (const [abilityId, amount] of Object.entries(requirement.abilityUse)) {
      checks.push(createProgress(state.meta.abilityUses[abilityId as AbilityId] ?? 0, amount ?? 0));
    }
  }

  if (requirement.allItemsUnlocked) {
    const visible = items.filter((item) => canUnlockItem(state, item)).length;
    checks.push(createProgress(visible, items.length));
  }

  if (checks.length === 0) {
    return createProgress(1, 1);
  }

  const weakest = checks.reduce((current, next) =>
    next.progress < current.progress ? next : current,
  );
  return {
    complete: checks.every((check) => check.complete),
    progress: Math.min(1, Math.max(0, weakest.progress)),
    current: weakest.current,
    target: weakest.target,
  } satisfies AchievementProgress;
}

export function getUnlockedAchievementCount(state: GameState): number {
  return achievements.reduce((count, achievement) => {
    return state.achievements[achievement.id] ? count + 1 : count;
  }, 0);
}

export function getAchievementScoreValue(definition: AchievementDefinition): number {
  if (typeof definition.score === 'number' && Number.isFinite(definition.score)) {
    return Math.max(0, Math.floor(definition.score));
  }
  switch (definition.rarity) {
    case 'legendary':
      return 80;
    case 'epic':
      return 35;
    case 'rare':
      return 15;
    default:
      return 5;
  }
}

export function getAchievementScore(state: GameState): number {
  return achievements.reduce((score, achievement) => {
    return state.achievements[achievement.id]
      ? score + getAchievementScoreValue(achievement)
      : score;
  }, 0);
}

export function getMaxAchievementScore(): number {
  return achievements.reduce(
    (score, achievement) => score + getAchievementScoreValue(achievement),
    0,
  );
}

export function getAchievementScoreMultiplier(state: GameState): number {
  const score = getAchievementScore(state);
  const bonus = Math.min(0.06, Math.floor(score / 100) * 0.0025);
  return 1 + bonus;
}

export function getAchievementSummary(state: GameState): AchievementSummary {
  const categories: Partial<Record<AchievementCategory, AchievementCategorySummary>> = {};
  let unlocked = 0;
  let hiddenTotal = 0;
  let hiddenUnlocked = 0;
  let nearCount = 0;

  for (const achievement of achievements) {
    const category = achievement.category;
    const categorySummary = categories[category] ?? { total: 0, unlocked: 0 };
    categorySummary.total += 1;

    const isUnlocked = Boolean(state.achievements[achievement.id]);
    if (isUnlocked) {
      unlocked += 1;
      categorySummary.unlocked += 1;
    } else if (!achievement.hidden && getAchievementProgress(state, achievement).progress >= 0.7) {
      nearCount += 1;
    }
    if (achievement.hidden) {
      hiddenTotal += 1;
      if (isUnlocked) {
        hiddenUnlocked += 1;
      }
    }
    categories[category] = categorySummary;
  }

  return {
    total: achievements.length,
    unlocked,
    hiddenTotal,
    hiddenUnlocked,
    nearCount,
    score: getAchievementScore(state),
    maxScore: getMaxAchievementScore(),
    multiplier: getAchievementScoreMultiplier(state),
    categories,
  } satisfies AchievementSummary;
}

function addDecimalCheck(
  checks: AchievementProgress[],
  current: Decimal,
  target: number | undefined,
): void {
  if (typeof target !== 'number') {
    return;
  }

  const currentNumber = current.toNumber();
  checks.push(createProgress(Number.isFinite(currentNumber) ? currentNumber : target, target));
}

function createProgress(current: number, target: number): AchievementProgress {
  const safeTarget = Math.max(0, target);
  const safeCurrent = Math.max(0, current);
  const complete = safeTarget <= 0 ? safeCurrent <= safeTarget : safeCurrent >= safeTarget;
  const progress = safeTarget <= 0 ? (complete ? 1 : 0) : safeCurrent / safeTarget;
  return {
    complete,
    progress: Math.max(0, Math.min(1, progress)),
    current: safeCurrent,
    target: safeTarget,
  } satisfies AchievementProgress;
}

function resolveNumericValue(state: GameState, key: NumericRequirementKey): number {
  switch (key) {
    case 'manualClicks':
      return state.meta.manualClicks;
    case 'totalItemsOwned':
      return Object.values(state.items).reduce<number>((sum, value) => sum + (value ?? 0), 0);
    case 'upgradeCount':
      return Object.values(state.upgrades).filter(Boolean).length;
    case 'researchCount':
      return state.researchOwned.length;
    case 'eventClicks':
      return state.meta.eventStats.totalClicks;
    case 'currentSeeds':
      return state.prestige.seeds;
    case 'seedsEarned':
      return state.prestige.totalSeeds ?? state.prestige.seeds;
    case 'seedsSpent':
      return state.meta.seedsSpent;
    case 'prestigeCount':
      return state.meta.prestigeCount;
    case 'offlineBuds':
      return state.meta.offlineBudsTotal;
    case 'offlineReturns':
      return state.meta.offlineReturns;
    case 'abilityUses':
      return state.meta.abilityUsesTotal;
    case 'activeBuffCount':
      return countActiveBuffs(state);
    case 'achievementScore':
      return getAchievementScore(state);
    default:
      return 0;
  }
}

function countActiveBuffs(state: GameState): number {
  const abilityBuffs = Object.values(state.abilities).filter((ability) => ability?.active).length;
  const eventBuffs = Array.isArray(state.temp.eventBoosts)
    ? state.temp.eventBoosts.filter((boost) => boost.endsAt > Date.now()).length
    : state.temp.activeEventBoost
      ? 1
      : 0;
  const kickstart = state.temp.kickstartRemainingMs > 0 ? 1 : 0;
  return abilityBuffs + eventBuffs + kickstart;
}
