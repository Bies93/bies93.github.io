import Decimal from "break_infinity.js";
import {
  handleManualClick,
  buyItem,
  recalcDerivedValues,
  evaluateAchievements,
} from "./game";
import { getShopEntries, getMaxAffordable, formatPayback } from "./shop";
import { formatDecimal } from "./math";
import type { GameState } from "./state";
import { createDefaultState } from "./state";
import { createAudioManager } from "./audio";
import { t } from "./i18n";
import { exportSave, importSave, clearSave, save } from "./save";
import { spawnFloatingValue } from "./effects";
import { asset } from "./assets";
import { itemById } from "../data/items";

interface ControlButtonRefs {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLSpanElement;
}

interface UIRefs {
  root: HTMLElement;
  title: HTMLHeadingElement;
  statsLabels: Map<string, HTMLElement>;
  buds: HTMLElement;
  bps: HTMLElement;
  bpc: HTMLElement;
  total: HTMLElement;
  clickButton: HTMLButtonElement;
  clickLabel: HTMLSpanElement;
  clickIcon: HTMLImageElement;
  controls: {
    mute: ControlButtonRefs;
    export: ControlButtonRefs;
    import: ControlButtonRefs;
    reset: ControlButtonRefs;
  };
  announcer: HTMLElement;
  shopTitle: HTMLElement;
  shopList: HTMLElement;
  shopEntries: Map<string, ShopCardRefs>;
}

interface ShopCardRefs {
  container: HTMLElement;
  icon: HTMLImageElement;
  name: HTMLElement;
  description: HTMLElement;
  cost: HTMLElement;
  next: HTMLElement;
  owned: HTMLElement;
  payback: HTMLElement;
  buyButton: HTMLButtonElement;
  maxButton: HTMLButtonElement;
}

let refs: UIRefs | null = null;
let audio = createAudioManager(false);
let lastAnnounced = new Decimal(0);

export function renderUI(state: GameState): void {
  if (!refs) {
    refs = buildUI(state);
    audio.setMuted(state.muted);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    attachGlobalShortcuts();
  }

  updateStrings(state);
  updateStats(state);
  updateShop(state);
}

