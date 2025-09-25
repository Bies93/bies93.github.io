import {
  createDefaultState,
  ensureDecimal,
  type GameState,
  type MetaState,
  SAVE_VERSION,
} from './state';
import { computePrestigeMultiplier } from './prestige';
import { applyResearchEffects } from './research';
import { reapplyAbilityEffects } from './abilities';
import { DEFAULT_LOCALE, resolveLocale, type LocaleKey } from './i18n';
import { applyOfflineProgress, prepareStateForPersist } from './save/autosave';
import {
  createPersistedPayload,
  parsePersistedState,
  encodePersistedState,
  decodePersistedState,
  restoreAbilities,
  restoreKickstart,
  cleanAbilityFlags,
  stringifyPersistedState,
} from './save/serializer';
import {
  normaliseMilestoneFlags,
  normalisePreferences,
  normaliseAutomation,
  upgradePersistedState,
} from './save/migrations';
import {
  readRawSave,
  writePersistedState,
  clearPersistedState,
  ensureVersionedSave,
  readMutedPreference,
  writeMutedPreference,
} from './save/storage';
import type { PersistedStateV7 } from './save/types';
import { RESEARCH, type ResearchId } from '../data/research';
import { SEED_SYNERGY_IDS, type SeedSynergyId } from './seeds';
import { createDefaultEventStats } from './events';

export type { PersistedStateV7 } from './save/types';

const RESEARCH_ID_SET = new Set<string>(RESEARCH.map((entry) => entry.id));
const SEED_SYNERGY_ID_SET = new Set<string>(SEED_SYNERGY_IDS);

function isResearchId(value: unknown): value is ResearchId {
  return typeof value === 'string' && RESEARCH_ID_SET.has(value);
}

function isSeedSynergyId(value: unknown): value is SeedSynergyId {
  return typeof value === 'string' && SEED_SYNERGY_ID_SET.has(value);
}

export function migrate(): void {
  const raw = readRawSave();
  ensureVersionedSave(raw);
}

export function load(): PersistedStateV7 | null {
  const raw = readRawSave();
  if (!raw) {
    return null;
  }

  const parsed = parsePersistedState(raw);
  if (!parsed) {
    return null;
  }

  const upgraded = upgradePersistedState(parsed);
  if (!upgraded) {
    return null;
  }

  writePersistedState(upgraded, stringifyPersistedState);
  return upgraded;
}

