import Decimal from 'break_infinity.js';

import { plantStages } from '../../assetManifest';
import type { GameState } from '../../state';
import type { UIRefs } from '../types';

const PLANT_STAGE_THRESHOLDS = [
  0, 50, 250, 1_000, 5_000, 25_000, 100_000, 500_000, 2_500_000, 10_000_000, 50_000_000,
];
const PLANT_STAGE_MAX = PLANT_STAGE_THRESHOLDS.length - 1;
const preloadedPlantStages = new Set<string>();

function resolvePlantStage(total: Decimal): number {
  const totalValue = total.toNumber();
  if (!Number.isFinite(totalValue)) {
    return PLANT_STAGE_MAX;
  }

  let stage = 0;
  for (let i = 0; i < PLANT_STAGE_THRESHOLDS.length; i += 1) {
    if (totalValue >= PLANT_STAGE_THRESHOLDS[i]) {
      stage = i;
    }
  }

  return Math.min(stage, PLANT_STAGE_MAX);
}

export function plantStageAsset(stage: number): string {
  const clamped = Math.max(0, Math.min(stage, PLANT_STAGE_MAX));
  return plantStages[clamped] ?? plantStages[0];
}

export function preloadPlantStage(stage: number): void {
  const clamped = Math.max(0, Math.min(stage, PLANT_STAGE_MAX));
  const assetPath = plantStageAsset(clamped);
  if (preloadedPlantStages.has(assetPath)) {
    return;
  }

  const image = new Image();
  image.src = assetPath;
  preloadedPlantStages.add(assetPath);
}

function triggerPlantStageAnimation(icon: HTMLDivElement): void {
  icon.classList.add('is-upgrading');
  window.setTimeout(() => {
    icon.classList.remove('is-upgrading');
  }, 600);
}

export function updatePlantStage(state: GameState, refs: UIRefs): void {
  const nextStage = resolvePlantStage(state.prestige.lifetimeBuds);
  const currentStage = Number(refs.clickIcon.dataset.stage ?? '0');

  if (currentStage === nextStage) {
    return;
  }

  refs.clickIcon.dataset.stage = nextStage.toString();
  preloadPlantStage(nextStage);
  preloadPlantStage(nextStage + 1);
  const assetPath = plantStageAsset(nextStage);
  refs.clickIcon.style.setProperty('background-image', `url("${assetPath}")`);
  triggerPlantStageAnimation(refs.clickIcon);
}
