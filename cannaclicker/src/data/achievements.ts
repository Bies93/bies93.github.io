import { uiIcons } from '../app/assetManifest';
import type { LocaleKey } from '../app/i18n';
import type { AbilityId } from './abilities';
import { items, type ItemId } from './items';
import type { EventId } from '../app/events';

export type AchievementId = string;

export type AchievementCategory =
  | 'harvest'
  | 'economy'
  | 'clicking'
  | 'items'
  | 'upgrades'
  | 'research'
  | 'events'
  | 'seeds'
  | 'prestige'
  | 'offline'
  | 'abilities'
  | 'hidden';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementRequirement {
  totalBuds?: number;
  currentBuds?: number;
  bps?: number;
  bpc?: number;
  manualClicks?: number;
  totalItemsOwned?: number;
  itemsOwned?: Partial<Record<ItemId, number>>;
  upgradeCount?: number;
  researchCount?: number;
  eventClicks?: number;
  eventTypeClicks?: Partial<Record<EventId, number>>;
  currentSeeds?: number;
  seedsEarned?: number;
  seedsSpent?: number;
  prestigeCount?: number;
  offlineBuds?: number;
  offlineReturns?: number;
  abilityUses?: number;
  abilityUse?: Partial<Record<AbilityId, number>>;
  activeBuffCount?: number;
  allItemsUnlocked?: boolean;
}

export interface AchievementDefinition {
  id: AchievementId;
  category: AchievementCategory;
  rarity: AchievementRarity;
  hidden?: boolean;
  overlayIcon: string;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  flavor: Record<LocaleKey, string>;
  requirement: AchievementRequirement;
  rewardMultiplier?: number;
  order: number;
}

interface ThresholdSpec {
  value: number;
  name: Record<LocaleKey, string>;
  flavor: Record<LocaleKey, string>;
  rarity?: AchievementRarity;
  rewardMultiplier?: number;
}

const budThresholds: ThresholdSpec[] = [
  {
    value: 100,
    name: { de: 'Erste Handvoll', en: 'First Handful' },
    flavor: {
      de: 'Der Zähler bewegt sich. Das reicht als Anfang.',
      en: 'The counter moves. That is enough for a start.',
    },
  },
  {
    value: 1_000,
    name: { de: 'Kleiner Vorrat', en: 'Small Stash' },
    flavor: {
      de: 'Genug, um echte Entscheidungen zu sehen.',
      en: 'Enough to start seeing real decisions.',
    },
  },
  {
    value: 10_000,
    name: { de: 'Grüner Stapel', en: 'Green Stack' },
    flavor: {
      de: 'Aus Klicks wird ein kleiner Betrieb.',
      en: 'Clicks turn into a small operation.',
    },
    rewardMultiplier: 1.002,
  },
  {
    value: 100_000,
    name: { de: 'Sechsstellig', en: 'Six Figures' },
    flavor: {
      de: 'Die Zahlen wirken nicht mehr zufällig.',
      en: 'The numbers no longer look accidental.',
    },
    rewardMultiplier: 1.003,
  },
  {
    value: 1_000_000,
    name: { de: 'Millionenmarke', en: 'Million Mark' },
    flavor: {
      de: 'Der erste große Run nimmt Form an.',
      en: 'The first big run takes shape.',
    },
    rarity: 'rare',
    rewardMultiplier: 1.005,
  },
  {
    value: 3_000_000,
    name: { de: 'Prestige-Schwelle', en: 'Prestige Threshold' },
    flavor: {
      de: 'Der erste echte Neustart ruft leise.',
      en: 'The first real reset calls quietly.',
    },
    rarity: 'rare',
    rewardMultiplier: 1.005,
  },
  {
    value: 10_000_000,
    name: { de: 'Acht Stellen Grün', en: 'Eight Green Digits' },
    flavor: {
      de: 'Jetzt zählt Planung mehr als Tippen.',
      en: 'Planning matters more than tapping now.',
    },
    rarity: 'rare',
    rewardMultiplier: 1.006,
  },
  {
    value: 100_000_000,
    name: { de: 'Kontrollierter Rausch', en: 'Controlled Rush' },
    flavor: {
      de: 'Die Kurve trägt, aber sie explodiert nicht.',
      en: 'The curve carries without exploding.',
    },
    rarity: 'epic',
    rewardMultiplier: 1.008,
  },
  {
    value: 1_000_000_000,
    name: { de: 'Milliarden-Canopy', en: 'Billion Canopy' },
    flavor: { de: 'Ein Dach aus Zahlen.', en: 'A canopy made of numbers.' },
    rarity: 'epic',
    rewardMultiplier: 1.01,
  },
  {
    value: 10_000_000_000,
    name: { de: 'Makro-Garten', en: 'Macro Garden' },
    flavor: { de: 'Jede Entscheidung hat Nachhall.', en: 'Every decision leaves an echo.' },
    rarity: 'epic',
    rewardMultiplier: 1.012,
  },
  {
    value: 1_000_000_000_000,
    name: { de: 'Terra-Trim', en: 'Terra Trim' },
    flavor: {
      de: 'Die Pflanze ist klein. Die Tabelle nicht.',
      en: 'The plant is small. The table is not.',
    },
    rarity: 'legendary',
    rewardMultiplier: 1.015,
  },
];

