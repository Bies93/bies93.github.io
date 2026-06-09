import Decimal from 'break_infinity.js';
import { goals, type GoalDefinition, type GoalId, type GoalReward } from '../data/goals';
import { getRequirementProgress, type AchievementProgress } from './achievements';
import type { EventBoostState, EventBoostTarget, GameState } from './state';
import { awardSeeds } from './seeds';
import { clearExpiredEventBoost } from './events';

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
  } else if (goal.reward.type === 'boost') {
    grantGoalBoost(state, goal.reward);
  }

  return true;
}

function grantGoalBoost(state: GameState, reward: Extract<GoalReward, { type: 'boost' }>): void {
  const now = Date.now();
  const target: EventBoostTarget = reward.target ?? 'both';
  const boost: EventBoostState = {
    id: 'goal_reward',
    target,
    multiplier: reward.multiplier,
    startedAt: now,
    endsAt: now + reward.durationMs,
  };
  const boosts = Array.isArray(state.temp.eventBoosts)
    ? state.temp.eventBoosts.filter((entry) => entry.endsAt > now)
    : [];
  const existingIndex = boosts.findIndex(
    (entry) => entry.id === boost.id && entry.target === target,
  );
  if (existingIndex >= 0) {
    boosts[existingIndex] = boost;
  } else {
    boosts.push(boost);
  }
  state.temp.eventBoosts = boosts;
  clearExpiredEventBoost(state, now);
  state.temp.needsRecalc = true;
}
