import Decimal from 'break_infinity.js';
import { itemSynergies } from '../data/itemSynergies';
import type { ItemId } from '../data/items';
import type { GameState } from './state';

export interface ActiveItemSynergySummary {
  id: string;
  name: string;
  bonus: number;
}

export function getItemSynergyMultiplier(state: GameState, target: ItemId): Decimal {
  return itemSynergies.reduce((multiplier, synergy) => {
    if (!synergy.targets.includes(target)) {
      return multiplier;
    }

    const stacks = getSynergyStacks(state, synergy.source, synergy.perSource, synergy.maxStacks);
    if (stacks <= 0) {
      return multiplier;
    }

    return multiplier.mul(1 + stacks * synergy.bonusPerStack);
  }, new Decimal(1));
}

export function getActiveItemSynergySummaries(
  state: GameState,
  target: ItemId,
): ActiveItemSynergySummary[] {
  return itemSynergies
    .filter((synergy) => synergy.targets.includes(target))
    .map((synergy) => {
      const stacks = getSynergyStacks(state, synergy.source, synergy.perSource, synergy.maxStacks);
      return {
        id: synergy.id,
        name: synergy.name[state.locale],
        bonus: stacks * synergy.bonusPerStack,
      } satisfies ActiveItemSynergySummary;
    })
    .filter((summary) => summary.bonus > 0)
    .sort((a, b) => b.bonus - a.bonus);
}

function getSynergyStacks(
  state: GameState,
  source: ItemId,
  perSource: number,
  maxStacks: number,
): number {
  const owned = state.items[source] ?? 0;
  const step = Math.max(1, Math.floor(perSource));
  const limit = Math.max(1, Math.floor(maxStacks));
  return Math.min(limit, Math.floor(Math.max(0, owned) / step));
}