export function initState(saved: PersistedStateV7 | null): GameState {
  if (!saved) {
    return createDefaultState({
      locale: detectLocale(),
      muted: loadAudioPreference(),
    });
  }

  const now = Date.now();
  const prestigeSeeds = Math.max(0, Math.floor(saved.prestige?.seeds ?? 0));
  const prestigeMult = computePrestigeMultiplier(prestigeSeeds);
  const prestigeLifetime = ensureDecimal(saved.prestige?.lifetimeBuds ?? saved.total ?? '0');
  const researchOwned = Array.isArray(saved.researchOwned)
    ? [...new Set(saved.researchOwned.filter(isResearchId))]
    : [];

  const metaLastSeen = Number.isFinite(saved.meta?.lastSeenAt)
    ? Math.floor(saved.meta!.lastSeenAt)
    : saved.lastSeenAt ?? saved.time ?? now;
  const safeLastSeen = metaLastSeen > 0 ? metaLastSeen : now;
  const metaBps = Number.isFinite(saved.meta?.lastBpsAtSave) && saved.meta!.lastBpsAtSave >= 0
    ? saved.meta!.lastBpsAtSave
    : 0;
  const seedHistory = Array.isArray(saved.meta?.seedHistory) ? [...saved.meta.seedHistory] : [];
  const seedSynergyClaims: Partial<Record<SeedSynergyId, boolean>> = {};
  if (saved.meta?.seedSynergyClaims) {
    for (const [key, value] of Object.entries(saved.meta.seedSynergyClaims)) {
      if (typeof value === 'boolean' && isSeedSynergyId(key)) {
        seedSynergyClaims[key] = value;
      }
    }
  }
  const lastInteraction = Number.isFinite(saved.meta?.lastInteractionAt)
    ? Math.max(0, Math.floor(saved.meta!.lastInteractionAt!))
    : safeLastSeen;
  const idleMs = Number.isFinite(saved.meta?.seedPassiveIdleMs)
    ? Math.max(0, Math.floor(saved.meta!.seedPassiveIdleMs!))
    : 0;
  const rollsDone = Number.isFinite(saved.meta?.seedPassiveRollsDone)
    ? Math.max(0, Math.floor(saved.meta!.seedPassiveRollsDone!))
    : 0;

  const initialMeta: MetaState = {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: metaBps,
    seedHistory,
    seedSynergyClaims,
    lastInteractionAt: lastInteraction,
    seedPassiveIdleMs: idleMs,
    seedPassiveRollsDone: rollsDone,
    eventStats: saved.meta?.eventStats ?? createDefaultEventStats(safeLastSeen),
  } satisfies MetaState;

  const state = createDefaultState({
    v: SAVE_VERSION,
    buds: ensureDecimal(saved.buds),
    total: ensureDecimal(saved.total),
    bps: ensureDecimal(saved.bps),
    bpc: ensureDecimal(saved.bpc),
    items: saved.items ?? {},
    upgrades: saved.upgrades ?? {},
    achievements: saved.achievements ?? {},
    researchOwned,
    prestige: {
      seeds: prestigeSeeds,
      mult: prestigeMult,
      lifetimeBuds: prestigeLifetime,
      lastResetAt: saved.prestige?.lastResetAt ?? saved.time ?? now,
      version: saved.prestige?.version ?? 1,
      milestones: normaliseMilestoneFlags(saved.prestige?.milestones),
      kickstart: restoreKickstart(saved.prestige?.kickstart),
    },
    abilities: restoreAbilities(saved.abilities, now),
    time: saved.time ?? now,
    lastSeenAt: safeLastSeen,
    preferences: normalisePreferences(saved.preferences),
    automation: normaliseAutomation(saved.automation),
    settings: saved.settings,
    meta: initialMeta,
    locale: saved.locale ?? detectLocale(),
    muted: saved.muted ?? loadAudioPreference(),
  });

  applyResearchEffects(state);
  reapplyAbilityEffects(state);

  applyOfflineProgress(state, now);
  state.prestige.mult = computePrestigeMultiplier(state.prestige.seeds);

  cleanAbilityFlags(state.abilities, now);

  return state;
}

export function save(state: GameState): void {
  const timestamp = Date.now();
  prepareStateForPersist(state, timestamp);
  const payload = createPersistedPayload(state, timestamp);
  writePersistedState(payload, stringifyPersistedState);
}

export function exportSave(state: GameState): string {
  const timestamp = Date.now();
  prepareStateForPersist(state, timestamp);
  const payload = createPersistedPayload(state, timestamp);
  return encodePersistedState(payload);
}

export function importSave(encoded: string): GameState {
  const parsed = decodePersistedState(encoded);
  if (!parsed || !(parsed as { v?: number }).v) {
    throw new Error('Unbekanntes Save-Format');
  }

  const normalised = upgradePersistedState(parsed);
  if (!normalised) {
    throw new Error('Unbekannte Save-Version');
  }

  writePersistedState(normalised, stringifyPersistedState);
  return initState(normalised);
}

export function clearSave(): void {
  clearPersistedState();
}

export function persistAudioPreference(muted: boolean): void {
  writeMutedPreference(muted);
}

function detectLocale(): LocaleKey {
  return resolveLocale(window.navigator.language ?? DEFAULT_LOCALE);
}

function loadAudioPreference(): boolean {
  return readMutedPreference();
}
