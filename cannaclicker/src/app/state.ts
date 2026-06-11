import Decimal from 'break_infinity.js';
import { DEFAULT_LOCALE, type LocaleKey } from './i18n';
import { createDefaultSettings, type SettingsState } from './settings';
import { OFFLINE_CAP_MS } from './balance';
import type { MilestoneProgressSnapshot } from './milestones';
import { ABILITIES, type AbilityId } from '../data/abilities';
import type { AchievementId } from '../data/achievements';
import type { ItemId } from '../data/items';
import type { MilestoneId } from '../data/milestones';
import type { ResearchId } from '../data/research';
import type { UpgradeId } from '../data/upgrades';
import type { GoalId } from '../data/goals';
import type { AscensionNodeId } from '../data/ascension';
import type { RoomId } from '../data/rooms';
import type { StrainId } from '../data/strains';
import type { ContractId } from '../data/contracts';
import type { SeasonId } from '../data/seasons';
import type { EventId } from './events';
import type { ChallengeId } from '../data/challenges';
import type { CollectionId } from '../data/collections';
import type { SeedSynergyId } from './seeds';
import {
  createDefaultEventState,
  createDefaultEventStats,
  type EventRuntimeState,
  type EventStats,
} from './events';
export type { AbilityId } from '../data/abilities';

export const SAVE_VERSION = 9 as const;

export type SeedGainSource = 'event' | 'click' | 'synergy' | 'passive';

export interface SeedGainEntry {
  time: number;
  amount: number;
  source: SeedGainSource;
}

export interface SeedPassiveConfig {
  intervalMs: number;
  chance: number;
  seeds: number;
}

export type SeedNotification =
  | { type: 'synergy'; id: SeedSynergyId; seeds: number }
  | { type: 'passive'; seeds: number };

export type DecimalLike = Decimal | number | string | null | undefined;

export interface AphidRuntimeState {
  active: boolean;
  hitsRemaining: number;
  totalHits: number;
  spawnedAt: number;
  nextRollAt: number;
  xPercent: number;
  yPercent: number;
  lastHitAt: number;
  defeatedAt: number;
}

export interface AbilityRuntimeState {
  active: boolean;
  endsAt: number;
  readyAt: number;
  multiplier: number;
}

export type AbilityState = Record<AbilityId, AbilityRuntimeState>;

export type EventBoostTarget = 'bps' | 'bpc' | 'both' | 'cost';

export interface EventBoostState {
  id: string;
  target: EventBoostTarget;
  multiplier: number;
  startedAt: number;
  endsAt: number;
}

export interface PrestigeState {
  /**
   * Run/research seeds from events, clicks, synergies, and passive systems.
   * These are spendable for Research and do not power the Prestige multiplier.
   */
  seeds: number;
  totalSeeds: number;
  /**
   * Ascension seeds come only from performing Prestige.
   * They drive the Prestige multiplier and the Ascension tree.
   */
  ascensionSeeds: number;
  totalAscensionSeeds: number;
  ascensionSpent: number;
  ascensionOwned: AscensionNodeId[];
  permanentSlots: number;
  permanentUpgradeIds: UpgradeId[];
  mult: Decimal;
  lifetimeBuds: Decimal;
  lastResetAt: number;
  version: number;
  milestones: Partial<Record<MilestoneId, boolean>>;
  kickstart: KickstartState | null;
}

export interface RoomsState {
  levels: Partial<Record<RoomId, number>>;
  lastUpgradedAt: number;
}

export interface StrainsState {
  selected: StrainId | null;
  xp: Partial<Record<StrainId, number>>;
  levels: Partial<Record<StrainId, number>>;
  selections: Partial<Record<StrainId, number>>;
}

export interface ContractRunBuff {
  target: 'bps' | 'bpc' | 'both' | 'events';
  multiplier: number;
  remainingRuns: number;
}

export interface ContractsState {
  tokens: number;
  offers: ContractId[];
  activeId: ContractId | null;
  completed: Partial<Record<ContractId, number>>;
  claimed: Partial<Record<ContractId, boolean>>;
  pendingBuff: ContractRunBuff | null;
  activeBuff: ContractRunBuff | null;
}

export interface SeasonsState {
  active: SeasonId;
  unlocked: SeasonId[];
}

