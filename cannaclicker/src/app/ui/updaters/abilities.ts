import { t } from "../../i18n";
import {
  formatAbilityTooltip,
  getAbilityDefinition,
  getAbilityLabel,
  getAbilityProgress,
} from "../../abilities";
import type { AbilityId, GameState } from "../../state";
import type { UIRefs } from "../types";

export function updateAbilities(state: GameState, refs: UIRefs): void {
  const now = Date.now();
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const ability = getAbilityDefinition(abilityId as AbilityId);
    const runtime = state.abilities[abilityId as AbilityId];
    if (!ability || !runtime) {
      return;
    }

    const labelText = getAbilityLabel(state, abilityId as AbilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute("aria-label", labelText);

    const progress = getAbilityProgress(state, abilityId as AbilityId, now);
    const button = abilityRefs.container;
    const status = abilityRefs.status;
    const progressBar = abilityRefs.progressBar;

    button.classList.remove("is-active", "is-ready", "is-cooldown");

    let widthPercent = 0;

    if (runtime.active) {
      button.classList.add("is-active");
      button.disabled = true;
      const remaining = Math.max(0, progress.remaining);
      const filled = ability.durationSec > 0 ? (ability.durationSec - remaining) / ability.durationSec : 1;
      widthPercent = Math.max(0, Math.min(1, filled)) * 100;
      status.textContent = t(state.locale, "abilities.status.active", {
        seconds: Math.ceil(remaining),
      });
    } else if (progress.readyIn <= 0) {
      button.classList.add("is-ready");
      button.disabled = false;
      widthPercent = 100;
      status.textContent = t(state.locale, "abilities.status.ready");
    } else {
      button.classList.add("is-cooldown");
      button.disabled = true;
      const remainingCooldown = Math.max(0, progress.readyIn);
      const filled = ability.cooldownSec > 0 ? (ability.cooldownSec - remainingCooldown) / ability.cooldownSec : 0;
      widthPercent = Math.max(0, Math.min(1, filled)) * 100;
      status.textContent = t(state.locale, "abilities.status.cooldown", {
        seconds: Math.ceil(remainingCooldown),
      });
    }

    progressBar.style.width = `${widthPercent.toFixed(1)}%`;
  });
}
