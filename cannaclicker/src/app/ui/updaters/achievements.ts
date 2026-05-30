import { t } from '../../i18n';
import type { GameState } from '../../state';
import { achievements } from '../../../data/achievements';
import { getAchievementProgress } from '../../achievements';
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

  achievementRefs.filters.forEach((button, key) => {
    const active = key === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

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

    if (definition.rewardMultiplier) {
      const percent = Math.round((definition.rewardMultiplier - 1) * 100);
      card.reward.textContent = t(state.locale, 'achievements.reward', { value: percent });
      card.reward.classList.remove('hidden');
    } else {
      card.reward.textContent = '';
      card.reward.classList.add('hidden');
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
      if (initialised && showToast) {
        showToast({
          title: t(state.locale, 'achievements.toast.title'),
          message: definition.name[state.locale],
        });
      }
      seenUnlocked.add(definition.id);
    }
  });

  initialised = true;
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
