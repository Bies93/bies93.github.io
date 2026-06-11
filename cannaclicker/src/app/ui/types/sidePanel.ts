import type { AchievementId } from '../../../data/achievements';
import type { ItemId } from '../../../data/items';
import type { ResearchId } from '../../../data/research';
import type { UpgradeId } from '../../../data/upgrades';
import type { ResearchFilter } from '../../research';
import type { PrestigePanelRefs } from './prestige';
import type { RoomId } from '../../../data/rooms';
import type { StrainId } from '../../../data/strains';
import type { ContractId } from '../../../data/contracts';
import type { SeasonId } from '../../../data/seasons';
import type { ChallengeId } from '../../../data/challenges';

export type AchievementFilter = 'all' | 'unlocked' | 'near' | 'hidden';

export interface ResearchCardRefs {
  id: ResearchId;
  container: HTMLElement;
  icon: HTMLImageElement | null;
  path: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  effects: HTMLUListElement;
  requires: HTMLElement;
  lock: HTMLElement;
  cost: HTMLElement;
  button: HTMLButtonElement;
}

export interface AchievementCardRefs {
  container: HTMLElement;
  iconBase: HTMLImageElement;
  iconOverlay: HTMLImageElement;
  category: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  flavor: HTMLElement;
  reward: HTMLElement;
  status: HTMLElement;
  progressBar: HTMLElement;
  progressText: HTMLElement;
}

export interface ShopCardRefs {
  container: HTMLElement;
  media: HTMLElement;
  detailPanel: HTMLElement;
  icon: HTMLImageElement;
  name: HTMLElement;
  description: HTMLElement;
  role: HTMLElement;
  roiBadge: HTMLElement;
  roiValue: HTMLElement;
  ownedBadge: HTMLElement;
  stageLabel: HTMLElement;
  stageProgressBar: HTMLElement;
  stageProgressText: HTMLElement;
  softcapBadge: HTMLElement;
  unlockHint: HTMLElement;
  costLabel: HTMLElement;
  cost: HTMLElement;
  ownedLabel: HTMLElement;
  owned: HTMLElement;
  currentProductionLabel: HTMLElement;
  currentProduction: HTMLElement;
  nextProductionLabel: HTMLElement;
  nextProduction: HTMLElement;
  shareLabel: HTMLElement;
  share: HTMLElement;
  delta: HTMLElement;
  buyButton: HTMLButtonElement;
  buyTenButton: HTMLButtonElement;
  buyTwentyFiveButton: HTMLButtonElement;
  maxButton: HTMLButtonElement;
}

export interface UpgradeCardRefs {
  container: HTMLElement;
  icon: HTMLImageElement;
  category: HTMLElement;
  name: HTMLElement;
  description: HTMLElement;
  status: HTMLElement;
  progress: HTMLElement;
  requirementList: HTMLElement;
  costLabel: HTMLElement;
  costValue: HTMLElement;
  buyButton: HTMLButtonElement;
}

export interface SidePanelRefs {
  section: HTMLElement;
  tabList: HTMLElement;
  tabs: Map<SidePanelTab, HTMLButtonElement>;
  views: Record<SidePanelTab, HTMLElement>;
  shop: {
    list: HTMLElement;
    entries: Map<ItemId, ShopCardRefs>;
  };
  upgrades: {
    list: HTMLElement;
    entries: Map<UpgradeId, UpgradeCardRefs>;
  };
  research: {
    container: HTMLElement;
    filters: Map<ResearchFilter, HTMLButtonElement>;
    pathSummary: HTMLElement;
    list: HTMLElement;
    entries: Map<ResearchId, ResearchCardRefs>;
    emptyState: HTMLElement;
  };
  prestige: PrestigePanelRefs;
  achievements: {
    summary: HTMLElement;
    summaryProgressBar: HTMLElement;
    summaryProgressText: HTMLElement;
    summaryScore: HTMLElement;
    summaryMultiplier: HTMLElement;
    summaryNear: HTMLElement;
    summaryCategories: HTMLElement;
    filters: Map<AchievementFilter, HTMLButtonElement>;
    activeFilter: AchievementFilter;
    list: HTMLElement;
    entries: Map<AchievementId, AchievementCardRefs>;
  };
  greenhouse: {
    summary: HTMLElement;
    roomsList: HTMLElement;
    roomButtons: Map<RoomId, HTMLButtonElement>;
    strainsList: HTMLElement;
    strainButtons: Map<StrainId, HTMLButtonElement>;
    contractsList: HTMLElement;
    contractButtons: Map<ContractId, HTMLButtonElement>;
    seasonsList: HTMLElement;
    seasonButtons: Map<SeasonId, HTMLButtonElement>;
    eventMasteryList: HTMLElement;
    challengesList: HTMLElement;
    challengeButtons: Map<ChallengeId, HTMLButtonElement>;
    collectionList: HTMLElement;
    automationStatus: HTMLElement;
    automationAutoClick: HTMLInputElement;
    automationBuyMode: HTMLSelectElement;
    automationAbilityMode: HTMLSelectElement;
  };
  settings: {
    container: HTMLElement;
    offlineToggle: HTMLInputElement;
    offlineTitle: HTMLElement;
    offlineDescription: HTMLElement;
    soundTitle: HTMLElement;
    soundDescription: HTMLElement;
    soundButton: HTMLButtonElement;
    sfxVolumeTitle: HTMLElement;
    sfxVolumeDescription: HTMLElement;
    sfxVolumeInput: HTMLInputElement;
    musicTitle: HTMLElement;
    musicDescription: HTMLElement;
    musicToggle: HTMLInputElement;
    musicVolumeTitle: HTMLElement;
    musicVolumeDescription: HTMLElement;
    musicVolumeInput: HTMLInputElement;
    motionTitle: HTMLElement;
    motionDescription: HTMLElement;
    motionSelect: HTMLSelectElement;
    themeTitle: HTMLElement;
    themeDescription: HTMLElement;
    themeSelect: HTMLSelectElement;
    plantSkinTitle: HTMLElement;
    plantSkinDescription: HTMLElement;
    plantSkinSelect: HTMLSelectElement;
  };
}

export type SidePanelTab =
  | 'shop'
  | 'upgrades'
  | 'research'
  | 'greenhouse'
  | 'prestige'
  | 'achievements';
