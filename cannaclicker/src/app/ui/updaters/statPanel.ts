import { t } from '../../i18n';
import { formatDecimal } from '../../math';
import type { GameState } from '../../state';
import { computePrestigeMultiplier, getPrestigePreview } from '../../prestige';
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
  const nextMultiplier = computePrestigeMultiplier(preview.seedsAfter);
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

  updatePlantStage(state, refs);
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
