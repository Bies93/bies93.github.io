import { asset } from '../app/assets';

export type ResearchCostType = 'buds' | 'seeds';
export type ResearchEffectType =
  | 'BPC_MULT'
  | 'BPS_MULT'
  | 'COST_REDUCE_ALL'
  | 'CLICK_AUTOMATION'
  | 'ABILITY_OVERDRIVE_PLUS';

export interface ResearchEffect {
  type: ResearchEffectType;
  value?: number;
}

export interface ResearchNode {
  id: string;
  name: Record<'de' | 'en', string>;
  desc: Record<'de' | 'en', string>;
  costType: ResearchCostType;
  cost: number;
  requires?: string[];
  icon?: string;
  effects: ResearchEffect[];
}

export const researchNodes: ResearchNode[] = [
  {
    id: 'potency_metrics',
    name: {
      de: 'Potenz-Analysen',
      en: 'Potency Analytics',
    },
    desc: {
      de: 'Verfeinere deine Click-Technik für mehr Buds pro Klick.',
      en: 'Refine click techniques for more buds per click.',
    },
    costType: 'buds',
    cost: 25_000,
    icon: asset('icons/ui/ui-help.png'),
    effects: [
      { type: 'BPC_MULT', value: 1.5 },
    ],
  },
  {
    id: 'auto_harvest_protocol',
    name: {
      de: 'Auto-Harvest-Protokoll',
      en: 'Auto Harvest Protocol',
    },
    desc: {
      de: 'Automatisierte Helfer klicken jede Sekunde für dich.',
      en: 'Automated helpers trigger one harvest per second.',
    },
    costType: 'buds',
    cost: 120_000,
    requires: ['potency_metrics'],
    icon: asset('icons/ui/ui-settings.png'),
    effects: [
      { type: 'CLICK_AUTOMATION', value: 1 },
    ],
  },
  {
    id: 'yield_modulation',
    name: {
      de: 'Ertragsmodulation',
      en: 'Yield Modulation',
    },
    desc: {
      de: 'Optimierte Nährstoffe steigern alle Produktionen.',
      en: 'Optimised nutrients boost all productions.',
    },
    costType: 'seeds',
    cost: 5,
    requires: ['auto_harvest_protocol'],
    icon: asset('icons/ui/ui-save.png'),
    effects: [
      { type: 'BPS_MULT', value: 1.25 },
    ],
  },
  {
    id: 'supply_chain',
    name: {
      de: 'Supply-Chain-Optimierung',
      en: 'Supply Chain Optimisation',
    },
    desc: {
      de: 'Reduziert die Kosten aller Gebäude dank schlanker Prozesse.',
      en: 'Slim processes reduce all building costs.',
    },
    costType: 'seeds',
    cost: 10,
    requires: ['yield_modulation'],
    icon: asset('icons/ui/ui-export.png'),
    effects: [
      { type: 'COST_REDUCE_ALL', value: 0.9 },
    ],
  },
  {
    id: 'overdrive_blueprints',
    name: {
      de: 'Overdrive-Blaupausen',
      en: 'Overdrive Blueprints',
    },
    desc: {
      de: 'Verbessert die Overdrive-Fähigkeit mit längerer Laufzeit.',
      en: 'Improves the Overdrive ability with longer uptime.',
    },
    costType: 'seeds',
    cost: 18,
    requires: ['supply_chain'],
    icon: asset('icons/ui/ui-import.png'),
    effects: [
      { type: 'ABILITY_OVERDRIVE_PLUS', value: 1.5 },
    ],
  },
  {
    id: 'quantum_clicks',
    name: {
      de: 'Quantenklicks',
      en: 'Quantum Clicks',
    },
    desc: {
      de: 'Verdoppelt dauerhaft deine Klickproduktion.',
      en: 'Doubles your click production permanently.',
    },
    costType: 'seeds',
    cost: 30,
    requires: ['overdrive_blueprints'],
    icon: asset('icons/ui/ui-reset.png'),
    effects: [
      { type: 'BPC_MULT', value: 2 },
    ],
  },
];

export const researchById = new Map(researchNodes.map((node) => [node.id, node] as const));
