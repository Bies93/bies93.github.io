import type { LocaleKey } from '../app/i18n';

export interface AchievementRequirement {
  totalBuds?: number;
  itemsOwned?: Record<string, number>;
}

export interface AchievementDefinition {
  id: string;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  icon: string;
  requirement: AchievementRequirement;
  rewardMultiplier?: number;
}

export const achievements: AchievementDefinition[] = [
  {
    id: 'seedling_10',
    icon: '??',
    name: {
      de: 'Keimstarter',
      en: 'Seed Starter',
    },
    description: {
      de: 'Besitze 10 Keimlinge.',
      en: 'Own 10 seedlings.',
    },
    requirement: {
      itemsOwned: { seedling: 10 },
    },
    rewardMultiplier: 1.02,
  },
  {
    id: 'planter_25',
    icon: '??',
    name: {
      de: 'Topfmeister',
      en: 'Pot Master',
    },
    description: {
      de: 'Besitze 25 Töpfe.',
      en: 'Own 25 planters.',
    },
    requirement: {
      itemsOwned: { planter: 25 },
    },
    rewardMultiplier: 1.03,
  },
  {
    id: 'harvest_1m',
    icon: '??',
    name: {
      de: 'Ernteprofi',
      en: 'Harvest Hero',
    },
    description: {
      de: 'Ernte insgesamt 1 Million Buds.',
      en: 'Harvest a total of 1 million buds.',
    },
    requirement: {
      totalBuds: 1_000_000,
    },
    rewardMultiplier: 1.05,
  },
];

export const achievementById = new Map(achievements.map((entry) => [entry.id, entry] as const));