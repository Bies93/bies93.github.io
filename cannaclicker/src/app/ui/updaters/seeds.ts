import { spawnFloatingValue } from "../../effects";
import { t } from "../../i18n";
import { formatInteger } from "../utils/format";
import type { GameState } from "../../state";
import type { UIRefs } from "../types";

export function processSeedNotifications(state: GameState, refs: UIRefs, showToast: (title: string, message: string) => void): void {
  const queue = state.temp.seedNotifications;
  if (!Array.isArray(queue) || queue.length === 0) {
    return;
  }

  const badge = refs.seedBadge;
  while (queue.length > 0) {
    const notification = queue.shift();
    if (!notification || notification.seeds <= 0) {
      continue;
    }

    const seedsText = formatInteger(state.locale, notification.seeds);
    spawnFloatingValue(badge, `+${seedsText}🌱`, "rgb(252 211 77)");

    if (notification.type === "synergy") {
      const name = t(state.locale, `seeds.synergy.${notification.id}`);
      showToast(
        t(state.locale, "seeds.toast.synergy.title"),
        t(state.locale, "seeds.toast.synergy.body", { name, seeds: seedsText }),
      );
    } else if (notification.type === "passive") {
      showToast(
        t(state.locale, "seeds.toast.passive.title"),
        t(state.locale, "seeds.toast.passive.body", { seeds: seedsText }),
      );
    }
  }
}
