import { SAVE_VERSION } from '../state';
import type {
  AbilityId,
  AbilityRuntimeState,
  AbilityState,
  AutomationState,
  KickstartState,
  MetaState,
  PreferencesState,
  SeedGainEntry,
} from '../state';
import type { SeedSynergyId } from '../seeds';
import type { AchievementId } from '../data/achievements';
import type { ItemId } from '../data/items';
import type { MilestoneId } from '../data/milestones';
import type { ResearchId } from '../data/research';
import type { UpgradeId } from '../data/upgrades';
import type { LocaleKey } from '../i18n';
import type { SettingsState } from '../settings';

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
export type RestoredSeedGainEntry = SeedGainEntry;
