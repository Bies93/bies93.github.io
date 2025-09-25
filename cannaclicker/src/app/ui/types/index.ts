export type { ControlButtonRefs, UIControlGroupRefs } from "./controls";
export type { UIHeaderRefs } from "./header";
export type { UIStatRefs } from "./stats";
export type { UISeedRefs } from "./seeds";
export type { UIClickerRefs } from "./clicker";
export type { AbilityButtonRefs, UIAbilityPanelRefs } from "./abilities";
export type { UIServiceRefs } from "./services";
export type {
  MilestoneCardRefs,
  PrestigePanelRefs,
  PrestigeModalRefs,
  UIPrestigeModalHost,
} from "./prestige";
export type {
  ResearchCardRefs,
  AchievementCardRefs,
  ShopCardRefs,
  UpgradeCardRefs,
  SidePanelRefs,
  SidePanelTab,
} from "./sidePanel";

import type { UIHeaderRefs } from "./header";
import type { UIControlGroupRefs } from "./controls";
import type { UIStatRefs } from "./stats";
import type { UISeedRefs } from "./seeds";
import type { UIClickerRefs } from "./clicker";
import type { UIAbilityPanelRefs } from "./abilities";
import type { UIServiceRefs } from "./services";
import type { UIPrestigeModalHost } from "./prestige";
import type { SidePanelRefs } from "./sidePanel";

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
