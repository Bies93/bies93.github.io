import { t } from "../../i18n";
import { formatDecimal } from "../../math";
import { formatDuration } from "../utils/format";
import type { GameState } from "../../state";

export function updateOfflineToast(state: GameState, showToast: (title: string, message: string) => void): void {
  if (state.temp.offlineBuds && state.temp.offlineDuration > 0) {
    if (state.settings.showOfflineEarnings) {
      const title = t(state.locale, "toast.offline.title");
      const message = t(state.locale, "toast.offline.body", {
        buds: formatDecimal(state.temp.offlineBuds),
        duration: formatDuration(state.temp.offlineDuration),
      });
      showToast(title, message);
    }

    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }
}
