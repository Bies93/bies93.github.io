import { t } from "../../i18n";
import { listAbilities } from "../../abilities";
import type { GameState } from "../../state";
import type { AbilityId } from "../../../data/abilities";
import { createAbilityButton } from "../components/controls";
import { createStatBlock } from "../components/stats";
import { createSidePanel } from "../panels/sidePanel";
import { withBase } from "../paths";
import { plantStageAsset, preloadPlantStage } from "../updaters/plant";
import type {
  AbilityButtonRefs,
  SidePanelRefs,
  UIAbilityPanelRefs,
  UIClickerRefs,
  UIStatRefs,
} from "../types";

export interface MountPanelsArgs {
  state: GameState;
  primaryColumn: HTMLDivElement;
  secondaryColumn: HTMLDivElement;
  statsLabels: Map<string, HTMLElement>;
  statsMeta: Map<string, HTMLElement>;
}

export interface MountPanelsResult
  extends Pick<UIStatRefs, "buds" | "bps" | "bpc">,
    UIClickerRefs,
    UIAbilityPanelRefs {
  sidePanel: SidePanelRefs;
}

export function mountPrimaryPanels(args: MountPanelsArgs): MountPanelsResult {
  const { state, primaryColumn, secondaryColumn, statsLabels, statsMeta } = args;

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

  const buds = createStatBlock("stats.buds", clickStats, statsLabels, statsMeta);
  const bps = createStatBlock("stats.bps", clickStats, statsLabels, statsMeta);
  const bpc = createStatBlock("stats.bpc", clickStats, statsLabels, statsMeta);

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

  const abilityList = new Map<AbilityId, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityList.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const sidePanel = createSidePanel("shop");
  sidePanel.section.dataset.uiRole = "side-panel";
  sidePanel.section.dataset.testid = "side-panel";
  sidePanel.section.setAttribute("role", "region");
  sidePanel.section.setAttribute("aria-label", t(state.locale, "ui.sections.sidePanel"));
  secondaryColumn.appendChild(sidePanel.section);

  return {
    buds,
    bps,
    bpc,
    clickButton,
    clickLabel,
    clickIcon,
    announcer,
    abilityTitle,
    abilityList,
    sidePanel,
  };
}
