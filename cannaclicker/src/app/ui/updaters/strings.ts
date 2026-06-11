import type { GameState } from '../../state';
import { uiIcons } from '../../assetManifest';
import { t, type LocaleKey } from '../../i18n';
import { formatAbilityTooltip, getAbilityLabel } from '../../abilities';
import type { SidePanelTab, UIRefs } from '../types';

const STAT_META: Record<LocaleKey, Record<string, string>> = {
  de: {
    'stats.buds': 'Ausgabbarer Bestand',
    'stats.bps': 'Automatische Bud-Ernte',
    'stats.bpc': 'Ertrag pro Klick',
    'stats.total': 'Lebenszeit-Ernte',
    'stats.seeds': 'Für Research und Aufstieg',
    'stats.seedRate': '60-Minuten-Fenster',
    'stats.prestigeMult': 'Aktiver Bonus',
  },
  en: {
    'stats.buds': 'Spendable stock',
    'stats.bps': 'Automatic bud harvest',
    'stats.bpc': 'Yield per click',
    'stats.total': 'Lifetime harvest',
    'stats.seeds': 'For research and ascension',
    'stats.seedRate': '60-minute window',
    'stats.prestigeMult': 'Active boost',
  },
};

const SIDE_PANEL_TAB_KEYS: Record<SidePanelTab, string> = {
  shop: 'panel.tabs.shop',
  upgrades: 'panel.tabs.upgrades',
  research: 'panel.tabs.research',
  greenhouse: 'panel.tabs.greenhouse',
  prestige: 'panel.tabs.prestige',
  achievements: 'panel.tabs.achievements',
};

