import { t } from "../../i18n";
import type { GameState } from "../../state";
import { achievements } from "../../data/achievements";
import type { UIRefs } from "../types";

export function updateAchievements(state: GameState, refs: UIRefs): void {
  const { achievements: achievementRefs } = refs.sidePanel;

  achievements.forEach((definition) => {
    const card = achievementRefs.entries.get(definition.id);
    if (!card) {
      return;
    }

    card.title.textContent = definition.name[state.locale];
    card.description.textContent = definition.description[state.locale];

    if (definition.rewardMultiplier) {
      const percent = Math.round((definition.rewardMultiplier - 1) * 100);
      card.reward.textContent = t(state.locale, "achievements.reward", { value: percent });
      card.reward.classList.remove("hidden");
    } else {
      card.reward.textContent = "";
      card.reward.classList.add("hidden");
    }

    const unlocked = Boolean(state.achievements[definition.id]);
    card.status.textContent = unlocked
      ? t(state.locale, "achievements.status.unlocked")
      : t(state.locale, "achievements.status.locked");
    card.container.classList.toggle("is-unlocked", unlocked);
  });
}
