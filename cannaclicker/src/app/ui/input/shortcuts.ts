import type { AbilityId, GameState } from '../../state';
import { activateAbility } from '../../abilities';
import { evaluateAchievements, recalcDerivedValues } from '../../game';
import type { AudioManager } from '../../audio';
import type { UIRefs } from '../types';
import { closePrestigeModal, isPrestigeModalOpen } from '../services/prestigeModal';

interface ShortcutContext {
  refs: UIRefs;
  render(state: GameState): void;
  state: GameState;
  audio: AudioManager;
}

let context: ShortcutContext | null = null;

export function attachGlobalShortcuts(ui: { refs: UIRefs; render(state: GameState): void }, state: GameState, audio: AudioManager): void {
  context = { refs: ui.refs, render: ui.render, state, audio };
  window.addEventListener('keydown', handleKeydown, { passive: false });
}

export function triggerAbility(id: AbilityId): void {
  if (!context) {
    return;
  }

  const { state, render } = context;
  if (!activateAbility(state, id)) {
    return;
  }

  recalcDerivedValues(state);
  evaluateAchievements(state);
  render(state);
}

function handleKeydown(event: KeyboardEvent): void {
  if (!context || event.repeat) {
    return;
  }

  const { refs } = context;
  const target = event.target as HTMLElement | null;
  const tagName = target?.tagName;
  const isTextInput =
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    target?.getAttribute('contenteditable') === 'true';

  if ((event.code === 'Space' || event.code === 'Enter') && !isTextInput) {
    event.preventDefault();
    refs.clickButton.click();
    return;
  }

  if (event.code === 'Escape' && isPrestigeModalOpen()) {
    event.preventDefault();
    closePrestigeModal(refs);
    return;
  }

  if (isTextInput) {
    return;
  }

  if (event.code === 'KeyQ') {
    event.preventDefault();
    triggerAbility('overdrive');
    return;
  }

  if (event.code === 'KeyE') {
    event.preventDefault();
    triggerAbility('burst');
    return;
  }
}
