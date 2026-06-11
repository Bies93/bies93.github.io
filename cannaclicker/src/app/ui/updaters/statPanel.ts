import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { computePrestigeMultiplier, getPrestigePreview } from '../../prestige';
import { getAbilityLabel, listAbilities } from '../../abilities';
import { EVENT_I18N_KEYS, getActiveEventBoosts } from '../../events';
import { getGoalView } from '../../goals';
import { canUnlockItem } from '../../shop';
import type { UIRefs } from '../types';
import { formatInteger } from '../utils/format';
import { formatSeedRate } from './stats';
import { updatePlantStage } from './plant';
import { updateOrbitBuds } from './orbitBuds';
import { items, itemById, type ItemId } from '../../../data/items';

export function updateStats(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  const clickYield = refs.bpc.closest('.click-yield');
  if (clickYield) {
    clickYield.setAttribute(
      'aria-label',
      `${t(state.locale, 'stats.bpc')}: ${formatDecimal(state.bpc)}`,
    );
    clickYield.setAttribute('title', `${t(state.locale, 'stats.bpc')}: ${formatDecimal(state.bpc)}`);
  }
  refs.total.textContent = formatDecimal(state.total);
  const seedText = formatInteger(state.locale, state.prestige.seeds);
  refs.seeds.textContent = seedText;
  const seedRateValue = formatSeedRate(state.locale, state.temp.seedRatePerHour ?? 0);
  refs.seedRate.textContent = seedRateValue;
  refs.prestigeMult.textContent = `${state.prestige.mult.toFixed(2)}\u00D7`;

  const ascensionSeedText = formatInteger(state.locale, state.prestige.ascensionSeeds ?? 0);
  refs.seedBadgeValue.textContent = ascensionSeedText;
  const seedsMeta = refs.statsMeta.get('stats.seeds');
  if (seedsMeta) {
    seedsMeta.textContent = t(state.locale, 'stats.seeds.meta', {
      total: formatInteger(state.locale, state.prestige.totalSeeds ?? state.prestige.seeds),
    });
  }
  const seedRateMeta = refs.statsMeta.get('stats.seedRate');
  if (seedRateMeta) {
    if (state.temp.seedPassiveThrottled) {
      const capText = formatSeedRate(state.locale, state.temp.seedRateCap ?? 0);
      seedRateMeta.textContent = t(state.locale, 'stats.seedRate.throttled', { cap: capText });
    } else if (state.temp.seedPassiveConfig) {
      const config = state.temp.seedPassiveConfig;
      const progress = Math.round(
        Math.max(0, Math.min(1, state.temp.seedPassiveProgress ?? 0)) * 100,
      );
      const chance = Math.round(Math.max(0, Math.min(1, config.chance)) * 100);
      const minutes = Math.max(1, Math.round(config.intervalMs / 60000));
      const seeds = formatInteger(state.locale, config.seeds);
      seedRateMeta.textContent = t(state.locale, 'stats.seedRate.metaPassive', {
        progress,
        chance,
        minutes,
        seeds,
      });
    } else {
      seedRateMeta.textContent = t(state.locale, 'stats.seedRate.metaNoPassive');
    }
  }
  const canPrestige = preview.requirementMet;
  const nextMultiplier = computePrestigeMultiplier(preview.totalSeedsAfter);
  const badgeTooltip = canPrestige
    ? t(state.locale, 'prestige.badge.tooltip', {
        seeds: preview.seedGain,
        multiplier: nextMultiplier.toFixed(2),
      })
    : t(state.locale, 'prestige.control.locked', {
        requirement: formatDecimal(preview.requirementTarget),
      });
  refs.seedBadge.classList.toggle('is-ready', canPrestige);
  refs.seedBadge.setAttribute('title', badgeTooltip);
  refs.seedBadge.setAttribute('aria-label', badgeTooltip);

  refs.nextUnlockHint.textContent = getNextUnlockHint(state);
  updateClickComboLabel(state, refs);
  updateBuffList(state, refs);
  updateGoalPanel(state, refs);

  updatePlantStage(state, refs);
  updateOrbitBuds(state, refs);
}

function updateClickComboLabel(state: GameState, refs: UIRefs): void {
  const comboActive =
    (state.temp.clickComboExpiresAt ?? 0) > Date.now() && (state.temp.clickComboCount ?? 0) >= 5;
  refs.clickLabel.textContent = comboActive
    ? t(state.locale, 'click.combo', { count: state.temp.clickComboCount })
    : t(state.locale, 'actions.click');
}

