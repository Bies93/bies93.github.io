import type { AbilityId, GameState } from "../../state";
import { asset } from "../../assets";
import { t, type LocaleKey } from "../../i18n";
import { formatAbilityTooltip, getAbilityLabel } from "../../abilities";
import type { SidePanelTab, UIRefs } from "../types";

const STAT_META: Record<LocaleKey, Record<string, string>> = {
  de: {
    "stats.buds": "Aktueller Vorrat",
    "stats.bps": "Produktion pro Sekunde",
    "stats.bpc": "Ertrag pro Klick",
    "stats.total": "Lebenszeit-Ernte",
    "stats.seeds": "Prestige-Waehrung",
    "stats.seedRate": "60-Minuten-Fenster",
    "stats.prestigeMult": "Aktiver Bonus",
  },
  en: {
    "stats.buds": "Current stock",
    "stats.bps": "Production each second",
    "stats.bpc": "Yield per click",
    "stats.total": "Lifetime harvest",
    "stats.seeds": "Prestige currency",
    "stats.seedRate": "60-minute window",
    "stats.prestigeMult": "Active boost",
  },
};

const SIDE_PANEL_TAB_KEYS: Record<SidePanelTab, string> = {
  shop: "panel.tabs.shop",
  upgrades: "panel.tabs.upgrades",
  research: "panel.tabs.research",
  prestige: "panel.tabs.prestige",
  achievements: "panel.tabs.achievements",
};

export function updateStrings(state: GameState, refs: UIRefs): void {
  refs.headerTitle.textContent = "CannaBies";
  refs.clickButton.setAttribute("aria-label", t(state.locale, "actions.click"));
  refs.clickLabel.textContent = t(state.locale, "actions.click");

  const muteAssets = state.muted
    ? { label: t(state.locale, "actions.unmute"), icon: asset("icons/ui/ui-unmute.png") }
    : { label: t(state.locale, "actions.mute"), icon: asset("icons/ui/ui-mute.png") };

  refs.controls.mute.icon.src = muteAssets.icon;
  refs.controls.mute.label.textContent = muteAssets.label;
  refs.controls.mute.button.setAttribute("aria-label", muteAssets.label);
  refs.controls.mute.button.setAttribute("title", muteAssets.label);

  refs.controls.export.label.textContent = t(state.locale, "actions.export");
  refs.controls.export.button.setAttribute("aria-label", t(state.locale, "actions.export"));
  refs.controls.export.button.setAttribute("title", t(state.locale, "actions.export"));

  refs.controls.import.label.textContent = t(state.locale, "actions.import");
  refs.controls.import.button.setAttribute("aria-label", t(state.locale, "actions.import"));
  refs.controls.import.button.setAttribute("title", t(state.locale, "actions.import"));

  refs.controls.reset.label.textContent = t(state.locale, "actions.reset");
  refs.controls.reset.button.setAttribute("aria-label", t(state.locale, "actions.reset"));
  refs.controls.reset.button.setAttribute("title", t(state.locale, "actions.reset"));

  refs.statsLabels.forEach((label, key) => {
    label.textContent = t(state.locale, key);
  });

  refs.statsMeta.forEach((meta, key) => {
    if (key === "stats.seedRate") {
      meta.textContent = t(state.locale, "stats.seedRate.metaNoPassive");
    } else {
      meta.textContent = STAT_META[state.locale]?.[key] ?? "";
    }
  });

  refs.abilityTitle.textContent = t(state.locale, "abilities.title");
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const labelText = getAbilityLabel(state, abilityId as AbilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute("aria-label", labelText);
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    const key = SIDE_PANEL_TAB_KEYS[tab];
    const label = t(state.locale, key);
    button.textContent = label;
    button.setAttribute("aria-label", label);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.textContent = t(state.locale, `research.filter.${key}`);
    button.setAttribute("aria-label", button.textContent ?? "");
  });

  refs.sidePanel.prestige.description.textContent = t(state.locale, "panel.prestige.description");
  refs.sidePanel.prestige.permanentLabel.textContent = t(state.locale, "panel.prestige.permanent");
  refs.sidePanel.prestige.kickstartLabel.textContent = t(state.locale, "panel.prestige.kickstartNext");
  refs.sidePanel.prestige.activeKickstartLabel.textContent = t(state.locale, "panel.prestige.kickstartActive");
  refs.sidePanel.prestige.actionButton.textContent = t(state.locale, "actions.prestige");

  refs.prestigeModal.title.textContent = t(state.locale, "prestige.modal.title");
  refs.prestigeModal.description.textContent = t(state.locale, "prestige.modal.description");
  refs.prestigeModal.warning.textContent = t(state.locale, "prestige.modal.warning");
  refs.prestigeModal.previewCurrentLabel.textContent = t(state.locale, "prestige.modal.permanentBonus");
  refs.prestigeModal.previewAfterLabel.textContent = t(state.locale, "prestige.modal.kickstartNext");
  refs.prestigeModal.previewGainLabel.textContent = t(state.locale, "prestige.modal.kickstartActive");
  refs.prestigeModal.previewBonusLabel.textContent = t(state.locale, "prestige.modal.requirementProgress");
  refs.prestigeModal.checkboxLabel.textContent = t(state.locale, "prestige.modal.checkbox");
  refs.prestigeModal.confirmButton.textContent = t(state.locale, "prestige.modal.confirm");
  refs.prestigeModal.cancelButton.textContent = t(state.locale, "actions.cancel");
}
