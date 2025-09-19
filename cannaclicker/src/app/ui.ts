import Decimal from "break_infinity.js";
import {
  handleManualClick,
  buyItem,
  recalcDerivedValues,
  evaluateAchievements,
} from "./game";
import { getShopEntries, getMaxAffordable, formatPayback } from "./shop";
import { formatDecimal } from "./math";
import type { AbilityId, GameState } from "./state";
import { createDefaultState } from "./state";
import { createAudioManager } from "./audio";
import { t } from "./i18n";
import { exportSave, importSave, clearSave, save } from "./save";
import { spawnFloatingValue } from "./effects";
import { asset } from "./assets";
import { withBase } from "./paths";
import { itemById } from "../data/items";
import {
  activateAbility,
  formatAbilityTooltip,
  getAbilityDefinition,
  getAbilityProgress,
  isAbilityReady,
  listAbilities,
} from "./abilities";
import {
  getResearchList,
  purchaseResearch,
  type ResearchFilter,
  getResearchNode,
  type ResearchViewModel,
} from "./research";
import { getPrestigePreview, performPrestige } from "./prestige";

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
  seeds: HTMLElement;
  prestigeMult: HTMLElement;
  clickButton: HTMLButtonElement;
  clickLabel: HTMLSpanElement;
  clickIcon: HTMLDivElement;
  controls: {
    mute: ControlButtonRefs;
    export: ControlButtonRefs;
    import: ControlButtonRefs;
    reset: ControlButtonRefs;
    prestige: ControlButtonRefs;
  };
  announcer: HTMLElement;
  shopTitle: HTMLElement;
  shopList: HTMLElement;
  shopEntries: Map<string, ShopCardRefs>;
  abilityTitle: HTMLElement;
  abilityList: Map<string, AbilityButtonRefs>;
  research: {
    title: HTMLElement;
    filters: Map<string, HTMLButtonElement>;
    list: HTMLElement;
  };
  prestigeModal: PrestigeModalRefs;
  toastContainer: HTMLElement;
}

interface ShopCardRefs {
  container: HTMLElement;
  icon: HTMLImageElement;
  name: HTMLElement;
  description: HTMLElement;
  costLabel: HTMLElement;
  cost: HTMLElement;
  nextLabel: HTMLElement;
  next: HTMLElement;
  ownedLabel: HTMLElement;
  owned: HTMLElement;
  paybackLabel: HTMLElement;
  payback: HTMLElement;
  buyButton: HTMLButtonElement;
  maxButton: HTMLButtonElement;
}

interface AbilityButtonRefs {
  container: HTMLButtonElement;
  label: HTMLElement;
  progressBar: HTMLElement;
  status: HTMLElement;
}

interface PrestigeModalRefs {
  overlay: HTMLElement;
  dialog: HTMLDivElement;
  title: HTMLElement;
  warning: HTMLElement;
  seedsCurrent: HTMLElement;
  seedsNext: HTMLElement;
  seedsGain: HTMLElement;
  multiplierCurrent: HTMLElement;
  multiplierNext: HTMLElement;
  seedsCurrentLabel: HTMLElement;
  seedsNextLabel: HTMLElement;
  seedsGainLabel: HTMLElement;
  multiplierCurrentLabel: HTMLElement;
  multiplierNextLabel: HTMLElement;
  confirmButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
}

let refs: UIRefs | null = null;
let audio = createAudioManager(false);
let lastAnnounced = new Decimal(0);
let activeResearchFilter: ResearchFilter = "available";
let prestigeOpen = false;

const PLANT_STAGE_THRESHOLDS = [0, 100, 1000, 10000, 100000];
const PLANT_STAGE_MAX = 5;

