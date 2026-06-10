import type { LocaleKey } from '../app/i18n';

export const challengeIds = [
  'no_events',
  'manual_garden',
  'silent_greenhouse',
  'budget_run',
  'risk_market',
  'tiny_pot',
] as const;

export type ChallengeId = (typeof challengeIds)[number];

export type ChallengeRule =
  | { type: 'disableEvents' }
  | { type: 'disablePassiveProduction' }
  | { type: 'disableAbilities' }
  | { type: 'costMultiplier'; value: number }
  | { type: 'eventCategoryFocus'; value: 'risk' }
  | { type: 'maxPerItem'; value: number };

export type ChallengeReward =
  | { type: 'globalMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
  | { type: 'offlineCapHours'; value: number }
  | { type: 'eventRewardMultiplier'; value: number }
  | { type: 'cosmetic'; id: string };

export interface ChallengeDefinition {
  id: ChallengeId;
  order: number;
  displayName: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  completion: Record<LocaleKey, string>;
  unlockHint: Record<LocaleKey, string>;
  targetLifetimeBuds: number;
  rules: readonly ChallengeRule[];
  rewards: readonly ChallengeReward[];
}

export const challenges: readonly ChallengeDefinition[] = [
  {
    id: 'no_events',
    order: 10,
    displayName: { de: 'No Events', en: 'No Events' },
    description: { de: 'Keine Event-Spawns. Grundproduktion zählt.', en: 'No event spawns. Base production matters.' },
    completion: { de: 'Erreiche 3 Mio Lifetime-Buds im Challenge-Run.', en: 'Reach 3M lifetime buds in the challenge run.' },
    unlockHint: { de: 'Prestige 1.', en: 'Prestige 1.' },
    targetLifetimeBuds: 3_000_000,
    rules: [{ type: 'disableEvents' }],
    rewards: [
      { type: 'globalMultiplier', value: 1.02 },
      { type: 'cosmetic', id: 'badge_no_events' },
    ],
  },
  {
    id: 'manual_garden',
    order: 20,
    displayName: { de: 'Manual Garden', en: 'Manual Garden' },
    description: { de: 'Passive Produktion wird stark begrenzt. Klicks tragen den Run.', en: 'Passive production is heavily limited. Clicks carry the run.' },
    completion: { de: 'Erreiche 750 BPC.', en: 'Reach 750 BPC.' },
    unlockHint: { de: '500 manuelle Klicks.', en: '500 manual clicks.' },
    targetLifetimeBuds: 2_000_000,
    rules: [{ type: 'disablePassiveProduction' }],
    rewards: [
      { type: 'clickMultiplier', value: 1.04 },
      { type: 'cosmetic', id: 'skin_manual_garden' },
    ],
  },
  {
    id: 'silent_greenhouse',
    order: 30,
    displayName: { de: 'Silent Greenhouse', en: 'Silent Greenhouse' },
    description: { de: 'Abilities sind aus. Offline-Effizienz wird nach Abschluss besser.', en: 'Abilities are off. Offline efficiency improves after completion.' },
    completion: { de: 'Erreiche 5 Mio Lifetime-Buds.', en: 'Reach 5M lifetime buds.' },
    unlockHint: { de: 'Nutze 25 Fähigkeiten.', en: 'Use 25 abilities.' },
    targetLifetimeBuds: 5_000_000,
    rules: [{ type: 'disableAbilities' }],
    rewards: [
      { type: 'offlineCapHours', value: 2 },
      { type: 'cosmetic', id: 'theme_silent_greenhouse' },
    ],
  },
  {
    id: 'budget_run',
    order: 40,
    displayName: { de: 'Budget Run', en: 'Budget Run' },
    description: { de: 'Shoppreise steigen. Milestones und Planung werden wichtiger.', en: 'Shop prices rise. Milestones and planning matter more.' },
    completion: { de: 'Erreiche 8 Mio Lifetime-Buds.', en: 'Reach 8M lifetime buds.' },
    unlockHint: { de: '100 Achievement-Score.', en: '100 achievement score.' },
    targetLifetimeBuds: 8_000_000,
    rules: [{ type: 'costMultiplier', value: 1.18 }],
    rewards: [
      { type: 'globalMultiplier', value: 1.025 },
      { type: 'cosmetic', id: 'frame_budget_run' },
    ],
  },
  {
    id: 'risk_market',
    order: 50,
    displayName: { de: 'Risk Market', en: 'Risk Market' },
    description: { de: 'Eventpool fokussiert Risk-Momente.', en: 'Event pool focuses risk moments.' },
    completion: { de: 'Klicke 20 Risk-Events oder erreiche 10 Mio Buds.', en: 'Click 20 risk events or reach 10M buds.' },
    unlockHint: { de: 'Klicke 10 Risk-Events.', en: 'Click 10 risk events.' },
    targetLifetimeBuds: 10_000_000,
    rules: [{ type: 'eventCategoryFocus', value: 'risk' }],
    rewards: [
      { type: 'eventRewardMultiplier', value: 1.04 },
      { type: 'cosmetic', id: 'badge_risk_market' },
    ],
  },
  {
    id: 'tiny_pot',
    order: 60,
    displayName: { de: 'Tiny Pot', en: 'Tiny Pot' },
    description: { de: 'Maximal 80 Kopien pro Item. Breite Builds werden wertvoller.', en: 'At most 80 copies per item. Wide builds become stronger.' },
    completion: { de: 'Erreiche 12 Mio Lifetime-Buds.', en: 'Reach 12M lifetime buds.' },
    unlockHint: { de: 'Schalte alle Shop-Items frei.', en: 'Unlock every shop item.' },
    targetLifetimeBuds: 12_000_000,
    rules: [{ type: 'maxPerItem', value: 80 }],
    rewards: [
      { type: 'globalMultiplier', value: 1.03 },
      { type: 'cosmetic', id: 'skin_tiny_pot' },
    ],
  },
];

export const challengeById = new Map<ChallengeId, ChallengeDefinition>(
  challenges.map((challenge) => [challenge.id, challenge]),
);
