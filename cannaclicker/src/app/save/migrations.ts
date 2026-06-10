import { createDefaultAutomation, createDefaultPreferences, SAVE_VERSION } from '../state';
import {
  createDefaultSettings,
  isMotionIntensity,
  isPlantSkin,
  isUiTheme,
  normaliseVolume,
  type SettingsState,
} from '../settings';
import { milestones } from '../../data/milestones';
import type { MilestoneId } from '../../data/milestones';
import { RESEARCH, type ResearchId } from '../../data/research';
import { getKickstartConfig } from '../milestones';
import type {
  PersistedAbilityRecord,
  PersistedAbilityState,
  PersistedKickstartState,
  PersistedEventStats,
  PersistedEventStatsPerEvent,
  PersistedMetaState,
  PersistedRoomsState,
  PersistedStrainsState,
  PersistedContractsState,
  PersistedSeasonsState,
  PersistedEventMasteryState,
  PersistedCollectionsState,
  PersistedChallengesState,
  PersistedStateAny,
  PersistedStateV1Legacy,
  PersistedStateV2,
  PersistedStateV3,
  PersistedStateV4,
  PersistedStateV5,
  PersistedStateV6,
  PersistedStateV7,
  RestoredMetaState,
  RestoredSeedGainEntry,
} from './types';
import type {
  AbilityId,
  AutomationState,
  MetaState,
  PreferencesState,
  RoomsState,
  StrainsState,
  ContractsState,
  SeasonsState,
  EventMasteryState,
  CollectionsState,
  ChallengesState,
} from '../state';
import {
  EVENT_IDS,
  createDefaultEventStats,
  type EventStats,
  type EventStatsPerEvent,
} from '../events';
import type { EventCategory, EventId } from '../events';
import { SEED_SYNERGY_IDS, type SeedSynergyId } from '../seeds';
import { ABILITIES } from '../../data/abilities';
import { goals, type GoalId } from '../../data/goals';
import { ascensionNodes, type AscensionNodeId } from '../../data/ascension';
import { upgrades, type UpgradeId } from '../../data/upgrades';
import { roomIds, type RoomId } from '../../data/rooms';
import { strainIds, type StrainId } from '../../data/strains';
import { contracts, type ContractId } from '../../data/contracts';
import { seasons, type SeasonId } from '../../data/seasons';
import { challenges, type ChallengeId } from '../../data/challenges';
import { collections, type CollectionId } from '../../data/collections';

const VALID_MILESTONE_IDS = new Set(milestones.map((milestone) => milestone.id));
const ABILITY_IDS: AbilityId[] = ABILITIES.map((ability) => ability.id);
const VALID_RESEARCH_IDS = new Set<string>(RESEARCH.map((entry) => entry.id));
const VALID_SEED_SYNERGY_IDS = new Set<string>(SEED_SYNERGY_IDS);
const VALID_EVENT_IDS: EventId[] = [...EVENT_IDS];
const EVENT_CATEGORIES: EventCategory[] = ['minor', 'chain', 'risk', 'major', 'seasonal'];
const EVENT_ID_SET = new Set<EventId>(VALID_EVENT_IDS);
const VALID_GOAL_IDS = new Set<string>(goals.map((goal) => goal.id));
const VALID_ASCENSION_IDS = new Set<string>(ascensionNodes.map((node) => node.id));
const VALID_UPGRADE_IDS = new Set<string>(upgrades.map((upgrade) => upgrade.id));
const VALID_ROOM_IDS = new Set<string>(roomIds);
const VALID_STRAIN_IDS = new Set<string>(strainIds);
const VALID_CONTRACT_IDS = new Set<string>(contracts.map((contract) => contract.id));
const VALID_SEASON_IDS = new Set<string>(seasons.map((season) => season.id));
const VALID_CHALLENGE_IDS = new Set<string>(challenges.map((challenge) => challenge.id));
const VALID_COLLECTION_IDS = new Set<string>(collections.map((entry) => entry.id));

function isSeedSynergyId(value: unknown): value is SeedSynergyId {
  return typeof value === 'string' && VALID_SEED_SYNERGY_IDS.has(value);
}

function isEventId(value: unknown): value is EventId {
  return typeof value === 'string' && EVENT_ID_SET.has(value as EventId);
}

