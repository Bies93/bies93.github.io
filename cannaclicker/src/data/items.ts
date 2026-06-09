import { itemIcons } from '../app/assetManifest';

const MASS_MILESTONES = [10, 25, 50, 100, 200, 350, 600, 1000] as const;
const EARLY_MILESTONES = [10, 25, 50, 100, 150, 250, 400, 650] as const;
const INDOOR_MILESTONES = [5, 15, 35, 75, 125, 200, 320, 500] as const;
const INFRASTRUCTURE_MILESTONES = [5, 10, 25, 50, 100, 150, 250, 400] as const;
const LATE_MILESTONES = [3, 10, 25, 50, 100, 150, 250, 400] as const;
const COMPACT_MILESTONES = [1, 3, 10, 25, 50, 100, 150, 250] as const;

const ITEM_DATA = [
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
    role: {
      de: 'Frühe Masse · Klick- und Seed-Synergien',
      en: 'Early mass · click and seed synergies',
    },
    synergyHooks: {
      de: 'Skaliert später mit Seed-Sortierung, Klickwert und Basis-Multiplikatoren.',
      en: 'Later scales with seed sorting, click value, and base multipliers.',
    },
    tier: 1,
    baseCost: 12,
    costFactor: 1.13,
    bps: 0.12,
    icon: itemIcons.seedling,
    milestoneThresholds: MASS_MILESTONES,
    milestoneBonusMult: 1.18,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Stabiler Early-BPS-Anker',
      en: 'Stable early BPS anchor',
    },
    synergyHooks: {
      de: 'Profitiert von Erde-, Bewässerungs- und Early-Global-Upgrades.',
      en: 'Benefits from soil, irrigation, and early global upgrades.',
    },
    tier: 2,
    baseCost: 65,
    costFactor: 1.15,
    bps: 0.6,
    icon: itemIcons.planter,
    unlock: {
      totalBuds: 40,
    },
    milestoneThresholds: EARLY_MILESTONES,
    milestoneBonusMult: 1.17,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Erster echter Produktionssprung',
      en: 'First real production jump',
    },
    synergyHooks: {
      de: 'Kernstück für Indoor-, Licht- und CO₂-Synergien.',
      en: 'Core piece for indoor, light, and CO₂ synergies.',
    },
    tier: 3,
    baseCost: 420,
    costFactor: 1.17,
    bps: 3.8,
    icon: itemIcons.grow_tent,
    unlock: {
      totalBuds: 250,
    },
    milestoneThresholds: INDOOR_MILESTONES,
    milestoneBonusMult: 1.16,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Indoor-Verstärker',
      en: 'Indoor amplifier',
    },
    synergyHooks: {
      de: 'Verstärkt Zelte, CO₂ und spätere Buff-Strategien.',
      en: 'Amplifies tents, CO₂, and later buff strategies.',
    },
    tier: 4,
    baseCost: 1_500,
    costFactor: 1.18,
    bps: 11,
    icon: itemIcons.grow_light,
    unlock: {
      itemsOwned: { grow_tent: 2 },
    },
    milestoneThresholds: INDOOR_MILESTONES,
    milestoneBonusMult: 1.16,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Skaliert mit Breite und Gesamtanzahl',
      en: 'Scales with breadth and total ownership',
    },
    synergyHooks: {
      de: 'Wird durch Multi-Item-Meilensteine und Globalboni reaktiviert.',
      en: 'Reactivated by multi-item milestones and global bonuses.',
    },
    tier: 5,
    baseCost: 6_000,
    costFactor: 1.2,
    bps: 48,
    icon: itemIcons.cultivator,
    unlock: {
      totalBuds: 4_500,
    },
    milestoneThresholds: EARLY_MILESTONES,
    milestoneBonusMult: 1.15,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Infrastruktur und Kostenkontrolle',
      en: 'Infrastructure and cost control',
    },
    synergyHooks: {
      de: 'Öffnet Kostenreduktion für Planter, Hydro und Klima-Systeme.',
      en: 'Opens cost reduction for planters, hydro, and climate systems.',
    },
    tier: 6,
    baseCost: 28_000,
    costFactor: 1.215,
    bps: 240,
    icon: itemIcons.irrigation_system,
    unlock: {
      totalBuds: 20_000,
    },
    milestoneThresholds: INFRASTRUCTURE_MILESTONES,
    milestoneBonusMult: 1.15,
    softcapTier: 8,
    softcapMult: 1.08,
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
    role: {
      de: 'Buff- und Event-Verstärker',
      en: 'Buff and event amplifier',
    },
    synergyHooks: {
      de: 'Verbindet Zelte, Licht und Event-Rewards.',
      en: 'Connects tents, lights, and event rewards.',
    },
    tier: 7,
    baseCost: 120_000,
    costFactor: 1.235,
    bps: 1_100,
    icon: itemIcons.co2_tank,
    unlock: {
      totalBuds: 90_000,
    },
    milestoneThresholds: INFRASTRUCTURE_MILESTONES,
    milestoneBonusMult: 1.14,
    softcapTier: 8,
    softcapMult: 1.07,
    softcapCopies: 150,
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
    role: {
      de: 'Stabilisiert Buffs und Events',
      en: 'Stabilises buffs and events',
    },
    synergyHooks: {
      de: 'Verbessert CO₂-, Hydro- und Event-Setups.',
      en: 'Improves CO₂, hydro, and event setups.',
    },
    tier: 8,
    baseCost: 520_000,
    costFactor: 1.25,
    bps: 5_200,
    icon: itemIcons.climate_controller,
    unlock: {
      totalBuds: 400_000,
    },
    milestoneThresholds: INFRASTRUCTURE_MILESTONES,
    milestoneBonusMult: 1.14,
    softcapTier: 9,
    softcapMult: 1.07,
    softcapCopies: 150,
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
    role: {
      de: 'Hohe Produktion mit starken Schwellen',
      en: 'High production with strong thresholds',
    },
    synergyHooks: {
      de: 'Skaliert mit Bewässerung, Klima und 100+-Meilensteinen.',
      en: 'Scales with irrigation, climate, and 100+ milestones.',
    },
    tier: 9,
    baseCost: 2_500_000,
    costFactor: 1.265,
    bps: 28_000,
    icon: itemIcons.hydroponic_rack,
    unlock: {
      totalBuds: 2_000_000,
    },
    milestoneThresholds: LATE_MILESTONES,
    milestoneBonusMult: 1.14,
    softcapTier: 9,
    softcapMult: 1.07,
    softcapCopies: 150,
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
    role: {
      de: 'Research- und Seed-Synergien',
      en: 'Research and seed synergies',
    },
    synergyHooks: {
      de: 'Bereitet Seed-, Strain- und Prestige-Forschung vor.',
      en: 'Prepares seed, strain, and prestige research.',
    },
    tier: 10,
    baseCost: 12_000_000,
    costFactor: 1.28,
    bps: 160_000,
    icon: itemIcons.genetics_lab,
    unlock: {
      totalBuds: 9_000_000,
    },
    milestoneThresholds: LATE_MILESTONES,
    milestoneBonusMult: 1.13,
    softcapTier: 10,
    softcapMult: 1.06,
    softcapCopies: 150,
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
    role: {
      de: 'Automation und Auto-Click',
      en: 'Automation and auto-click',
    },
    synergyHooks: {
      de: 'Macht Klick-Multiplikatoren und Idle-Komfort langfristig relevant.',
      en: 'Keeps click multipliers and idle comfort relevant long-term.',
    },
    tier: 11,
    baseCost: 70_000_000,
    costFactor: 1.295,
    bps: 1_000_000,
    icon: itemIcons.trimming_robot,
    unlock: {
      totalBuds: 55_000_000,
    },
    milestoneThresholds: LATE_MILESTONES,
    milestoneBonusMult: 1.13,
    softcapTier: 10,
    softcapMult: 1.06,
    softcapCopies: 150,
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
    role: {
      de: 'Late-Game-Kompaktmultiplikator',
      en: 'Late-game compact multiplier',
    },
    synergyHooks: {
      de: 'Bündelt Klima, Genetik und Automation in starke Endgame-Boni.',
      en: 'Bundles climate, genetics, and automation into strong endgame bonuses.',
    },
    tier: 12,
    baseCost: 450_000_000,
    costFactor: 1.31,
    bps: 7_500_000,
    icon: itemIcons.micro_greenhouse,
    unlock: {
      totalBuds: 350_000_000,
    },
    milestoneThresholds: COMPACT_MILESTONES,
    milestoneBonusMult: 1.13,
    softcapTier: 10,
    softcapMult: 1.06,
    softcapCopies: 150,
    softcapPenalty: 0.92,
  },
];

type RawItemDefinition = (typeof ITEM_DATA)[number];

export type ItemId = RawItemDefinition['id'];

export interface UnlockCondition {
  totalBuds?: number;
  itemsOwned?: Partial<Record<ItemId, number>>;
}

export interface ItemDefinition {
  id: ItemId;
  name: Record<'de' | 'en', string>;
  description: Record<'de' | 'en', string>;
  role: Record<'de' | 'en', string>;
  synergyHooks: Record<'de' | 'en', string>;
  tier: number;
  baseCost: number;
  costFactor: number;
  bps: number;
  icon: string;
  unlock?: UnlockCondition;
  tierSize?: number;
  tierBonusMult?: number;
  milestoneThresholds?: readonly number[];
  milestoneBonusMult?: number;
  softcapTier?: number;
  softcapMult?: number;
  softcapCopies?: number;
  softcapPenalty?: number;
}

export const items: readonly ItemDefinition[] = ITEM_DATA;

export const itemById = new Map<ItemId, ItemDefinition>(items.map((item) => [item.id, item]));
