import { SAVE_VERSION } from '../state';
import type {
  AbilityId,
  AbilityRuntimeState,
  AbilityState,
  AutomationState,
  KickstartState,
  MetaState,
  PreferencesState,
  RoomsState,
  StrainsState,
  ContractsState,
  SeasonsState,
  EventMasteryState,
  CollectionsState,
  ChallengesState,
  SeedGainEntry,
} from '../state';
import type { EventCategory, EventId } from '../events';
import type { SeedSynergyId } from '../seeds';
import type { AchievementId } from '../../data/achievements';
import type { ItemId } from '../../data/items';
import type { MilestoneId } from '../../data/milestones';
import type { ResearchId } from '../../data/research';
import type { UpgradeId } from '../../data/upgrades';
import type { LocaleKey } from '../i18n';
import type { SettingsState } from '../settings';
import type { GoalId } from '../../data/goals';
import type { AscensionNodeId } from '../../data/ascension';
import type { RoomId } from '../../data/rooms';
import type { StrainId } from '../../data/strains';
import type { ContractId } from '../../data/contracts';
import type { SeasonId } from '../../data/seasons';
import type { ChallengeId } from '../../data/challenges';
import type { CollectionId } from '../../data/collections';

export interface PersistedAbilityState {
  active?: boolean;
  endsAt?: number;
  readyAt?: number;
}

export interface PersistedKickstartState {
  level?: number;
  endsAt?: number;
}

export interface PersistedPrestigeState {
  seeds?: number;
  totalSeeds?: number;
  ascensionSeeds?: number;
  totalAscensionSeeds?: number;
  ascensionSpent?: number;
  ascensionOwned?: AscensionNodeId[];
  permanentSlots?: number;
  permanentUpgradeIds?: UpgradeId[];
  mult?: string;
  lifetimeBuds?: string;
  lastResetAt?: number;
  version?: number;
  milestones?: Partial<Record<MilestoneId, boolean>>;
  kickstart?: PersistedKickstartState | null;
}

export interface PersistedSeedEntry {
  time?: number;
  amount?: number;
  source?: string;
}

export interface PersistedMetaState {
  lastSeenAt?: number;
  lastBpsAtSave?: number;
  seedHistory?: PersistedSeedEntry[];
  seedSynergyClaims?: Partial<Record<SeedSynergyId, boolean>>;
  lastInteractionAt?: number;
  seedPassiveIdleMs?: number;
  seedPassiveRollsDone?: number;
  eventStats?: PersistedEventStats;
  eventRewardBudgetWindowStartedAt?: number;
  eventRewardValueThisWindow?: number;
  manualClicks?: number;
  totalItemsPurchased?: number;
  totalUpgradesPurchased?: number;
  totalResearchPurchased?: number;
  seedsSpent?: number;
  prestigeCount?: number;
  lastRunBuds?: number;
  bestRunBuds?: number;
  offlineBudsTotal?: number;
  offlineReturns?: number;
  abilityUsesTotal?: number;
  abilityUses?: Partial<Record<AbilityId, number>>;
  completedGoals?: GoalId[];
}

export interface PersistedEventStatsPerEvent {
  spawns?: number;
  clicks?: number;
  expired?: number;
  pityActivations?: number;
  clickRate?: number;
  lastSpawnAt?: number;
  lastClickAt?: number;
}

export interface PersistedEventStats {
  totalSpawns?: number;
  totalClicks?: number;
  totalExpired?: number;
  pityActivations?: number;
  pityTimerMs?: number;
  pityByCategory?: Partial<Record<EventCategory, number>>;
  clickRate?: number;
  lastSpawnAt?: number;
  lastClickAt?: number;
  perEvent?: Partial<Record<EventId, PersistedEventStatsPerEvent>>;
}

export interface PersistedRoomsState {
  levels?: Partial<Record<RoomId, number>>;
  lastUpgradedAt?: number;
}

export interface PersistedStrainsState {
  selected?: StrainId | null;
  xp?: Partial<Record<StrainId, number>>;
  levels?: Partial<Record<StrainId, number>>;
  selections?: Partial<Record<StrainId, number>>;
}

export interface PersistedContractRunBuff {
  target?: 'bps' | 'bpc' | 'both' | 'events';
  multiplier?: number;
  remainingRuns?: number;
}

export interface PersistedContractsState {
  tokens?: number;
  offers?: ContractId[];
  activeId?: ContractId | null;
  completed?: Partial<Record<ContractId, number>>;
  claimed?: Partial<Record<ContractId, boolean>>;
  pendingBuff?: PersistedContractRunBuff | null;
  activeBuff?: PersistedContractRunBuff | null;
}

