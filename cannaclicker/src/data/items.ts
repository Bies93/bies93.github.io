export interface UnlockCondition {
  totalBuds?: number;
  itemsOwned?: Record<string, number>;
}

export interface ItemDefinition {
  id: string;
  name: Record<'de' | 'en', string>;
  description: Record<'de' | 'en', string>;
  baseCost: number;
  costFactor: number;
  bps: number;
  icon: string;
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
      de: 'Dein erster Keimling steckt voller Potenzial.',
      en: 'Your first sprout brimming with promise.',
    },
    baseCost: 15,
    costFactor: 1.15,
    bps: 0.1,
    icon: '??',
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
    baseCost: 100,
    costFactor: 1.17,
    bps: 1,
    icon: '??',
    unlock: {
      totalBuds: 50,
    },
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
    baseCost: 1100,
    costFactor: 1.2,
    bps: 8,
    icon: '?',
    unlock: {
      totalBuds: 500,
    },
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
    baseCost: 12000,
    costFactor: 1.25,
    bps: 47,
    icon: '??',
    unlock: {
      itemsOwned: { grow_tent: 5 },
    },
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
    baseCost: 130000,
    costFactor: 1.3,
    bps: 260,
    icon: '?????',
    unlock: {
      totalBuds: 75000,
    },
  },
];

export const itemById = new Map(items.map((item) => [item.id, item] as const));