const eventLabels: Record<EventId, Record<LocaleKey, string>> = {
  golden_bud: { de: 'Golden Bud', en: 'Golden Bud' },
  seed_pack: { de: 'Seed Pack', en: 'Seed Pack' },
  lucky_joint: { de: 'Lucky Joint', en: 'Lucky Joint' },
  fertile_rain: { de: 'Fertiler Regen', en: 'Fertile Rain' },
  market_rush: { de: 'Market Rush', en: 'Market Rush' },
  green_surge: { de: 'Green Surge', en: 'Green Surge' },
  mutant_sprout: { de: 'Mutant Sprout', en: 'Mutant Sprout' },
  supply_drop: { de: 'Supply Drop', en: 'Supply Drop' },
  flash_harvest: { de: 'Flash Harvest', en: 'Flash Harvest' },
  calm_growth: { de: 'Calm Growth', en: 'Calm Growth' },
  overgrowth: { de: 'Overgrowth', en: 'Overgrowth' },
  seed_bloom: { de: 'Seed Bloom', en: 'Seed Bloom' },
};

const abilityLabels: Record<AbilityId, Record<LocaleKey, string>> = {
  overdrive: { de: 'Overdrive', en: 'Overdrive' },
  burst: { de: 'Burst Click', en: 'Burst Click' },
  auto_burst: { de: 'Auto Burst', en: 'Auto Burst' },
  discount_window: { de: 'Discount Window', en: 'Discount Window' },
};

function makeAchievement(
  definition: Omit<AchievementDefinition, 'rarity' | 'overlayIcon'> & {
    rarity?: AchievementRarity;
    overlayIcon?: string;
  },
): AchievementDefinition {
  return {
    rarity: definition.rarity ?? 'common',
    overlayIcon: definition.overlayIcon ?? uiIcons.achievementLeaf,
    ...definition,
  };
}

function createBudAchievements(): AchievementDefinition[] {
  return budThresholds.map((entry, index) =>
    makeAchievement({
      id: `total_buds_${entry.value}`,
      category: 'harvest',
      rarity: entry.rarity,
      overlayIcon: uiIcons.achievementLight,
      name: entry.name,
      description: {
        de: `Ernte insgesamt ${entry.value.toLocaleString('de-DE')} Buds.`,
        en: `Harvest ${entry.value.toLocaleString('en-US')} total buds.`,
      },
      flavor: entry.flavor,
      requirement: { totalBuds: entry.value },
      rewardMultiplier: entry.rewardMultiplier,
      order: 100 + index,
    }),
  );
}

