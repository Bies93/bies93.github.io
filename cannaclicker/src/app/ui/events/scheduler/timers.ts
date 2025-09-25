import { type EventId } from "../../../events";
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

interface EventTimerConfig {
  context: SchedulerContext;
  bindings: SchedulerBindings;
  getState: () => GameState | null;
  onEventClick: (state: GameState, id: EventId, element: HTMLButtonElement) => void;
}

type RemoveReason = "clicked" | "expired";

export interface EventTimers {
  scheduleNext(state?: GameState | null, immediate?: boolean): void;
  removeActiveEvent(reason: RemoveReason): void;
  clearAll(): void;
  hasActiveEvent(): boolean;
  hasScheduledEvent(): boolean;
}

export function createEventTimers(config: EventTimerConfig): EventTimers {
  let eventSpawnTimer: number | null = null;
  let eventLifetimeTimer: number | null = null;
  let activeEventButton: HTMLButtonElement | null = null;

  function clearSpawnTimer(): void {
    if (eventSpawnTimer) {
      window.clearTimeout(eventSpawnTimer);
      eventSpawnTimer = null;
    }
  }

  function clearLifetimeTimer(): void {
    if (eventLifetimeTimer) {
      window.clearTimeout(eventLifetimeTimer);
      eventLifetimeTimer = null;
    }
  }

  function scheduleNext(state?: GameState | null, immediate = false): void {
    const targetState = state ?? config.getState();
    if (!targetState) {
      return;
    }

    clearSpawnTimer();

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
      scheduleNext(state, true);
      return;
    }

    const definition = pickRandomEventDefinition();
    const lifetime = randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS);

    const button = config.bindings.mountEvent(
      config.context,
      state,
      definition,
      lifetime,
      (element) => {
        config.onEventClick(state, definition.id, element);
      },
    );

    if (!button) {
      scheduleNext(state, true);
      return;
    }

    activeEventButton = button;
    eventLifetimeTimer = window.setTimeout(() => {
      removeActiveEvent("expired");
    }, lifetime);
  }

  function removeActiveEvent(reason: RemoveReason): void {
    clearLifetimeTimer();

    if (!activeEventButton) {
      scheduleNext(undefined, reason === "clicked");
      return;
    }

    const element = activeEventButton;
    activeEventButton = null;

    config.bindings.removeEvent(element);
    scheduleNext(undefined, reason === "clicked");
  }

  function clearAll(): void {
    clearSpawnTimer();
    clearLifetimeTimer();
    if (activeEventButton) {
      config.bindings.removeEvent(activeEventButton);
      activeEventButton = null;
    }
  }

  return {
    scheduleNext,
    removeActiveEvent,
    clearAll,
    hasActiveEvent() {
      return activeEventButton !== null;
    },
    hasScheduledEvent() {
      return eventSpawnTimer !== null;
    },
  };
}
