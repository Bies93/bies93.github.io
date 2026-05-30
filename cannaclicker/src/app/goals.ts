import Decimal from 'break_infinity.js';
import { goals, type GoalDefinition, type GoalId } from '../data/goals';
import { getRequirementProgress, type AchievementProgress } from './achievements';
import type { GameState } from './state';
import { awardSeeds } from './seeds';

export interface GoalViewModel {
  current: GoalDefinition | null;
  currentProgress: AchievementProgress | null;
  next: GoalDefinition | null;
}

export function getGoalView(state: GameState): GoalViewModel {
  const completed = new Set(state.meta.completedGoals);
  const current = goals.find((goal) => !completed.has(goal.id)) ?? null;
  const next = current
    ? (goals.find((goal) => !completed.has(goal.id) && goal.id !== current.id) ?? null)
    : null;
  return {
    current,
    currentProgress: current ? getRequirementProgress(state, current.requirement) : null,
    next,
  } satisfies GoalViewModel;
}

export function claimGoal(state: GameState, id: GoalId): boolean {
  if (state.meta.completedGoals.includes(id)) {
    return false;
  }

  const goal = goals.find((entry) => entry.id === id);
  if (!goal) {
    return false;
  }

  const progress = getRequirementProgress(state, goal.requirement);
  if (!progress.complete) {
    return false;
  }

  state.meta.completedGoals = [...state.meta.completedGoals, id];

  if (goal.reward.type === 'buds') {
    const reward = new Decimal(goal.reward.amount);
    state.buds = state.buds.add(reward);
    state.total = state.total.add(reward);
    state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(reward);
  } else if (goal.reward.type === 'seeds') {
    awardSeeds(state, goal.reward.amount, 'synergy');
  }

  return true;
}
