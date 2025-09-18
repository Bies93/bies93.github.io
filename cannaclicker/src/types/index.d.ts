import type { GameState } from '../app/state';

declare global {
  interface Window {
    __state?: GameState;
  }
}

export {};