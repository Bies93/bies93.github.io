import type { EventClickResult, EventId } from "../../../events";
import type { GameState } from "../../../state";
import type { UIRefs } from "../../types";
import type { EventPresentation } from "../random";

export interface SchedulerContext {
  refs: UIRefs;
  render(state: GameState): void;
  translate(key: string, params?: Record<string, string | number>): string;
}

export interface SchedulerBindings {
  mountEvent(
    context: SchedulerContext,
    state: GameState,
    definition: EventPresentation,
    lifetime: number,
    onClick: (element: HTMLButtonElement) => void,
  ): HTMLButtonElement | null;
  removeEvent(element: HTMLButtonElement): void;
  showEventFeedback(
    context: SchedulerContext,
    state: GameState,
    id: EventId,
    result: EventClickResult,
    refreshed: boolean,
    origin: HTMLElement,
  ): void;
}