function isResearchId(value: unknown): value is ResearchId {
  return typeof value === 'string' && VALID_RESEARCH_IDS.has(value);
}

function isGoalId(value: unknown): value is GoalId {
  return typeof value === 'string' && VALID_GOAL_IDS.has(value);
}

function isAscensionNodeId(value: unknown): value is AscensionNodeId {
  return typeof value === 'string' && VALID_ASCENSION_IDS.has(value);
}

function isUpgradeId(value: unknown): value is UpgradeId {
  return typeof value === 'string' && VALID_UPGRADE_IDS.has(value);
}

function isRoomId(value: unknown): value is RoomId {
  return typeof value === 'string' && VALID_ROOM_IDS.has(value);
}

function isStrainId(value: unknown): value is StrainId {
  return typeof value === 'string' && VALID_STRAIN_IDS.has(value);
}

function isContractId(value: unknown): value is ContractId {
  return typeof value === 'string' && VALID_CONTRACT_IDS.has(value);
}

function isSeasonId(value: unknown): value is SeasonId {
  return typeof value === 'string' && VALID_SEASON_IDS.has(value);
}

function isChallengeId(value: unknown): value is ChallengeId {
  return typeof value === 'string' && VALID_CHALLENGE_IDS.has(value);
}

function isCollectionId(value: unknown): value is CollectionId {
  return typeof value === 'string' && VALID_COLLECTION_IDS.has(value);
}

export function normalisePersistedState(
  data:
    | PersistedStateV2
    | PersistedStateV3
    | PersistedStateV4
    | PersistedStateV5
    | PersistedStateV6
    | PersistedStateV7,
): PersistedStateV7 {
  const now = Date.now();
  const prestige = data.prestige ?? {};
  const legacyData = data as Partial<{
    lastSeenAt: unknown;
    time: unknown;
    researchOwned: unknown;
    abilities: Record<string, PersistedAbilityState>;
    rooms: PersistedRoomsState;
    strains: PersistedStrainsState;
    contracts: PersistedContractsState;
    seasons: PersistedSeasonsState;
    eventMastery: PersistedEventMasteryState;
    collections: PersistedCollectionsState;
    challenges: PersistedChallengesState;
  }>;
  const preferences = normalisePreferences(
    (
      data as
        | PersistedStateV3
        | PersistedStateV4
        | PersistedStateV5
        | PersistedStateV6
        | PersistedStateV7
    ).preferences,
  );
  const automation = normaliseAutomation(
    (
      data as
        | PersistedStateV3
        | PersistedStateV4
        | PersistedStateV5
        | PersistedStateV6
        | PersistedStateV7
    ).automation,
  );
  const settings = normaliseSettings(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).settings,
  );
  const legacyLastSeen =
    typeof legacyData.lastSeenAt === 'number' ? legacyData.lastSeenAt : undefined;
  const legacyTime = typeof legacyData.time === 'number' ? legacyData.time : undefined;
  const meta = normaliseMeta(
    (data as PersistedStateV4 | PersistedStateV5 | PersistedStateV6 | PersistedStateV7).meta,
    legacyLastSeen,
    now,
  );
  const milestones = normaliseMilestoneFlags(prestige.milestones);
  const kickstart = normalisePersistedKickstart(prestige.kickstart, now);
  const ascensionOwned = Array.isArray(prestige.ascensionOwned)
    ? [...new Set(prestige.ascensionOwned.filter(isAscensionNodeId))]
    : [];
  const permanentUpgradeIds = Array.isArray(prestige.permanentUpgradeIds)
    ? [...new Set(prestige.permanentUpgradeIds.filter(isUpgradeId))]
    : [];
  const legacyPrestigePower =
    (data.v ?? 0) < SAVE_VERSION && meta.prestigeCount > 0
      ? toPositiveInteger(prestige.totalSeeds, 0)
      : 0;
  const rawResearch = legacyData.researchOwned;
  const researchOwned = Array.isArray(rawResearch)
    ? [...new Set(rawResearch.filter(isResearchId))]
    : [];
  const abilities = legacyData.abilities;

  return {
    v: SAVE_VERSION,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned,
    prestige: {
      seeds: toPositiveInteger(prestige.seeds, 0),
      totalSeeds: Math.max(
        toPositiveInteger(prestige.totalSeeds, 0),
        toPositiveInteger(prestige.seeds, 0),
      ),
      ascensionSeeds: toPositiveInteger(prestige.ascensionSeeds, 0),
      totalAscensionSeeds: Math.max(
        legacyPrestigePower,
        toPositiveInteger(prestige.totalAscensionSeeds, 0),
        toPositiveInteger(prestige.ascensionSeeds, 0) +
          toPositiveInteger(prestige.ascensionSpent, 0),
      ),
      ascensionSpent: toPositiveInteger(prestige.ascensionSpent, 0),
      ascensionOwned,
      permanentSlots: toPositiveInteger(prestige.permanentSlots, 0),
      permanentUpgradeIds,
      mult: prestige.mult ?? '1',
      lifetimeBuds: prestige.lifetimeBuds ?? data.total ?? '0',
      lastResetAt: prestige.lastResetAt ?? legacyLastSeen ?? legacyTime ?? now,
      version: Number.isFinite(prestige.version) ? Number(prestige.version) : 1,
      milestones,
      kickstart,
    },
    abilities: normalisePersistedAbilities(abilities),
    time: legacyTime ?? now,
    lastSeenAt: meta.lastSeenAt,
    locale: data.locale,
    muted: data.muted,
    preferences,
    automation,
    settings,
    meta,
    rooms: normaliseRooms(legacyData.rooms),
    strains: normaliseStrains(legacyData.strains),
    contracts: normaliseContracts(legacyData.contracts),
    seasons: normaliseSeasons(legacyData.seasons),
    eventMastery: normaliseEventMastery(legacyData.eventMastery),
    collections: normaliseCollections(legacyData.collections),
    challenges: normaliseChallenges(legacyData.challenges),
  } satisfies PersistedStateV7;
}