function createSimpleThresholdAchievements(
  prefix: string,
  category: AchievementCategory,
  label: Record<LocaleKey, string>,
  requirementKey: keyof AchievementRequirement,
  icon: string,
  values: readonly number[],
  orderBase: number,
): AchievementDefinition[] {
  return values.map((value, index) =>
    makeAchievement({
      id: `${prefix}_${value}`,
      category,
      rarity: index >= values.length - 1 ? 'rare' : 'common',
      overlayIcon: icon,
      name: {
        de: `${label.de} ${index + 1}`,
        en: `${label.en} ${index + 1}`,
      },
      description: {
        de: `Erreiche ${value.toLocaleString('de-DE')} ${label.de}.`,
        en: `Reach ${value.toLocaleString('en-US')} ${label.en}.`,
      },
      flavor: {
        de: 'Ein sauberer Marker auf der Kurve.',
        en: 'A clean marker on the curve.',
      },
      requirement: { [requirementKey]: value },
      rewardMultiplier: index >= values.length - 2 ? 1.003 : undefined,
      order: orderBase + index,
    }),
  );
}

function createItemAchievements(): AchievementDefinition[] {
  const thresholds = [10, 50, 150] as const;
  return items.flatMap((item, itemIndex) =>
    thresholds.map((value, thresholdIndex) =>
      makeAchievement({
        id: `item_${item.id}_${value}`,
        category: 'items',
        rarity: thresholdIndex === 2 ? 'rare' : 'common',
        overlayIcon: item.icon,
        name: {
          de: `${item.name.de} ${value}`,
          en: `${item.name.en} ${value}`,
        },
        description: {
          de: `Besitze ${value}× ${item.name.de}.`,
          en: `Own ${value}× ${item.name.en}.`,
        },
        flavor: {
          de: item.role.de,
          en: item.role.en,
        },
        requirement: { itemsOwned: { [item.id]: value } },
        rewardMultiplier: thresholdIndex === 2 ? 1.003 : undefined,
        order: 700 + itemIndex * 10 + thresholdIndex,
      }),
    ),
  );
}

function createEventTypeAchievements(): AchievementDefinition[] {
  return (Object.entries(eventLabels) as [EventId, Record<LocaleKey, string>][]).map(
    ([id, label], index) =>
      makeAchievement({
        id: `event_${id}_5`,
        category: 'events',
        rarity: index >= 8 ? 'rare' : 'common',
        overlayIcon: uiIcons.achievementLight,
        name: {
          de: `${label.de} gesehen`,
          en: `${label.en} Spotted`,
        },
        description: {
          de: `Klicke ${label.de} 5-mal.`,
          en: `Click ${label.en} 5 times.`,
        },
        flavor: {
          de: 'Kurz auftauchen, klar belohnen.',
          en: 'Appear briefly, reward clearly.',
        },
        requirement: { eventTypeClicks: { [id]: 5 } },
        rewardMultiplier: index >= 8 ? 1.002 : undefined,
        order: 1300 + index,
      }),
  );
}

function createAbilityAchievements(): AchievementDefinition[] {
  const specific = (Object.entries(abilityLabels) as [AbilityId, Record<LocaleKey, string>][]).map(
    ([id, label], index) =>
      makeAchievement({
        id: `ability_${id}_10`,
        category: 'abilities',
        rarity: index >= 2 ? 'rare' : 'common',
        overlayIcon: uiIcons.auto,
        name: {
          de: `${label.de} Routine`,
          en: `${label.en} Routine`,
        },
        description: {
          de: `Nutze ${label.de} 10-mal.`,
          en: `Use ${label.en} 10 times.`,
        },
        flavor: {
          de: 'Ein guter Button wartet nicht ewig.',
          en: 'A good button should not wait forever.',
        },
        requirement: { abilityUse: { [id]: 10 } },
        order: 1700 + index,
      }),
  );

  return [
    ...createSimpleThresholdAchievements(
      'ability_uses',
      'abilities',
      { de: 'Ability-Nutzungen', en: 'ability uses' },
      'abilityUses',
      uiIcons.auto,
      [5, 25],
      1650,
    ),
    ...specific,
  ];
}

