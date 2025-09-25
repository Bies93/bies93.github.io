import { resolveEventClick, type EventId } from "../../../events";
import type { GameState } from "../../../state";
import { getEventPresentation } from "../random";
import type { SchedulerBindings, SchedulerContext } from "./types";

export function createScheduler(
  context: SchedulerContext,
  bindings: SchedulerBindings,
): { start(state: GameState): void; stop(): void } {
  const rendered = new Map<string, HTMLButtonElement>();

  function syncActiveEvents(state: GameState): void {
    const now = Date.now();
    const active = state.events.active;
    const activeTokens = new Set(active.map((entry) => entry.token));

    for (const [token, element] of rendered) {
      if (!activeTokens.has(token)) {
        bindings.removeEvent(element);
        rendered.delete(token);
      }
    }

    for (const entry of active) {
      if (rendered.has(entry.token)) {
        continue;
      }

      const definition = getEventPresentation(entry.id);
      const remainingLifetime = Math.max(0, entry.expiresAt - now);
      const button = bindings.mountEvent(context, state, definition, remainingLifetime, (element) => {
        handleEventClick(state, entry.id, entry.token, element);
      });

      if (button) {
        rendered.set(entry.token, button);
      }
    }
  }

  function handleEventClick(
    state: GameState,
    id: EventId,
    token: string,
    element: HTMLButtonElement,
  ): void {
    const now = Date.now();
    const hadActiveBoost =
      state.temp.activeEventBoost === "lucky_joint" && state.temp.eventBoostEndsAt > now;

    const resolution = resolveEventClick(state, token, now);
    if (!resolution) {
      return;
    }

    bindings.showEventFeedback(context, state, id, resolution.result, hadActiveBoost, element);
    if (rendered.has(token)) {
      bindings.removeEvent(element);
      rendered.delete(token);
    }
    context.render(state);
  }

  return {
    start(state: GameState) {
      syncActiveEvents(state);
    },
    stop() {
      for (const element of rendered.values()) {
        bindings.removeEvent(element);
      }
      rendered.clear();
    },
  };
}
