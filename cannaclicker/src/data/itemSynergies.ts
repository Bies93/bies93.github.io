import type { LocaleKey } from '../app/i18n';
import type { ItemId } from './items';

export interface ItemSynergyDefinition {
  id: string;
  source: ItemId;
  targets: readonly ItemId[];
  perSource: number;
  bonusPerStack: number;
  maxStacks: number;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
}

export const itemSynergies: readonly ItemSynergyDefinition[] = [
  {
    id: 'seedling_cultivator_mass',
    source: 'seedling',
    targets: ['cultivator', 'trimming_robot'],
    perSource: 50,
    bonusPerStack: 0.025,
    maxStacks: 12,
    name: { de: 'Massenpflege', en: 'Mass Care' },
    description: {
      de: 'Viele Keimlinge machen Gärtner und Trimm-Roboter effizienter.',
      en: 'Large seedling batches make cultivators and trimming robots more efficient.',
    },
  },
  {
    id: 'planter_irrigation_roots',
    source: 'irrigation_system',
    targets: ['planter', 'seedling'],
    perSource: 12,
    bonusPerStack: 0.035,
    maxStacks: 10,
    name: { de: 'Wurzelnetz', en: 'Root Network' },
    description: {
      de: 'Bewässerung stabilisiert die frühe Massenproduktion.',
      en: 'Irrigation stabilises early mass production.',
    },
  },
  {
    id: 'tent_light_indoor',
    source: 'grow_light',
    targets: ['grow_tent'],
    perSource: 10,
    bonusPerStack: 0.05,
    maxStacks: 10,
    name: { de: 'Indoor-Fokus', en: 'Indoor Focus' },
    description: {
      de: 'LED-Lichter machen Grow-Zelte zu einem frühen Produktionssprung.',
      en: 'Grow lights turn tents into a clear early production jump.',
    },
  },
  {
    id: 'co2_full_spectrum',
    source: 'co2_tank',
    targets: ['grow_light', 'grow_tent'],
    perSource: 8,
    bonusPerStack: 0.045,
    maxStacks: 10,
    name: { de: 'Vollspektrum-Druck', en: 'Full Spectrum Pressure' },
    description: {
      de: 'CO2-Tanks verstärken die Indoor-Kette.',
      en: 'CO2 tanks amplify the indoor chain.',
    },
  },
  {
    id: 'climate_co2_stability',
    source: 'climate_controller',
    targets: ['co2_tank'],
    perSource: 8,
    bonusPerStack: 0.05,
    maxStacks: 9,
    name: { de: 'Stabile Atmosphäre', en: 'Stable Atmosphere' },
    description: {
      de: 'Klimakontrolle macht CO2-Boni planbarer.',
      en: 'Climate control makes CO2 bonuses more reliable.',
    },
  },
  {
    id: 'hydro_irrigation_loop',
    source: 'irrigation_system',
    targets: ['hydroponic_rack'],
    perSource: 20,
    bonusPerStack: 0.045,
    maxStacks: 10,
    name: { de: 'Hydro-Kreislauf', en: 'Hydro Loop' },
    description: {
      de: 'Breite Bewässerung gibt Hydro-Racks ihren Skalierungsraum.',
      en: 'Broad irrigation gives hydro racks room to scale.',
    },
  },
  {
    id: 'genetics_seedling_library',
    source: 'genetics_lab',
    targets: ['seedling', 'planter'],
    perSource: 5,
    bonusPerStack: 0.025,
    maxStacks: 12,
    name: { de: 'Sortenbibliothek', en: 'Strain Library' },
    description: {
      de: 'Labore reaktivieren frühe Items über bessere Sortierung.',
      en: 'Labs reactivate early items through better sorting.',
    },
  },
  {
    id: 'robot_cultivator_shift',
    source: 'trimming_robot',
    targets: ['cultivator'],
    perSource: 5,
    bonusPerStack: 0.04,
    maxStacks: 10,
    name: { de: 'Schichtbetrieb', en: 'Shift Work' },
    description: {
      de: 'Roboter übernehmen Routine und lassen Gärtner breiter skalieren.',
      en: 'Robots take over routine work and let cultivators scale wider.',
    },
  },
  {
    id: 'lab_robot_pipeline',
    source: 'genetics_lab',
    targets: ['trimming_robot'],
    perSource: 6,
    bonusPerStack: 0.035,
    maxStacks: 9,
    name: { de: 'Labor-Pipeline', en: 'Lab Pipeline' },
    description: {
      de: 'Forschung füttert Automation mit besseren Prioritäten.',
      en: 'Research feeds automation with better priorities.',
    },
  },
  {
    id: 'micro_climate_matrix',
    source: 'micro_greenhouse',
    targets: ['climate_controller', 'genetics_lab', 'hydroponic_rack'],
    perSource: 3,
    bonusPerStack: 0.055,
    maxStacks: 10,
    name: { de: 'Mikroklima-Matrix', en: 'Microclimate Matrix' },
    description: {
      de: 'Mikro-Gewächshäuser bündeln späte Systeme in kompakte Multiplikatoren.',
      en: 'Micro greenhouses bundle late systems into compact multipliers.',
    },
  },
  {
    id: 'hydro_climate_balance',
    source: 'climate_controller',
    targets: ['hydroponic_rack'],
    perSource: 10,
    bonusPerStack: 0.04,
    maxStacks: 10,
    name: { de: 'Hydro-Balance', en: 'Hydro Balance' },
    description: {
      de: 'Klima-Controller glätten die hohen Hydro-Schwellen.',
      en: 'Climate controllers smooth the high hydro thresholds.',
    },
  },
  {
    id: 'robot_micro_compression',
    source: 'trimming_robot',
    targets: ['micro_greenhouse'],
    perSource: 4,
    bonusPerStack: 0.045,
    maxStacks: 8,
    name: { de: 'Kompakt-Automation', en: 'Compact Automation' },
    description: {
      de: 'Trimm-Roboter halten kompakte Late-Game-Setups effizient.',
      en: 'Trimming robots keep compact late-game setups efficient.',
    },
  },
];