const manualAchievements: AchievementDefinition[] = [
  ...createBudAchievements(),
  ...createSimpleThresholdAchievements(
    'held_buds',
    'economy',
    { de: 'Buds im Vorrat', en: 'buds held' },
    'currentBuds',
    uiIcons.total,
    [2_500, 25_000, 250_000],
    220,
  ),
  ...createSimpleThresholdAchievements(
    'bps',
    'economy',
    { de: 'BPS', en: 'BPS' },
    'bps',
    uiIcons.bps,
    [1, 10, 100, 1_000, 10_000],
    300,
  ),
  ...createSimpleThresholdAchievements(
    'bpc',
    'clicking',
    { de: 'BPC', en: 'BPC' },
    'bpc',
    uiIcons.bpc,
    [2, 5, 10, 25, 100],
    400,
  ),
  ...createSimpleThresholdAchievements(
    'manual_clicks',
    'clicking',
    { de: 'manuelle Klicks', en: 'manual clicks' },
    'manualClicks',
    uiIcons.achievementLeaf,
    [10, 100, 500, 1_500, 5_000],
    500,
  ),
  ...createSimpleThresholdAchievements(
    'total_items',
    'items',
    { de: 'Gebäude gesamt', en: 'total buildings' },
    'totalItemsOwned',
    uiIcons.shop,
    [10, 50, 150, 350, 750],
    620,
  ),
  ...createItemAchievements(),
  ...createSimpleThresholdAchievements(
    'upgrade_count',
    'upgrades',
    { de: 'Upgrades', en: 'upgrades' },
    'upgradeCount',
    uiIcons.upgrade,
    [1, 5, 15, 35],
    1050,
  ),
  ...createSimpleThresholdAchievements(
    'research_count',
    'research',
    { de: 'Research-Knoten', en: 'research nodes' },
    'researchCount',
    uiIcons.research,
    [1, 5, 12, 24],
    1150,
  ),
  ...createSimpleThresholdAchievements(
    'event_clicks',
    'events',
    { de: 'Events geklickt', en: 'events clicked' },
    'eventClicks',
    uiIcons.achievementLight,
    [1, 10, 50, 150],
    1250,
  ),
  ...createEventTypeAchievements(),
  ...createSimpleThresholdAchievements(
    'seeds_earned',
    'seeds',
    { de: 'Seeds verdient', en: 'seeds earned' },
    'seedsEarned',
    uiIcons.seeds,
    [1, 5, 25, 100],
    1450,
  ),
  ...createSimpleThresholdAchievements(
    'seeds_spent',
    'seeds',
    { de: 'Seeds investiert', en: 'seeds invested' },
    'seedsSpent',
    uiIcons.seeds,
    [1, 10, 50],
    1500,
  ),
  ...createSimpleThresholdAchievements(
    'prestige_count',
    'prestige',
    { de: 'Prestiges', en: 'prestiges' },
    'prestigeCount',
    uiIcons.prestige,
    [1, 2, 5, 10],
    1550,
  ),
  ...createSimpleThresholdAchievements(
    'offline_buds',
    'offline',
    { de: 'Offline-Buds', en: 'offline buds' },
    'offlineBuds',
    uiIcons.total,
    [1_000, 100_000],
    1600,
  ),
  ...createAbilityAchievements(),
  makeAchievement({
    id: 'all_items_visible',
    category: 'items',
    rarity: 'epic',
    overlayIcon: uiIcons.shop,
    name: { de: 'Kompletter Katalog', en: 'Full Catalogue' },
    description: {
      de: 'Schalte alle Shop-Items sichtbar frei.',
      en: 'Make every shop item visible.',
    },
    flavor: { de: 'Jetzt beginnt die Optimierung.', en: 'Now optimisation begins.' },
    requirement: { allItemsUnlocked: true },
    rewardMultiplier: 1.006,
    order: 1900,
  }),
  makeAchievement({
    id: 'buff_stack_3',
    category: 'abilities',
    rarity: 'rare',
    overlayIcon: uiIcons.auto,
    name: { de: 'Drei Lichter', en: 'Three Lights' },
    description: { de: 'Habe 3 aktive Buffs gleichzeitig.', en: 'Have 3 active buffs at once.' },
    flavor: { de: 'Kurz, hell, kontrolliert.', en: 'Brief, bright, controlled.' },
    requirement: { activeBuffCount: 3 },
    order: 1910,
  }),
  makeAchievement({
    id: 'hidden_empty_wallet',
    category: 'hidden',
    rarity: 'rare',
    hidden: true,
    overlayIcon: uiIcons.warning,
    name: { de: 'Sauber investiert', en: 'Cleanly Invested' },
    description: {
      de: 'Gib mindestens 10 Seeds aus und halte danach 0 Seeds.',
      en: 'Spend at least 10 seeds and hold exactly 0 seeds.',
    },
    flavor: { de: 'Kein Rest, kein Bedauern.', en: 'No remainder, no regret.' },
    requirement: { seedsSpent: 10, currentSeeds: 0 },
    order: 2000,
  }),
  makeAchievement({
    id: 'hidden_patient_garden',
    category: 'hidden',
    rarity: 'epic',
    hidden: true,
    overlayIcon: uiIcons.total,
    name: { de: 'Geduldiger Garten', en: 'Patient Garden' },
    description: {
      de: 'Sammle 3 Offline-Rückkehrmomente.',
      en: 'Collect 3 offline return moments.',
    },
    flavor: {
      de: 'Manchmal wächst es besser, wenn man nicht hinsieht.',
      en: 'Sometimes it grows better when you look away.',
    },
    requirement: { offlineReturns: 3 },
    order: 2010,
  }),
  makeAchievement({
    id: 'hidden_event_chaser',
    category: 'hidden',
    rarity: 'epic',
    hidden: true,
    overlayIcon: uiIcons.achievementLight,
    name: { de: 'Event-Jäger', en: 'Event Chaser' },
    description: { de: 'Klicke 150 Events.', en: 'Click 150 events.' },
    flavor: { de: 'Gute Reflexe, bessere Fenster.', en: 'Good reflexes, better windows.' },
    requirement: { eventClicks: 150 },
    rewardMultiplier: 1.005,
    order: 2020,
  }),
  makeAchievement({
    id: 'hidden_second_wind',
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    overlayIcon: uiIcons.prestige,
    name: { de: 'Zweiter Atem', en: 'Second Wind' },
    description: { de: 'Führe 2 Prestiges durch.', en: 'Perform 2 prestiges.' },
    flavor: {
      de: 'Der zweite Lauf kennt die Abkürzungen.',
      en: 'The second run knows the shortcuts.',
    },
    requirement: { prestigeCount: 2 },
    rewardMultiplier: 1.006,
    order: 2030,
  }),
  makeAchievement({
    id: 'hidden_all_buttons',
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    overlayIcon: uiIcons.auto,
    name: { de: 'Alle Hebel', en: 'Every Lever' },
    description: {
      de: 'Nutze jede aktive Fähigkeit mindestens 10-mal.',
      en: 'Use every active ability at least 10 times.',
    },
    flavor: {
      de: 'Ein gutes System hat mehr als eine Antwort.',
      en: 'A good system has more than one answer.',
    },
    requirement: {
      abilityUse: {
        overdrive: 10,
        burst: 10,
        auto_burst: 10,
        discount_window: 10,
      },
    },
    rewardMultiplier: 1.006,
    order: 2040,
  }),
];

export const achievements: readonly AchievementDefinition[] = manualAchievements.sort(
  (a, b) => a.order - b.order,
);

export const achievementById = new Map<AchievementId, AchievementDefinition>(
  achievements.map((entry) => [entry.id, entry]),
);
