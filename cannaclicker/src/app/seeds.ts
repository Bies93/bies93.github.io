import { updatePrestigeMultiplier } from './prestige';
import type {
  GameState,
  SeedGainEntry,
  SeedGainSource,
  SeedNotification,
} from './state';

const SEED_HISTORY_WINDOW_MS = 60 * 60 * 1000;
const MAX_HISTORY_ENTRIES = 200;
const BASE_CLICK_SEED_CHANCE = 0.01;
const MAX_CLICK_BONUS = 0.05;

interface SeedSynergyDefinition {
  id: string;
  seeds: number;
  labelKey: string;
  requirements: {
    items?: Record<string, number>;
    research?: string[];
    upgrades?: string[];
  };
}

const SEED_SYNERGIES: readonly SeedSynergyDefinition[] = [
  {
    id: 'closed_loop',
    seeds: 3,
    labelKey: 'seeds.synergy.closed_loop',
    requirements: { items: { grow_tent: 1, grow_light: 1, co2_tank: 1 } },
  },
  {
    id: 'hydro_link',
    seeds: 2,
    labelKey: 'seeds.synergy.hydro_link',
    requirements: { items: { irrigation_system: 1, hydroponic_rack: 1 } },
  },
  {
    id: 'climate_genetics',
    seeds: 4,
    labelKey: 'seeds.synergy.climate_genetics',
    requirements: { items: { climate_controller: 1, genetics_lab: 1 } },
  },
];

export function getSeedCap(state: GameState): number {
  const lifetime = state.prestige.lifetimeBuds.toNumber();
  const safeLifetime = Number.isFinite(lifetime) && lifetime >= 0 ? lifetime : 0;

  if (safeLifetime < 10_000_000) {
    return 25;
  }

  if (safeLifetime < 3_000_000_000) {
    return 60;
  }

  return 110;
}

export function updateSeedRate(state: GameState, now = Date.now()): number {
  const history = Array.isArray(state.meta.seedHistory) ? state.meta.seedHistory : [];
  const cutoff = now - SEED_HISTORY_WINDOW_MS;
  const pruned: SeedGainEntry[] = [];
  let totalSeeds = 0;
  let earliest = now;

  for (const entry of history) {
    if (!entry || entry.amount <= 0 || entry.time <= 0) {
      continue;
    }
    if (entry.time < cutoff) {
      continue;
    }
    pruned.push(entry);
    totalSeeds += entry.amount;
    if (entry.time < earliest) {
      earliest = entry.time;
    }
  }

  if (pruned.length > MAX_HISTORY_ENTRIES) {
    state.meta.seedHistory = pruned.slice(pruned.length - MAX_HISTORY_ENTRIES);
  } else {
    state.meta.seedHistory = pruned;
  }

  const span = pruned.length === 0 ? SEED_HISTORY_WINDOW_MS : Math.max(1, now - earliest);
  const perHour = totalSeeds === 0 ? 0 : (totalSeeds * 3_600_000) / span;
  state.temp.seedRatePerHour = Number.isFinite(perHour) ? perHour : 0;
  state.temp.seedRateCap = getSeedCap(state);
  return state.temp.seedRatePerHour;
}

function queueSeedNotification(state: GameState, notification: SeedNotification): void {
  if (!Array.isArray(state.temp.seedNotifications)) {
    state.temp.seedNotifications = [];
  }
  if (state.temp.seedNotifications.length >= 5) {
    state.temp.seedNotifications.shift();
  }
  state.temp.seedNotifications.push(notification);
}

export function awardSeeds(
  state: GameState,
  amount: number,
  source: SeedGainSource,
  now = Date.now(),
): number {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount <= 0) {
    return 0;
  }

  state.prestige.seeds += safeAmount;
  updatePrestigeMultiplier(state);

  const entry: SeedGainEntry = { time: now, amount: safeAmount, source };
  if (!Array.isArray(state.meta.seedHistory)) {
    state.meta.seedHistory = [];
  }
  state.meta.seedHistory.push(entry);
  if (state.meta.seedHistory.length > MAX_HISTORY_ENTRIES) {
    state.meta.seedHistory.splice(0, state.meta.seedHistory.length - MAX_HISTORY_ENTRIES);
  }

  updateSeedRate(state, now);
  return safeAmount;
}

