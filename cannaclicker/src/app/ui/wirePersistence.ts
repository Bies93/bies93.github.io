import { exportSave, importSave, clearSave, save } from '../save';
import { createDefaultState } from '../state';
import { isMotionIntensity, isPlantSkin, isUiTheme, normaliseVolume } from '../settings';
import { recalcDerivedValues, evaluateAchievements } from '../game';
import { t } from '../i18n';
import { updateStrings } from './updaters/strings';
import { openActionModal } from './services/modal';
import { showToast } from './services/toast';
import type { WireContext } from './wire';

export function wirePersistence(context: WireContext): void {
  const { refs, state, audio, render } = context;

  const handleMute = () => {
    state.muted = audio.toggleMute();
    audio.playSettings();
    updateStrings(state, refs);
    save(state);
  };

  const handleExport = () => {
    const payload = exportSave(state);
    const body = document.createElement('div');
    body.className = 'save-modal-body';

    const textarea = document.createElement('textarea');
    textarea.className = 'save-modal-textarea';
    textarea.readOnly = true;
    textarea.value = payload;
    textarea.setAttribute('aria-label', t(state.locale, 'modal.export.title'));

    const status = document.createElement('p');
    status.className = 'save-modal-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    body.append(textarea, status);

    openActionModal({
      title: t(state.locale, 'modal.export.title'),
      description: t(state.locale, 'modal.export.description'),
      body,
      actions: [
        {
          label: t(state.locale, 'actions.close'),
          variant: 'secondary',
        },
        {
          label: t(state.locale, 'modal.export.download'),
          variant: 'secondary',
          closeOnClick: false,
          onClick: () => {
            downloadSaveFile(payload);
          },
        },
        {
          label: t(state.locale, 'modal.export.copy'),
          variant: 'primary',
          autoFocus: true,
          closeOnClick: false,
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(payload);
              status.textContent = t(state.locale, 'modal.export.copied');
            } catch {
              textarea.focus();
              textarea.select();
              status.textContent = t(state.locale, 'modal.export.copyFailed');
            }
          },
        },
      ],
    });
  };

  const handleImport = () => {
    const body = document.createElement('div');
    body.className = 'save-modal-body';

    const textarea = document.createElement('textarea');
    textarea.className = 'save-modal-textarea';
    textarea.placeholder = t(state.locale, 'modal.import.placeholder');
    textarea.setAttribute('aria-label', t(state.locale, 'modal.import.hint'));

    const hint = document.createElement('p');
    hint.className = 'save-modal-hint';
    hint.textContent = t(state.locale, 'modal.import.hint');

    const status = document.createElement('p');
    status.className = 'save-modal-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    body.append(textarea, hint, status);

    openActionModal({
      title: t(state.locale, 'modal.import.title'),
      description: t(state.locale, 'modal.import.description'),
      body,
      closeOnBackdrop: false,
      actions: [
        {
          label: t(state.locale, 'actions.cancel'),
          variant: 'secondary',
        },
        {
          label: t(state.locale, 'modal.import.confirm'),
          variant: 'primary',
          autoFocus: true,
          closeOnClick: false,
          onClick: (handle) => {
            const payload = textarea.value.trim();
            if (!payload) {
              status.textContent = t(state.locale, 'modal.import.error');
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
              showToast({
                title: t(state.locale, 'modal.import.title'),
                message: t(state.locale, 'modal.import.success'),
                tone: 'success',
              });
              handle.close();
            } catch {
              status.textContent = t(state.locale, 'modal.import.error');
            }
          },
        },
      ],
    });
  };

  const handleReset = () => {
    const body = document.createElement('div');
    body.className = 'save-modal-body';

    const warningList = document.createElement('ul');
    warningList.className = 'save-modal-warning-list';
    for (const key of ['modal.reset.warning.items', 'modal.reset.warning.keep']) {
      const item = document.createElement('li');
      item.textContent = t(state.locale, key);
      warningList.appendChild(item);
    }

    const input = document.createElement('input');
    input.className = 'save-modal-input';
    input.placeholder = t(state.locale, 'modal.reset.placeholder');
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', t(state.locale, 'modal.reset.description'));

    const phrase = t(state.locale, 'modal.reset.phrase');

    body.append(warningList, input);

    const modal = openActionModal({
      title: t(state.locale, 'modal.reset.title'),
      description: t(state.locale, 'modal.reset.description'),
      body,
      tone: 'danger',
      closeOnBackdrop: false,
      actions: [
        {
          label: t(state.locale, 'actions.cancel'),
          variant: 'secondary',
          autoFocus: true,
        },
        {
          label: t(state.locale, 'modal.reset.confirm'),
          variant: 'danger',
          closeOnClick: true,
          disabled: true,
          onClick: () => {
            clearSave();
            const fresh = createDefaultState({ locale: state.locale, muted: state.muted });
            Object.assign(state, fresh);
            audio.setMuted(state.muted);
            audio.setMusicEnabled(state.settings.musicEnabled);
            audio.setMusicVolume(state.settings.musicVolume);
            recalcDerivedValues(state);
            evaluateAchievements(state);
            render(state);
            showToast({
              title: t(state.locale, 'modal.reset.title'),
              message: t(state.locale, 'modal.reset.done'),
              tone: 'warning',
            });
          },
        },
      ],
    });

    const confirmButton = modal.actions[1];
    input.addEventListener('input', () => {
      if (confirmButton) {
        confirmButton.disabled = input.value.trim() !== phrase;
      }
    });
  };

  const handleMenu = () => {
    audio.playUi();
    openActionModal({
      title: t(state.locale, 'settings.modal.title'),
      description: t(state.locale, 'settings.modal.description'),
      body: refs.sidePanel.settings.container,
      actions: [
        {
          label: t(state.locale, 'actions.close'),
          variant: 'primary',
        },
      ],
    });
  };

  refs.controls.mute.button.addEventListener('click', handleMute);
  refs.controls.export.button.addEventListener('click', handleExport);
  refs.controls.import.button.addEventListener('click', handleImport);
  refs.controls.reset.button.addEventListener('click', handleReset);
  refs.controls.menu.button.addEventListener('click', handleMenu);

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

function downloadSaveFile(payload: string): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `cannabies-save-${stamp}.txt`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
