import { asset } from "../app/assets";

export interface UnlockCondition {
  totalBuds?: number;
  itemsOwned?: Record<string, number>;
}

export interface ItemDefinition {
  id: string;
  name: Record<'de' | 'en', string>;
  description: Record<'de' | 'en', string>;
  tier: number;
  baseCost: number;
  costFactor: number;
  bps: number;
  icon: string;
  tierSize?: number;
  tierBonusMult?: number;
  softcapTier?: number;
  softcapMult?: number;
  softcapCopies?: number;
  softcapPenalty?: number;
  unlock?: UnlockCondition;
}

export const items: ItemDefinition[] = [
  {
    id: 'seedling',
    name: {
      de: 'Keimling',
      en: 'Seedling',
    },
    description: {
      de: 'Dein erster Keimling steckt voller Potenziale.',
      en: 'Your first sprout brimming with promise.',
    },
    tier: 1,
    baseCost: 25,
    costFactor: 1.18,
    bps: 0.1,
    icon: asset('icons/items/item-seedling.png'),
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'planter',
    name: {
      de: 'Topf',
      en: 'Planter',
    },
    description: {
      de: 'Mehr Erde, mehr Wurzeln, mehr Wachstum.',
      en: 'More soil, roots, and growth.',
    },
    tier: 2,
    baseCost: 250,
    costFactor: 1.194,
    bps: 1,
    icon: asset('icons/items/item-planter.png'),
    unlock: {
      totalBuds: 50,
    },
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'grow_tent',
    name: {
      de: 'Grow-Zelt',
      en: 'Grow Tent',
    },
    description: {
      de: 'Kontrollierte Umgebung für stabile Erträge.',
      en: 'Controlled environment for steady yields.',
    },
    tier: 3,
    baseCost: 2_000,
    costFactor: 1.207,
    bps: 8,
    icon: asset('icons/items/item-grow-tent.png'),
    unlock: {
      totalBuds: 500,
    },
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'grow_light',
    name: {
      de: 'LED-Licht',
      en: 'Grow Light',
    },
    description: {
      de: 'Vollspektrum-Licht boostet das Wachstum massiv.',
      en: 'Full spectrum light massively boosts growth.',
    },
    tier: 4,
    baseCost: 11_750,
    costFactor: 1.221,
    bps: 47,
    icon: asset('icons/items/item-grow-light.png'),
    unlock: {
      itemsOwned: { grow_tent: 5 },
    },
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'cultivator',
    name: {
      de: 'Gärtner',
      en: 'Cultivator',
    },
    description: {
      de: 'Ein Profi kümmert sich um jede Pflanze.',
      en: 'A professional takes care of each plant.',
    },
    tier: 5,
    baseCost: 65_000,
    costFactor: 1.235,
    bps: 260,
    icon: asset('icons/items/item-cultivator.png'),
    unlock: {
      totalBuds: 75_000,
    },
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'irrigation_system',
    name: {
      de: 'Bewässerungssystem',
      en: 'Irrigation System',
    },
    description: {
      de: 'Automatisch gießen, niemals vergessen.',
      en: 'Automatic watering, never forget again.',
    },
    tier: 6,
    baseCost: 325_000,
    costFactor: 1.248,
    bps: 1_300,
    icon: asset('img/bewasesserung_shop.png'),
    unlock: {
      totalBuds: 500_000,
    },
    softcapTier: 8,
    softcapMult: 1.1,
  },
  {
    id: 'co2_tank',
    name: {
      de: 'CO₂-Tank',
      en: 'CO₂ Tank',
    },
    description: {
      de: 'Mehr CO₂, mehr Fotosynthese.',
      en: 'More CO₂, more photosynthesis.',
    },
    tier: 7,
    baseCost: 1_625_000,
    costFactor: 1.262,
    bps: 6_500,
    icon: asset('img/co2tank_shop.png'),
    unlock: {
      totalBuds: 3_000_000,
    },
    softcapTier: 8,
    softcapMult: 1.1,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
  {
    id: 'climate_controller',
    name: {
      de: 'Klima-Controller',
      en: 'Climate Controller',
    },
    description: {
      de: 'Temp und Luftfeuchte auf Punkt.',
      en: 'Temperature and humidity dialed in.',
    },
    tier: 8,
    baseCost: 7_000_000,
    costFactor: 1.275,
    bps: 28_000,
    icon: asset('img/KlimaController_shop.png'),
    unlock: {
      totalBuds: 12_000_000,
    },
    softcapTier: 9,
    softcapMult: 1.12,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
  {
    id: 'hydroponic_rack',
    name: {
      de: 'Hydroponik-Rack',
      en: 'Hydroponic Rack',
    },
    description: {
      de: 'Wurzeln lieben es.',
      en: 'Roots love it.',
    },
    tier: 9,
    baseCost: 37_500_000,
    costFactor: 1.289,
    bps: 150_000,
    icon: asset('img/hydroponik_shop.png'),
    unlock: {
      totalBuds: 60_000_000,
    },
    softcapTier: 9,
    softcapMult: 1.12,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
  {
    id: 'genetics_lab',
    name: {
      de: 'Genetik-Labor',
      en: 'Genetics Lab',
    },
    description: {
      de: 'Strains tunen.',
      en: 'Tune your strains.',
    },
    tier: 10,
    baseCost: 200_000_000,
    costFactor: 1.303,
    bps: 800_000,
    icon: asset('img/genetik_shop.png'),
    unlock: {
      totalBuds: 300_000_000,
    },
    softcapTier: 10,
    softcapMult: 1.13,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
  {
    id: 'trimming_robot',
    name: {
      de: 'Trimm-Roboter',
      en: 'Trimming Robot',
    },
    description: {
      de: 'Schneidet Tag und Nacht.',
      en: 'Trims day and night.',
    },
    tier: 11,
    baseCost: 1_000_000_000,
    costFactor: 1.316,
    bps: 4_000_000,
    icon: asset('img/roboter_shop.png'),
    unlock: {
      totalBuds: 1_500_000_000,
    },
    softcapTier: 10,
    softcapMult: 1.13,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
  {
    id: 'micro_greenhouse',
    name: {
      de: 'Mikro-Gewächshaus',
      en: 'Micro Greenhouse',
    },
    description: {
      de: 'Mikroklima, Makro-Output.',
      en: 'Microclimate, macro output.',
    },
    tier: 12,
    baseCost: 6_000_000_000,
    costFactor: 1.33,
    bps: 24_000_000,
    icon: asset('img/gewaechshaus_shop.png'),
    unlock: {
      totalBuds: 8_000_000_000,
    },
    softcapTier: 10,
    softcapMult: 1.13,
    softcapCopies: 25,
    softcapPenalty: 0.92,
  },
];

export const itemById = new Map(items.map((item) => [item.id, item] as const));

