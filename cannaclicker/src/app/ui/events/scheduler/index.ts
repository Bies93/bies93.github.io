import { createScheduler } from "./scheduler";
import { defaultSchedulerBindings } from "./uiBindings";
import type { SchedulerContext } from "./types";

export type { SchedulerContext, SchedulerBindings } from "./types";

export function createEventScheduler(context: SchedulerContext) {
  return createScheduler(context, defaultSchedulerBindings);
}
