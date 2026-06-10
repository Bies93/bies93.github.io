import Decimal from 'break_infinity.js';
import {
  getChallengeViews,
  getCollectionViews,
  getContractViews,
  getEventMasteryViews,
  getRoomViews,
  getSeasonViews,
  getStrainViews,
} from '../../depth';
import type { GameState } from '../../state';
import { formatDecimal } from '../../math';
import type { UIRefs } from '../types';
import { formatInteger } from '../utils/format';

export function updateGreenhouse(state: GameState, refs: UIRefs): void {
  const locale = state.locale;
  refs.sidePanel.greenhouse.summary.textContent =
    locale === 'de'
      ? `Build-Zentrale · ${formatInteger(locale, state.contracts.tokens)} Contract Tokens · Collection ${formatInteger(locale, state.collections.score)}`
      : `Build hub · ${formatInteger(locale, state.contracts.tokens)} contract tokens · Collection ${formatInteger(locale, state.collections.score)}`;

  for (const room of getRoomViews(state)) {
    const button = refs.sidePanel.greenhouse.roomButtons.get(room.definition.id);
    if (!button) continue;
    const cost = room.nextLevel ? formatRoomCost(state, room.nextLevel.cost) : '';
    button.classList.toggle('is-owned', room.level >= 5);
    button.classList.toggle('is-available', room.affordable);
    button.disabled = !room.affordable;
    button.innerHTML = `
      <span class="depth-card__head"><strong>${room.definition.displayName[locale]}</strong><em>${room.level}/5</em></span>
      <span class="depth-card__body">${room.definition.role[locale]}</span>
      <span class="depth-card__meta">${room.nextLevel ? room.nextLevel.effectSummary[locale] : room.definition.flavor[locale]}</span>
      <span class="depth-card__action">${room.unlocked ? (room.nextLevel ? cost : doneText(locale)) : room.lockReason}</span>
    `;
  }

  for (const strain of getStrainViews(state)) {
    const button = refs.sidePanel.greenhouse.strainButtons.get(strain.definition.id);
    if (!button) continue;
    button.classList.toggle('is-active', strain.selected);
    button.classList.toggle('is-locked', !strain.unlocked);
    button.disabled = !strain.unlocked || strain.selected;
    const xpText = strain.nextXp
      ? `${formatInteger(locale, strain.xp)} / ${formatInteger(locale, strain.nextXp)} XP`
      : maxedText(locale);
    button.innerHTML = `
      <span class="depth-card__head"><strong>${strain.definition.displayName[locale]}</strong><em>L${strain.level}</em></span>
      <span class="depth-card__body">${strain.definition.role[locale]}</span>
      <span class="depth-card__meta">${strain.unlocked ? xpText : strain.lockReason}</span>
      <span class="depth-card__action">${strain.selected ? activeText(locale) : selectText(locale)}</span>
    `;
  }

  const visibleContracts = new Set(getContractViews(state).map((contract) => contract.definition.id));
  refs.sidePanel.greenhouse.contractButtons.forEach((button, id) => {
    button.hidden = !visibleContracts.has(id);
  });
  for (const contract of getContractViews(state)) {
    const button = refs.sidePanel.greenhouse.contractButtons.get(contract.definition.id);
    if (!button) continue;
    button.classList.toggle('is-active', contract.active);
    button.classList.toggle('is-available', contract.active && contract.completed && !contract.claimed);
    button.disabled = contract.claimed || (!contract.active && Boolean(state.contracts.activeId));
    const action = contract.claimed
      ? doneText(locale)
      : contract.active && contract.completed
        ? claimText(locale)
        : contract.active
          ? progressText(locale)
          : acceptText(locale);
    button.innerHTML = `
      <span class="depth-card__head"><strong>${contract.definition.displayName[locale]}</strong><em>${contract.definition.difficulty}</em></span>
      <span class="depth-card__body">${contract.definition.description[locale]}</span>
      <span class="depth-card__meta">${formatInteger(locale, contract.progress.current)} / ${formatInteger(locale, contract.progress.target)}</span>
      <span class="depth-card__action">${action}</span>
    `;
  }

  for (const season of getSeasonViews(state)) {
    const button = refs.sidePanel.greenhouse.seasonButtons.get(season.definition.id);
    if (!button) continue;
    button.classList.toggle('is-active', season.active);
    button.classList.toggle('is-locked', !season.unlocked);
    button.disabled = !season.unlocked || season.active;
    button.style.setProperty('--season-accent', season.definition.accent);
    button.innerHTML = `
      <span class="depth-card__head"><strong>${season.definition.displayName[locale]}</strong><em>${season.active ? activeText(locale) : ''}</em></span>
      <span class="depth-card__body">${season.definition.description[locale]}</span>
      <span class="depth-card__action">${season.unlocked ? selectText(locale) : season.definition.unlockHint[locale]}</span>
    `;
  }

  const mastery = getEventMasteryViews(state)
    .filter((entry) => entry.clicks > 0 || entry.level > 0)
    .sort((a, b) => b.level - a.level || b.clicks - a.clicks)
    .slice(0, 8);
  refs.sidePanel.greenhouse.eventMasteryList.innerHTML =
    mastery.length === 0
      ? `<p class="depth-empty">${locale === 'de' ? 'Klicke Events, um Mastery zu starten.' : 'Click events to start mastery.'}</p>`
      : mastery
          .map(
            (entry) => `
        <div class="depth-card depth-card--static">
          <span class="depth-card__head"><strong>${entry.id.replaceAll('_', ' ')}</strong><em>L${entry.level}</em></span>
          <span class="depth-card__meta">${formatInteger(locale, entry.clicks)} clicks · ×${entry.rewardMultiplier.toFixed(2)}</span>
        </div>
      `,
          )
          .join('');

  for (const challenge of getChallengeViews(state)) {
    const button = refs.sidePanel.greenhouse.challengeButtons.get(challenge.definition.id);
    if (!button) continue;
    button.classList.toggle('is-active', challenge.active);
    button.classList.toggle('is-owned', challenge.completed);
    button.classList.toggle('is-locked', !challenge.unlocked);
    button.disabled =
      challenge.completed ||
      !challenge.unlocked ||
      (Boolean(state.challenges.activeId) && !challenge.active);
    const action = challenge.completed
      ? doneText(locale)
      : challenge.active
        ? `${Math.round(challenge.progress * 100)}%`
        : challenge.unlocked
          ? startText(locale)
          : challenge.definition.unlockHint[locale];
    button.innerHTML = `
      <span class="depth-card__head"><strong>${challenge.definition.displayName[locale]}</strong><em>${action}</em></span>
      <span class="depth-card__body">${challenge.definition.description[locale]}</span>
      <span class="depth-card__meta">${challenge.definition.completion[locale]}</span>
    `;
  }

  refs.sidePanel.greenhouse.collectionList.innerHTML = getCollectionViews(state)
    .map(
      (entry) => `
      <div class="depth-card depth-card--static ${entry.owned ? 'is-owned' : 'is-locked'}">
        <span class="depth-card__head"><strong>${entry.definition.displayName[locale]}</strong><em>${entry.owned ? `+${entry.definition.score}` : ''}</em></span>
        <span class="depth-card__body">${entry.owned ? entry.definition.description[locale] : entry.definition.unlockHint[locale]}</span>
      </div>
    `,
    )
    .join('');

  refs.sidePanel.greenhouse.automationStatus.textContent =
    locale === 'de'
      ? `Tier ${state.automation.unlockedTier}/5 · Automation bleibt optional und freigeschaltet.`
      : `Tier ${state.automation.unlockedTier}/5 · Automation stays optional and gated.`;
  refs.sidePanel.greenhouse.automationAutoClick.checked = state.automation.autoClick;
  refs.sidePanel.greenhouse.automationAutoClick.disabled = state.automation.unlockedTier < 1;
  refs.sidePanel.greenhouse.automationBuyMode.value = state.automation.autoBuyMode;
  refs.sidePanel.greenhouse.automationBuyMode.disabled = state.automation.unlockedTier < 2;
  refs.sidePanel.greenhouse.automationAbilityMode.value = state.automation.abilityMode;
  refs.sidePanel.greenhouse.automationAbilityMode.disabled = state.automation.unlockedTier < 4;
}

