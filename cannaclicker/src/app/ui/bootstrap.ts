import type { AudioManager } from "../audio";
import type { LocaleKey } from "../i18n";
import { t as defaultTranslate } from "../i18n";
import type { GameState } from "../state";
import type { ResearchFilter } from "../research";
import type { SidePanelTab, UIRefs } from "./types";
import { showToast, announce } from "./services/toast";
import { createEventScheduler } from "./events/scheduler";
import { attachGlobalShortcuts } from "./input/shortcuts";
import { mountUI } from "./mount";
import { createRenderer } from "./render";
import { wireUI } from "./wire";

export interface InitI18nApi {
  t(locale: LocaleKey, key: string, params?: Record<string, string | number>): string;
}

/**
 * Public UI runtime handle exposing DOM references and lifecycle controls.
 */
export interface UIInitResult {
  refs: UIRefs;
  render(state: GameState): void;
  scheduler: { start(state: GameState): void; stop(): void };
}

export function initUI(
  initialState: GameState,
  audio: AudioManager,
  i18n: InitI18nApi = { t: defaultTranslate },
): UIInitResult {
  let activeResearchFilter: ResearchFilter = "all";
  let researchFilterManuallySelected = false;
  let activeSidePanelTab: SidePanelTab = "shop";

  const refs = mountUI(initialState);

  showToast.bind(refs.toastContainer ?? null);
  announce.bind(refs.announcer ?? null);

  const render = createRenderer({
    refs,
    audio,
    i18n,
    showToast: (options) => showToast(options),
    getResearchState: () => ({ filter: activeResearchFilter, manual: researchFilterManuallySelected }),
    setResearchState(filter, manual) {
      activeResearchFilter = filter;
      researchFilterManuallySelected = manual;
    },
    getActiveSidePanelTab: () => activeSidePanelTab,
  });

  const scheduler = createEventScheduler({
    refs,
    render,
    translate(key, params) {
      return i18n.t(initialState.locale, key, params);
    },
  });

  attachGlobalShortcuts({ refs, render }, initialState, audio);

  wireUI({
    refs,
    state: initialState,
    audio,
    i18n,
    render,
    getActiveResearchFilter: () => activeResearchFilter,
    setActiveResearchFilter(value, manual) {
      activeResearchFilter = value;
      researchFilterManuallySelected = manual;
    },
    getActiveSidePanelTab: () => activeSidePanelTab,
    setActiveSidePanelTab(tab) {
      activeSidePanelTab = tab;
    },
  });

  return { refs, render, scheduler };
}
