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
    if (quantity > 0 && buyItem(state, definition.id, quantity)) {
      card.container.classList.remove('is-purchased');
      void card.container.offsetWidth;
      card.container.classList.add('is-purchased');
      spawnFloatingValue(card.container, `+${quantity}`, 'rgb(74 222 128)');
      save(state);
      options.onPurchase();
    }
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
