import { getResearchNode } from "../../../research";
import type { ResearchId } from "../../../../data/research";
import type { ResearchCardRefs } from "../../types";

export function createResearchCard(id: ResearchId): ResearchCardRefs {
  const node = getResearchNode(id);
  if (!node) {
    throw new Error(`Unknown research node ${id}`);
  }

  const container = document.createElement("article");
  container.className = "research-card";
  container.dataset.id = id;
  container.dataset.kind = "research";
  container.dataset.role = "card";

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
  button.dataset.id = id;
  button.dataset.role = "research-buy";
  button.dataset.kind = "research";
  actions.appendChild(button);

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
