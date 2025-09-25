import Decimal from "break_infinity.js";
import { t } from "../../../i18n";
import { formatDecimal } from "../../../math";
import type { GameState } from "../../../state";
import type { UpgradeEntry as UpgradeViewEntry } from "../../../upgrades";
import type { UpgradeCardRefs } from "../../types";

export function createUpgradeCard(
  definition: UpgradeViewEntry["definition"],
  state: GameState,
): UpgradeCardRefs {
  const container = document.createElement("article");
  container.className = "upgrade-card";
  container.dataset.upgradeId = definition.id;

  const iconWrap = document.createElement("div");
  iconWrap.className = "upgrade-card__media";
  const icon = document.createElement("img");
  icon.className = "upgrade-card__icon";
  icon.src = definition.icon;
  icon.alt = definition.name[state.locale];
  icon.decoding = "async";
  iconWrap.appendChild(icon);

  const body = document.createElement("div");
  body.className = "upgrade-card__body";

  const header = document.createElement("div");
  header.className = "upgrade-card__header";

  const category = document.createElement("span");
  category.className = "upgrade-card__category";
  category.textContent = t(state.locale, `upgrades.category.${definition.category}`);

  const name = document.createElement("h3");
  name.className = "upgrade-card__name";
  name.textContent = definition.name[state.locale];

  header.append(category, name);

  const description = document.createElement("p");
  description.className = "upgrade-card__description";
  description.textContent = definition.description[state.locale];

  const status = document.createElement("span");
  status.className = "upgrade-card__status";

  const progress = document.createElement("p");
  progress.className = "upgrade-card__progress hidden";

  const requirementList = document.createElement("ul");
  requirementList.className = "upgrade-card__requirements hidden";

  const footer = document.createElement("div");
  footer.className = "upgrade-card__footer";

  const costWrap = document.createElement("div");
  costWrap.className = "upgrade-card__cost-wrap";
  const costLabel = document.createElement("span");
  costLabel.className = "upgrade-card__cost-label";
  costLabel.textContent = t(state.locale, "upgrades.cost");
  const costValue = document.createElement("span");
  costValue.className = "upgrade-card__cost";
  costValue.textContent = formatDecimal(new Decimal(definition.cost));
  costWrap.append(costLabel, costValue);

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "upgrade-card__button";
  buyButton.textContent = t(state.locale, "upgrades.action.buy");

  footer.append(costWrap, buyButton);

  body.append(header, description, status, progress, requirementList, footer);
  container.append(iconWrap, body);

  return {
    container,
    icon,
    category,
    name,
    description,
    status,
    progress,
    requirementList,
    costLabel,
    costValue,
    buyButton,
  } satisfies UpgradeCardRefs;
}
