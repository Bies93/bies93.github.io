import { milestones } from '../../../data/milestones';
import type { MilestoneId } from '../../../data/milestones';
import { ascensionNodes, type AscensionNodeId } from '../../../data/ascension';
import type {
  AscensionNodeCardRefs,
  MilestoneCardRefs,
  PrestigePanelRefs,
} from '../types/prestige';
import { createMilestoneCard } from './milestoneCard';

export function createPrestigePanel(): PrestigePanelRefs {
  const container = document.createElement('div');
  container.className = 'prestige-panel surface--prestige';

  const description = document.createElement('p');
  description.className = 'prestige-panel__description';
  container.appendChild(description);

  const stats = document.createElement('div');
  stats.className = 'prestige-panel__stats';
  container.appendChild(stats);

  const spendableSeeds = createPrestigePanelStat(stats);
  const totalSeeds = createPrestigePanelStat(stats);
  const permanent = createPrestigePanelStat(stats);
  const kickstart = createPrestigePanelStat(stats);
  const active = createPrestigePanelStat(stats);

  const ascensionSection = document.createElement('section');
  ascensionSection.className = 'ascension-panel surface--prestige';
  container.appendChild(ascensionSection);

  const ascensionHeader = document.createElement('div');
  ascensionHeader.className = 'ascension-panel__header';

  const ascensionTitle = document.createElement('h3');
  ascensionTitle.className = 'ascension-panel__title';
  ascensionTitle.textContent = 'Ascension';

  const ascensionSummary = document.createElement('p');
  ascensionSummary.className = 'ascension-panel__summary';

  ascensionHeader.append(ascensionTitle, ascensionSummary);
  ascensionSection.appendChild(ascensionHeader);

  const ascensionList = document.createElement('div');
  ascensionList.className = 'ascension-list';
  ascensionSection.appendChild(ascensionList);

  const ascensionRefs = new Map<AscensionNodeId, AscensionNodeCardRefs>();
  ascensionNodes.forEach((definition) => {
    const card = createAscensionNodeCard(definition.id);
    ascensionRefs.set(definition.id, card);
    ascensionList.appendChild(card.container);
  });

  const milestoneList = document.createElement('div');
  milestoneList.className = 'milestone-list';
  container.appendChild(milestoneList);

  const milestoneRefs = new Map<MilestoneId, MilestoneCardRefs>();
  milestones.forEach((definition) => {
    const card = createMilestoneCard();
    milestoneRefs.set(definition.id, card);
    milestoneList.appendChild(card.container);
  });

  const requirement = document.createElement('p');
  requirement.className = 'prestige-panel__requirement';
  container.appendChild(requirement);

  const actionButton = document.createElement('button');
  actionButton.type = 'button';
  actionButton.className = 'prestige-panel__action';
  actionButton.dataset.id = 'prestige';
  actionButton.dataset.role = 'prestige-action';
  actionButton.dataset.kind = 'prestige';
  container.appendChild(actionButton);

  return {
    container,
    description,
    spendableSeedsLabel: spendableSeeds.label,
    spendableSeedsValue: spendableSeeds.value,
    totalSeedsLabel: totalSeeds.label,
    totalSeedsValue: totalSeeds.value,
    permanentLabel: permanent.label,
    permanentValue: permanent.value,
    kickstartLabel: kickstart.label,
    kickstartValue: kickstart.value,
    activeKickstartLabel: active.label,
    activeKickstartValue: active.value,
    ascensionSummary,
    ascensionList,
    ascensionNodes: ascensionRefs,
    milestoneList,
    milestones: milestoneRefs,
    requirement,
    actionButton,
  } satisfies PrestigePanelRefs;
}

function createAscensionNodeCard(id: AscensionNodeId): AscensionNodeCardRefs {
  const container = document.createElement('article');
  container.className = 'ascension-node surface--prestige';
  container.dataset.id = id;

  const category = document.createElement('p');
  category.className = 'ascension-node__category';

  const title = document.createElement('h4');
  title.className = 'ascension-node__title';

  const description = document.createElement('p');
  description.className = 'ascension-node__description';

  const effect = document.createElement('p');
  effect.className = 'ascension-node__effect';

  const footer = document.createElement('div');
  footer.className = 'ascension-node__footer';

  const cost = document.createElement('p');
  cost.className = 'ascension-node__cost';

  const status = document.createElement('p');
  status.className = 'ascension-node__status';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ascension-node__button';
  button.dataset.id = id;
  button.dataset.role = 'ascension-buy';
  button.dataset.kind = 'prestige';

  footer.append(cost, status, button);
  container.append(category, title, description, effect, footer);

  return {
    container,
    title,
    category,
    description,
    effect,
    cost,
    status,
    button,
  } satisfies AscensionNodeCardRefs;
}

function createPrestigePanelStat(wrapper: HTMLElement): { label: HTMLElement; value: HTMLElement } {
  const row = document.createElement('div');
  row.className = 'prestige-panel__stat';

  const label = document.createElement('dt');
  label.className = 'prestige-panel__stat-label';
  row.appendChild(label);

  const value = document.createElement('dd');
  value.className = 'prestige-panel__stat-value';
  row.appendChild(value);

  wrapper.appendChild(row);
  return { label, value };
}
