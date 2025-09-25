import type { AudioManager } from "../audio";
import type { GameState } from "../state";
import type { ResearchFilter } from "../research";
import type { InitI18nApi } from "./bootstrap";
import type { SidePanelTab, UIRefs } from "./types";
import { wireCoreClicks } from "./wireCoreClicks";
import { wirePersistence } from "./wirePersistence";
import { wireSidePanel } from "./wireSidePanel";

export interface WireContext {
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
  wireCoreClicks(context);
  wireSidePanel(context);
  wirePersistence(context);
}