export interface EventMasteryState {
  claimed: Partial<Record<EventId, number>>;
}

export interface CollectionsState {
  owned: CollectionId[];
  score: number;
}

export interface ChallengesState {
  activeId: ChallengeId | null;
  startedAt: number;
  completed: Partial<Record<ChallengeId, boolean>>;
  attempts: Partial<Record<ChallengeId, number>>;
  unlocked: ChallengeId[];
}

export interface KickstartState {
  level: number;
  endsAt: number;
}

export interface TempState {
  bpsMult: Decimal;
  bpcMult: Decimal;
  researchBpsMult: Decimal;
  researchBpcMult: Decimal;
  totalBpsMult: Decimal;
  totalBpcMult: Decimal;
  costMultiplier: Decimal;
  buildingCostMultipliers: Partial<Record<ItemId, Decimal>>;
  autoClickRate: number;
  automationBpsShare: number;
  abilityPowerBonus: number;
  abilityDurationMult: number;
  offlineCapMs: number;
  offlineBuds: Decimal | null;
  offlineDuration: number;
  buildingBaseMultipliers: Partial<Record<ItemId, Decimal>>;
  buildingTierMultipliers: Partial<Record<ItemId, Decimal>>;
  researchBuildingMultipliers: Partial<Record<ItemId, Decimal>>;
  researchCostMult: number;
  eventBpsMult: Decimal;
  eventBpcMult: Decimal;
  eventCostMult: Decimal;
  eventRewardMult: number;
  eventSpawnRateMult: number;
  eventDurationMult: number;
  depthGlobalMult: Decimal;
  depthBpcMult: Decimal;
  depthCostMult: Decimal;
  depthPrestigeSeedMult: number;
  strainXpMult: number;
  challengeDisableEvents: boolean;
  challengeDisablePassiveProduction: boolean;
  challengeDisableAbilities: boolean;
  challengeMaxPerItem: number | null;
  challengeRiskOnlyEvents: boolean;
  eventBoosts: EventBoostState[];
  eventBoostEndsAt: number;
  activeEventBoost: string | null;
  hybridBuffPerBuff: number;
  hybridActiveBuffs: number;
  strainChoice: string | null;
  milestoneGlobalMult: Decimal;
  milestoneBpsMult: Decimal;
  milestoneBpcMult: Decimal;
  milestoneProgress: MilestoneProgressSnapshot[];
  milestoneActiveCount: number;
  nextKickstartLevel: number;
  kickstartBpsMult: Decimal;
  kickstartBpcMult: Decimal;
  kickstartCostMult: Decimal;
  kickstartLevel: number;
  kickstartDurationMs: number;
  kickstartRemainingMs: number;
  kickstartEndsAt: number;
  seedClickBonus: number;
  clickBpsSeconds: number;
  clickComboCount: number;
  clickComboMult: number;
  clickComboExpiresAt: number;
  clickCritChance: number;
  clickCritMult: number;
  lastClickCritical: boolean;
  softcapRelief: number;
  seedPassiveConfig: SeedPassiveConfig | null;
  seedPassiveThrottled: boolean;
  seedPassiveProgress: number;
  seedNotifications: SeedNotification[];
  seedRatePerHour: number;
  seedRateCap: number;
  aphid: AphidRuntimeState;
  aphidBpsMult: Decimal;
  needsRecalc: boolean;
}

export type ShopSortMode = 'price' | 'bps' | 'roi';

export interface PreferencesState {
  shopSortMode: ShopSortMode;
}

export interface MetaState {
  lastSeenAt: number;
  lastBpsAtSave: number;
  seedHistory: SeedGainEntry[];
  seedSynergyClaims: Partial<Record<SeedSynergyId, boolean>>;
  lastInteractionAt: number;
  seedPassiveIdleMs: number;
  seedPassiveRollsDone: number;
  eventStats: EventStats;
  eventRewardBudgetWindowStartedAt: number;
  eventRewardValueThisWindow: number;
  manualClicks: number;
  totalItemsPurchased: number;
  totalUpgradesPurchased: number;
  totalResearchPurchased: number;
  seedsSpent: number;
  prestigeCount: number;
  lastRunBuds: number;
  bestRunBuds: number;
  offlineBudsTotal: number;
  offlineReturns: number;
  abilityUsesTotal: number;
  abilityUses: Partial<Record<AbilityId, number>>;
  completedGoals: GoalId[];
}

