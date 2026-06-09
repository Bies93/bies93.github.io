import Decimal from 'break_infinity.js';
import { abilityMultiplierFor } from '../abilities';
import { OFFLINE_CAP_MS, OFFLINE_GAIN_RATIO } from '../balance';
import type { GameState } from '../state';

export function prepareStateForPersist(state: GameState, timestamp: number): void {
  state.lastSeenAt = timestamp;
  state.time = timestamp;
  const bpsNumber = getPersistentBps(state).toNumber();
  const safeBps = Number.isFinite(bpsNumber) && bpsNumber >= 0 ? bpsNumber : 0;
  state.meta.lastSeenAt = timestamp;
  state.meta.lastBpsAtSave = safeBps;
}

function getPersistentBps(state: GameState): Decimal {
  let persistentBps = state.bps;

  const temporaryMultipliers = [
    state.temp.eventBpsMult,
    new Decimal(abilityMultiplierFor(state, 'bps')),
    state.prestige.kickstart?.endsAt && state.prestige.kickstart.endsAt > Date.now()
      ? new Decimal(state.temp.kickstartBpsMult)
      : new Decimal(1),
  ];

  for (const multiplier of temporaryMultipliers) {
    if (multiplier.greaterThan(0)) {
      persistentBps = persistentBps.div(multiplier);
    }
  }

  return persistentBps.greaterThan(0) ? persistentBps : new Decimal(0);
}

export function applyOfflineProgress(state: GameState, now: number): void {
  const rawDelta = now - state.meta.lastSeenAt;
  const offlineCap = Number.isFinite(state.temp.offlineCapMs)
    ? Math.max(0, state.temp.offlineCapMs)
    : OFFLINE_CAP_MS;
  const cappedDelta = Math.max(0, Math.min(rawDelta, offlineCap));
  const fallbackBps = state.bps.toNumber();
  const baseBps = Number.isFinite(state.meta.lastBpsAtSave)
    ? state.meta.lastBpsAtSave
    : Number.isFinite(fallbackBps) && fallbackBps > 0
      ? fallbackBps
      : 0;
  const safeBps = baseBps >= 0 ? baseBps : 0;
  state.meta.lastBpsAtSave = safeBps;
  const earnedNumber = Math.floor(safeBps * (cappedDelta / 1000) * OFFLINE_GAIN_RATIO);

  if (earnedNumber > 0) {
    const offlineGain = new Decimal(earnedNumber);
    state.buds = state.buds.add(offlineGain);
    state.total = state.total.add(offlineGain);
    const lifetime = state.prestige.lifetimeBuds.add(offlineGain);
    state.prestige.lifetimeBuds = lifetime.greaterThan(state.total) ? lifetime : state.total;
    state.temp.offlineBuds = offlineGain;
    state.temp.offlineDuration = cappedDelta;
    state.meta.offlineBudsTotal += earnedNumber;
    state.meta.offlineReturns += 1;
  } else {
    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }

  state.meta.lastSeenAt = now;
  state.lastSeenAt = now;
  state.time = now;
}
