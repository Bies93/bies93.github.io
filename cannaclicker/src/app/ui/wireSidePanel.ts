import type { ResearchFilter } from '../research';
import { openPrestigeModal } from './services/prestigeModal';
import type { WireContext } from './wire';

export function wireSidePanel(context: WireContext): void {
  const { refs, state, audio, render } = context;

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.addEventListener('click', () => {
      const next = key as ResearchFilter;
      if (context.getActiveResearchFilter() === next) {
        return;
      }

      context.setActiveResearchFilter(next, next !== 'all');
      audio.playUi();
      render(state);
    });
  });

  refs.sidePanel.achievements.filters.forEach((button, key) => {
    button.addEventListener('click', () => {
      if (refs.sidePanel.achievements.activeFilter === key) {
        return;
      }

      refs.sidePanel.achievements.activeFilter = key;
      audio.playUi();
      render(state);
    });
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    button.addEventListener('click', () => {
      if (context.getActiveSidePanelTab() === tab) {
        return;
      }

      context.setActiveSidePanelTab(tab);
      audio.playUi();
      render(state);
    });
  });

  refs.sidePanel.prestige.actionButton.addEventListener('click', () => {
    audio.playUi();
    openPrestigeModal(refs, state);
  });
}
