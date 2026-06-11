import { itemIcons, upgradeIcons } from '../app/assetManifest';
import type { LocaleKey } from '../app/i18n';
import { items, itemById } from './items';
import type { ItemId } from './items';

export type UpgradeCategory =
  | 'building'
  | 'item'
  | 'click'
  | 'global'
  | 'synergy'
  | 'event'
  | 'seed'
  | 'automation'
  | 'prestige'
  | 'utility';

export type UpgradeEffect =
  | { type: 'globalMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
  | { type: 'buildingMultiplier'; targets: readonly ItemId[]; value: number }
  | { type: 'buildingCostMultiplier'; targets: readonly ItemId[]; value: number }
  | { type: 'autoClick'; value: number }
  | { type: 'seedClickBonus'; value: number }
  | { type: 'clickBpsSeconds'; value: number }
  | { type: 'clickCritChance'; value: number }
  | { type: 'automationBpsShare'; value: number }
  | { type: 'eventRewardMultiplier'; value: number }
  | { type: 'eventSpawnRateMultiplier'; value: number }
  | { type: 'eventDurationMultiplier'; value: number }
  | { type: 'softcapRelief'; value: number };

type BuildingUpgradeStage = 1 | 2 | 3 | 4 | 5;
type TrimmerUpgradeStage = 1 | 2 | 3 | 4 | 5 | 6;

type BuildingUpgradeId = `${ItemId}_boost_${BuildingUpgradeStage}` | 'grow_light_lenses';

export type UpgradeId =
  | BuildingUpgradeId
  | `trimmer_auto_${TrimmerUpgradeStage}`
  | 'starter_auto'
  | 'rich_soil'
  | 'precision_trim'
  | 'tap_training'
  | 'canopy_math'
  | 'event_spotters'
  | 'seed_sorting'
  | 'prestige_journal'
  | 'active_harvest_chain'
  | 'servo_feedback'
  | 'event_magnet_array'
  | 'softcap_tuning'
  | 'seed_focus_lenses'
  | 'synergy_closed_loop'
  | 'synergy_precision_irrigation'
  | 'synergy_root_network'
  | 'synergy_lab_pipeline'
  | 'synergy_micro_cycle';

export interface UpgradeRequirement {
  totalBuds?: number;
  itemsOwned?: Partial<Record<ItemId, number>>;
  upgradesOwned?: readonly UpgradeId[];
}

export interface UpgradeDefinition {
  id: UpgradeId;
  category: UpgradeCategory;
  targetIds?: readonly ItemId[];
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  cost: number;
  icon: string;
  effects: readonly UpgradeEffect[];
  requirement?: UpgradeRequirement;
  order: number;
}

const BUILDING_THRESHOLDS = [10, 50, 150, 300, 500] as const;
const BUILDING_COST_FACTORS = [7, 46, 320, 900, 2200] as const;
const BUILDING_MULTIPLIERS = [1.75, 2.1, 2.65, 3.1, 3.75] as const;

const BUILDING_ICON_OVERRIDES: Partial<Record<ItemId, string>> = {
  seedling: itemIcons.seedling,
  planter: itemIcons.planter,
  grow_tent: itemIcons.grow_tent,
  grow_light: itemIcons.grow_light,
  cultivator: itemIcons.cultivator,
};

const BUILDING_STAGE_ID_OVERRIDES: Partial<Record<ItemId, readonly (UpgradeId | undefined)[]>> = {
  grow_light: ['grow_light_lenses'],
};

const BUILDING_STAGE_TITLE_OVERRIDES: Partial<
  Record<ItemId, Record<number, Record<LocaleKey, string>>>
> = {
  grow_light: {
    1: {
      de: 'Prismatische Linsen',
      en: 'Prismatic Lenses',
    },
  },
};

const BUILDING_STAGE_DESCRIPTION_OVERRIDES: Partial<
  Record<ItemId, Record<number, Record<LocaleKey, string>>>
> = {
  grow_light: {
    1: {
      de: 'LED-Lichter produzieren deutlich mehr Buds und starten die Indoor-Synergie.',
      en: 'Grow lights produce clearly more buds and start the indoor synergy.',
    },
  },
};

function formatBoostName(
  base: Record<LocaleKey, string>,
  stage: number,
): Record<LocaleKey, string> {
  const suffix = stage.toString();
  return {
    de: `${base.de} Boost ${suffix}`,
    en: `${base.en} Boost ${suffix}`,
  } satisfies Record<LocaleKey, string>;
}

function formatBoostDescription(base: Record<LocaleKey, string>): Record<LocaleKey, string> {
  return {
    de: `${base.de} liefern jetzt doppelte Erträge.`,
    en: `${base.en} now yield twice as many buds.`,
  } satisfies Record<LocaleKey, string>;
}

function resolveBuildingIcon(itemId: ItemId, fallback: string): string {
  return BUILDING_ICON_OVERRIDES[itemId] ?? fallback;
}

function resolveStageId(itemId: ItemId, stageIndex: number): UpgradeId {
  const overrides = BUILDING_STAGE_ID_OVERRIDES[itemId];
  const override = overrides?.[stageIndex];
  if (override) {
    return override;
  }
  return `${itemId}_boost_${stageIndex + 1}` as UpgradeId;
}

function resolveStageName(
  itemId: ItemId,
  stageIndex: number,
  baseName: Record<LocaleKey, string>,
): Record<LocaleKey, string> {
  const stageNumber = stageIndex + 1;
  const overrides = BUILDING_STAGE_TITLE_OVERRIDES[itemId]?.[stageNumber];
  if (overrides) {
    return overrides;
  }
  return formatBoostName(baseName, stageNumber);
}

function resolveStageDescription(
  itemId: ItemId,
  stageIndex: number,
  baseDescription: Record<LocaleKey, string>,
): Record<LocaleKey, string> {
  const stageNumber = stageIndex + 1;
  const overrides = BUILDING_STAGE_DESCRIPTION_OVERRIDES[itemId]?.[stageNumber];
  if (overrides) {
    return overrides;
  }
  return formatBoostDescription(baseDescription);
}

function createBuildingUpgrades(): UpgradeDefinition[] {
  const entries: UpgradeDefinition[] = [];

  for (const item of items) {
    BUILDING_THRESHOLDS.forEach((threshold, index) => {
      const id = resolveStageId(item.id, index);
      const name = resolveStageName(item.id, index, item.name);
      const description = resolveStageDescription(item.id, index, item.description);
      const icon = resolveBuildingIcon(item.id, item.icon);
      const costMultiplier = BUILDING_COST_FACTORS[index];
      const cost = Math.round(item.baseCost * costMultiplier);
      const requirement: UpgradeRequirement = {
        itemsOwned: { [item.id]: threshold },
      };
      if (index > 0) {
        const previousId = resolveStageId(item.id, index - 1);
        requirement.upgradesOwned = [previousId];
      }

      entries.push({
        id,
        category: 'item',
        targetIds: [item.id],
        name,
        description,
        cost,
        icon,
        effects: [
          { type: 'buildingMultiplier', targets: [item.id], value: BUILDING_MULTIPLIERS[index] },
        ],
        requirement,
        order: item.tier * 10 + (index + 1),
      });
    });
  }

  return entries;
}

function getBaseCost(itemId: ItemId): number {
  const definition = itemById.get(itemId);
  return definition?.baseCost ?? 1;
}

function createSynergyUpgrades(): UpgradeDefinition[] {
  const co2Base = getBaseCost('co2_tank');
  const climateBase = getBaseCost('climate_controller');
  const hydroBase = getBaseCost('hydroponic_rack');
  const geneticsBase = getBaseCost('genetics_lab');
  const microBase = getBaseCost('micro_greenhouse');

  return [
    {
      id: 'synergy_closed_loop',
      category: 'synergy',
      targetIds: ['grow_tent', 'grow_light', 'co2_tank'] as const,
      name: {
        de: 'Geschlossener Kreislauf',
        en: 'Closed Loop Cycle',
      },
      description: {
        de: '+20 % Produktion für Grow-Zelte, LED-Lichter und CO₂-Tanks.',
        en: '+20% production for grow tents, lights, and CO₂ tanks.',
      },
      cost: Math.round(co2Base * 120),
      icon: upgradeIcons.globalBps,
      effects: [
        {
          type: 'buildingMultiplier',
          targets: ['grow_tent', 'grow_light', 'co2_tank'] as const,
          value: 1.2,
        },
      ],
      requirement: {
        itemsOwned: { grow_tent: 40, grow_light: 40, co2_tank: 15 },
        totalBuds: 50_000_000,
      },
      order: 6000,
    },
    {
      id: 'synergy_root_network',
      category: 'synergy',
      targetIds: ['seedling', 'planter', 'irrigation_system'] as const,
      name: {
        de: 'Wurzelnetz',
        en: 'Root Network',
      },
      description: {
        de: 'Keimlinge, Töpfe und Bewässerungssysteme produzieren +35 %.',
        en: 'Seedlings, planters, and irrigation systems produce +35%.',
      },
      cost: Math.round(hydroBase * 18),
      icon: upgradeIcons.buildingBoost,
      effects: [
        {
          type: 'buildingMultiplier',
          targets: ['seedling', 'planter', 'irrigation_system'] as const,
          value: 1.35,
        },
      ],
      requirement: {
        itemsOwned: { seedling: 100, planter: 75, irrigation_system: 25 },
        totalBuds: 8_000_000,
      },
      order: 6050,
    },
    {
      id: 'synergy_precision_irrigation',
      category: 'synergy',
      targetIds: ['climate_controller', 'hydroponic_rack', 'irrigation_system'] as const,
      name: {
        de: 'Feintuning',
        en: 'Fine Tuning',
      },
      description: {
        de: 'Kosten -5 % für Klima-Controller, Hydroponik-Racks und Bewässerungssysteme.',
        en: 'Costs -5% for climate controllers, hydro racks, and irrigation systems.',
      },
      cost: Math.round(Math.max(climateBase, hydroBase) * 95),
      icon: upgradeIcons.costEfficiency,
      effects: [
        {
          type: 'buildingCostMultiplier',
          targets: ['climate_controller', 'hydroponic_rack', 'irrigation_system'] as const,
          value: 0.95,
        },
      ],
      requirement: {
        itemsOwned: { climate_controller: 20, hydroponic_rack: 35, irrigation_system: 60 },
        totalBuds: 500_000_000,
      },
      order: 6100,
    },
    {
      id: 'synergy_lab_pipeline',
      category: 'synergy',
      targetIds: ['genetics_lab', 'trimming_robot', 'hydroponic_rack'] as const,
      name: {
        de: 'Labor-Pipeline',
        en: 'Lab Pipeline',
      },
      description: {
        de: 'Genetik-Labore, Hydroponik-Racks und Trimm-Roboter produzieren +30 %.',
        en: 'Genetics labs, hydro racks, and trimming robots produce +30%.',
      },
      cost: Math.round(geneticsBase * 42),
      icon: upgradeIcons.globalBps,
      effects: [
        {
          type: 'buildingMultiplier',
          targets: ['genetics_lab', 'trimming_robot', 'hydroponic_rack'] as const,
          value: 1.3,
        },
      ],
      requirement: {
        itemsOwned: { genetics_lab: 25, trimming_robot: 15, hydroponic_rack: 50 },
        totalBuds: 750_000_000,
      },
      order: 6200,
    },
    {
      id: 'synergy_micro_cycle',
      category: 'prestige',
      targetIds: ['micro_greenhouse', 'climate_controller', 'genetics_lab'] as const,
      name: {
        de: 'Mikro-Zyklus',
        en: 'Micro Cycle',
      },
      description: {
        de: 'Mikro-Gewächshäuser und ihre Support-Systeme produzieren +40 %. Ein sauberer Schub für spätere Runs.',
        en: 'Micro greenhouses and their support systems produce +40%. A clean boost for later runs.',
      },
      cost: Math.round(microBase * 38),
      icon: upgradeIcons.costEfficiency,
      effects: [
        {
          type: 'buildingMultiplier',
          targets: ['micro_greenhouse', 'climate_controller', 'genetics_lab'] as const,
          value: 1.4,
        },
      ],
      requirement: {
        itemsOwned: { micro_greenhouse: 10, climate_controller: 60, genetics_lab: 40 },
        totalBuds: 8_000_000_000,
      },
      order: 6300,
    },
  ];
}

function createArchetypeUpgrades(): UpgradeDefinition[] {
  const seedlingBase = getBaseCost('seedling');
  const co2Base = getBaseCost('co2_tank');
  const climateBase = getBaseCost('climate_controller');
  const geneticsBase = getBaseCost('genetics_lab');
  const trimmerBase = getBaseCost('trimming_robot');

  return [
    {
      id: 'active_harvest_chain',
      category: 'click',
      targetIds: ['seedling', 'cultivator'] as const,
      name: {
        de: 'Erntekette',
        en: 'Harvest Chain',
      },
      description: {
        de: 'Klicks gewinnen 0,02 Sekunden deiner BPS dazu und erhalten +2 Prozentpunkte Krit-Chance.',
        en: 'Clicks gain 0.02 seconds of your BPS and +2 percentage points critical chance.',
      },
      cost: Math.round(seedlingBase * 160_000),
      icon: upgradeIcons.clickPower,
      effects: [
        { type: 'clickBpsSeconds', value: 0.02 },
        { type: 'clickCritChance', value: 0.02 },
      ],
      requirement: {
        itemsOwned: { seedling: 75, cultivator: 20 },
        totalBuds: 1_800_000,
      },
      order: 5100,
    },
    {
      id: 'servo_feedback',
      category: 'automation',
      targetIds: ['trimming_robot', 'cultivator'] as const,
      name: {
        de: 'Servo-Feedback',
        en: 'Servo Feedback',
      },
      description: {
        de: 'Auto-Klick-Systeme ernten zusätzlich 1,2 % deiner BPS, solange Automation läuft.',
        en: 'Auto-click systems harvest an extra 1.2% of your BPS while automation is running.',
      },
      cost: Math.round(trimmerBase * 16),
      icon: upgradeIcons.automation,
      effects: [
        { type: 'autoClick', value: 0.75 },
        { type: 'automationBpsShare', value: 0.012 },
      ],
      requirement: {
        itemsOwned: { trimming_robot: 10, cultivator: 75 },
        totalBuds: 120_000_000,
      },
      order: 5150,
    },
    {
      id: 'event_magnet_array',
      category: 'event',
      targetIds: ['co2_tank', 'climate_controller'] as const,
      name: {
        de: 'Event-Magnetarray',
        en: 'Event Magnet Array',
      },
      description: {
        de: 'Events erscheinen +12 % häufiger, dauern +10 % länger und zahlen +12 % besser.',
        en: 'Events appear 12% more often, last 10% longer, and pay 12% better.',
      },
      cost: Math.round(co2Base * 420),
      icon: upgradeIcons.globalBps,
      effects: [
        { type: 'eventSpawnRateMultiplier', value: 1.12 },
        { type: 'eventDurationMultiplier', value: 1.1 },
        { type: 'eventRewardMultiplier', value: 1.12 },
      ],
      requirement: {
        itemsOwned: { co2_tank: 30, climate_controller: 20 },
        totalBuds: 95_000_000,
      },
      order: 5200,
    },
    {
      id: 'softcap_tuning',
      category: 'utility',
      targetIds: ['irrigation_system', 'climate_controller'] as const,
      name: {
        de: 'Softcap-Tuning',
        en: 'Softcap Tuning',
      },
      description: {
        de: 'Späte Softcap-Strafen werden um 8 % abgeschwächt. Breite Shops bleiben länger relevant.',
        en: 'Late softcap penalties are softened by 8%. Wide shops stay relevant longer.',
      },
      cost: Math.round(climateBase * 160),
      icon: upgradeIcons.costEfficiency,
      effects: [{ type: 'softcapRelief', value: 0.08 }],
      requirement: {
        itemsOwned: { irrigation_system: 80, climate_controller: 30 },
        totalBuds: 600_000_000,
      },
      order: 5250,
    },
    {
      id: 'seed_focus_lenses',
      category: 'seed',
      targetIds: ['genetics_lab', 'seedling'] as const,
      name: {
        de: 'Seed-Fokuslinsen',
        en: 'Seed Focus Lenses',
      },
      description: {
        de: '+1,5 Prozentpunkte Seed-Chance beim Klicken und +20 % für Keimlinge und Genetik-Labore.',
        en: '+1.5 percentage points click seed chance and +20% for seedlings and genetics labs.',
      },
      cost: Math.round(geneticsBase * 70),
      icon: upgradeIcons.costEfficiency,
      effects: [
        { type: 'seedClickBonus', value: 0.015 },
        {
          type: 'buildingMultiplier',
          targets: ['seedling', 'genetics_lab'] as const,
          value: 1.2,
        },
      ],
      requirement: {
        itemsOwned: { genetics_lab: 25, seedling: 150 },
        totalBuds: 1_200_000_000,
      },
      order: 5300,
    },
  ];
}

const TRIMMER_THRESHOLDS = [25, 50, 75, 100, 150, 200] as const;
const TRIMMER_COST_FACTORS = [12, 18, 26, 36, 48, 64] as const;

function createTrimmerUpgrades(): UpgradeDefinition[] {
  const baseCost = getBaseCost('trimming_robot');
  const entries: UpgradeDefinition[] = [];

  TRIMMER_THRESHOLDS.forEach((threshold, index) => {
    const stage = (index + 1) as TrimmerUpgradeStage;
    const id: UpgradeId = `trimmer_auto_${stage}`;
    const name: Record<LocaleKey, string> = {
      de: `Trimm-Automation ${stage}`,
      en: `Trimmer Automation ${stage}`,
    };
    const description: Record<LocaleKey, string> = {
      de: '+0,5 automatische Klicks pro Sekunde.',
      en: '+0.5 automatic clicks per second.',
    };
    const requirement: UpgradeRequirement = {
      itemsOwned: { trimming_robot: threshold },
    };
    if (index > 0) {
      const previousStage = (stage - 1) as TrimmerUpgradeStage;
      requirement.upgradesOwned = [`trimmer_auto_${previousStage}`];
    }

    entries.push({
      id,
      category: 'automation',
      targetIds: ['trimming_robot'],
      name,
      description,
      cost: Math.round(baseCost * TRIMMER_COST_FACTORS[index]),
      icon: upgradeIcons.automation,
      effects: [{ type: 'autoClick', value: 0.5 }],
      requirement,
      order: 8000 + stage,
    });
  });

  return entries;
}

const legacyUpgrades: UpgradeDefinition[] = [
  {
    id: 'starter_auto',
    category: 'automation',
    name: {
      de: 'Auto-Nudge',
      en: 'Auto Nudge',
    },
    description: {
      de: '+0,35 automatische Klicks pro Sekunde. Der erste kleine Leerlauf-Schub.',
      en: '+0.35 automatic clicks per second. Your first small idle push.',
    },
    cost: 420,
    icon: upgradeIcons.automation,
    effects: [{ type: 'autoClick', value: 0.35 }],
    requirement: {
      totalBuds: 260,
    },
    order: 80,
  },
  {
    id: 'rich_soil',
    category: 'global',
    name: {
      de: 'Reiche Erde',
      en: 'Rich Soil',
    },
    description: {
      de: 'Globale Produktion +25 %.',
      en: 'Global production +25%.',
    },
    cost: 820,
    icon: upgradeIcons.globalBps,
    effects: [{ type: 'globalMultiplier', value: 1.25 }],
    requirement: {
      totalBuds: 620,
    },
    order: 100,
  },
  {
    id: 'precision_trim',
    category: 'click',
    name: {
      de: 'Präziser Trim',
      en: 'Precision Trim',
    },
    description: {
      de: 'Buds pro Klick verdoppelt.',
      en: 'Doubles buds per click.',
    },
    cost: 420,
    icon: upgradeIcons.clickPower,
    effects: [{ type: 'clickMultiplier', value: 2 }],
    requirement: {
      totalBuds: 260,
    },
    order: 70,
  },
  {
    id: 'tap_training',
    category: 'click',
    name: {
      de: 'Tap-Training',
      en: 'Tap Training',
    },
    description: {
      de: 'Buds pro Klick +75 %. Aktives Spielen bleibt im Early Game relevant.',
      en: 'Buds per click +75%. Keeps active play relevant in the early game.',
    },
    cost: 1_900,
    icon: upgradeIcons.clickPower,
    effects: [{ type: 'clickMultiplier', value: 1.75 }],
    requirement: {
      totalBuds: 1_500,
      upgradesOwned: ['precision_trim'],
    },
    order: 120,
  },
  {
    id: 'canopy_math',
    category: 'global',
    name: {
      de: 'Canopy-Mathe',
      en: 'Canopy Math',
    },
    description: {
      de: 'Globale Produktion +20 %. Ein sauberer Sprung nach dem ersten Shop-Aufbau.',
      en: 'Global production +20%. A clean jump after the first shop setup.',
    },
    cost: 5_500,
    icon: upgradeIcons.globalBps,
    effects: [{ type: 'globalMultiplier', value: 1.2 }],
    requirement: {
      totalBuds: 4_000,
    },
    order: 130,
  },
  {
    id: 'event_spotters',
    category: 'event',
    name: {
      de: 'Event-Spotter',
      en: 'Event Spotters',
    },
    description: {
      de: 'Sofort-Bud-Events zahlen +25 %. Stark, aber erst nach der ersten Strategiephase.',
      en: 'Instant bud events pay +25%. Strong, but only after the first strategy phase.',
    },
    cost: 13_000,
    icon: upgradeIcons.globalBps,
    effects: [{ type: 'eventRewardMultiplier', value: 1.25 }],
    requirement: {
      totalBuds: 10_000,
    },
    order: 140,
  },
  {
    id: 'seed_sorting',
    category: 'seed',
    name: {
      de: 'Seed-Sortierung',
      en: 'Seed Sorting',
    },
    description: {
      de: '+1 Prozentpunkt Seed-Chance beim aktiven Klicken.',
      en: '+1 percentage point seed chance while actively clicking.',
    },
    cost: 36_000,
    icon: upgradeIcons.costEfficiency,
    effects: [{ type: 'seedClickBonus', value: 0.01 }],
    requirement: {
      totalBuds: 28_000,
    },
    order: 150,
  },
  {
    id: 'prestige_journal',
    category: 'prestige',
    name: {
      de: 'Prestige-Journal',
      en: 'Prestige Journal',
    },
    description: {
      de: 'Globale Produktion +10 %. Macht den ersten Prestige-Run planbarer.',
      en: 'Global production +10%. Makes the first prestige run easier to plan.',
    },
    cost: 520_000,
    icon: upgradeIcons.costEfficiency,
    effects: [{ type: 'globalMultiplier', value: 1.1 }],
    requirement: {
      totalBuds: 420_000,
    },
    order: 160,
  },
];

const buildingUpgrades = createBuildingUpgrades();
const synergyUpgrades = createSynergyUpgrades();
const archetypeUpgrades = createArchetypeUpgrades();
const trimmerUpgrades = createTrimmerUpgrades();

export const upgrades: UpgradeDefinition[] = [
  ...legacyUpgrades,
  ...buildingUpgrades,
  ...archetypeUpgrades,
  ...synergyUpgrades,
  ...trimmerUpgrades,
].sort((a, b) => a.order - b.order);

export const upgradeById = new Map<UpgradeId, UpgradeDefinition>(
  upgrades.map((upgrade) => [upgrade.id, upgrade]),
);
