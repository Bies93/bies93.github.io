import { applyEventReward, type EventId } from "../../../events";
import type { GameState } from "../../../state";
import type { SchedulerBindings, SchedulerContext } from "./types";
import { createEventTimers, type EventTimers } from "./timers";

export function createScheduler(
  context: SchedulerContext,
  bindings: SchedulerBindings,
): { start(state: GameState): void; stop(): void } {
  let schedulerState: GameState | null = null;
  let initialized = false;
  let timers: EventTimers;

  function handleEventClick(state: GameState, id: EventId, element: HTMLButtonElement): void {
    const now = Date.now();
    const hadActiveBoost =
      state.temp.activeEventBoost === "lucky_joint" && state.temp.eventBoostEndsAt > now;

    const result = applyEventReward(state, id, now);
    if (result.requiresRecalc) {
      state.temp.needsRecalc = true;
    }

    bindings.showEventFeedback(context, state, id, result, hadActiveBoost, element);
    timers.removeActiveEvent("clicked");
    context.render(state);
  }

  timers = createEventTimers({
    context,
    bindings,
    getState: () => schedulerState,
    onEventClick: handleEventClick,
  });

  const handleVisibilityChange = () => {
    if (document.hidden) {
      timers.clearAll();
      return;
    }

    timers.scheduleNext();
  };

  return {
    start(state: GameState) {
      schedulerState = state;

      if (!initialized) {
        initialized = true;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        timers.scheduleNext(state, true);
        return;
      }

      if (!timers.hasScheduledEvent() && !timers.hasActiveEvent()) {
        timers.scheduleNext(state);
      }
    },
    stop() {
      timers.clearAll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      initialized = false;
      schedulerState = null;
    },
  };
}
