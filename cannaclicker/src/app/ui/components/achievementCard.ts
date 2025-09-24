import { withBase } from "../paths";
import { buildItemSrcset } from "./media";
import type { AchievementDefinition } from "../../data/achievements";
import type { AchievementCardRefs } from "../types";

export function createAchievementCard(definition: AchievementDefinition): AchievementCardRefs {
  const container = document.createElement("article");
  container.className = "achievement-card";

  const badge = document.createElement("div");
  badge.className = "achievement-card__badge";

  const base = new Image();
  base.src = withBase("achievements/badge-base.png");
  base.srcset = buildItemSrcset(withBase("achievements/badge-base.png"));
  base.alt = "";
  base.decoding = "async";
  base.className = "achievement-card__badge-base";

  const overlay = new Image();
  overlay.src = definition.overlayIcon;
  overlay.srcset = buildItemSrcset(definition.overlayIcon);
  overlay.alt = "";
  overlay.decoding = "async";
  overlay.className = "achievement-card__badge-overlay";

  const ribbon = new Image();
  ribbon.src = withBase("achievements/badge-ribbon.png");
  ribbon.srcset = buildItemSrcset(withBase("achievements/badge-ribbon.png"));
  ribbon.alt = "";
  ribbon.decoding = "async";
  ribbon.className = "achievement-card__badge-ribbon";

  badge.append(base, overlay, ribbon);
  container.appendChild(badge);

  const content = document.createElement("div");
  content.className = "achievement-card__content";

  const title = document.createElement("h3");
  title.className = "achievement-card__title";
  content.appendChild(title);

  const description = document.createElement("p");
  description.className = "achievement-card__description";
  content.appendChild(description);

  const reward = document.createElement("p");
  reward.className = "achievement-card__reward";
  content.appendChild(reward);

  const status = document.createElement("span");
  status.className = "achievement-card__status";
  content.appendChild(status);

  container.appendChild(content);

  return {
    container,
    iconBase: base,
    iconOverlay: overlay,
    title,
    description,
    reward,
    status,
  } satisfies AchievementCardRefs;
}
