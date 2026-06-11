import { t } from '../../../i18n';
import type { GameState } from '../../../state';
import { createItemSrcset } from '../../components/media';
import { createDetail } from '../../components/stats';
import type { ItemDefinition } from '../../../../data/items';
import type { ShopCardRefs } from '../../types';

export function createShopCard(definition: ItemDefinition, state: GameState): ShopCardRefs {
  const container = document.createElement('article');
  container.className =
    'relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/70 p-3 shadow-card backdrop-blur-sm transition hover:border-emerald-400/40';
  container.classList.add('shop-card', 'surface--crate');
  container.dataset.itemId = definition.id;

  const info = document.createElement('div');
  info.className = 'shop-card__info';

  const headerRow = document.createElement('div');
  headerRow.className = 'shop-card__header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'shop-card__title-wrap';

  const name = document.createElement('h3');
  name.className = 'shop-card__name';
  titleWrap.appendChild(name);

  const role = document.createElement('p');
  role.className = 'shop-card__role';
  titleWrap.appendChild(role);

  const description = document.createElement('p');
  description.className = 'shop-card__description';

  const roiBadge = document.createElement('span');
  roiBadge.className = 'roi-badge';

  const roiValue = document.createElement('span');
  roiValue.className = 'roi-badge__value';
  roiBadge.appendChild(roiValue);

  headerRow.append(titleWrap, roiBadge);
  info.appendChild(headerRow);

  const tierHeader = document.createElement('div');
  tierHeader.className = 'tier-header';

  const stageWrap = document.createElement('div');
  stageWrap.className = 'flex items-center gap-2';

  const stageLabel = document.createElement('span');
  stageLabel.className = 'tier-label';
  stageWrap.appendChild(stageLabel);

  const softcapBadge = document.createElement('span');
  softcapBadge.className = 'softcap-badge hidden';
  stageWrap.appendChild(softcapBadge);

  tierHeader.appendChild(stageWrap);

  const stageProgressText = document.createElement('span');
  stageProgressText.className = 'tier-progress-text';
  tierHeader.appendChild(stageProgressText);

  const progressTrack = document.createElement('div');
  progressTrack.className = 'tier-progress-track';

  const progressBar = document.createElement('div');
  progressBar.className = 'tier-progress-bar';
  progressTrack.appendChild(progressBar);

  info.append(tierHeader, progressTrack);

  const unlockHint = document.createElement('p');
  unlockHint.className = 'shop-card__unlock-hint hidden';

  const details = document.createElement('dl');
  details.className = 'shop-card__details-grid';

  const cost = createDetail(details, t(state.locale, 'shop.cost'));
  const owned = createDetail(details, t(state.locale, 'shop.owned'));
  const currentProduction = createDetail(details, t(state.locale, 'shop.productionCurrent'));
  const nextProduction = createDetail(details, t(state.locale, 'shop.productionAfter'));
  const share = createDetail(details, t(state.locale, 'shop.productionShare'));

  const delta = document.createElement('p');
  delta.className = 'shop-card__delta';
  info.appendChild(delta);

  const actions = document.createElement('div');
  actions.className = 'shop-card__actions';

  const buyButton = document.createElement('button');
  buyButton.type = 'button';
  buyButton.className = 'buy-btn h-10 flex-1';
  buyButton.textContent = t(state.locale, 'actions.buyOne');
  buyButton.dataset.id = definition.id;
  buyButton.dataset.role = 'shop-buy';
  buyButton.dataset.kind = 'shop';
  buyButton.dataset.quantity = 'one';

  const buyTenButton = document.createElement('button');
  buyTenButton.type = 'button';
  buyTenButton.className = 'buy-btn shop-card__bulk-btn';
  buyTenButton.textContent = t(state.locale, 'actions.buyTen');
  buyTenButton.dataset.id = definition.id;
  buyTenButton.dataset.role = 'shop-buy-ten';
  buyTenButton.dataset.kind = 'shop';
  buyTenButton.dataset.quantity = 'ten';

  const buyTwentyFiveButton = document.createElement('button');
  buyTwentyFiveButton.type = 'button';
  buyTwentyFiveButton.className = 'buy-btn shop-card__bulk-btn';
  buyTwentyFiveButton.textContent = t(state.locale, 'actions.buyTwentyFive');
  buyTwentyFiveButton.dataset.id = definition.id;
  buyTwentyFiveButton.dataset.role = 'shop-buy-twenty-five';
  buyTwentyFiveButton.dataset.kind = 'shop';
  buyTwentyFiveButton.dataset.quantity = 'twentyFive';

  const maxButton = document.createElement('button');
  maxButton.type = 'button';
  maxButton.className = 'buy-btn shop-card__bulk-btn';
  maxButton.textContent = t(state.locale, 'actions.max');
  maxButton.dataset.id = definition.id;
  maxButton.dataset.role = 'shop-max';
  maxButton.dataset.kind = 'shop';
  maxButton.dataset.quantity = 'max';

  actions.append(buyButton, buyTenButton, buyTwentyFiveButton, maxButton);
  info.appendChild(actions);

  const media = document.createElement('div');
  media.className = 'shop-card__media';
  media.tabIndex = 0;
  media.setAttribute('role', 'button');
  media.setAttribute('aria-expanded', 'false');

  const iconFrame = document.createElement('div');
  iconFrame.className = 'shop-card__icon-frame';

  const icon = document.createElement('img');
  icon.src = definition.icon;
  icon.srcset = createItemSrcset(definition.icon);
  icon.alt = definition.name[state.locale];
  icon.decoding = 'async';
  icon.className = 'shop-card__icon';

  const ownedBadge = document.createElement('span');
  ownedBadge.className = 'shop-card__owned-badge';

  const detailPanel = document.createElement('div');
  detailPanel.id = `shop-card-details-${definition.id}`;
  detailPanel.className = 'shop-card__details-popover';
  detailPanel.setAttribute('aria-live', 'polite');
  media.setAttribute('aria-describedby', detailPanel.id);

  iconFrame.appendChild(icon);
  detailPanel.append(description, details, unlockHint);
  media.append(iconFrame, ownedBadge, detailPanel);

  container.append(info, media);

  return {
    container,
    media,
    detailPanel,
    icon,
    name,
    description,
    role,
    roiBadge,
    roiValue,
    ownedBadge,
    stageLabel,
    stageProgressBar: progressBar,
    stageProgressText,
    softcapBadge,
    unlockHint,
    costLabel: cost.label,
    cost: cost.value,
    ownedLabel: owned.label,
    owned: owned.value,
    currentProductionLabel: currentProduction.label,
    currentProduction: currentProduction.value,
    nextProductionLabel: nextProduction.label,
    nextProduction: nextProduction.value,
    shareLabel: share.label,
    share: share.value,
    delta,
    buyButton,
    buyTenButton,
    buyTwentyFiveButton,
    maxButton,
  } satisfies ShopCardRefs;
}
