import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { buyItem, handleManualClick } from './game';
import { purchaseResearch } from './research';
import { createDefaultState } from './state';

describe('core game mechanics', () => {
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
});
