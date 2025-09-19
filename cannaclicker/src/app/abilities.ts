import { formatDecimal } from './math';
import type { GameState, AbilityId } from './state';

export interface AbilityDefinition {
  id: AbilityId;
  label: Record<'de' | 'en', string>;
  description: Record<'de' | 'en', string>;
  duration: number;
  cooldown: number;
  multiplier: number;
  affects: 'bps' | 'bpc';
}

export interface AbilityProgress {
  active: boolean;
  remaining: number;
  cooldown: number;
  readyIn: number;
}

const definitions: Record<AbilityId, AbilityDefinition> = {
  overdrive: {
    id: 'overdrive',
    label: {
      de: 'Overdrive',
      en: 'Overdrive',
    },
    description: {
      de: 'Verfünffacht für kurze Zeit deine Buds pro Sekunde.',
      en: 'Quintuples your buds per second for a short time.',
    },
    duration: 10,
    cooldown: 60,
    multiplier: 5,
    affects: 'bps',
  },
  burst_click: {
    id: 'burst_click',
    label: {
      de: 'Burst Click',
      en: 'Burst Click',
    },
    description: {
      de: 'Multipliziert deine Buds pro Klick für wenige Sekunden.',
      en: 'Multiplies your buds per click for a few seconds.',
    },
    duration: 5,
    cooldown: 45,
    multiplier: 20,
    affects: 'bpc',
  },
};

export function getAbilityDefinition(id: AbilityId): AbilityDefinition {
  return definitions[id];
}

export function listAbilities(): AbilityDefinition[] {
  return Object.values(definitions);
}

export function isAbilityReady(state: GameState, id: AbilityId, now = Date.now()): boolean {
  const ability = state.abilities[id];
  if (!ability) {
    return false;
  }

  if (ability.active) {
    return ability.endsAt <= now;
  }

  return ability.readyAt <= now;
}

export function activateAbility(state: GameState, id: AbilityId, now = Date.now()): boolean {
  const definition = definitions[id];
  const runtime = state.abilities[id];
  if (!definition || !runtime) {
    return false;
  }

  if (!isAbilityReady(state, id, now)) {
    return false;
  }

  const durationMultiplier = id === 'overdrive' ? state.temp.overdriveDurationMult : 1;
  const duration = definition.duration * durationMultiplier;
  runtime.active = true;
  runtime.endsAt = now + duration * 1000;
  runtime.readyAt = runtime.endsAt + definition.cooldown * 1000;
  return true;
}

export function updateAbilityTimers(state: GameState, now = Date.now()): boolean {
  let changed = false;
  for (const definition of listAbilities()) {
    const runtime = state.abilities[definition.id];
    if (!runtime) {
      continue;
    }

    if (runtime.active && runtime.endsAt <= now) {
      runtime.active = false;
      runtime.endsAt = now;
      changed = true;
    }

    if (!runtime.active && runtime.readyAt < now) {
      runtime.readyAt = now;
    }
  }

  return changed;
}

export function getAbilityProgress(state: GameState, id: AbilityId, now = Date.now()): AbilityProgress {
  const runtime = state.abilities[id];
  const definition = definitions[id];
  if (!runtime || !definition) {
    return { active: false, remaining: 0, cooldown: 0, readyIn: 0 } satisfies AbilityProgress;
  }

  const remaining = runtime.active ? Math.max(0, runtime.endsAt - now) / 1000 : 0;
  const readyIn = runtime.readyAt > now ? (runtime.readyAt - now) / 1000 : 0;
  const cooldown = definition.cooldown;

  return {
    active: runtime.active,
    remaining,
    cooldown,
    readyIn,
  } satisfies AbilityProgress;
}

export function abilityMultiplier(state: GameState, id: AbilityId): number {
  const definition = definitions[id];
  const runtime = state.abilities[id];
  if (!definition || !runtime) {
    return 1;
  }

  if (!runtime.active) {
    return 1;
  }

  return definition.multiplier;
}

export function formatAbilityTooltip(state: GameState, id: AbilityId, locale: 'de' | 'en'): string {
  const definition = definitions[id];
  if (!definition) {
    return '';
  }

  const base = definition.description[locale];
  if (definition.affects === 'bps') {
    return `${base} (${formatDecimal(definition.multiplier)}× BPS)`;
  }

  return `${base} (${formatDecimal(definition.multiplier)}× BPC)`;
}
