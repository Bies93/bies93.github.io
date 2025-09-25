import type { GameState } from "../../state";
import type {
  SidePanelRefs,
  UIAbilityPanelRefs,
  UIClickerRefs,
  UIPrestigeModalHost,
  UISeedRefs,
  UIServiceRefs,
  UIStatRefs,
} from "../types";
import { mountHeader } from "./header";
import { mountPrimaryPanels } from "./panels";
import { mountRootServices } from "./root";

export interface MountPanelsArgs {
  state: GameState;
  root: HTMLElement;
  layout: HTMLDivElement;
  primaryColumn: HTMLDivElement;
  secondaryColumn: HTMLDivElement;
}

export interface MountPanelsResult
  extends UIStatRefs,
    UISeedRefs,
    UIClickerRefs,
    UIAbilityPanelRefs,
    UIServiceRefs,
    UIPrestigeModalHost {
  sidePanel: SidePanelRefs;
}

export function mountPanels(args: MountPanelsArgs): MountPanelsResult {
  const { state, root, layout, primaryColumn, secondaryColumn } = args;

  const statsLabels = new Map<string, HTMLElement>();
  const statsMeta = new Map<string, HTMLElement>();

  const headerRefs = mountHeader({ root, statsLabels, statsMeta });
  root.appendChild(layout);

  const panelRefs = mountPrimaryPanels({
    state,
    primaryColumn,
    secondaryColumn,
    statsLabels,
    statsMeta,
  });

  const serviceRefs = mountRootServices({ root });

  return {
    statsLabels,
    statsMeta,
    buds: panelRefs.buds,
    bps: panelRefs.bps,
    bpc: panelRefs.bpc,
    total: headerRefs.total,
    seeds: headerRefs.seeds,
    seedRate: headerRefs.seedRate,
    prestigeMult: headerRefs.prestigeMult,
    seedBadge: headerRefs.seedBadge,
    seedBadgeValue: headerRefs.seedBadgeValue,
    clickButton: panelRefs.clickButton,
    clickLabel: panelRefs.clickLabel,
    clickIcon: panelRefs.clickIcon,
    announcer: panelRefs.announcer,
    abilityTitle: panelRefs.abilityTitle,
    abilityList: panelRefs.abilityList,
    sidePanel: panelRefs.sidePanel,
    prestigeModal: serviceRefs.prestigeModal,
    toastContainer: serviceRefs.toastContainer,
    eventLayer: serviceRefs.eventLayer,
    modalOverlay: serviceRefs.modalOverlay,
    eventRoot: serviceRefs.eventRoot,
  };
}
