import Decimal from "break_infinity.js";
import {
  handleManualClick,
  buyItem,
  recalcDerivedValues,
  evaluateAchievements,
} from "./game";
import { getShopEntries, getMaxAffordable, formatPayback, formatRoi, type ShopEntry } from "./shop";
import { formatDecimal } from "./math";
import type { AbilityId, GameState, ShopSortMode } from "./state";
import {
  createDefaultState,
  AUTO_BUY_ROI_MIN,
  AUTO_BUY_ROI_MAX,
  AUTO_BUY_RESERVE_MIN,
  AUTO_BUY_RESERVE_MAX,
} from "./state";
import { createAudioManager } from "./audio";
import { t, type LocaleKey } from "./i18n";
import { exportSave, importSave, clearSave, save } from "./save";
import { spawnFloatingValue } from "./effects";
import { asset } from "./assets";
import { withBase } from "./paths";
import { itemById } from "../data/items";
import { achievements, type AchievementDefinition } from "../data/achievements";
import {
  activateAbility,
  formatAbilityTooltip,
  getAbilityDefinition,
  getAbilityLabel,
  getAbilityProgress,
  listAbilities,
} from "./abilities";
import {
  getResearchList,
  purchaseResearch,
  type ResearchFilter,
  getResearchNode,
  type ResearchViewModel,
} from "./research";
import type { ResearchEffect } from "../data/research";
import { getPrestigePreview, performPrestige } from "./prestige";
import { PRESTIGE_MIN_REQUIREMENT } from "./balance";

const STAT_META: Record<LocaleKey, Record<string, string>> = {
  de: {
    "stats.buds": "Aktueller Vorrat",
    "stats.bps": "Produktion pro Sekunde",
    "stats.bpc": "Ertrag pro Klick",
    "stats.total": "Lebenszeit-Ernte",
    "stats.seeds": "Prestige-Waehrung",
    "stats.prestigeMult": "Aktiver Bonus",
  },
  en: {
    "stats.buds": "Current stock",
    "stats.bps": "Production each second",
    "stats.bpc": "Yield per click",
    "stats.total": "Lifetime harvest",
    "stats.seeds": "Prestige currency",
    "stats.prestigeMult": "Active boost",
  },
};

const ABILITY_ICON_MAP: Record<AbilityId, string> = {
  overdrive: "icons/abilities/ability-overdrive.png",
  burst: "icons/abilities/ability-burst.png",
};

function formatTierBonus(locale: LocaleKey, value: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface ControlButtonRefs {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  label: HTMLSpanElement;
}

interface AutoBuyRefs {
  container: HTMLElement;
  title: HTMLElement;
  enableButton: HTMLButtonElement;
  roiLabel: HTMLElement;
  roiToggle: HTMLButtonElement;
  roiValue: HTMLElement;
  roiSlider: HTMLInputElement;
  reserveLabel: HTMLElement;
  reserveToggle: HTMLButtonElement;
  reserveValue: HTMLElement;
  reserveSlider: HTMLInputElement;
}

interface ShopControlsRefs {
  container: HTMLElement;
  sortLabel: HTMLElement;
  sortButtons: Map<ShopSortMode, HTMLButtonElement>;
  autoBuy: AutoBuyRefs;
}

interface PrestigePanelRefs {
  container: HTMLElement;
  description: HTMLElement;
  currentSeedsLabel: HTMLElement;
  currentSeedsValue: HTMLElement;
  nextSeedsLabel: HTMLElement;
  nextSeedsValue: HTMLElement;
  gainLabel: HTMLElement;
  gainValue: HTMLElement;
  bonusLabel: HTMLElement;
  bonusValue: HTMLElement;
  requirement: HTMLElement;
  actionButton: HTMLButtonElement;
}

interface AchievementCardRefs {
  container: HTMLElement;
  iconBase: HTMLImageElement;
  iconOverlay: HTMLImageElement;
  title: HTMLElement;
  description: HTMLElement;
  reward: HTMLElement;
  status: HTMLElement;
}

interface SidePanelRefs {
  section: HTMLElement;
  tabList: HTMLElement;
  tabs: Map<SidePanelTab, HTMLButtonElement>;
  views: Record<SidePanelTab, HTMLElement>;
  shop: {
    controls: ShopControlsRefs;
    list: HTMLElement;
  };
  research: {
    container: HTMLElement;
    filters: Map<string, HTMLButtonElement>;
    list: HTMLElement;
  };
  prestige: PrestigePanelRefs;
  achievements: {
    list: HTMLElement;
    entries: Map<string, AchievementCardRefs>;
  };
}

interface UIRefs {
  root: HTMLElement;
  headerTitle: HTMLHeadingElement;
  statsLabels: Map<string, HTMLElement>;
  statsMeta: Map<string, HTMLElement>;
  buds: HTMLElement;
  bps: HTMLElement;
  bpc: HTMLElement;
  total: HTMLElement;
  seeds: HTMLElement;
  prestigeMult: HTMLElement;
  seedBadge: HTMLButtonElement;
  seedBadgeValue: HTMLElement;
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
  abilityTitle: HTMLElement;
  abilityList: Map<string, AbilityButtonRefs>;
  sidePanel: SidePanelRefs;
  shopEntries: Map<string, ShopCardRefs>;
  prestigeModal: PrestigeModalRefs;
  toastContainer: HTMLElement;
}

interface ShopCardRefs {
  container: HTMLElement;
  icon: HTMLImageElement;
  name: HTMLElement;
  description: HTMLElement;
  roiBadge: HTMLElement;
  roiValue: HTMLElement;
  stageLabel: HTMLElement;
  stageProgressBar: HTMLElement;
  stageProgressText: HTMLElement;
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
  icon: HTMLImageElement;
  label: HTMLElement;
  status: HTMLElement;
  progressBar: HTMLElement;
}

interface PrestigeModalRefs {
  overlay: HTMLElement;
  dialog: HTMLDivElement;
  title: HTMLElement;
  description: HTMLElement;
  warning: HTMLElement;
  previewCurrentLabel: HTMLElement;
  previewCurrentValue: HTMLElement;
  previewAfterLabel: HTMLElement;
  previewAfterValue: HTMLElement;
  previewGainLabel: HTMLElement;
  previewGainValue: HTMLElement;
  previewBonusLabel: HTMLElement;
  previewBonusValue: HTMLElement;
  checkbox: HTMLInputElement;
  checkboxLabel: HTMLElement;
  confirmButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  statusLabel: HTMLElement;
}

type SidePanelTab = "shop" | "research" | "prestige" | "achievements";

const SIDE_PANEL_TAB_KEYS: Record<SidePanelTab, string> = {
  shop: "panel.tabs.shop",
  research: "panel.tabs.research",
  prestige: "panel.tabs.prestige",
  achievements: "panel.tabs.achievements",
};

let refs: UIRefs | null = null;
let audio = createAudioManager(false);
let lastAnnounced = new Decimal(0);
let activeResearchFilter: ResearchFilter = "all";
let researchFilterManuallySelected = false;
let activeSidePanelTab: SidePanelTab = "shop";
let prestigeOpen = false;
let prestigeAcknowledged = false;

const PLANT_STAGE_THRESHOLDS = [
  0,
  50,
  250,
  1_000,
  5_000,
  25_000,
  100_000,
  500_000,
  2_500_000,
  10_000_000,
  50_000_000,
];
const PLANT_STAGE_MAX = PLANT_STAGE_THRESHOLDS.length - 1;
const PLANT_STAGE_ASSET_SUFFIXES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
];
const preloadedPlantStages = new Set<string>();

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
    attachGlobalShortcuts(state);
  }

  updateStrings(state);
  updateStats(state);
  updateAbilities(state);
  updateSidePanel(state);
  updateShopControls(state);
  updateShop(state);
  updateResearch(state);
  updatePrestigePanel(state);
  updateAchievements(state);
  updatePrestigeModal(state);
  updateOfflineToast(state);
}

