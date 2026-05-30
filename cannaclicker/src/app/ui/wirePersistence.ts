import { exportSave, importSave, clearSave } from '../save';
import { createDefaultState } from '../state';
import { recalcDerivedValues, evaluateAchievements } from '../game';
import { updateStrings } from './updaters/strings';
import type { WireContext } from './wire';

export function wirePersistence(context: WireContext): void {
  const { refs, state, audio, render } = context;

  const handleMute = () => {
    state.muted = audio.toggleMute();
    updateStrings(state, refs);
  };

  const handleExport = async () => {
    const payload = exportSave(state);
    try {
      await navigator.clipboard.writeText(payload);
      alert('Save kopiert.');
    } catch {
      window.prompt('Save kopieren:', payload);
    }
  };

  const handleImport = () => {
    const payload = window.prompt('Bitte Base64-Spielstand einfügen:');
    if (!payload) {
      return;
    }

    try {
      const nextState = importSave(payload);
      Object.assign(state, nextState);
      recalcDerivedValues(state);
      evaluateAchievements(state);
      audio.setMuted(state.muted);
      render(state);
    } catch (error) {
      console.error(error);
      alert('Import fehlgeschlagen.');
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm('Spielstand wirklich löschen?');
    if (!confirmReset) {
      return;
    }

    clearSave();
    const fresh = createDefaultState({ locale: state.locale, muted: state.muted });
    Object.assign(state, fresh);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    render(state);
  };

  refs.controls.mute.button.addEventListener('click', handleMute);
  refs.controls.export.button.addEventListener('click', handleExport);
  refs.controls.import.button.addEventListener('click', handleImport);
  refs.controls.reset.button.addEventListener('click', handleReset);

  refs.sidePanel.settings.soundButton.addEventListener('click', handleMute);
  refs.sidePanel.settings.exportButton.addEventListener('click', handleExport);
  refs.sidePanel.settings.importButton.addEventListener('click', handleImport);
  refs.sidePanel.settings.resetButton.addEventListener('click', handleReset);
  refs.sidePanel.settings.offlineToggle.addEventListener('change', (event) => {
    state.settings.showOfflineEarnings = (event.target as HTMLInputElement).checked;
    render(state);
  });
}
