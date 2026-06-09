import { t } from '../../i18n';
import type { GameState } from '../../state';
import { achievements } from '../../../data/achievements';
import type { AchievementCategory, AchievementDefinition } from '../../../data/achievements';
import {
  getAchievementProgress,
  getAchievementScoreValue,
  getAchievementSummary,
} from '../../achievements';
import { formatDecimal } from '../../math';
import type { UIRefs } from '../types';
import type { ToastOptions } from '../services/toast';

let initialised = false;
const seenUnlocked = new Set<string>();

export function updateAchievements(
  state: GameState,
  refs: UIRefs,
  showToast?: (options: ToastOptions) => void,
): void {
  const { achievements: achievementRefs } = refs.sidePanel;
  const activeFilter = achievementRefs.activeFilter;
  const newlyUnlocked: AchievementDefinition[] = [];

  achievementRefs.filters.forEach((button, key) => {
    const active = key === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  updateAchievementSummary(state, achievementRefs);

  achievements.forEach((definition) => {
    const card = achievementRefs.entries.get(definition.id);
    if (!card) {
      return;
    }

    const unlocked = Boolean(state.achievements[definition.id]);
    const progress = getAchievementProgress(state, definition);
    const near = !unlocked && !definition.hidden && progress.progress >= 0.7;
    const visible = shouldShow(activeFilter, unlocked, near, Boolean(definition.hidden));

    card.container.classList.toggle('hidden', !visible);
    card.container.dataset.category = definition.category;
    card.container.dataset.rarity = definition.rarity;
    card.container.classList.toggle(
      'is-hidden-achievement',
      Boolean(definition.hidden) && !unlocked,
    );
    card.container.classList.toggle('is-near', near);

    const lockedHidden = Boolean(definition.hidden) && !unlocked;
    card.category.textContent = t(state.locale, `achievements.category.${definition.category}`);
    card.title.textContent = lockedHidden
      ? t(state.locale, 'achievements.hidden.title')
      : definition.name[state.locale];
    card.description.textContent = lockedHidden
      ? t(state.locale, 'achievements.hidden.description')
      : definition.description[state.locale];
    card.flavor.textContent = lockedHidden ? '' : definition.flavor[state.locale];

    if (lockedHidden) {
      card.reward.textContent = '';
      card.reward.classList.add('hidden');
    } else if (definition.rewardMultiplier) {
      const percent = Math.round((definition.rewardMultiplier - 1) * 100);
      card.reward.textContent = t(state.locale, 'achievements.reward', { value: percent });
      card.reward.classList.remove('hidden');
    } else {
      card.reward.textContent = t(state.locale, 'achievements.score.cardReward', {
        score: getAchievementScoreValue(definition),
      });
      card.reward.classList.remove('hidden');
    }

    card.status.textContent = unlocked
      ? t(state.locale, 'achievements.status.unlocked')
      : near
        ? t(state.locale, 'achievements.status.near')
        : t(state.locale, 'achievements.status.locked');
    card.container.classList.toggle('is-unlocked', unlocked);
    card.progressBar.style.width = `${Math.round(progress.progress * 100)}%`;
    card.progressText.textContent = unlocked
      ? t(state.locale, 'achievements.progress.done')
      : t(state.locale, 'achievements.progress.value', {
          current: formatDecimal(progress.current),
          target: formatDecimal(progress.target),
        });

    if (unlocked && !seenUnlocked.has(definition.id)) {
      newlyUnlocked.push(definition);
      seenUnlocked.add(definition.id);
    }
  });

  if (initialised && showToast && newlyUnlocked.length > 0) {
    const rarest = newlyUnlocked.reduce((current, next) =>
      rarityRank(next.rarity) > rarityRank(current.rarity) ? next : current,
    );
    if (newlyUnlocked.length === 1) {
      showToast({
        title: t(state.locale, 'achievements.toast.title'),
        message: rarest.name[state.locale],
        tone: rarest.rarity === 'common' ? 'success' : 'rare',
      });
    } else {
      showToast({
        title: t(state.locale, 'achievements.toast.title'),
        message: t(state.locale, 'achievements.toast.group', {
          count: newlyUnlocked.length,
          name: rarest.name[state.locale],
        }),
        tone: rarest.rarity === 'common' ? 'success' : 'rare',
        durationMs: 6200,
      });
    }
  }

  initialised = true;
}

function updateAchievementSummary(
  state: GameState,
  refs: UIRefs['sidePanel']['achievements'],
): void {
  const summary = getAchievementSummary(state);
  const progress = summary.total > 0 ? summary.unlocked / summary.total : 1;
  refs.summaryProgressBar.style.width = `${Math.round(progress * 100)}%`;
  refs.summaryProgressText.textContent = t(state.locale, 'achievements.summary.progress', {
    unlocked: summary.unlocked,
    total: summary.total,
  });
  refs.summaryScore.textContent = t(state.locale, 'achievements.summary.score', {
    score: summary.score,
    max: summary.maxScore,
  });
  refs.summaryMultiplier.textContent = t(state.locale, 'achievements.summary.multiplier', {
    value: Math.round((summary.multiplier - 1) * 1000) / 10,
  });
  refs.summaryNear.textContent = t(state.locale, 'achievements.summary.near', {
    count: summary.nearCount,
    hidden: summary.hiddenUnlocked,
    hiddenTotal: summary.hiddenTotal,
  });

  refs.summaryCategories.innerHTML = '';
  const categoryOrder: AchievementCategory[] = [
    'harvest',
    'economy',
    'items',
    'events',
    'research',
    'prestige',
    'builds',
    'seasons',
    'challenges',
    'cosmetics',
  ];
  for (const category of categoryOrder) {
    const categorySummary = summary.categories[category];
    if (!categorySummary) {
      continue;
    }
    const chip = document.createElement('span');
    chip.className = 'achievement-summary__category';
    chip.textContent = `${t(state.locale, `achievements.category.${category}`)} ${categorySummary.unlocked}/${categorySummary.total}`;
    refs.summaryCategories.appendChild(chip);
  }
}

function rarityRank(rarity: AchievementDefinition['rarity']): number {
  switch (rarity) {
    case 'legendary':
      return 4;
    case 'epic':
      return 3;
    case 'rare':
      return 2;
    default:
      return 1;
  }
}

function shouldShow(
  filter: UIRefs['sidePanel']['achievements']['activeFilter'],
  unlocked: boolean,
  near: boolean,
  hidden: boolean,
): boolean {
  switch (filter) {
    case 'unlocked':
      return unlocked;
    case 'near':
      return near;
    case 'hidden':
      return hidden;
    default:
      return !hidden || unlocked;
  }
}
