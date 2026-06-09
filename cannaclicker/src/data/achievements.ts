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
  | 'builds'
  | 'seasons'
  | 'challenges'
  | 'cosmetics'
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
  achievementScore?: number;
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
  score?: number;
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
  tiny_spark: { de: 'Tiny Spark', en: 'Tiny Spark' },
  dew_drop: { de: 'Dew Drop', en: 'Dew Drop' },
  compost_cache: { de: 'Compost Cache', en: 'Compost Cache' },
  sunbeam: { de: 'Sunbeam', en: 'Sunbeam' },
  mega_bud: { de: 'Mega Bud', en: 'Mega Bud' },
  jackpot_canopy: { de: 'Jackpot Canopy', en: 'Jackpot Canopy' },
  aurora_bloom: { de: 'Aurora Bloom', en: 'Aurora Bloom' },
  trail_marker: { de: 'Trail Marker', en: 'Trail Marker' },
  cascade_bloom: { de: 'Cascade Bloom', en: 'Cascade Bloom' },
  echo_harvest: { de: 'Echo Harvest', en: 'Echo Harvest' },
  volatile_growth: { de: 'Volatile Growth', en: 'Volatile Growth' },
  blackout_sale: { de: 'Blackout Sale', en: 'Blackout Sale' },
  pest_scare: { de: 'Pest Scare', en: 'Pest Scare' },
  solstice_seed: { de: 'Solstice Seed', en: 'Solstice Seed' },
  night_market: { de: 'Night Market', en: 'Night Market' },
  festival_lantern: { de: 'Festival Lantern', en: 'Festival Lantern' },
};

const abilityLabels: Record<AbilityId, Record<LocaleKey, string>> = {
  overdrive: { de: 'Overdrive', en: 'Overdrive' },
  burst: { de: 'Burst Click', en: 'Burst Click' },
  auto_burst: { de: 'Auto Burst', en: 'Auto Burst' },
  discount_window: { de: 'Discount Window', en: 'Discount Window' },
  event_magnet: { de: 'Event-Magnet', en: 'Event Magnet' },
  seed_focus: { de: 'Seed-Fokus', en: 'Seed Focus' },
  harvest_chain: { de: 'Erntekette', en: 'Harvest Chain' },
  cooldown_sync: { de: 'Cooldown-Sync', en: 'Cooldown Sync' },
};

function defaultAchievementScore(rarity: AchievementRarity): number {
  switch (rarity) {
    case 'legendary':
      return 80;
    case 'epic':
      return 35;
    case 'rare':
      return 15;
    default:
      return 5;
  }
}

