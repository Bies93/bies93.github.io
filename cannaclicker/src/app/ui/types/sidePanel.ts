import type { AchievementId } from "../../../data/achievements";
import type { ItemId } from "../../../data/items";
import type { ResearchId } from "../../../data/research";
import type { UpgradeId } from "../../../data/upgrades";
import type { ResearchFilter } from "../../research";
import type { PrestigePanelRefs } from "./prestige";

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
  title: HTMLElement;
  description: HTMLElement;
  reward: HTMLElement;
  status: HTMLElement;
}

export interface ShopCardRefs {
  container: HTMLElement;
  icon: HTMLImageElement;
  name: HTMLElement;
  description: HTMLElement;
  roiBadge: HTMLElement;
  roiValue: HTMLElement;
  stageLabel: HTMLElement;
  stageProgressBar: HTMLElement;
  stageProgressText: HTMLElement;
  softcapBadge: HTMLElement;
  costLabel: HTMLElement;
  cost: HTMLElement;
  ownedLabel: HTMLElement;
  owned: HTMLElement;
  buyButton: HTMLButtonElement;
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
    list: HTMLElement;
    entries: Map<ResearchId, ResearchCardRefs>;
    emptyState: HTMLElement;
  };
  prestige: PrestigePanelRefs;
  achievements: {
    list: HTMLElement;
    entries: Map<AchievementId, AchievementCardRefs>;
  };
}

export type SidePanelTab = "shop" | "upgrades" | "research" | "prestige" | "achievements";