function updateGoalPanel(state: GameState, refs: UIRefs): void {
  const view = getGoalView(state);
  if (!view.current || !view.currentProgress) {
    refs.goalTitle.textContent = t(state.locale, 'goals.complete.title');
    refs.goalDescription.textContent = t(state.locale, 'goals.complete.description');
    refs.goalReward.textContent = '';
    refs.goalProgressBar.style.width = '100%';
    refs.goalProgressText.textContent = '100%';
    refs.goalButton.disabled = true;
    refs.goalButton.textContent = t(state.locale, 'goals.claimed');
    refs.nextGoalHint.textContent = '';
    return;
  }

  const goal = view.current;
  const progress = view.currentProgress;
  refs.goalPanel.dataset.goalId = goal.id;
  refs.goalTitle.textContent = goal.title[state.locale];
  refs.goalDescription.textContent = goal.description[state.locale];
  refs.goalReward.textContent = t(state.locale, 'goals.reward', {
    reward: goal.rewardLabel[state.locale],
  });
  refs.goalProgressBar.style.width = `${Math.round(progress.progress * 100)}%`;
  refs.goalProgressText.textContent = t(state.locale, 'goals.progress', {
    current: formatDecimal(progress.current),
    target: formatDecimal(progress.target),
  });
  refs.goalButton.disabled = !progress.complete;
  refs.goalButton.textContent = progress.complete
    ? t(state.locale, 'goals.claim')
    : t(state.locale, 'goals.inProgress');
  refs.nextGoalHint.textContent = view.next
    ? t(state.locale, 'goals.next', { goal: view.next.title[state.locale] })
    : '';
}

function updateBuffList(state: GameState, refs: UIRefs): void {
  const now = Date.now();
  const buffs: { label: string; value: string; tone: string }[] = [];

  for (const ability of listAbilities()) {
    const runtime = state.abilities[ability.id];
    if (!runtime?.active || runtime.endsAt <= now) {
      continue;
    }

    buffs.push({
      label: getAbilityLabel(ability.id, state.locale),
      value: `${Math.ceil((runtime.endsAt - now) / 1000)}s`,
      tone: ability.appliesTo,
    });
  }

  for (const boost of getActiveEventBoosts(state, now)) {
    buffs.push({
      label: getEventLabel(boost.id, state.locale),
      value: `${boost.remainingSeconds}s · ${formatEventBoostMultiplier(boost.multiplier, boost.target)}`,
      tone: boost.target === 'cost' ? 'cost' : 'event',
    });
  }

  if (state.temp.kickstartRemainingMs > 0) {
    buffs.push({
      label: t(state.locale, 'buffs.kickstart'),
      value: `${Math.ceil(state.temp.kickstartRemainingMs / 1000)}s`,
      tone: 'prestige',
    });
  }

  refs.buffList.innerHTML = '';
  refs.buffList.classList.toggle('is-empty', buffs.length === 0);
  refs.root.dataset.buff = buffs.length === 0 ? 'none' : 'active';

  if (buffs.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'buff-chip is-empty';
    empty.textContent = t(state.locale, 'buffs.none');
    refs.buffList.appendChild(empty);
    return;
  }

  for (const buff of buffs) {
    const chip = document.createElement('span');
    chip.className = 'buff-chip';
    chip.dataset.tone = buff.tone;
    chip.textContent = `${buff.label} · ${buff.value}`;
    refs.buffList.appendChild(chip);
  }
}

function getEventLabel(id: string, locale: GameState['locale']): string {
  if (id === 'goal_reward') {
    return t(locale, 'goals.boost.label');
  }
  const key = EVENT_I18N_KEYS[id as keyof typeof EVENT_I18N_KEYS];
  return t(locale, key ? `events.${key}.name` : 'events.goldenBud.name');
}

function formatEventBoostMultiplier(multiplier: number, target: string): string {
  if (target === 'cost' && multiplier < 1) {
    return `-${Math.round((1 - multiplier) * 100)}%`;
  }
  if (target === 'cost' && multiplier > 1) {
    return `+${Math.round((multiplier - 1) * 100)}%`;
  }

  return `×${multiplier.toFixed(multiplier >= 2 ? 1 : 2)}`;
}

function getNextUnlockHint(state: GameState): string {
  const locked = items.find((item) => !canUnlockItem(state, item));
  if (!locked) {
    return t(state.locale, 'nextUnlock.allUnlocked');
  }

  const name = locked.name[state.locale];
  const unlock = locked.unlock;
  if (unlock?.totalBuds) {
    const remaining = Math.max(0, unlock.totalBuds - state.total.toNumber());
    return t(state.locale, 'nextUnlock.total', {
      item: name,
      amount: formatDecimal(remaining),
    });
  }

  if (unlock?.itemsOwned) {
    const [itemId, required] = Object.entries(unlock.itemsOwned)[0] ?? [];
    const current = itemId ? (state.items[itemId as ItemId] ?? 0) : 0;
    const item = itemById.get(itemId as ItemId);
    return t(state.locale, 'nextUnlock.items', {
      item: name,
      count: Math.max(0, (required ?? 0) - current),
      source: item?.name[state.locale] ?? itemId,
    });
  }

  return t(state.locale, 'nextUnlock.allUnlocked');
}
