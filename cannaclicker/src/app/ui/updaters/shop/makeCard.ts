import { t } from "../../../i18n";
import type { GameState } from "../../../state";
import { createItemSrcset } from "../../components/media";
import { createDetail } from "../../components/stats";
import type { ItemDefinition } from "../../../../data/items";
import type { ShopCardRefs } from "../../types";

export function createShopCard(definition: ItemDefinition, state: GameState): ShopCardRefs {
  const container = document.createElement("article");
  container.className =
    "relative grid gap-4 rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-card backdrop-blur-sm transition hover:border-emerald-400/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5";
  container.classList.add("shop-card");

  const info = document.createElement("div");
  info.className = "flex flex-col gap-3";

  const headerRow = document.createElement("div");
  headerRow.className = "flex items-start justify-between gap-3";

  const titleWrap = document.createElement("div");
  titleWrap.className = "space-y-1 flex-1";

  const name = document.createElement("h3");
  name.className = "text-lg font-semibold text-neutral-100";
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm leading-snug text-neutral-400";
  titleWrap.appendChild(description);

  const roiBadge = document.createElement("span");
  roiBadge.className = "roi-badge";

  const roiValue = document.createElement("span");
  roiValue.className = "roi-badge__value";
  roiBadge.appendChild(roiValue);

  headerRow.append(titleWrap, roiBadge);
  info.appendChild(headerRow);

  const tierHeader = document.createElement("div");
  tierHeader.className = "tier-header";

  const stageWrap = document.createElement("div");
  stageWrap.className = "flex items-center gap-2";

  const stageLabel = document.createElement("span");
  stageLabel.className = "tier-label";
  stageWrap.appendChild(stageLabel);

  const softcapBadge = document.createElement("span");
  softcapBadge.className = "softcap-badge hidden";
  stageWrap.appendChild(softcapBadge);

  tierHeader.appendChild(stageWrap);

  const stageProgressText = document.createElement("span");
  stageProgressText.className = "tier-progress-text";
  tierHeader.appendChild(stageProgressText);

  const progressTrack = document.createElement("div");
  progressTrack.className = "tier-progress-track";

  const progressBar = document.createElement("div");
  progressBar.className = "tier-progress-bar";
  progressTrack.appendChild(progressBar);

  info.append(tierHeader, progressTrack);

  const details = document.createElement("dl");
  details.className = "grid grid-cols-2 gap-x-4 gap-y-1 text-sm opacity-90";

  const cost = createDetail(details, t(state.locale, "shop.cost"));
  const owned = createDetail(details, t(state.locale, "shop.owned"));

  info.appendChild(details);

  const actions = document.createElement("div");
  actions.className = "mt-3 flex flex-wrap gap-2 sm:flex-nowrap";

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-btn h-10 flex-1";
  buyButton.textContent = t(state.locale, "actions.buy");
  buyButton.dataset.id = definition.id;
  buyButton.dataset.role = "shop-buy";
  buyButton.dataset.kind = "shop";

  const maxButton = document.createElement("button");
  maxButton.type = "button";
  maxButton.className =
    "h-10 shrink-0 rounded-lg border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300";
  maxButton.textContent = t(state.locale, "actions.max");
  maxButton.dataset.id = definition.id;
  maxButton.dataset.role = "shop-max";
  maxButton.dataset.kind = "shop";

  actions.append(buyButton, maxButton);
  info.appendChild(actions);

  const media = document.createElement("div");
  media.className = "w-24 aspect-square shrink-0 justify-self-center sm:justify-self-end sm:w-28 md:w-32";

  const icon = document.createElement("img");
  icon.src = definition.icon;
  icon.srcset = createItemSrcset(definition.icon);
  icon.alt = definition.name[state.locale];
  icon.decoding = "async";
  icon.className = "h-full w-full object-contain";

  media.appendChild(icon);

  container.append(info, media);

  return {
    container,
    icon,
    name,
    description,
    roiBadge,
    roiValue,
    stageLabel,
    stageProgressBar: progressBar,
    stageProgressText,
    softcapBadge,
    costLabel: cost.label,
    cost: cost.value,
    ownedLabel: owned.label,
    owned: owned.value,
    buyButton,
    maxButton,
  } satisfies ShopCardRefs;
}
