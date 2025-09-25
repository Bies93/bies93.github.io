import { showHudNotice } from "../../services/hud";
import { createScheduler } from "./scheduler";
import { defaultSchedulerBindings } from "./uiBindings";
import type { SchedulerContext } from "./types";

export type { SchedulerContext, SchedulerBindings } from "./types";

export function createEventScheduler(context: SchedulerContext) {
  const eventHost = context.refs.eventLayer ?? context.refs.eventRoot ?? null;
  if (!eventHost) {
    showHudNotice(
      context.refs.hudNotice ?? null,
      context.translate("ui.warning.eventsDisabled"),
      { id: "event-layer", tone: "warning" },
    );

    return {
      start() {
        /* noop – scheduler disabled */
      },
      stop() {
        /* noop – scheduler disabled */
      },
    };
  }

  return createScheduler(context, defaultSchedulerBindings);
}
