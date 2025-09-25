import { asset } from "../app/assets";
import type { ItemId } from "./items";

export type ResearchCostType = "buds" | "seeds";

export type ResearchPath = "efficiency" | "control" | "strain";

export type StrainId = "indica" | "sativa" | "hybrid";

export type EffectId =
  | "BPC_MULT"
  | "BPS_MULT"
  | "COST_REDUCE_ALL"
  | "CLICK_AUTOMATION"
  | "ABILITY_OVERDRIVE_PLUS"
  | "BUILDING_MULT"
  | "OFFLINE_CAP_HOURS_ADD"
  | "ABILITY_DURATION_MULT"
  | "HYBRID_BUFF_PER_ACTIVE"
  | "STRAIN_CHOICE"
  | "SEED_CLICK_BONUS"
  | "SEED_PASSIVE";

export type ResearchUnlockCondition =
  | { type: "total_buds"; value: number }
  | { type: "prestige_seeds"; value: number };

export interface ResearchEffect {
  id: EffectId;
  v?: number;
  targets?: readonly ItemId[];
  labelKey?: string;
  strain?: StrainId;
  seedPassive?: {
    intervalMinutes: number;
    chance: number;
    seeds: number;
  };
}

interface ResearchNodeSpec {
  id: string;
  path: ResearchPath;
  order: number;
  name: Record<"de" | "en", string>;
  desc: Record<"de" | "en", string>;
  costType: ResearchCostType;
  cost: number;
  requires?: readonly string[];
  unlockAll?: readonly ResearchUnlockCondition[];
  unlockAny?: readonly ResearchUnlockCondition[];
  exclusiveGroup?: string;
  confirmKey?: string;
  resetsOnPrestige?: boolean;
  effects: readonly ResearchEffect[];
  icon?: string;
}

const EFFICIENCY_RESEARCH = [
  {
    id: "r_eff_foundation",
    path: "efficiency",
    order: 1,
    name: {
      de: "Grundoptimierung",
      en: "Baseline Optimisation",
    },
    desc: {
      de: "Globale Produktion dauerhaft +20 %. Solide Grundlage fuer AFK-Phasen.",
      en: "Permanently boosts global production by 20%. Reliable AFK backbone.",
    },
    costType: "buds",
    cost: 1_500,
    effects: [{ id: "BPS_MULT", v: 1.2 }],
    icon: asset("icons/research/research-growth.png"),
  },
  {
    id: "r_eff_flow",
    path: "efficiency",
    order: 2,
    name: {
      de: "Durchsatzplanung",
      en: "Throughput Planning",
    },
    desc: {
      de: "Produktionslinien +12 %. Stapelt multiplikativ.",
      en: "Production lines +12%. Stacks multiplicatively.",
    },
    costType: "buds",
    cost: 12_000,
    requires: ["r_eff_foundation"],
    effects: [{ id: "BPS_MULT", v: 1.12 }],
    icon: asset("icons/research/research-click.png"),
  },
  {
    id: "r_eff_synergy",
    path: "efficiency",
    order: 3,
    name: {
      de: "Hydro × Irrigation",
      en: "Hydro × Irrigation",
    },
    desc: {
      de: "Hydroponik-Racks & Bewaesserungssysteme +15 % Basisleistung.",
      en: "Hydroponic racks & irrigation systems +15% base output.",
    },
    costType: "buds",
    cost: 85_000,
    requires: ["r_eff_flow"],
    effects: [
      {
        id: "BUILDING_MULT",
        v: 1.15,
        targets: ["hydroponic_rack", "irrigation_system"],
        labelKey: "research.effect.hydroIrrigation",
      },
    ],
    icon: asset("icons/research/research-costcut.png"),
  },
  {
    id: "r_eff_recirc",
    path: "efficiency",
    order: 4,
    name: {
      de: "Naehrstoffkreislauf",
      en: "Nutrient Recirculation",
    },
    desc: {
      de: "Globale Produktion +18 %. Verlaessliche Skalierung fuer grosse Setups.",
      en: "Global production +18%. Reliable scaling for large setups.",
    },
    costType: "buds",
    cost: 420_000,
    requires: ["r_eff_synergy"],
    effects: [{ id: "BPS_MULT", v: 1.18 }],
    icon: asset("icons/research/research-autoclick.png"),
  },
  {
    id: "r_eff_genetics",
    path: "efficiency",
    order: 5,
    name: {
      de: "Genetisches Tuning",
      en: "Genetic Tuning",
    },
    desc: {
      de: "Globale Produktion +35 %. Kostet Seeds, stapelt mit allen Boosts.",
      en: "Global production +35%. Costs seeds and multiplies with all boosts.",
    },
    costType: "seeds",
    cost: 8,
    requires: ["r_eff_recirc"],
    effects: [{ id: "BPS_MULT", v: 1.35 }],
    icon: asset("icons/research/research-overdrive-plus.png"),
  },
  {
    id: "r_eff_seed_focus",
    path: "efficiency",
    order: 6,
    name: {
      de: "Seed-Fokussierung",
      en: "Seed Focussing",
    },
    desc: {
      de: "Klicks haben +2 Prozentpunkte Chance auf einen Seed.",
      en: "Clicks gain +2 percentage points chance to drop a seed.",
    },
    costType: "seeds",
    cost: 3,
    requires: ["r_eff_genetics"],
    effects: [{ id: "SEED_CLICK_BONUS", v: 0.02 }],
    icon: asset("icons/research/research-click.png"),
  },
] as const satisfies readonly ResearchNodeSpec[];

