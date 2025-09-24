import { getPrestigePreview, performPrestige } from '../../prestige';
import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import {
  formatActiveKickstartSummary,
  formatNextKickstartSummary,
  formatPermanentBonusSummary,
} from '../utils/format';
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

  modal.previewCurrentValue.textContent = formatPermanentBonusSummary(state.locale, preview);
  modal.previewAfterValue.textContent = formatNextKickstartSummary(state.locale, preview);
  modal.previewGainValue.textContent = formatActiveKickstartSummary(state.locale, preview);
  modal.previewBonusValue.textContent = t(state.locale, 'prestige.modal.requirementProgressValue', {
    current: formatDecimal(preview.lifetimeBuds),
    target: formatDecimal(preview.requirementTarget),
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
