import type { GameState, KickstartState } from '../state';
import { getKickstartConfig } from '../milestones';
import type {
  PersistedAbilityRecord,
  PersistedAbilityState,
  PersistedKickstartState,
  PersistedStateAny,
  PersistedStateV7,
  RestoredAbilityState,
} from './types';
import type { AbilityId } from '../state';

const ABILITY_IDS: AbilityId[] = ['overdrive', 'burst'];

export function restoreAbilities(abilities: Record<string, PersistedAbilityState> | undefined, now: number): RestoredAbilityState {
  const restored: RestoredAbilityState = {
    overdrive: { active: false, endsAt: now, readyAt: now, multiplier: 1 },
    burst: { active: false, endsAt: now, readyAt: now, multiplier: 1 },
  };

  for (const id of ABILITY_IDS) {
    const legacyKey = id === 'burst' ? 'burst_click' : id;
    const entry = abilities?.[id] ?? abilities?.[legacyKey];
    if (!entry) {
      continue;
    }

    const endsAt = Number.isFinite(entry.endsAt) ? entry.endsAt! : now;
    const readyAt = Number.isFinite(entry.readyAt) ? entry.readyAt! : now;
    const active = !!entry.active && endsAt > now;

    restored[id] = {
      active,
      endsAt: active ? endsAt : now,
      readyAt,
      multiplier: 1,
    };
  }

  return restored;
}

export function restoreKickstart(kickstart: PersistedKickstartState | null | undefined): KickstartState | null {
  if (!kickstart) {
    return null;
  }

  const level = Number.isFinite(kickstart.level) ? Math.max(1, Math.floor(kickstart.level!)) : NaN;
  const config = getKickstartConfig(level);
  if (!config) {
    return null;
  }

  const now = Date.now();
  const endsAt = Number.isFinite(kickstart.endsAt) ? Math.max(0, Math.floor(kickstart.endsAt!)) : 0;
  if (endsAt <= now) {
    return null;
  }

  return { level: config.level, endsAt } satisfies KickstartState;
}

export function cleanAbilityFlags(state: RestoredAbilityState, now: number): void {
  for (const id of ABILITY_IDS) {
    const ability = state[id];
    if (!ability) {
      continue;
    }

    if (ability.active && ability.endsAt <= now) {
      ability.active = false;
      ability.endsAt = now;
    }
    if (ability.readyAt < now && ability.active) {
      ability.readyAt = ability.endsAt;
    }
  }
}

export function serialiseAbilities(state: RestoredAbilityState): PersistedAbilityRecord {
  return ABILITY_IDS.reduce((acc, id) => {
    const ability = state[id];
    acc[id] = {
      active: ability?.active ?? false,
      endsAt: ability?.endsAt ?? Date.now(),
      readyAt: ability?.readyAt ?? Date.now(),
    };
    return acc;
  }, {} as PersistedAbilityRecord);
}

export function createPersistedPayload(state: GameState, timestamp: number): PersistedStateV7 {
  return {
    v: state.v,
    buds: state.buds.toString(),
    total: state.total.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    items: state.items,
    upgrades: state.upgrades,
    achievements: state.achievements,
    researchOwned: state.researchOwned,
    prestige: {
      seeds: state.prestige.seeds,
      mult: state.prestige.mult.toString(),
      lifetimeBuds: state.prestige.lifetimeBuds.toString(),
      lastResetAt: state.prestige.lastResetAt,
      version: state.prestige.version,
      milestones: state.prestige.milestones,
      kickstart: state.prestige.kickstart,
    },
    abilities: serialiseAbilities(state.abilities),
    time: timestamp,
    lastSeenAt: timestamp,
    locale: state.locale,
    muted: state.muted,
    preferences: state.preferences,
    automation: state.automation,
    settings: state.settings,
    meta: {
      lastSeenAt: state.meta.lastSeenAt,
      lastBpsAtSave: state.meta.lastBpsAtSave,
      seedHistory: state.meta.seedHistory.slice(-200),
      seedSynergyClaims: state.meta.seedSynergyClaims,
      lastInteractionAt: state.meta.lastInteractionAt,
      seedPassiveIdleMs: state.meta.seedPassiveIdleMs,
      seedPassiveRollsDone: state.meta.seedPassiveRollsDone,
    },
  } satisfies PersistedStateV7;
}

export function stringifyPersistedState(state: PersistedStateV7): string {
  return JSON.stringify(state);
}

export function parsePersistedState(raw: string): PersistedStateAny | null {
  try {
    const parsed = JSON.parse(raw) as PersistedStateAny | null;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function encodePersistedState(state: PersistedStateV7): string {
  const json = stringifyPersistedState(state);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodePersistedState(encoded: string): PersistedStateAny {
  const decoded = decodeURIComponent(escape(atob(encoded.trim())));
  return JSON.parse(decoded) as PersistedStateAny;
}
