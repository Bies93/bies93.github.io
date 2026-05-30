import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { computePrestigeMultiplier, getPrestigePreview } from '../../prestige';
import { getAbilityLabel, listAbilities } from '../../abilities';
import { getEventBoostRemaining } from '../../events';
import { getGoalView } from '../../goals';
import { canUnlockItem } from '../../shop';
import type { UIRefs } from '../types';
import { formatInteger } from '../utils/format';
import { formatSeedRate } from './stats';
import { updatePlantStage } from './plant';
import { items, itemById, type ItemId } from '../../../data/items';

export function updateStats(state: GameState, refs: UIRefs): void {
  const preview = getPrestigePreview(state);
  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  refs.total.textContent = formatDecimal(state.total);
  const seedText = formatInteger(state.locale, state.prestige.seeds);
  refs.seeds.textContent = seedText;
  const seedRateValue = formatSeedRate(state.locale, state.temp.seedRatePerHour ?? 0);
  refs.seedRate.textContent = seedRateValue;
  refs.prestigeMult.textContent = `${state.prestige.mult.toFixed(2)}\u00D7`;

  refs.seedBadgeValue.textContent = seedText;
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
  updateBuffList(state, refs);
  updateGoalPanel(state, refs);

  updatePlantStage(state, refs);
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

  if (state.temp.activeEventBoost && state.temp.eventBoostEndsAt > now) {
    buffs.push({
      label: getEventLabel(state.temp.activeEventBoost, state.locale),
      value: `${getEventBoostRemaining(state, now)}s`,
      tone: 'event',
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
  const keys: Record<string, string> = {
    golden_bud: 'events.goldenBud.name',
    seed_pack: 'events.seedPack.name',
    lucky_joint: 'events.luckyJoint.name',
    fertile_rain: 'events.fertileRain.name',
    market_rush: 'events.marketRush.name',
    green_surge: 'events.greenSurge.name',
    mutant_sprout: 'events.mutantSprout.name',
    supply_drop: 'events.supplyDrop.name',
    flash_harvest: 'events.flashHarvest.name',
    calm_growth: 'events.calmGrowth.name',
    overgrowth: 'events.overgrowth.name',
    seed_bloom: 'events.seedBloom.name',
  };

  return t(locale, keys[id] ?? 'events.goldenBud.name');
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