function buildUI(state: GameState): UIRefs {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app root missing");
  }

  root.innerHTML = "";
  root.className =
    "mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10";

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

  const headerTitle = mountHeader(root, [
    muteControl.button,
    exportControl.button,
    importControl.button,
    prestigeControl.button,
    resetControl.button,
  ]);

  const layout = document.createElement("div");
  layout.className =
    "grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-6 2xl:gap-8";

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "space-y-4";

  const secondaryColumn = document.createElement("div");
  secondaryColumn.className = "space-y-4";

  layout.append(primaryColumn, secondaryColumn);

  const statsLabels = new Map<string, HTMLElement>();
  const statsMeta = new Map<string, HTMLElement>();

  const infoRibbon = document.createElement("section");
  infoRibbon.className = "info-ribbon fade-in";

  const infoList = document.createElement("div");
  infoList.className = "info-ribbon__list";
  infoRibbon.appendChild(infoList);

  const totalStat = createStatBlock("stats.total", infoList, statsLabels, statsMeta);
  const seedsStat = createStatBlock("stats.seeds", infoList, statsLabels, statsMeta);
  const prestigeStat = createStatBlock(
    "stats.prestigeMult",
    infoList,
    statsLabels,
    statsMeta,
  );

  const infoActions = document.createElement("div");
  infoActions.className = "info-ribbon__actions";
  infoRibbon.appendChild(infoActions);

  const seedBadge = document.createElement("button");
  seedBadge.type = "button";
  seedBadge.className = "prestige-badge";
  const seedIcon = new Image();
  seedIcon.src = withBase("icons/ui/ui-seed.png");
  seedIcon.alt = "";
  seedIcon.decoding = "async";
  seedIcon.className = "prestige-badge__icon";
  const seedBadgeValue = document.createElement("span");
  seedBadgeValue.className = "prestige-badge__value";
  seedBadge.append(seedIcon, seedBadgeValue);
  infoActions.appendChild(seedBadge);
  root.append(infoRibbon, layout);

  const clickCard = document.createElement("section");
  clickCard.className = "card fade-in click-card";

  const clickHeader = document.createElement("div");
  clickHeader.className = "click-card__header";
  const clickStats = document.createElement("div");
  clickStats.className = "click-stats";

  clickHeader.appendChild(clickStats);
  clickCard.appendChild(clickHeader);

  const clickBody = document.createElement("div");
  clickBody.className = "click-card__body";
  clickCard.appendChild(clickBody);

  const clickButton = document.createElement("button");
  clickButton.className = "click-button w-full";
  clickButton.type = "button";

  const clickIcon = document.createElement("div");
  clickIcon.className = "click-icon";
  clickIcon.setAttribute("aria-hidden", "true");
  clickIcon.style.setProperty(
    "background-image",
    `url("${withBase(plantStageAsset(0))}")`,
  );
  clickIcon.dataset.stage = "0";
  preloadPlantStage(0);
  preloadPlantStage(1);

  const clickLabel = document.createElement("span");
  clickLabel.className = "click-label";

  clickButton.append(clickIcon, clickLabel);
  clickBody.appendChild(clickButton);

  const budsStat = createStatBlock("stats.buds", clickStats, statsLabels, statsMeta);
  const bpsStat = createStatBlock("stats.bps", clickStats, statsLabels, statsMeta);
  const bpcStat = createStatBlock("stats.bpc", clickStats, statsLabels, statsMeta);

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

  const sidePanel = createSidePanel(state);
  secondaryColumn.appendChild(sidePanel.section);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
  root.appendChild(toastContainer);

  const prestigeModal = createPrestigeModal();
  root.appendChild(prestigeModal.overlay);

  const uiRefs: UIRefs = {
    root,
    headerTitle,
    statsLabels,
    statsMeta,
    buds: budsStat,
    bps: bpsStat,
    bpc: bpcStat,
    total: totalStat,
    seeds: seedsStat,
    prestigeMult: prestigeStat,
    seedBadge,
    seedBadgeValue,
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
    abilityTitle,
    abilityList: abilityRefs,
    sidePanel,
    shopEntries: new Map(),
    prestigeModal,
    toastContainer,
  };

  setupInteractions(uiRefs, state);

  return uiRefs;
}

function mountHeader(
  root: HTMLElement,
  controls: HTMLButtonElement[],
): HTMLHeadingElement {
  const header = document.createElement("header");
  header.className =
    "grid w-full gap-3 rounded-3xl border border-white/10 bg-neutral-900/80 px-3 py-2 shadow-[0_20px_48px_rgba(10,12,21,0.45)] backdrop-blur-xl sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-10 sm:gap-y-2 sm:px-5 lg:px-6";

  const logoWrap = document.createElement("div");
  logoWrap.className =
    "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime-300/35 via-emerald-300/25 to-emerald-500/30 shadow-[0_0_20px_rgba(202,255,120,0.45)] ring-1 ring-lime-200/35 sm:h-14 sm:w-14";

  const leaf = new Image();
  leaf.src = withBase("img/logo-leaf.svg");
  leaf.alt = "";
  leaf.decoding = "async";
  leaf.className =
    "h-8 w-8 drop-shadow-[0_12px_24px_rgba(202,255,150,0.55)] saturate-150 brightness-110 sm:h-10 sm:w-10";

  logoWrap.appendChild(leaf);

  const headerTitle = document.createElement("h1");
  headerTitle.className = "app-header__title";
  headerTitle.textContent = "CannaBies";

  const actionWrap = document.createElement("div");
  actionWrap.className =
    "flex flex-nowrap items-center justify-self-stretch gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-1 shadow-[0_16px_30px_rgba(10,12,21,0.4)] ring-1 ring-white/10 backdrop-blur sm:justify-self-end";
  controls.forEach((control) => {
    control.classList.add("shrink-0");
    actionWrap.append(control);
  });

  header.append(logoWrap, headerTitle, actionWrap);
  root.prepend(header);
  return headerTitle;
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
    const payload = window.prompt("Bitte Base64-Spielstand einfÃ¼gen:");
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
    const confirmReset = window.confirm("Spielstand wirklich lÃ¶schen?");
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

  refs.prestigeModal.checkbox.addEventListener("change", (event) => {
    prestigeAcknowledged = (event.target as HTMLInputElement).checked;
    updatePrestigeModal(state);
  });

  refs.prestigeModal.cancelButton.addEventListener("click", () => {
    closePrestigeModal();
  });

  refs.prestigeModal.confirmButton.addEventListener("click", () => {
    const preview = getPrestigePreview(state);
    if (!prestigeAcknowledged || !preview.requirementMet || preview.gain <= 0) {
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
    const labelText = getAbilityLabel(state, abilityId as AbilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute('aria-label', labelText);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.addEventListener("click", () => {
      if (activeResearchFilter === (key as ResearchFilter)) {
        return;
      }
      researchFilterManuallySelected = key !== "all";
      activeResearchFilter = key as ResearchFilter;
      renderUI(state);
    });
  });

  refs.sidePanel.shop.controls.sortButtons.forEach((button, mode) => {
    button.addEventListener("click", () => {
      if (state.preferences.shopSortMode === mode) {
        return;
      }
      state.preferences.shopSortMode = mode;
      save(state);
      renderUI(state);
    });
  });

  const auto = refs.sidePanel.shop.controls.autoBuy;
  auto.enableButton.addEventListener("click", () => {
    state.automation.autoBuy.enabled = !state.automation.autoBuy.enabled;
    save(state);
    renderUI(state);
  });

  auto.roiToggle.addEventListener("click", () => {
    state.automation.autoBuy.roi.enabled = !state.automation.autoBuy.roi.enabled;
    save(state);
    renderUI(state);
  });

  auto.reserveToggle.addEventListener("click", () => {
    state.automation.autoBuy.reserve.enabled = !state.automation.autoBuy.reserve.enabled;
    save(state);
    renderUI(state);
  });

  auto.roiSlider.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    const value = Number.parseInt(target.value, 10);
    const clamped = Math.max(AUTO_BUY_ROI_MIN, Math.min(AUTO_BUY_ROI_MAX, Number.isFinite(value) ? value : AUTO_BUY_ROI_MIN));
    state.automation.autoBuy.roi.thresholdSeconds = clamped;
    updateShopControls(state);
  });

  auto.roiSlider.addEventListener("change", () => {
    save(state);
  });

  auto.reserveSlider.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    const value = Number.parseInt(target.value, 10);
    const clamped = Math.max(
      AUTO_BUY_RESERVE_MIN,
      Math.min(AUTO_BUY_RESERVE_MAX, Number.isFinite(value) ? value : AUTO_BUY_RESERVE_MIN),
    );
    state.automation.autoBuy.reserve.percent = clamped;
    updateShopControls(state);
  });

  auto.reserveSlider.addEventListener("change", () => {
    save(state);
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    button.addEventListener("click", () => {
      if (activeSidePanelTab === tab) {
        return;
      }
      activeSidePanelTab = tab;
      renderUI(state);
    });
  });

  refs.sidePanel.prestige.actionButton.addEventListener("click", () => {
    openPrestigeModal(state);
  });
}