export function createDefaultPreferences(): PreferencesState {
  return { shopSortMode: 'price' } satisfies PreferencesState;
}

export interface AutomationManagerState {
  unlockedTier: number;
  autoClick: boolean;
  autoBuyMode: 'off' | 'cheapest' | 'best_roi' | 'next_milestone';
  selectedItemId: ItemId | null;
  abilityMode: 'manual' | 'event_buff' | 'cooldown_chain';
}

export type AutomationState = AutomationManagerState;

export function createDefaultAutomation(): AutomationState {
  return {
    unlockedTier: 0,
    autoClick: false,
    autoBuyMode: 'off',
    selectedItemId: null,
    abilityMode: 'manual',
  };
}

export interface SaveV5 {
  v: typeof SAVE_VERSION;
  buds: Decimal;
  total: Decimal;
  bps: Decimal;
  bpc: Decimal;
  items: Partial<Record<ItemId, number>>;
  upgrades: Partial<Record<UpgradeId, boolean>>;
  achievements: Partial<Record<AchievementId, boolean>>;
  researchOwned: ResearchId[];
  prestige: PrestigeState;
  abilities: AbilityState;
  time: number;
  lastSeenAt: number;
  preferences: PreferencesState;
  automation: AutomationState;
  settings: SettingsState;
  meta: MetaState;
  rooms: RoomsState;
  strains: StrainsState;
  contracts: ContractsState;
  seasons: SeasonsState;
  eventMastery: EventMasteryState;
  collections: CollectionsState;
  challenges: ChallengesState;
}

export interface GameState extends SaveV5 {
  locale: LocaleKey;
  muted: boolean;
  lastTick: number;
  temp: TempState;
  events: EventRuntimeState;
}

