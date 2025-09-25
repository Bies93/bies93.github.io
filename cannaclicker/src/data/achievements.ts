import { asset } from "../app/assets";

import type { ItemId } from "./items";

const ACHIEVEMENT_DATA = [
  {
    id: 'seedling_10',
    overlayIcon: asset('achievements/badge-overlay-leaf.png'),
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
    overlayIcon: asset('achievements/badge-overlay-pot.png'),
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
    overlayIcon: asset('achievements/badge-overlay-light.png'),
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

type RawAchievementDefinition = (typeof ACHIEVEMENT_DATA)[number];

export type AchievementId = RawAchievementDefinition["id"];

export interface AchievementRequirement {
  totalBuds?: number;
  itemsOwned?: Partial<Record<ItemId, number>>;
}

export type AchievementDefinition = RawAchievementDefinition & {
  requirement: AchievementRequirement;
};

export const achievements: readonly AchievementDefinition[] = ACHIEVEMENT_DATA;

export const achievementById = new Map<AchievementId, AchievementDefinition>(
  achievements.map((entry) => [entry.id, entry]),
);


