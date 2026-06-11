import { t } from '../../../i18n';
import type { GameState } from '../../../state';
import { formatTierBonus } from '../stats';
import { createItemSrcset } from '../../components/media';
import { formatDecimal } from '../../../math';
import {
  formatRoi,
  type PurchaseOption,
  type PurchaseQuantity,
  type ShopEntry,
} from '../../../shop';
import type { ShopCardRefs } from '../../types';
import { formatPercent } from '../../utils/format';
import { itemById, type ItemId } from '../../../../data/items';
import { getActiveItemSynergySummaries } from '../../../itemSynergies';

export function renderShopCard(state: GameState, card: ShopCardRefs, entry: ShopEntry): void {
  const locale = state.locale;

  updateCoreDetails(card, entry, locale);
  updateRoi(card, entry, locale);
  updateTierProgress(card, entry, locale);
  updateSoftcapBadge(card, entry, locale);
  updateAffordability(card, entry);
  updateCostAndOwned(card, entry);
  updateProductionDetails(card, entry, locale);
  updatePurchaseButtons(card, entry, locale);
  updateUnlockHint(state, card, entry, locale);
}

function updateCoreDetails(
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  const definition = entry.definition;
  card.icon.src = definition.icon;
  card.icon.srcset = createItemSrcset(definition.icon);
  card.icon.alt = definition.name[locale];
  card.media.setAttribute('aria-label', t(locale, 'shop.detailsToggle', {
    item: definition.name[locale],
  }));

  card.name.textContent = definition.name[locale];
  card.description.textContent = definition.description[locale];
  card.role.textContent = definition.role[locale];
  card.role.setAttribute('title', definition.synergyHooks[locale]);
  card.costLabel.textContent = t(locale, 'shop.cost');
  card.ownedLabel.textContent = t(locale, 'shop.owned');
  card.currentProductionLabel.textContent = t(locale, 'shop.productionCurrent');
  card.nextProductionLabel.textContent = t(locale, 'shop.productionAfter');
  card.shareLabel.textContent = t(locale, 'shop.productionShare');
  card.buyButton.textContent = t(locale, 'actions.buyOne');
  card.buyTenButton.textContent = t(locale, 'actions.buyTen');
  card.buyTwentyFiveButton.textContent = t(locale, 'actions.buyTwentyFive');
  card.maxButton.textContent = t(locale, 'actions.max');
}

function updateRoi(card: ShopCardRefs, entry: ShopEntry, locale: GameState['locale']): void {
  const roiText = formatRoi(locale, entry.roi);
  card.roiValue.textContent = roiText;
  card.roiBadge.dataset.variant = resolveRoiVariant(entry.roi);
  card.roiBadge.setAttribute('aria-label', roiText);
  card.roiBadge.setAttribute('title', roiText);
}

function updateTierProgress(
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  const stageLabel = t(locale, 'shop.stageLabel', {
    level: entry.tier.stage,
    total: entry.tier.milestones.length,
  });
  card.stageLabel.textContent = stageLabel;

  const tierTooltip = t(locale, 'shop.stageTooltip', {
    bonus: formatTierBonus(locale, entry.tier.bonus),
    count: entry.tier.size,
  });
  card.stageLabel.setAttribute('title', tierTooltip);
  card.stageLabel.setAttribute('aria-label', `${stageLabel} (${tierTooltip})`);

  const stageProgressLabel = t(locale, 'shop.stageProgress', {
    remaining: entry.tier.remainingCount,
    next: entry.tier.nextMilestone ?? entry.tier.nextThreshold,
  });
  card.stageProgressText.textContent = stageProgressLabel;
  card.stageProgressText.setAttribute('title', stageProgressLabel);
  card.stageProgressText.setAttribute('aria-label', stageProgressLabel);

  const progressPercent = Math.max(0, Math.min(1, entry.tier.completion));
  card.stageProgressBar.style.width = `${(progressPercent * 100).toFixed(2)}%`;
}

function updateSoftcapBadge(
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  if (!entry.softcap.active) {
    card.softcapBadge.textContent = '';
    card.softcapBadge.classList.add('hidden');
    card.softcapBadge.removeAttribute('title');
    card.softcapBadge.removeAttribute('aria-label');
    return;
  }

  const badgeText = t(locale, 'shop.softcapBadge', { stacks: entry.softcap.stacks });
  const reduction = Math.max(0, 1 - entry.softcap.multiplier.toNumber());
  const reductionPercent = (reduction * 100).toFixed(1);
  const nextThreshold = entry.softcap.nextThreshold;
  const tooltipKey = nextThreshold ? 'shop.softcapTooltipNext' : 'shop.softcapTooltipMax';
  const tooltip = t(locale, tooltipKey, {
    percent: reductionPercent,
    next: nextThreshold?.toString() ?? '—',
  });

  card.softcapBadge.textContent = badgeText;
  card.softcapBadge.classList.remove('hidden');
  card.softcapBadge.setAttribute('title', tooltip);
  card.softcapBadge.setAttribute('aria-label', tooltip);
}

