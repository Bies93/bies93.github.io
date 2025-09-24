import { createAudioManager } from './audio';
import { t } from './i18n';
import { evaluateAchievements, recalcDerivedValues } from './game';
import type { GameState } from './state';
import { initUI, type UIInitResult } from './ui/index';

interface UITicker {
  render(state: GameState): void;
  stop(): void;
  refs: UIInitResult['refs'];
}

export function startUI(state: GameState): UITicker {
  const audio = createAudioManager(state.muted);
  const runtime = initUI(state, audio, { t });

  const render = (current: GameState) => {
    runtime.render(current);
    runtime.scheduler.start(current);
  };

  recalcDerivedValues(state);
  evaluateAchievements(state);
  render(state);

  return {
    render,
    stop() {
      runtime.scheduler.stop();
    },
    refs: runtime.refs,
  };
}
