import { listAbilities } from "../abilities";
import { t } from "../i18n";
import { withBase } from "../paths";
import type { GameState } from "../state";
import type { AbilityId } from "../../data/abilities";
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
  infoRibbon.dataset.uiRole = "hud";
  infoRibbon.dataset.testid = "hud-ribbon";
  infoRibbon.setAttribute("role", "region");
  infoRibbon.setAttribute("aria-label", t(state.locale, "ui.sections.hud"));

  const infoList = document.createElement("div");
  infoList.className = "info-ribbon__list";
  infoList.dataset.uiRole = "hud-list";
  infoList.dataset.testid = "hud-list";
  infoList.setAttribute("role", "list");
  infoRibbon.appendChild(infoList);

  const totalStat = createStatBlock("stats.total", infoList, statsLabels, statsMeta);
  const seedsStat = createStatBlock("stats.seeds", infoList, statsLabels, statsMeta);
  const seedRateStat = createStatBlock("stats.seedRate", infoList, statsLabels, statsMeta);
  const prestigeStat = createStatBlock("stats.prestigeMult", infoList, statsLabels, statsMeta);

  const infoActions = document.createElement("div");
  infoActions.className = "info-ribbon__actions";
  infoActions.dataset.uiRole = "hud-actions";
  infoActions.dataset.testid = "hud-actions";
  infoRibbon.appendChild(infoActions);

  const seedBadge = document.createElement("button");
  seedBadge.type = "button";
  seedBadge.className = "prestige-badge";
  seedBadge.dataset.uiRole = "seed-badge";
  seedBadge.dataset.testid = "seed-badge";
  seedBadge.setAttribute("aria-label", t(state.locale, "ui.controls.seedBadge"));
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
  clickCard.dataset.uiRole = "clicker-card";
  clickCard.dataset.testid = "clicker-card";
  clickCard.setAttribute("role", "region");
  clickCard.setAttribute("aria-label", t(state.locale, "ui.sections.clicker"));

  const clickHeader = document.createElement("div");
  clickHeader.className = "click-card__header";
  const clickStats = document.createElement("div");
  clickStats.className = "click-stats";

  clickHeader.appendChild(clickStats);
  clickCard.appendChild(clickHeader);

  const clickBody = document.createElement("div");
  clickBody.className = "click-card__body";
  clickBody.dataset.uiRole = "click-body";
  clickBody.dataset.testid = "click-body";
  clickCard.appendChild(clickBody);

  const clickButton = document.createElement("button");
  clickButton.className = "click-button w-full";
  clickButton.type = "button";
  clickButton.dataset.uiRole = "click-button";
  clickButton.dataset.testid = "click-button";

  const clickIcon = document.createElement("div");
  clickIcon.className = "click-icon";
  clickIcon.dataset.uiRole = "click-icon";
  clickIcon.dataset.testid = "click-icon";
  clickIcon.setAttribute("aria-hidden", "true");
  clickIcon.style.setProperty("background-image", `url("${withBase(plantStageAsset(0))}")`);
  clickIcon.dataset.stage = "0";
  preloadPlantStage(0);
  preloadPlantStage(1);

  const clickLabel = document.createElement("span");
  clickLabel.className = "click-label";
  clickLabel.dataset.uiRole = "click-label";
  clickLabel.dataset.testid = "click-label";

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
  abilitySection.dataset.uiRole = "ability-panel";
  abilitySection.dataset.testid = "ability-panel";
  abilitySection.setAttribute("role", "region");
  abilitySection.setAttribute("aria-label", t(state.locale, "ui.sections.abilities"));

  const abilityTitle = document.createElement("h2");
  abilityTitle.className = "text-xl font-semibold text-leaf-200";
  abilityTitle.dataset.uiRole = "ability-title";
  abilityTitle.dataset.testid = "ability-title";
  abilitySection.appendChild(abilityTitle);

  const abilityGrid = document.createElement("div");
  abilityGrid.className = "ability-grid";
  abilityGrid.dataset.uiRole = "ability-grid";
  abilityGrid.dataset.testid = "ability-grid";
  abilitySection.appendChild(abilityGrid);

  const abilityRefs = new Map<AbilityId, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityRefs.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const sidePanel = createSidePanel("shop");
  sidePanel.section.dataset.uiRole = "side-panel";
  sidePanel.section.dataset.testid = "side-panel";
  sidePanel.section.setAttribute("role", "region");
  sidePanel.section.setAttribute("aria-label", t(state.locale, "ui.sections.sidePanel"));
  secondaryColumn.appendChild(sidePanel.section);

  root.append(infoRibbon, layout);

  const eventLayer = document.createElement("div");
  eventLayer.className = "event-layer";
  eventLayer.dataset.uiRole = "event-layer";
  eventLayer.dataset.testid = "event-layer";
  eventLayer.setAttribute("role", "region");
  eventLayer.setAttribute("aria-label", t(state.locale, "ui.sections.eventLayer"));
  root.appendChild(eventLayer);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
  toastContainer.dataset.uiRole = "toast-container";
  toastContainer.dataset.testid = "toast-container";
  toastContainer.setAttribute("role", "region");
  toastContainer.setAttribute("aria-label", t(state.locale, "ui.sections.toastContainer"));
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
