import { afterEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { buyItem, handleManualClick, recalcDerivedValues } from './game';
import { purchaseResearch } from './research';
import { createDefaultState } from './state';
import { advanceEventPipeline, createDefaultEventState } from './events';
import { advanceAphid, hitAphid, spawnAphid } from './aphid';

describe('core game mechanics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds buds and lifetime total on a manual click', () => {
    const state = createDefaultState();

    const gained = handleManualClick(state);

    expect(gained.toNumber()).toBe(1);
    expect(state.buds.toNumber()).toBe(1);
    expect(state.total.toNumber()).toBe(1);
    expect(state.prestige.lifetimeBuds.toNumber()).toBe(1);
  });

  it('buys a first building and recalculates passive production', () => {
    const state = createDefaultState();
    state.buds = new Decimal(12);
    state.total = new Decimal(12);

    expect(buyItem(state, 'seedling')).toBe(true);

    expect(state.buds.toNumber()).toBe(0);
    expect(state.items.seedling).toBe(1);
    expect(state.bps.toNumber()).toBeGreaterThan(0);
  });

  it('purchases research and applies its production multiplier', () => {
    const state = createDefaultState();
    state.buds = new Decimal(12_000);
    state.total = new Decimal(12_000);

    expect(purchaseResearch(state, 'r_eff_foundation')).toBe(true);

    expect(state.buds.toNumber()).toBe(0);
    expect(state.researchOwned).toContain('r_eff_foundation');
    expect(state.temp.researchBpsMult.toNumber()).toBeCloseTo(1.2);
  });

  it('schedules the first random event in the opening two minutes', () => {
    const now = 1_000_000;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const events = createDefaultEventState(now);

    expect(events.queue).toHaveLength(1);
    expect(events.queue[0].scheduledAt - now).toBe(90_000);
  });

  it('uses a 3 to 6 minute event cadence in the early game', () => {
    const now = Date.now();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createDefaultState();
    state.time = now - 140_000;
    state.prestige.lastResetAt = state.time;
    state.total = new Decimal(120);
    state.items.seedling = 1;
    state.events.queue = [];
    state.meta.eventStats.totalSpawns = 1;

    advanceEventPipeline(state, 1, now);

    expect(state.events.queue).toHaveLength(1);
    expect(state.events.queue[0].scheduledAt - now).toBe(180_000);
  });

  it('allows the first random event after the first shop purchase within two minutes', () => {
    const now = 1_000_000;
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createDefaultState({ time: now - 95_000 });
    state.prestige.lastResetAt = now - 95_000;
    state.total = new Decimal(12);
    state.items.seedling = 1;
    state.events = createDefaultEventState(now - 95_000);

    advanceEventPipeline(state, 1, now);

    expect(state.events.active).toHaveLength(1);
    expect(state.meta.eventStats.totalSpawns).toBe(1);
  });

  it('shortens stale first-event queues from old saves once random events are eligible', () => {
    const now = Date.now();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createDefaultState();
    state.time = now - 130_000;
    state.prestige.lastResetAt = state.time;
    state.total = new Decimal(120);
    state.items.seedling = 1;
    state.events.queue = [
      {
        id: 'golden_bud',
        token: 'stale_first_event',
        scheduledAt: now + 900_000,
        priority: 0,
        pity: false,
      },
    ];

    advanceEventPipeline(state, 1, now);

    expect(state.events.queue).toHaveLength(1);
    expect(state.events.queue[0].scheduledAt - now).toBe(2_000);
  });

  it('rolls the aphid pest once per online minute with a ten percent spawn chance', () => {
    const now = 1_000_000;
    const state = createDefaultState({ time: now });
    state.temp.aphid.nextRollAt = now;

    expect(advanceAphid(state, now, () => 0.09)).toBe(true);
    expect(state.temp.aphid.active).toBe(true);
    expect(state.temp.aphid.hitsRemaining).toBe(3);
    expect(state.temp.aphid.xPercent).toBeGreaterThanOrEqual(54);
    expect(state.temp.aphid.yPercent).toBeGreaterThanOrEqual(24);

    const missState = createDefaultState({ time: now });
    missState.temp.aphid.nextRollAt = now;

    expect(advanceAphid(missState, now, () => 0.1)).toBe(false);
    expect(missState.temp.aphid.active).toBe(false);
    expect(missState.temp.aphid.nextRollAt).toBe(now + 60_000);
  });

  it('halves passive production while an aphid is active and restores it after three hits', () => {
    const state = createDefaultState();
    state.items.seedling = 20;
    recalcDerivedValues(state);
    const normalBps = state.bps;

    spawnAphid(state, 1_000_000, () => 0.5);
    recalcDerivedValues(state);

    expect(state.temp.aphid.active).toBe(true);
    expect(state.temp.aphidBpsMult.toNumber()).toBe(0.5);
    expect(state.bps.toNumber()).toBeCloseTo(normalBps.mul(0.5).toNumber());

    expect(hitAphid(state, 1_001_000)).toBe('hit');
    expect(state.temp.aphid.hitsRemaining).toBe(2);
    expect(hitAphid(state, 1_002_000)).toBe('hit');
    expect(state.temp.aphid.hitsRemaining).toBe(1);
    expect(hitAphid(state, 1_003_000)).toBe('defeated');

    recalcDerivedValues(state);

    expect(state.temp.aphid.active).toBe(false);
    expect(state.temp.aphidBpsMult.toNumber()).toBe(1);
    expect(state.bps.toNumber()).toBeCloseTo(normalBps.toNumber());
  });
});
