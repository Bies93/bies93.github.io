import { handleManualClick } from "../game";
import { formatDecimal } from "../math";
import { spawnFloatingValue } from "../effects";
import { maybeRollClickSeed } from "../seeds";
import { formatInteger } from "./utils/format";
import { showToast, announce } from "./services/toast";
import {
  closePrestigeModal,
  openPrestigeModal,
  performPrestigeAction,
  setPrestigeAcknowledged,
  updatePrestigeModal,
} from "./services/prestigeModal";
import type { WireContext } from "./wire";

export function wireCoreClicks(context: WireContext): void {
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

  refs.seedBadge.addEventListener("click", () => {
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