function appendRetinaSuffix(path: string): string {
  const queryIndex = path.indexOf("?");
  const hasQuery = queryIndex !== -1;
  const basePath = hasQuery ? path.slice(0, queryIndex) : path;
  const query = hasQuery ? path.slice(queryIndex) : "";
  const dotIndex = basePath.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${basePath}@2x${query}`;
  }
  const retinaPath = `${basePath.slice(0, dotIndex)}@2x${basePath.slice(dotIndex)}`;
  return `${retinaPath}${query}`;
}

function buildItemSrcset(path: string): string {
  return `${path} 1x, ${appendRetinaSuffix(path)} 2x`;
}
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
  updateAbilities(state);
  updateResearch(state);
  updateShop(state);
  updatePrestigeModal(state);
  updateOfflineToast(state);
}

function buildUI(state: GameState): UIRefs {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app root missing");
  }

  root.innerHTML = "";
  root.className = "mx-auto flex w-full max-w-6xl flex-col gap-4 p-4";

  const heroImageSet = `image-set(url("${withBase("img/bg-hero-1920.png")}") type("image/png") 1x, url("${withBase("img/bg-hero-2560.png")}") type("image/png") 2x)`;
  document.documentElement.style.setProperty("--hero-image", heroImageSet);
  document.documentElement.style.setProperty("--bg-plants", `url("${withBase("img/bg-plants-1280.png")}")`);
  document.documentElement.style.setProperty("--bg-noise", `url("${withBase("img/bg-noise-512.png")}")`);

  const muteControl = createActionButton(withBase("icons/ui/ui-mute.png"));
  const exportControl = createActionButton(withBase("icons/ui/ui-export.png"));
  const importControl = createActionButton(withBase("icons/ui/ui-import.png"));
  const resetControl = createDangerButton(withBase("icons/ui/ui-reset.png"));
  const prestigeControl = createActionButton(withBase("icons/ui/ui-save.png"));
  prestigeControl.button.classList.add("text-amber-200");
  prestigeControl.button.classList.add("hover:border-amber-400/60", "hover:bg-amber-900/40");

  mountHeader(root, [
    muteControl.button,
    exportControl.button,
    importControl.button,
    prestigeControl.button,
    resetControl.button,
  ]);

  const layout = document.createElement("div");
  layout.className = "grid gap-4 lg:grid-cols-[1fr_1fr] xl:gap-6";
  root.appendChild(layout);

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "space-y-4";

  const secondaryColumn = document.createElement("div");
  secondaryColumn.className = "space-y-4";

  layout.append(primaryColumn, secondaryColumn);

  const headerCard = document.createElement("section");
  headerCard.className = "card fade-in space-y-4";

  const title = document.createElement("h1");
  title.className = "text-4xl md:text-5xl font-extrabold tracking-tight text-leaf-200 drop-shadow-[0_14px_28px_rgba(16,185,129,0.35)]";
  title.textContent = "CannaBies";
  headerCard.appendChild(title);

  const statsGrid = document.createElement("dl");
  statsGrid.className =
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-sm sm:text-base text-neutral-300";
  headerCard.appendChild(statsGrid);

  const statsLabels = new Map<string, HTMLElement>();

  const budsStat = createStatBlock("stats.buds", statsGrid, statsLabels);
  const bpsStat = createStatBlock("stats.bps", statsGrid, statsLabels);
  const bpcStat = createStatBlock("stats.bpc", statsGrid, statsLabels);
  const totalStat = createStatBlock("stats.total", statsGrid, statsLabels);
  const seedsStat = createStatBlock("stats.seeds", statsGrid, statsLabels);
  const prestigeStat = createStatBlock("stats.prestigeMult", statsGrid, statsLabels);

  primaryColumn.appendChild(headerCard);

  const clickCard = document.createElement("section");
  clickCard.className = "card fade-in space-y-4";

  const clickButton = document.createElement("button");
  clickButton.className = "click-button w-full";
  clickButton.type = "button";

  const clickIcon = document.createElement("div");
  clickIcon.className = "click-icon";
  clickIcon.setAttribute("aria-hidden", "true");
  clickIcon.style.setProperty(
    "background-image",
    `url("${withBase("plant-stages/plant-stage-01.png")}")`,
  );
  clickIcon.dataset.stage = "1";

  const clickLabel = document.createElement("span");
  clickLabel.className = "click-label";

  clickButton.append(clickIcon, clickLabel);

  clickCard.appendChild(clickButton);

  const announcer = document.createElement("p");
  announcer.setAttribute("data-sr-only", "true");
  announcer.setAttribute("aria-live", "polite");
  clickCard.appendChild(announcer);

  primaryColumn.appendChild(clickCard);

  const abilitySection = document.createElement("section");
  abilitySection.className = "card fade-in space-y-4";

  const abilityTitle = document.createElement("h2");
  abilityTitle.className = "text-xl font-semibold text-leaf-200";
  abilitySection.appendChild(abilityTitle);

  const abilityGrid = document.createElement("div");
  abilityGrid.className = "ability-grid";
  abilitySection.appendChild(abilityGrid);

  const abilityRefs = new Map<string, AbilityButtonRefs>();
  for (const ability of listAbilities()) {
    const abilityButton = createAbilityButton(ability.id, state);
    abilityRefs.set(ability.id, abilityButton);
    abilityGrid.appendChild(abilityButton.container);
  }

  primaryColumn.appendChild(abilitySection);

  const research = createResearchSection();
  secondaryColumn.appendChild(research.section);

  const shopSection = document.createElement("section");
  shopSection.className = "card fade-in space-y-4";

  const shopTitle = document.createElement("h2");
  shopTitle.className = "text-xl font-semibold text-leaf-200";
  shopSection.appendChild(shopTitle);

  const shopList = document.createElement("div");
  shopList.className = "grid gap-3";
  shopSection.appendChild(shopList);

  secondaryColumn.appendChild(shopSection);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
  root.appendChild(toastContainer);

  const prestigeModal = createPrestigeModal();
  root.appendChild(prestigeModal.overlay);

  const uiRefs: UIRefs = {
    root,
    title,
    statsLabels,
    buds: budsStat,
    bps: bpsStat,
    bpc: bpcStat,
    total: totalStat,
    seeds: seedsStat,
    prestigeMult: prestigeStat,
    clickButton,
    clickLabel,
    clickIcon,
    controls: {
      mute: muteControl,
      export: exportControl,
      import: importControl,
      reset: resetControl,
      prestige: prestigeControl,
    },
    announcer,
    shopTitle,
    shopList,
    shopEntries: new Map(),
    abilityTitle,
    abilityList: abilityRefs,
    research: {
      title: research.title,
      filters: research.filters,
      list: research.list,
    },
    prestigeModal,
    toastContainer,
  };

  setupInteractions(uiRefs, state);

  return uiRefs;
}

function mountHeader(root: HTMLElement, controls: HTMLButtonElement[]): void {
  const header = document.createElement("header");
  header.className =
    "mx-auto flex w-full max-w-6xl flex-col items-start gap-4 rounded-3xl border border-white/10 bg-neutral-900/80 px-4 py-4 shadow-[0_24px_60px_rgba(10,12,21,0.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6";

  const brand = document.createElement("div");
  brand.className =
    "flex items-center gap-4 md:gap-6 rounded-2xl bg-gradient-to-br from-neutral-900/90 via-neutral-900/75 to-neutral-800/75 px-4 md:px-6 py-4 shadow-[0_24px_48px_rgba(16,185,129,0.28)] ring-1 ring-emerald-400/25 backdrop-blur";

  const leafWrap = document.createElement("span");
  leafWrap.className =
    "relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lime-300/35 via-emerald-300/25 to-emerald-500/30 shadow-[0_0_38px_rgba(202,255,120,0.55)] ring-1 ring-lime-200/35";

  const leaf = new Image();
  leaf.src = withBase("img/logo-leaf.svg");
  leaf.alt = "";
  leaf.decoding = "async";
  leaf.className =
    "h-12 w-12 drop-shadow-[0_18px_34px_rgba(202,255,150,0.6)] saturate-150 brightness-110";

  leafWrap.appendChild(leaf);

  const brandText = document.createElement("div");
  brandText.className = "flex flex-col justify-center gap-1 pl-2";

  const wordmark = new Image();
  wordmark.src = withBase("img/logo-wordmark.svg");
  wordmark.alt = "CannaClicker wordmark";
  wordmark.decoding = "async";
  wordmark.className =
    "relative left-4 top-2 h-24 w-auto drop-shadow-[0_26px_46px_rgba(56,220,120,0.6)] saturate-150 contrast-125 md:left-6 md:top-2";

  brandText.append(wordmark);

  brand.append(leafWrap, brandText);

  const actionWrap = document.createElement("div");
  actionWrap.className =
    "flex flex-nowrap items-center gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-2 shadow-[0_22px_44px_rgba(10,12,21,0.5)] ring-1 ring-white/10 backdrop-blur sm:px-4";
  controls.forEach((control) => {
    control.classList.add("shrink-0");
    actionWrap.append(control);
  });

  header.append(brand, actionWrap);
  root.prepend(header);
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

  refs.controls.prestige.button.addEventListener("click", () => {
    openPrestigeModal(state);
  });

  refs.prestigeModal.cancelButton.addEventListener("click", () => {
    closePrestigeModal();
  });

  refs.prestigeModal.confirmButton.addEventListener("click", () => {
    const preview = getPrestigePreview(state);
    if (preview.gainedSeeds <= 0) {
      return;
    }

    performPrestige(state);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    closePrestigeModal();
    renderUI(state);
  });

  refs.prestigeModal.overlay.addEventListener("click", (event) => {
    if (event.target === refs?.prestigeModal.overlay) {
      closePrestigeModal();
    }
  });

  refs.abilityList.forEach((abilityRefs, abilityId) => {
    abilityRefs.container.addEventListener("click", () => {
      const activated = activateAbility(state, abilityId as AbilityId);
      if (activated) {
        audio.playPurchase();
        recalcDerivedValues(state);
        renderUI(state);
      }
    });
  });

  refs.research.filters.forEach((button, key) => {
    button.addEventListener("click", () => {
      if (activeResearchFilter === (key as ResearchFilter)) {
        return;
      }
      activeResearchFilter = key as ResearchFilter;
      renderUI(state);
    });
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

    if (event.code === "Escape" && prestigeOpen) {
      event.preventDefault();
      closePrestigeModal();
    }
  });
}

function updateStrings(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.title.textContent = "CannaBies";
  refs.shopTitle.textContent = t(state.locale, "shop.title");
  refs.clickButton.setAttribute("aria-label", t(state.locale, "actions.click"));
  refs.clickLabel.textContent = t(state.locale, "actions.click");

  const muteAssets = state.muted
    ? { label: t(state.locale, "actions.unmute"), icon: asset("icons/ui/ui-unmute.png") }
    : { label: t(state.locale, "actions.mute"), icon: asset("icons/ui/ui-mute.png") };

  refs.controls.mute.icon.src = muteAssets.icon;
  refs.controls.mute.label.textContent = muteAssets.label;
  refs.controls.mute.button.setAttribute("aria-label", muteAssets.label);
  refs.controls.mute.button.setAttribute("title", muteAssets.label);

  refs.controls.export.label.textContent = t(state.locale, "actions.export");
  refs.controls.export.button.setAttribute("aria-label", t(state.locale, "actions.export"));
  refs.controls.export.button.setAttribute("title", t(state.locale, "actions.export"));

  refs.controls.import.label.textContent = t(state.locale, "actions.import");
  refs.controls.import.button.setAttribute("aria-label", t(state.locale, "actions.import"));
  refs.controls.import.button.setAttribute("title", t(state.locale, "actions.import"));

  refs.controls.reset.label.textContent = t(state.locale, "actions.reset");
  refs.controls.reset.button.setAttribute("aria-label", t(state.locale, "actions.reset"));
  refs.controls.reset.button.setAttribute("title", t(state.locale, "actions.reset"));

  refs.controls.prestige.label.textContent = t(state.locale, "actions.prestige");
  refs.controls.prestige.button.setAttribute("aria-label", t(state.locale, "actions.prestige"));
  refs.controls.prestige.button.setAttribute("title", t(state.locale, "actions.prestige"));

  refs.statsLabels.forEach((label, key) => {
    label.textContent = t(state.locale, key);
  });

  refs.abilityTitle.textContent = t(state.locale, "abilities.title");
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const definition = getAbilityDefinition(abilityId as AbilityId);
    abilityRefs.label.textContent = definition.label[state.locale];
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute("aria-label", definition.label[state.locale]);
  });

  refs.research.title.textContent = t(state.locale, "research.title");
  refs.research.filters.forEach((button, key) => {
    button.textContent = t(state.locale, `research.filter.${key}`);
    button.setAttribute("aria-label", button.textContent ?? "");
  });

  refs.prestigeModal.title.textContent = t(state.locale, "prestige.modal.title");
  refs.prestigeModal.warning.textContent = t(state.locale, "prestige.modal.warning");
  refs.prestigeModal.seedsCurrentLabel.textContent = t(state.locale, "prestige.modal.currentSeeds");
  refs.prestigeModal.seedsNextLabel.textContent = t(state.locale, "prestige.modal.newSeeds");
  refs.prestigeModal.seedsGainLabel.textContent = t(state.locale, "prestige.modal.gainSeeds");
  refs.prestigeModal.multiplierCurrentLabel.textContent = t(state.locale, "prestige.modal.currentMultiplier");
  refs.prestigeModal.multiplierNextLabel.textContent = t(state.locale, "prestige.modal.nextMultiplier");
  refs.prestigeModal.confirmButton.textContent = t(state.locale, "prestige.modal.confirm");
  refs.prestigeModal.cancelButton.textContent = t(state.locale, "actions.cancel");

  refs.shopEntries.forEach((entry, itemId) => {
    const definition = itemById.get(itemId);
    if (!definition) {
      return;
    }

    entry.name.textContent = definition.name[state.locale];
    entry.description.textContent = definition.description[state.locale];
    entry.icon.alt = definition.name[state.locale];
    entry.icon.srcset = buildItemSrcset(definition.icon);
    entry.costLabel.textContent = t(state.locale, "shop.cost");
    entry.nextLabel.textContent = t(state.locale, "shop.nextPrice");
    entry.ownedLabel.textContent = t(state.locale, "shop.owned");
    entry.paybackLabel.textContent = t(state.locale, "shop.paybackLabel");
    entry.buyButton.textContent = t(state.locale, "actions.buy");
    entry.maxButton.textContent = t(state.locale, "actions.max");
  });
}

function resolvePlantStage(total: Decimal): number {
  const totalValue = total.toNumber();
  if (!Number.isFinite(totalValue)) {
    return PLANT_STAGE_MAX;
  }

  let stage = 1;
  for (let i = 0; i < PLANT_STAGE_THRESHOLDS.length; i += 1) {
    if (totalValue >= PLANT_STAGE_THRESHOLDS[i]) {
      stage = i + 1;
    }
  }

  return Math.min(stage, PLANT_STAGE_MAX);
}

function updatePlantStage(state: GameState): void {
  if (!refs) {
    return;
  }

  const nextStage = resolvePlantStage(state.total);
  const currentStage = Number(refs.clickIcon.dataset.stage ?? "1");

  if (currentStage === nextStage) {
    return;
  }

  refs.clickIcon.dataset.stage = nextStage.toString();
  const assetPath = `plant-stages/plant-stage-${nextStage.toString().padStart(2, "0")}.png`;
  refs.clickIcon.style.setProperty(
    "background-image",
    `url("${withBase(assetPath)}")`,
  );
}

function updateStats(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  refs.total.textContent = formatDecimal(state.total);
  refs.seeds.textContent = formatDecimal(state.prestige.seeds);
  refs.prestigeMult.textContent = `${state.prestige.mult.toFixed(2)}×`;
  updatePlantStage(state);
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

    const iconPath = entry.definition.icon;
    card.icon.src = iconPath;
    card.icon.srcset = buildItemSrcset(iconPath);
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

function updateAbilities(state: GameState): void {
  if (!refs) {
    return;
  }

  const now = Date.now();
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const id = abilityId as AbilityId;
    const definition = getAbilityDefinition(id);
    const progress = getAbilityProgress(state, id, now);
    abilityRefs.label.textContent = definition.label[state.locale];
    abilityRefs.container.title = formatAbilityTooltip(state, id, state.locale);

    const durationMultiplier = id === "overdrive" ? state.temp.overdriveDurationMult : 1;
    const totalDuration = definition.duration * durationMultiplier;

    let percent = 100;
    let statusKey = "abilities.status.ready";
    let seconds = 0;

    if (progress.active) {
      percent = totalDuration > 0 ? ((totalDuration - progress.remaining) / totalDuration) * 100 : 100;
      statusKey = "abilities.status.active";
      seconds = Math.ceil(progress.remaining);
    } else if (progress.readyIn > 0) {
      percent = progress.cooldown > 0 ? ((progress.cooldown - progress.readyIn) / progress.cooldown) * 100 : 0;
      statusKey = "abilities.status.cooldown";
      seconds = Math.ceil(progress.readyIn);
    }

    abilityRefs.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    abilityRefs.container.disabled = progress.active || progress.readyIn > 0;
    abilityRefs.container.classList.toggle("is-active", progress.active);
    abilityRefs.container.classList.toggle("is-ready", !progress.active && progress.readyIn <= 0);
    abilityRefs.container.classList.toggle("is-cooldown", !progress.active && progress.readyIn > 0);
    abilityRefs.status.textContent = seconds > 0 ? t(state.locale, statusKey, { seconds }) : t(state.locale, statusKey);
  });
}

function updateResearch(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.research.filters.forEach((button, key) => {
    const isActive = key === activeResearchFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  renderResearchList(state);
}

function renderResearchList(state: GameState): void {
  if (!refs) {
    return;
  }

  const entries = getResearchList(state, activeResearchFilter);
  refs.research.list.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "text-sm text-neutral-400";
    empty.textContent = t(state.locale, "research.empty");
    refs.research.list.appendChild(empty);
    return;
  }

  for (const entry of entries) {
    const card = buildResearchCard(entry, state);
    refs.research.list.appendChild(card);
  }
}

function buildResearchCard(entry: ResearchViewModel, state: GameState): HTMLElement {
  const card = document.createElement("article");
  card.className = "research-card";
  if (entry.owned) {
    card.classList.add("is-owned");
  }
  if (entry.blocked) {
    card.classList.add("is-locked");
  }

  const header = document.createElement("div");
  header.className = "research-header";

  if (entry.node.icon) {
    const icon = new Image();
    icon.src = entry.node.icon;
    icon.alt = "";
    icon.decoding = "async";
    icon.className = "research-icon";
    header.appendChild(icon);
  }

  const heading = document.createElement("div");
  heading.className = "research-heading";

  const title = document.createElement("h3");
  title.className = "research-name";
  title.textContent = entry.node.name[state.locale];
  heading.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "research-desc";
  desc.textContent = entry.node.desc[state.locale];
  heading.appendChild(desc);

  header.appendChild(heading);
  card.appendChild(header);

  if (entry.node.requires && entry.node.requires.length > 0) {
    const requirement = document.createElement("p");
    requirement.className = "research-requires";
    const names = entry.node.requires
      .map((id) => getResearchNode(id)?.name[state.locale] ?? id)
      .join(", ");
    requirement.textContent = t(state.locale, "research.requires", { list: names });
    card.appendChild(requirement);
  }

  const cost = document.createElement("p");
  cost.className = "research-cost";
  const costValue = entry.node.costType === "buds"
    ? formatDecimal(entry.node.cost)
    : entry.node.cost.toString();
  const costLabelKey = entry.node.costType === "buds" ? "research.cost.buds" : "research.cost.seeds";
  cost.textContent = `${t(state.locale, costLabelKey)}: ${costValue}`;
  card.appendChild(cost);

  const actions = document.createElement("div");
  actions.className = "research-actions";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "research-btn";

  if (entry.owned) {
    button.textContent = t(state.locale, "research.button.owned");
    button.disabled = true;
  } else if (entry.blocked) {
    button.textContent = t(state.locale, "research.button.locked");
    button.disabled = true;
  } else {
    button.textContent = t(state.locale, "research.button.buy");
    button.disabled = !entry.affordable;
  }

  button.addEventListener("click", () => {
    if (entry.owned || entry.blocked) {
      return;
    }

    const purchased = purchaseResearch(state, entry.node.id);
    if (purchased) {
      audio.playPurchase();
      recalcDerivedValues(state);
      renderUI(state);
    }
  });

  actions.appendChild(button);
  card.appendChild(actions);

  return card;
}

function updatePrestigeModal(state: GameState): void {
  if (!refs) {
    return;
  }

  const preview = getPrestigePreview(state);
  refs.prestigeModal.seedsCurrent.textContent = formatDecimal(preview.currentSeeds);
  refs.prestigeModal.seedsNext.textContent = formatDecimal(preview.potentialSeeds);
  refs.prestigeModal.seedsGain.textContent = formatDecimal(preview.gainedSeeds);
  refs.prestigeModal.multiplierCurrent.textContent = `${preview.currentMultiplier.toFixed(2)}×`;
  refs.prestigeModal.multiplierNext.textContent = `${preview.nextMultiplier.toFixed(2)}×`;
  refs.prestigeModal.confirmButton.disabled = preview.gainedSeeds <= 0;
}

function openPrestigeModal(state: GameState): void {
  if (!refs) {
    return;
  }

  prestigeOpen = true;
  refs.prestigeModal.overlay.classList.remove("hidden");
  refs.prestigeModal.overlay.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => refs.prestigeModal.overlay.classList.add("visible"));
  updatePrestigeModal(state);
}

function closePrestigeModal(): void {
  if (!refs) {
    return;
  }

  prestigeOpen = false;
  refs.prestigeModal.overlay.classList.remove("visible");
  refs.prestigeModal.overlay.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    refs?.prestigeModal.overlay.classList.add("hidden");
  }, 200);
}

function updateOfflineToast(state: GameState): void {
  if (!refs) {
    return;
  }

  if (state.temp.offlineBuds && state.temp.offlineDuration > 0) {
    const hours = state.temp.offlineDuration / 3_600_000;
    const message = t(state.locale, "toast.offline", {
      buds: formatDecimal(state.temp.offlineBuds),
      hours: hours.toFixed(2),
    });
    showToast(message);
    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }
}

function showToast(message: string): void {
  if (!refs) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  refs.toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
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
  container.className =
    "relative grid gap-4 rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-card backdrop-blur-sm transition hover:border-emerald-400/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5";

  const info = document.createElement("div");
  info.className = "flex flex-col gap-3";

  const titleWrap = document.createElement("div");
  titleWrap.className = "space-y-1";

  const name = document.createElement("h3");
  name.className = "text-lg font-semibold text-neutral-100";
  name.textContent = definition.name[state.locale];
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm leading-snug text-neutral-400";
  description.textContent = definition.description[state.locale];
  titleWrap.appendChild(description);

  info.appendChild(titleWrap);

  const details = document.createElement("dl");
  details.className = "grid grid-cols-2 gap-x-4 gap-y-1 text-sm opacity-90";

  const cost = createDetail(details, t(state.locale, "shop.cost"));
  const next = createDetail(details, t(state.locale, "shop.nextPrice"));
  const owned = createDetail(details, t(state.locale, "shop.owned"));
  const payback = createDetail(details, t(state.locale, "shop.paybackLabel"));

  info.appendChild(details);

  const actions = document.createElement("div");
  actions.className = "mt-3 flex flex-wrap gap-2 sm:flex-nowrap";

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "buy-btn h-10 flex-1";
  buyButton.textContent = t(state.locale, "actions.buy");

  const maxButton = document.createElement("button");
  maxButton.type = "button";
  maxButton.className =
    "h-10 shrink-0 rounded-lg border border-white/10 px-4 text-sm font-semibold text-neutral-200 transition hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300";
  maxButton.textContent = t(state.locale, "actions.max");

  actions.append(buyButton, maxButton);
  info.appendChild(actions);

  const media = document.createElement("div");
  media.className = "w-24 aspect-square shrink-0 justify-self-center sm:justify-self-end sm:w-28 md:w-32";

  const icon = document.createElement("img");
  icon.src = definition.icon;
  icon.srcset = buildItemSrcset(definition.icon);
  icon.alt = definition.name[state.locale];
  icon.decoding = "async";
  icon.className = "h-full w-full object-contain";

  media.appendChild(icon);

  container.append(info, media);
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
    costLabel: cost.label,
    cost: cost.value,
    nextLabel: next.label,
    next: next.value,
    ownedLabel: owned.label,
    owned: owned.value,
    paybackLabel: payback.label,
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
  group.className = "rounded-lg bg-neutral-900/40 p-3 ring-1 ring-white/5 sm:p-4";
  const label = document.createElement("dt");
  label.className = "text-[0.7rem] uppercase tracking-[0.22em] text-neutral-400";
  registry.set(key, label);

  const value = document.createElement("dd");
  value.className = "mt-2 text-2xl md:text-3xl font-bold text-neutral-100 tabular-nums drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]";

  group.append(label, value);
  wrapper.appendChild(group);

  return value;
}

function createDetail(wrapper: HTMLElement, labelText: string): { label: HTMLElement; value: HTMLElement } {
  const label = document.createElement("dt");
  label.textContent = labelText;
  label.className = "text-neutral-400";
  const value = document.createElement("dd");
  value.className = "justify-self-end font-medium text-neutral-100";
  wrapper.append(label, value);
  return { label, value };
}

function wrapIcon(icon: HTMLImageElement): HTMLSpanElement {
  const wrapper = document.createElement("span");
  wrapper.className = "icon-badge";
  icon.classList.add("icon-img", "icon-dark");
  wrapper.append(icon);
  return wrapper;
}

function createActionButton(iconPath: string): ControlButtonRefs {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/60 px-2.5 py-1.5 text-sm font-medium text-neutral-200 shadow-[0_10px_24px_rgba(9,11,19,0.45)] transition hover:border-emerald-400/40 hover:bg-neutral-800/70 focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0";

  const icon = new Image();
  icon.src = iconPath;
  icon.alt = "";
  icon.decoding = "async";

  const iconWrap = wrapIcon(icon);
  iconWrap.classList.add("control-icon-badge");
  icon.classList.add("control-icon-img");

  const label = document.createElement("span");
  label.className = "hidden whitespace-nowrap text-sm font-medium text-neutral-200 sm:inline";

  button.append(iconWrap, label);

  return { button, icon, label };
}
function createDangerButton(iconPath: string): ControlButtonRefs {
  const control = createActionButton(iconPath);
  control.button.className = control.button.className
    .replace("hover:border-emerald-400/40", "hover:border-rose-400/60")
    .replace("hover:bg-neutral-800/70", "hover:bg-rose-900/30")
    .replace("focus-visible:ring-emerald-300/70", "focus-visible:ring-rose-300/70");
  control.button.classList.add("text-rose-300");
  return control;
}

function createAbilityButton(id: string, state: GameState): AbilityButtonRefs {
  const definition = getAbilityDefinition(id);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ability-btn";

  const label = document.createElement("span");
  label.className = "ability-label";
  label.textContent = definition.label[state.locale];

  const status = document.createElement("span");
  status.className = "ability-status";

  const progress = document.createElement("div");
  progress.className = "ability-progress";

  const progressBar = document.createElement("div");
  progressBar.className = "ability-progress-bar";
  progress.appendChild(progressBar);

  button.append(label, status, progress);

  return { container: button, label, status, progressBar };
}

function createResearchSection(): {
  section: HTMLElement;
  title: HTMLElement;
  filters: Map<string, HTMLButtonElement>;
  list: HTMLElement;
} {
  const section = document.createElement("section");
  section.className = "card fade-in space-y-4";

  const header = document.createElement("div");
  header.className = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

  const title = document.createElement("h2");
  title.className = "text-xl font-semibold text-leaf-200";
  header.appendChild(title);

  const filterWrap = document.createElement("div");
  filterWrap.className = "research-filters";
  const filters = new Map<string, HTMLButtonElement>();

  const filterKeys: ResearchFilter[] = ["all", "available", "owned"];
  filterKeys.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.filter = key;
    button.className = "filter-pill";
    filterWrap.appendChild(button);
    filters.set(key, button);
  });

  header.appendChild(filterWrap);
  section.appendChild(header);

  const list = document.createElement("div");
  list.className = "grid gap-3";
  section.appendChild(list);

  return { section, title, filters, list };
}

function createPrestigeModal(): PrestigeModalRefs {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay hidden";
  overlay.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = "modal-card";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const title = document.createElement("h2");
  title.className = "modal-title";
  dialog.appendChild(title);

  const warning = document.createElement("p");
  warning.className = "modal-warning";
  dialog.appendChild(warning);

  const stats = document.createElement("dl");
  stats.className = "modal-stats";

  const currentSeeds = createModalStat(stats);
  const nextSeeds = createModalStat(stats);
  const gainSeeds = createModalStat(stats);
  const currentMult = createModalStat(stats);
  const nextMult = createModalStat(stats);

  dialog.appendChild(stats);

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "modal-button secondary";
  actions.appendChild(cancelButton);

  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.className = "modal-button primary";
  actions.appendChild(confirmButton);

  dialog.appendChild(actions);
  overlay.appendChild(dialog);

  return {
    overlay,
    dialog,
    title,
    warning,
    seedsCurrent: currentSeeds.value,
    seedsNext: nextSeeds.value,
    seedsGain: gainSeeds.value,
    multiplierCurrent: currentMult.value,
    multiplierNext: nextMult.value,
    seedsCurrentLabel: currentSeeds.label,
    seedsNextLabel: nextSeeds.label,
    seedsGainLabel: gainSeeds.label,
    multiplierCurrentLabel: currentMult.label,
    multiplierNextLabel: nextMult.label,
    confirmButton,
    cancelButton,
  };
}

function createModalStat(wrapper: HTMLElement): { label: HTMLElement; value: HTMLElement } {
  const row = document.createElement("div");
  row.className = "modal-stat";

  const label = document.createElement("dt");
  label.className = "modal-stat-label";

  const value = document.createElement("dd");
  value.className = "modal-stat-value";

  row.append(label, value);
  wrapper.appendChild(row);

  return { label, value };
}

function announce(refs: UIRefs, total: Decimal): void {
  if (total.minus(lastAnnounced).lessThan(10)) {
    return;
  }

  refs.announcer.textContent = `Buds: ${formatDecimal(total)}`;
  lastAnnounced = total;
}

export {};







































