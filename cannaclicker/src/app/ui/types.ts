export interface ControlButtonRefs {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLSpanElement;
}

export interface PrestigePanelRefs {
  container: HTMLElement;
  description: HTMLElement;
  permanentLabel: HTMLElement;
  permanentValue: HTMLElement;
  kickstartLabel: HTMLElement;
  kickstartValue: HTMLElement;
  activeKickstartLabel: HTMLElement;
  activeKickstartValue: HTMLElement;
  milestoneList: HTMLElement;
  milestones: Map<string, MilestoneCardRefs>;
  requirement: HTMLElement;
  actionButton: HTMLButtonElement;
}

export interface MilestoneCardRefs {
  container: HTMLElement;
  title: HTMLElement;
  reward: HTMLElement;
  description: HTMLElement;
  badge: HTMLElement;
  progressBar: HTMLElement;
  progressFill: HTMLElement;
  progressLabel: HTMLElement;
}

export interface ResearchCardRefs {
  id: string;
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

export interface AbilityButtonRefs {
  container: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLElement;
  status: HTMLElement;
  progressBar: HTMLElement;
}

export interface PrestigeModalRefs {
  overlay?: HTMLElement;
  dialog: HTMLDivElement;
  title: HTMLElement;
  description: HTMLElement;
  warning: HTMLElement;
  previewCurrentLabel: HTMLElement;
  previewCurrentValue: HTMLElement;
  previewAfterLabel: HTMLElement;
  previewAfterValue: HTMLElement;
  previewGainLabel: HTMLElement;
  previewGainValue: HTMLElement;
  previewBonusLabel: HTMLElement;
  previewBonusValue: HTMLElement;
  checkbox: HTMLInputElement;
  checkboxLabel: HTMLElement;
  confirmButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  statusLabel: HTMLElement;
}

export interface SidePanelRefs {
  section: HTMLElement;
  tabList: HTMLElement;
  tabs: Map<SidePanelTab, HTMLButtonElement>;
  views: Record<SidePanelTab, HTMLElement>;
  shop: {
    list: HTMLElement;
    entries: Map<string, ShopCardRefs>;
  };
  upgrades: {
    list: HTMLElement;
    entries: Map<string, UpgradeCardRefs>;
  };
  research: {
    container: HTMLElement;
    filters: Map<string, HTMLButtonElement>;
    list: HTMLElement;
    entries: Map<string, ResearchCardRefs>;
    emptyState: HTMLElement;
  };
  prestige: PrestigePanelRefs;
  achievements: {
    list: HTMLElement;
    entries: Map<string, AchievementCardRefs>;
  };
}

export type SidePanelTab = 'shop' | 'upgrades' | 'research' | 'prestige' | 'achievements';

export interface UIHeaderRefs {
  headerTitle: HTMLHeadingElement;
}

export interface UIControlGroupRefs {
  controls: {
    mute: ControlButtonRefs;
    export: ControlButtonRefs;
    import: ControlButtonRefs;
    reset: ControlButtonRefs;
  };
}

export interface UIStatRefs {
  statsLabels: Map<string, HTMLElement>;
  statsMeta: Map<string, HTMLElement>;
  buds: HTMLElement;
  bps: HTMLElement;
  bpc: HTMLElement;
  total: HTMLElement;
  seeds: HTMLElement;
  seedRate: HTMLElement;
  prestigeMult: HTMLElement;
}

export interface UISeedRefs {
  seedBadge: HTMLButtonElement;
  seedBadgeValue: HTMLElement;
}

export interface UIClickerRefs {
  clickButton: HTMLButtonElement;
  clickLabel: HTMLSpanElement;
  clickIcon: HTMLDivElement;
  announcer: HTMLElement;
}

export interface UIAbilityPanelRefs {
  abilityTitle: HTMLElement;
  abilityList: Map<string, AbilityButtonRefs>;
}

export interface UIServiceRefs {
  toastContainer?: HTMLElement;
  eventLayer?: HTMLElement;
  modalOverlay?: HTMLElement;
  eventRoot?: HTMLElement;
}

export interface UIPrestigeModalHost {
  prestigeModal: PrestigeModalRefs;
}

export interface UIRefs
  extends UIHeaderRefs,
    UIControlGroupRefs,
    UIStatRefs,
    UISeedRefs,
    UIClickerRefs,
    UIAbilityPanelRefs,
    UIServiceRefs,
    UIPrestigeModalHost {
  root: HTMLElement;
  sidePanel: SidePanelRefs;
}