function buildUI(state: GameState): UIRefs {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app root missing");
  }

  root.innerHTML = "";
  root.className = "mx-auto flex max-w-6xl flex-col gap-4 p-4";

  const heroImageSet = `image-set(url("${asset("img/bg-hero-1920.png")}") type("image/png") 1x, url("${asset("img/bg-hero-2560.png")}") type("image/png") 2x)`;
  document.documentElement.style.setProperty("--hero-image", heroImageSet);

  const muteControl = createActionButton(asset("icons/ui/ui-mute.png"));
  const exportControl = createActionButton(asset("icons/ui/ui-export.png"));
  const importControl = createActionButton(asset("icons/ui/ui-import.png"));
  const resetControl = createDangerButton(asset("icons/ui/ui-reset.png"));

  const headerBar = document.createElement("header");
  headerBar.className =
    "flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 backdrop-blur-sm fade-in";

  const brand = document.createElement("div");
  brand.className = "flex items-center gap-3";

  const mark = document.createElement("img");
  mark.src = "./logo-leaf.svg";
  mark.alt = "";
  mark.className = "h-7 w-7";

  const word = document.createElement("img");
  word.src = "./logo-wordmark.svg";
  word.alt = "CannaClicker";
  word.className = "h-6";

  brand.append(mark, word);

  const controlsBar = document.createElement("div");
  controlsBar.className = "flex flex-wrap gap-2";
  controlsBar.append(
    muteControl.button,
    exportControl.button,
    importControl.button,
    resetControl.button,
  );

  headerBar.append(brand, controlsBar);
  root.appendChild(headerBar);

  const contentGrid = document.createElement("div");
  contentGrid.className = "grid gap-4 lg:grid-cols-[1fr_1fr] xl:gap-6";

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "space-y-4";

  const secondaryColumn = document.createElement("div");
  secondaryColumn.className = "space-y-4";

  contentGrid.append(primaryColumn, secondaryColumn);
  root.appendChild(contentGrid);

  const headerCard = document.createElement("section");
  headerCard.className = "card fade-in space-y-4";

  const title = document.createElement("h1");
  title.className = "text-3xl font-bold tracking-tight text-leaf-200";
  headerCard.appendChild(title);

  const statsGrid = document.createElement("dl");
  statsGrid.className = "grid grid-cols-2 gap-4 text-sm text-neutral-300";
  headerCard.appendChild(statsGrid);

  const statsLabels = new Map<string, HTMLElement>();

  const budsStat = createStatBlock("stats.buds", statsGrid, statsLabels);
  const bpsStat = createStatBlock("stats.bps", statsGrid, statsLabels);
  const bpcStat = createStatBlock("stats.bpc", statsGrid, statsLabels);
  const totalStat = createStatBlock("stats.total", statsGrid, statsLabels);


  primaryColumn.appendChild(headerCard);

  const clickCard = document.createElement("section");
  clickCard.className = "card fade-in space-y-4";

  const clickButton = document.createElement("button");
  clickButton.className = "click-button w-full";
  clickButton.type = "button";

  const clickIcon = document.createElement("img");
  clickIcon.src = asset("icons/ui/icon-leaf-click.png");
  clickIcon.alt = "";
  clickIcon.className = "click-icon";

  const clickLabel = document.createElement("span");
  clickLabel.className = "click-label";

  clickButton.append(clickIcon, clickLabel);

  clickCard.appendChild(clickButton);

  const announcer = document.createElement("p");
  announcer.setAttribute("data-sr-only", "true");
  announcer.setAttribute("aria-live", "polite");
  clickCard.appendChild(announcer);

  primaryColumn.appendChild(clickCard);

  const shopSection = document.createElement("section");
  shopSection.className = "card fade-in space-y-4";

  const shopTitle = document.createElement("h2");
  shopTitle.className = "text-xl font-semibold text-leaf-200";
  shopSection.appendChild(shopTitle);

  const shopList = document.createElement("div");
  shopList.className = "grid gap-3";
  shopSection.appendChild(shopList);

  secondaryColumn.appendChild(shopSection);

  const uiRefs: UIRefs = {
    root,
    title,
    statsLabels,
    buds: budsStat,
    bps: bpsStat,
    bpc: bpcStat,
    total: totalStat,
    clickButton,
    clickLabel,
    clickIcon,
    controls: {
      mute: muteControl,
      export: exportControl,
      import: importControl,
      reset: resetControl,
    },
    announcer,
    shopTitle,
    shopList,
    shopEntries: new Map(),
  };

  setupInteractions(uiRefs, state);

  return uiRefs;
}

function setupInteractions(refs: UIRefs, state: GameState): void {
  refs.clickButton.addEventListener("click", () => {
    const gained = handleManualClick(state);
    audio.playClick();
    spawnFloatingValue(refs.clickButton, `+${formatDecimal(gained)}`);
    announce(refs, state.buds);
    renderUI(state);
  });

  refs.controls.mute.button.addEventListener("click", () => {
    state.muted = audio.toggleMute();
    updateStrings(state);
  });

  refs.controls.export.button.addEventListener("click", async () => {
    const payload = exportSave(state);
    try {
      await navigator.clipboard.writeText(payload);
      alert("Save kopiert.");
    } catch {
      window.prompt("Save kopieren:", payload);
    }
  });

  refs.controls.import.button.addEventListener("click", () => {
    const payload = window.prompt("Bitte Base64-Spielstand einfügen:");
    if (!payload) {
      return;
    }

    try {
      const nextState = importSave(payload);
      Object.assign(state, nextState);
      recalcDerivedValues(state);
      evaluateAchievements(state);
      audio.setMuted(state.muted);
      renderUI(state);
    } catch (error) {
      console.error(error);
      alert("Import fehlgeschlagen.");
    }
  });

  refs.controls.reset.button.addEventListener("click", () => {
    const confirmReset = window.confirm("Spielstand wirklich löschen?");
    if (!confirmReset) {
      return;
    }

    clearSave();
    const fresh = createDefaultState({ locale: state.locale, muted: state.muted });
    Object.assign(state, fresh);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    renderUI(state);
  });
}

