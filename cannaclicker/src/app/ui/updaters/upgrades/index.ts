import type { GameState } from "../../../state";
import type { UIRefs } from "../../types";
import type { UpgradeEntry as UpgradeViewEntry } from "../../../upgrades";
import { renderUpgradeList } from "./list";

export interface UpgradeUpdateOptions {
  onPurchase: (definition: UpgradeViewEntry["definition"], container: HTMLElement) => void;
}

export function updateUpgrades(
  state: GameState,
  refs: UIRefs,
  options: UpgradeUpdateOptions,
): void {
  renderUpgradeList(state, refs, options);
}

export { renderUpgradeList as renderList } from "./list";
export { renderUpgradeCard as renderCard } from "./renderCard";
export { wireUpgradeCard as wireCard } from "./wireCard";
