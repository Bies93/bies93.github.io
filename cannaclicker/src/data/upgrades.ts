import { asset } from "../app/assets";
import type { LocaleKey } from "../app/i18n";
import { items, itemById } from "./items";

export type UpgradeCategory = "building" | "synergy" | "utility";

export type UpgradeEffect =
  | { type: "globalMultiplier"; value: number }
  | { type: "clickMultiplier"; value: number }
  | { type: "buildingMultiplier"; targets: string[]; value: number }
  | { type: "buildingCostMultiplier"; targets: string[]; value: number }
  | { type: "autoClick"; value: number };

export interface UpgradeRequirement {
  totalBuds?: number;
  itemsOwned?: Record<string, number>;
  upgradesOwned?: string[];
}

export interface UpgradeDefinition {
  id: string;
  category: UpgradeCategory;
  targetIds?: string[];
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  cost: number;
  icon: string;
  effects: UpgradeEffect[];
  requirement?: UpgradeRequirement;
  order: number;
}

const BUILDING_THRESHOLDS = [10, 25, 50, 100] as const;
const BUILDING_COST_FACTORS = [8, 25, 80, 250] as const;

const BUILDING_ICON_OVERRIDES: Partial<Record<string, string>> = {
  seedling: asset("icons/upgrades/upgrade-seedling.png"),
  planter: asset("icons/upgrades/upgrade-planter.png"),
  grow_tent: asset("icons/upgrades/upgrade-tent.png"),
  grow_light: asset("icons/upgrades/upgrade-light.png"),
  cultivator: asset("icons/upgrades/upgrade-cultivator.png"),
};

const BUILDING_STAGE_ID_OVERRIDES: Partial<Record<string, (string | undefined)[]>> = {
  grow_light: ["grow_light_lenses"],
};

const BUILDING_STAGE_TITLE_OVERRIDES: Partial<Record<string, Record<number, Record<LocaleKey, string>>>> = {
  grow_light: {
    1: {
      de: "Prismatische Linsen",
      en: "Prismatic Lenses",
    },
  },
};

const BUILDING_STAGE_DESCRIPTION_OVERRIDES: Partial<Record<string, Record<number, Record<LocaleKey, string>>>> = {
  grow_light: {
    1: {
      de: "LED-Lichter produzieren 2× Buds.",
      en: "Grow lights produce 2× buds.",
    },
  },
};

function formatBoostName(base: Record<LocaleKey, string>, stage: number): Record<LocaleKey, string> {
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

function resolveBuildingIcon(itemId: string, fallback: string): string {
  return BUILDING_ICON_OVERRIDES[itemId] ?? fallback;
}

function resolveStageId(itemId: string, stageIndex: number): string {
  const overrides = BUILDING_STAGE_ID_OVERRIDES[itemId];
  const override = overrides?.[stageIndex];
  if (override) {
    return override;
  }
  return `${itemId}_boost_${stageIndex + 1}`;
}

function resolveStageName(itemId: string, stageIndex: number, baseName: Record<LocaleKey, string>): Record<LocaleKey, string> {
  const stageNumber = stageIndex + 1;
  const overrides = BUILDING_STAGE_TITLE_OVERRIDES[itemId]?.[stageNumber];
  if (overrides) {
    return overrides;
  }
  return formatBoostName(baseName, stageNumber);
}

function resolveStageDescription(
  itemId: string,
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
        category: "building",
        targetIds: [item.id],
        name,
        description,
        cost,
        icon,
        effects: [{ type: "buildingMultiplier", targets: [item.id], value: 2 }],
        requirement,
        order: item.tier * 10 + (index + 1),
      });
    });
  }

  return entries;
}

function getBaseCost(itemId: string): number {
  const definition = itemById.get(itemId);
  return definition?.baseCost ?? 1;
}