export function createDefaultState(partial: Partial<GameState> = {}): GameState {
  const now = Date.now();
  const lastTick = typeof performance !== 'undefined' ? performance.now() : now;
  const defaultAbilities = Object.fromEntries(
    ABILITIES.map((ability) => [
      ability.id,
      { active: false, endsAt: 0, readyAt: now, multiplier: 1 },
    ]),
  ) as AbilityState;

  const defaultPreferences = createDefaultPreferences();
  const defaultAutomation = createDefaultAutomation();
  const defaultSettings = createDefaultSettings();
  const defaultMeta: MetaState = {
    lastSeenAt: now,
    lastBpsAtSave: 0,
    seedHistory: [],
    seedSynergyClaims: {},
    lastInteractionAt: now,
    seedPassiveIdleMs: 0,
    seedPassiveRollsDone: 0,
    eventStats: createDefaultEventStats(now),
    eventRewardBudgetWindowStartedAt: now,
    eventRewardValueThisWindow: 0,
    manualClicks: 0,
    totalItemsPurchased: 0,
    totalUpgradesPurchased: 0,
    totalResearchPurchased: 0,
    seedsSpent: 0,
    prestigeCount: 0,
    lastRunBuds: 0,
    bestRunBuds: 0,
    offlineBudsTotal: 0,
    offlineReturns: 0,
    abilityUsesTotal: 0,
    abilityUses: {},
    completedGoals: [],
  };
  const defaultRooms: RoomsState = { levels: {}, lastUpgradedAt: 0 };
  const defaultStrains: StrainsState = { selected: null, xp: {}, levels: {}, selections: {} };
  const defaultContracts: ContractsState = {
    tokens: 0,
    offers: [],
    activeId: null,
    completed: {},
    claimed: {},
    pendingBuff: null,
    activeBuff: null,
  };
  const defaultSeasons: SeasonsState = { active: 'evergreen', unlocked: ['evergreen'] };
  const defaultEventMastery: EventMasteryState = { claimed: {} };
  const defaultCollections: CollectionsState = { owned: [], score: 0 };
  const defaultChallenges: ChallengesState = {
    activeId: null,
    startedAt: 0,
    completed: {},
    attempts: {},
    unlocked: [],
  };

  return {
    v: SAVE_VERSION,
    buds: new Decimal(0),
    total: new Decimal(0),
    bps: new Decimal(0),
    bpc: new Decimal(1),
    items: {},
    upgrades: {},
    achievements: {},
    researchOwned: [],
    prestige: {
      seeds: 0,
      totalSeeds: 0,
      ascensionSeeds: 0,
      totalAscensionSeeds: 0,
      ascensionSpent: 0,
      ascensionOwned: [],
      permanentSlots: 0,
      permanentUpgradeIds: [],
      mult: new Decimal(1),
      lifetimeBuds: new Decimal(0),
      lastResetAt: now,
      version: 1,
      milestones: {},
      kickstart: null,
    },
    abilities: defaultAbilities,
    time: now,
    lastSeenAt: now,
    preferences: defaultPreferences,
    automation: defaultAutomation,
    settings: defaultSettings,
    meta: defaultMeta,
    rooms: defaultRooms,
    strains: defaultStrains,
    contracts: defaultContracts,
    seasons: defaultSeasons,
    eventMastery: defaultEventMastery,
    collections: defaultCollections,
    challenges: defaultChallenges,
    locale: DEFAULT_LOCALE,
    muted: false,
    lastTick,
    temp: {
      bpsMult: new Decimal(1),
      bpcMult: new Decimal(1),
      researchBpsMult: new Decimal(1),
      researchBpcMult: new Decimal(1),
      totalBpsMult: new Decimal(1),
      totalBpcMult: new Decimal(1),
      costMultiplier: new Decimal(1),
      buildingCostMultipliers: {},
      autoClickRate: 0,
      automationBpsShare: 0,
      abilityPowerBonus: 0,
      abilityDurationMult: 1,
      offlineCapMs: OFFLINE_CAP_MS,
      offlineBuds: null,
      offlineDuration: 0,
      buildingBaseMultipliers: {},
      buildingTierMultipliers: {},
      researchBuildingMultipliers: {},
      researchCostMult: 1,
      eventBpsMult: new Decimal(1),
      eventBpcMult: new Decimal(1),
      eventCostMult: new Decimal(1),
      eventRewardMult: 1,
      eventSpawnRateMult: 1,
      eventDurationMult: 1,
      depthGlobalMult: new Decimal(1),
      depthBpcMult: new Decimal(1),
      depthCostMult: new Decimal(1),
      depthPrestigeSeedMult: 1,
      strainXpMult: 1,
      challengeDisableEvents: false,
      challengeDisablePassiveProduction: false,
      challengeDisableAbilities: false,
      challengeMaxPerItem: null,
      challengeRiskOnlyEvents: false,
      eventBoosts: [],
      eventBoostEndsAt: 0,
      activeEventBoost: null,
      hybridBuffPerBuff: 0,
      hybridActiveBuffs: 0,
      strainChoice: null,
      milestoneGlobalMult: new Decimal(1),
      milestoneBpsMult: new Decimal(1),
      milestoneBpcMult: new Decimal(1),
      milestoneProgress: [],
      milestoneActiveCount: 0,
      nextKickstartLevel: 0,
      kickstartBpsMult: new Decimal(1),
      kickstartBpcMult: new Decimal(1),
      kickstartCostMult: new Decimal(1),
      kickstartLevel: 0,
      kickstartDurationMs: 0,
      kickstartRemainingMs: 0,
      kickstartEndsAt: 0,
      seedClickBonus: 0,
      clickBpsSeconds: 0,
      clickComboCount: 0,
      clickComboMult: 1,
      clickComboExpiresAt: 0,
      clickCritChance: 0,
      clickCritMult: 2,
      lastClickCritical: false,
      softcapRelief: 0,
      seedPassiveConfig: null,
      seedPassiveThrottled: false,
      seedPassiveProgress: 0,
      seedNotifications: [],
      seedRatePerHour: 0,
      seedRateCap: 0,
      aphid: {
        active: false,
        hitsRemaining: 0,
        totalHits: 3,
        spawnedAt: 0,
        nextRollAt: now + 60_000,
        xPercent: 64,
        yPercent: 38,
        lastHitAt: 0,
        defeatedAt: 0,
      },
      aphidBpsMult: new Decimal(1),
      needsRecalc: false,
    },
    events: createDefaultEventState(now),
    ...partial,
  } satisfies GameState;
}

export function ensureDecimal(value: DecimalLike): Decimal {
  if (value instanceof Decimal) {
    return value;
  }

  if (value === null || value === undefined) {
    return new Decimal(0);
  }

  return new Decimal(value);
}
