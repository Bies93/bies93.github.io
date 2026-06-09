import { spawnFloatingValue, spawnParticleBurst } from '../../../effects';
import { formatDecimal } from '../../../math';
import { t } from '../../../i18n';
import { showToast } from '../../services/toast';
import { createEventButton } from '../random';
import { EVENT_I18N_KEYS, getEventDefinition, type EventId } from '../../../events';
import type { SchedulerBindings, SchedulerContext } from './types';

function getEventTranslationKey(id: EventId): string {
  return EVENT_I18N_KEYS[id];
}

function getEventLayer(context: SchedulerContext): HTMLElement | null {
  return context.refs.eventLayer ?? context.refs.eventRoot ?? null;
}

function canSpawnInLayer(layer: HTMLElement): boolean {
  const rect = layer.getBoundingClientRect();
  return rect.width >= 80 && rect.height >= 80;
}

export const defaultSchedulerBindings: SchedulerBindings = {
  mountEvent(context, state, definition, lifetime, onClick) {
    const layer = getEventLayer(context);
    if (!layer || !canSpawnInLayer(layer)) {
      return null;
    }

    const button = createEventButton(definition, state, lifetime, context.refs);
    if (!button) {
      return null;
    }

    layer.appendChild(button);
    context.audio.playEventSpawn(getEventSoundKind(definition.id));
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(button);
    });
    return button;
  },
  removeEvent(element) {
    element.remove();
  },
  showEventFeedback(context, state, id, result, refreshed, origin) {
    const translationKey = getEventTranslationKey(id);
    const soundKind = getEventSoundKind(id);
    context.audio.playEventCollect(soundKind);
    if (result.multiplier) {
      context.audio.playBuffActivate();
    }

    if (result.budGain) {
      const formatted = formatDecimal(result.budGain);
      spawnFloatingValue(origin, `+${formatted}`, soundKind === 'rare' ? 'gold' : 'bud');
      spawnParticleBurst(
        origin,
        soundKind === 'rare' ? 'gold' : 'bud',
        soundKind === 'rare' ? 12 : 7,
      );
      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, `events.${translationKey}.body`, { buds: formatted }),
        tone: soundKind === 'rare' ? 'rare' : 'success',
      });
    }

    if (typeof result.seedGain === 'number' && result.seedGain > 0) {
      const formatted = result.seedGain.toString();
      spawnFloatingValue(origin, `+${formatted} Seeds`, 'seed');
      spawnParticleBurst(origin, 'seed', 9);

      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, 'events.generic.seedBody', { seeds: formatted }),
        tone: 'success',
      });
    }

    if (result.multiplier) {
      const durationSeconds = Math.round((result.durationMs ?? 0) / 1000);
      const floating =
        result.target === 'cost' && result.multiplier < 1
          ? `-${Math.round((1 - result.multiplier) * 100)}%`
          : `×${result.multiplier.toFixed(1)}`;
      spawnFloatingValue(origin, floating, 'boost');
      spawnParticleBurst(origin, 'boost', 9);
      const bodyKey = getBoostBodyKey(result.target, refreshed, result.multiplier);
      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, bodyKey, {
          multiplier: result.multiplier,
          duration: durationSeconds,
        }),
        tone: soundKind === 'rare' ? 'rare' : 'success',
      });
    }
  },
};

function getBoostBodyKey(
  target: string | undefined,
  refreshed: boolean,
  multiplier: number,
): string {
  if (target === 'cost') {
    return multiplier < 1 ? 'events.generic.costBody' : 'events.generic.costRiskBody';
  }
  if (target === 'bpc') {
    return refreshed ? 'events.generic.clickBoostRefresh' : 'events.generic.clickBoostBody';
  }
  return refreshed ? 'events.generic.boostRefresh' : 'events.generic.boostBody';
}

function getEventSoundKind(id: EventId): 'reward' | 'seed' | 'buff' | 'rare' {
  const definition = getEventDefinition(id);
  if (definition.rarity === 'epic' || definition.rarity === 'legendary') {
    return 'rare';
  }
  if (definition.category === 'seasonal' || definition.category === 'major') {
    return 'rare';
  }
  if (id === 'seed_pack' || id === 'seed_bloom' || id === 'solstice_seed') {
    return 'seed';
  }
  if (definition.category === 'risk' || definition.category === 'chain') {
    return 'buff';
  }
  return resultEventIsBuff(id) ? 'buff' : 'reward';
}

function resultEventIsBuff(id: EventId): boolean {
  return (
    id === 'lucky_joint' ||
    id === 'market_rush' ||
    id === 'green_surge' ||
    id === 'calm_growth' ||
    id === 'sunbeam' ||
    id === 'compost_cache' ||
    id === 'dew_drop'
  );
}
