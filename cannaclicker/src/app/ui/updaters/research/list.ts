import { t } from '../../../i18n';
import type { GameState } from '../../../state';
import { getResearchList, type ResearchFilter, type ResearchViewModel } from '../../../research';
import { RESEARCH_PATHS, type ResearchId, type ResearchPath } from '../../../../data/research';
import type { UIRefs } from '../../types';
import type { ResearchCardRefs } from '../../types';
import { renderResearchCard } from './renderCard';
import { createResearchCard } from './makeCard';
import { wireResearchCard } from './wireCard';

export function renderResearchList(
  state: GameState,
  refs: UIRefs,
  activeFilter: ResearchFilter,
  onPurchase: () => void,
  entries?: ResearchViewModel[],
): void {
  const researchRefs = refs.sidePanel.research;
  const list = researchRefs.list;
  const data = entries ?? getResearchList(state, activeFilter);

  researchRefs.emptyState.textContent = t(state.locale, 'research.empty');
  updateResearchPathSummary(state, refs, data);

  if (data.length === 0) {
    ensureEmptyState(list, researchRefs.emptyState);
    return;
  }

  removeEmptyState(list, researchRefs.emptyState);

  const visible = new Set<ResearchId>();

  data.forEach((entry, index) => {
    const card = ensureResearchCard(state, researchRefs.entries, entry, onPurchase);
    renderResearchCard(card, entry, state);
    syncListOrder(list, card.container, index);
    visible.add(entry.node.id);
  });

  removeHiddenCards(list, researchRefs.entries, visible);
}

function updateResearchPathSummary(
  state: GameState,
  refs: UIRefs,
  visibleEntries: ResearchViewModel[],
): void {
  const wrapper = refs.sidePanel.research.pathSummary;
  wrapper.innerHTML = '';
  const visibleIds = new Set(visibleEntries.map((entry) => entry.node.id));

  (Object.keys(RESEARCH_PATHS) as ResearchPath[]).forEach((path) => {
    const nodes = RESEARCH_PATHS[path];
    const owned = nodes.filter((node) => state.researchOwned.includes(node.id)).length;
    const available = nodes.filter((node) => visibleIds.has(node.id)).length;
    const chip = document.createElement('span');
    chip.className = 'research-path-summary__chip';
    chip.dataset.path = path;
    chip.textContent = t(state.locale, 'research.pathSummary', {
      path: t(state.locale, `research.path.${path}`),
      owned,
      total: nodes.length,
      available,
    });
    wrapper.appendChild(chip);
  });
}

function ensureEmptyState(list: Element, emptyState: HTMLElement): void {
  if (emptyState.parentElement === list) {
    return;
  }

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  list.appendChild(emptyState);
}

function removeEmptyState(list: Element, emptyState: HTMLElement): void {
  if (emptyState.parentElement === list) {
    list.removeChild(emptyState);
  }
}

function ensureResearchCard(
  state: GameState,
  entries: Map<ResearchId, ResearchCardRefs>,
  entry: ResearchViewModel,
  onPurchase: () => void,
): ResearchCardRefs {
  let card = entries.get(entry.node.id);
  if (!card) {
    card = createResearchCard(entry.node.id);
    entries.set(entry.node.id, card);
    wireResearchCard(state, card, onPurchase);
  }
  return card;
}

function syncListOrder(list: Element, card: HTMLElement, targetIndex: number): void {
  const currentChild = list.children.item(targetIndex);
  if (currentChild !== card) {
    list.insertBefore(card, currentChild ?? null);
  }
}

function removeHiddenCards(
  list: Element,
  entries: Map<ResearchId, ResearchCardRefs>,
  visible: Set<ResearchId>,
): void {
  entries.forEach((card, id) => {
    if (!visible.has(id) && card.container.parentElement === list) {
      list.removeChild(card.container);
    }
  });
}
