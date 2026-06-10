import Decimal from 'break_infinity.js';
import { ABILITIES } from '../data/abilities';
import type { AbilityId } from '../data/abilities';
import { itemById, items, type ItemId } from '../data/items';
import { RESEARCH, researchById, type ResearchId } from '../data/research';
import { upgradeById, upgrades, type UpgradeId } from '../data/upgrades';
import { updateAbilityTimers } from './abilities';
import { getUnlockedAchievementCount } from './achievements';
import { recalcDerivedValues, evaluateAchievements } from './game';
import {
  EVENT_IDS,
  advanceEventPipeline,
  clearExpiredEventBoost,
  dequeueEvent,
  enqueueEvent,
  type EventId,
} from './events';
import { PRESTIGE_MIN_REQUIREMENT } from './balance';
import { clearExpiredKickstart } from './milestones';
import { performPrestige } from './prestige';
import { purchaseResearch, applyResearchEffects } from './research';
import { awardSeeds, processSeedSystems } from './seeds';
import type { GameState } from './state';

interface BalanceSnapshot {
  buds: string;
  totalBuds: string;
  lifetimeBuds: string;
  bps: string;
  bpc: string;
  seeds: number;
  totalSeeds: number;
  ascensionSeeds: number;
  totalAscensionSeeds: number;
  prestigeCount: number;
  itemCount: number;
  upgradeCount: number;
  researchCount: number;
  achievementCount: number;
  goalCount: number;
  activeEvents: number;
  activeBuffs: number;
  itemCounts: Partial<Record<ItemId, number>>;
}

export interface BalanceDevtools {
  addBuds(amount: number | string): BalanceSnapshot;
  addSeeds(amount: number): BalanceSnapshot;
  simulateSeconds(seconds: number): BalanceSnapshot;
  forceEvent(id?: EventId): BalanceSnapshot;
  unlockItem(id: ItemId, amount?: number): BalanceSnapshot;
  unlockUpgrade(id: UpgradeId): BalanceSnapshot;
  unlockResearch(id: ResearchId): BalanceSnapshot;
  activateAbility(id: AbilityId): BalanceSnapshot;
  prestige(): BalanceSnapshot;
  snapshot(): BalanceSnapshot;
  ids: {
    items: ItemId[];
    upgrades: UpgradeId[];
    research: ResearchId[];
    events: EventId[];
    abilities: AbilityId[];
  };
}

declare global {
  interface Window {
    __state?: GameState;
    __biesyBalance?: BalanceDevtools;
  }
}

type RenderFn = (state: GameState) => void;

export function installBalanceDevtools(state: GameState, render: RenderFn): BalanceDevtools {
  const tools: BalanceDevtools = {
    addBuds(amount) {
      const gain = toDecimalAmount(amount);
      state.buds = state.buds.add(gain);
      state.total = state.total.add(gain);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gain);
      return commit(state, render);
    },
    addSeeds(amount) {
      awardSeeds(state, toPositiveInteger(amount), 'synergy');
      return commit(state, render);
    },
    simulateSeconds(seconds) {
      runTimeSkip(state, seconds);
      return commit(state, render);
    },
    forceEvent(id = 'golden_bud') {
      if (!EVENT_IDS.includes(id)) {
        throw new Error(`Unknown event id: ${id}`);
      }
      spawnEventNow(state, id);
      return commit(state, render);
    },
    unlockItem(id, amount = 1) {
      if (!itemById.has(id)) {
        throw new Error(`Unknown item id: ${id}`);
      }
      const safeAmount = toPositiveInteger(amount);
      const previous = state.items[id] ?? 0;
      state.items[id] = Math.max(previous, safeAmount);
      state.meta.totalItemsPurchased += Math.max(0, state.items[id] - previous);
      return commit(state, render);
    },
    unlockUpgrade(id) {
      if (!upgradeById.has(id)) {
        throw new Error(`Unknown upgrade id: ${id}`);
      }
      if (!state.upgrades[id]) {
        state.upgrades[id] = true;
        state.meta.totalUpgradesPurchased += 1;
      }
      return commit(state, render);
    },
    unlockResearch(id) {
      if (!researchById.has(id)) {
        throw new Error(`Unknown research id: ${id}`);
      }
      if (!state.researchOwned.includes(id)) {
        const purchased = purchaseResearch(state, id);
        if (!purchased) {
          state.researchOwned = [...state.researchOwned, id];
          state.meta.totalResearchPurchased += 1;
          applyResearchEffects(state);
        }
      }
      return commit(state, render);
    },
    activateAbility(id) {
      const ability = ABILITIES.find((entry) => entry.id === id);
      if (!ability) {
        throw new Error(`Unknown ability id: ${id}`);
      }
      const now = Date.now();
      state.abilities[id] = {
        active: true,
        endsAt: now + Math.round(ability.durationSec * 1000 * state.temp.abilityDurationMult),
        readyAt: now + ability.cooldownSec * 1000,
        multiplier: ability.baseMultiplier,
      };
      state.meta.abilityUsesTotal += 1;
      state.meta.abilityUses[id] = (state.meta.abilityUses[id] ?? 0) + 1;
      return commit(state, render);
    },
    prestige() {
      ensurePrestigeReady(state);
      performPrestige(state);
      return commit(state, render);
    },
    snapshot() {
      return createSnapshot(state);
    },
    ids: {
      items: items.map((item) => item.id),
      upgrades: upgrades.map((upgrade) => upgrade.id),
      research: RESEARCH.map((node) => node.id),
      events: [...EVENT_IDS],
      abilities: ABILITIES.map((ability) => ability.id),
    },
  };

  window.__state = state;
  window.__biesyBalance = tools;
  return tools;
}

