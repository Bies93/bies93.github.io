import { t, type LocaleKey } from "../../i18n";
import { withBase } from "../paths";
import { createStatBlock } from "../components/stats";
import type { UISeedRefs, UIStatRefs } from "../types";

export interface MountHeaderArgs {
  root: HTMLElement;
  statsLabels: Map<string, HTMLElement>;
  statsMeta: Map<string, HTMLElement>;
  locale: LocaleKey;
}

export interface MountHeaderResult
  extends Pick<UIStatRefs, "total" | "seeds" | "seedRate" | "prestigeMult">,
    UISeedRefs {}

export function mountHeader(args: MountHeaderArgs): MountHeaderResult {
  const { root, statsLabels, statsMeta, locale } = args;

  const infoRibbon = document.createElement("section");
  infoRibbon.className = "info-ribbon fade-in";
  infoRibbon.dataset.uiRole = "hud";
  infoRibbon.dataset.testid = "hud-ribbon";
  infoRibbon.setAttribute("role", "region");
  infoRibbon.setAttribute("aria-label", t(locale, "ui.sections.hud"));

  const infoList = document.createElement("div");
  infoList.className = "info-ribbon__list";
  infoList.dataset.uiRole = "hud-list";
  infoList.dataset.testid = "hud-list";
  infoList.setAttribute("role", "list");
  infoRibbon.appendChild(infoList);

  const total = createStatBlock("stats.total", infoList, statsLabels, statsMeta);
  const seeds = createStatBlock("stats.seeds", infoList, statsLabels, statsMeta);
  const seedRate = createStatBlock("stats.seedRate", infoList, statsLabels, statsMeta);
  const prestigeMult = createStatBlock(
    "stats.prestigeMult",
    infoList,
    statsLabels,
    statsMeta,
  );

  const infoActions = document.createElement("div");
  infoActions.className = "info-ribbon__actions";
  infoActions.dataset.uiRole = "hud-actions";
  infoActions.dataset.testid = "hud-actions";
  infoRibbon.appendChild(infoActions);

  const seedBadge = document.createElement("button");
  seedBadge.type = "button";
  seedBadge.className = "prestige-badge";
  seedBadge.dataset.uiRole = "seed-badge";
  seedBadge.dataset.testid = "seed-badge";
  seedBadge.setAttribute("aria-label", t(locale, "ui.controls.seedBadge"));

  const seedIcon = new Image();
  seedIcon.src = withBase("icons/ui/ui-seed.png");
  seedIcon.alt = "";
  seedIcon.decoding = "async";
  seedIcon.className = "prestige-badge__icon";

  const seedBadgeValue = document.createElement("span");
  seedBadgeValue.className = "prestige-badge__value";

  seedBadge.append(seedIcon, seedBadgeValue);
  infoActions.appendChild(seedBadge);

  root.appendChild(infoRibbon);

  return {
    total,
    seeds,
    seedRate,
    prestigeMult,
    seedBadge,
    seedBadgeValue,
  };
}
