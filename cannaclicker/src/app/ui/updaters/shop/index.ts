import type { GameState } from "../../../state";
import type { UIRefs } from "../../types";
import { renderShopList } from "./list";

export interface ShopUpdateOptions {
  onPurchase: () => void;
}

export function updateShop(
  state: GameState,
  refs: UIRefs,
  options: ShopUpdateOptions,
): void {
  renderShopList(state, refs, options);
}

export { renderShopList as renderList } from "./list";
export { renderShopCard as renderCard } from "./renderCard";
export { wireShopCard as wireCard } from "./wireCard";
