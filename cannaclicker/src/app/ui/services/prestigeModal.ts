import { computePrestigeMultiplier, getPrestigePreview, performPrestige } from '../../prestige';
import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { formatInteger } from '../utils/format';
import type { UIRefs } from '../types';

let prestigeOpen = false;
let prestigeAcknowledged = false;

export function openPrestigeModal(refs: UIRefs, state: GameState): void {
  prestigeOpen = true;
  prestigeAcknowledged = false;
  refs.prestigeModal.checkbox.checked = false;
  refs.prestigeModal.overlay?.classList.remove('hidden');
  refs.prestigeModal.overlay?.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => refs.prestigeModal.overlay?.classList.add('visible'));
  updatePrestigeModal(refs, state);
}

export function closePrestigeModal(refs: UIRefs): void {
  prestigeOpen = false;
  prestigeAcknowledged = false;
  refs.prestigeModal.checkbox.checked = false;
  refs.prestigeModal.overlay?.classList.remove('visible');
  refs.prestigeModal.overlay?.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    refs.prestigeModal.overlay?.classList.add('hidden');
  }, 200);
}

export function updatePrestigeModal(refs: UIRefs, state: GameState): void {
  const preview = getPrestigePreview(state);
  const modal = refs.prestigeModal;
  const nextMultiplier = computePrestigeMultiplier(preview.seedsAfter);

  modal.previewCurrentValue.textContent = formatInteger(state.locale, preview.seedsBefore);
  modal.previewAfterValue.textContent = formatInteger(state.locale, preview.seedsAfter);
  modal.previewGainValue.textContent = `+${formatInteger(state.locale, preview.seedGain)}`;
  modal.previewBonusValue.textContent = t(state.locale, 'prestige.modal.requirementProgressValue', {
    current: formatDecimal(preview.lifetimeBuds),
    target: formatDecimal(preview.nextSeedTarget),
  });
  modal.warning.textContent = t(state.locale, 'prestige.modal.globalBonusValue', {
    multiplier: nextMultiplier.toFixed(2),
  });

  modal.checkbox.checked = prestigeAcknowledged;

  const status = preview.requirementMet
    ? ''
    : t(state.locale, 'prestige.modal.requirementHint', {
        target: formatDecimal(preview.requirementTarget),
        current: formatDecimal(preview.lifetimeBuds),
      });

  modal.statusLabel.textContent = status;
  modal.statusLabel.classList.toggle('hidden', status.length === 0);

  modal.confirmButton.disabled = !prestigeAcknowledged || !preview.requirementMet;
}

export function setPrestigeAcknowledged(value: boolean): void {
  prestigeAcknowledged = value;
}

export function hasPrestigeAcknowledged(): boolean {
  return prestigeAcknowledged;
}

export function isPrestigeModalOpen(): boolean {
  return prestigeOpen;
}

export function performPrestigeAction(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  if (!prestigeAcknowledged || !preview.requirementMet) {
    return;
  }

  performPrestige(state);
  state.temp.needsRecalc = true;
  closePrestigeModal(refs);
}
