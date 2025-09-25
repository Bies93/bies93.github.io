import { applyEventReward, type EventId } from "../../../events";
import type { GameState } from "../../../state";
import {
  EVENT_SPAWN_MAX_MS,
  EVENT_SPAWN_MIN_MS,
  EVENT_VISIBLE_MAX_MS,
  EVENT_VISIBLE_MIN_MS,
  pickRandomEventDefinition,
  randomBetween,
} from "../random";
import type { SchedulerBindings, SchedulerContext } from "./types";

export function createScheduler(
  context: SchedulerContext,
  bindings: SchedulerBindings,
): { start(state: GameState): void; stop(): void } {
  let schedulerState: GameState | null = null;
  let eventSpawnTimer: number | null = null;
  let eventLifetimeTimer: number | null = null;
  let activeEventButton: HTMLButtonElement | null = null;
  let initialized = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (eventSpawnTimer) {
        window.clearTimeout(eventSpawnTimer);
        eventSpawnTimer = null;
      }
      if (eventLifetimeTimer) {
        window.clearTimeout(eventLifetimeTimer);
        eventLifetimeTimer = null;
      }
      if (activeEventButton) {
        bindings.removeEvent(activeEventButton);
        activeEventButton = null;
      }
      return;
    }

    scheduleNextEvent();
  };

  function scheduleNextEvent(state?: GameState | null, immediate = false): void {
    const targetState = state ?? schedulerState;
    if (!targetState) {
      return;
    }

    if (eventSpawnTimer) {
      window.clearTimeout(eventSpawnTimer);
    }

    const delay = immediate
      ? randomBetween(1_500, 3_500)
      : randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);

    eventSpawnTimer = window.setTimeout(() => {
      spawnRandomEvent(targetState);
    }, delay);
  }

  function spawnRandomEvent(state: GameState): void {
    eventSpawnTimer = null;

    if (document.hidden || activeEventButton) {
      scheduleNextEvent(state, true);
      return;
    }

    const definition = pickRandomEventDefinition();
    const lifetime = randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS);
    const button = bindings.mountEvent(context, state, definition, lifetime, (element) => {
      handleEventClick(state, definition.id, element);
    });

    if (!button) {
      scheduleNextEvent(state, true);
      return;
    }

    activeEventButton = button;
    eventLifetimeTimer = window.setTimeout(() => {
      removeActiveEvent("expired");
    }, lifetime);
  }

  function handleEventClick(state: GameState, id: EventId, element: HTMLButtonElement): void {
    const now = Date.now();
    const hadActiveBoost =
      state.temp.activeEventBoost === "lucky_joint" && state.temp.eventBoostEndsAt > now;

    const result = applyEventReward(state, id, now);
    if (result.requiresRecalc) {
      state.temp.needsRecalc = true;
    }

    bindings.showEventFeedback(context, state, id, result, hadActiveBoost, element);
    removeActiveEvent("clicked");
    context.render(state);
  }

  function removeActiveEvent(reason: "clicked" | "expired"): void {
    if (eventLifetimeTimer) {
      window.clearTimeout(eventLifetimeTimer);
      eventLifetimeTimer = null;
    }

    if (!activeEventButton) {
      scheduleNextEvent(undefined, reason === "clicked");
      return;
    }

    const element = activeEventButton;
    activeEventButton = null;

    bindings.removeEvent(element);
    scheduleNextEvent(undefined, reason === "clicked");
  }

  return {
    start(state: GameState) {
      schedulerState = state;

      if (!initialized) {
        initialized = true;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        scheduleNextEvent(state, true);
        return;
      }

      if (!eventSpawnTimer && !activeEventButton) {
        scheduleNextEvent(state);
      }
    },
    stop() {
      if (eventSpawnTimer) {
        window.clearTimeout(eventSpawnTimer);
        eventSpawnTimer = null;
      }
      if (eventLifetimeTimer) {
        window.clearTimeout(eventLifetimeTimer);
        eventLifetimeTimer = null;
      }
      if (activeEventButton) {
        bindings.removeEvent(activeEventButton);
        activeEventButton = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      initialized = false;
      schedulerState = null;
    },
  };
}
