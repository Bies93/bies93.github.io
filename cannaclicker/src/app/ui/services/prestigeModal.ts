import { computePrestigeMultiplier, getPrestigePreview, performPrestige } from '../../prestige';
import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { formatInteger } from '../utils/format';
import type { UIRefs } from '../types';

let prestigeOpen = false;
let prestigeAcknowledged = false;
let previouslyFocused: HTMLElement | null = null;

export function openPrestigeModal(refs: UIRefs, state: GameState): void {
  prestigeOpen = true;
  prestigeAcknowledged = false;
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  refs.prestigeModal.checkbox.checked = false;
  refs.prestigeModal.overlay?.classList.remove('hidden');
  refs.prestigeModal.overlay?.setAttribute('aria-hidden', 'false');
  window.addEventListener('keydown', handlePrestigeKeydown, true);
  requestAnimationFrame(() => {
    refs.prestigeModal.overlay?.classList.add('visible');
    refs.prestigeModal.checkbox.focus();
  });
  updatePrestigeModal(refs, state);
}

export function closePrestigeModal(refs: UIRefs): void {
  prestigeOpen = false;
  prestigeAcknowledged = false;
  refs.prestigeModal.checkbox.checked = false;
  window.removeEventListener('keydown', handlePrestigeKeydown, true);
  refs.prestigeModal.overlay?.classList.remove('visible');
  refs.prestigeModal.overlay?.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    refs.prestigeModal.overlay?.classList.add('hidden');
    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  }, 200);
}

export function updatePrestigeModal(refs: UIRefs, state: GameState): void {
  const preview = getPrestigePreview(state);
  const modal = refs.prestigeModal;
  const nextMultiplier = computePrestigeMultiplier(preview.totalSeedsAfter);

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

export function performPrestigeAction(state: GameState, refs: UIRefs): boolean {
  const preview = getPrestigePreview(state);
  if (!prestigeAcknowledged || !preview.requirementMet) {
    return false;
  }

  performPrestige(state);
  state.temp.needsRecalc = true;
  closePrestigeModal(refs);
  return true;
}

function handlePrestigeKeydown(event: KeyboardEvent): void {
  if (!prestigeOpen) {
    return;
  }

  const dialog = document.querySelector<HTMLElement>('.modal-overlay.visible .modal-card');
  if (!dialog) {
    return;
  }

  if (event.code === 'Escape') {
    event.preventDefault();
    const refs = getPrestigeRefsFromDialog(dialog);
    refs?.cancelButton.click();
    return;
  }

  if (event.code !== 'Tab') {
    return;
  }

  const focusable = getFocusable(dialog);
  if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const nextIndex = event.shiftKey
    ? currentIndex <= 0
      ? focusable.length - 1
      : currentIndex - 1
    : currentIndex === focusable.length - 1
      ? 0
      : currentIndex + 1;

  event.preventDefault();
  focusable[nextIndex]?.focus();
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function getPrestigeRefsFromDialog(dialog: HTMLElement): Pick<UIRefs['prestigeModal'], 'cancelButton'> | null {
  const cancelButton = dialog.querySelector<HTMLButtonElement>('.modal-button.secondary');
  return cancelButton ? { cancelButton } : null;
}
