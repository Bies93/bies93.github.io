import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { getPrestigePreview } from '../../prestige';
import { milestones } from '../../../data/milestones';
import type { MilestoneId } from '../../../data/milestones';
import type { AscensionNodeId } from '../../../data/ascension';
import type { MilestoneProgressSnapshot } from '../../milestones';
import { getAscensionEffects, getAscensionViews } from '../../ascension';
import type { UIRefs, MilestoneCardRefs } from '../types';
import type { AscensionNodeCardRefs } from '../types/prestige';
import {
  formatActiveKickstartSummary,
  formatMilestoneProgressText,
  formatNextKickstartSummary,
  formatPermanentBonusSummary,
} from '../utils/format';

export function updatePrestigePanel(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  const panel = refs.sidePanel.prestige;

  panel.description.textContent = t(state.locale, 'panel.prestige.description');

  panel.spendableSeedsLabel.textContent = t(state.locale, 'panel.prestige.spendableSeeds');
  panel.spendableSeedsValue.textContent = formatDecimal(preview.seedsBefore);

  panel.totalSeedsLabel.textContent = t(state.locale, 'panel.prestige.totalSeeds');
  panel.totalSeedsValue.textContent = formatDecimal(preview.totalSeedsBefore);

  panel.permanentLabel.textContent = t(state.locale, 'panel.prestige.permanent');
  panel.permanentValue.textContent = formatPermanentBonusSummary(state.locale, preview);

  panel.kickstartLabel.textContent = t(state.locale, 'panel.prestige.kickstartNext');
  panel.kickstartValue.textContent = formatNextKickstartSummary(state.locale, preview);

  panel.activeKickstartLabel.textContent = t(state.locale, 'panel.prestige.kickstartActive');
  panel.activeKickstartValue.textContent = formatActiveKickstartSummary(state.locale, preview);

  updateAscensionTree(state, panel.ascensionNodes, panel.ascensionSummary);
  updateMilestoneCards(state, panel.milestones);

  const requirementText = preview.requirementMet
    ? t(state.locale, 'panel.prestige.readySeeds', {
        seeds: preview.seedGain,
      })
    : t(state.locale, 'panel.prestige.progress', {
        current: formatDecimal(preview.lifetimeBuds),
        target: formatDecimal(preview.requirementTarget),
      });

  panel.requirement.textContent = requirementText;
  panel.container.classList.toggle('is-ready', preview.requirementMet);
  panel.container.classList.toggle('is-locked', !preview.requirementMet);

  panel.actionButton.disabled = !preview.requirementMet;
  panel.actionButton.setAttribute('aria-disabled', preview.requirementMet ? 'false' : 'true');
  panel.actionButton.setAttribute(
    'title',
    preview.requirementMet ? t(state.locale, 'actions.prestige') : requirementText,
  );
}

function updateAscensionTree(
  state: GameState,
  cards: Map<AscensionNodeId, AscensionNodeCardRefs>,
  summary: HTMLElement,
): void {
  const locale = state.locale;
  const effects = getAscensionEffects(state);
  const ownedCount = state.prestige.ascensionOwned?.length ?? 0;
  summary.textContent = t(locale, 'ascension.summary', {
    owned: ownedCount,
    total: cards.size,
    seeds: state.prestige.ascensionSeeds ?? 0,
    slots: effects.permanentSlots,
  });

  for (const view of getAscensionViews(state)) {
    const card = cards.get(view.node.id);
    if (!card) {
      continue;
    }

    card.container.dataset.tier = String(view.node.tier);
    card.container.dataset.category = view.node.category;
    card.container.classList.toggle('is-owned', view.owned);
    card.container.classList.toggle('is-affordable', view.affordable);
    card.container.classList.toggle('is-locked', view.locked);
    card.category.textContent = t(locale, `ascension.category.${view.node.category}`);
    card.title.textContent = view.node.name[locale];
    card.description.textContent = view.node.description[locale];
    card.effect.textContent = view.node.effectSummary[locale];
    card.cost.textContent = t(locale, 'ascension.cost', { cost: view.node.cost });

    if (view.owned) {
      card.status.textContent = t(locale, 'ascension.status.owned');
    } else if (view.locked) {
      card.status.textContent = t(locale, 'ascension.status.locked', {
        count: view.missingRequirementIds.length,
      });
    } else if (view.affordable) {
      card.status.textContent = t(locale, 'ascension.status.ready');
    } else {
      card.status.textContent = t(locale, 'ascension.status.needSeeds');
    }

    card.button.disabled = view.owned || view.locked || !view.affordable;
    card.button.textContent = view.owned
      ? t(locale, 'ascension.action.owned')
      : t(locale, 'ascension.action.buy');
  }
}

function updateMilestoneCards(state: GameState, cards: Map<MilestoneId, MilestoneCardRefs>): void {
  const locale = state.locale;
  const progressList = state.temp.milestoneProgress ?? [];
  const progressMap = new Map<MilestoneId, MilestoneProgressSnapshot>(
    progressList.map((snapshot) => [snapshot.id, snapshot]),
  );

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
    card.container.classList.toggle('is-active', achieved);
    card.badge.textContent = t(locale, 'milestones.active');
    card.badge.classList.toggle('hidden', !achieved);
    card.badge.classList.toggle('is-active', achieved);
    card.progressFill.style.width = `${Math.round(progressValue * 100)}%`;
    if (snapshot) {
      card.progressLabel.textContent = formatMilestoneProgressText(state, snapshot.detail);
    } else {
      card.progressLabel.textContent = '';
    }
  });
}
