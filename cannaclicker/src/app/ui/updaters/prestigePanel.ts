import { t } from "../../i18n";
import { formatDecimal } from "../../math";
import type { GameState } from "../../state";
import { getPrestigePreview } from "../../prestige";
import { milestones } from "../../data/milestones";
import type { UIRefs, MilestoneCardRefs } from "../types";
import {
  formatActiveKickstartSummary,
  formatMilestoneProgressText,
  formatNextKickstartSummary,
  formatPermanentBonusSummary,
} from "../utils/format";

export function updatePrestigePanel(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  const panel = refs.sidePanel.prestige;

  panel.description.textContent = t(state.locale, "panel.prestige.description");

  panel.permanentLabel.textContent = t(state.locale, "panel.prestige.permanent");
  panel.permanentValue.textContent = formatPermanentBonusSummary(state.locale, preview);

  panel.kickstartLabel.textContent = t(state.locale, "panel.prestige.kickstartNext");
  panel.kickstartValue.textContent = formatNextKickstartSummary(state.locale, preview);

  panel.activeKickstartLabel.textContent = t(state.locale, "panel.prestige.kickstartActive");
  panel.activeKickstartValue.textContent = formatActiveKickstartSummary(state.locale, preview);

  updateMilestoneCards(state, panel.milestones);

  const requirementText = preview.requirementMet
    ? t(state.locale, "panel.prestige.ready")
    : t(state.locale, "panel.prestige.progress", {
        current: formatDecimal(preview.lifetimeBuds),
        target: formatDecimal(preview.requirementTarget),
      });

  panel.requirement.textContent = requirementText;
  panel.container.classList.toggle("is-ready", preview.requirementMet);
  panel.container.classList.toggle("is-locked", !preview.requirementMet);

  panel.actionButton.disabled = !preview.requirementMet;
  panel.actionButton.setAttribute("aria-disabled", preview.requirementMet ? "false" : "true");
  panel.actionButton.setAttribute(
    "title",
    preview.requirementMet ? t(state.locale, "actions.prestige") : requirementText,
  );
}

function updateMilestoneCards(state: GameState, cards: Map<string, MilestoneCardRefs>): void {
  const locale = state.locale;
  const progressList = state.temp.milestoneProgress ?? [];
  const progressMap = new Map(progressList.map((snapshot) => [snapshot.id, snapshot]));

  milestones.forEach((definition) => {
    const card = cards.get(definition.id);
    if (!card) {
      return;
    }

    const snapshot = progressMap.get(definition.id);
    const achieved = snapshot?.achieved ?? Boolean(state.prestige.milestones[definition.id]);
    const progressValue = snapshot ? Math.max(0, Math.min(1, snapshot.progress)) : achieved ? 1 : 0;

    card.title.textContent = `${definition.order}. ${definition.name[locale]}`;
    card.reward.textContent = definition.rewardSummary[locale];
    card.description.textContent = definition.description[locale];
    card.container.classList.toggle("is-active", achieved);
    card.badge.textContent = t(locale, "milestones.active");
    card.badge.classList.toggle("hidden", !achieved);
    card.badge.classList.toggle("is-active", achieved);
    card.progressFill.style.width = `${Math.round(progressValue * 100)}%`;
    if (snapshot) {
      card.progressLabel.textContent = formatMilestoneProgressText(state, snapshot.detail);
    } else {
      card.progressLabel.textContent = "";
    }
  });
}