const CONTROL_RESEARCH = [
  {
    id: "r_ctrl_tuning",
    path: "control",
    order: 1,
    name: {
      de: "Feinjustage",
      en: "Fine Tuning",
    },
    desc: {
      de: "Alle Gebaeudekosten −5 %. Wirkt auf jede Kaufstufe.",
      en: "All building prices −5%. Applies to every purchase.",
    },
    costType: "buds",
    cost: 9_000,
    effects: [{ id: "COST_REDUCE_ALL", v: 0.95 }],
    icon: asset("icons/research/research-costcut.png"),
  },
  {
    id: "r_ctrl_routines",
    path: "control",
    order: 2,
    name: {
      de: "Routineplanung",
      en: "Routine Planning",
    },
    desc: {
      de: "Automatisiert +2 Klicks pro Sekunde. Stapelt mit Upgrades.",
      en: "Automates +2 clicks each second. Stacks with upgrades.",
    },
    costType: "buds",
    cost: 70_000,
    requires: ["r_ctrl_tuning"],
    effects: [{ id: "CLICK_AUTOMATION", v: 2 }],
    icon: asset("icons/research/research-autoclick.png"),
  },
  {
    id: "r_ctrl_time1",
    path: "control",
    order: 3,
    name: {
      de: "Zeitmanagement I",
      en: "Time Management I",
    },
    desc: {
      de: "Offline-Cap +4 Stunden. Kombinierbar mit weiteren Boni.",
      en: "Offline cap +4 hours. Combines with other bonuses.",
    },
    costType: "buds",
    cost: 180_000,
    requires: ["r_ctrl_routines"],
    effects: [{ id: "OFFLINE_CAP_HOURS_ADD", v: 4 }],
    icon: asset("icons/research/research-growth.png"),
  },
  {
    id: "r_ctrl_time2",
    path: "control",
    order: 4,
    name: {
      de: "Zeitmanagement II",
      en: "Time Management II",
    },
    desc: {
      de: "Offline-Cap zusaetzlich +8 Stunden. Addiert sich zu vorherigen Effekten.",
      en: "Offline cap gains another +8 hours. Adds to previous effects.",
    },
    costType: "seeds",
    cost: 3,
    requires: ["r_ctrl_time1"],
    effects: [{ id: "OFFLINE_CAP_HOURS_ADD", v: 8 }],
    icon: asset("icons/research/research-growth.png"),
  },
  {
    id: "r_ctrl_energy",
    path: "control",
    order: 5,
    name: {
      de: "Energieeffizienz",
      en: "Energy Efficiency",
    },
    desc: {
      de: "Aktive Skills dauern +25 %. Perfekt fuer geplante Aktivphasen.",
      en: "Active skills last 25% longer. Perfect for scheduled bursts.",
    },
    costType: "seeds",
    cost: 4,
    requires: ["r_ctrl_time1"],
    effects: [{ id: "ABILITY_DURATION_MULT", v: 1.25 }],
    icon: asset("icons/research/research-overdrive-plus.png"),
  },
  {
    id: "r_ctrl_seed_drive",
    path: "control",
    order: 6,
    name: {
      de: "Seed-Tuning",
      en: "Seed Drive",
    },
    desc: {
      de: "Klick-Samenchance +3 Prozentpunkte.",
      en: "Click seed chance +3 percentage points.",
    },
    costType: "seeds",
    cost: 4,
    requires: ["r_ctrl_energy"],
    effects: [{ id: "SEED_CLICK_BONUS", v: 0.03 }],
    icon: asset("icons/research/research-autoclick.png"),
  },
  {
    id: "r_ctrl_lab_auto1",
    path: "control",
    order: 7,
    name: {
      de: "Labor-Autokollektor I",
      en: "Lab Autocollector I",
    },
    desc: {
      de: "Nach 5 Minuten Idle: 25 % Chance auf 1 Seed.",
      en: "After 5 minutes idle: 25% chance to collect 1 seed.",
    },
    costType: "seeds",
    cost: 5,
    requires: ["r_ctrl_seed_drive"],
    effects: [
      {
        id: "SEED_PASSIVE",
        seedPassive: { intervalMinutes: 5, chance: 0.25, seeds: 1 },
      },
    ],
    icon: asset("icons/research/research-growth.png"),
  },
  {
    id: "r_ctrl_lab_auto2",
    path: "control",
    order: 8,
    name: {
      de: "Labor-Autokollektor II",
      en: "Lab Autocollector II",
    },
    desc: {
      de: "Nach 4 Minuten Idle: 45 % Chance auf 1 Seed.",
      en: "After 4 minutes idle: 45% chance to collect 1 seed.",
    },
    costType: "seeds",
    cost: 7,
    requires: ["r_ctrl_lab_auto1"],
    effects: [
      {
        id: "SEED_PASSIVE",
        seedPassive: { intervalMinutes: 4, chance: 0.45, seeds: 1 },
      },
    ],
    icon: asset("icons/research/research-overdrive-plus.png"),
  },
] as const satisfies readonly ResearchNodeSpec[];