function formatRoomCost(
  state: GameState,
  cost: NonNullable<ReturnType<typeof getRoomViews>[number]['nextLevel']>['cost'],
): string {
  const parts: string[] = [];
  if (cost.buds) parts.push(`${formatDecimal(new Decimal(cost.buds))} Buds`);
  if (cost.ascensionSeeds) parts.push(`${formatInteger(state.locale, cost.ascensionSeeds)} AS`);
  if (cost.achievementScore) parts.push(`${formatInteger(state.locale, cost.achievementScore)} Score`);
  if (cost.contractTokens) parts.push(`${formatInteger(state.locale, cost.contractTokens)} CT`);
  return parts.join(' · ');
}

function activeText(locale: string): string {
  return locale === 'de' ? 'Aktiv' : 'Active';
}

function selectText(locale: string): string {
  return locale === 'de' ? 'Wählen' : 'Select';
}

function acceptText(locale: string): string {
  return locale === 'de' ? 'Annehmen' : 'Accept';
}

function claimText(locale: string): string {
  return locale === 'de' ? 'Abholen' : 'Claim';
}

function progressText(locale: string): string {
  return locale === 'de' ? 'Läuft' : 'Active';
}

function startText(locale: string): string {
  return locale === 'de' ? 'Starten' : 'Start';
}

function doneText(locale: string): string {
  return locale === 'de' ? 'Fertig' : 'Done';
}

function maxedText(locale: string): string {
  return locale === 'de' ? 'Max Level' : 'Max level';
}