function attachGlobalShortcuts(state: GameState): void {
  window.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName;
    const isTextInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || (target?.getAttribute('contenteditable') === 'true');

    if ((event.code === "Space" || event.code === "Enter") && !isTextInput) {
      event.preventDefault();
      refs?.clickButton.click();
      return;
    }

    if (event.code === "Escape" && prestigeOpen) {
      event.preventDefault();
      closePrestigeModal();
      return;
    }

    if (isTextInput) {
      return;
    }

    if (event.code === "KeyQ") {
      event.preventDefault();
      triggerAbility(state, "overdrive");
      return;
    }

    if (event.code === "KeyE") {
      event.preventDefault();
      triggerAbility(state, "burst");
    }
  });
}

function updateStrings(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.headerTitle.textContent = "CannaBies";
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

  refs.statsMeta.forEach((meta, key) => {
    meta.textContent = STAT_META[state.locale]?.[key] ?? "";
  });

  refs.abilityTitle.textContent = t(state.locale, "abilities.title");
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const labelText = getAbilityLabel(state, abilityId as AbilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute('aria-label', labelText);
  });

  refs.sidePanel.tabs.forEach((button, tab) => {
    const key = SIDE_PANEL_TAB_KEYS[tab];
    const label = t(state.locale, key);
    button.textContent = label;
    button.setAttribute("aria-label", label);
  });

  refs.sidePanel.research.filters.forEach((button, key) => {
    button.textContent = t(state.locale, `research.filter.${key}`);
    button.setAttribute("aria-label", button.textContent ?? "");
  });

  refs.sidePanel.prestige.description.textContent = t(state.locale, "panel.prestige.description");
  refs.sidePanel.prestige.currentSeedsLabel.textContent = t(state.locale, "prestige.modal.currentSeeds");
  refs.sidePanel.prestige.nextSeedsLabel.textContent = t(state.locale, "prestige.modal.afterSeeds");
  refs.sidePanel.prestige.gainLabel.textContent = t(state.locale, "prestige.modal.gainSeeds");
  refs.sidePanel.prestige.bonusLabel.textContent = t(state.locale, "prestige.modal.globalBonus");
  refs.sidePanel.prestige.actionButton.textContent = t(state.locale, "actions.prestige");

  refs.prestigeModal.title.textContent = t(state.locale, "prestige.modal.title");
  refs.prestigeModal.description.textContent = t(state.locale, "prestige.modal.description");
  refs.prestigeModal.warning.textContent = t(state.locale, "prestige.modal.warning");
  refs.prestigeModal.checkboxLabel.textContent = t(state.locale, "prestige.modal.checkbox");
  refs.prestigeModal.confirmButton.textContent = t(state.locale, "prestige.modal.confirm");
  refs.prestigeModal.cancelButton.textContent = t(state.locale, "actions.cancel");
}

function resolvePlantStage(total: Decimal): number {
  const totalValue = total.toNumber();
  if (!Number.isFinite(totalValue)) {
    return PLANT_STAGE_MAX;
  }

  let stage = 0;
  for (let i = 0; i < PLANT_STAGE_THRESHOLDS.length; i += 1) {
    if (totalValue >= PLANT_STAGE_THRESHOLDS[i]) {
      stage = i;
    }
  }

  return Math.min(stage, PLANT_STAGE_MAX);
}

function plantStageAsset(stage: number): string {
  const clamped = Math.max(0, Math.min(stage, PLANT_STAGE_MAX));
  if (PLANT_STAGE_ASSET_SUFFIXES.length > 0) {
    const index = Math.min(clamped, PLANT_STAGE_ASSET_SUFFIXES.length - 1);
    const suffix = PLANT_STAGE_ASSET_SUFFIXES[index];
    if (suffix) {
      return `plant-stages/plant-stage-${suffix}.png`;
    }
  }

  return `plant-stages/plant-stage-${(clamped + 1).toString().padStart(2, "0")}.png`;
}
function preloadPlantStage(stage: number): void {
  const clamped = Math.max(0, Math.min(stage, PLANT_STAGE_MAX));
  const assetPath = plantStageAsset(clamped);
  if (preloadedPlantStages.has(assetPath)) {
    return;
  }

  const image = new Image();
  image.src = withBase(assetPath);
  preloadedPlantStages.add(assetPath);
}

function triggerPlantStageAnimation(icon: HTMLDivElement): void {
  icon.classList.add("is-upgrading");
  window.setTimeout(() => {
    icon.classList.remove("is-upgrading");
  }, 600);
}

function updatePlantStage(state: GameState): void {
  if (!refs) {
    return;
  }

  const nextStage = resolvePlantStage(state.prestige.lifetimeBuds);
  const currentStage = Number(refs.clickIcon.dataset.stage ?? "0");

  if (currentStage === nextStage) {
    return;
  }

  refs.clickIcon.dataset.stage = nextStage.toString();
  preloadPlantStage(nextStage);
  preloadPlantStage(nextStage + 1);
  const assetPath = plantStageAsset(nextStage);
  refs.clickIcon.style.setProperty(
    "background-image",
    `url("${withBase(assetPath)}")`,
  );
  triggerPlantStageAnimation(refs.clickIcon);
}

function updateStats(state: GameState): void {
  if (!refs) {
    return;
  }

  const preview = getPrestigePreview(state);
  refs.buds.textContent = formatDecimal(state.buds);
  refs.bps.textContent = formatDecimal(state.bps);
  refs.bpc.textContent = formatDecimal(state.bpc);
  refs.total.textContent = formatDecimal(state.total);
  refs.seeds.textContent = formatDecimal(state.prestige.seeds);
  refs.prestigeMult.textContent = `${state.prestige.mult.toFixed(2)}\u00D7`;

  const bonusPercent = Math.max(0, state.prestige.mult.minus(1).mul(100).toNumber());
  refs.seedBadgeValue.textContent = formatDecimal(state.prestige.seeds);
  const badgeTooltip = t(state.locale, 'prestige.badge.tooltip', { value: bonusPercent.toFixed(1) });
  refs.seedBadge.setAttribute('title', badgeTooltip);
  refs.seedBadge.setAttribute('aria-label', badgeTooltip);

  const canPrestige = preview.requirementMet && preview.gain > 0;
  const controlLabel = canPrestige
    ? t(state.locale, 'actions.prestige')
    : t(state.locale, 'prestige.control.locked', {
        requirement: formatDecimal(PRESTIGE_MIN_REQUIREMENT),
      });
  refs.controls.prestige.button.disabled = !canPrestige;
  refs.controls.prestige.button.setAttribute('aria-disabled', canPrestige ? 'false' : 'true');
  refs.controls.prestige.button.setAttribute('title', controlLabel);
  refs.controls.prestige.button.setAttribute('aria-label', controlLabel);
  refs.controls.prestige.label.textContent = t(state.locale, 'actions.prestige');

  updatePlantStage(state);
}

