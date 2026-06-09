import {
  createDefaultState,
  ensureDecimal,
  type GameState,
  type MetaState,
  SAVE_VERSION,
} from './state';
import { computePrestigeMultiplier } from './prestige';
import { applyAscensionEffects } from './ascension';
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
  normaliseMeta,
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

export type { PersistedStateV7 } from './save/types';

const RESEARCH_ID_SET = new Set<string>(RESEARCH.map((entry) => entry.id));

function isResearchId(value: unknown): value is ResearchId {
  return typeof value === 'string' && RESEARCH_ID_SET.has(value);
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
  const runSeeds = Math.max(0, Math.floor(saved.prestige?.seeds ?? 0));
  const totalRunSeeds = Math.max(runSeeds, Math.floor(saved.prestige?.totalSeeds ?? runSeeds));
  const ascensionSeeds = Math.max(0, Math.floor(saved.prestige?.ascensionSeeds ?? 0));
  const ascensionSpent = Math.max(0, Math.floor(saved.prestige?.ascensionSpent ?? 0));
  const totalAscensionSeeds = Math.max(
    ascensionSeeds + ascensionSpent,
    Math.floor(saved.prestige?.totalAscensionSeeds ?? ascensionSeeds),
  );
  const prestigeMult = computePrestigeMultiplier(totalAscensionSeeds);
  const prestigeLifetime = ensureDecimal(saved.prestige?.lifetimeBuds ?? saved.total ?? '0');
  const researchOwned = Array.isArray(saved.researchOwned)
    ? [...new Set(saved.researchOwned.filter(isResearchId))]
    : [];

  const initialMeta: MetaState = normaliseMeta(saved.meta, saved.lastSeenAt ?? saved.time, now);
  const safeLastSeen = initialMeta.lastSeenAt;

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
      seeds: runSeeds,
      totalSeeds: totalRunSeeds,
      ascensionSeeds,
      totalAscensionSeeds,
      ascensionSpent,
      ascensionOwned: saved.prestige?.ascensionOwned ?? [],
      permanentSlots: saved.prestige?.permanentSlots ?? 0,
      permanentUpgradeIds: saved.prestige?.permanentUpgradeIds ?? [],
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
  applyAscensionEffects(state);
  reapplyAbilityEffects(state);

  applyOfflineProgress(state, now);
  state.prestige.mult = computePrestigeMultiplier(state.prestige.totalAscensionSeeds);

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

  const nextState = initState(normalised);
  const timestamp = Date.now();
  prepareStateForPersist(nextState, timestamp);
  const payload = createPersistedPayload(nextState, timestamp);
  writePersistedState(payload, stringifyPersistedState);
  return nextState;
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