export function updateStrings(state: GameState, refs: UIRefs): void {
  document.body.dataset.motion = state.settings.motionIntensity;
  document.body.dataset.theme = state.settings.uiTheme;
  document.body.dataset.plantSkin = state.settings.plantSkin;
  refs.root.dataset.motion = state.settings.motionIntensity;
  refs.root.dataset.theme = state.settings.uiTheme;
  refs.root.dataset.plantSkin = state.settings.plantSkin;

  const appTitle = t(state.locale, 'app.title');
  refs.headerTitle.textContent = appTitle;
  refs.headerTitle.dataset.text = appTitle;
  refs.clickButton.setAttribute('aria-label', t(state.locale, 'actions.click'));
  refs.clickLabel.textContent = t(state.locale, 'actions.click');

  const muteAssets = state.muted
    ? { label: t(state.locale, 'actions.unmute'), icon: uiIcons.soundOn }
    : { label: t(state.locale, 'actions.mute'), icon: uiIcons.soundOff };

  refs.controls.mute.icon.src = muteAssets.icon;
  refs.controls.mute.label.textContent = muteAssets.label;
  refs.controls.mute.button.setAttribute('aria-label', muteAssets.label);
  refs.controls.mute.button.setAttribute('title', muteAssets.label);

  refs.controls.export.label.textContent = t(state.locale, 'actions.export');
  refs.controls.export.button.setAttribute('aria-label', t(state.locale, 'actions.export'));
  refs.controls.export.button.setAttribute('title', t(state.locale, 'actions.export'));

  refs.controls.import.label.textContent = t(state.locale, 'actions.import');
  refs.controls.import.button.setAttribute('aria-label', t(state.locale, 'actions.import'));
  refs.controls.import.button.setAttribute('title', t(state.locale, 'actions.import'));

  refs.controls.reset.label.textContent = t(state.locale, 'actions.reset');
  refs.controls.reset.button.setAttribute('aria-label', t(state.locale, 'actions.reset'));
  refs.controls.reset.button.setAttribute('title', t(state.locale, 'actions.reset'));

  refs.controls.menu.label.textContent = t(state.locale, 'actions.menu');
  refs.controls.menu.button.setAttribute('aria-label', t(state.locale, 'actions.menu'));
  refs.controls.menu.button.setAttribute('title', t(state.locale, 'actions.menu'));

  refs.statsLabels.forEach((label, key) => {
    label.textContent = t(state.locale, key);
  });

  refs.statsMeta.forEach((meta, key) => {
    if (key === 'stats.seedRate') {
      meta.textContent = t(state.locale, 'stats.seedRate.metaNoPassive');
    } else {
      meta.textContent = STAT_META[state.locale]?.[key] ?? '';
    }
  });

  refs.abilityTitle.textContent = t(state.locale, 'abilities.title');
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const labelText = getAbilityLabel(abilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId, state.locale);
    abilityRefs.container.setAttribute('aria-label', labelText);
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    const key = SIDE_PANEL_TAB_KEYS[tab];
    const label = t(state.locale, key);
    const labelNode = button.querySelector<HTMLElement>('.tab-button__label');
    if (labelNode) {
      labelNode.textContent = label;
    } else {
      button.textContent = label;
    }
    button.setAttribute('aria-label', label);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.textContent = t(state.locale, `research.filter.${key}`);
    button.setAttribute('aria-label', button.textContent ?? '');
  });

  refs.sidePanel.achievements.filters.forEach((button, key) => {
    button.textContent = t(state.locale, `achievements.filter.${key}`);
    button.setAttribute('aria-label', button.textContent ?? '');
  });

  refs.sidePanel.settings.offlineTitle.textContent = t(state.locale, 'settings.offline.title');
  refs.sidePanel.settings.offlineDescription.textContent = t(
    state.locale,
    'settings.offline.description',
  );
  refs.sidePanel.settings.offlineToggle.checked = state.settings.showOfflineEarnings;
  refs.sidePanel.settings.offlineToggle.setAttribute(
    'aria-label',
    t(state.locale, 'settings.offline.title'),
  );

  refs.sidePanel.settings.soundTitle.textContent = t(state.locale, 'settings.sound.title');
  refs.sidePanel.settings.soundDescription.textContent = state.muted
    ? t(state.locale, 'settings.sound.muted')
    : t(state.locale, 'settings.sound.enabled');
  refs.sidePanel.settings.soundButton.textContent = state.muted
    ? t(state.locale, 'actions.unmute')
    : t(state.locale, 'actions.mute');
  const sfxPercent = Math.round(state.settings.sfxVolume * 100);
  refs.sidePanel.settings.sfxVolumeTitle.textContent = t(state.locale, 'settings.sfxVolume.title');
  refs.sidePanel.settings.sfxVolumeDescription.textContent = t(
    state.locale,
    'settings.sfxVolume.description',
    { value: sfxPercent },
  );
  refs.sidePanel.settings.sfxVolumeInput.value = String(sfxPercent);
  refs.sidePanel.settings.sfxVolumeInput.setAttribute(
    'aria-label',
    t(state.locale, 'settings.sfxVolume.title'),
  );
  refs.sidePanel.settings.musicTitle.textContent = t(state.locale, 'settings.music.title');
  refs.sidePanel.settings.musicDescription.textContent = state.muted
    ? t(state.locale, 'settings.music.muted')
    : t(state.locale, 'settings.music.description');
  refs.sidePanel.settings.musicToggle.checked = state.settings.musicEnabled;
  refs.sidePanel.settings.musicToggle.setAttribute(
    'aria-label',
    t(state.locale, 'settings.music.title'),
  );
  const musicPercent = Math.round(state.settings.musicVolume * 100);
  refs.sidePanel.settings.musicVolumeTitle.textContent = t(
    state.locale,
    'settings.musicVolume.title',
  );
  refs.sidePanel.settings.musicVolumeDescription.textContent = t(
    state.locale,
    'settings.musicVolume.description',
    { value: musicPercent },
  );
  refs.sidePanel.settings.musicVolumeInput.value = String(musicPercent);
  refs.sidePanel.settings.musicVolumeInput.disabled = !state.settings.musicEnabled;
  refs.sidePanel.settings.musicVolumeInput.setAttribute(
    'aria-label',
    t(state.locale, 'settings.musicVolume.title'),
  );
  refs.sidePanel.settings.motionTitle.textContent = t(state.locale, 'settings.motion.title');
  refs.sidePanel.settings.motionDescription.textContent = t(
    state.locale,
    `settings.motion.description.${state.settings.motionIntensity}`,
  );
  refs.sidePanel.settings.motionSelect.value = state.settings.motionIntensity;
  refs.sidePanel.settings.motionSelect.setAttribute(
    'aria-label',
    t(state.locale, 'settings.motion.title'),
  );
  Array.from(refs.sidePanel.settings.motionSelect.options).forEach((option) => {
    option.textContent = t(state.locale, `settings.motion.option.${option.value}`);
  });
  refs.sidePanel.settings.themeTitle.textContent = t(state.locale, 'settings.theme.title');
  refs.sidePanel.settings.themeDescription.textContent = t(
    state.locale,
    `settings.theme.description.${state.settings.uiTheme}`,
  );
  refs.sidePanel.settings.themeSelect.value = state.settings.uiTheme;
  refs.sidePanel.settings.themeSelect.setAttribute(
    'aria-label',
    t(state.locale, 'settings.theme.title'),
  );
  Array.from(refs.sidePanel.settings.themeSelect.options).forEach((option) => {
    option.textContent = t(state.locale, `settings.theme.option.${option.value}`);
  });
  refs.sidePanel.settings.plantSkinTitle.textContent = t(state.locale, 'settings.plantSkin.title');
  refs.sidePanel.settings.plantSkinDescription.textContent = t(
    state.locale,
    `settings.plantSkin.description.${state.settings.plantSkin}`,
  );
  refs.sidePanel.settings.plantSkinSelect.value = state.settings.plantSkin;
  refs.sidePanel.settings.plantSkinSelect.setAttribute(
    'aria-label',
    t(state.locale, 'settings.plantSkin.title'),
  );
  Array.from(refs.sidePanel.settings.plantSkinSelect.options).forEach((option) => {
    option.textContent = t(state.locale, `settings.plantSkin.option.${option.value}`);
  });
  refs.sidePanel.prestige.description.textContent = t(state.locale, 'panel.prestige.description');
  refs.sidePanel.prestige.spendableSeedsLabel.textContent = t(
    state.locale,
    'panel.prestige.spendableSeeds',
  );
  refs.sidePanel.prestige.totalSeedsLabel.textContent = t(
    state.locale,
    'panel.prestige.totalSeeds',
  );
  refs.sidePanel.prestige.permanentLabel.textContent = t(state.locale, 'panel.prestige.permanent');
  refs.sidePanel.prestige.kickstartLabel.textContent = t(
    state.locale,
    'panel.prestige.kickstartNext',
  );
  refs.sidePanel.prestige.activeKickstartLabel.textContent = t(
    state.locale,
    'panel.prestige.kickstartActive',
  );
  refs.sidePanel.prestige.actionButton.textContent = t(state.locale, 'actions.prestige');

  refs.prestigeModal.title.textContent = t(state.locale, 'prestige.modal.title');
  refs.prestigeModal.description.textContent = t(state.locale, 'prestige.modal.description');
  refs.prestigeModal.warning.textContent = t(state.locale, 'prestige.modal.warning');
  refs.prestigeModal.previewCurrentLabel.textContent = t(
    state.locale,
    'prestige.modal.currentSeeds',
  );
  refs.prestigeModal.previewAfterLabel.textContent = t(state.locale, 'prestige.modal.afterSeeds');
  refs.prestigeModal.previewGainLabel.textContent = t(state.locale, 'prestige.modal.gainSeeds');
  refs.prestigeModal.previewBonusLabel.textContent = t(
    state.locale,
    'prestige.modal.requirementProgress',
  );
  refs.prestigeModal.checkboxLabel.textContent = t(state.locale, 'prestige.modal.checkbox');
  refs.prestigeModal.confirmButton.textContent = t(state.locale, 'prestige.modal.confirm');
  refs.prestigeModal.cancelButton.textContent = t(state.locale, 'actions.cancel');
}