function createSynergyUpgrades(): UpgradeDefinition[] {
  const co2Base = getBaseCost("co2_tank");
  const climateBase = getBaseCost("climate_controller");
  const hydroBase = getBaseCost("hydroponic_rack");

  return [
    {
      id: "synergy_closed_loop",
      category: "synergy",
      targetIds: ["grow_tent", "grow_light", "co2_tank"],
      name: {
        de: "Geschlossener Kreislauf",
        en: "Closed Loop Cycle",
      },
      description: {
        de: "+20 % Produktion für Grow-Zelte, LED-Lichter und CO₂-Tanks.",
        en: "+20% production for grow tents, lights, and CO₂ tanks.",
      },
      cost: Math.round(co2Base * 120),
      icon: asset("icons/upgrades/upgrade-global-bps.png"),
      effects: [
        { type: "buildingMultiplier", targets: ["grow_tent", "grow_light", "co2_tank"], value: 1.2 },
      ],
      requirement: {
        itemsOwned: { grow_tent: 40, grow_light: 40, co2_tank: 15 },
        totalBuds: 50_000_000,
      },
      order: 6000,
    },
    {
      id: "synergy_precision_irrigation",
      category: "synergy",
      targetIds: ["climate_controller", "hydroponic_rack", "irrigation_system"],
      name: {
        de: "Feintuning",
        en: "Fine Tuning",
      },
      description: {
        de: "Kosten -5 % für Klima-Controller, Hydroponik-Racks und Bewässerungssysteme.",
        en: "Costs -5% for climate controllers, hydro racks, and irrigation systems.",
      },
      cost: Math.round(Math.max(climateBase, hydroBase) * 95),
      icon: asset("icons/upgrades/upgrade-planter.png"),
      effects: [
        {
          type: "buildingCostMultiplier",
          targets: ["climate_controller", "hydroponic_rack", "irrigation_system"],
          value: 0.95,
        },
      ],
      requirement: {
        itemsOwned: { climate_controller: 20, hydroponic_rack: 35, irrigation_system: 60 },
        totalBuds: 500_000_000,
      },
      order: 6100,
    },
  ];
}

const TRIMMER_THRESHOLDS = [25, 50, 75, 100, 150, 200] as const;
const TRIMMER_COST_FACTORS = [12, 18, 26, 36, 48, 64] as const;

function createTrimmerUpgrades(): UpgradeDefinition[] {
  const baseCost = getBaseCost("trimming_robot");
  const entries: UpgradeDefinition[] = [];

  TRIMMER_THRESHOLDS.forEach((threshold, index) => {
    const stage = index + 1;
    const id = `trimmer_auto_${stage}`;
    const name: Record<LocaleKey, string> = {
      de: `Trimm-Automation ${stage}`,
      en: `Trimmer Automation ${stage}`,
    };
    const description: Record<LocaleKey, string> = {
      de: "+0,5 automatische Klicks pro Sekunde.",
      en: "+0.5 automatic clicks per second.",
    };
    const requirement: UpgradeRequirement = {
      itemsOwned: { trimming_robot: threshold },
    };
    if (index > 0) {
      requirement.upgradesOwned = [`trimmer_auto_${stage - 1}`];
    }

    entries.push({
      id,
      category: "utility",
      targetIds: ["trimming_robot"],
      name,
      description,
      cost: Math.round(baseCost * TRIMMER_COST_FACTORS[index]),
      icon: asset("icons/upgrades/upgrade-cultivator.png"),
      effects: [{ type: "autoClick", value: 0.5 }],
      requirement,
      order: 8000 + stage,
    });
  });

  return entries;
}

const legacyUpgrades: UpgradeDefinition[] = [
  {
    id: "rich_soil",
    category: "utility",
    name: {
      de: "Reiche Erde",
      en: "Rich Soil",
    },
    description: {
      de: "Globale Produktion +25 %.",
      en: "Global production +25%.",
    },
    cost: 2_500,
    icon: asset("icons/upgrades/upgrade-global-bps.png"),
    effects: [{ type: "globalMultiplier", value: 1.25 }],
    requirement: {
      totalBuds: 2_000,
    },
    order: 100,
  },
  {
    id: "precision_trim",
    category: "utility",
    name: {
      de: "Präziser Trim",
      en: "Precision Trim",
    },
    description: {
      de: "Buds pro Klick verdoppelt.",
      en: "Doubles buds per click.",
    },
    cost: 15_000,
    icon: asset("icons/upgrades/upgrade-click-x2.png"),
    effects: [{ type: "clickMultiplier", value: 2 }],
    requirement: {
      totalBuds: 10_000,
    },
    order: 110,
  },
];

const buildingUpgrades = createBuildingUpgrades();
const synergyUpgrades = createSynergyUpgrades();
const trimmerUpgrades = createTrimmerUpgrades();

export const upgrades: UpgradeDefinition[] = [
  ...legacyUpgrades,
  ...buildingUpgrades,
  ...synergyUpgrades,
  ...trimmerUpgrades,
].sort((a, b) => a.order - b.order);

export const upgradeById = new Map(upgrades.map((upgrade) => [upgrade.id, upgrade] as const));
