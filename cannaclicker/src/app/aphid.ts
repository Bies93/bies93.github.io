import Decimal from 'break_infinity.js';

import type { AphidRuntimeState, GameState } from './state';

const APHID_ROLL_INTERVAL_MS = 60_000;
const APHID_SPAWN_CHANCE = 0.1;
const APHID_HITS = 3;

type RandomFn = () => number;

export type AphidHitResult = 'miss' | 'hit' | 'defeated';

export function createDefaultAphidState(now = Date.now()): AphidRuntimeState {
  return {
    active: false,
    hitsRemaining: 0,
    totalHits: APHID_HITS,
    spawnedAt: 0,
    nextRollAt: now + APHID_ROLL_INTERVAL_MS,
    xPercent: 64,
    yPercent: 38,
    lastHitAt: 0,
    defeatedAt: 0,
  };
}

export function ensureAphidState(state: GameState): AphidRuntimeState {
  const current = state.temp.aphid;
  if (!current) {
    state.temp.aphid = createDefaultAphidState();
    return state.temp.aphid;
  }

  current.totalHits = Number.isFinite(current.totalHits)
    ? Math.max(1, Math.floor(current.totalHits))
    : APHID_HITS;
  current.hitsRemaining = Number.isFinite(current.hitsRemaining)
    ? Math.max(0, Math.min(current.totalHits, Math.floor(current.hitsRemaining)))
    : 0;
  current.nextRollAt = Number.isFinite(current.nextRollAt)
    ? Math.max(0, current.nextRollAt)
    : Date.now() + APHID_ROLL_INTERVAL_MS;
  current.xPercent = Number.isFinite(current.xPercent) ? current.xPercent : 64;
  current.yPercent = Number.isFinite(current.yPercent) ? current.yPercent : 38;
  current.spawnedAt = Number.isFinite(current.spawnedAt) ? current.spawnedAt : 0;
  current.lastHitAt = Number.isFinite(current.lastHitAt) ? current.lastHitAt : 0;
  current.defeatedAt = Number.isFinite(current.defeatedAt) ? current.defeatedAt : 0;
  current.active = Boolean(current.active && current.hitsRemaining > 0);
  return current;
}

export function getAphidBpsMultiplier(state: GameState): Decimal {
  return ensureAphidState(state).active ? new Decimal(0.5) : new Decimal(1);
}

export function advanceAphid(
  state: GameState,
  now = Date.now(),
  random: RandomFn = Math.random,
): boolean {
  const aphid = ensureAphidState(state);
  if (aphid.active) {
    return false;
  }

  if (aphid.nextRollAt <= 0) {
    aphid.nextRollAt = now + APHID_ROLL_INTERVAL_MS;
    return false;
  }

  if (now < aphid.nextRollAt) {
    return false;
  }

  aphid.nextRollAt = now + APHID_ROLL_INTERVAL_MS;
  if (random() >= APHID_SPAWN_CHANCE) {
    return false;
  }

  spawnAphid(state, now, random);
  return true;
}

export function spawnAphid(state: GameState, now = Date.now(), random: RandomFn = Math.random): void {
  const aphid = ensureAphidState(state);
  aphid.active = true;
  aphid.hitsRemaining = APHID_HITS;
  aphid.totalHits = APHID_HITS;
  aphid.spawnedAt = now;
  aphid.lastHitAt = 0;
  aphid.defeatedAt = 0;
  aphid.xPercent = 54 + random() * 28;
  aphid.yPercent = 24 + random() * 24;
}

export function hitAphid(state: GameState, now = Date.now()): AphidHitResult {
  const aphid = ensureAphidState(state);
  if (!aphid.active || aphid.hitsRemaining <= 0) {
    return 'miss';
  }

  aphid.hitsRemaining = Math.max(0, aphid.hitsRemaining - 1);
  aphid.lastHitAt = now;
  if (aphid.hitsRemaining > 0) {
    return 'hit';
  }

  aphid.active = false;
  aphid.defeatedAt = now;
  aphid.nextRollAt = now + APHID_ROLL_INTERVAL_MS;
  return 'defeated';
}
