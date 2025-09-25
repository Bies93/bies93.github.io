import type { AbilityId } from "../../../data/abilities";

export interface AbilityButtonRefs {
  container: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLElement;
  status: HTMLElement;
  progressBar: HTMLElement;
}

export interface UIAbilityPanelRefs {
  abilityTitle: HTMLElement;
  abilityList: Map<AbilityId, AbilityButtonRefs>;
}
