import '../styles/index.css';
import { trackFocusVisible } from '@zag-js/focus-visible';
import { migrate, load, initState, save } from './save';
import { startLoop } from './loop';
import { startUI } from './ui';
import { flags } from './flags';
import type { GameState } from './state';

trackFocusVisible({
  root: document,
  onChange: ({ isFocusVisible }) => {
    document.body.classList.toggle('focus-visible', isFocusVisible);
  },
});

migrate();
const persisted = load();
const state = initState(persisted);

const ui = startUI(state);

startLoop(
  state,
  {
    onTick: (current) => {
      ui.render(current);
    },
    onAutosave: (current) => {
      save(current);
    },
  },
  { autosaveSeconds: 10 },
);

if (flags.devtools) {
  (window as Window & { __state?: GameState }).__state = state;
}

window.addEventListener('beforeunload', () => save(state));
