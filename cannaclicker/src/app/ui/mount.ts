import { t } from "../i18n";
import { withBase } from "../paths";
import type { GameState } from "../state";
import { createActionButton, createDangerButton } from "./components/controls";
import { showHudNotice } from "./services/hud";
import type { UIRefs } from "./types";
import { mountHeader } from "./mountHeader";
import { mountPanels } from "./mountPanels";
import { mountRoot } from "./mountRoot";

export function mountUI(state: GameState): UIRefs {
  const { root, layout, primaryColumn, secondaryColumn, hudNotice, issues } = mountRoot();

  root.setAttribute("aria-label", t(state.locale, "ui.sections.app"));
  hudNotice.setAttribute("aria-label", t(state.locale, "ui.sections.hudNotice"));

  if (issues.missingRoot) {
    showHudNotice(hudNotice, t(state.locale, "ui.warning.fallbackRoot"), {
      id: "ui-root",
      tone: "warning",
    });
  }

  const muteControl = createActionButton(withBase("icons/ui/ui-mute.png"));
  const exportControl = createActionButton(withBase("icons/ui/ui-export.png"));
  const importControl = createActionButton(withBase("icons/ui/ui-import.png"));
  const resetControl = createDangerButton(withBase("icons/ui/ui-reset.png"));

  const headerTitle = mountHeader(root, [
    muteControl.button,
    exportControl.button,
    importControl.button,
    resetControl.button,
  ]);

  const panels = mountPanels({ state, root, layout, primaryColumn, secondaryColumn });

  return {
    root,
    hudNotice,
    headerTitle,
    controls: {
      mute: muteControl,
      export: exportControl,
      import: importControl,
      reset: resetControl,
    },
    ...panels,
  };
}
