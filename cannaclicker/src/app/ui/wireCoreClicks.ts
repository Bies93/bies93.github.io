import { evaluateAchievements, handleManualClick, recalcDerivedValues } from '../game';
import { activateAbility } from '../abilities';
import { claimGoal } from '../goals';
import type { GoalId } from '../../data/goals';
import { formatDecimal } from '../math';
import { pulseElement, spawnFloatingValue, spawnParticleBurst } from '../effects';
import { maybeRollClickSeed } from '../seeds';
import { formatInteger } from './utils/format';
import { showToast, announce } from './services/toast';
import {
  closePrestigeModal,
  openPrestigeModal,
  performPrestigeAction,
  setPrestigeAcknowledged,
  updatePrestigeModal,
} from './services/prestigeModal';
import type { WireContext } from './wire';

export function wireCoreClicks(context: WireContext): void {
  const { refs, state, audio, i18n, render } = context;

  refs.clickButton.addEventListener('click', () => {
    const gained = handleManualClick(state);
    const seedResult = maybeRollClickSeed(state);
    const critical = state.temp.lastClickCritical;
    const boostedClick =
      critical || state.bpc.greaterThan(1.01) || state.temp.eventBpcMult.greaterThan(1.01);
    audio.playClick({ boosted: boostedClick });
    pulseElement(
      refs.clickButton,
      critical ? 'is-critical-click' : boostedClick ? 'is-boosted-click' : 'is-clicking',
      critical ? 360 : 260,
    );
    spawnFloatingValue(
      refs.clickButton,
      `${critical ? 'CRIT ' : ''}+${formatDecimal(gained)}`,
      critical ? 'gold' : boostedClick ? 'boost' : 'bud',
    );
    spawnParticleBurst(
      refs.clickButton,
      critical ? 'gold' : boostedClick ? 'boost' : 'bud',
      critical ? 10 : boostedClick ? 7 : 4,
    );

    if (seedResult.gained > 0) {
      const seedsText = formatInteger(state.locale, seedResult.gained);
      spawnFloatingValue(refs.seedBadge, `+${seedsText} Seeds`, 'seed');
      spawnParticleBurst(refs.seedBadge, 'seed', 8);
      showToast({
        title: i18n.t(state.locale, 'seeds.toast.click.title'),
        message: i18n.t(state.locale, 'seeds.toast.click.body', { seeds: seedsText }),
        tone: 'success',
      });
    }

    if (announce.shouldAnnounce(state.buds)) {
      announce(`Buds: ${formatDecimal(state.buds)}`);
    }

    render(state);
  });

  refs.abilityList.forEach((abilityRefs, abilityId) => {
    abilityRefs.container.addEventListener('click', () => {
      if (!activateAbility(state, abilityId)) {
        audio.playCannotBuy();
        return;
      }

      audio.playBuffActivate();
      recalcDerivedValues(state);
      evaluateAchievements(state);
      spawnFloatingValue(
        abilityRefs.container,
        i18n.t(state.locale, 'abilities.fx.activate'),
        'boost',
      );
      spawnParticleBurst(abilityRefs.container, 'boost', 8);
      render(state);
    });
  });

  refs.goalButton.addEventListener('click', () => {
    const goalId = refs.goalPanel.dataset.goalId;
    if (!goalId || !claimGoal(state, goalId as GoalId)) {
      audio.playCannotBuy();
      return;
    }

    audio.playUnlock();
    recalcDerivedValues(state);
    evaluateAchievements(state);
    spawnFloatingValue(refs.goalPanel, i18n.t(state.locale, 'goals.fx.claim'), 'achievement');
    spawnParticleBurst(refs.goalPanel, 'achievement', 8);
    render(state);
  });

  refs.seedBadge.addEventListener('click', () => {
    audio.playUi();
    openPrestigeModal(refs, state);
  });

  refs.prestigeModal.checkbox.addEventListener('change', (event) => {
    setPrestigeAcknowledged((event.target as HTMLInputElement).checked);
    updatePrestigeModal(refs, state);
  });

  refs.prestigeModal.cancelButton.addEventListener('click', () => {
    audio.playUi();
    closePrestigeModal(refs);
  });

  refs.prestigeModal.overlay?.addEventListener('click', (event) => {
    if (event.target === refs.prestigeModal.overlay) {
      audio.playUi();
      closePrestigeModal(refs);
    }
  });

  refs.prestigeModal.confirmButton.addEventListener('click', () => {
    const before = state.temp.needsRecalc;
    const performed = performPrestigeAction(state, refs);
    if (performed) {
      audio.playPrestige();
      pulseElement(refs.root, 'is-prestiging', 950);
      spawnFloatingValue(refs.seedBadge, i18n.t(state.locale, 'prestige.fx.reset'), 'prestige');
      spawnParticleBurst(refs.seedBadge, 'prestige', 12);
    } else {
      audio.playCannotBuy();
    }
    if (!before && state.temp.needsRecalc) {
      render(state);
    }
  });
}