const STRAIN_RESEARCH = [
  {
    id: "r_strain_lab",
    path: "strain",
    order: 1,
    name: {
      de: "Strain-Labor",
      en: "Strain Lab",
    },
    desc: {
      de: "Schaltet spezialisierte Strains frei. Erfordert Midgame-Fortschritt oder Seeds.",
      en: "Unlocks specialised strains. Requires mid-game progress or seeds.",
    },
    costType: "buds",
    cost: 750_000,
    unlockAny: [
      { type: "total_buds", value: 3_000_000 },
      { type: "prestige_seeds", value: 1 },
    ],
    effects: [],
    icon: asset("icons/research/research-click.png"),
  },
  {
    id: "r_strain_indica",
    path: "strain",
    order: 2,
    name: {
      de: "Indica",
      en: "Indica",
    },
    desc: {
      de: "+25 % BPS, aber −15 % BPC. Gilt bis zum naechsten Prestige.",
      en: "+25% BPS, but −15% BPC. Holds until the next prestige.",
    },
    costType: "seeds",
    cost: 2,
    requires: ["r_strain_lab"],
    exclusiveGroup: "strain",
    confirmKey: "research.confirm.strain",
    resetsOnPrestige: true,
    effects: [
      { id: "BPS_MULT", v: 1.25 },
      { id: "BPC_MULT", v: 0.85 },
      { id: "STRAIN_CHOICE", strain: "indica", labelKey: "research.effect.strain.indica" },
    ],
    icon: asset("icons/research/research-growth.png"),
  },
  {
    id: "r_strain_sativa",
    path: "strain",
    order: 3,
    name: {
      de: "Sativa",
      en: "Sativa",
    },
    desc: {
      de: "+60 % BPC, aber −10 % BPS. Ideal fuer aktive Runs.",
      en: "+60% BPC, but −10% BPS. Ideal for active runs.",
    },
    costType: "seeds",
    cost: 2,
    requires: ["r_strain_lab"],
    exclusiveGroup: "strain",
    confirmKey: "research.confirm.strain",
    resetsOnPrestige: true,
    effects: [
      { id: "BPC_MULT", v: 1.6 },
      { id: "BPS_MULT", v: 0.9 },
      { id: "STRAIN_CHOICE", strain: "sativa", labelKey: "research.effect.strain.sativa" },
    ],
    icon: asset("icons/research/research-click.png"),
  },
  {
    id: "r_strain_hybrid",
    path: "strain",
    order: 4,
    name: {
      de: "Hybrid",
      en: "Hybrid",
    },
    desc: {
      de: "+10 % BPS und BPC, +1 % pro aktivem temporaeren Buff.",
      en: "+10% BPS and BPC, +1% per active temporary buff.",
    },
    costType: "seeds",
    cost: 3,
    requires: ["r_strain_lab"],
    exclusiveGroup: "strain",
    confirmKey: "research.confirm.strain",
    resetsOnPrestige: true,
    effects: [
      { id: "BPS_MULT", v: 1.1 },
      { id: "BPC_MULT", v: 1.1 },
      { id: "HYBRID_BUFF_PER_ACTIVE", v: 0.01, labelKey: "research.effect.hybridBuff" },
      { id: "STRAIN_CHOICE", strain: "hybrid", labelKey: "research.effect.strain.hybrid" },
    ],
    icon: asset("icons/research/research-overdrive-plus.png"),
  },
] as const satisfies readonly ResearchNodeSpec[];

