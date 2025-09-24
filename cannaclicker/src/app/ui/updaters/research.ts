import { t, type LocaleKey } from "../../i18n";
import { formatDecimal } from "../../math";
import type { GameState } from "../../state";
import {
  canAfford,
  getResearchList,
  getResearchNode,
  purchaseResearch,
  requirementsMet,
  type ResearchFilter,
  type ResearchLockReason,
  type ResearchViewModel,
} from "../../research";
import type { ResearchEffect, ResearchUnlockCondition } from "../../../data/research";
import type { ResearchCardRefs, UIRefs } from "../types";

export interface ResearchUpdateResult {
  activeFilter: ResearchFilter;
  researchFilterManuallySelected: boolean;
}

export function updateResearch(
  state: GameState,
  refs: UIRefs,
  activeFilter: ResearchFilter,
  researchFilterManuallySelected: boolean,
  onPurchase: () => void,
): ResearchUpdateResult {
  const lists: Record<ResearchFilter, ResearchViewModel[]> = {
    all: getResearchList(state, "all"),
    available: getResearchList(state, "available"),
    owned: getResearchList(state, "owned"),
  };

  let nextFilter = activeFilter;
  if (!researchFilterManuallySelected && nextFilter !== "all" && lists[nextFilter].length === 0) {
    nextFilter = "all";
  }

  refs.sidePanel.research.filters.forEach((button, key) => {
    const isActive = key === nextFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  renderResearchList(state, refs, nextFilter, onPurchase, lists[nextFilter]);

  return { activeFilter: nextFilter, researchFilterManuallySelected };
}

function renderResearchList(
  state: GameState,
  refs: UIRefs,
  activeFilter: ResearchFilter,
  onPurchase: () => void,
  entries?: ResearchViewModel[],
): void {
  const researchRefs = refs.sidePanel.research;
  const list = researchRefs.list;
  const data = entries ?? getResearchList(state, activeFilter);

  researchRefs.emptyState.textContent = t(state.locale, "research.empty");

  if (!data.length) {
    if (researchRefs.emptyState.parentElement !== list) {
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      list.appendChild(researchRefs.emptyState);
    }
    return;
  }

  if (researchRefs.emptyState.parentElement === list) {
    list.removeChild(researchRefs.emptyState);
  }

  const visible = new Set<string>();

  data.forEach((entry, index) => {
    let card = researchRefs.entries.get(entry.node.id);
    if (!card) {
      card = createResearchCard(entry.node.id, state, onPurchase);
      researchRefs.entries.set(entry.node.id, card);
    }

    updateResearchCard(card, entry, state);

    const currentChild = list.children.item(index);
    if (currentChild !== card.container) {
      list.insertBefore(card.container, currentChild ?? null);
    }

    visible.add(entry.node.id);
  });

  researchRefs.entries.forEach((card, id) => {
    if (!visible.has(id) && card.container.parentElement === list) {
      list.removeChild(card.container);
    }
  });
}

function createResearchCard(id: string, state: GameState, onPurchase: () => void): ResearchCardRefs {
  const node = getResearchNode(id);
  if (!node) {
    throw new Error(`Unknown research node ${id}`);
  }

  const container = document.createElement("article");
  container.className = "research-card";
  container.dataset.researchId = id;

  const header = document.createElement("div");
  header.className = "research-header";

  let icon: HTMLImageElement | null = null;
  if (node.icon) {
    icon = new Image();
    icon.src = node.icon;
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.decoding = "async";
    icon.className = "research-icon";
    header.appendChild(icon);
  }

  const heading = document.createElement("div");
  heading.className = "research-heading";

  const pathTag = document.createElement("span");
  pathTag.className = "research-path";
  heading.appendChild(pathTag);

  const title = document.createElement("h3");
  title.className = "research-name";
  heading.appendChild(title);

  const description = document.createElement("p");
  description.className = "research-desc";
  heading.appendChild(description);

  header.appendChild(heading);
  container.appendChild(header);

  const effects = document.createElement("ul");
  effects.className = "mt-3 flex flex-wrap gap-2";
  container.appendChild(effects);

  const requires = document.createElement("p");
  requires.className = "research-requires hidden";
  container.appendChild(requires);

  const lock = document.createElement("p");
  lock.className = "research-lock hidden";
  container.appendChild(lock);

  const cost = document.createElement("div");
  cost.className =
    "research-cost mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/60 px-3 py-1 text-sm text-neutral-200";
  container.appendChild(cost);

  const actions = document.createElement("div");
  actions.className = "research-actions";
  container.appendChild(actions);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "research-btn";
  button.dataset.researchId = id;
  actions.appendChild(button);

  button.addEventListener("click", () => {
    const currentNode = getResearchNode(id);
    if (!currentNode) {
      return;
    }

    if (state.researchOwned.includes(id)) {
      return;
    }

    if (!requirementsMet(state, currentNode) || !canAfford(state, currentNode)) {
      return;
    }

    if (currentNode.confirmKey) {
      const confirmation = t(state.locale, currentNode.confirmKey);
      if (!window.confirm(confirmation)) {
        return;
      }
    }

    const purchased = purchaseResearch(state, id);
    if (purchased) {
      onPurchase();
    }
  });

  return {
    id,
    container,
    icon,
    path: pathTag,
    title,
    description,
    effects,
    requires,
    lock,
    cost,
    button,
  } satisfies ResearchCardRefs;
}

function updateResearchCard(card: ResearchCardRefs, entry: ResearchViewModel, state: GameState): void {
  const { node } = entry;

  card.container.classList.toggle("is-owned", entry.owned);
  card.container.classList.toggle("is-locked", entry.blocked);

  if (card.icon && node.icon) {
    card.icon.src = node.icon;
  }

  card.path.textContent = t(state.locale, `research.path.${node.path}`);
  card.title.textContent = node.name[state.locale];
  card.description.textContent = node.desc[state.locale];

  if (node.effects.length > 0) {
    card.effects.classList.remove("hidden");
    card.effects.innerHTML = "";
    node.effects.forEach((effect) => {
      const chip = document.createElement("li");
      chip.className =
        "inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200";
      chip.textContent = formatResearchEffect(state.locale, effect);
      card.effects.appendChild(chip);
    });
  } else {
    card.effects.innerHTML = "";
    card.effects.classList.add("hidden");
  }

  if (node.requires && node.requires.length > 0) {
    const names = node.requires
      .map((requirementId) => getResearchNode(requirementId)?.name[state.locale] ?? requirementId)
      .join(", ");
    card.requires.textContent = t(state.locale, "research.requires", { list: names });
    card.requires.classList.remove("hidden");
  } else {
    card.requires.textContent = "";
    card.requires.classList.add("hidden");
  }

  if (!entry.owned && entry.lockReason) {
    card.lock.textContent = formatResearchLockReason(state, entry.lockReason);
    card.lock.classList.remove("hidden");
  } else {
    card.lock.textContent = "";
    card.lock.classList.add("hidden");
  }

  const costLabelKey = node.costType === "buds" ? "research.cost.buds" : "research.cost.seeds";
  const costValue = node.costType === "buds" ? formatDecimal(node.cost) : node.cost.toString();
  card.cost.textContent = `${t(state.locale, costLabelKey)}: ${costValue}`;

  if (entry.owned) {
    card.button.textContent = t(state.locale, "research.button.owned");
    card.button.disabled = true;
  } else if (entry.blocked) {
    card.button.textContent = t(state.locale, "research.button.locked");
    card.button.disabled = true;
  } else {
    card.button.textContent = t(state.locale, "research.button.buy");
    card.button.disabled = !entry.affordable;
  }

  card.button.setAttribute("aria-disabled", card.button.disabled ? "true" : "false");
}

function formatResearchEffect(locale: LocaleKey, effect: ResearchEffect): string {
  if (effect.labelKey) {
    if (effect.id === "BUILDING_MULT") {
      const factor = Number.isFinite(effect.v) && effect.v ? effect.v : 1;
      return t(locale, effect.labelKey, { value: factor.toFixed(2) });
    }

    if (effect.id === "HYBRID_BUFF_PER_ACTIVE") {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, effect.labelKey, { percent });
    }

    if (effect.id === "STRAIN_CHOICE") {
      return t(locale, effect.labelKey);
    }
  }

  switch (effect.id) {
    case "BPC_MULT":
      return t(locale, "research.effect.bpc", { value: (effect.v ?? 1).toFixed(2) });
    case "BPS_MULT":
      return t(locale, "research.effect.bps", { value: (effect.v ?? 1).toFixed(2) });
    case "COST_REDUCE_ALL": {
      const percent = Math.round((1 - (effect.v ?? 1)) * 100);
      return t(locale, "research.effect.cost", { value: percent });
    }
    case "CLICK_AUTOMATION":
      return t(locale, "research.effect.autoclick", { value: effect.v ?? 0 });
    case "ABILITY_OVERDRIVE_PLUS": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.overdrive", { value: percent });
    }
    case "OFFLINE_CAP_HOURS_ADD": {
      const hours = Math.round(effect.v ?? 0);
      return t(locale, "research.effect.offline", { value: hours });
    }
    case "ABILITY_DURATION_MULT": {
      const percent = Math.round(((effect.v ?? 1) - 1) * 100);
      return t(locale, "research.effect.abilityDuration", { value: percent });
    }
    case "HYBRID_BUFF_PER_ACTIVE": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.hybridBuff", { percent });
    }
    case "STRAIN_CHOICE":
      return "";
    case "SEED_CLICK_BONUS": {
      const percent = Math.round((effect.v ?? 0) * 100);
      return t(locale, "research.effect.seedClick", { value: percent });
    }
    case "SEED_PASSIVE": {
      if (effect.seedPassive) {
        const minutes = Math.round(effect.seedPassive.intervalMinutes);
        const chance = Math.round(effect.seedPassive.chance * 100);
        const seeds = Math.max(1, Math.floor(effect.seedPassive.seeds));
        return t(locale, "research.effect.seedPassive", {
          minutes,
          chance,
          seeds,
        });
      }
      return "";
    }
    default:
      return "";
  }
}

function formatResearchLockReason(state: GameState, reason: ResearchLockReason): string {
  const locale = state.locale;
  if (reason.kind === "exclusive") {
    return t(locale, "research.lock.exclusive");
  }

  const entries = reason.conditions
    .map((condition) => describeUnlockCondition(state, condition))
    .filter((text): text is string => text.length > 0);

  const list = entries.join(", ");
  if (reason.kind === "unlock_all") {
    return t(locale, "research.lock.all", { list });
  }

  return t(locale, "research.lock.any", { list });
}

function describeUnlockCondition(state: GameState, condition: ResearchUnlockCondition): string {
  const locale = state.locale;
  switch (condition.type) {
    case "total_buds":
      return t(locale, "research.lock.totalBuds", { value: formatDecimal(condition.value) });
    case "prestige_seeds":
      return t(locale, "research.lock.prestigeSeeds", {
        value: condition.value,
        current: state.prestige.seeds,
      });
    default:
      return "";
  }
}

