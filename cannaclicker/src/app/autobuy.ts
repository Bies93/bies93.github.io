import Decimal from 'break_infinity.js';
import { buyItem } from './game';
import { getShopEntries } from './shop';
import type { GameState } from './state';

export const AUTO_BUY_INTERVAL_SECONDS = 0.5;

function resolveSpendableBudget(state: GameState): Decimal {
  const { autoBuy } = state.automation;
  if (!autoBuy.enabled || !autoBuy.reserve.enabled) {
    return state.buds;
  }

  const percent = Math.max(0, Math.min(100, autoBuy.reserve.percent));
  if (percent <= 0) {
    return state.buds;
  }

  const reserveRatio = percent / 100;
  const reserveAmount = state.buds.mul(reserveRatio);
  const spendable = state.buds.sub(reserveAmount);
  return spendable.greaterThan(0) ? spendable : new Decimal(0);
}

function pickBestRoiTarget(state: GameState, budget: Decimal) {
  const { autoBuy } = state.automation;
  if (!autoBuy.roi.enabled) {
    return null;
  }

  const threshold = autoBuy.roi.thresholdSeconds;
  const entries = getShopEntries(state);

  return entries
    .filter((entry) => {
      if (!entry.unlocked) {
        return false;
      }

      if (entry.roi === null || !Number.isFinite(entry.roi)) {
        return false;
      }

      if (entry.roi > threshold) {
        return false;
      }

      if (entry.deltaBps.lessThanOrEqualTo(0)) {
        return false;
      }

      if (entry.cost.greaterThan(budget)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.roi !== b.roi) {
        return (a.roi ?? Infinity) - (b.roi ?? Infinity);
      }

      if (a.cost.lessThan(b.cost)) {
        return -1;
      }

      if (a.cost.greaterThan(b.cost)) {
        return 1;
      }

      return a.order - b.order;
    })[0] ?? null;
}

export function runAutoBuy(state: GameState): boolean {
  const { autoBuy } = state.automation;
  if (!autoBuy.enabled) {
    return false;
  }

  const budget = resolveSpendableBudget(state);
  if (budget.lessThanOrEqualTo(0)) {
    return false;
  }

  const target = pickBestRoiTarget(state, budget);
  if (!target) {
    return false;
  }

  return buyItem(state, target.definition.id, 1, 'auto');
}
