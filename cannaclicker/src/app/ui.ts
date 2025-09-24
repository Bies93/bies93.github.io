import Decimal from "break_infinity.js";
import { handleManualClick, recalcDerivedValues, evaluateAchievements } from "./game";
import { formatDecimal } from "./math";
import type { AbilityId, GameState } from "./state";
import { createDefaultState } from "./state";
import { createAudioManager } from "./audio";
import { t } from "./i18n";
import { exportSave, importSave, clearSave, save } from "./save";
import { spawnFloatingValue } from "./effects";
import { withBase } from "./paths";
import { applyEventReward, type EventClickResult, type EventId } from "./events";
import { maybeRollClickSeed } from "./seeds";
import {
  activateAbility,
  formatAbilityTooltip,
  getAbilityLabel,
  listAbilities,
} from "./abilities";
import { type ResearchFilter } from "./research";
import { getPrestigePreview, performPrestige } from "./prestige";
import {
  createActionButton,
  createAbilityButton,
  createDangerButton,
} from "./ui/components/controls";
import { createPrestigeModal } from "./ui/components/prestigeModal";
import { createStatBlock } from "./ui/components/stats";
import { updateShop } from "./ui/updaters/shop";
import { updateUpgrades } from "./ui/updaters/upgrades";
import { updateResearch } from "./ui/updaters/research";
import { updateStrings } from "./ui/updaters/strings";
import { plantStageAsset, preloadPlantStage } from "./ui/updaters/plant";
import { updateStats } from "./ui/updaters/statPanel";
import { updateAbilities } from "./ui/updaters/abilities";
import { updateSidePanel } from "./ui/updaters/sidePanel";
import { updatePrestigePanel } from "./ui/updaters/prestigePanel";
import { updateAchievements } from "./ui/updaters/achievements";
import { processSeedNotifications } from "./ui/updaters/seeds";
import { updateOfflineToast } from "./ui/updaters/offline";
import type { AbilityButtonRefs, SidePanelTab, UIRefs } from "./ui/types";
import { createSidePanel } from "./ui/panels/sidePanel";
import {
  formatActiveKickstartSummary,
  formatInteger,
  formatNextKickstartSummary,
  formatPermanentBonusSummary,
} from "./ui/utils/format";
import {
  EVENT_SPAWN_MAX_MS,
  EVENT_SPAWN_MIN_MS,
  EVENT_VISIBLE_MAX_MS,
  EVENT_VISIBLE_MIN_MS,
  createEventButton,
  pickRandomEventDefinition,
  randomBetween,
  type RandomEventDefinition,
} from "./ui/events/random";

let refs: UIRefs | null = null;
let audio = createAudioManager(false);
let lastAnnounced = new Decimal(0);
let activeResearchFilter: ResearchFilter = "all";
let researchFilterManuallySelected = false;
let activeSidePanelTab: SidePanelTab = "shop";
let prestigeOpen = false;
let prestigeAcknowledged = false;

let eventSchedulerReady = false;
let schedulerState: GameState | null = null;
let eventSpawnTimer: number | null = null;
let eventLifetimeTimer: number | null = null;
let activeEventButton: HTMLButtonElement | null = null;
export function renderUI(state: GameState): void {
  if (!refs) {
    refs = buildUI(state);
    audio.setMuted(state.muted);
    recalcDerivedValues(state);
    evaluateAchievements(state);
    attachGlobalShortcuts(state);
  }

  schedulerState = state;
  ensureEventScheduler(state);

  if (!refs) {
    return;
  }

  updateStrings(state, refs);
  updateStats(state, refs);
  processSeedNotifications(state, refs, showToast);
  updateAbilities(state, refs);
  updateSidePanel(refs, activeSidePanelTab);

  updateShop(state, refs, {
    onPurchase: () => {
      audio.playPurchase();
      renderUI(state);
    },
  });
  updateUpgrades(state, refs, {
    onPurchase: (definition, container) => {
      audio.playPurchase();
      const locale = state.locale;
      const title = t(locale, "upgrades.toast.title");
      const message = t(locale, "upgrades.toast.message", { name: definition.name[locale] });
      showToast(title, message);
      save(state);
      spawnFloatingValue(container, t(locale, "upgrades.fx.spark"), "rgb(74 222 128)");
      renderUI(state);
    },
  });

  const result = updateResearch(
    state,
    refs,
    activeResearchFilter,
    researchFilterManuallySelected,
    () => {
      audio.playPurchase();
      recalcDerivedValues(state);
      renderUI(state);
    },
  );
  activeResearchFilter = result.activeFilter;
  researchFilterManuallySelected = result.researchFilterManuallySelected;

  updatePrestigePanel(state, refs);
  updateAchievements(state, refs);
  updatePrestigeModal(state);
  updateOfflineToast(state, showToast);
}

