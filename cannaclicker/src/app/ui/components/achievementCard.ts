import { uiIcons } from '../../assetManifest';
import { createItemSrcset } from './media';
import type { AchievementDefinition } from '../../../data/achievements';
import type { AchievementCardRefs } from '../types';

export function createAchievementCard(definition: AchievementDefinition): AchievementCardRefs {
  const container = document.createElement('article');
  container.className = 'achievement-card surface--reward';

  const badge = document.createElement('div');
  badge.className = 'achievement-card__badge';

  const base = new Image();
  base.src = uiIcons.achievementBase;
  base.srcset = createItemSrcset(uiIcons.achievementBase);
  base.alt = '';
  base.decoding = 'async';
  base.className = 'achievement-card__badge-base';

  const overlay = new Image();
  overlay.src = definition.overlayIcon;
  overlay.srcset = createItemSrcset(definition.overlayIcon);
  overlay.alt = '';
  overlay.decoding = 'async';
  overlay.className = 'achievement-card__badge-overlay';

  const ribbon = new Image();
  ribbon.src = uiIcons.achievementRibbon;
  ribbon.srcset = createItemSrcset(uiIcons.achievementRibbon);
  ribbon.alt = '';
  ribbon.decoding = 'async';
  ribbon.className = 'achievement-card__badge-ribbon';

  badge.append(base, overlay, ribbon);
  container.appendChild(badge);

  const content = document.createElement('div');
  content.className = 'achievement-card__content';

  const category = document.createElement('span');
  category.className = 'achievement-card__category';
  content.appendChild(category);

  const title = document.createElement('h3');
  title.className = 'achievement-card__title';
  content.appendChild(title);

  const description = document.createElement('p');
  description.className = 'achievement-card__description';
  content.appendChild(description);

  const flavor = document.createElement('p');
  flavor.className = 'achievement-card__flavor';
  content.appendChild(flavor);

  const progress = document.createElement('div');
  progress.className = 'achievement-card__progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'achievement-card__progress-bar';
  progress.appendChild(progressBar);
  content.appendChild(progress);

  const progressText = document.createElement('p');
  progressText.className = 'achievement-card__progress-text';
  content.appendChild(progressText);

  const reward = document.createElement('p');
  reward.className = 'achievement-card__reward';
  content.appendChild(reward);

  const status = document.createElement('span');
  status.className = 'achievement-card__status';
  content.appendChild(status);

  container.appendChild(content);

  return {
    container,
    iconBase: base,
    iconOverlay: overlay,
    category,
    title,
    description,
    flavor,
    reward,
    status,
    progressBar,
    progressText,
  } satisfies AchievementCardRefs;
}
