import { clickerFxAssets } from '../../assetManifest';
import type { GameState } from '../../state';
import type { UIRefs } from '../types';

const ORBIT_VISIBLE_CAP = 200;
const ORBIT_DURATION_SECONDS = 52;
const RING_RADII = [
  ['var(--orbit-radius)'],
  ['clamp(3.3rem, 8.1vw, 6.1rem)', 'var(--orbit-radius)'],
  ['clamp(2.7rem, 6.5vw, 5rem)', 'clamp(3.7rem, 8.7vw, 6.8rem)', 'var(--orbit-radius)'],
  [
    'clamp(2.3rem, 5.2vw, 4rem)',
    'clamp(3.2rem, 7.2vw, 5.6rem)',
    'clamp(4.1rem, 9.2vw, 7.1rem)',
    'var(--orbit-radius)',
  ],
] as const;

function getVisibleBudCount(state: GameState): number {
  const owned = Math.max(0, Math.floor(state.items.seedling ?? 0));
  return Math.min(ORBIT_VISIBLE_CAP, owned);
}

function getRingCount(visible: number): number {
  if (visible <= 24) {
    return 1;
  }
  if (visible <= 60) {
    return 2;
  }
  if (visible <= 120) {
    return 3;
  }
  return 4;
}

function getDensity(visible: number): string {
  if (visible <= 24) {
    return 'low';
  }
  if (visible <= 60) {
    return 'medium';
  }
  if (visible <= 120) {
    return 'high';
  }
  return 'max';
}

export function updateOrbitBuds(state: GameState, refs: UIRefs): void {
  const visible = getVisibleBudCount(state);
  const current = Number(refs.orbitLayer.dataset.count ?? '0');
  refs.orbitLayer.style.setProperty('--orbit-bud-image', `url("${clickerFxAssets.orbitBud}")`);
  refs.orbitLayer.style.setProperty(
    '--orbit-bud-gold-image',
    `url("${clickerFxAssets.orbitBudGold}")`,
  );
  refs.orbitLayer.style.setProperty(
    '--orbit-bud-shadow-image',
    `url("${clickerFxAssets.orbitBudShadow}")`,
  );

  if (current === visible) {
    return;
  }

  refs.orbitLayer.dataset.count = visible.toString();
  refs.orbitLayer.dataset.density = getDensity(visible);
  refs.orbitLayer.replaceChildren();
  refs.orbitLayer.classList.toggle('is-empty', visible === 0);

  if (visible === 0) {
    return;
  }

  const ringCount = getRingCount(visible);
  const ringRadii = RING_RADII[ringCount - 1];
  const baseRingSize = Math.floor(visible / ringCount);
  const remainder = visible % ringCount;

  let globalIndex = 0;
  for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
    const ringSize = baseRingSize + (ringIndex < remainder ? 1 : 0);
    const phase = (ringIndex * 360) / Math.max(visible, 1);

    for (let ringItem = 0; ringItem < ringSize; ringItem += 1) {
      const bud = document.createElement('span');
      const angle = (360 / ringSize) * ringItem + phase;
      const scale = 0.82 + (globalIndex % 5) * 0.035;
      const opacity = 0.68 + (globalIndex % 4) * 0.055;

      bud.className = 'click-orbit__bud';
      if ((globalIndex + 1) % 25 === 0) {
        bud.classList.add('click-orbit__bud--gold');
        bud.style.setProperty('--orbit-bud-image-local', `var(--orbit-bud-gold-image)`);
      }
      bud.style.setProperty('--orbit-angle', `${angle.toFixed(3)}deg`);
      bud.style.setProperty('--orbit-radius-local', ringRadii[ringIndex]);
      bud.style.setProperty('--orbit-scale', scale.toFixed(2));
      bud.style.setProperty('--orbit-opacity', Math.min(opacity, 0.92).toFixed(2));
      bud.style.setProperty('--orbit-duration', `${ORBIT_DURATION_SECONDS + ringIndex * 9}s`);
      refs.orbitLayer.appendChild(bud);
      globalIndex += 1;
    }
  }
}
