import { evaluateAchievements, recalcDerivedValues } from "../game";
import type { AudioManager } from "../audio";
import type { GameState } from "../state";
import type { ResearchFilter } from "../research";
import type { InitI18nApi } from "./bootstrap";
import type { UIRefs, SidePanelTab } from "./types";
import { updateStrings } from "./updaters/strings";
import { updateStats } from "./updaters/statPanel";
import { processSeedNotifications } from "./updaters/seeds";
import { updateAbilities } from "./updaters/abilities";
import { updateSidePanel } from "./updaters/sidePanel";
import { updateShop } from "./updaters/shop";
import { updateUpgrades } from "./updaters/upgrades";
import { updateResearch } from "./updaters/research";
import { updatePrestigePanel } from "./updaters/prestigePanel";
import { updateAchievements } from "./updaters/achievements";
import { updatePrestigeModal } from "./services/prestigeModal";
import { updateOfflineToast } from "./updaters/offline";
import { save } from "../save";
import { spawnFloatingValue } from "../effects";
import type { ToastOptions } from "./services/toast";

interface RendererContext {
  refs: UIRefs;
  audio: AudioManager;
  i18n: InitI18nApi;
  showToast: (options: ToastOptions) => void;
  getResearchState(): { filter: ResearchFilter; manual: boolean };
  setResearchState(filter: ResearchFilter, manual: boolean): void;
  getActiveSidePanelTab(): SidePanelTab;
}

export function createRenderer(context: RendererContext): (state: GameState) => void {
  const { refs, audio, i18n, showToast } = context;

  const render = (state: GameState) => {
    if (state.temp.needsRecalc) {
      recalcDerivedValues(state);
      evaluateAchievements(state);
      state.temp.needsRecalc = false;
    }

    updateStrings(state, refs);
    updateStats(state, refs);
    processSeedNotifications(state, refs, (options: ToastOptions) => showToast(options));
    updateAbilities(state, refs);
    updateSidePanel(refs, context.getActiveSidePanelTab());

    updateShop(state, refs, {
      onPurchase: () => {
        audio.playPurchase();
        render(state);
      },
    });

    updateUpgrades(state, refs, {
      onPurchase: (definition, container) => {
        audio.playPurchase();
        const locale = state.locale;
        const title = i18n.t(locale, "upgrades.toast.title");
        const message = i18n.t(locale, "upgrades.toast.message", { name: definition.name[locale] });
        showToast({ title, message });
        save(state);
        spawnFloatingValue(container, i18n.t(locale, "upgrades.fx.spark"), "rgb(74 222 128)");
        render(state);
      },
    });

    const researchState = context.getResearchState();
    const result = updateResearch(
      state,
      refs,
      researchState.filter,
      researchState.manual,
      () => {
        audio.playPurchase();
        recalcDerivedValues(state);
        render(state);
      },
    );

    context.setResearchState(result.activeFilter, result.researchFilterManuallySelected);

    updatePrestigePanel(state, refs);
    updateAchievements(state, refs);
    updatePrestigeModal(refs, state);
    updateOfflineToast(state, (options: ToastOptions) => showToast(options));
  };

  return render;
}
