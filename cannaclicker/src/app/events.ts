import Decimal from "break_infinity.js";
import type {
  ActiveEventState,
  EventEffectState,
  GameState,
  RandomEventId,
} from "./state";

export interface EventDefinition {
  id: RandomEventId;
  icon: string;
  labelKey: string;
  toastTitleKey: string;
  toastBodyKey: string;
}

export interface EventReward {
  id: RandomEventId;
  type: "buds" | "seeds" | "multiplier";
  budGain?: Decimal;
  seedGain?: number;
  multiplier?: number;
  durationMs?: number;
  requiresRecalc: boolean;
}

const EVENT_DEFINITIONS: Record<RandomEventId, EventDefinition> = {
  goldenBud: {
    id: "goldenBud",
    icon: "icons/events/golden_bud.png",
    labelKey: "events.goldenBud.label",
    toastTitleKey: "events.goldenBud.toastTitle",
    toastBodyKey: "events.goldenBud.toastBody",
  },
  seedPack: {
    id: "seedPack",
    icon: "icons/events/seed_pack.png",
    labelKey: "events.seedPack.label",
    toastTitleKey: "events.seedPack.toastTitle",
    toastBodyKey: "events.seedPack.toastBody",
  },
  luckyJoint: {
    id: "luckyJoint",
    icon: "icons/events/lucky_joint.png",
    labelKey: "events.luckyJoint.label",
    toastTitleKey: "events.luckyJoint.toastTitle",
    toastBodyKey: "events.luckyJoint.toastBody",
  },
};

const EVENT_IDS: RandomEventId[] = ["goldenBud", "seedPack", "luckyJoint"];

const EVENT_LIFETIME_MS = { min: 7000, max: 12000 } as const;
const EVENT_COOLDOWN_MS = { min: 8000, max: 20000 } as const;
const GOLDEN_BUD_SECONDS = 8;
const LUCKY_JOINT_DURATION_MS = 20000;
const LUCKY_JOINT_MULTIPLIER = 2;

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickEvent(): RandomEventId {
  const index = Math.floor(Math.random() * EVENT_IDS.length);
  return EVENT_IDS[index];
}

function buildEvent(now: number): ActiveEventState {
  return {
    id: pickEvent(),
    spawnedAt: now,
    expiresAt: now + randomRange(EVENT_LIFETIME_MS.min, EVENT_LIFETIME_MS.max),
    x: randomRange(0.15, 0.85),
    y: randomRange(0.18, 0.85),
  } satisfies ActiveEventState;
}

function scheduleNext(state: GameState, now: number): void {
  state.temp.nextEventAt = now + randomRange(EVENT_COOLDOWN_MS.min, EVENT_COOLDOWN_MS.max);
}

export function updateEventTimers(state: GameState, now = Date.now()): boolean {
  let requiresRecalc = false;

  const effect = state.temp.eventEffect;
  if (effect && now >= effect.expiresAt) {
    resetEventEffect(state);
    requiresRecalc = true;
  }

  const active = state.temp.activeEvent;
  if (active && now >= active.expiresAt) {
    state.temp.activeEvent = null;
    scheduleNext(state, now);
  }

  if (!state.temp.activeEvent && now >= state.temp.nextEventAt) {
    state.temp.activeEvent = buildEvent(now);
    state.temp.nextEventAt = Number.POSITIVE_INFINITY;
  }

  return requiresRecalc;
}

export function claimEvent(
  state: GameState,
  id: RandomEventId,
  now = Date.now(),
): EventReward | null {
  const active = state.temp.activeEvent;
  if (!active || active.id !== id) {
    return null;
  }

  state.temp.activeEvent = null;
  scheduleNext(state, now);

  if (id === "goldenBud") {
    const gain = state.bps.mul(GOLDEN_BUD_SECONDS);
    if (gain.greaterThan(0)) {
      state.buds = state.buds.add(gain);
      state.total = state.total.add(gain);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(gain);
    }

    return {
      id,
      type: "buds",
      budGain: gain,
      requiresRecalc: false,
    } satisfies EventReward;
  }

  if (id === "seedPack") {
    const base = Math.max(1, Math.round(state.prestige.mult.toNumber()));
    state.prestige.seeds += base;

    return {
      id,
      type: "seeds",
      seedGain: base,
      requiresRecalc: false,
    } satisfies EventReward;
  }

  const effect: EventEffectState = {
    id,
    expiresAt: now + LUCKY_JOINT_DURATION_MS,
    bpsMultiplier: new Decimal(LUCKY_JOINT_MULTIPLIER),
    bpcMultiplier: new Decimal(LUCKY_JOINT_MULTIPLIER),
  } satisfies EventEffectState;

  state.temp.eventEffect = effect;
  state.temp.eventBpsMult = effect.bpsMultiplier;
  state.temp.eventBpcMult = effect.bpcMultiplier;

  return {
    id,
    type: "multiplier",
    multiplier: LUCKY_JOINT_MULTIPLIER,
    durationMs: LUCKY_JOINT_DURATION_MS,
    requiresRecalc: true,
  } satisfies EventReward;
}

export function getEventDefinition(id: RandomEventId): EventDefinition {
  return EVENT_DEFINITIONS[id];
}

function resetEventEffect(state: GameState): void {
  state.temp.eventEffect = null;
  state.temp.eventBpsMult = new Decimal(1);
  state.temp.eventBpcMult = new Decimal(1);
}

export function getActiveEvent(state: GameState): ActiveEventState | null {
  return state.temp.activeEvent;
}

export function getEventEffect(state: GameState): EventEffectState | null {
  return state.temp.eventEffect;
}

export function isEventEffectActive(state: GameState, now = Date.now()): boolean {
  const effect = state.temp.eventEffect;
  return !!effect && effect.expiresAt > now;
}

export function getEventDefinitions(): EventDefinition[] {
  return EVENT_IDS.map((id) => EVENT_DEFINITIONS[id]);
}
