import { spawnFloatingValue } from '../../../effects';
import { formatDecimal } from '../../../math';
import { t } from '../../../i18n';
import { showToast } from '../../services/toast';
import { createEventButton } from '../random';
import type { EventId } from '../../../events';
import type { SchedulerBindings, SchedulerContext } from './types';

const EVENT_TRANSLATION_KEYS: Record<EventId, string> = {
  golden_bud: 'goldenBud',
  seed_pack: 'seedPack',
  lucky_joint: 'luckyJoint',
  fertile_rain: 'fertileRain',
  market_rush: 'marketRush',
  green_surge: 'greenSurge',
  mutant_sprout: 'mutantSprout',
  supply_drop: 'supplyDrop',
};

function getEventTranslationKey(id: EventId): string {
  return EVENT_TRANSLATION_KEYS[id];
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
    void context;
    const translationKey = getEventTranslationKey(id);

    if (result.budGain) {
      const formatted = formatDecimal(result.budGain);
      spawnFloatingValue(origin, `+${formatted}`);
      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, `events.${translationKey}.body`, { buds: formatted }),
      });
    }

    if (typeof result.seedGain === 'number' && result.seedGain > 0) {
      const formatted = result.seedGain.toString();
      spawnFloatingValue(origin, `+${formatted} Seeds`, 'rgb(252 211 77)');

      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, 'events.generic.seedBody', { seeds: formatted }),
      });
    }

    if (result.multiplier) {
      const durationSeconds = Math.round((result.durationMs ?? 0) / 1000);
      spawnFloatingValue(origin, `×${result.multiplier.toFixed(1)}`, 'rgb(96 165 250)');
      const bodyKey = refreshed ? 'events.generic.boostRefresh' : 'events.generic.boostBody';
      showToast({
        title: t(state.locale, `events.${translationKey}.title`),
        message: t(state.locale, bodyKey, {
          multiplier: result.multiplier,
          duration: durationSeconds,
        }),
      });
    }
  },
};
