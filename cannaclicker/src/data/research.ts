import { asset } from "../app/assets";

export type ResearchCostType = "buds" | "seeds";

export type EffectId =
  | "BPC_MULT"
  | "BPS_MULT"
  | "COST_REDUCE_ALL"
  | "CLICK_AUTOMATION"
  | "ABILITY_OVERDRIVE_PLUS";

export interface ResearchEffect {
  id: EffectId;
  v: number;
}

export interface ResearchNode {
  id: string;
  name: Record<"de" | "en", string>;
  desc: Record<"de" | "en", string>;
  costType: ResearchCostType;
  cost: number;
  requires?: string[];
  effects: ResearchEffect[];
  icon?: string;
}

export const RESEARCH: ResearchNode[] = [
  {
    id: "r_start_click",
    name: {
      de: "Saubere Schnitte",
      en: "Clean Cuts",
    },
    desc: {
      de: "Verbessert die Klick-Effizienz leicht.",
      en: "Slightly improves click efficiency.",
    },
    costType: "buds",
    cost: 1_000,
    effects: [{ id: "BPC_MULT", v: 1.2 }],
    icon: asset("icons/ui/ui-help.png"),
  },
  {
    id: "r_growth",
    name: {
      de: "Optimierte Bewaesserung",
      en: "Optimised Irrigation",
    },
    desc: {
      de: "Erhoeht die Produktion ein wenig.",
      en: "Gently raises overall production.",
    },
    costType: "seeds",
    cost: 2,
    requires: ["r_start_click"],
    effects: [{ id: "BPS_MULT", v: 1.15 }],
    icon: asset("icons/ui/ui-save.png"),
  },
  {
    id: "r_costcut",
    name: {
      de: "Grosshandel",
      en: "Bulk Deals",
    },
    desc: {
      de: "Reduziert die Kosten aller Kaeufe leicht.",
      en: "Slightly lowers all purchase costs.",
    },
    costType: "buds",
    cost: 25_000,
    requires: ["r_start_click"],
    effects: [{ id: "COST_REDUCE_ALL", v: 0.97 }],
    icon: asset("icons/ui/ui-export.png"),
  },
  {
    id: "r_autoclick",
    name: {
      de: "Zeitschaltuhr",
      en: "Timer Switch",
    },
    desc: {
      de: "Automatische Klicks pro Sekunde.",
      en: "Adds automatic clicks each second.",
    },
    costType: "seeds",
    cost: 5,
    requires: ["r_growth"],
    effects: [{ id: "CLICK_AUTOMATION", v: 2 }],
    icon: asset("icons/ui/ui-import.png"),
  },
  {
    id: "r_overdrive_plus",
    name: {
      de: "Leistungsregler",
      en: "Power Regulator",
    },
    desc: {
      de: "Overdrive wird um 20 % staerker.",
      en: "Overdrive becomes 20% stronger.",
    },
    costType: "seeds",
    cost: 3,
    requires: ["r_growth"],
    effects: [{ id: "ABILITY_OVERDRIVE_PLUS", v: 0.2 }],
    icon: asset("icons/ui/ui-reset.png"),
  },
];

export const researchById = new Map(RESEARCH.map((node) => [node.id, node] as const));