function attachGlobalShortcuts(): void {
  window.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return;
    }

    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      refs?.clickButton.click();
    }
  });
}

function updateStrings(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.title.textContent = t(state.locale, "app.title");
  refs.shopTitle.textContent = t(state.locale, "shop.title");
  refs.clickButton.setAttribute("aria-label", t(state.locale, "actions.click"));
  refs.clickLabel.textContent = t(state.locale, "actions.click");

  const muteAssets = state.muted
    ? { label: t(state.locale, "actions.unmute"), icon: asset("icons/ui/ui-unmute.png") }
    : { label: t(state.locale, "actions.mute"), icon: asset("icons/ui/ui-mute.png") };

  refs.controls.mute.icon.src = muteAssets.icon;
  refs.controls.mute.label.textContent = muteAssets.label;
  refs.controls.mute.button.setAttribute("aria-label", muteAssets.label);

  refs.controls.export.label.textContent = t(state.locale, "actions.export");
  refs.controls.export.button.setAttribute("aria-label", t(state.locale, "actions.export"));

  refs.controls.import.label.textContent = t(state.locale, "actions.import");
  refs.controls.import.button.setAttribute("aria-label", t(state.locale, "actions.import"));

  refs.controls.reset.label.textContent = t(state.locale, "actions.reset");
  refs.controls.reset.button.setAttribute("aria-label", t(state.locale, "actions.reset"));

  refs.statsLabels.forEach((label, key) => {
    label.textContent = t(state.locale, key);
  });

  refs.shopEntries.forEach((entry, itemId) => {
    const definition = itemById.get(itemId);
    if (!definition) {
      return;
    }

    entry.name.textContent = definition.name[state.locale];
    entry.description.textContent = definition.description[state.locale];
    entry.icon.alt = definition.name[state.locale];
    entry.buyButton.textContent = t(state.locale, "actions.buy");
    entry.maxButton.textContent = t(state.locale, "actions.max");
  });
}

function updateStats(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  refs.total.textContent = formatDecimal(state.total);
}

function updateShop(state: GameState): void {
  if (!refs) {
    return;
  }

  const entries = getShopEntries(state);

  entries.forEach((entry) => {
    let card = refs!.shopEntries.get(entry.definition.id);
    if (!card) {
      card = createShopCard(entry.definition.id, state);
      refs!.shopEntries.set(entry.definition.id, card);
    }

    card.icon.src = entry.definition.icon;

    if (entry.unlocked) {
      card.container.classList.remove("opacity-40");
      card.buyButton.disabled = !entry.affordable;
      card.maxButton.disabled = getMaxAffordable(entry.definition, state) === 0;
    } else {
      card.container.classList.add("opacity-40");
      card.buyButton.disabled = true;
      card.maxButton.disabled = true;
    }

    card.cost.textContent = entry.formattedCost;
    card.next.textContent = entry.formattedNextCost;
    card.owned.textContent = entry.owned.toString();
    card.payback.textContent = formatPayback(state.locale, entry.payback);
  });
}