function buildUI(state: GameState): UIRefs {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app root missing");
  }

  root.innerHTML = "";
  root.className =
    "relative mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10";

  const heroImageSet = `image-set(url("${withBase("img/bg-hero-1920.png")}") type("image/png") 1x, url("${withBase("img/bg-hero-2560.png")}") type("image/png") 2x)`;
  document.documentElement.style.setProperty("--hero-image", heroImageSet);
  document.documentElement.style.setProperty("--bg-plants", `url("${withBase("img/bg-plants-1280.png")}")`);
  document.documentElement.style.setProperty("--bg-noise", `url("${withBase("img/bg-noise-512.png")}")`);

  const muteControl = createActionButton(withBase("icons/ui/ui-mute.png"));
  const exportControl = createActionButton(withBase("icons/ui/ui-export.png"));
  const importControl = createActionButton(withBase("icons/ui/ui-import.png"));
  const resetControl = createDangerButton(withBase("icons/ui/ui-reset.png"));

  const headerTitle = mountHeader(root, [
    muteControl.button,
    exportControl.button,
    importControl.button,
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
  const seedRateStat = createStatBlock("stats.seedRate", infoList, statsLabels, statsMeta);
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

  const eventLayer = document.createElement("div");
  eventLayer.className = "event-layer";
  root.appendChild(eventLayer);

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

  const sidePanel = createSidePanel(activeSidePanelTab);
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
    seedRate: seedRateStat,
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
    },
    announcer,
    abilityTitle,
    abilityList: abilityRefs,
    sidePanel,
    shopEntries: new Map(),
    upgradeEntries: new Map(),
    prestigeModal,
    toastContainer,
    eventLayer,
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
    "grid w-full gap-3 rounded-3xl border border-white/10 bg-neutral-900/80 px-3 py-2 shadow-[0_20px_48px_rgba(10,12,21,0.45)] backdrop-blur-xl sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-14 sm:gap-y-2 sm:px-6 lg:px-8";

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
    const seedResult = maybeRollClickSeed(state);
    audio.playClick();
    spawnFloatingValue(refs.clickButton, `+${formatDecimal(gained)}`);
    if (seedResult.gained > 0) {
      const seedsText = formatInteger(state.locale, seedResult.gained);
      spawnFloatingValue(refs.seedBadge, `+${seedsText}🌱`, "rgb(252 211 77)");
      showToast(
        t(state.locale, "seeds.toast.click.title"),
        t(state.locale, "seeds.toast.click.body", { seeds: seedsText }),
      );
    }
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

  refs.seedBadge.addEventListener("click", () => {
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
    if (!prestigeAcknowledged || !preview.requirementMet) {
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

function triggerAbility(state: GameState, abilityId: AbilityId): void {
  if (!activateAbility(state, abilityId)) {
    return;
  }

  recalcDerivedValues(state);
  evaluateAchievements(state);
  renderUI(state);
}

function updatePrestigeModal(state: GameState): void {
  if (!refs) {
    return;
  }

  const preview = getPrestigePreview(state);
  const modal = refs.prestigeModal;

  modal.previewCurrentValue.textContent = formatPermanentBonusSummary(state.locale, preview);
  modal.previewAfterValue.textContent = formatNextKickstartSummary(state.locale, preview);
  modal.previewGainValue.textContent = formatActiveKickstartSummary(state.locale, preview);
  modal.previewBonusValue.textContent = t(state.locale, 'prestige.modal.requirementProgressValue', {
    current: formatDecimal(preview.lifetimeBuds),
    target: formatDecimal(preview.requirementTarget),
  });

  modal.checkbox.checked = prestigeAcknowledged;

  const status = preview.requirementMet
    ? ''
    : t(state.locale, 'prestige.modal.requirementHint', {
        target: formatDecimal(preview.requirementTarget),
        current: formatDecimal(preview.lifetimeBuds),
      });

  modal.statusLabel.textContent = status;
  modal.statusLabel.classList.toggle('hidden', status.length === 0);

  modal.confirmButton.disabled = !prestigeAcknowledged || !preview.requirementMet;
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

function ensureEventScheduler(state: GameState): void {
  if (!refs) {
    return;
  }

  if (!eventSchedulerReady) {
    eventSchedulerReady = true;
    document.addEventListener("visibilitychange", handleEventVisibilityChange);
    scheduleNextEvent(state, true);
    return;
  }

  if (!eventSpawnTimer && !activeEventButton) {
    scheduleNextEvent(state);
  }
}

function handleEventVisibilityChange(): void {
  if (document.hidden) {
    if (eventSpawnTimer) {
      window.clearTimeout(eventSpawnTimer);
      eventSpawnTimer = null;
    }
    if (eventLifetimeTimer) {
      window.clearTimeout(eventLifetimeTimer);
      eventLifetimeTimer = null;
    }
    if (activeEventButton) {
      activeEventButton.remove();
      activeEventButton = null;
    }
    return;
  }

  scheduleNextEvent();
}

function scheduleNextEvent(state?: GameState | null, immediate = false): void {
  const targetState = state ?? schedulerState;
  if (!targetState || !refs) {
    return;
  }

  if (eventSpawnTimer) {
    window.clearTimeout(eventSpawnTimer);
  }

  const delay = immediate
    ? randomBetween(1_500, 3_500)
    : randomBetween(EVENT_SPAWN_MIN_MS, EVENT_SPAWN_MAX_MS);

  eventSpawnTimer = window.setTimeout(() => {
    spawnRandomEvent(targetState);
  }, delay);
}

function spawnRandomEvent(state: GameState): void {
  eventSpawnTimer = null;

  if (!refs || document.hidden) {
    scheduleNextEvent(state, true);
    return;
  }

  if (activeEventButton) {
    return;
  }

  const layer = refs.eventLayer;
  const rect = layer.getBoundingClientRect();
  if (rect.width < 80 || rect.height < 80) {
    scheduleNextEvent(state, true);
    return;
  }

  const definition = pickRandomEventDefinition();
  const lifetime = randomBetween(EVENT_VISIBLE_MIN_MS, EVENT_VISIBLE_MAX_MS);
  const button = createEventButton(definition, state, lifetime, refs);
  layer.appendChild(button);
  activeEventButton = button;

  eventLifetimeTimer = window.setTimeout(() => {
    removeActiveEvent("expired");
  }, lifetime);

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleEventClick(state, definition, button);
  });
}

function handleEventClick(
  state: GameState,
  definition: RandomEventDefinition,
  element: HTMLButtonElement,
): void {
  const now = Date.now();
  const hadActiveBoost =
    state.temp.activeEventBoost === "lucky_joint" && state.temp.eventBoostEndsAt > now;

  const result = applyEventReward(state, definition.id, now);
  if (result.requiresRecalc) {
    recalcDerivedValues(state);
  }

  showEventFeedback(state, definition.id, result, hadActiveBoost, element);
  removeActiveEvent("clicked");
  renderUI(state);
}

function showEventFeedback(
  state: GameState,
  id: EventId,
  result: EventClickResult,
  refreshed: boolean,
  origin: HTMLElement,
): void {
  if (!refs) {
    return;
  }

  if (id === "golden_bud" && result.budGain) {
    const formatted = formatDecimal(result.budGain);
    spawnFloatingValue(origin, `+${formatted}`);
    showToast(
      t(state.locale, "events.goldenBud.title"),
      t(state.locale, "events.goldenBud.body", { buds: formatted }),
    );
  }

  if (typeof result.seedGain === "number" && result.seedGain > 0) {
    const formatted = result.seedGain.toString();
    spawnFloatingValue(origin, `+${formatted}🌱`, "rgb(252 211 77)");

    let messageKey: string;
    if (id === "seed_pack") {
      messageKey = "events.seedPack.body";
    } else if (id === "golden_bud") {
      messageKey = "events.goldenBud.seedBody";
    } else {
      messageKey = "events.luckyJoint.seedBody";
    }

    showToast(
      t(state.locale, `events.${id}.title`),
      t(state.locale, messageKey, { seeds: formatted }),
    );
  }

  if (id === "lucky_joint" && result.multiplier) {
    const durationSeconds = Math.round((result.durationMs ?? 0) / 1000);
    spawnFloatingValue(origin, `×${result.multiplier.toFixed(1)}`, "rgb(96 165 250)");
    const bodyKey = refreshed ? "events.luckyJoint.refresh" : "events.luckyJoint.body";
    showToast(
      t(state.locale, "events.luckyJoint.title"),
      t(state.locale, bodyKey, {
        multiplier: result.multiplier,
        duration: durationSeconds,
      }),
    );
  }
}

function removeActiveEvent(reason: "clicked" | "expired"): void {
  if (eventLifetimeTimer) {
    window.clearTimeout(eventLifetimeTimer);
    eventLifetimeTimer = null;
  }

  if (!activeEventButton) {
    scheduleNextEvent();
    return;
  }

  const element = activeEventButton;
  activeEventButton = null;

  element.remove();
  scheduleNextEvent(undefined, reason === "clicked");
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

function announce(refs: UIRefs, total: Decimal): void {
  if (total.minus(lastAnnounced).lessThan(10)) {
    return;
  }

  refs.announcer.textContent = `Buds: ${formatDecimal(total)}`;
  lastAnnounced = total;
}

export {};










































































