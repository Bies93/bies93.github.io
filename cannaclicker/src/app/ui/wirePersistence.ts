import { exportSave, importSave, clearSave, save } from '../save';
import { createDefaultState } from '../state';
import { isMotionIntensity, isPlantSkin, isUiTheme, normaliseVolume } from '../settings';
import { recalcDerivedValues, evaluateAchievements } from '../game';
import { updateStrings } from './updaters/strings';
import type { WireContext } from './wire';

export function wirePersistence(context: WireContext): void {
  const { refs, state, audio, render } = context;

  const handleMute = () => {
    state.muted = audio.toggleMute();
    audio.playSettings();
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
      audio.setVolume(state.settings.sfxVolume);
      audio.setMusicEnabled(state.settings.musicEnabled);
      audio.setMusicVolume(state.settings.musicVolume);
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
    audio.setMusicEnabled(state.settings.musicEnabled);
    audio.setMusicVolume(state.settings.musicVolume);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    render(state);
  };

  refs.controls.mute.button.addEventListener('click', handleMute);
  refs.controls.export.button.addEventListener('click', handleExport);
  refs.controls.import.button.addEventListener('click', handleImport);
  refs.controls.reset.button.addEventListener('click', handleReset);

  refs.sidePanel.settings.soundButton.addEventListener('click', handleMute);
  refs.sidePanel.settings.sfxVolumeInput.addEventListener('input', (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    state.settings.sfxVolume = normaliseVolume(value / 100, 0.8);
    audio.setVolume(state.settings.sfxVolume);
    render(state);
  });
  refs.sidePanel.settings.sfxVolumeInput.addEventListener('change', () => {
    audio.playSettings();
    save(state);
  });
  refs.sidePanel.settings.musicToggle.addEventListener('change', (event) => {
    state.settings.musicEnabled = (event.target as HTMLInputElement).checked;
    audio.setMusicEnabled(state.settings.musicEnabled);
    audio.playSettings();
    render(state);
    save(state);
  });
  refs.sidePanel.settings.musicVolumeInput.addEventListener('input', (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    state.settings.musicVolume = normaliseVolume(value / 100, 0.45);
    audio.setMusicVolume(state.settings.musicVolume);
    render(state);
  });
  refs.sidePanel.settings.musicVolumeInput.addEventListener('change', () => {
    audio.playSettings();
    save(state);
  });
  refs.sidePanel.settings.exportButton.addEventListener('click', handleExport);
  refs.sidePanel.settings.importButton.addEventListener('click', handleImport);
  refs.sidePanel.settings.resetButton.addEventListener('click', handleReset);
  refs.sidePanel.settings.offlineToggle.addEventListener('change', (event) => {
    state.settings.showOfflineEarnings = (event.target as HTMLInputElement).checked;
    audio.playSettings();
    render(state);
    save(state);
  });
  refs.sidePanel.settings.motionSelect.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    state.settings.motionIntensity = isMotionIntensity(value) ? value : 'full';
    audio.playSettings();
    render(state);
    save(state);
  });
  refs.sidePanel.settings.themeSelect.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    state.settings.uiTheme = isUiTheme(value) ? value : 'botanical';
    audio.playSettings();
    render(state);
    save(state);
  });
  refs.sidePanel.settings.plantSkinSelect.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    state.settings.plantSkin = isPlantSkin(value) ? value : 'classic';
    audio.playSettings();
    render(state);
    save(state);
  });
}
