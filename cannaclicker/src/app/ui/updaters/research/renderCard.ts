import { t, type LocaleKey } from "../../../i18n";
import { formatDecimal } from "../../../math";
import type { GameState } from "../../../state";
import type { ResearchViewModel } from "../../../research";
import type { ResearchCardRefs } from "../../types";
import type { ResearchEffect } from "../../../../data/research";
import { formatResearchEffect, formatResearchLockReason } from "./text";
import { getResearchNode } from "../../../research";

export function renderResearchCard(
  card: ResearchCardRefs,
  entry: ResearchViewModel,
  state: GameState,
): void {
  const { node } = entry;

  card.container.classList.toggle("is-owned", entry.owned);
  card.container.classList.toggle("is-locked", entry.blocked);

  if (card.icon && node.icon) {
    card.icon.src = node.icon;
  }

  card.path.textContent = t(state.locale, `research.path.${node.path}`);
  card.title.textContent = node.name[state.locale];
  card.description.textContent = node.desc[state.locale];

  renderEffectChips(card, node.effects, state.locale);
  renderRequirements(card, entry, state.locale);
  renderLockState(card, entry, state);
  renderCost(card, node.costType, node.cost, state.locale);
  renderActionButton(card, entry, state.locale);
}

function renderEffectChips(
  card: ResearchCardRefs,
  effects: ResearchEffect[],
  locale: LocaleKey,
): void {
  if (effects.length === 0) {
    card.effects.innerHTML = "";
    card.effects.classList.add("hidden");
    return;
  }

  card.effects.classList.remove("hidden");
  card.effects.innerHTML = "";
  effects.forEach((effect) => {
    const chip = document.createElement("li");
    chip.className =
      "inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200";
    chip.textContent = formatResearchEffect(locale, effect);
    card.effects.appendChild(chip);
  });
}

function renderRequirements(
  card: ResearchCardRefs,
  entry: ResearchViewModel,
  locale: LocaleKey,
): void {
  const { node } = entry;

  if (!node.requires || node.requires.length === 0) {
    card.requires.textContent = "";
    card.requires.classList.add("hidden");
    return;
  }

  const names = node.requires
    .map((requirementId) => getResearchNode(requirementId)?.name[locale] ?? requirementId)
    .join(", ");
  card.requires.textContent = t(locale, "research.requires", { list: names });
  card.requires.classList.remove("hidden");
}

function renderLockState(card: ResearchCardRefs, entry: ResearchViewModel, state: GameState): void {
  if (entry.owned || !entry.lockReason) {
    card.lock.textContent = "";
    card.lock.classList.add("hidden");
    return;
  }

  card.lock.textContent = formatResearchLockReason(state, entry.lockReason);
  card.lock.classList.remove("hidden");
}

function renderCost(
  card: ResearchCardRefs,
  costType: "buds" | "seeds",
  cost: number,
  locale: LocaleKey,
): void {
  const costLabelKey = costType === "buds" ? "research.cost.buds" : "research.cost.seeds";
  const costValue = costType === "buds" ? formatDecimal(cost) : cost.toString();
  card.cost.textContent = `${t(locale, costLabelKey)}: ${costValue}`;
}

function renderActionButton(
  card: ResearchCardRefs,
  entry: ResearchViewModel,
  locale: LocaleKey,
): void {
  if (entry.owned) {
    card.button.textContent = t(locale, "research.button.owned");
    card.button.disabled = true;
  } else if (entry.blocked) {
    card.button.textContent = t(locale, "research.button.locked");
    card.button.disabled = true;
  } else {
    card.button.textContent = t(locale, "research.button.buy");
    card.button.disabled = !entry.affordable;
  }

  card.button.setAttribute("aria-disabled", card.button.disabled ? "true" : "false");
}