function makeAchievement(
  definition: Omit<AchievementDefinition, 'rarity' | 'overlayIcon'> & {
    rarity?: AchievementRarity;
    overlayIcon?: string;
  },
): AchievementDefinition {
  const rarity = definition.rarity ?? 'common';
  return {
    rarity,
    overlayIcon: definition.overlayIcon ?? uiIcons.achievementLeaf,
    score: definition.score ?? defaultAchievementScore(rarity),
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

function createMetaAchievements(): AchievementDefinition[] {
  return [
    makeAchievement({
      id: 'build_seedling_swarm',
      category: 'builds',
      rarity: 'rare',
      overlayIcon: uiIcons.shop,
      name: { de: 'Wurzelmasse', en: 'Root Mass' },
      description: {
        de: 'Besitze 150 Seedlings und 50 Planter.',
        en: 'Own 150 Seedlings and 50 Planters.',
      },
      flavor: {
        de: 'Ein starker Run beginnt unten.',
        en: 'A strong run starts at the bottom.',
      },
      requirement: { itemsOwned: { seedling: 150, planter: 50 } },
      rewardMultiplier: 1.003,
      order: 1810,
    }),
    makeAchievement({
      id: 'build_indoor_core',
      category: 'builds',
      rarity: 'rare',
      overlayIcon: uiIcons.shop,
      name: { de: 'Indoor-Kern', en: 'Indoor Core' },
      description: {
        de: 'Besitze 75 Grow Tents und 100 Grow Lights.',
        en: 'Own 75 Grow Tents and 100 Grow Lights.',
      },
      flavor: { de: 'Licht macht aus Raum Tempo.', en: 'Light turns room into tempo.' },
      requirement: { itemsOwned: { grow_tent: 75, grow_light: 100 } },
      rewardMultiplier: 1.003,
      order: 1820,
    }),
    makeAchievement({
      id: 'build_hydro_climate',
      category: 'builds',
      rarity: 'epic',
      overlayIcon: uiIcons.shop,
      name: { de: 'Stabile Schleife', en: 'Stable Loop' },
      description: {
        de: 'Besitze 50 Hydroponic Racks und 25 Climate Controller.',
        en: 'Own 50 Hydroponic Racks and 25 Climate Controllers.',
      },
      flavor: { de: 'Wenn alles ruhig läuft, steigen die Zahlen.', en: 'Calm systems scale.' },
      requirement: { itemsOwned: { hydroponic_rack: 50, climate_controller: 25 } },
      rewardMultiplier: 1.005,
      order: 1830,
    }),
    makeAchievement({
      id: 'build_lab_robotics',
      category: 'builds',
      rarity: 'epic',
      overlayIcon: uiIcons.research,
      name: { de: 'Laborautomatik', en: 'Lab Automation' },
      description: {
        de: 'Besitze 25 Genetics Labs und 25 Trimming Robots.',
        en: 'Own 25 Genetics Labs and 25 Trimming Robots.',
      },
      flavor: { de: 'Die späten Items sprechen miteinander.', en: 'Late items start talking.' },
      requirement: { itemsOwned: { genetics_lab: 25, trimming_robot: 25 } },
      rewardMultiplier: 1.005,
      order: 1840,
    }),
    makeAchievement({
      id: 'chain_apprentice',
      category: 'events',
      rarity: 'rare',
      overlayIcon: uiIcons.achievementLight,
      name: { de: 'Kettenblick', en: 'Chain Sight' },
      description: {
        de: 'Klicke Trail Marker und Cascade Bloom je 5-mal.',
        en: 'Click Trail Marker and Cascade Bloom 5 times each.',
      },
      flavor: {
        de: 'Nicht jedes Event endet beim ersten Klick.',
        en: 'Not every event ends at one click.',
      },
      requirement: { eventTypeClicks: { trail_marker: 5, cascade_bloom: 5 } },
      rewardMultiplier: 1.003,
      order: 1860,
    }),
    makeAchievement({
      id: 'chain_echo_master',
      category: 'events',
      rarity: 'epic',
      overlayIcon: uiIcons.achievementLight,
      name: { de: 'Echo-Lesung', en: 'Echo Reading' },
      description: { de: 'Klicke Echo Harvest 10-mal.', en: 'Click Echo Harvest 10 times.' },
      flavor: {
        de: 'Die dritte Stufe fühlt sich verdient an.',
        en: 'The third step feels earned.',
      },
      requirement: { eventTypeClicks: { echo_harvest: 10 } },
      rewardMultiplier: 1.004,
      order: 1870,
    }),
    makeAchievement({
      id: 'risk_controller',
      category: 'challenges',
      rarity: 'rare',
      overlayIcon: uiIcons.warning,
      name: { de: 'Kontrolliertes Risiko', en: 'Controlled Risk' },
      description: {
        de: 'Klicke Volatile Growth, Blackout Sale und Pest Scare je 5-mal.',
        en: 'Click Volatile Growth, Blackout Sale, and Pest Scare 5 times each.',
      },
      flavor: { de: 'Nicht sicher. Aber absichtlich.', en: 'Not safe. Intentional.' },
      requirement: {
        eventTypeClicks: { volatile_growth: 5, blackout_sale: 5, pest_scare: 5 },
      },
      rewardMultiplier: 1.003,
      order: 1880,
    }),
    makeAchievement({
      id: 'season_sampler',
      category: 'seasons',
      rarity: 'epic',
      overlayIcon: uiIcons.achievementLight,
      name: { de: 'Saison-Sampler', en: 'Season Sampler' },
      description: {
        de: 'Klicke Solstice Seed, Night Market und Festival Lantern je 3-mal.',
        en: 'Click Solstice Seed, Night Market, and Festival Lantern 3 times each.',
      },
      flavor: {
        de: 'Der Garten hat mehrere Stimmungen.',
        en: 'The garden has more than one mood.',
      },
      requirement: {
        eventTypeClicks: { solstice_seed: 3, night_market: 3, festival_lantern: 3 },
      },
      rewardMultiplier: 1.004,
      order: 1890,
    }),
    makeAchievement({
      id: 'research_architect',
      category: 'challenges',
      rarity: 'epic',
      overlayIcon: uiIcons.research,
      name: { de: 'Tree-Architekt', en: 'Tree Architect' },
      description: { de: 'Erforsche 36 Research-Knoten.', en: 'Research 36 nodes.' },
      flavor: {
        de: 'Ein Build ist eine Entscheidungskette.',
        en: 'A build is a chain of decisions.',
      },
      requirement: { researchCount: 36 },
      rewardMultiplier: 1.005,
      order: 1920,
    }),
    makeAchievement({
      id: 'score_badge_100',
      category: 'cosmetics',
      rarity: 'rare',
      overlayIcon: uiIcons.achievementRibbon,
      name: { de: 'Badge-Sammlung I', en: 'Badge Collection I' },
      description: { de: 'Erreiche 100 Achievement-Score.', en: 'Reach 100 achievement score.' },
      flavor: { de: 'Der Rahmen zählt mit.', en: 'The frame counts too.' },
      requirement: { achievementScore: 100 },
      order: 1940,
    }),
    makeAchievement({
      id: 'score_badge_300',
      category: 'cosmetics',
      rarity: 'epic',
      overlayIcon: uiIcons.achievementRibbon,
      name: { de: 'Badge-Sammlung II', en: 'Badge Collection II' },
      description: { de: 'Erreiche 300 Achievement-Score.', en: 'Reach 300 achievement score.' },
      flavor: { de: 'Jetzt ist es sichtbar Meta.', en: 'Now it is visibly meta.' },
      requirement: { achievementScore: 300 },
      rewardMultiplier: 1.003,
      order: 1950,
    }),
    makeAchievement({
      id: 'score_badge_700',
      category: 'cosmetics',
      rarity: 'legendary',
      overlayIcon: uiIcons.achievementRibbon,
      name: { de: 'Badge-Sammlung III', en: 'Badge Collection III' },
      description: { de: 'Erreiche 700 Achievement-Score.', en: 'Reach 700 achievement score.' },
      flavor: { de: 'Ein leiser, dauerhafter Glanz.', en: 'A quiet permanent glow.' },
      requirement: { achievementScore: 700 },
      rewardMultiplier: 1.006,
      order: 1960,
    }),
    makeAchievement({
      id: 'score_badge_1000',
      category: 'cosmetics',
      rarity: 'legendary',
      overlayIcon: uiIcons.achievementRibbon,
      name: { de: 'Badge-Sammlung IV', en: 'Badge Collection IV' },
      description: { de: 'Erreiche 1.000 Achievement-Score.', en: 'Reach 1,000 achievement score.' },
      flavor: { de: 'Nicht laut. Nur unverkennbar.', en: 'Not loud. Unmistakable.' },
      requirement: { achievementScore: 1000 },
      rewardMultiplier: 1.006,
      order: 1970,
    }),
    makeAchievement({
      id: 'research_endgame_map',
      category: 'research',
      rarity: 'legendary',
      overlayIcon: uiIcons.research,
      name: { de: 'Vollständige Karte', en: 'Complete Map' },
      description: { de: 'Erforsche 48 Research-Knoten.', en: 'Research 48 nodes.' },
      flavor: { de: 'Der Baum hat fast keine Schatten mehr.', en: 'The tree has almost no shadows left.' },
      requirement: { researchCount: 48 },
      rewardMultiplier: 1.006,
      order: 1980,
    }),
    makeAchievement({
      id: 'late_catalog_weight',
      category: 'builds',
      rarity: 'legendary',
      overlayIcon: uiIcons.shop,
      name: { de: 'Schwerer Katalog', en: 'Heavy Catalogue' },
      description: { de: 'Besitze 1.500 Shop-Items insgesamt.', en: 'Own 1,500 total shop items.' },
      flavor: { de: 'Breite schlägt reines Hochstapeln.', en: 'Breadth beats pure stacking.' },
      requirement: { totalItemsOwned: 1500 },
      rewardMultiplier: 1.006,
      order: 1990,
    }),
    makeAchievement({
      id: 'season_lantern_10',
      category: 'seasons',
      rarity: 'legendary',
      overlayIcon: uiIcons.achievementLight,
      name: { de: 'Laternenlauf', en: 'Lantern Run' },
      description: { de: 'Klicke Festival Lantern 10-mal.', en: 'Click Festival Lantern 10 times.' },
      flavor: { de: 'Selten genug, um hängen zu bleiben.', en: 'Rare enough to stay memorable.' },
      requirement: { eventTypeClicks: { festival_lantern: 10 } },
      rewardMultiplier: 1.006,
      order: 1995,
    }),
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
  ...createMetaAchievements(),
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
        event_magnet: 10,
        seed_focus: 10,
        harvest_chain: 10,
        cooldown_sync: 10,
      },
    },
    rewardMultiplier: 1.006,
    order: 2040,
  }),
  makeAchievement({
    id: 'hidden_peak_click',
    category: 'hidden',
    rarity: 'epic',
    hidden: true,
    overlayIcon: uiIcons.bpc,
    name: { de: 'Schwerer Finger', en: 'Heavy Finger' },
    description: { de: 'Erreiche 1.000 Buds pro Klick.', en: 'Reach 1,000 buds per click.' },
    flavor: { de: 'Aktives Spiel bleibt Teil der Rechnung.', en: 'Active play remains part of the equation.' },
    requirement: { bpc: 1000 },
    rewardMultiplier: 1.004,
    order: 2050,
  }),
  makeAchievement({
    id: 'hidden_five_lights',
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    overlayIcon: uiIcons.auto,
    name: { de: 'Fünf Lichter', en: 'Five Lights' },
    description: { de: 'Habe 5 aktive Buffs gleichzeitig.', en: 'Have 5 active buffs at once.' },
    flavor: { de: 'Kurz vor Chaos, knapp noch lesbar.', en: 'Almost chaos, still readable.' },
    requirement: { activeBuffCount: 5 },
    rewardMultiplier: 1.006,
    order: 2060,
  }),
  makeAchievement({
    id: 'hidden_returning_regular',
    category: 'hidden',
    rarity: 'rare',
    hidden: true,
    overlayIcon: uiIcons.total,
    name: { de: 'Stammgast', en: 'Regular' },
    description: { de: 'Sammle 10 Offline-Rückkehrmomente.', en: 'Collect 10 offline return moments.' },
    flavor: { de: 'Kurze Besuche zählen auch.', en: 'Short visits count too.' },
    requirement: { offlineReturns: 10 },
    order: 2070,
  }),
  makeAchievement({
    id: 'hidden_prestige_pathfinder',
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    overlayIcon: uiIcons.prestige,
    name: { de: 'Pfadfinder', en: 'Pathfinder' },
    description: { de: 'Führe 10 Prestiges durch.', en: 'Perform 10 prestiges.' },
    flavor: { de: 'Jeder Neustart hat weniger Reibung.', en: 'Every reset has less friction.' },
    requirement: { prestigeCount: 10 },
    rewardMultiplier: 1.006,
    order: 2080,
  }),
];

export const achievements: readonly AchievementDefinition[] = manualAchievements.sort(
  (a, b) => a.order - b.order,
);

export const achievementById = new Map<AchievementId, AchievementDefinition>(
  achievements.map((entry) => [entry.id, entry]),
);
