import type { LocaleKey } from '../app/i18n';
import type { EventId, EventSeason } from '../app/events';

export type SeasonId = EventSeason;

export interface SeasonDefinition {
  id: SeasonId;
  order: number;
  displayName: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  unlockHint: Record<LocaleKey, string>;
  accent: string;
  eventWeights: Partial<Record<EventId, number>>;
  rewardMultiplier: number;
}

export const seasons: readonly SeasonDefinition[] = [
  {
    id: 'evergreen',
    order: 10,
    displayName: { de: 'Evergreen', en: 'Evergreen' },
    description: { de: 'Stabile Standard-Saison mit ausgeglichener Event-Mischung.', en: 'Stable default season with a balanced event mix.' },
    unlockHint: { de: 'Immer verfügbar.', en: 'Always available.' },
    accent: '#56f39a',
    eventWeights: {},
    rewardMultiplier: 1,
  },
  {
    id: 'sunshift',
    order: 20,
    displayName: { de: 'Sunshift', en: 'Sunshift' },
    description: { de: 'Mehr helle Reward- und Seed-Fenster.', en: 'More bright reward and seed windows.' },
    unlockHint: { de: 'Erreiche 150 Achievement-Score.', en: 'Reach 150 achievement score.' },
    accent: '#ffd166',
    eventWeights: { sunbeam: 2.2, solstice_seed: 2.8, fertile_rain: 1.4, golden_bud: 1.25 },
    rewardMultiplier: 1.03,
  },
  {
    id: 'nightMarket',
    order: 30,
    displayName: { de: 'Night Market', en: 'Night Market' },
    description: { de: 'Kostenfenster, Risk-Events und Chain-Momente werden wichtiger.', en: 'Cost windows, risk events and chains matter more.' },
    unlockHint: { de: 'Führe 1 Prestige durch.', en: 'Perform 1 prestige.' },
    accent: '#8b5cf6',
    eventWeights: { night_market: 3, blackout_sale: 1.8, supply_drop: 1.5, trail_marker: 1.35 },
    rewardMultiplier: 1.02,
  },
  {
    id: 'festival',
    order: 40,
    displayName: { de: 'Harvest Festival', en: 'Harvest Festival' },
    description: { de: 'Seltene große Momente, mehr Buff-Ketten und sichtbarer Fortschritt.', en: 'Rarer big moments, more buff chains and visible progress.' },
    unlockHint: { de: 'Erreiche Prestige 2 oder 8 Contract Tokens.', en: 'Reach prestige 2 or 8 contract tokens.' },
    accent: '#fb7185',
    eventWeights: { festival_lantern: 3, aurora_bloom: 1.9, cascade_bloom: 1.5, echo_harvest: 1.35 },
    rewardMultiplier: 1.04,
  },
];

export const seasonById = new Map<SeasonId, SeasonDefinition>(
  seasons.map((season) => [season.id, season]),
);