function updateAffordability(card: ShopCardRefs, entry: ShopEntry): void {
  if (entry.unlocked) {
    card.container.classList.remove('opacity-40');
    card.container.classList.remove('is-locked');
    card.buyButton.disabled = !entry.affordable;
  } else {
    card.container.classList.add('opacity-40');
    card.container.classList.add('is-locked');
    card.buyButton.disabled = true;
  }

  const affordable = entry.affordable && entry.unlocked;
  card.container.dataset.locked = entry.unlocked ? 'false' : 'true';
  card.container.dataset.affordable = affordable ? 'true' : 'false';
  card.container.dataset.efficient = entry.efficient ? 'true' : 'false';
  card.container.classList.toggle('is-affordable', affordable);
}

function updateCostAndOwned(card: ShopCardRefs, entry: ShopEntry): void {
  card.cost.textContent = entry.formattedCost;
  card.owned.textContent = entry.owned.toString();
  card.ownedBadge.textContent = `x${entry.owned}`;
  card.ownedBadge.dataset.empty = entry.owned > 0 ? 'false' : 'true';
}

function updateProductionDetails(
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  card.currentProduction.textContent = formatDecimal(entry.currentBps);
  card.nextProduction.textContent = formatDecimal(entry.nextBps);
  card.share.textContent = `${formatPercent(locale, entry.productionShare * 100)}%`;
  card.delta.textContent = t(locale, 'shop.deltaBps', {
    value: formatDecimal(entry.deltaBps),
  });
}

function updatePurchaseButtons(
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  const pairs: [PurchaseQuantity, HTMLButtonElement][] = [
    ['one', card.buyButton],
    ['ten', card.buyTenButton],
    ['twentyFive', card.buyTwentyFiveButton],
    ['max', card.maxButton],
  ];

  for (const [quantity, button] of pairs) {
    const option = entry.purchaseOptions[quantity];
    const hardDisabled = !entry.unlocked || option.quantity <= 0;
    button.disabled = hardDisabled;
    button.setAttribute('aria-disabled', option.enabled ? 'false' : 'true');
    button.dataset.affordable = option.enabled ? 'true' : 'false';
    button.setAttribute('title', formatPurchaseTitle(locale, option));
  }
}

function formatPurchaseTitle(locale: GameState['locale'], option: PurchaseOption): string {
  if (option.quantity <= 0) {
    return t(locale, 'shop.buyUnavailable');
  }

  return t(locale, 'shop.buyPreview', {
    count: option.quantity,
    cost: option.formattedCost,
    bps: formatDecimal(option.deltaBps),
  });
}

function updateUnlockHint(
  state: GameState,
  card: ShopCardRefs,
  entry: ShopEntry,
  locale: GameState['locale'],
): void {
  if (entry.unlocked) {
    const activeSynergies = getActiveItemSynergySummaries(state, entry.definition.id)
      .slice(0, 2)
      .map((summary) => `${summary.name} +${Math.round(summary.bonus * 100)}%`);
    card.unlockHint.textContent =
      activeSynergies.length > 0
        ? `${entry.definition.synergyHooks[locale]} · ${activeSynergies.join(' · ')}`
        : entry.definition.synergyHooks[locale];
    card.unlockHint.classList.toggle('hidden', false);
    return;
  }

  const unlock = entry.definition.unlock;
  if (!unlock) {
    card.unlockHint.textContent = '';
    card.unlockHint.classList.add('hidden');
    return;
  }

  if (unlock.totalBuds) {
    card.unlockHint.textContent = t(locale, 'shop.unlock.total', {
      value: formatDecimal(unlock.totalBuds),
    });
  } else if (unlock.itemsOwned) {
    const [itemId, amount] = Object.entries(unlock.itemsOwned)[0] ?? [];
    const item = itemById.get(itemId as ItemId);
    card.unlockHint.textContent = itemId
      ? t(locale, 'shop.unlock.items', { count: amount ?? 0, item: item?.name[locale] ?? itemId })
      : '';
  }

  card.unlockHint.classList.toggle('hidden', !card.unlockHint.textContent);
}

function resolveRoiVariant(roi: number | null): 'fast' | 'medium' | 'slow' | 'none' {
  if (roi === null || !Number.isFinite(roi)) {
    return 'none';
  }

  if (roi < 120) {
    return 'fast';
  }

  if (roi <= 600) {
    return 'medium';
  }

  return 'slow';
}
