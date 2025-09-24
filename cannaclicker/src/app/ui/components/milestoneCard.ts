import type { MilestoneCardRefs } from "../types";

export function createMilestoneCard(): MilestoneCardRefs {
  const container = document.createElement("article");
  container.className = "milestone-card";

  const header = document.createElement("div");
  header.className = "milestone-card__header";

  const title = document.createElement("h3");
  title.className = "milestone-card__title";
  header.appendChild(title);

  const badge = document.createElement("span");
  badge.className = "milestone-card__badge";
  header.appendChild(badge);

  container.appendChild(header);

  const reward = document.createElement("p");
  reward.className = "milestone-card__reward";
  container.appendChild(reward);

  const description = document.createElement("p");
  description.className = "milestone-card__description";
  container.appendChild(description);

  const progressBar = document.createElement("div");
  progressBar.className = "milestone-card__progress";

  const progressFill = document.createElement("div");
  progressFill.className = "milestone-card__progress-fill";
  progressBar.appendChild(progressFill);
  container.appendChild(progressBar);

  const progressLabel = document.createElement("p");
  progressLabel.className = "milestone-card__progress-label";
  container.appendChild(progressLabel);

  return {
    container,
    title,
    reward,
    description,
    badge,
    progressBar,
    progressFill,
    progressLabel,
  } satisfies MilestoneCardRefs;
}
