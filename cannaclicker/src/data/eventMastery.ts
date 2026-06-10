import type { EventId } from '../app/events';
import type { LocaleKey } from '../app/i18n';

export interface EventMasteryDefinition {
  id: EventId;
  thresholds: readonly [number, number, number];
  rewardSummary: Record<LocaleKey, string>;
}

const defaultThresholds = [10, 50, 250] as const;

const masteredEventIds: readonly EventId[] = [
  'golden_bud',
  'seed_pack',
  'lucky_joint',
  'fertile_rain',
  'market_rush',
  'green_surge',
  'mutant_sprout',
  'supply_drop',
  'flash_harvest',
  'calm_growth',
  'overgrowth',
  'seed_bloom',
  'tiny_spark',
  'dew_drop',
  'compost_cache',
  'sunbeam',
  'mega_bud',
  'jackpot_canopy',
  'aurora_bloom',
  'trail_marker',
  'cascade_bloom',
  'echo_harvest',
  'volatile_growth',
  'blackout_sale',
  'pest_scare',
  'solstice_seed',
  'night_market',
  'festival_lantern',
];

export const eventMasteries: readonly EventMasteryDefinition[] = masteredEventIds.map((id) => ({
  id,
  thresholds: defaultThresholds,
  rewardSummary: {
    de: '+2/4/6 % Reward-Stärke für dieses Event',
    en: '+2/4/6% reward strength for this event',
  },
}));

export const eventMasteryById = new Map<EventId, EventMasteryDefinition>(
  eventMasteries.map((mastery) => [mastery.id, mastery]),
);
