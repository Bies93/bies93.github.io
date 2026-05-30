import type { GameState } from '../../../state';
import { buyItem } from '../../../game';
import { save } from '../../../save';
import { getMaxAffordable } from '../../../shop';
import type { ItemDefinition } from '../../../../data/items';
import type { ShopCardRefs } from '../../types';
import type { ShopUpdateOptions } from './index';
import { spawnFloatingValue } from '../../../effects';

const wiredCards = new WeakSet<ShopCardRefs>();

export function wireShopCard(
  state: GameState,
  card: ShopCardRefs,
  definition: ItemDefinition,
  options: ShopUpdateOptions,
): void {
  if (wiredCards.has(card)) {
    return;
  }

  wiredCards.add(card);

  const purchase = (quantity: number) => {
    if (quantity <= 0) {
      options.onCannotPurchase(card.container);
      return;
    }

    const ownedBefore = state.items[definition.id] ?? 0;
    const milestone = getCrossedMilestone(definition, ownedBefore, ownedBefore + quantity);

    if (buyItem(state, definition.id, quantity)) {
      card.container.classList.remove('is-purchased');
      void card.container.offsetWidth;
      card.container.classList.add(milestone ? 'is-milestone-purchase' : 'is-purchased');
      if (milestone) {
        window.setTimeout(() => card.container.classList.remove('is-milestone-purchase'), 900);
      }
      card.currentProduction.classList.add('is-value-pop');
      card.nextProduction.classList.add('is-value-pop');
      window.setTimeout(() => {
        card.currentProduction.classList.remove('is-value-pop');
        card.nextProduction.classList.remove('is-value-pop');
      }, 520);
      spawnFloatingValue(card.container, `+${quantity}`, milestone ? 'milestone' : 'bud');
      save(state);
      options.onPurchase({ definition, quantity, milestone });
      return;
    }

    options.onCannotPurchase(card.container);
  };

  card.buyButton.addEventListener('click', () => {
    purchase(1);
  });

  card.buyTenButton.addEventListener('click', () => {
    purchase(10);
  });

  card.buyTwentyFiveButton.addEventListener('click', () => {
    purchase(25);
  });

  card.maxButton.addEventListener('click', () => {
    const count = getMaxAffordable(definition, state);
    purchase(count);
  });
}

function getCrossedMilestone(
  definition: ItemDefinition,
  before: number,
  after: number,
): number | null {
  const milestones = definition.milestoneThresholds ?? [];
  return milestones.find((threshold) => before < threshold && after >= threshold) ?? null;
}
