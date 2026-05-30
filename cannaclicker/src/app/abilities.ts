import { ABILITIES, type Ability, type AbilityId, type AbilityUnlock } from '../data/abilities';
import type { GameState } from './state';
import { t, type LocaleKey } from './i18n';

export interface AbilityProgress {
  active: boolean;
  remaining: number;
  cooldown: number;
  readyIn: number;
}

const abilityById = new Map<AbilityId, Ability>(ABILITIES.map((ability) => [ability.id, ability]));

export function listAbilities(): readonly Ability[] {
  return ABILITIES;
}

export function getAbilityDefinition(id: AbilityId): Ability | undefined {
  return abilityById.get(id);
}

function computeAbilityStrength(state: GameState, ability: Ability): number {
  if (ability.appliesTo === 'bps') {
    return ability.baseMultiplier * (1 + state.temp.abilityPowerBonus);
  }

  return ability.baseMultiplier;
}

function getRuntime(state: GameState, id: AbilityId) {
  return state.abilities[id];
}

export function isAbilityReady(state: GameState, id: AbilityId, now = Date.now()): boolean {
  if (!isAbilityUnlocked(state, id)) {
    return false;
  }

  const runtime = getRuntime(state, id);
  if (!runtime) {
    return false;
  }

  if (runtime.active) {
    return runtime.endsAt <= now;
  }

  return runtime.readyAt <= now;
}

export function isAbilityUnlocked(state: GameState, id: AbilityId): boolean {
  const ability = abilityById.get(id);
  if (!ability) {
    return false;
  }

  const unlock: AbilityUnlock | undefined = 'unlock' in ability ? ability.unlock : undefined;
  if (!unlock) {
    return true;
  }

  if (unlock.totalBuds && state.total.lessThan(unlock.totalBuds)) {
    return false;
  }

  if (
    unlock.prestigeSeeds &&
    (state.prestige.totalSeeds ?? state.prestige.seeds) < unlock.prestigeSeeds
  ) {
    return false;
  }

  return true;
}

export function activateAbility(state: GameState, id: AbilityId, now = Date.now()): boolean {
  const ability = abilityById.get(id);
  const runtime = getRuntime(state, id);
  if (!ability || !runtime) {
    return false;
  }

  if (runtime.active || !isAbilityReady(state, id, now)) {
    return false;
  }

  runtime.active = true;
  runtime.multiplier = computeAbilityStrength(state, ability);
  const durationMult = Number.isFinite(state.temp.abilityDurationMult)
    ? Math.max(0, state.temp.abilityDurationMult)
    : 1;
  const effectiveDuration = ability.durationSec * (durationMult > 0 ? durationMult : 1);
  runtime.endsAt = now + effectiveDuration * 1000;
  runtime.readyAt = runtime.endsAt + ability.cooldownSec * 1000;
  state.meta.abilityUsesTotal += 1;
  state.meta.abilityUses[id] = (state.meta.abilityUses[id] ?? 0) + 1;
  return true;
}

export function endAbility(state: GameState, id: AbilityId): void {
  const runtime = getRuntime(state, id);
  if (!runtime || !runtime.active) {
    return;
  }

  runtime.active = false;
  runtime.endsAt = Date.now();
  runtime.multiplier = 1;
}

export function updateAbilityTimers(state: GameState, now = Date.now()): boolean {
  let changed = false;
  for (const ability of ABILITIES) {
    const runtime = getRuntime(state, ability.id);
    if (!runtime) {
      continue;
    }

    if (runtime.active && now >= runtime.endsAt) {
      runtime.active = false;
      runtime.endsAt = now;
      runtime.multiplier = 1;
      changed = true;
    }

    if (!runtime.active && runtime.readyAt < now) {
      runtime.readyAt = now;
    }
  }

  return changed;
}

export function getAbilityProgress(
  state: GameState,
  id: AbilityId,
  now = Date.now(),
): AbilityProgress {
  const runtime = getRuntime(state, id);
  const ability = abilityById.get(id);
  if (!runtime || !ability || !isAbilityUnlocked(state, id)) {
    return {
      active: false,
      remaining: 0,
      cooldown: ability?.cooldownSec ?? 0,
      readyIn: Number.POSITIVE_INFINITY,
    } satisfies AbilityProgress;
  }

  const remaining = runtime.active ? Math.max(0, runtime.endsAt - now) / 1000 : 0;
  const readyIn = runtime.readyAt > now ? (runtime.readyAt - now) / 1000 : 0;

  return {
    active: runtime.active,
    remaining,
    cooldown: ability.cooldownSec,
    readyIn,
  } satisfies AbilityProgress;
}

export function formatAbilityTooltip(state: GameState, id: AbilityId, locale: LocaleKey): string {
  const ability = abilityById.get(id);
  if (!ability) {
    return '';
  }

  const strength = computeAbilityStrength(state, ability);
  const durationMult = Number.isFinite(state.temp.abilityDurationMult)
    ? Math.max(0, state.temp.abilityDurationMult)
    : 1;
  const effectiveDuration = Math.max(
    1,
    Math.round(ability.durationSec * (durationMult > 0 ? durationMult : 1)),
  );
  const base = t(locale, ability.descriptionKey, {
    multiplier: strength.toFixed(2),
    duration: effectiveDuration,
    cooldown: ability.cooldownSec,
  });

  if (ability.id === 'overdrive' && state.temp.abilityPowerBonus > 0) {
    const bonusPercent = Math.round(state.temp.abilityPowerBonus * 100);
    return `${base} (+${bonusPercent}%)`;
  }

  return base;
}

export function getAbilityLabel(id: AbilityId, locale: LocaleKey): string {
  const ability = abilityById.get(id);
  if (!ability) {
    return '';
  }

  return t(locale, ability.nameKey);
}

export function abilityMultiplier(state: GameState, id: AbilityId): number {
  const runtime = getRuntime(state, id);
  if (!runtime) {
    return 1;
  }

  return runtime.active ? runtime.multiplier : 1;
}

export function abilityMultiplierFor(state: GameState, target: Ability['appliesTo']): number {
  return ABILITIES.reduce((multiplier, ability) => {
    if (ability.appliesTo !== target) {
      return multiplier;
    }
    const runtime = getRuntime(state, ability.id);
    return runtime?.active ? multiplier * runtime.multiplier : multiplier;
  }, 1);
}

export function abilityAutoClickRate(state: GameState): number {
  return ABILITIES.reduce((rate, ability) => {
    if (ability.appliesTo !== 'auto') {
      return rate;
    }
    const runtime = getRuntime(state, ability.id);
    return runtime?.active ? rate + runtime.multiplier : rate;
  }, 0);
}

export function reapplyAbilityEffects(state: GameState): void {
  for (const ability of ABILITIES) {
    const runtime = getRuntime(state, ability.id);
    if (!runtime) {
      continue;
    }

    if (runtime.active) {
      runtime.multiplier = computeAbilityStrength(state, ability);
    } else {
      runtime.multiplier = 1;
    }
  }
}
