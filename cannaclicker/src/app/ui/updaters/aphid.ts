import { ensureAphidState } from '../../aphid';
import { t } from '../../i18n';
import type { GameState } from '../../state';
import type { UIRefs } from '../types';

const DEFEAT_VISIBLE_MS = 650;

export function updateAphid(state: GameState, refs: UIRefs): void {
  const aphid = ensureAphidState(state);
  const now = Date.now();
  const recentlyDefeated =
    !aphid.active && aphid.defeatedAt > 0 && now - aphid.defeatedAt < DEFEAT_VISIBLE_MS;
  const visible = aphid.active || recentlyDefeated;

  refs.aphidButton.hidden = !visible;
  refs.aphidButton.disabled = !aphid.active;
  refs.aphidButton.classList.toggle('is-active', aphid.active);
  refs.aphidButton.classList.toggle('is-defeated', recentlyDefeated);
  refs.aphidButton.style.setProperty('--aphid-x', `${aphid.xPercent}%`);
  refs.aphidButton.style.setProperty('--aphid-y', `${aphid.yPercent}%`);
  refs.aphidButton.dataset.hitsRemaining = String(aphid.hitsRemaining);
  refs.aphidButton.dataset.totalHits = String(aphid.totalHits);
  refs.root.dataset.aphid = aphid.active ? 'active' : recentlyDefeated ? 'defeated' : 'none';

  if (!visible) {
    refs.aphidHits.replaceChildren();
    refs.aphidButton.setAttribute('aria-hidden', 'true');
    return;
  }

  refs.aphidButton.setAttribute('aria-hidden', 'false');
  refs.aphidButton.setAttribute(
    'aria-label',
    aphid.active
      ? t(state.locale, 'pests.aphid.aria', { hits: aphid.hitsRemaining })
      : t(state.locale, 'pests.aphid.defeated'),
  );

  refs.aphidHits.replaceChildren(
    ...Array.from({ length: aphid.totalHits }, (_, index) => {
      const dot = document.createElement('span');
      dot.className = 'aphid-pest__hit';
      dot.dataset.used = index < aphid.totalHits - aphid.hitsRemaining ? 'true' : 'false';
      return dot;
    }),
  );
}