function createShopCard(itemId: string, state: GameState): ShopCardRefs {
  if (!refs) {
    throw new Error("UI refs missing");
  }

  const definition = itemById.get(itemId);
  if (!definition) {
    throw new Error(`Unknown item ${itemId}`);
  }

  const container = document.createElement("article");
  container.className = "card relative overflow-hidden border-white/10 bg-neutral-900/40";

  const header = document.createElement("div");
  header.className = "flex items-start justify-between gap-3";

  const titleWrap = document.createElement("div");
  const name = document.createElement("h3");
  name.className = "text-lg font-semibold text-neutral-100";
  name.textContent = definition.name[state.locale];
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm text-neutral-400";
  description.textContent = definition.description[state.locale];
  titleWrap.appendChild(description);

  header.appendChild(titleWrap);

  const icon = document.createElement("img");
  icon.src = definition.icon;
  icon.alt = definition.name[state.locale];
  icon.className = "h-12 w-12 shrink-0 rounded-xl border border-white/5 bg-neutral-950/60 p-2";
  header.appendChild(icon);

  container.appendChild(header);

  const details = document.createElement("dl");
  details.className = "mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-300";

  const cost = createDetail(details, "Kosten");
  const next = createDetail(details, "Naechster Preis");
  const owned = createDetail(details, "Besitzt");
  const payback = createDetail(details, "Payback");

  container.appendChild(details);

  const actions = document.createElement("div");
  actions.className = "mt-4 flex items-center gap-2";

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className =
    "flex-1 rounded-lg bg-leaf-500/90 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-leaf-400 focus-visible:ring-2 focus-visible:ring-leaf-300";
  buyButton.textContent = t(state.locale, "actions.buy");

  const maxButton = document.createElement("button");
  maxButton.type = "button";
  maxButton.className =
    "rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:border-leaf-400 focus-visible:ring-2 focus-visible:ring-leaf-300";
  maxButton.textContent = t(state.locale, "actions.max");

  actions.append(buyButton, maxButton);
  container.appendChild(actions);

  refs.shopList.appendChild(container);

  buyButton.addEventListener("click", () => {
    if (buyItem(state, itemId, 1)) {
      audio.playPurchase();
      save(state);
      renderUI(state);
    }
  });

  maxButton.addEventListener("click", () => {
    const count = getMaxAffordable(definition, state);
    if (count > 0 && buyItem(state, itemId, count)) {
      audio.playPurchase();
      save(state);
      renderUI(state);
    }
  });

  return {
    container,
    icon,
    name,
    description,
    cost: cost.value,
    next: next.value,
    owned: owned.value,
    payback: payback.value,
    buyButton,
    maxButton,
  } satisfies ShopCardRefs;
}

function createStatBlock(
  key: string,
  wrapper: HTMLElement,
  registry: Map<string, HTMLElement>,
): HTMLElement {
  const group = document.createElement("div");
  const label = document.createElement("dt");
  label.className = "text-xs uppercase tracking-[0.28em] text-neutral-500";
  registry.set(key, label);

  const value = document.createElement("dd");
  value.className = "mt-1 text-lg font-semibold text-neutral-100";

  group.append(label, value);
  wrapper.appendChild(group);

  return value;
}

function createDetail(wrapper: HTMLElement, labelText: string): { label: HTMLElement; value: HTMLElement } {
  const label = document.createElement("dt");
  label.textContent = labelText;
  label.className = "text-neutral-400";
  const value = document.createElement("dd");
  value.className = "text-neutral-100";
  wrapper.append(label, value);
  return { label, value };
}

function createActionButton(iconPath: string): ControlButtonRefs {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:border-leaf-400 focus-visible:ring-2 focus-visible:ring-leaf-300";

  const iconWrap = document.createElement("span");
  iconWrap.className = "icon-badge";

  const icon = document.createElement("img");
  icon.src = iconPath;
  icon.alt = "";
  icon.className = "icon-img";

  iconWrap.append(icon);

  const label = document.createElement("span");
  label.className = "whitespace-nowrap";

  button.append(iconWrap, label);

  return { button, icon, label };
}

function createDangerButton(iconPath: string): ControlButtonRefs {
  const control = createActionButton(iconPath);
  control.button.classList.add("hover:border-rose-400", "text-rose-300");
  return control;
}

function announce(refs: UIRefs, total: Decimal): void {
  if (total.minus(lastAnnounced).lessThan(10)) {
    return;
  }

  refs.announcer.textContent = `Buds: ${formatDecimal(total)}`;
  lastAnnounced = total;
}

export {};







