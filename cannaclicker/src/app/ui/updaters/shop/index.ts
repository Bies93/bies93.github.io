import type { ItemDefinition } from '../../../../data/items';
import type { GameState } from '../../../state';
import type { UIRefs } from '../../types';
import { renderShopList } from './list';

export interface ShopPurchaseFeedback {
  definition: ItemDefinition;
  quantity: number;
  milestone: number | null;
}

export interface ShopUpdateOptions {
  onPurchase: (feedback: ShopPurchaseFeedback) => void;
  onCannotPurchase: (container: HTMLElement) => void;
}

export function updateShop(state: GameState, refs: UIRefs, options: ShopUpdateOptions): void {
  renderShopList(state, refs, options);
}

export { renderShopList as renderList } from './list';
export { renderShopCard as renderCard } from './renderCard';
export { wireShopCard as wireCard } from './wireCard';
