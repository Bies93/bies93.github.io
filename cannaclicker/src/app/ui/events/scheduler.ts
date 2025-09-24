import { applyEventReward, type EventClickResult, type EventId } from '../../events';
import { spawnFloatingValue } from '../../effects';
import { formatDecimal } from '../../math';
import { t } from '../../i18n';
import type { GameState } from '../../state';
import type { UIRefs } from '../types';
import { showToast } from '../services/toast';
import {
  EVENT_SPAWN_MAX_MS,
  EVENT_SPAWN_MIN_MS,
  EVENT_VISIBLE_MAX_MS,
  EVENT_VISIBLE_MIN_MS,
  createEventButton,
  pickRandomEventDefinition,
  randomBetween,
  type RandomEventDefinition,
} from './random';

interface SchedulerContext {
  refs: UIRefs;
  render(state: GameState): void;
}

let schedulerContext: SchedulerContext | null = null;
let schedulerState: GameState | null = null;
let eventSpawnTimer: number | null = null;
let eventLifetimeTimer: number | null = null;
let activeEventButton: HTMLButtonElement | null = null;
let initialized = false;

export function ensureEventScheduler(ui: SchedulerContext, state: GameState): void {
  schedulerContext = ui;
  schedulerState = state;

  if (!initialized) {
    initialized = true;
    document.addEventListener('visibilitychange', handleEventVisibilityChange);
    scheduleNextEvent(state, true);
    return;
  }

  if (!eventSpawnTimer && !activeEventButton) {
    scheduleNextEvent(state);
  }
}

export function scheduleNextEvent(state?: GameState | null, immediate = false): void {
  const context = schedulerContext;
  const targetState = state ?? schedulerState;
  const layer = context?.refs.eventLayer ?? context?.refs.eventRoot;
  if (!context || !layer || !targetState) {
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

export function spawnRandomEvent(state: GameState): void {
  eventSpawnTimer = null;

  const context = schedulerContext;
  if (!context || document.hidden) {
    scheduleNextEvent(state, true);
    return;
  }

  const { refs } = context;
  const layer = refs.eventLayer ?? refs.eventRoot;
  if (!layer) {
    scheduleNextEvent(state, true);
    return;
  }

  if (activeEventButton) {
    return;
  }

  const rect = layer.getBoundingClientRect();
  if (rect.width < 80 || rect.height < 80) {
    scheduleNextEvent(state, true);
    return;
  }

  const definition = pickRandomEventDefinition();
  const lifetime = randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS);
  const button = createEventButton(definition, state, lifetime, refs);
  layer.appendChild(button);
  activeEventButton = button;

  eventLifetimeTimer = window.setTimeout(() => {
    removeActiveEvent('expired');
  }, lifetime);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleEventClick(state, definition, button);
  });
}

export function handleEventClick(
  state: GameState,
  definition: RandomEventDefinition,
  element: HTMLButtonElement,
): void {
  const now = Date.now();
  const hadActiveBoost =
    state.temp.activeEventBoost === 'lucky_joint' && state.temp.eventBoostEndsAt > now;

  const result = applyEventReward(state, definition.id, now);
  if (result.requiresRecalc) {
    state.temp.needsRecalc = true;
  }

  showEventFeedback(state, definition.id, result, hadActiveBoost, element);
  removeActiveEvent('clicked');

  schedulerContext?.render(state);
}

export function handleEventVisibilityChange(): void {
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
      activeEventButton.remove();
      activeEventButton = null;
    }
    return;
  }

  scheduleNextEvent();
}

export function showEventFeedback(
  state: GameState,
  id: EventId,
  result: EventClickResult,
  refreshed: boolean,
  origin: HTMLElement,
): void {
  if (!schedulerContext) {
    return;
  }

  if (id === 'golden_bud' && result.budGain) {
    const formatted = formatDecimal(result.budGain);
    spawnFloatingValue(origin, `+${formatted}`);
    showToast({
      title: t(state.locale, 'events.goldenBud.title'),
      message: t(state.locale, 'events.goldenBud.body', { buds: formatted }),
    });
  }

  if (typeof result.seedGain === 'number' && result.seedGain > 0) {
    const formatted = result.seedGain.toString();
    spawnFloatingValue(origin, `+${formatted}🌱`, 'rgb(252 211 77)');

    let messageKey: string;
    if (id === 'seed_pack') {
      messageKey = 'events.seedPack.body';
    } else if (id === 'golden_bud') {
      messageKey = 'events.goldenBud.seedBody';
    } else {
      messageKey = 'events.luckyJoint.seedBody';
    }

    showToast({
      title: t(state.locale, `events.${id}.title`),
      message: t(state.locale, messageKey, { seeds: formatted }),
    });
  }

  if (id === 'lucky_joint' && result.multiplier) {
    const durationSeconds = Math.round((result.durationMs ?? 0) / 1000);
    spawnFloatingValue(origin, `×${result.multiplier.toFixed(1)}`, 'rgb(96 165 250)');
    const bodyKey = refreshed ? 'events.luckyJoint.refresh' : 'events.luckyJoint.body';
    showToast({
      title: t(state.locale, 'events.luckyJoint.title'),
      message: t(state.locale, bodyKey, {
        multiplier: result.multiplier,
        duration: durationSeconds,
      }),
    });
  }
}

export function removeActiveEvent(reason: 'clicked' | 'expired'): void {
  if (eventLifetimeTimer) {
    window.clearTimeout(eventLifetimeTimer);
    eventLifetimeTimer = null;
  }

  if (!activeEventButton) {
    scheduleNextEvent();
    return;
  }

  const element = activeEventButton;
  activeEventButton = null;

  element.remove();
  scheduleNextEvent(undefined, reason === 'clicked');
}

export function createEventScheduler(ui: SchedulerContext): { start(state: GameState): void; stop(): void } {
  return {
    start(state: GameState) {
      ensureEventScheduler(ui, state);
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
        activeEventButton.remove();
        activeEventButton = null;
      }
      document.removeEventListener('visibilitychange', handleEventVisibilityChange);
      initialized = false;
    },
  };
}
