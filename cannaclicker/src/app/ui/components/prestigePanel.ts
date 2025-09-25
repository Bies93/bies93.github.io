import { milestones } from "../../../data/milestones";
import type { MilestoneId } from "../../../data/milestones";
import type { MilestoneCardRefs, PrestigePanelRefs } from "../types";
import { createMilestoneCard } from "./milestoneCard";

export function createPrestigePanel(): PrestigePanelRefs {
  const container = document.createElement("div");
  container.className = "prestige-panel";

  const description = document.createElement("p");
  description.className = "prestige-panel__description";
  container.appendChild(description);

  const stats = document.createElement("div");
  stats.className = "prestige-panel__stats";
  container.appendChild(stats);

  const permanent = createPrestigePanelStat(stats);
  const kickstart = createPrestigePanelStat(stats);
  const active = createPrestigePanelStat(stats);

  const milestoneList = document.createElement("div");
  milestoneList.className = "milestone-list";
  container.appendChild(milestoneList);

  const milestoneRefs = new Map<MilestoneId, MilestoneCardRefs>();
  milestones.forEach((definition) => {
    const card = createMilestoneCard();
    milestoneRefs.set(definition.id, card);
    milestoneList.appendChild(card.container);
  });

  const requirement = document.createElement("p");
  requirement.className = "prestige-panel__requirement";
  container.appendChild(requirement);

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "prestige-panel__action";
  actionButton.dataset.id = "prestige";
  actionButton.dataset.role = "prestige-action";
  actionButton.dataset.kind = "prestige";
  container.appendChild(actionButton);

  return {
    container,
    description,
    permanentLabel: permanent.label,
    permanentValue: permanent.value,
    kickstartLabel: kickstart.label,
    kickstartValue: kickstart.value,
    activeKickstartLabel: active.label,
    activeKickstartValue: active.value,
    milestoneList,
    milestones: milestoneRefs,
    requirement,
    actionButton,
  } satisfies PrestigePanelRefs;
}

function createPrestigePanelStat(wrapper: HTMLElement): { label: HTMLElement; value: HTMLElement } {
  const row = document.createElement("div");
  row.className = "prestige-panel__stat";

  const label = document.createElement("dt");
  label.className = "prestige-panel__stat-label";
  row.appendChild(label);

  const value = document.createElement("dd");
  value.className = "prestige-panel__stat-value";
  row.appendChild(value);

  wrapper.appendChild(row);
  return { label, value };
}
