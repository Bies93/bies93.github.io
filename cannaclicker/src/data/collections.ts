import type { LocaleKey } from '../app/i18n';

export type CollectionId = string;
export type CollectionKind = 'plantSkin' | 'theme' | 'badge' | 'frame' | 'musicLayer';

export interface CollectionDefinition {
  id: CollectionId;
  kind: CollectionKind;
  order: number;
  displayName: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  unlockHint: Record<LocaleKey, string>;
  score: number;
}

export const collections: readonly CollectionDefinition[] = [
  {
    id: 'badge_no_events',
    kind: 'badge',
    order: 10,
    displayName: { de: 'Stillstand? Nein.', en: 'Still? No.' },
    description: { de: 'No-Events-Challenge abgeschlossen.', en: 'Completed the No Events challenge.' },
    unlockHint: { de: 'Schließe No Events ab.', en: 'Complete No Events.' },
    score: 8,
  },
  {
    id: 'skin_manual_garden',
    kind: 'plantSkin',
    order: 20,
    displayName: { de: 'Manual Garden Skin', en: 'Manual Garden Skin' },
    description: { de: 'Ein Skin für aktive Runs.', en: 'A skin for active runs.' },
    unlockHint: { de: 'Schließe Manual Garden ab.', en: 'Complete Manual Garden.' },
    score: 10,
  },
  {
    id: 'theme_silent_greenhouse',
    kind: 'theme',
    order: 30,
    displayName: { de: 'Silent Theme', en: 'Silent Theme' },
    description: { de: 'Ruhiger Akzent für lange Sessions.', en: 'A calmer accent for long sessions.' },
    unlockHint: { de: 'Schließe Silent Greenhouse ab.', en: 'Complete Silent Greenhouse.' },
    score: 10,
  },
  {
    id: 'frame_budget_run',
    kind: 'frame',
    order: 40,
    displayName: { de: 'Budget Frame', en: 'Budget Frame' },
    description: { de: 'Rahmen für sparsame Builds.', en: 'A frame for frugal builds.' },
    unlockHint: { de: 'Schließe Budget Run ab.', en: 'Complete Budget Run.' },
    score: 10,
  },
  {
    id: 'badge_risk_market',
    kind: 'badge',
    order: 50,
    displayName: { de: 'Risk Market Badge', en: 'Risk Market Badge' },
    description: { de: 'Für kalkulierte Event-Risiken.', en: 'For calculated event risks.' },
    unlockHint: { de: 'Schließe Risk Market ab.', en: 'Complete Risk Market.' },
    score: 10,
  },
  {
    id: 'skin_tiny_pot',
    kind: 'plantSkin',
    order: 60,
    displayName: { de: 'Tiny Pot Skin', en: 'Tiny Pot Skin' },
    description: { de: 'Kompakt, aber nicht klein gedacht.', en: 'Compact, but not small-minded.' },
    unlockHint: { de: 'Schließe Tiny Pot ab.', en: 'Complete Tiny Pot.' },
    score: 12,
  },
  {
    id: 'frame_quiet_grower',
    kind: 'frame',
    order: 70,
    displayName: { de: 'Quiet Grower Frame', en: 'Quiet Grower Frame' },
    description: { de: 'Für starke Rückkehrmomente.', en: 'For strong return moments.' },
    unlockHint: { de: 'Schließe Quiet Grow ab.', en: 'Complete Quiet Grow.' },
    score: 8,
  },
  {
    id: 'badge_root_signal',
    kind: 'badge',
    order: 80,
    displayName: { de: 'Root Signal Badge', en: 'Root Signal Badge' },
    description: { de: 'Prestige als System verstanden.', en: 'Prestige understood as a system.' },
    unlockHint: { de: 'Schließe Prestige-Signal ab.', en: 'Complete Prestige Signal.' },
    score: 8,
  },
];

export const collectionById = new Map<CollectionId, CollectionDefinition>(
  collections.map((entry) => [entry.id, entry]),
);
