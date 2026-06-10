import type { LocaleKey } from '../app/i18n';

export const strainIds = [
  'sativa_spark',
  'indica_canopy',
  'hybrid_bloom',
  'ruderalis_loop',
  'deep_root',
] as const;

export type StrainId = (typeof strainIds)[number];

export type StrainArchetype = 'active' | 'idle' | 'hybrid' | 'automation' | 'prestige';

export type StrainEffect =
  | { type: 'clickMultiplier'; values: readonly [number, number, number] }
  | { type: 'globalMultiplier'; values: readonly [number, number, number] }
  | { type: 'eventRewardMultiplier'; values: readonly [number, number, number] }
  | { type: 'eventDurationMultiplier'; values: readonly [number, number, number] }
  | { type: 'offlineCapHours'; values: readonly [number, number, number] }
  | { type: 'autoClickRate'; values: readonly [number, number, number] }
  | { type: 'automationBpsShare'; values: readonly [number, number, number] }
  | { type: 'prestigeSeedMultiplier'; values: readonly [number, number, number] }
  | { type: 'strainXpMultiplier'; values: readonly [number, number, number] };

export interface StrainDefinition {
  id: StrainId;
  order: number;
  archetype: StrainArchetype;
  displayName: Record<LocaleKey, string>;
  role: Record<LocaleKey, string>;
  flavor: Record<LocaleKey, string>;
  unlockHint: Record<LocaleKey, string>;
  xpThresholds: readonly [number, number, number];
  effects: readonly StrainEffect[];
}

export const strains: readonly StrainDefinition[] = [
  {
    id: 'sativa_spark',
    order: 10,
    archetype: 'active',
    displayName: { de: 'Sativa Spark', en: 'Sativa Spark' },
    role: { de: 'Aktive Klicks, BPC und Event-Rewards.', en: 'Manual clicks, BPC and event rewards.' },
    flavor: { de: 'Für Runs, in denen du wirklich am Gewächshaus sitzt.', en: 'For runs where you are truly at the greenhouse.' },
    unlockHint: { de: 'Von Anfang an verfügbar.', en: 'Available from the start.' },
    xpThresholds: [100, 500, 1_500],
    effects: [
      { type: 'clickMultiplier', values: [1.18, 1.28, 1.4] },
      { type: 'eventRewardMultiplier', values: [1.03, 1.06, 1.1] },
    ],
  },
  {
    id: 'indica_canopy',
    order: 20,
    archetype: 'idle',
    displayName: { de: 'Indica Canopy', en: 'Indica Canopy' },
    role: { de: 'Idle-BPS, Offline-Cap und ruhige Runs.', en: 'Idle BPS, offline cap and calmer runs.' },
    flavor: { de: 'Langsam wirkt hier nicht schwach, sondern stabil.', en: 'Slow does not mean weak here; it means stable.' },
    unlockHint: { de: 'Erreiche 1 BPS.', en: 'Reach 1 BPS.' },
    xpThresholds: [120, 600, 1_700],
    effects: [
      { type: 'globalMultiplier', values: [1.12, 1.2, 1.3] },
      { type: 'offlineCapHours', values: [1, 3, 5] },
    ],
  },
  {
    id: 'hybrid_bloom',
    order: 30,
    archetype: 'hybrid',
    displayName: { de: 'Hybrid Bloom', en: 'Hybrid Bloom' },
    role: { de: 'Buff-Dauer, Event-Fenster und flexible Builds.', en: 'Buff duration, event windows and flexible builds.' },
    flavor: { de: 'Nicht kompromisslos, sondern absichtlich vielseitig.', en: 'Not compromised; intentionally versatile.' },
    unlockHint: { de: 'Klicke 3 Events.', en: 'Click 3 events.' },
    xpThresholds: [140, 700, 2_000],
    effects: [
      { type: 'eventDurationMultiplier', values: [1.08, 1.15, 1.24] },
      { type: 'eventRewardMultiplier', values: [1.04, 1.08, 1.12] },
    ],
  },
  {
    id: 'ruderalis_loop',
    order: 40,
    archetype: 'automation',
    displayName: { de: 'Ruderalis Loop', en: 'Ruderalis Loop' },
    role: { de: 'Kurze Runs, Auto-Klicks und Automationsanteil.', en: 'Short runs, auto-clicks and automation share.' },
    flavor: { de: 'Klein, stur, effizient.', en: 'Small, stubborn, efficient.' },
    unlockHint: { de: 'Nutze Fähigkeiten 10-mal.', en: 'Use abilities 10 times.' },
    xpThresholds: [160, 800, 2_200],
    effects: [
      { type: 'autoClickRate', values: [0.25, 0.5, 0.9] },
      { type: 'automationBpsShare', values: [0.02, 0.04, 0.06] },
    ],
  },
  {
    id: 'deep_root',
    order: 50,
    archetype: 'prestige',
    displayName: { de: 'Deep Root', en: 'Deep Root' },
    role: { de: 'Lange Runs, Ascension-Ertrag und Strain-XP.', en: 'Long runs, ascension yield and strain XP.' },
    flavor: { de: 'Wächst nicht schnell. Zählt dafür länger.', en: 'It does not grow fast. It matters longer.' },
    unlockHint: { de: 'Führe ein Prestige durch.', en: 'Perform one prestige.' },
    xpThresholds: [180, 900, 2_500],
    effects: [
      { type: 'prestigeSeedMultiplier', values: [1.05, 1.1, 1.18] },
      { type: 'strainXpMultiplier', values: [1.1, 1.2, 1.35] },
    ],
  },
];

export const strainById = new Map<StrainId, StrainDefinition>(
  strains.map((strain) => [strain.id, strain]),
);
