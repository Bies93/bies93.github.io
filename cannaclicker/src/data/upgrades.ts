import type { LocaleKey } from '../app/i18n';

export type UpgradeKind = 'global' | 'click' | 'building';

export interface UpgradeRequirement {
  totalBuds?: number;
  itemsOwned?: Record<string, number>;
}

export interface UpgradeDefinition {
  id: string;
  kind: UpgradeKind;
  appliesTo?: string;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  cost: number;
  multiplier: number;
  requirement?: UpgradeRequirement;
}

export const upgrades: UpgradeDefinition[] = [
  {
    id: 'rich_soil',
    kind: 'global',
    name: {
      de: 'Reiche Erde',
      en: 'Rich Soil',
    },
    description: {
      de: 'Globale Produktion +25 %',
      en: 'Global production +25%',
    },
    cost: 2500,
    multiplier: 1.25,
    requirement: {
      totalBuds: 2000,
    },
  },
  {
    id: 'precision_trim',
    kind: 'click',
    name: {
      de: 'Präziser Trim',
      en: 'Precision Trim',
    },
    description: {
      de: 'Buds pro Klick verdoppelt.',
      en: 'Doubles buds per click.',
    },
    cost: 15000,
    multiplier: 2,
    requirement: {
      totalBuds: 10000,
    },
  },
  {
    id: 'grow_light_lenses',
    kind: 'building',
    appliesTo: 'grow_light',
    name: {
      de: 'Prismatische Linsen',
      en: 'Prismatic Lenses',
    },
    description: {
      de: 'LED-Lichter produzieren 2× Buds.',
      en: 'Grow lights produce 2× buds.',
    },
    cost: 80000,
    multiplier: 2,
    requirement: {
      itemsOwned: { grow_light: 10 },
    },
  },
];

export const upgradeById = new Map(upgrades.map((upgrade) => [upgrade.id, upgrade] as const));