import type { LocaleKey } from '../app/i18n';

export const roomIds = [
  'starter_corner',
  'hydro_bay',
  'climate_room',
  'genetics_lab_wing',
  'automation_garage',
  'event_observatory',
] as const;

export type RoomId = (typeof roomIds)[number];

export type RoomEffect =
  | { type: 'globalMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
  | { type: 'costMultiplier'; value: number }
  | { type: 'offlineCapHours'; value: number }
  | { type: 'eventRewardMultiplier'; value: number }
  | { type: 'eventDurationMultiplier'; value: number }
  | { type: 'eventSpawnRateMultiplier'; value: number }
  | { type: 'researchCostMultiplier'; value: number }
  | { type: 'strainXpMultiplier'; value: number }
  | { type: 'autoClickRate'; value: number }
  | { type: 'automationBpsShare'; value: number };

export interface RoomCost {
  buds?: number;
  ascensionSeeds?: number;
  achievementScore?: number;
  contractTokens?: number;
}

export interface RoomLevelDefinition {
  level: 1 | 2 | 3 | 4 | 5;
  cost: RoomCost;
  effectSummary: Record<LocaleKey, string>;
  effects: readonly RoomEffect[];
}

export interface RoomDefinition {
  id: RoomId;
  order: number;
  displayName: Record<LocaleKey, string>;
  role: Record<LocaleKey, string>;
  flavor: Record<LocaleKey, string>;
  unlockHint: Record<LocaleKey, string>;
  levels: readonly RoomLevelDefinition[];
}

export const rooms: readonly RoomDefinition[] = [
  {
    id: 'starter_corner',
    order: 10,
    displayName: { de: 'Starter Corner', en: 'Starter Corner' },
    role: {
      de: 'Frühe Klicks und erste Shop-Schritte bleiben schneller relevant.',
      en: 'Early clicks and first shop steps stay relevant for longer.',
    },
    flavor: {
      de: 'Eine kleine Ecke, die jeden neuen Run weniger roh wirken lässt.',
      en: 'A compact corner that makes every new run feel less raw.',
    },
    unlockHint: { de: 'Ernte 25.000 Lifetime-Buds.', en: 'Harvest 25,000 lifetime buds.' },
    levels: [
      {
        level: 1,
        cost: { buds: 25_000 },
        effectSummary: { de: '+8 % BPC', en: '+8% BPC' },
        effects: [{ type: 'clickMultiplier', value: 1.08 }],
      },
      {
        level: 2,
        cost: { buds: 150_000, achievementScore: 25 },
        effectSummary: { de: '+6 % globale Produktion', en: '+6% global production' },
        effects: [{ type: 'globalMultiplier', value: 1.06 }],
      },
      {
        level: 3,
        cost: { buds: 800_000, ascensionSeeds: 1 },
        effectSummary: { de: '-2 % Shop-Kosten', en: '-2% shop costs' },
        effects: [{ type: 'costMultiplier', value: 0.98 }],
      },
      {
        level: 4,
        cost: { buds: 3_500_000, ascensionSeeds: 2, achievementScore: 90 },
        effectSummary: { de: '+12 % BPC', en: '+12% BPC' },
        effects: [{ type: 'clickMultiplier', value: 1.12 }],
      },
      {
        level: 5,
        cost: { buds: 12_000_000, ascensionSeeds: 4, achievementScore: 160, contractTokens: 2 },
        effectSummary: { de: '+10 % global, +0,15 Auto-Klicks/s', en: '+10% global, +0.15 auto-clicks/s' },
        effects: [
          { type: 'globalMultiplier', value: 1.1 },
          { type: 'autoClickRate', value: 0.15 },
        ],
      },
    ],
  },
  {
    id: 'hydro_bay',
    order: 20,
    displayName: { de: 'Hydro Bay', en: 'Hydro Bay' },
    role: {
      de: 'Idle- und Infrastruktur-Builds bekommen spürbare Skalierung.',
      en: 'Idle and infrastructure builds gain clearer scaling.',
    },
    flavor: {
      de: 'Alles fließt kontrollierter. Auch die Zahlen.',
      en: 'Everything flows more cleanly. The numbers included.',
    },
    unlockHint: { de: 'Erreiche 1 Mio Lifetime-Buds.', en: 'Reach 1M lifetime buds.' },
    levels: [
      {
        level: 1,
        cost: { buds: 1_000_000 },
        effectSummary: { de: '+8 % BPS', en: '+8% BPS' },
        effects: [{ type: 'globalMultiplier', value: 1.08 }],
      },
      {
        level: 2,
        cost: { buds: 4_000_000, achievementScore: 60 },
        effectSummary: { de: '+2h Offline-Cap', en: '+2h offline cap' },
        effects: [{ type: 'offlineCapHours', value: 2 }],
      },
      {
        level: 3,
        cost: { buds: 15_000_000, ascensionSeeds: 2 },
        effectSummary: { de: '+10 % BPS', en: '+10% BPS' },
        effects: [{ type: 'globalMultiplier', value: 1.1 }],
      },
      {
        level: 4,
        cost: { buds: 45_000_000, ascensionSeeds: 4, achievementScore: 140 },
        effectSummary: { de: '-3 % Shop-Kosten', en: '-3% shop costs' },
        effects: [{ type: 'costMultiplier', value: 0.97 }],
      },
      {
        level: 5,
        cost: { buds: 150_000_000, ascensionSeeds: 7, achievementScore: 240, contractTokens: 4 },
        effectSummary: { de: '+14 % BPS, +3h Offline-Cap', en: '+14% BPS, +3h offline cap' },
        effects: [
          { type: 'globalMultiplier', value: 1.14 },
          { type: 'offlineCapHours', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'climate_room',
    order: 30,
    displayName: { de: 'Climate Room', en: 'Climate Room' },
    role: {
      de: 'Buffs, Events und ruhige Idle-Phasen werden planbarer.',
      en: 'Buffs, events and calmer idle phases become more predictable.',
    },
    flavor: {
      de: 'Weniger Chaos, mehr kontrollierte Spitzen.',
      en: 'Less chaos, more controlled peaks.',
    },
    unlockHint: { de: 'Klicke 10 Events.', en: 'Click 10 events.' },
    levels: [
      {
        level: 1,
        cost: { buds: 1_500_000 },
        effectSummary: { de: '+8 % Eventdauer', en: '+8% event duration' },
        effects: [{ type: 'eventDurationMultiplier', value: 1.08 }],
      },
      {
        level: 2,
        cost: { buds: 6_500_000, achievementScore: 75 },
        effectSummary: { de: '+7 % Event-Rewards', en: '+7% event rewards' },
        effects: [{ type: 'eventRewardMultiplier', value: 1.07 }],
      },
      {
        level: 3,
        cost: { buds: 22_000_000, ascensionSeeds: 3 },
        effectSummary: { de: '+5 % Event-Taktung', en: '+5% event cadence' },
        effects: [{ type: 'eventSpawnRateMultiplier', value: 1.05 }],
      },
      {
        level: 4,
        cost: { buds: 80_000_000, ascensionSeeds: 5, achievementScore: 160 },
        effectSummary: { de: '+10 % Event-Rewards', en: '+10% event rewards' },
        effects: [{ type: 'eventRewardMultiplier', value: 1.1 }],
      },
      {
        level: 5,
        cost: { buds: 240_000_000, ascensionSeeds: 8, achievementScore: 260, contractTokens: 5 },
        effectSummary: { de: '+10 % Dauer, +10 % Rewards', en: '+10% duration, +10% rewards' },
        effects: [
          { type: 'eventDurationMultiplier', value: 1.1 },
          { type: 'eventRewardMultiplier', value: 1.1 },
        ],
      },
    ],
  },
  {
    id: 'genetics_lab_wing',
    order: 40,
    displayName: { de: 'Genetics Lab Wing', en: 'Genetics Lab Wing' },
    role: {
      de: 'Research, Seeds und Strain-Mastery werden zu einer echten Build-Achse.',
      en: 'Research, seeds and strain mastery become a real build axis.',
    },
    flavor: {
      de: 'Nicht realistischer, nur besser lesbar als System.',
      en: 'Not more realistic, just clearer as a system.',
    },
    unlockHint: { de: 'Kaufe 8 Research-Knoten.', en: 'Buy 8 research nodes.' },
    levels: [
      {
        level: 1,
        cost: { buds: 2_500_000 },
        effectSummary: { de: '-4 % Seed-Research-Kosten', en: '-4% seed research costs' },
        effects: [{ type: 'researchCostMultiplier', value: 0.96 }],
      },
      {
        level: 2,
        cost: { buds: 9_000_000, achievementScore: 90 },
        effectSummary: { de: '+15 % Strain-XP', en: '+15% strain XP' },
        effects: [{ type: 'strainXpMultiplier', value: 1.15 }],
      },
      {
        level: 3,
        cost: { buds: 35_000_000, ascensionSeeds: 4 },
        effectSummary: { de: '+8 % global', en: '+8% global' },
        effects: [{ type: 'globalMultiplier', value: 1.08 }],
      },
      {
        level: 4,
        cost: { buds: 120_000_000, ascensionSeeds: 6, achievementScore: 180 },
        effectSummary: { de: '-5 % Seed-Research-Kosten', en: '-5% seed research costs' },
        effects: [{ type: 'researchCostMultiplier', value: 0.95 }],
      },
      {
        level: 5,
        cost: { buds: 360_000_000, ascensionSeeds: 10, achievementScore: 300, contractTokens: 6 },
        effectSummary: { de: '+25 % Strain-XP, +10 % global', en: '+25% strain XP, +10% global' },
        effects: [
          { type: 'strainXpMultiplier', value: 1.25 },
          { type: 'globalMultiplier', value: 1.1 },
        ],
      },
    ],
  },
  {
    id: 'automation_garage',
    order: 50,
    displayName: { de: 'Automation Garage', en: 'Automation Garage' },
    role: {
      de: 'Automation wird Progression, nicht Startzustand.',
      en: 'Automation becomes progression, not the default state.',
    },
    flavor: {
      de: 'Die Maschine hilft. Sie spielt nicht für dich.',
      en: 'The machine helps. It does not play for you.',
    },
    unlockHint: { de: 'Nutze Fähigkeiten 25-mal.', en: 'Use abilities 25 times.' },
    levels: [
      {
        level: 1,
        cost: { buds: 3_000_000 },
        effectSummary: { de: '+0,25 Auto-Klicks/s', en: '+0.25 auto-clicks/s' },
        effects: [{ type: 'autoClickRate', value: 0.25 }],
      },
      {
        level: 2,
        cost: { buds: 12_000_000, achievementScore: 100 },
        effectSummary: { de: '+3 % BPS als Automation', en: '+3% BPS as automation' },
        effects: [{ type: 'automationBpsShare', value: 0.03 }],
      },
      {
        level: 3,
        cost: { buds: 42_000_000, ascensionSeeds: 4 },
        effectSummary: { de: '+0,5 Auto-Klicks/s', en: '+0.5 auto-clicks/s' },
        effects: [{ type: 'autoClickRate', value: 0.5 }],
      },
      {
        level: 4,
        cost: { buds: 140_000_000, ascensionSeeds: 7, achievementScore: 200 },
        effectSummary: { de: '+4 % BPS als Automation', en: '+4% BPS as automation' },
        effects: [{ type: 'automationBpsShare', value: 0.04 }],
      },
      {
        level: 5,
        cost: { buds: 420_000_000, ascensionSeeds: 11, achievementScore: 330, contractTokens: 7 },
        effectSummary: { de: '+1 Auto-Klick/s, +5 % BPS als Automation', en: '+1 auto-click/s, +5% BPS as automation' },
        effects: [
          { type: 'autoClickRate', value: 1 },
          { type: 'automationBpsShare', value: 0.05 },
        ],
      },
    ],
  },
  {
    id: 'event_observatory',
    order: 60,
    displayName: { de: 'Event Observatory', en: 'Event Observatory' },
    role: {
      de: 'Season- und Event-Mastery-Spieler bekommen langfristige Ziele.',
      en: 'Season and event mastery players get long-term goals.',
    },
    flavor: {
      de: 'Ein Fenster für alles, was kurz auftaucht und lange zählt.',
      en: 'A window for everything that appears briefly and matters for longer.',
    },
    unlockHint: { de: 'Klicke 35 Events oder erreiche Prestige 2.', en: 'Click 35 events or reach prestige 2.' },
    levels: [
      {
        level: 1,
        cost: { buds: 5_000_000 },
        effectSummary: { de: '+8 % Event-Rewards', en: '+8% event rewards' },
        effects: [{ type: 'eventRewardMultiplier', value: 1.08 }],
      },
      {
        level: 2,
        cost: { buds: 18_000_000, achievementScore: 120 },
        effectSummary: { de: '+6 % Event-Taktung', en: '+6% event cadence' },
        effects: [{ type: 'eventSpawnRateMultiplier', value: 1.06 }],
      },
      {
        level: 3,
        cost: { buds: 65_000_000, ascensionSeeds: 5 },
        effectSummary: { de: '+12 % Eventdauer', en: '+12% event duration' },
        effects: [{ type: 'eventDurationMultiplier', value: 1.12 }],
      },
      {
        level: 4,
        cost: { buds: 180_000_000, ascensionSeeds: 8, achievementScore: 240 },
        effectSummary: { de: '+12 % Event-Rewards', en: '+12% event rewards' },
        effects: [{ type: 'eventRewardMultiplier', value: 1.12 }],
      },
      {
        level: 5,
        cost: { buds: 520_000_000, ascensionSeeds: 12, achievementScore: 360, contractTokens: 8 },
        effectSummary: { de: '+8 % Taktung, +8 % Dauer', en: '+8% cadence, +8% duration' },
        effects: [
          { type: 'eventSpawnRateMultiplier', value: 1.08 },
          { type: 'eventDurationMultiplier', value: 1.08 },
        ],
      },
    ],
  },
];

export const roomById = new Map<RoomId, RoomDefinition>(rooms.map((room) => [room.id, room]));
