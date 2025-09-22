import type { LocaleKey } from "../app/i18n";

export type MilestoneRequirement =
  | { type: "unique_buildings"; count: number }
  | { type: "buildings_at_least"; count: number; amount: number }
  | { type: "any_building_at_least"; amount: number }
  | { type: "unlocked_and_any_at_least"; amount: number };

export type MilestoneBonusType = "global" | "bps" | "bpc";

export interface MilestoneBonus {
  type: MilestoneBonusType;
  value: number;
}

export interface MilestoneDefinition {
  id: string;
  order: number;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  rewardSummary: Record<LocaleKey, string>;
  requirement: MilestoneRequirement;
  bonuses: MilestoneBonus[];
  kickstartLevel?: number;
}

export const milestones: MilestoneDefinition[] = [
  {
    id: "m1",
    order: 1,
    name: {
      de: "Erste Vielfalt",
      en: "First Variety",
    },
    description: {
      de: "Kaufe 3 verschiedene Gebäude.",
      en: "Purchase 3 different buildings.",
    },
    rewardSummary: {
      de: "+5 % Gesamtproduktion",
      en: "+5% global production",
    },
    requirement: { type: "unique_buildings", count: 3 },
    bonuses: [{ type: "global", value: 0.05 }],
  },
  {
    id: "m2",
    order: 2,
    name: {
      de: "Grundausbau",
      en: "Base Expansion",
    },
    description: {
      de: "5 Gebäude jeweils auf Stufe 10.",
      en: "Have 5 buildings at level 10 or higher.",
    },
    rewardSummary: {
      de: "+5 % BPC",
      en: "+5% BPC",
    },
    requirement: { type: "buildings_at_least", count: 5, amount: 10 },
    bonuses: [{ type: "bpc", value: 0.05 }],
  },
  {
    id: "m3",
    order: 3,
    name: {
      de: "Produktion läuft",
      en: "Production Running",
    },
    description: {
      de: "3 Gebäude jeweils auf Stufe 25.",
      en: "Have 3 buildings at level 25 or higher.",
    },
    rewardSummary: {
      de: "+8 % BPS",
      en: "+8% BPS",
    },
    requirement: { type: "buildings_at_least", count: 3, amount: 25 },
    bonuses: [{ type: "bps", value: 0.08 }],
  },
  {
    id: "m4",
    order: 4,
    name: {
      de: "Erste Tiefe",
      en: "First Depth",
    },
    description: {
      de: "Ein Gebäude auf Stufe 50.",
      en: "Own any building at level 50.",
    },
    rewardSummary: {
      de: "+10 % Gesamtproduktion",
      en: "+10% global production",
    },
    requirement: { type: "any_building_at_least", amount: 50 },
    bonuses: [{ type: "global", value: 0.1 }],
  },
  {
    id: "m5",
    order: 5,
    name: {
      de: "Halbzeit",
      en: "Halftime",
    },
    description: {
      de: "Zwei Gebäude auf Stufe 50.",
      en: "Have 2 buildings at level 50 or higher.",
    },
    rewardSummary: {
      de: "+10 % Gesamtproduktion · Kickstart L1",
      en: "+10% global production · Kickstart L1",
    },
    requirement: { type: "buildings_at_least", count: 2, amount: 50 },
    bonuses: [{ type: "global", value: 0.1 }],
    kickstartLevel: 1,
  },
  {
    id: "m6",
    order: 6,
    name: {
      de: "Skalierung",
      en: "Scaling Up",
    },
    description: {
      de: "5 Gebäude auf Stufe 50.",
      en: "Have 5 buildings at level 50 or higher.",
    },
    rewardSummary: {
      de: "+10 % BPS · Kickstart L2",
      en: "+10% BPS · Kickstart L2",
    },
    requirement: { type: "buildings_at_least", count: 5, amount: 50 },
    bonuses: [{ type: "bps", value: 0.1 }],
    kickstartLevel: 2,
  },
  {
    id: "m7",
    order: 7,
    name: {
      de: "Spezialisierung",
      en: "Specialisation",
    },
    description: {
      de: "Ein Gebäude auf Stufe 100.",
      en: "Own any building at level 100.",
    },
    rewardSummary: {
      de: "+12 % Gesamtproduktion · Kickstart L3",
      en: "+12% global production · Kickstart L3",
    },
    requirement: { type: "any_building_at_least", amount: 100 },
    bonuses: [{ type: "global", value: 0.12 }],
    kickstartLevel: 3,
  },
  {
    id: "m8",
    order: 8,
    name: {
      de: "Großbetrieb",
      en: "Large Operation",
    },
    description: {
      de: "Drei Gebäude auf Stufe 100.",
      en: "Have 3 buildings at level 100 or higher.",
    },
    rewardSummary: {
      de: "+12 % BPS · Kickstart L4",
      en: "+12% BPS · Kickstart L4",
    },
    requirement: { type: "buildings_at_least", count: 3, amount: 100 },
    bonuses: [{ type: "bps", value: 0.12 }],
    kickstartLevel: 4,
  },
  {
    id: "m9",
    order: 9,
    name: {
      de: "Industrie",
      en: "Industrial Scale",
    },
    description: {
      de: "Ein Gebäude auf Stufe 150.",
      en: "Own any building at level 150.",
    },
    rewardSummary: {
      de: "+15 % Gesamtproduktion · Kickstart L5",
      en: "+15% global production · Kickstart L5",
    },
    requirement: { type: "any_building_at_least", amount: 150 },
    bonuses: [{ type: "global", value: 0.15 }],
    kickstartLevel: 5,
  },
  {
    id: "m10",
    order: 10,
    name: {
      de: "Endausbau",
      en: "Final Buildout",
    },
    description: {
      de: "Alle Gebäude freigeschaltet und ein Gebäude auf Stufe 200.",
      en: "Unlock every building and own one at level 200.",
    },
    rewardSummary: {
      de: "+15 % BPS · Kickstart L6",
      en: "+15% BPS · Kickstart L6",
    },
    requirement: { type: "unlocked_and_any_at_least", amount: 200 },
    bonuses: [{ type: "bps", value: 0.15 }],
    kickstartLevel: 6,
  },
];

export const milestoneById = new Map(milestones.map((milestone) => [milestone.id, milestone]));
