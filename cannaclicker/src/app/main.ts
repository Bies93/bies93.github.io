import '../styles/index.css';
import { trackFocusVisible } from '@zag-js/focus-visible';
import { migrate, load, initState, save } from './save';
import { startLoop } from './loop';
import { startUI } from './ui';
import { flags } from './flags';
import { installBalanceDevtools } from './devtools';

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
  installBalanceDevtools(state, ui.render);
}

window.addEventListener('beforeunload', () => save(state));