export function normalisePersistedAbilities(
  abilities?: Record<string, PersistedAbilityState>,
): PersistedAbilityRecord {
  const now = Date.now();
  const normalised = Object.fromEntries(
    ABILITY_IDS.map((id) => [id, {}]),
  ) as PersistedAbilityRecord;

  for (const id of ABILITY_IDS) {
    const legacyKey = id === 'burst' ? 'burst_click' : id;
    const entry = abilities?.[id] ?? abilities?.[legacyKey] ?? {};
    normalised[id] = {
      active: entry.active ?? false,
      endsAt: entry.endsAt ?? now,
      readyAt: entry.readyAt ?? now,
    };
  }

  return normalised;
}

export function normaliseSettings(settings?: Partial<SettingsState>): SettingsState {
  const defaults = createDefaultSettings();
  if (!settings) {
    return defaults;
  }

  return {
    showOfflineEarnings:
      typeof settings.showOfflineEarnings === 'boolean'
        ? settings.showOfflineEarnings
        : defaults.showOfflineEarnings,
    motionIntensity:
      typeof settings.motionIntensity === 'string' && isMotionIntensity(settings.motionIntensity)
        ? settings.motionIntensity
        : defaults.motionIntensity,
    uiTheme:
      typeof settings.uiTheme === 'string' && isUiTheme(settings.uiTheme)
        ? settings.uiTheme
        : defaults.uiTheme,
    plantSkin:
      typeof settings.plantSkin === 'string' && isPlantSkin(settings.plantSkin)
        ? settings.plantSkin
        : defaults.plantSkin,
    sfxVolume: normaliseVolume(settings.sfxVolume, defaults.sfxVolume),
    musicEnabled:
      typeof settings.musicEnabled === 'boolean' ? settings.musicEnabled : defaults.musicEnabled,
    musicVolume: normaliseVolume(settings.musicVolume, defaults.musicVolume),
  } satisfies SettingsState;
}

export function normaliseMilestoneFlags(
  flags?: Partial<Record<MilestoneId, boolean>>,
): Partial<Record<MilestoneId, boolean>> {
  const result: Partial<Record<MilestoneId, boolean>> = {};
  if (!flags) {
    return result;
  }

  for (const id of VALID_MILESTONE_IDS) {
    if (flags[id]) {
      result[id] = true;
    }
  }

  return result;
}

