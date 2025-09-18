import type { GameState } from './state';

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

    state.buds = state.buds.add(state.bps.mul(delta));
    state.total = state.total.add(state.bps.mul(delta));

    accumulator += delta;
    autosaveTimer += delta;

    if (accumulator >= 0.1) {
      handlers.onTick(state);
      accumulator = 0;
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