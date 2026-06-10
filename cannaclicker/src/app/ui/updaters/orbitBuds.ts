import { clickerFxAssets } from '../../assetManifest';
import type { GameState } from '../../state';
import type { UIRefs } from '../types';

const ORBIT_VISIBLE_CAP = 24;
const LINEAR_VISIBLE_LIMIT = 12;
const ORBIT_DURATION_SECONDS = 52;

function getVisibleBudCount(state: GameState): number {
  const owned = Math.max(0, Math.floor(state.items.seedling ?? 0));
  if (owned <= 0) {
    return 0;
  }
  if (owned <= LINEAR_VISIBLE_LIMIT) {
    return owned;
  }
  return Math.min(
    ORBIT_VISIBLE_CAP,
    LINEAR_VISIBLE_LIMIT + Math.floor(Math.sqrt(owned - LINEAR_VISIBLE_LIMIT)),
  );
}

export function updateOrbitBuds(state: GameState, refs: UIRefs): void {
  const visible = getVisibleBudCount(state);
  const current = Number(refs.orbitLayer.dataset.count ?? '0');
  refs.orbitLayer.style.setProperty('--orbit-bud-image', `url("${clickerFxAssets.orbitBud}")`);

  if (current === visible) {
    return;
  }

  refs.orbitLayer.dataset.count = visible.toString();
  refs.orbitLayer.replaceChildren();
  refs.orbitLayer.classList.toggle('is-empty', visible === 0);

  if (visible === 0) {
    return;
  }

  for (let index = 0; index < visible; index += 1) {
    const bud = document.createElement('span');
    const angle = (360 / visible) * index;
    const scale = 0.78 + (index % 5) * 0.045;
    const opacity = 0.78 + (index % 4) * 0.045;

    bud.className = 'click-orbit__bud';
    bud.style.setProperty('--orbit-angle', `${angle.toFixed(3)}deg`);
    bud.style.setProperty('--orbit-scale', scale.toFixed(2));
    bud.style.setProperty('--orbit-opacity', Math.min(opacity, 0.96).toFixed(2));
    bud.style.setProperty('--orbit-duration', `${ORBIT_DURATION_SECONDS}s`);
    refs.orbitLayer.appendChild(bud);
  }
}
