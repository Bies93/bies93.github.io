import { spawnFloatingValue } from "../../../effects";
import { formatDecimal } from "../../../math";
import { t } from "../../../i18n";
import { showToast } from "../../services/toast";
import { createEventButton } from "../random";
import type { SchedulerBindings, SchedulerContext } from "./types";

function getEventLayer(context: SchedulerContext): HTMLElement | null {
  return context.refs.eventLayer ?? context.refs.eventRoot ?? null;
}

function canSpawnInLayer(layer: HTMLElement): boolean {
  const rect = layer.getBoundingClientRect();
  return rect.width >= 80 && rect.height >= 80;
}

export const defaultSchedulerBindings: SchedulerBindings = {
  mountEvent(context, state, definition, lifetime, onClick) {
    const layer = getEventLayer(context);
    if (!layer || !canSpawnInLayer(layer)) {
      return null;
    }

    const button = createEventButton(definition, state, lifetime, context.refs);
    layer.appendChild(button);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(button);
    });
    return button;
  },
  removeEvent(element) {
    element.remove();
  },
  showEventFeedback(context, state, id, result, refreshed, origin) {
    if (id === "golden_bud" && result.budGain) {
      const formatted = formatDecimal(result.budGain);
      spawnFloatingValue(origin, `+${formatted}`);
      showToast({
        title: t(state.locale, "events.goldenBud.title"),
        message: t(state.locale, "events.goldenBud.body", { buds: formatted }),
      });
    }

    if (typeof result.seedGain === "number" && result.seedGain > 0) {
      const formatted = result.seedGain.toString();
      spawnFloatingValue(origin, `+${formatted}🌱`, "rgb(252 211 77)");

      let messageKey: string;
      if (id === "seed_pack") {
        messageKey = "events.seedPack.body";
      } else if (id === "golden_bud") {
        messageKey = "events.goldenBud.seedBody";
      } else {
        messageKey = "events.luckyJoint.seedBody";
      }

      showToast({
        title: t(state.locale, `events.${id}.title`),
        message: t(state.locale, messageKey, { seeds: formatted }),
      });
    }

    if (id === "lucky_joint" && result.multiplier) {
      const durationSeconds = Math.round((result.durationMs ?? 0) / 1000);
      spawnFloatingValue(origin, `×${result.multiplier.toFixed(1)}`, "rgb(96 165 250)");
      const bodyKey = refreshed ? "events.luckyJoint.refresh" : "events.luckyJoint.body";
      showToast({
        title: t(state.locale, "events.luckyJoint.title"),
        message: t(state.locale, bodyKey, {
          multiplier: result.multiplier,
          duration: durationSeconds,
        }),
      });
    }
  },
};
