import Decimal from 'break_infinity.js';
import type { GameState } from './state';
import { activateAbility, isAbilityReady, listAbilities, updateAbilityTimers } from './abilities';
import { buyItem, recalcDerivedValues } from './game';
import { advanceEventPipeline, clearExpiredEventBoost } from './events';
import { clearExpiredKickstart } from './milestones';
import { processSeedSystems } from './seeds';
import { getShopEntries } from './shop';

interface LoopOptions {
  autosaveSeconds?: number;
  paused?: boolean;
}

interface LoopHandlers {
  onTick: (state: GameState) => void;
  onAutosave?: (state: GameState) => void;
}

export function startLoop(
  state: GameState,
  handlers: LoopHandlers,
  options: LoopOptions = {},
): () => void {
  const autosaveTarget = Math.max(5, options.autosaveSeconds ?? 10);
  const pauseOnStart = !!options.paused;
  let last = performance.now();
  let accumulator = 0;
  let autosaveTimer = 0;
  let automationTimer = 0;
  let frame = 0;

  const step = (timestamp: number) => {
    if (pauseOnStart || document.hidden) {
      last = timestamp;
      frame = requestAnimationFrame(step);
      return;
    }

    const delta = Math.min(1, (timestamp - last) / 1000);
    last = timestamp;
    state.lastTick = timestamp;

    const now = Date.now();

    const production = state.bps.mul(delta);
    if (production.greaterThan(0)) {
      state.buds = state.buds.add(production);
      state.total = state.total.add(production);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(production);
    }

    const managerClickRate =
      state.automation.autoClick && state.automation.unlockedTier >= 1 ? 0.5 : 0;
    const effectiveAutoClickRate = state.temp.autoClickRate + managerClickRate;
    if (effectiveAutoClickRate > 0) {
      const autoClicks = new Decimal(effectiveAutoClickRate * delta);
      const automationBpsGain = state.bps
        .mul(Math.max(0, state.temp.automationBpsShare ?? 0))
        .mul(delta);
      const autoGain = state.bpc.mul(autoClicks).add(automationBpsGain);
      if (autoGain.greaterThan(0)) {
        state.buds = state.buds.add(autoGain);
        state.total = state.total.add(autoGain);
        state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(autoGain);
      }
    }

    const abilityChanged = updateAbilityTimers(state, now);
    const eventEnded = clearExpiredEventBoost(state, now);
    const kickstartExpired = clearExpiredKickstart(state, now);
    if (kickstartExpired) {
      state.temp.kickstartRemainingMs = 0;
    } else if (state.prestige.kickstart) {
      state.temp.kickstartRemainingMs = Math.max(0, state.prestige.kickstart.endsAt - now);
    } else if (state.temp.kickstartRemainingMs !== 0) {
      state.temp.kickstartRemainingMs = 0;
    }

    if (abilityChanged || eventEnded || kickstartExpired) {
      recalcDerivedValues(state);
    }

    processSeedSystems(state, delta, now);
    advanceEventPipeline(state, delta, now);
    automationTimer += delta;
    if (automationTimer >= 3) {
      runAutomationManager(state, now);
      automationTimer = 0;
    }

    accumulator += delta;
    autosaveTimer += delta;

    if (accumulator >= 0.1) {
      handlers.onTick(state);
      accumulator = 0;
    }

    if (autosaveTimer >= autosaveTarget) {
      handlers.onAutosave?.(state);
      autosaveTimer = 0;
    }

    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frame);
}

function runAutomationManager(state: GameState, now: number): void {
  if (state.automation.unlockedTier >= 2 && state.automation.autoBuyMode !== 'off') {
    const entries = getShopEntries(state).filter((entry) => entry.unlocked && entry.affordable);
    const selected = selectAutomationBuy(state, entries);
    if (selected) {
      buyItem(state, selected.definition.id, 1);
    }
  }

  if (state.automation.unlockedTier >= 4 && state.automation.abilityMode !== 'manual') {
    const wantsEventWindow =
      state.automation.abilityMode === 'event_buff' &&
      ((state.temp.eventBoosts?.length ?? 0) > 0 || state.events.active.length > 0);
    const wantsCooldownChain = state.automation.abilityMode === 'cooldown_chain';
    if (wantsEventWindow || wantsCooldownChain) {
      const ability = listAbilities().find((entry) => isAbilityReady(state, entry.id, now));
      if (ability) {
        activateAbility(state, ability.id, now);
        recalcDerivedValues(state);
      }
    }
  }
}

function selectAutomationBuy(
  state: GameState,
  entries: ReturnType<typeof getShopEntries>,
): ReturnType<typeof getShopEntries>[number] | null {
  if (entries.length === 0) {
    return null;
  }
  switch (state.automation.autoBuyMode) {
    case 'cheapest':
      return [...entries].sort((a, b) => a.cost.cmp(b.cost))[0] ?? null;
    case 'best_roi':
      return [...entries].sort((a, b) => (a.roi ?? Number.MAX_VALUE) - (b.roi ?? Number.MAX_VALUE))[0] ?? null;
    case 'next_milestone':
      return [...entries].sort((a, b) => a.tier.remainingCount - b.tier.remainingCount)[0] ?? null;
    default:
      return null;
  }
}
