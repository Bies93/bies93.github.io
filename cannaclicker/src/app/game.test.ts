import { afterEach, describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { buyItem, handleManualClick } from './game';
import { purchaseResearch } from './research';
import { createDefaultState } from './state';
import { advanceEventPipeline, createDefaultEventState } from './events';

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
});
