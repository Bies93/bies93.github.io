import { handleManualClick } from "../game";
import { formatDecimal } from "../math";
import type { GameState } from "../state";
import { createDefaultState } from "../state";
import type { AudioManager } from "../audio";
import type { InitI18nApi } from "./bootstrap";
import type { UIRefs, SidePanelTab } from "./types";
import { exportSave, importSave, clearSave } from "../save";
import { spawnFloatingValue } from "../effects";
import { maybeRollClickSeed } from "../seeds";
import { formatInteger } from "./utils/format";
import { showToast, announce } from "./services/toast";
import { updateStrings } from "./updaters/strings";
import {
  closePrestigeModal,
  openPrestigeModal,
  updatePrestigeModal,
  setPrestigeAcknowledged,
  performPrestigeAction,
} from "./components/prestigeModalController";
import { recalcDerivedValues, evaluateAchievements } from "../game";
import type { ResearchFilter } from "../research";

interface WireContext {
  refs: UIRefs;
  state: GameState;
  audio: AudioManager;
  i18n: InitI18nApi;
  render: (state: GameState) => void;
  getActiveResearchFilter(): ResearchFilter;
  setActiveResearchFilter(value: ResearchFilter, manual: boolean): void;
  getActiveSidePanelTab(): SidePanelTab;
  setActiveSidePanelTab(tab: SidePanelTab): void;
}

export function wireUI(context: WireContext): void {
  const { refs, state, audio, i18n, render } = context;

  refs.clickButton.addEventListener("click", () => {
    const gained = handleManualClick(state);
    const seedResult = maybeRollClickSeed(state);
    audio.playClick();
    spawnFloatingValue(refs.clickButton, `+${formatDecimal(gained)}`);
    if (seedResult.gained > 0) {
      const seedsText = formatInteger(state.locale, seedResult.gained);
      spawnFloatingValue(refs.seedBadge, `+${seedsText}🌱`, "rgb(252 211 77)");
      showToast({
        title: i18n.t(state.locale, "seeds.toast.click.title"),
        message: i18n.t(state.locale, "seeds.toast.click.body", { seeds: seedsText }),
      });
    }
    if (announce.shouldAnnounce(state.buds)) {
      announce(`Buds: ${formatDecimal(state.buds)}`);
    }
    render(state);
  });

  refs.controls.mute.button.addEventListener("click", () => {
    state.muted = audio.toggleMute();
    updateStrings(state, refs);
  });

  refs.controls.export.button.addEventListener("click", async () => {
    const payload = exportSave(state);
    try {
      await navigator.clipboard.writeText(payload);
      alert("Save kopiert.");
    } catch {
      window.prompt("Save kopieren:", payload);
    }
  });

  refs.controls.import.button.addEventListener("click", () => {
    const payload = window.prompt("Bitte Base64-Spielstand einfügen:");
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
      alert("Import fehlgeschlagen.");
    }
  });

  refs.controls.reset.button.addEventListener("click", () => {
    const confirmReset = window.confirm("Spielstand wirklich löschen?");
    if (!confirmReset) {
      return;
    }

    clearSave();
    const fresh = createDefaultState({ locale: state.locale, muted: state.muted });
    Object.assign(state, fresh);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    render(state);
  });

  refs.seedBadge.addEventListener("click", () => {
    openPrestigeModal(refs, state);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.addEventListener("click", () => {
      const next = key as ResearchFilter;
      if (context.getActiveResearchFilter() === next) {
        return;
      }
      context.setActiveResearchFilter(next, next !== "all");
      render(state);
    });
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    button.addEventListener("click", () => {
      if (context.getActiveSidePanelTab() === tab) {
        return;
      }
      context.setActiveSidePanelTab(tab);
      render(state);
    });
  });

  refs.sidePanel.prestige.actionButton.addEventListener("click", () => {
    openPrestigeModal(refs, state);
  });

  refs.prestigeModal.checkbox.addEventListener("change", (event) => {
    setPrestigeAcknowledged((event.target as HTMLInputElement).checked);
    updatePrestigeModal(refs, state);
  });

  refs.prestigeModal.cancelButton.addEventListener("click", () => {
    closePrestigeModal(refs);
  });

  refs.prestigeModal.overlay?.addEventListener("click", (event) => {
    if (event.target === refs.prestigeModal.overlay) {
      closePrestigeModal(refs);
    }
  });

  refs.prestigeModal.confirmButton.addEventListener("click", () => {
    const before = state.temp.needsRecalc;
    performPrestigeAction(state, refs);
    if (!before && state.temp.needsRecalc) {
      render(state);
    }
  });
}