export interface PersistedSeasonsState {
  active?: SeasonId;
  unlocked?: SeasonId[];
}

export interface PersistedEventMasteryState {
  claimed?: Partial<Record<EventId, number>>;
}

export interface PersistedCollectionsState {
  owned?: CollectionId[];
  score?: number;
}

export interface PersistedChallengesState {
  activeId?: ChallengeId | null;
  startedAt?: number;
  completed?: Partial<Record<ChallengeId, boolean>>;
  attempts?: Partial<Record<ChallengeId, number>>;
  unlocked?: ChallengeId[];
}

export interface PersistedStateV1Legacy {
  v: 1;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Partial<Record<ItemId, number>>;
  upgrades?: Partial<Record<UpgradeId, boolean>>;
  achievements?: Partial<Record<AchievementId, boolean>>;
  time?: number;
  locale?: LocaleKey;
  muted?: boolean;
}

export interface PersistedStateV2 {
  v: 2;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  researchOwned: ResearchId[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  lastSeenAt: number;
  items?: Partial<Record<ItemId, number>>;
  upgrades?: Partial<Record<UpgradeId, boolean>>;
  achievements?: Partial<Record<AchievementId, boolean>>;
  locale?: LocaleKey;
  muted?: boolean;
}

export interface PersistedStateV3 {
  v: 3;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Partial<Record<ItemId, number>>;
  upgrades?: Partial<Record<UpgradeId, boolean>>;
  achievements?: Partial<Record<AchievementId, boolean>>;
  researchOwned?: ResearchId[];
  prestige: PersistedPrestigeState;
  abilities?: Record<AbilityId, PersistedAbilityState>;
  time?: number;
  lastSeenAt?: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
}

export interface PersistedStateV4 {
  v: 4;
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items?: Partial<Record<ItemId, number>>;
  upgrades?: Partial<Record<UpgradeId, boolean>>;
  achievements?: Partial<Record<AchievementId, boolean>>;
  researchOwned: ResearchId[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  time?: number;
  lastSeenAt?: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
  settings?: Partial<SettingsState>;
  meta?: PersistedMetaState;
}

interface PersistedStateBase {
  buds: string;
  total: string;
  bps: string;
  bpc: string;
  items: Partial<Record<ItemId, number>>;
  upgrades: Partial<Record<UpgradeId, boolean>>;
  achievements: Partial<Record<AchievementId, boolean>>;
  researchOwned: ResearchId[];
  prestige: PersistedPrestigeState;
  abilities: Record<AbilityId, PersistedAbilityState>;
  time: number;
  lastSeenAt: number;
  locale?: LocaleKey;
  muted?: boolean;
  preferences?: Partial<PreferencesState>;
  automation?: Partial<AutomationState>;
  settings: SettingsState;
  meta: PersistedMetaState;
  rooms?: PersistedRoomsState;
  strains?: PersistedStrainsState;
  contracts?: PersistedContractsState;
  seasons?: PersistedSeasonsState;
  eventMastery?: PersistedEventMasteryState;
  collections?: PersistedCollectionsState;
  challenges?: PersistedChallengesState;
}

export interface PersistedStateV5 extends PersistedStateBase {
  v: 5;
}

export interface PersistedStateV6 extends PersistedStateBase {
  v: 6;
}

export interface PersistedStateV7 extends PersistedStateBase {
  v: typeof SAVE_VERSION;
}

export type PersistedStateAny =
  | PersistedStateV7
  | PersistedStateV6
  | PersistedStateV5
  | PersistedStateV4
  | PersistedStateV3
  | PersistedStateV2
  | PersistedStateV1Legacy;

export type PersistedAbilityRecord = Record<AbilityId, PersistedAbilityState>;

export type RestoredAbilityState = AbilityState;
export type RestoredAbilityRuntimeState = AbilityRuntimeState;
export type RestoredKickstartState = KickstartState | null;
export type RestoredMetaState = MetaState;
export type RestoredRoomsState = RoomsState;
export type RestoredStrainsState = StrainsState;
export type RestoredContractsState = ContractsState;
export type RestoredSeasonsState = SeasonsState;
export type RestoredEventMasteryState = EventMasteryState;
export type RestoredCollectionsState = CollectionsState;
export type RestoredChallengesState = ChallengesState;
export type RestoredSeedGainEntry = SeedGainEntry;