function updateShop(state: GameState): void {
  if (!refs) {
    return;
  }

  const entries = getShopEntries(state);
  const sorted = sortShopEntries(entries, state.preferences.shopSortMode);

  sorted.forEach((entry) => {
    let card = refs!.shopEntries.get(entry.definition.id);
    if (!card) {
      card = createShopCard(entry.definition.id, state);
      refs!.shopEntries.set(entry.definition.id, card);
    }

    const iconPath = entry.definition.icon;
    card.icon.src = iconPath;
    card.icon.srcset = buildItemSrcset(iconPath);
    card.icon.alt = entry.definition.name[state.locale];

    card.name.textContent = entry.definition.name[state.locale];
    card.description.textContent = entry.definition.description[state.locale];
    card.costLabel.textContent = t(state.locale, "shop.cost");
    card.nextLabel.textContent = t(state.locale, "shop.nextPrice");
    card.ownedLabel.textContent = t(state.locale, "shop.owned");
    card.paybackLabel.textContent = t(state.locale, "shop.paybackLabel");
    card.buyButton.textContent = t(state.locale, "actions.buy");
    card.maxButton.textContent = t(state.locale, "actions.max");

    const roiText = formatRoi(state.locale, entry.roi);
    card.roiValue.textContent = roiText;
    card.roiBadge.dataset.variant = resolveRoiVariant(entry.roi);
    card.roiBadge.setAttribute("aria-label", roiText);
    card.roiBadge.setAttribute("title", roiText);

    const stageLabel = t(state.locale, "shop.stageLabel", { level: entry.tier.stage });
    card.stageLabel.textContent = stageLabel;
    const tierTooltip = t(state.locale, "shop.stageTooltip", {
      bonus: formatTierBonus(state.locale, entry.tier.bonus),
      count: entry.tier.size,
    });
    card.stageLabel.setAttribute("title", tierTooltip);
    card.stageLabel.setAttribute("aria-label", `${stageLabel} (${tierTooltip})`);
    const stageProgressLabel = t(state.locale, "shop.stageProgress", {
      remaining: entry.tier.remainingCount,
      next: entry.tier.stage + 1,
    });
    card.stageProgressText.textContent = stageProgressLabel;
    card.stageProgressText.setAttribute("title", stageProgressLabel);
    card.stageProgressText.setAttribute("aria-label", stageProgressLabel);
    const progressPercent = Math.max(0, Math.min(1, entry.tier.completion));
    card.stageProgressBar.style.width = `${(progressPercent * 100).toFixed(2)}%`;

    if (entry.unlocked) {
      card.container.classList.remove("opacity-40");
      card.container.classList.remove("is-locked");
      card.buyButton.disabled = !entry.affordable;
      card.maxButton.disabled = getMaxAffordable(entry.definition, state) === 0;
    } else {
      card.container.classList.add("opacity-40");
      card.container.classList.add("is-locked");
      card.buyButton.disabled = true;
      card.maxButton.disabled = true;
    }

    card.container.dataset.locked = entry.unlocked ? "false" : "true";
    card.container.dataset.affordable = entry.affordable && entry.unlocked ? "true" : "false";
    card.container.classList.toggle("is-affordable", entry.affordable && entry.unlocked);
    card.cost.textContent = entry.formattedCost;
    card.next.textContent = entry.formattedNextCost;
    card.owned.textContent = entry.owned.toString();
    card.payback.textContent = formatPayback(state.locale, entry.payback);

    refs.sidePanel.shop.list.appendChild(card.container);
  });
}

function sortShopEntries(entries: ShopEntry[], mode: ShopSortMode): ShopEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }

    if (mode === 'price') {
      if (a.cost.lessThan(b.cost)) {
        return -1;
      }
      if (a.cost.greaterThan(b.cost)) {
        return 1;
      }
    } else if (mode === 'bps') {
      if (a.deltaBps.greaterThan(b.deltaBps)) {
        return -1;
      }
      if (a.deltaBps.lessThan(b.deltaBps)) {
        return 1;
      }
    } else {
      const roiA = a.roi ?? Number.POSITIVE_INFINITY;
      const roiB = b.roi ?? Number.POSITIVE_INFINITY;
      const finiteA = Number.isFinite(roiA);
      const finiteB = Number.isFinite(roiB);
      if (finiteA && finiteB && roiA !== roiB) {
        return roiA - roiB;
      }
      if (finiteA !== finiteB) {
        return finiteA ? -1 : 1;
      }
    }

    if (a.cost.lessThan(b.cost)) {
      return -1;
    }
    if (a.cost.greaterThan(b.cost)) {
      return 1;
    }
    return a.order - b.order;
  });
  return sorted;
}

function resolveRoiVariant(roi: number | null): 'fast' | 'medium' | 'slow' | 'none' {
  if (roi === null || !Number.isFinite(roi)) {
    return 'none';
  }

  if (roi < 120) {
    return 'fast';
  }

  if (roi <= 600) {
    return 'medium';
  }

  return 'slow';
}

function updateAbilities(state: GameState): void {
  if (!refs) {
    return;
  }

  const now = Date.now();
  refs.abilityList.forEach((abilityRefs, abilityId) => {
    const ability = getAbilityDefinition(abilityId as AbilityId);
    const runtime = state.abilities[abilityId as AbilityId];
    if (!ability || !runtime) {
      return;
    }

    const labelText = getAbilityLabel(state, abilityId as AbilityId, state.locale);
    abilityRefs.label.textContent = labelText;
    abilityRefs.container.title = formatAbilityTooltip(state, abilityId as AbilityId, state.locale);
    abilityRefs.container.setAttribute('aria-label', labelText);

    const progress = getAbilityProgress(state, abilityId as AbilityId, now);
    const button = abilityRefs.container;
    const status = abilityRefs.status;
    const progressBar = abilityRefs.progressBar;

    button.classList.remove('is-active', 'is-ready', 'is-cooldown');

    let widthPercent = 0;

    if (runtime.active) {
      button.classList.add('is-active');
      button.disabled = true;
      const remaining = Math.max(0, progress.remaining);
      const filled = ability.durationSec > 0 ? (ability.durationSec - remaining) / ability.durationSec : 1;
      widthPercent = Math.max(0, Math.min(1, filled)) * 100;
      status.textContent = t(state.locale, 'abilities.status.active', {
        seconds: Math.ceil(remaining),
      });
    } else if (progress.readyIn <= 0) {
      button.classList.add('is-ready');
      button.disabled = false;
      widthPercent = 100;
      status.textContent = t(state.locale, 'abilities.status.ready');
    } else {
      button.classList.add('is-cooldown');
      button.disabled = true;
      const remainingCooldown = Math.max(0, progress.readyIn);
      const filled = ability.cooldownSec > 0 ? (ability.cooldownSec - remainingCooldown) / ability.cooldownSec : 0;
      widthPercent = Math.max(0, Math.min(1, filled)) * 100;
      status.textContent = t(state.locale, 'abilities.status.cooldown', {
        seconds: Math.ceil(remainingCooldown),
      });
    }

    progressBar.style.width = `${widthPercent.toFixed(1)}%`;
  });
}

