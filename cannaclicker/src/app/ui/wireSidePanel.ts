import type { ResearchFilter } from '../research';
import { purchaseAscensionNode } from '../ascension';
import { recalcDerivedValues } from '../game';
import type { AscensionNodeId } from '../../data/ascension';
import type { RoomId } from '../../data/rooms';
import type { StrainId } from '../../data/strains';
import type { ContractId } from '../../data/contracts';
import type { SeasonId } from '../../data/seasons';
import type { ChallengeId } from '../../data/challenges';
import {
  abandonChallenge,
  acceptContract,
  activateSeason,
  claimActiveContract,
  selectStrain,
  startChallenge,
  upgradeRoom,
} from '../depth';
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

  refs.sidePanel.prestige.ascensionNodes.forEach((card, id) => {
    card.button.addEventListener('click', () => {
      if (!purchaseAscensionNode(state, id as AscensionNodeId)) {
        audio.playCannotBuy();
        return;
      }

      audio.playUnlock();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.roomButtons.forEach((button, id) => {
    button.addEventListener('click', () => {
      if (!upgradeRoom(state, id as RoomId)) {
        audio.playCannotBuy();
        return;
      }
      audio.playUnlock();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.strainButtons.forEach((button, id) => {
    button.addEventListener('click', () => {
      if (!selectStrain(state, id as StrainId)) {
        audio.playCannotBuy();
        return;
      }
      audio.playUnlock();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.contractButtons.forEach((button, id) => {
    button.addEventListener('click', () => {
      const contractId = id as ContractId;
      const handled = state.contracts.activeId === contractId
        ? claimActiveContract(state)
        : acceptContract(state, contractId);
      if (!handled) {
        audio.playCannotBuy();
        return;
      }
      audio.playUnlock();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.seasonButtons.forEach((button, id) => {
    button.addEventListener('click', () => {
      if (!activateSeason(state, id as SeasonId)) {
        audio.playCannotBuy();
        return;
      }
      audio.playUi();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.challengeButtons.forEach((button, id) => {
    button.addEventListener('click', () => {
      const challengeId = id as ChallengeId;
      const handled =
        state.challenges.activeId === challengeId
          ? abandonChallenge(state)
          : startChallenge(state, challengeId);
      if (!handled) {
        audio.playCannotBuy();
        return;
      }
      audio.playPrestige();
      recalcDerivedValues(state);
      render(state);
    });
  });

  refs.sidePanel.greenhouse.automationAutoClick.addEventListener('change', () => {
    state.automation.autoClick = refs.sidePanel.greenhouse.automationAutoClick.checked;
    audio.playUi();
    render(state);
  });

  refs.sidePanel.greenhouse.automationBuyMode.addEventListener('change', () => {
    const value = refs.sidePanel.greenhouse.automationBuyMode.value;
    state.automation.autoBuyMode =
      value === 'cheapest' || value === 'best_roi' || value === 'next_milestone' ? value : 'off';
    audio.playUi();
    render(state);
  });

  refs.sidePanel.greenhouse.automationAbilityMode.addEventListener('change', () => {
    const value = refs.sidePanel.greenhouse.automationAbilityMode.value;
    state.automation.abilityMode =
      value === 'event_buff' || value === 'cooldown_chain' ? value : 'manual';
    audio.playUi();
    render(state);
  });
}