export function recordInteraction(state: GameState, now = Date.now()): void {
  state.meta.lastInteractionAt = now;
  state.meta.seedPassiveIdleMs = 0;
  state.meta.seedPassiveRollsDone = 0;
}

export interface ClickSeedResult {
  gained: number;
  chance: number;
  throttled: boolean;
}

export function maybeRollClickSeed(
  state: GameState,
  rng: () => number = Math.random,
  now = Date.now(),
): ClickSeedResult {
  const rate = updateSeedRate(state, now);
  const cap = state.temp.seedRateCap;
  const bonus = Math.min(MAX_CLICK_BONUS, Math.max(0, state.temp.seedClickBonus ?? 0));
  const chance = Math.min(1, BASE_CLICK_SEED_CHANCE + bonus);
  const throttled = cap > 0 && rate >= cap;

  if (throttled) {
    return { gained: 0, chance, throttled: true } satisfies ClickSeedResult;
  }

  if (rng() < chance) {
    const gained = awardSeeds(state, 1, 'click', now);
    return { gained, chance, throttled: false } satisfies ClickSeedResult;
  }

  return { gained: 0, chance, throttled: false } satisfies ClickSeedResult;
}

export function processSeedSystems(state: GameState, deltaSeconds: number, now = Date.now()): void {
  const rate = updateSeedRate(state, now);
  const cap = state.temp.seedRateCap;
  const config = state.temp.seedPassiveConfig;

  if (!config) {
    state.temp.seedPassiveThrottled = false;
    state.temp.seedPassiveProgress = 0;
    return;
  }

  const throttled = cap > 0 && rate >= cap;
  state.temp.seedPassiveThrottled = throttled;

  if (throttled) {
    state.temp.seedPassiveProgress = 0;
    return;
  }

  const interval = Math.max(1, config.intervalMs);
  const idleDuration = now - state.meta.lastInteractionAt;

  if (idleDuration < interval) {
    const progress = Math.max(0, idleDuration) / interval;
    state.meta.seedPassiveIdleMs = Math.max(0, idleDuration);
    state.meta.seedPassiveRollsDone = 0;
    state.temp.seedPassiveProgress = Math.min(1, progress);
    return;
  }

  const totalAttempts = Math.floor(idleDuration / interval);
  const pendingAttempts = Math.max(0, totalAttempts - state.meta.seedPassiveRollsDone);
  const remainder = idleDuration % interval;
  state.meta.seedPassiveIdleMs = remainder;
  state.temp.seedPassiveProgress = Math.min(1, remainder / interval);

  if (pendingAttempts <= 0) {
    return;
  }

  for (let i = 0; i < pendingAttempts; i += 1) {
    if (Math.random() < config.chance) {
      const gained = awardSeeds(state, config.seeds, 'passive', now);
      if (gained > 0) {
        queueSeedNotification(state, { type: 'passive', seeds: gained });
      }
    }
  }

  state.meta.seedPassiveRollsDone = totalAttempts;
}

export function checkSeedSynergies(state: GameState, now = Date.now()): boolean {
  let awarded = false;
  if (!state.meta.seedSynergyClaims) {
    state.meta.seedSynergyClaims = {};
  }

  for (const synergy of SEED_SYNERGIES) {
    if (state.meta.seedSynergyClaims[synergy.id]) {
      continue;
    }

    if (!synergySatisfied(state, synergy)) {
      continue;
    }

    const gained = awardSeeds(state, synergy.seeds, 'synergy', now);
    state.meta.seedSynergyClaims[synergy.id] = true;
    if (gained > 0) {
      queueSeedNotification(state, { type: 'synergy', id: synergy.id, seeds: gained });
      awarded = true;
    }
  }

  return awarded;
}

function synergySatisfied(state: GameState, synergy: SeedSynergyDefinition): boolean {
  if (synergy.requirements.items) {
    for (const [itemId, required] of Object.entries(synergy.requirements.items)) {
      if ((state.items[itemId] ?? 0) < required) {
        return false;
      }
    }
  }

  if (synergy.requirements.research) {
    for (const researchId of synergy.requirements.research) {
      if (!state.researchOwned.includes(researchId)) {
        return false;
      }
    }
  }

  if (synergy.requirements.upgrades) {
    for (const upgradeId of synergy.requirements.upgrades) {
      if (!state.upgrades[upgradeId]) {
        return false;
      }
    }
  }

  return true;
}
