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

  const abilityTitle = document.createElement("h2");
  abilityTitle.className = "text-xl font-semibold text-leaf-200";
  abilitySection.appendChild(abilityTitle);

  const abilityGrid = document.createElement("div");
  abilityGrid.className = "ability-grid";
  abilitySection.appendChild(abilityGrid);

  const abilityList = new Map<AbilityId, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityList.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const sidePanel = createSidePanel("shop");
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
