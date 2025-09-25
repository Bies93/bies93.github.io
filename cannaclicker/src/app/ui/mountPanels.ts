import { listAbilities } from "../abilities";
import { withBase } from "../paths";
import type { GameState } from "../state";
import { createAbilityButton } from "./components/controls";
import { createPrestigeModal } from "./components/prestigeModal";
import { createStatBlock } from "./components/stats";
import { createSidePanel } from "./panels/sidePanel";
import { plantStageAsset, preloadPlantStage } from "./updaters/plant";
import type {
  AbilityButtonRefs,
  SidePanelRefs,
  UIAbilityPanelRefs,
  UIClickerRefs,
  UISeedRefs,
  UIServiceRefs,
  UIStatRefs,
  UIPrestigeModalHost,
} from "./types";

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

  const infoRibbon = document.createElement("section");
  infoRibbon.className = "info-ribbon fade-in";

  const infoList = document.createElement("div");
  infoList.className = "info-ribbon__list";
  infoRibbon.appendChild(infoList);

  const totalStat = createStatBlock("stats.total", infoList, statsLabels, statsMeta);
  const seedsStat = createStatBlock("stats.seeds", infoList, statsLabels, statsMeta);
  const seedRateStat = createStatBlock("stats.seedRate", infoList, statsLabels, statsMeta);
  const prestigeStat = createStatBlock("stats.prestigeMult", infoList, statsLabels, statsMeta);

  const infoActions = document.createElement("div");
  infoActions.className = "info-ribbon__actions";
  infoRibbon.appendChild(infoActions);

  const seedBadge = document.createElement("button");
  seedBadge.type = "button";
  seedBadge.className = "prestige-badge";
  const seedIcon = new Image();
  seedIcon.src = withBase("icons/ui/ui-seed.png");
  seedIcon.alt = "";
  seedIcon.decoding = "async";
  seedIcon.className = "prestige-badge__icon";
  const seedBadgeValue = document.createElement("span");
  seedBadgeValue.className = "prestige-badge__value";
  seedBadge.append(seedIcon, seedBadgeValue);
  infoActions.appendChild(seedBadge);

  const clickCard = document.createElement("section");
  clickCard.className = "card fade-in click-card";

  const clickHeader = document.createElement("div");
  clickHeader.className = "click-card__header";
  const clickStats = document.createElement("div");
  clickStats.className = "click-stats";

  clickHeader.appendChild(clickStats);
  clickCard.appendChild(clickHeader);

  const clickBody = document.createElement("div");
  clickBody.className = "click-card__body";
  clickCard.appendChild(clickBody);

  const clickButton = document.createElement("button");
  clickButton.className = "click-button w-full";
  clickButton.type = "button";

  const clickIcon = document.createElement("div");
  clickIcon.className = "click-icon";
  clickIcon.setAttribute("aria-hidden", "true");
  clickIcon.style.setProperty("background-image", `url("${withBase(plantStageAsset(0))}")`);
  clickIcon.dataset.stage = "0";
  preloadPlantStage(0);
  preloadPlantStage(1);

  const clickLabel = document.createElement("span");
  clickLabel.className = "click-label";

  clickButton.append(clickIcon, clickLabel);
  clickBody.appendChild(clickButton);

  const budsStat = createStatBlock("stats.buds", clickStats, statsLabels, statsMeta);
  const bpsStat = createStatBlock("stats.bps", clickStats, statsLabels, statsMeta);
  const bpcStat = createStatBlock("stats.bpc", clickStats, statsLabels, statsMeta);

  const announcer = document.createElement("p");
  announcer.setAttribute("data-sr-only", "true");
  announcer.setAttribute("aria-live", "polite");
  clickCard.appendChild(announcer);

  primaryColumn.appendChild(clickCard);

  const abilitySection = document.createElement("section");
  abilitySection.className = "card fade-in space-y-4";

  const abilityTitle = document.createElement("h2");
  abilityTitle.className = "text-xl font-semibold text-leaf-200";
  abilitySection.appendChild(abilityTitle);

  const abilityGrid = document.createElement("div");
  abilityGrid.className = "ability-grid";
  abilitySection.appendChild(abilityGrid);

  const abilityRefs = new Map<string, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityRefs.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const sidePanel = createSidePanel("shop");
  secondaryColumn.appendChild(sidePanel.section);

  root.append(infoRibbon, layout);

  const eventLayer = document.createElement("div");
  eventLayer.className = "event-layer";
  root.appendChild(eventLayer);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
  root.appendChild(toastContainer);

  const prestigeModal = createPrestigeModal();
  if (prestigeModal.overlay) {
    root.appendChild(prestigeModal.overlay);
  }

  return {
    statsLabels,
    statsMeta,
    buds: budsStat,
    bps: bpsStat,
    bpc: bpcStat,
    total: totalStat,
    seeds: seedsStat,
    seedRate: seedRateStat,
    prestigeMult: prestigeStat,
    seedBadge,
    seedBadgeValue,
    clickButton,
    clickLabel,
    clickIcon,
    announcer,
    abilityTitle,
    abilityList: abilityRefs,
    sidePanel,
    prestigeModal,
    toastContainer,
    eventLayer,
    modalOverlay: prestigeModal.overlay,
    eventRoot: eventLayer,
  };
}