const RESEARCH_ENTRIES = [
  ...EFFICIENCY_RESEARCH,
  ...CONTROL_RESEARCH,
  ...STRAIN_RESEARCH,
] as const;

type RawResearchNode = (typeof RESEARCH_ENTRIES)[number];

export type ResearchId = RawResearchNode["id"];

export type ResearchNode = RawResearchNode & {
  id: ResearchId;
  requires?: readonly ResearchId[];
  unlockAll?: readonly ResearchUnlockCondition[];
  unlockAny?: readonly ResearchUnlockCondition[];
};

export const RESEARCH_PATHS: Record<ResearchPath, readonly ResearchNode[]> = {
  efficiency: EFFICIENCY_RESEARCH,
  control: CONTROL_RESEARCH,
  strain: STRAIN_RESEARCH,
};

const PATH_ORDER: Record<ResearchPath, number> = {
  efficiency: 0,
  control: 1,
  strain: 2,
};

export const RESEARCH: readonly ResearchNode[] = [...RESEARCH_ENTRIES].sort((a, b) => {
  const pathDiff = PATH_ORDER[a.path] - PATH_ORDER[b.path];
  if (pathDiff !== 0) {
    return pathDiff;
  }

  return a.order - b.order;
});

export const researchById = new Map<ResearchId, ResearchNode>(
  RESEARCH.map((node) => [node.id, node]),
);

