import Decimal from 'break_infinity.js';
import type { GameState } from './state';
import { updateAbilityTimers } from './abilities';
import { recalcDerivedValues } from './game';
import { runAutoBuy, AUTO_BUY_INTERVAL_SECONDS } from './autobuy';
import { clearExpiredEventBoost } from './events';

interface LoopOptions {
  autosaveSeconds?: number;
  paused?: boolean;
}

interface LoopHandlers {
  onTick: (state: GameState) => void;
  onAutosave?: (state: GameState) => void;
}

export function startLoop(
  state: GameState,
  handlers: LoopHandlers,
  options: LoopOptions = {},
): () => void {
  const autosaveTarget = Math.max(5, options.autosaveSeconds ?? 10);
  const pauseOnStart = !!options.paused;
  let last = performance.now();
  let accumulator = 0;
  let autosaveTimer = 0;
  let autoBuyTimer = 0;
  let frame = 0;

  const step = (timestamp: number) => {
    if (pauseOnStart || document.hidden) {
      last = timestamp;
      frame = requestAnimationFrame(step);
      return;
    }

    const delta = Math.min(1, (timestamp - last) / 1000);
    last = timestamp;
    state.lastTick = timestamp;

    const now = Date.now();

    const production = state.bps.mul(delta);
    if (production.greaterThan(0)) {
      state.buds = state.buds.add(production);
      state.total = state.total.add(production);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(production);
    }

    if (state.temp.autoClickRate > 0) {
      const autoClicks = new Decimal(state.temp.autoClickRate * delta);
      const autoGain = state.bpc.mul(autoClicks);
      if (autoGain.greaterThan(0)) {
        state.buds = state.buds.add(autoGain);
        state.total = state.total.add(autoGain);
        state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(autoGain);
      }
    }

    const abilityChanged = updateAbilityTimers(state, now);
    const eventEnded = clearExpiredEventBoost(state, now);
    if (abilityChanged || eventEnded) {
      recalcDerivedValues(state);
    }

    accumulator += delta;
    autosaveTimer += delta;
    autoBuyTimer += delta;

    if (accumulator >= 0.1) {
      handlers.onTick(state);
      accumulator = 0;
    }

    if (autoBuyTimer >= AUTO_BUY_INTERVAL_SECONDS) {
      autoBuyTimer = 0;
      runAutoBuy(state);
    }

    if (autosaveTimer >= autosaveTarget) {
      handlers.onAutosave?.(state);
      autosaveTimer = 0;
    }

    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frame);
}