export function normalisePersistedKickstart(
  kickstart: PersistedKickstartState | null | undefined,
  now: number,
): PersistedKickstartState | null {
  if (!kickstart) {
    return null;
  }

  const level = Number.isFinite(kickstart.level) ? Math.max(1, Math.floor(kickstart.level!)) : NaN;
  const config = getKickstartConfig(level);
  if (!config) {
    return null;
  }

  const endsAt = Number.isFinite(kickstart.endsAt) ? Math.max(0, Math.floor(kickstart.endsAt!)) : 0;
  if (endsAt <= now) {
    return null;
  }

  return { level: config.level, endsAt } satisfies PersistedKickstartState;
}

function toPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function toRate(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}

function toTimestamp(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function createDefaultPerEventStats(): EventStatsPerEvent {
  return {
    spawns: 0,
    clicks: 0,
    expired: 0,
    pityActivations: 0,
    clickRate: 0,
    lastSpawnAt: 0,
    lastClickAt: 0,
  } satisfies EventStatsPerEvent;
}

function normaliseEventStats(
  stats: PersistedEventStats | undefined,
  fallbackLastSeen: number,
  now: number,
): EventStats {
  const defaults = createDefaultEventStats(now);
  if (!stats) {
    return defaults;
  }

  const safe: EventStats = {
    totalSpawns: toPositiveInteger(stats.totalSpawns, defaults.totalSpawns),
    totalClicks: toPositiveInteger(stats.totalClicks, defaults.totalClicks),
    totalExpired: toPositiveInteger(stats.totalExpired, defaults.totalExpired),
    pityActivations: toPositiveInteger(stats.pityActivations, defaults.pityActivations),
    pityTimerMs: toPositiveInteger(stats.pityTimerMs, defaults.pityTimerMs),
    pityByCategory: {},
    clickRate: toRate(stats.clickRate, defaults.clickRate),
    lastSpawnAt: toTimestamp(stats.lastSpawnAt, fallbackLastSeen ?? defaults.lastSpawnAt),
    lastClickAt: toTimestamp(stats.lastClickAt, defaults.lastClickAt),
    perEvent: {},
  } satisfies EventStats;

  for (const category of EVENT_CATEGORIES) {
    safe.pityByCategory[category] = toPositiveInteger(
      stats.pityByCategory?.[category],
      defaults.pityByCategory[category] ?? 0,
    );
  }

  if (stats.perEvent) {
    for (const [key, value] of Object.entries(stats.perEvent)) {
      if (!isEventId(key) || !value) {
        continue;
      }
      const entry = value as PersistedEventStatsPerEvent;
      const defaultsPer = createDefaultPerEventStats();
      const per: EventStatsPerEvent = {
        spawns: toPositiveInteger(entry.spawns, defaultsPer.spawns),
        clicks: toPositiveInteger(entry.clicks, defaultsPer.clicks),
        expired: toPositiveInteger(entry.expired, defaultsPer.expired),
        pityActivations: toPositiveInteger(entry.pityActivations, defaultsPer.pityActivations),
        clickRate: toRate(entry.clickRate, defaultsPer.clickRate),
        lastSpawnAt: toTimestamp(entry.lastSpawnAt, defaultsPer.lastSpawnAt),
        lastClickAt: toTimestamp(entry.lastClickAt, defaultsPer.lastClickAt),
      } satisfies EventStatsPerEvent;
      safe.perEvent[key] = per;
    }
  }

  return safe;
}

export function normaliseMeta(
  meta: PersistedMetaState | undefined,
  fallbackLastSeen: number | undefined,
  now: number,
): RestoredMetaState {
  const lastSeen = Number.isFinite(meta?.lastSeenAt)
    ? Number(meta!.lastSeenAt)
    : (fallbackLastSeen ?? now);
  const safeLastSeen = lastSeen > 0 ? Math.floor(lastSeen) : now;
  const lastBps = Number.isFinite(meta?.lastBpsAtSave) ? Number(meta!.lastBpsAtSave) : 0;

  const rawHistory = Array.isArray(meta?.seedHistory) ? meta!.seedHistory : [];
  const history: RestoredSeedGainEntry[] = rawHistory
    .map((entry) => {
      const time = Number.isFinite(entry?.time) ? Math.floor(entry!.time!) : 0;
      const amount = Number.isFinite(entry?.amount) ? Math.floor(entry!.amount!) : 0;
      const source = entry?.source;
      if (time <= 0 || amount <= 0) {
        return null;
      }
      const safeSource =
        source === 'event' || source === 'click' || source === 'synergy' || source === 'passive'
          ? source
          : 'event';
      return { time, amount, source: safeSource } satisfies RestoredSeedGainEntry;
    })
    .filter((entry): entry is RestoredSeedGainEntry => !!entry);

  const trimmedHistory = history.slice(-200);

  const synergyClaims: Partial<Record<SeedSynergyId, boolean>> = {};
  if (meta?.seedSynergyClaims) {
    for (const [key, value] of Object.entries(meta.seedSynergyClaims)) {
      if (typeof value === 'boolean' && isSeedSynergyId(key)) {
        synergyClaims[key] = value;
      }
    }
  }

  const lastInteraction = Number.isFinite(meta?.lastInteractionAt)
    ? Math.max(0, Math.floor(meta!.lastInteractionAt!))
    : safeLastSeen;
  const idleMs = Number.isFinite(meta?.seedPassiveIdleMs)
    ? Math.max(0, Math.floor(meta!.seedPassiveIdleMs!))
    : 0;
  const rollsDone = Number.isFinite(meta?.seedPassiveRollsDone)
    ? Math.max(0, Math.floor(meta!.seedPassiveRollsDone!))
    : 0;
  const eventStats = normaliseEventStats(meta?.eventStats, safeLastSeen, now);
  const abilityUses: Partial<Record<AbilityId, number>> = {};
  if (meta?.abilityUses) {
    for (const id of ABILITY_IDS) {
      const value = meta.abilityUses[id];
      if (Number.isFinite(value)) {
        abilityUses[id] = Math.max(0, Math.floor(value!));
      }
    }
  }
  const completedGoals = Array.isArray(meta?.completedGoals)
    ? [...new Set(meta.completedGoals.filter(isGoalId))]
    : [];

  return {
    lastSeenAt: safeLastSeen,
    lastBpsAtSave: lastBps >= 0 ? lastBps : 0,
    seedHistory: trimmedHistory,
    seedSynergyClaims: synergyClaims,
    lastInteractionAt: lastInteraction,
    seedPassiveIdleMs: idleMs,
    seedPassiveRollsDone: rollsDone,
    eventStats,
    eventRewardBudgetWindowStartedAt: toTimestamp(
      meta?.eventRewardBudgetWindowStartedAt,
      safeLastSeen,
    ),
    eventRewardValueThisWindow:
      typeof meta?.eventRewardValueThisWindow === 'number' &&
      Number.isFinite(meta.eventRewardValueThisWindow)
        ? Math.max(0, meta.eventRewardValueThisWindow)
        : 0,
    manualClicks: toPositiveInteger(meta?.manualClicks, 0),
    totalItemsPurchased: toPositiveInteger(meta?.totalItemsPurchased, 0),
    totalUpgradesPurchased: toPositiveInteger(meta?.totalUpgradesPurchased, 0),
    totalResearchPurchased: toPositiveInteger(meta?.totalResearchPurchased, 0),
    seedsSpent: toPositiveInteger(meta?.seedsSpent, 0),
    prestigeCount: toPositiveInteger(meta?.prestigeCount, 0),
    lastRunBuds: toPositiveInteger(meta?.lastRunBuds, 0),
    bestRunBuds: toPositiveInteger(meta?.bestRunBuds, 0),
    offlineBudsTotal: toPositiveInteger(meta?.offlineBudsTotal, 0),
    offlineReturns: toPositiveInteger(meta?.offlineReturns, 0),
    abilityUsesTotal: toPositiveInteger(meta?.abilityUsesTotal, 0),
    abilityUses,
    completedGoals,
  } satisfies MetaState;
}

export function normalisePreferences(preferences?: Partial<PreferencesState>): PreferencesState {
  const defaults = createDefaultPreferences();
  const mode = preferences?.shopSortMode;
  if (mode === 'price' || mode === 'bps' || mode === 'roi') {
    return { shopSortMode: mode } satisfies PreferencesState;
  }
  return defaults;
}

export function normaliseAutomation(automation?: Partial<AutomationState>): AutomationState {
  const defaults = createDefaultAutomation();
  if (!automation) {
    return defaults;
  }
  const autoBuyMode =
    automation.autoBuyMode === 'cheapest' ||
    automation.autoBuyMode === 'best_roi' ||
    automation.autoBuyMode === 'next_milestone'
      ? automation.autoBuyMode
      : 'off';
  const abilityMode =
    automation.abilityMode === 'event_buff' || automation.abilityMode === 'cooldown_chain'
      ? automation.abilityMode
      : 'manual';
  return {
    unlockedTier: toPositiveInteger(automation.unlockedTier, defaults.unlockedTier),
    autoClick: typeof automation.autoClick === 'boolean' ? automation.autoClick : defaults.autoClick,
    autoBuyMode,
    selectedItemId: typeof automation.selectedItemId === 'string' ? automation.selectedItemId : null,
    abilityMode,
  } satisfies AutomationState;
}

export function normaliseRooms(roomsState?: PersistedRoomsState): RoomsState {
  const levels: Partial<Record<RoomId, number>> = {};
  if (roomsState?.levels) {
    for (const [key, value] of Object.entries(roomsState.levels)) {
      if (isRoomId(key)) {
        levels[key] = Math.max(0, Math.min(5, toPositiveInteger(value, 0)));
      }
    }
  }
  return {
    levels,
    lastUpgradedAt: toTimestamp(roomsState?.lastUpgradedAt, 0),
  };
}

export function normaliseStrains(strainsState?: PersistedStrainsState): StrainsState {
  const xp: Partial<Record<StrainId, number>> = {};
  const levels: Partial<Record<StrainId, number>> = {};
  const selections: Partial<Record<StrainId, number>> = {};
  if (strainsState?.xp) {
    for (const [key, value] of Object.entries(strainsState.xp)) {
      if (isStrainId(key)) xp[key] = toPositiveInteger(value, 0);
    }
  }
  if (strainsState?.levels) {
    for (const [key, value] of Object.entries(strainsState.levels)) {
      if (isStrainId(key)) levels[key] = Math.max(1, Math.min(3, toPositiveInteger(value, 1)));
    }
  }
  if (strainsState?.selections) {
    for (const [key, value] of Object.entries(strainsState.selections)) {
      if (isStrainId(key)) selections[key] = toPositiveInteger(value, 0);
    }
  }
  return {
    selected: isStrainId(strainsState?.selected) ? strainsState!.selected! : null,
    xp,
    levels,
    selections,
  };
}

export function normaliseContracts(contractsState?: PersistedContractsState): ContractsState {
  const completed: Partial<Record<ContractId, number>> = {};
  const claimed: Partial<Record<ContractId, boolean>> = {};
  if (contractsState?.completed) {
    for (const [key, value] of Object.entries(contractsState.completed)) {
      if (isContractId(key)) completed[key] = toPositiveInteger(value, 0);
    }
  }
  if (contractsState?.claimed) {
    for (const [key, value] of Object.entries(contractsState.claimed)) {
      if (isContractId(key) && typeof value === 'boolean') claimed[key] = value;
    }
  }
  return {
    tokens: toPositiveInteger(contractsState?.tokens, 0),
    offers: Array.isArray(contractsState?.offers)
      ? [...new Set(contractsState.offers.filter(isContractId))].slice(0, 3)
      : [],
    activeId: isContractId(contractsState?.activeId) ? contractsState!.activeId! : null,
    completed,
    claimed,
    pendingBuff: normaliseContractBuff(contractsState?.pendingBuff),
    activeBuff: normaliseContractBuff(contractsState?.activeBuff),
  };
}

function normaliseContractBuff(
  buff: PersistedContractsState['pendingBuff'] | undefined,
): ContractsState['pendingBuff'] {
  if (!buff) return null;
  const target =
    buff.target === 'bps' || buff.target === 'bpc' || buff.target === 'both' || buff.target === 'events'
      ? buff.target
      : 'both';
  const multiplier =
    typeof buff.multiplier === 'number' && Number.isFinite(buff.multiplier)
      ? Math.max(1, Math.min(1.5, buff.multiplier))
      : 1;
  const remainingRuns = toPositiveInteger(buff.remainingRuns, 1);
  return { target, multiplier, remainingRuns };
}

export function normaliseSeasons(seasonsState?: PersistedSeasonsState): SeasonsState {
  const unlocked = Array.isArray(seasonsState?.unlocked)
    ? [...new Set(seasonsState.unlocked.filter(isSeasonId))]
    : [];
  if (!unlocked.includes('evergreen')) unlocked.unshift('evergreen');
  const active = isSeasonId(seasonsState?.active) && unlocked.includes(seasonsState!.active!)
    ? seasonsState!.active!
    : 'evergreen';
  return { active, unlocked };
}

export function normaliseEventMastery(
  eventMastery?: PersistedEventMasteryState,
): EventMasteryState {
  const claimed: Partial<Record<EventId, number>> = {};
  if (eventMastery?.claimed) {
    for (const [key, value] of Object.entries(eventMastery.claimed)) {
      if (isEventId(key)) claimed[key] = Math.max(0, Math.min(3, toPositiveInteger(value, 0)));
    }
  }
  return { claimed };
}

export function normaliseCollections(collectionsState?: PersistedCollectionsState): CollectionsState {
  const owned = Array.isArray(collectionsState?.owned)
    ? [...new Set(collectionsState.owned.filter(isCollectionId))]
    : [];
  return {
    owned,
    score: toPositiveInteger(collectionsState?.score, 0),
  };
}

export function normaliseChallenges(challengesState?: PersistedChallengesState): ChallengesState {
  const completed: Partial<Record<ChallengeId, boolean>> = {};
  const attempts: Partial<Record<ChallengeId, number>> = {};
  if (challengesState?.completed) {
    for (const [key, value] of Object.entries(challengesState.completed)) {
      if (isChallengeId(key) && typeof value === 'boolean') completed[key] = value;
    }
  }
  if (challengesState?.attempts) {
    for (const [key, value] of Object.entries(challengesState.attempts)) {
      if (isChallengeId(key)) attempts[key] = toPositiveInteger(value, 0);
    }
  }
  return {
    activeId: isChallengeId(challengesState?.activeId) ? challengesState!.activeId! : null,
    startedAt: toTimestamp(challengesState?.startedAt, 0),
    completed,
    attempts,
    unlocked: Array.isArray(challengesState?.unlocked)
      ? [...new Set(challengesState.unlocked.filter(isChallengeId))]
      : [],
  };
}

export function upgradeFromLegacy(data: PersistedStateV1Legacy): PersistedStateV7 {
  const now = Date.now();
  return normalisePersistedState({
    v: 2,
    buds: data.buds ?? '0',
    total: data.total ?? '0',
    bps: data.bps ?? '0',
    bpc: data.bpc ?? '1',
    items: data.items ?? {},
    upgrades: data.upgrades ?? {},
    achievements: data.achievements ?? {},
    researchOwned: [],
    prestige: {
      seeds: 0,
      mult: '1',
      lifetimeBuds: data.total ?? '0',
      lastResetAt: data.time ?? now,
      milestones: {},
      kickstart: null,
    },
    abilities: normalisePersistedAbilities(),
    lastSeenAt: data.time ?? now,
    locale: data.locale,
    muted: data.muted,
  } satisfies PersistedStateV2);
}

export function upgradePersistedState(data: PersistedStateAny): PersistedStateV7 | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if ('v' in data) {
    switch ((data as { v?: number }).v) {
      case 1:
        return upgradeFromLegacy(data as PersistedStateV1Legacy);
      case 2:
        return normalisePersistedState(data as PersistedStateV2);
      case 3:
        return normalisePersistedState(data as PersistedStateV3);
      case 4:
        return normalisePersistedState(data as PersistedStateV4);
      case 5:
        return normalisePersistedState(data as PersistedStateV5);
      case 6:
        return normalisePersistedState(data as PersistedStateV6);
      case 7:
      case 8:
      case SAVE_VERSION:
        return normalisePersistedState(data as PersistedStateV7);
      default:
        return null;
    }
  }

  return null;
}