function updateSidePanel(state: GameState): void {
  if (!refs) {
    return;
  }

  refs.sidePanel.tabs.forEach((button, tab) => {
    const isActive = tab === activeSidePanelTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  (Object.entries(refs.sidePanel.views) as [SidePanelTab, HTMLElement][]).forEach(([tab, view]) => {
    if (tab === activeSidePanelTab) {
      view.classList.remove("hidden");
      view.setAttribute("aria-hidden", "false");
    } else {
      view.classList.add("hidden");
      view.setAttribute("aria-hidden", "true");
    }
  });
}

function updateResearch(state: GameState): void {
  if (!refs) {
    return;
  }

  const lists: Record<ResearchFilter, ResearchViewModel[]> = {
    all: getResearchList(state, "all"),
    available: getResearchList(state, "available"),
    owned: getResearchList(state, "owned"),
  };

  if (!researchFilterManuallySelected && activeResearchFilter !== "all" && lists[activeResearchFilter].length === 0) {
    activeResearchFilter = "all";
  }

  refs.sidePanel.research.filters.forEach((button, key) => {
    const isActive = key === activeResearchFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  renderResearchList(state, lists[activeResearchFilter]);
}

function updatePrestigePanel(state: GameState): void {
  if (!refs) {
    return;
  }

  const preview = getPrestigePreview(state);
  const panel = refs.sidePanel.prestige;

  panel.currentSeedsValue.textContent = formatDecimal(preview.currentSeeds);
  panel.nextSeedsValue.textContent = formatDecimal(preview.nextSeeds);
  panel.gainValue.textContent = formatDecimal(preview.gain);

  const bonusPercent = Math.max(0, preview.nextMultiplier.minus(1).mul(100).toNumber());
  panel.bonusValue.textContent = `+${bonusPercent.toFixed(1)}%`;

  const requirementLabel = t(state.locale, "panel.prestige.requirement", {
    value: formatDecimal(PRESTIGE_MIN_REQUIREMENT),
  });
  const needsRequirement = !preview.requirementMet;
  const needsGain = preview.requirementMet && preview.gain <= 0;
  const canPrestige = preview.requirementMet && preview.gain > 0;

  let status = "";
  if (needsRequirement) {
    status = requirementLabel;
  } else if (needsGain) {
    status = t(state.locale, "panel.prestige.tooSoon");
  } else {
    status = t(state.locale, "panel.prestige.ready");
  }

  panel.requirement.textContent = status;
  panel.container.classList.toggle("is-ready", canPrestige);
  panel.container.classList.toggle("is-locked", !canPrestige);

  panel.actionButton.disabled = !canPrestige;
  panel.actionButton.setAttribute("aria-disabled", canPrestige ? "false" : "true");
  panel.actionButton.setAttribute("title", canPrestige ? t(state.locale, "actions.prestige") : status);
}

function updateAchievements(state: GameState): void {
  if (!refs) {
    return;
  }

  const { achievements: achievementRefs } = refs.sidePanel;

  achievements.forEach((definition) => {
    const card = achievementRefs.entries.get(definition.id);
    if (!card) {
      return;
    }

    card.title.textContent = definition.name[state.locale];
    card.description.textContent = definition.description[state.locale];

    if (definition.rewardMultiplier) {
      const percent = Math.round((definition.rewardMultiplier - 1) * 100);
      card.reward.textContent = t(state.locale, "achievements.reward", { value: percent });
      card.reward.classList.remove("hidden");
    } else {
      card.reward.textContent = "";
      card.reward.classList.add("hidden");
    }

    const unlocked = Boolean(state.achievements[definition.id]);
    card.status.textContent = unlocked
      ? t(state.locale, "achievements.status.unlocked")
      : t(state.locale, "achievements.status.locked");
    card.container.classList.toggle("is-unlocked", unlocked);
  });
}

function updateShopControls(state: GameState): void {
  if (!refs) {
    return;
  }

  const controls = refs.sidePanel.shop.controls;
  controls.sortLabel.textContent = t(state.locale, "shop.sort.label");

  controls.sortButtons.forEach((button, mode) => {
    const label = t(state.locale, `shop.sort.${mode}`);
    button.textContent = label;
    button.setAttribute("aria-label", label);
    const isActive = state.preferences.shopSortMode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  const auto = state.automation.autoBuy;
  controls.autoBuy.title.textContent = t(state.locale, "shop.autobuy.title");

  controls.autoBuy.enableButton.textContent = auto.enabled
    ? t(state.locale, "toggle.on")
    : t(state.locale, "toggle.off");
  controls.autoBuy.enableButton.classList.toggle("is-active", auto.enabled);
  controls.autoBuy.enableButton.setAttribute("aria-pressed", auto.enabled ? "true" : "false");
  controls.autoBuy.enableButton.setAttribute("aria-label", t(state.locale, "shop.autobuy.enable"));
  controls.autoBuy.enableButton.setAttribute("title", t(state.locale, "shop.autobuy.enable"));

  controls.autoBuy.roiLabel.textContent = t(state.locale, "shop.autobuy.roiLabel");
  controls.autoBuy.roiToggle.textContent = auto.roi.enabled
    ? t(state.locale, "toggle.on")
    : t(state.locale, "toggle.off");
  controls.autoBuy.roiToggle.classList.toggle("is-active", auto.roi.enabled);
  controls.autoBuy.roiToggle.disabled = !auto.enabled;
  controls.autoBuy.roiToggle.setAttribute("aria-pressed", auto.roi.enabled ? "true" : "false");
  controls.autoBuy.roiToggle.setAttribute("aria-label", t(state.locale, "shop.autobuy.roiLabel"));
  controls.autoBuy.roiToggle.setAttribute("title", t(state.locale, "shop.autobuy.roiLabel"));

  const roiValue = Math.max(AUTO_BUY_ROI_MIN, Math.min(AUTO_BUY_ROI_MAX, Math.round(auto.roi.thresholdSeconds)));
  controls.autoBuy.roiValue.textContent = t(state.locale, "shop.autobuy.roiValue", { seconds: roiValue });
  controls.autoBuy.roiSlider.value = roiValue.toString();
  controls.autoBuy.roiSlider.disabled = !auto.enabled || !auto.roi.enabled;
  controls.autoBuy.roiSlider.setAttribute("aria-valuenow", roiValue.toString());
  controls.autoBuy.roiSlider.setAttribute("aria-valuemin", AUTO_BUY_ROI_MIN.toString());
  controls.autoBuy.roiSlider.setAttribute("aria-valuemax", AUTO_BUY_ROI_MAX.toString());
  controls.autoBuy.roiSlider.setAttribute("aria-label", t(state.locale, "shop.autobuy.roiLabel"));

  controls.autoBuy.reserveLabel.textContent = t(state.locale, "shop.autobuy.reserveLabel");
  controls.autoBuy.reserveToggle.textContent = auto.reserve.enabled
    ? t(state.locale, "toggle.on")
    : t(state.locale, "toggle.off");
  controls.autoBuy.reserveToggle.classList.toggle("is-active", auto.reserve.enabled);
  controls.autoBuy.reserveToggle.disabled = !auto.enabled;
  controls.autoBuy.reserveToggle.setAttribute("aria-pressed", auto.reserve.enabled ? "true" : "false");
  controls.autoBuy.reserveToggle.setAttribute("aria-label", t(state.locale, "shop.autobuy.reserveLabel"));
  controls.autoBuy.reserveToggle.setAttribute("title", t(state.locale, "shop.autobuy.reserveLabel"));

  const reserveValue = Math.max(AUTO_BUY_RESERVE_MIN, Math.min(AUTO_BUY_RESERVE_MAX, Math.round(auto.reserve.percent)));
  controls.autoBuy.reserveValue.textContent = t(state.locale, "shop.autobuy.reserveValue", { percent: reserveValue });
  controls.autoBuy.reserveSlider.value = reserveValue.toString();
  controls.autoBuy.reserveSlider.disabled = !auto.enabled || !auto.reserve.enabled;
  controls.autoBuy.reserveSlider.setAttribute("aria-valuenow", reserveValue.toString());
  controls.autoBuy.reserveSlider.setAttribute("aria-valuemin", AUTO_BUY_RESERVE_MIN.toString());
  controls.autoBuy.reserveSlider.setAttribute("aria-valuemax", AUTO_BUY_RESERVE_MAX.toString());
  controls.autoBuy.reserveSlider.setAttribute("aria-label", t(state.locale, "shop.autobuy.reserveLabel"));

  controls.autoBuy.container.classList.toggle("is-disabled", !auto.enabled);
}

function renderResearchList(state: GameState, entries?: ResearchViewModel[]): void {
  if (!refs) {
    return;
  }

  const list = refs.sidePanel.research.list;
  const data = entries ?? getResearchList(state, activeResearchFilter);
  list.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("p");
    empty.className = "text-sm text-neutral-400";
    empty.textContent = t(state.locale, "research.empty");
    list.appendChild(empty);
    return;
  }

  for (const entry of data) {
    const card = buildResearchCard(entry, state);
    list.appendChild(card);
  }
}

function buildResearchCard(entry: ResearchViewModel, state: GameState): HTMLElement {
  const card = document.createElement('article');
  card.className = 'research-card';
  if (entry.owned) {
    card.classList.add('is-owned');
  }
  if (entry.blocked) {
    card.classList.add('is-locked');
  }

  const header = document.createElement('div');
  header.className = 'research-header';

  if (entry.node.icon) {
    const icon = new Image();
    icon.src = entry.node.icon;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    icon.decoding = 'async';
    icon.className = 'research-icon';
    header.appendChild(icon);
  }

  const heading = document.createElement('div');
  heading.className = 'research-heading';

  const title = document.createElement('h3');
  title.className = 'research-name';
  title.textContent = entry.node.name[state.locale];
  heading.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'research-desc';
  desc.textContent = entry.node.desc[state.locale];
  heading.appendChild(desc);

  header.appendChild(heading);
  card.appendChild(header);

  if (entry.node.effects.length) {
    const effects = document.createElement('ul');
    effects.className = 'mt-3 flex flex-wrap gap-2';
    for (const effect of entry.node.effects) {
      const chip = document.createElement('li');
      chip.className = 'inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200';
      chip.textContent = formatResearchEffect(state.locale, effect);
      effects.appendChild(chip);
    }
    card.appendChild(effects);
  }

  if (entry.node.requires && entry.node.requires.length > 0) {
    const requirement = document.createElement('p');
    requirement.className = 'research-requires';
    const names = entry.node.requires
      .map((id) => getResearchNode(id)?.name[state.locale] ?? id)
      .join(', ');
    requirement.textContent = t(state.locale, 'research.requires', { list: names });
    card.appendChild(requirement);
  }

  const cost = document.createElement('div');
  cost.className = 'mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/60 px-3 py-1 text-sm text-neutral-200';
  const costLabelKey = entry.node.costType === 'buds' ? 'research.cost.buds' : 'research.cost.seeds';
  const costValue = entry.node.costType === 'buds' ? formatDecimal(entry.node.cost) : entry.node.cost.toString();
  cost.textContent = `${t(state.locale, costLabelKey)}: ${costValue}`;
  card.appendChild(cost);

  const actions = document.createElement('div');
  actions.className = 'research-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'research-btn';

  if (entry.owned) {
    button.textContent = t(state.locale, 'research.button.owned');
    button.disabled = true;
  } else if (entry.blocked) {
    button.textContent = t(state.locale, 'research.button.locked');
    button.disabled = true;
  } else {
    button.textContent = t(state.locale, 'research.button.buy');
    button.disabled = !entry.affordable;
  }

  button.addEventListener('click', () => {
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

function formatResearchEffect(locale: LocaleKey, effect: ResearchEffect): string {
  switch (effect.id) {
    case 'BPC_MULT':
      return t(locale, 'research.effect.bpc', { value: effect.v.toFixed(2) });
    case 'BPS_MULT':
      return t(locale, 'research.effect.bps', { value: effect.v.toFixed(2) });
    case 'COST_REDUCE_ALL': {
      const percent = Math.round((1 - effect.v) * 100);
      return t(locale, 'research.effect.cost', { value: percent });
    }
    case 'CLICK_AUTOMATION':
      return t(locale, 'research.effect.autoclick', { value: effect.v });
    case 'ABILITY_OVERDRIVE_PLUS': {
      const percent = Math.round(effect.v * 100);
      return t(locale, 'research.effect.overdrive', { value: percent });
    }
    default:
      return '';
  }
}

function updatePrestigeModal(state: GameState): void {
  if (!refs) {
    return;
  }

  const preview = getPrestigePreview(state);
  const modal = refs.prestigeModal;

  modal.previewCurrentLabel.textContent = t(state.locale, 'prestige.modal.currentSeeds');
  modal.previewAfterLabel.textContent = t(state.locale, 'prestige.modal.afterSeeds');
  modal.previewGainLabel.textContent = t(state.locale, 'prestige.modal.gainSeeds');
  modal.previewBonusLabel.textContent = t(state.locale, 'prestige.modal.globalBonus');

  modal.previewCurrentValue.textContent = formatDecimal(preview.currentSeeds);
  modal.previewAfterValue.textContent = formatDecimal(preview.nextSeeds);
  modal.previewGainValue.textContent = formatDecimal(preview.gain);

  const nextBonusPercent = Math.max(0, preview.nextMultiplier.minus(1).mul(100).toNumber());
  modal.previewBonusValue.textContent = `+${nextBonusPercent.toFixed(1)}%`;

  modal.checkbox.checked = prestigeAcknowledged;

  const requirementLabel = t(state.locale, 'prestige.modal.requirement', {
    value: formatDecimal(PRESTIGE_MIN_REQUIREMENT),
  });
  const needsRequirement = !preview.requirementMet;
  const needsGain = preview.requirementMet && preview.gain <= 0;
  let status = '';
  if (needsRequirement) {
    status = requirementLabel;
  } else if (needsGain) {
    status = t(state.locale, 'prestige.modal.tooSoon');
  }

  modal.statusLabel.textContent = status;
  modal.statusLabel.classList.toggle('hidden', status.length === 0);

  modal.confirmButton.disabled = !prestigeAcknowledged || preview.gain <= 0 || !preview.requirementMet;
}

function openPrestigeModal(state: GameState): void {
  if (!refs) {
    return;
  }

  prestigeOpen = true;
  prestigeAcknowledged = false;
  refs.prestigeModal.checkbox.checked = false;
  refs.prestigeModal.overlay.classList.remove('hidden');
  refs.prestigeModal.overlay.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => refs.prestigeModal.overlay.classList.add('visible'));
  updatePrestigeModal(state);
}

function closePrestigeModal(): void {
  if (!refs) {
    return;
  }

  prestigeOpen = false;
  prestigeAcknowledged = false;
  refs.prestigeModal.checkbox.checked = false;
  refs.prestigeModal.overlay.classList.remove('visible');
  refs.prestigeModal.overlay.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    refs?.prestigeModal.overlay.classList.add('hidden');
  }, 200);
}

function updateOfflineToast(state: GameState): void {
  if (!refs) {
    return;
  }

  if (state.temp.offlineBuds && state.temp.offlineDuration > 0) {
    if (state.settings.showOfflineEarnings) {
      const title = t(state.locale, "toast.offline.title");
      const message = t(state.locale, "toast.offline.body", {
        buds: formatDecimal(state.temp.offlineBuds),
        duration: formatDuration(state.temp.offlineDuration),
      });
      showToast(title, message);
    }

    state.temp.offlineBuds = null;
    state.temp.offlineDuration = 0;
  }
}

function showToast(title: string, message: string): void {
  if (!refs) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";

  const heading = document.createElement("strong");
  heading.className = "toast-title";
  heading.textContent = title;

  const body = document.createElement("span");
  body.className = "toast-message";
  body.textContent = message;

  toast.appendChild(heading);
  toast.appendChild(body);
  refs.toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(" ");
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
  container.classList.add("shop-card");

  const info = document.createElement("div");
  info.className = "flex flex-col gap-3";

  const headerRow = document.createElement("div");
  headerRow.className = "flex items-start justify-between gap-3";

  const titleWrap = document.createElement("div");
  titleWrap.className = "space-y-1 flex-1";

  const name = document.createElement("h3");
  name.className = "text-lg font-semibold text-neutral-100";
  name.textContent = definition.name[state.locale];
  titleWrap.appendChild(name);

  const description = document.createElement("p");
  description.className = "text-sm leading-snug text-neutral-400";
  description.textContent = definition.description[state.locale];
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

  const stageLabel = document.createElement("span");
  stageLabel.className = "tier-label";
  tierHeader.appendChild(stageLabel);

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
  refs.sidePanel.shop.list.appendChild(container);

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
    roiBadge,
    roiValue,
    stageLabel,
    stageProgressBar: progressBar,
    stageProgressText,
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
function getStatIcon(key: string): string {
  const iconMap: Record<string, string> = {
    "stats.buds": "icons/ui/icon-leaf-click.png",
    "stats.bps": "icons/upgrades/upgrade-global-bps.png",
    "stats.bpc": "icons/ui/ui-stat-bpc.png",
    "stats.total": "icons/ui/ui-stat-total.png",
    "stats.seeds": "icons/ui/ui-seed.png",
    "stats.prestigeMult": "icons/ui/ui-prestige-mult.png",
  };
  return iconMap[key] || "icons/ui/icon-leaf-click.png";
}

function createCompactStatBlock(
  key: string,
  container: HTMLElement,
  labels: Map<string, HTMLElement>,
  meta: Map<string, HTMLElement>,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "stat-item";
  wrapper.dataset.variant = key;

  const icon = document.createElement("img");
  icon.className = "stat-item__icon";
  icon.src = withBase(getStatIcon(key));
  icon.alt = "";

  const contentDiv = document.createElement("div");
  contentDiv.className = "stat-item__content";

  const label = document.createElement("div");
  label.className = "stat-item__label";
  label.textContent = t("en", key); // Default to English for now

  const value = document.createElement("div");
  value.className = "stat-item__value";
  value.textContent = "0";

  contentDiv.append(label, value);
  wrapper.append(icon, contentDiv);
  container.appendChild(wrapper);

  labels.set(key, label);
  meta.set(key, value); // Using value as the primary display element

  return value;
}

function createStatBlock(
  key: string,
  container: HTMLElement,
  labels: Map<string, HTMLElement>,
  meta: Map<string, HTMLElement>,
): HTMLElement {
  return createCompactStatBlock(key, container, labels, meta);
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
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ability-btn';

  const header = document.createElement('div');
  header.className = 'ability-header';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'ability-icon';

  const icon = document.createElement('img');
  icon.className = 'ability-icon-img';
  icon.decoding = 'async';
  icon.loading = 'lazy';
  icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
  icon.src = withBase(ABILITY_ICON_MAP[id as AbilityId] ?? 'icons/ui/icon-leaf-click.png');
  iconWrap.appendChild(icon);

  const meta = document.createElement('div');
  meta.className = 'ability-meta';

  const label = document.createElement('span');
  label.className = 'ability-label';
  const labelText = getAbilityLabel(state, id as AbilityId, state.locale);
  label.textContent = labelText;

  const status = document.createElement('span');
  status.className = 'ability-status';

  meta.append(label, status);
  header.append(iconWrap, meta);

  const progress = document.createElement('div');
  progress.className = 'ability-progress';

  const progressBar = document.createElement('div');
  progressBar.className = 'ability-progress-bar';
  progress.appendChild(progressBar);

  button.append(header, progress);
  button.title = formatAbilityTooltip(state, id as AbilityId, state.locale);
  button.setAttribute('aria-label', labelText);

  return { container: button, icon, label, status, progressBar };
}

function createSidePanel(state: GameState): SidePanelRefs {
  const section = document.createElement("section");
  section.className = "card fade-in space-y-5";

  const tabList = document.createElement("div");
  tabList.className = "tab-strip";
  tabList.setAttribute("role", "tablist");
  section.appendChild(tabList);

  const tabs = new Map<SidePanelTab, HTMLButtonElement>();
  (['shop', 'research', 'prestige', 'achievements'] as SidePanelTab[]).forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.tab = tab;
    button.className = "tab-button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("role", "tab");
    tabList.appendChild(button);
    tabs.set(tab, button);
  });

  const viewsContainer = document.createElement("div");
  viewsContainer.className = "space-y-5";
  section.appendChild(viewsContainer);

  const shopView = document.createElement("div");
  shopView.className = "space-y-4";
  const shopControls = createShopControls(state);
  shopView.appendChild(shopControls.container);
  const shopList = document.createElement("div");
  shopList.className = "grid gap-3";
  shopView.appendChild(shopList);
  viewsContainer.appendChild(shopView);

  const researchView = document.createElement("div");
  researchView.className = "space-y-4";
  const researchControls = document.createElement("div");
  researchControls.className = "research-controls";
  const filterWrap = document.createElement("div");
  filterWrap.className = "research-filters";
  const researchFilters = new Map<string, HTMLButtonElement>();
  (['all', 'available', 'owned'] as ResearchFilter[]).forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.filter = key;
    button.className = "filter-pill";
    filterWrap.appendChild(button);
    researchFilters.set(key, button);
  });
  researchControls.appendChild(filterWrap);
  researchView.appendChild(researchControls);
  const researchList = document.createElement("div");
  researchList.className = "grid gap-3";
  researchView.appendChild(researchList);
  viewsContainer.appendChild(researchView);

  const prestigePanel = createPrestigePanel();
  viewsContainer.appendChild(prestigePanel.container);

  const achievementsView = document.createElement("div");
  achievementsView.className = "space-y-4";
  const achievementsList = document.createElement("div");
  achievementsList.className = "grid gap-3";
  achievementsView.appendChild(achievementsList);
  viewsContainer.appendChild(achievementsView);

  const achievementRefs = new Map<string, AchievementCardRefs>();
  achievements.forEach((definition) => {
    const card = createAchievementCard(definition);
    achievementRefs.set(definition.id, card);
    achievementsList.appendChild(card.container);
  });

  const views: Record<SidePanelTab, HTMLElement> = {
    shop: shopView,
    research: researchView,
    prestige: prestigePanel.container,
    achievements: achievementsView,
  };

  Object.entries(views).forEach(([tab, view]) => {
    if (tab === activeSidePanelTab) {
      view.setAttribute("aria-hidden", "false");
    } else {
      view.classList.add("hidden");
      view.setAttribute("aria-hidden", "true");
    }
  });

  return {
    section,
    tabList,
    tabs,
    views,
    shop: {
      controls: shopControls,
      list: shopList,
    },
    research: {
      container: researchControls,
      filters: researchFilters,
      list: researchList,
    },
    prestige: prestigePanel,
    achievements: {
      list: achievementsList,
      entries: achievementRefs,
    },
  } satisfies SidePanelRefs;
}

function createPrestigePanel(): PrestigePanelRefs {
  const container = document.createElement("div");
  container.className = "prestige-panel";

  const description = document.createElement("p");
  description.className = "prestige-panel__description";
  container.appendChild(description);

  const stats = document.createElement("div");
  stats.className = "prestige-panel__stats";
  container.appendChild(stats);

  const current = createPrestigePanelStat(stats);
  const next = createPrestigePanelStat(stats);
  const gain = createPrestigePanelStat(stats);
  const bonus = createPrestigePanelStat(stats);

  const requirement = document.createElement("p");
  requirement.className = "prestige-panel__requirement";
  container.appendChild(requirement);

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "prestige-panel__action";
  container.appendChild(actionButton);

  return {
    container,
    description,
    currentSeedsLabel: current.label,
    currentSeedsValue: current.value,
    nextSeedsLabel: next.label,
    nextSeedsValue: next.value,
    gainLabel: gain.label,
    gainValue: gain.value,
    bonusLabel: bonus.label,
    bonusValue: bonus.value,
    requirement,
    actionButton,
  } satisfies PrestigePanelRefs;
}

function createPrestigePanelStat(wrapper: HTMLElement): { label: HTMLElement; value: HTMLElement } {
  const row = document.createElement("div");
  row.className = "prestige-panel__stat";

  const label = document.createElement("dt");
  label.className = "prestige-panel__stat-label";
  row.appendChild(label);

  const value = document.createElement("dd");
  value.className = "prestige-panel__stat-value";
  row.appendChild(value);

  wrapper.appendChild(row);
  return { label, value };
}

function createAchievementCard(definition: AchievementDefinition): AchievementCardRefs {
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

function createShopControls(state: GameState): ShopControlsRefs {
  const container = document.createElement("div");
  container.className =
    "shop-controls flex flex-col gap-4 rounded-xl border border-white/5 bg-neutral-900/40 p-4 sm:flex-row sm:items-end sm:justify-between";

  const sortGroup = document.createElement("div");
  sortGroup.className = "flex flex-col gap-2";

  const sortLabel = document.createElement("span");
  sortLabel.className = "text-[0.65rem] uppercase tracking-[0.35em] text-neutral-400";
  sortGroup.appendChild(sortLabel);

  const sortButtonsWrap = document.createElement("div");
  sortButtonsWrap.className = "segmented-control";
  const sortButtons = new Map<ShopSortMode, HTMLButtonElement>();
  (['price', 'bps', 'roi'] as ShopSortMode[]).forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = mode;
    button.className = "segmented-control__option";
    sortButtonsWrap.appendChild(button);
    sortButtons.set(mode, button);
  });
  sortGroup.appendChild(sortButtonsWrap);

  const autoBuy = createAutoBuyPanel(state);

  container.append(sortGroup, autoBuy.container);

  return { container, sortLabel, sortButtons, autoBuy } satisfies ShopControlsRefs;
}

function createAutoBuyPanel(state: GameState): AutoBuyRefs {
  const container = document.createElement("div");
  container.className = "auto-buy-card space-y-3";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between gap-3";

  const title = document.createElement("h3");
  title.className = "text-xs font-semibold uppercase tracking-[0.4em] text-neutral-300";
  header.appendChild(title);

  const enableButton = document.createElement("button");
  enableButton.type = "button";
  enableButton.className = "toggle-button";
  header.appendChild(enableButton);

  container.appendChild(header);

  const roiBlock = document.createElement("div");
  roiBlock.className = "auto-buy-option";

  const roiHeader = document.createElement("div");
  roiHeader.className = "flex items-center justify-between gap-2";

  const roiLabel = document.createElement("span");
  roiLabel.className = "auto-buy-label";
  roiHeader.appendChild(roiLabel);

  const roiControls = document.createElement("div");
  roiControls.className = "flex items-center gap-2";

  const roiValue = document.createElement("span");
  roiValue.className = "auto-buy-value";
  roiControls.appendChild(roiValue);

  const roiToggle = document.createElement("button");
  roiToggle.type = "button";
  roiToggle.className = "toggle-button";
  roiControls.appendChild(roiToggle);

  roiHeader.appendChild(roiControls);
  roiBlock.appendChild(roiHeader);

  const roiSlider = document.createElement("input");
  roiSlider.type = "range";
  roiSlider.className = "range-input";
  roiSlider.min = AUTO_BUY_ROI_MIN.toString();
  roiSlider.max = AUTO_BUY_ROI_MAX.toString();
  roiSlider.step = "10";
  roiSlider.value = state.automation.autoBuy.roi.thresholdSeconds.toString();
  roiBlock.appendChild(roiSlider);

  container.appendChild(roiBlock);

  const reserveBlock = document.createElement("div");
  reserveBlock.className = "auto-buy-option";

  const reserveHeader = document.createElement("div");
  reserveHeader.className = "flex items-center justify-between gap-2";

  const reserveLabel = document.createElement("span");
  reserveLabel.className = "auto-buy-label";
  reserveHeader.appendChild(reserveLabel);

  const reserveControls = document.createElement("div");
  reserveControls.className = "flex items-center gap-2";

  const reserveValue = document.createElement("span");
  reserveValue.className = "auto-buy-value";
  reserveControls.appendChild(reserveValue);

  const reserveToggle = document.createElement("button");
  reserveToggle.type = "button";
  reserveToggle.className = "toggle-button";
  reserveControls.appendChild(reserveToggle);

  reserveHeader.appendChild(reserveControls);
  reserveBlock.appendChild(reserveHeader);

  const reserveSlider = document.createElement("input");
  reserveSlider.type = "range";
  reserveSlider.className = "range-input";
  reserveSlider.min = AUTO_BUY_RESERVE_MIN.toString();
  reserveSlider.max = AUTO_BUY_RESERVE_MAX.toString();
  reserveSlider.step = "1";
  reserveSlider.value = state.automation.autoBuy.reserve.percent.toString();
  reserveBlock.appendChild(reserveSlider);

  container.appendChild(reserveBlock);

  return {
    container,
    title,
    enableButton,
    roiLabel,
    roiToggle,
    roiValue,
    roiSlider,
    reserveLabel,
    reserveToggle,
    reserveValue,
    reserveSlider,
  } satisfies AutoBuyRefs;
}

function createPrestigeModal(): PrestigeModalRefs {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay hidden';
  overlay.setAttribute('aria-hidden', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'modal-card';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const title = document.createElement('h2');
  title.className = 'modal-title';

  const description = document.createElement('p');
  description.className = 'text-sm text-neutral-300';

  const stats = document.createElement('dl');
  stats.className = 'modal-stats grid gap-3 sm:grid-cols-2';

  const current = createModalStat(stats);
  const after = createModalStat(stats);
  const gain = createModalStat(stats);
  const bonus = createModalStat(stats);

  const warning = document.createElement('p');
  warning.className = 'modal-warning';

  const checkboxWrap = document.createElement('label');
  checkboxWrap.className = 'mt-3 flex items-center gap-2 text-sm text-neutral-300';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'h-4 w-4 rounded border border-emerald-500/50 bg-transparent text-emerald-300 focus-visible:ring-emerald-300/70';

  const checkboxLabel = document.createElement('span');

  checkboxWrap.append(checkbox, checkboxLabel);

  const statusLabel = document.createElement('p');
  statusLabel.className = 'text-sm font-medium text-amber-300';

  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'modal-button secondary';

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'modal-button primary';

  actions.append(cancelButton, confirmButton);
  dialog.append(title, description, stats, warning, checkboxWrap, statusLabel, actions);
  overlay.appendChild(dialog);

  return {
    overlay,
    dialog,
    title,
    description,
    warning,
    previewCurrentLabel: current.label,
    previewCurrentValue: current.value,
    previewAfterLabel: after.label,
    previewAfterValue: after.value,
    previewGainLabel: gain.label,
    previewGainValue: gain.value,
    previewBonusLabel: bonus.label,
    previewBonusValue: bonus.value,
    checkbox,
    checkboxLabel,
    confirmButton,
    cancelButton,
    statusLabel,
  } satisfies PrestigeModalRefs;
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










































