function ensurePrestigeReady(state: GameState): void {
  const target = new Decimal(PRESTIGE_MIN_REQUIREMENT);
  if (state.prestige.lifetimeBuds.greaterThanOrEqualTo(target)) {
    return;
  }

  const missing = target.sub(state.prestige.lifetimeBuds);
  state.buds = state.buds.add(missing);
  state.total = state.total.add(missing);
  state.prestige.lifetimeBuds = target;
}

function commit(state: GameState, render: RenderFn): BalanceSnapshot {
  recalcDerivedValues(state);
  evaluateAchievements(state);
  render(state);
  return createSnapshot(state);
}

function runTimeSkip(state: GameState, seconds: number): void {
  const safeSeconds = Math.max(0, Math.min(86_400, finiteNumber(seconds)));
  if (safeSeconds <= 0) {
    return;
  }

  recalcDerivedValues(state);
  const now = Date.now() + Math.round(safeSeconds * 1000);
  const passiveGain = state.bps.mul(safeSeconds);
  const autoGain = state.bpc.mul(Math.max(0, state.temp.autoClickRate) * safeSeconds);
  const gain = passiveGain.add(autoGain);

  if (gain.greaterThan(0)) {
    state.buds = state.buds.add(gain);
    state.total = state.total.add(gain);
    state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gain);
  }

  updateAbilityTimers(state, now);
  clearExpiredEventBoost(state, now);
  clearExpiredKickstart(state, now);
  processSeedSystems(state, safeSeconds, now);
  advanceEventPipeline(state, safeSeconds, now);
  state.time = now;
  state.lastSeenAt = now;
  state.meta.lastSeenAt = now;
}

function spawnEventNow(state: GameState, id: EventId): void {
  const now = Date.now();
  const entry = enqueueEvent(state, id, { scheduledAt: now, priority: 100, pity: false });
  const queued = dequeueEvent(state, entry.token);
  if (!queued) {
    return;
  }

  state.events.active.push({
    ...queued,
    spawnedAt: now,
    expiresAt: now + 12_000,
    lifetimeMs: 12_000,
  });
  state.meta.eventStats.totalSpawns += 1;
  state.meta.eventStats.lastSpawnAt = now;
  const perEvent = state.meta.eventStats.perEvent[id] ?? {
    spawns: 0,
    clicks: 0,
    expired: 0,
    pityActivations: 0,
    clickRate: 0,
    lastSpawnAt: 0,
    lastClickAt: 0,
  };
  perEvent.spawns += 1;
  perEvent.lastSpawnAt = now;
  perEvent.clickRate = perEvent.spawns > 0 ? perEvent.clicks / perEvent.spawns : 0;
  state.meta.eventStats.perEvent[id] = perEvent;
}

function createSnapshot(state: GameState): BalanceSnapshot {
  const itemCount = Object.values(state.items).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );
  const activeAbilityCount = Object.values(state.abilities).filter(
    (ability) => ability.active,
  ).length;
  const activeEventBoosts = Array.isArray(state.temp.eventBoosts)
    ? state.temp.eventBoosts.filter((boost) => boost.endsAt > Date.now()).length
    : state.temp.activeEventBoost
      ? 1
      : 0;
  const activeBuffs =
    activeAbilityCount + activeEventBoosts + (state.temp.kickstartLevel > 0 ? 1 : 0);

  return {
    buds: state.buds.toString(),
    totalBuds: state.total.toString(),
    lifetimeBuds: state.prestige.lifetimeBuds.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    seeds: state.prestige.seeds,
    totalSeeds: state.prestige.totalSeeds,
    ascensionSeeds: state.prestige.ascensionSeeds,
    totalAscensionSeeds: state.prestige.totalAscensionSeeds,
    prestigeCount: state.meta.prestigeCount,
    itemCount,
    upgradeCount: Object.values(state.upgrades).filter(Boolean).length,
    researchCount: state.researchOwned.length,
    achievementCount: getUnlockedAchievementCount(state),
    goalCount: state.meta.completedGoals.length,
    activeEvents: state.events.active.length,
    activeBuffs,
    itemCounts: { ...state.items },
  } satisfies BalanceSnapshot;
}

function toDecimalAmount(value: number | string): Decimal {
  const amount = new Decimal(value);
  return amount.greaterThan(0) ? amount : new Decimal(0);
}

function toPositiveInteger(value: number): number {
  return Math.max(0, Math.floor(finiteNumber(value)));
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
