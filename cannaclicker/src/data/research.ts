import { researchIcons } from '../app/assetManifest';
import type { ItemId } from './items';

export type ResearchCostType = 'buds' | 'seeds' | 'ascension';

export type ResearchPath =
  | 'efficiency'
  | 'active'
  | 'automation'
  | 'events'
  | 'genetics'
  | 'economy'
  | 'prestige';

export type ResearchClass = 'run' | 'permanent' | 'strain';

export type StrainId = 'indica' | 'sativa' | 'hybrid';

export type EffectId =
  | 'BPC_MULT'
  | 'BPS_MULT'
  | 'COST_REDUCE_ALL'
  | 'CLICK_AUTOMATION'
  | 'ABILITY_OVERDRIVE_PLUS'
  | 'BUILDING_MULT'
  | 'OFFLINE_CAP_HOURS_ADD'
  | 'ABILITY_DURATION_MULT'
  | 'HYBRID_BUFF_PER_ACTIVE'
  | 'STRAIN_CHOICE'
  | 'SEED_CLICK_BONUS'
  | 'SEED_PASSIVE'
  | 'EVENT_REWARD_MULT'
  | 'EVENT_SPAWN_RATE'
  | 'EVENT_DURATION_MULT'
  | 'RESEARCH_COST_MULT'
  | 'BPC_FROM_BPS_SECONDS'
  | 'CLICK_CRIT'
  | 'COMBO_POWER'
  | 'AUTOMATION_BPS_SHARE'
  | 'SOFTCAP_RELIEF';

export type ResearchUnlockCondition =
  | { type: 'total_buds'; value: number }
  | { type: 'prestige_seeds'; value: number };

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
  class?: ResearchClass;
  name: Record<'de' | 'en', string>;
  desc: Record<'de' | 'en', string>;
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
    id: 'r_eff_foundation',
    path: 'efficiency',
    order: 1,
    name: {
      de: 'Grundoptimierung',
      en: 'Baseline Optimisation',
    },
    desc: {
      de: 'Globale Produktion dauerhaft +20 %. Solide Grundlage für AFK-Phasen.',
      en: 'Permanently boosts global production by 20%. Reliable AFK backbone.',
    },
    costType: 'buds',
    cost: 12_000,
    effects: [{ id: 'BPS_MULT', v: 1.2 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_eff_flow',
    path: 'efficiency',
    order: 2,
    name: {
      de: 'Durchsatzplanung',
      en: 'Throughput Planning',
    },
    desc: {
      de: 'Produktionslinien +12 %. Stapelt multiplikativ.',
      en: 'Production lines +12%. Stacks multiplicatively.',
    },
    costType: 'buds',
    cost: 45_000,
    requires: ['r_eff_foundation'],
    effects: [{ id: 'BPS_MULT', v: 1.12 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_eff_synergy',
    path: 'efficiency',
    order: 3,
    name: {
      de: 'Hydro × Irrigation',
      en: 'Hydro × Irrigation',
    },
    desc: {
      de: 'Hydroponik-Racks & Bewässerungssysteme +15 % Basisleistung.',
      en: 'Hydroponic racks & irrigation systems +15% base output.',
    },
    costType: 'buds',
    cost: 85_000,
    requires: ['r_eff_flow'],
    effects: [
      {
        id: 'BUILDING_MULT',
        v: 1.15,
        targets: ['hydroponic_rack', 'irrigation_system'],
        labelKey: 'research.effect.hydroIrrigation',
      },
    ],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_eff_recirc',
    path: 'efficiency',
    order: 4,
    name: {
      de: 'Nährstoffkreislauf',
      en: 'Nutrient Recirculation',
    },
    desc: {
      de: 'Globale Produktion +18 %. Verlässliche Skalierung für große Setups.',
      en: 'Global production +18%. Reliable scaling for large setups.',
    },
    costType: 'buds',
    cost: 420_000,
    requires: ['r_eff_synergy'],
    effects: [{ id: 'BPS_MULT', v: 1.18 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_eff_genetics',
    path: 'efficiency',
    order: 5,
    name: {
      de: 'Genetisches Tuning',
      en: 'Genetic Tuning',
    },
    desc: {
      de: 'Globale Produktion +35 %. Kostet Seeds, stapelt mit allen Boosts.',
      en: 'Global production +35%. Costs seeds and multiplies with all boosts.',
    },
    costType: 'seeds',
    cost: 8,
    requires: ['r_eff_recirc'],
    effects: [{ id: 'BPS_MULT', v: 1.35 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_eff_seed_focus',
    path: 'efficiency',
    order: 6,
    name: {
      de: 'Seed-Fokussierung',
      en: 'Seed Focussing',
    },
    desc: {
      de: 'Klicks haben +2 Prozentpunkte Chance auf einen Seed.',
      en: 'Clicks gain +2 percentage points chance to drop a seed.',
    },
    costType: 'seeds',
    cost: 3,
    requires: ['r_eff_genetics'],
    effects: [{ id: 'SEED_CLICK_BONUS', v: 0.02 }],
    icon: researchIcons.seeds,
  },
] as const satisfies readonly ResearchNodeSpec[];

const CONTROL_RESEARCH = [
  {
    id: 'r_ctrl_tuning',
    path: 'automation',
    order: 1,
    name: {
      de: 'Feinjustage',
      en: 'Fine Tuning',
    },
    desc: {
      de: 'Alle Gebäudekosten −5 %. Wirkt auf jede Kaufstufe.',
      en: 'All building prices −5%. Applies to every purchase.',
    },
    costType: 'buds',
    cost: 9_000,
    effects: [{ id: 'COST_REDUCE_ALL', v: 0.95 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_ctrl_routines',
    path: 'automation',
    order: 2,
    name: {
      de: 'Routineplanung',
      en: 'Routine Planning',
    },
    desc: {
      de: 'Automatisiert +2 Klicks pro Sekunde. Stapelt mit Upgrades.',
      en: 'Automates +2 clicks each second. Stacks with upgrades.',
    },
    costType: 'buds',
    cost: 70_000,
    requires: ['r_ctrl_tuning'],
    effects: [{ id: 'CLICK_AUTOMATION', v: 2 }],
    icon: researchIcons.automation,
  },
  {
    id: 'r_ctrl_time1',
    path: 'automation',
    order: 3,
    name: {
      de: 'Zeitmanagement I',
      en: 'Time Management I',
    },
    desc: {
      de: 'Offline-Cap +4 Stunden. Kombinierbar mit weiteren Boni.',
      en: 'Offline cap +4 hours. Combines with other bonuses.',
    },
    costType: 'buds',
    cost: 180_000,
    requires: ['r_ctrl_routines'],
    effects: [{ id: 'OFFLINE_CAP_HOURS_ADD', v: 4 }],
    icon: researchIcons.offline,
  },
  {
    id: 'r_ctrl_time2',
    path: 'automation',
    order: 4,
    name: {
      de: 'Zeitmanagement II',
      en: 'Time Management II',
    },
    desc: {
      de: 'Offline-Cap zusätzlich +8 Stunden. Addiert sich zu vorherigen Effekten.',
      en: 'Offline cap gains another +8 hours. Adds to previous effects.',
    },
    costType: 'seeds',
    cost: 3,
    requires: ['r_ctrl_time1'],
    effects: [{ id: 'OFFLINE_CAP_HOURS_ADD', v: 8 }],
    icon: researchIcons.offline,
  },
  {
    id: 'r_ctrl_energy',
    path: 'automation',
    order: 5,
    name: {
      de: 'Energieeffizienz',
      en: 'Energy Efficiency',
    },
    desc: {
      de: 'Aktive Skills dauern +25 %. Perfekt für geplante Aktivphasen.',
      en: 'Active skills last 25% longer. Perfect for scheduled bursts.',
    },
    costType: 'seeds',
    cost: 4,
    requires: ['r_ctrl_time1'],
    effects: [{ id: 'ABILITY_DURATION_MULT', v: 1.25 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_ctrl_seed_drive',
    path: 'automation',
    order: 6,
    name: {
      de: 'Seed-Tuning',
      en: 'Seed Drive',
    },
    desc: {
      de: 'Klick-Samenchance +3 Prozentpunkte.',
      en: 'Click seed chance +3 percentage points.',
    },
    costType: 'seeds',
    cost: 4,
    requires: ['r_ctrl_energy'],
    effects: [{ id: 'SEED_CLICK_BONUS', v: 0.03 }],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_ctrl_lab_auto1',
    path: 'automation',
    order: 7,
    name: {
      de: 'Labor-Autokollektor I',
      en: 'Lab Autocollector I',
    },
    desc: {
      de: 'Nach 5 Minuten Idle: 25 % Chance auf 1 Seed.',
      en: 'After 5 minutes idle: 25% chance to collect 1 seed.',
    },
    costType: 'seeds',
    cost: 5,
    requires: ['r_ctrl_seed_drive'],
    effects: [
      {
        id: 'SEED_PASSIVE',
        seedPassive: { intervalMinutes: 5, chance: 0.25, seeds: 1 },
      },
    ],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_ctrl_lab_auto2',
    path: 'automation',
    order: 8,
    name: {
      de: 'Labor-Autokollektor II',
      en: 'Lab Autocollector II',
    },
    desc: {
      de: 'Nach 4 Minuten Idle: 45 % Chance auf 1 Seed.',
      en: 'After 4 minutes idle: 45% chance to collect 1 seed.',
    },
    costType: 'seeds',
    cost: 7,
    requires: ['r_ctrl_lab_auto1'],
    effects: [
      {
        id: 'SEED_PASSIVE',
        seedPassive: { intervalMinutes: 4, chance: 0.45, seeds: 1 },
      },
    ],
    icon: researchIcons.seeds,
  },
] as const satisfies readonly ResearchNodeSpec[];

const STRAIN_RESEARCH = [
  {
    id: 'r_strain_lab',
    path: 'genetics',
    order: 1,
    name: {
      de: 'Strain-Labor',
      en: 'Strain Lab',
    },
    desc: {
      de: 'Schaltet spezialisierte Strains frei. Erfordert Midgame-Fortschritt oder Seeds.',
      en: 'Unlocks specialised strains. Requires mid-game progress or seeds.',
    },
    costType: 'buds',
    cost: 750_000,
    unlockAny: [
      { type: 'total_buds', value: 3_000_000 },
      { type: 'prestige_seeds', value: 1 },
    ],
    effects: [],
    icon: researchIcons.strain,
  },
  {
    id: 'r_strain_indica',
    path: 'genetics',
    order: 2,
    name: {
      de: 'Indica',
      en: 'Indica',
    },
    desc: {
      de: '+25 % BPS, aber −15 % BPC. Gilt bis zum nächsten Prestige.',
      en: '+25% BPS, but −15% BPC. Holds until the next prestige.',
    },
    costType: 'seeds',
    cost: 2,
    requires: ['r_strain_lab'],
    exclusiveGroup: 'strain',
    confirmKey: 'research.confirm.strain',
    resetsOnPrestige: true,
    effects: [
      { id: 'BPS_MULT', v: 1.25 },
      { id: 'BPC_MULT', v: 0.85 },
      { id: 'STRAIN_CHOICE', strain: 'indica', labelKey: 'research.effect.strain.indica' },
    ],
    icon: researchIcons.strain,
  },
  {
    id: 'r_strain_sativa',
    path: 'genetics',
    order: 3,
    name: {
      de: 'Sativa',
      en: 'Sativa',
    },
    desc: {
      de: '+60 % BPC, aber −10 % BPS. Ideal für aktive Runs.',
      en: '+60% BPC, but −10% BPS. Ideal for active runs.',
    },
    costType: 'seeds',
    cost: 2,
    requires: ['r_strain_lab'],
    exclusiveGroup: 'strain',
    confirmKey: 'research.confirm.strain',
    resetsOnPrestige: true,
    effects: [
      { id: 'BPC_MULT', v: 1.6 },
      { id: 'BPS_MULT', v: 0.9 },
      { id: 'STRAIN_CHOICE', strain: 'sativa', labelKey: 'research.effect.strain.sativa' },
    ],
    icon: researchIcons.strain,
  },
  {
    id: 'r_strain_hybrid',
    path: 'genetics',
    order: 4,
    name: {
      de: 'Hybrid',
      en: 'Hybrid',
    },
    desc: {
      de: '+10 % BPS und BPC, +1 % pro aktivem temporären Buff.',
      en: '+10% BPS and BPC, +1% per active temporary buff.',
    },
    costType: 'seeds',
    cost: 3,
    requires: ['r_strain_lab'],
    exclusiveGroup: 'strain',
    confirmKey: 'research.confirm.strain',
    resetsOnPrestige: true,
    effects: [
      { id: 'BPS_MULT', v: 1.1 },
      { id: 'BPC_MULT', v: 1.1 },
      { id: 'HYBRID_BUFF_PER_ACTIVE', v: 0.01, labelKey: 'research.effect.hybridBuff' },
      { id: 'STRAIN_CHOICE', strain: 'hybrid', labelKey: 'research.effect.strain.hybrid' },
    ],
    icon: researchIcons.strain,
  },
] as const satisfies readonly ResearchNodeSpec[];

const ACTIVE_RESEARCH = [
  {
    id: 'r_active_focus',
    path: 'active',
    order: 1,
    name: {
      de: 'Fokus-Ernte',
      en: 'Focused Harvest',
    },
    desc: {
      de: 'Buds pro Klick +35 %. Macht aktive Sessions direkt stärker.',
      en: 'Buds per click +35%. Directly strengthens active sessions.',
    },
    costType: 'buds',
    cost: 32_000,
    effects: [{ id: 'BPC_MULT', v: 1.35 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_active_skill_cells',
    path: 'active',
    order: 2,
    name: {
      de: 'Skill-Zellen',
      en: 'Skill Cells',
    },
    desc: {
      de: 'Aktive Fähigkeiten dauern +15 % länger.',
      en: 'Active abilities last 15% longer.',
    },
    costType: 'buds',
    cost: 120_000,
    requires: ['r_active_focus'],
    effects: [{ id: 'ABILITY_DURATION_MULT', v: 1.15 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_active_peak',
    path: 'active',
    order: 3,
    name: {
      de: 'Peak Session',
      en: 'Peak Session',
    },
    desc: {
      de: 'Produktionsfähigkeiten sind +20 % stärker.',
      en: 'Production abilities are 20% stronger.',
    },
    costType: 'seeds',
    cost: 4,
    requires: ['r_active_skill_cells'],
    effects: [{ id: 'ABILITY_OVERDRIVE_PLUS', v: 0.2 }],
    icon: researchIcons.overdrive,
  },
] as const satisfies readonly ResearchNodeSpec[];

const EVENT_RESEARCH = [
  {
    id: 'r_event_scouts',
    path: 'events',
    order: 1,
    name: {
      de: 'Event-Scouts',
      en: 'Event Scouts',
    },
    desc: {
      de: 'Events erscheinen ca. 15 % häufiger. Pity bleibt aktiv.',
      en: 'Events appear about 15% more often. Pity remains active.',
    },
    costType: 'buds',
    cost: 95_000,
    effects: [{ id: 'EVENT_SPAWN_RATE', v: 1.15 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_event_signals',
    path: 'events',
    order: 2,
    name: {
      de: 'Signalpflege',
      en: 'Signal Care',
    },
    desc: {
      de: 'Temporäre Event-Buffs dauern +20 % länger.',
      en: 'Temporary event buffs last 20% longer.',
    },
    costType: 'buds',
    cost: 320_000,
    requires: ['r_event_scouts'],
    effects: [{ id: 'EVENT_DURATION_MULT', v: 1.2 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_event_rewarding',
    path: 'events',
    order: 3,
    name: {
      de: 'Belohnungsfenster',
      en: 'Reward Window',
    },
    desc: {
      de: 'Bud- und Seed-Events zahlen +25 % besser.',
      en: 'Bud and seed events pay 25% better.',
    },
    costType: 'seeds',
    cost: 5,
    requires: ['r_event_signals'],
    effects: [{ id: 'EVENT_REWARD_MULT', v: 1.25 }],
    icon: researchIcons.seeds,
  },
] as const satisfies readonly ResearchNodeSpec[];

const ECONOMY_RESEARCH = [
  {
    id: 'r_econ_batching',
    path: 'economy',
    order: 1,
    name: {
      de: 'Batch-Kaufplanung',
      en: 'Batch Purchase Planning',
    },
    desc: {
      de: 'Alle Gebäudekosten −4 %. Hilft besonders bei x10/x25-Käufen.',
      en: 'All building prices -4%. Especially useful for x10/x25 buys.',
    },
    costType: 'buds',
    cost: 210_000,
    effects: [{ id: 'COST_REDUCE_ALL', v: 0.96 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_econ_seed_grants',
    path: 'economy',
    order: 2,
    name: {
      de: 'Research-Stipendium',
      en: 'Research Grant',
    },
    desc: {
      de: 'Seed-Forschung kostet 10 % weniger, ohne Prestige-Macht zu senken.',
      en: 'Seed research costs 10% less without lowering prestige power.',
    },
    costType: 'seeds',
    cost: 3,
    unlockAny: [{ type: 'prestige_seeds', value: 1 }],
    effects: [{ id: 'RESEARCH_COST_MULT', v: 0.9 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_econ_restart_kit',
    path: 'economy',
    order: 3,
    name: {
      de: 'Restart-Kit',
      en: 'Restart Kit',
    },
    desc: {
      de: 'Offline-Cap +6 Stunden und globale Produktion +12 % für stabilere zweite Runs.',
      en: 'Offline cap +6 hours and global production +12% for stronger second runs.',
    },
    costType: 'seeds',
    cost: 6,
    requires: ['r_econ_seed_grants'],
    effects: [
      { id: 'OFFLINE_CAP_HOURS_ADD', v: 6 },
      { id: 'BPS_MULT', v: 1.12 },
    ],
    icon: researchIcons.offline,
  },
] as const satisfies readonly ResearchNodeSpec[];

const ADVANCED_RESEARCH = [
  {
    id: 'r_active_bps_tap',
    path: 'active',
    order: 4,
    class: 'run',
    name: { de: 'Flow-Taps', en: 'Flow Taps' },
    desc: {
      de: 'Klicks erhalten zusätzlich 0,03 Sekunden aktueller Produktion. Resetet beim Prestige.',
      en: 'Clicks gain an extra 0.03 seconds of current production. Resets on prestige.',
    },
    costType: 'buds',
    cost: 900_000,
    requires: ['r_active_peak'],
    resetsOnPrestige: true,
    effects: [{ id: 'BPC_FROM_BPS_SECONDS', v: 0.03 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_active_combo_roots',
    path: 'active',
    order: 5,
    class: 'run',
    name: { de: 'Combo-Wurzeln', en: 'Combo Roots' },
    desc: {
      de: 'Click-Combos skalieren 12 % stärker. Gut für geplante Aktivfenster.',
      en: 'Click combos scale 12% harder. Good for planned active windows.',
    },
    costType: 'seeds',
    cost: 5,
    requires: ['r_active_bps_tap'],
    resetsOnPrestige: true,
    effects: [{ id: 'COMBO_POWER', v: 0.12 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_active_crit_glands',
    path: 'active',
    order: 6,
    class: 'run',
    name: { de: 'Harzspitzen', en: 'Resin Tips' },
    desc: {
      de: 'Klicks haben +4 % kritische Chance. Kritische Klicks zahlen doppelt.',
      en: 'Clicks gain +4% critical chance. Critical clicks pay double.',
    },
    costType: 'seeds',
    cost: 7,
    requires: ['r_active_combo_roots'],
    resetsOnPrestige: true,
    effects: [{ id: 'CLICK_CRIT', v: 0.04 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_active_chain_peak',
    path: 'active',
    order: 7,
    class: 'run',
    name: { de: 'Harvest Chain', en: 'Harvest Chain' },
    desc: {
      de: 'Klicks erhalten weitere 0,04 Sekunden Produktion und +3 % kritische Chance.',
      en: 'Clicks gain another 0.04 seconds of production and +3% critical chance.',
    },
    costType: 'seeds',
    cost: 10,
    requires: ['r_active_crit_glands'],
    resetsOnPrestige: true,
    effects: [
      { id: 'BPC_FROM_BPS_SECONDS', v: 0.04 },
      { id: 'CLICK_CRIT', v: 0.03 },
    ],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_auto_servo_scaling',
    path: 'automation',
    order: 9,
    class: 'permanent',
    name: { de: 'Servo-Skalierung', en: 'Servo Scaling' },
    desc: {
      de: 'Automation gewinnt zusätzlich 1 % BPS pro Sekunde als passiven Auto-Ertrag.',
      en: 'Automation gains an additional 1% BPS per second as passive auto yield.',
    },
    costType: 'seeds',
    cost: 8,
    requires: ['r_ctrl_lab_auto2'],
    effects: [{ id: 'AUTOMATION_BPS_SHARE', v: 0.01 }],
    icon: researchIcons.automation,
  },
  {
    id: 'r_auto_robot_sync',
    path: 'automation',
    order: 10,
    class: 'permanent',
    name: { de: 'Roboter-Sync', en: 'Robot Sync' },
    desc: {
      de: '+3 Auto-Klicks/s und weitere 1,5 % BPS-Anteil für Automation.',
      en: '+3 auto-clicks/s and another 1.5% BPS share for automation.',
    },
    costType: 'seeds',
    cost: 11,
    requires: ['r_auto_servo_scaling'],
    effects: [
      { id: 'CLICK_AUTOMATION', v: 3 },
      { id: 'AUTOMATION_BPS_SHARE', v: 0.015 },
    ],
    icon: researchIcons.automation,
  },
  {
    id: 'r_auto_coolant_loop',
    path: 'automation',
    order: 11,
    class: 'permanent',
    name: { de: 'Kühlkreislauf', en: 'Coolant Loop' },
    desc: {
      de: 'Softcap-Strafen werden um 8 % abgefedert.',
      en: 'Softcap penalties are softened by 8%.',
    },
    costType: 'seeds',
    cost: 9,
    requires: ['r_ctrl_time2'],
    effects: [{ id: 'SOFTCAP_RELIEF', v: 0.08 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_auto_buffered_idle',
    path: 'automation',
    order: 12,
    class: 'permanent',
    name: { de: 'Gepufferter Leerlauf', en: 'Buffered Idle' },
    desc: {
      de: 'Offline-Cap +10h und passive Seeds werden zuverlässiger.',
      en: 'Offline cap +10h and passive seeds become more reliable.',
    },
    costType: 'seeds',
    cost: 12,
    requires: ['r_auto_coolant_loop'],
    effects: [
      { id: 'OFFLINE_CAP_HOURS_ADD', v: 10 },
      { id: 'SEED_PASSIVE', seedPassive: { intervalMinutes: 3.5, chance: 0.55, seeds: 1 } },
    ],
    icon: researchIcons.offline,
  },
  {
    id: 'r_event_magnetics',
    path: 'events',
    order: 4,
    class: 'permanent',
    name: { de: 'Event-Magnetik', en: 'Event Magnetics' },
    desc: {
      de: 'Events erscheinen weitere 12 % häufiger.',
      en: 'Events appear another 12% more often.',
    },
    costType: 'seeds',
    cost: 7,
    requires: ['r_event_rewarding'],
    effects: [{ id: 'EVENT_SPAWN_RATE', v: 1.12 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_event_chain_study',
    path: 'events',
    order: 5,
    class: 'permanent',
    name: { de: 'Kettenstudie', en: 'Chain Study' },
    desc: {
      de: 'Event-Buffs dauern +15 % länger und Rewards zahlen +12 % besser.',
      en: 'Event buffs last 15% longer and rewards pay 12% better.',
    },
    costType: 'seeds',
    cost: 9,
    requires: ['r_event_magnetics'],
    effects: [
      { id: 'EVENT_DURATION_MULT', v: 1.15 },
      { id: 'EVENT_REWARD_MULT', v: 1.12 },
    ],
    icon: researchIcons.growth,
  },
  {
    id: 'r_event_green_windows',
    path: 'events',
    order: 6,
    class: 'run',
    name: { de: 'Grüne Fenster', en: 'Green Windows' },
    desc: {
      de: 'Klicks erhalten 0,025 Sekunden Produktion. Besonders stark während Event-Buffs.',
      en: 'Clicks gain 0.025 seconds of production. Especially strong during event buffs.',
    },
    costType: 'buds',
    cost: 2_200_000,
    requires: ['r_event_signals'],
    resetsOnPrestige: true,
    effects: [{ id: 'BPC_FROM_BPS_SECONDS', v: 0.025 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_event_quality_control',
    path: 'events',
    order: 7,
    class: 'permanent',
    name: { de: 'Qualitätskontrolle', en: 'Quality Control' },
    desc: {
      de: 'Event-Rewards +20 %. Ein klarer Event-Build-Anker.',
      en: 'Event rewards +20%. A clear event-build anchor.',
    },
    costType: 'seeds',
    cost: 12,
    requires: ['r_event_chain_study'],
    effects: [{ id: 'EVENT_REWARD_MULT', v: 1.2 }],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_gen_seed_bank',
    path: 'genetics',
    order: 5,
    class: 'permanent',
    name: { de: 'Seed-Bank', en: 'Seed Bank' },
    desc: {
      de: 'Nach 4 Minuten Idle: 60 % Chance auf 1 Seed.',
      en: 'After 4 minutes idle: 60% chance for 1 seed.',
    },
    costType: 'seeds',
    cost: 6,
    requires: ['r_strain_lab'],
    effects: [{ id: 'SEED_PASSIVE', seedPassive: { intervalMinutes: 4, chance: 0.6, seeds: 1 } }],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_gen_click_pollen',
    path: 'genetics',
    order: 6,
    class: 'permanent',
    name: { de: 'Klick-Pollen', en: 'Click Pollen' },
    desc: {
      de: 'Klick-Samenchance +2,5 Prozentpunkte.',
      en: 'Click seed chance +2.5 percentage points.',
    },
    costType: 'seeds',
    cost: 8,
    requires: ['r_gen_seed_bank'],
    effects: [{ id: 'SEED_CLICK_BONUS', v: 0.025 }],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_gen_softcap_genes',
    path: 'genetics',
    order: 7,
    class: 'permanent',
    name: { de: 'Softcap-Gene', en: 'Softcap Genes' },
    desc: {
      de: 'Softcap-Strafen werden um 12 % abgefedert.',
      en: 'Softcap penalties are softened by 12%.',
    },
    costType: 'seeds',
    cost: 10,
    requires: ['r_gen_click_pollen'],
    effects: [{ id: 'SOFTCAP_RELIEF', v: 0.12 }],
    icon: researchIcons.strain,
  },
  {
    id: 'r_gen_strain_protocol',
    path: 'genetics',
    order: 8,
    class: 'strain',
    name: { de: 'Strain-Protokoll', en: 'Strain Protocol' },
    desc: {
      de: 'Hybrid-Buffs zählen stärker: +1,5 % pro aktivem temporären Buff.',
      en: 'Hybrid buffs count harder: +1.5% per active temporary buff.',
    },
    costType: 'seeds',
    cost: 11,
    requires: ['r_strain_hybrid'],
    resetsOnPrestige: true,
    effects: [{ id: 'HYBRID_BUFF_PER_ACTIVE', v: 0.015, labelKey: 'research.effect.hybridBuff' }],
    icon: researchIcons.strain,
  },
  {
    id: 'r_econ_softcap_permits',
    path: 'economy',
    order: 4,
    class: 'permanent',
    name: { de: 'Softcap-Lizenzen', en: 'Softcap Permits' },
    desc: {
      de: 'Softcap-Strafen werden um 10 % abgefedert.',
      en: 'Softcap penalties are softened by 10%.',
    },
    costType: 'seeds',
    cost: 7,
    requires: ['r_econ_seed_grants'],
    effects: [{ id: 'SOFTCAP_RELIEF', v: 0.1 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_econ_bulk_routes',
    path: 'economy',
    order: 5,
    class: 'permanent',
    name: { de: 'Bulk-Routen', en: 'Bulk Routes' },
    desc: {
      de: 'Gebäudekosten −6 %. Macht x25/Max-Käufe planbarer.',
      en: 'Building costs -6%. Makes x25/max buys easier to plan.',
    },
    costType: 'seeds',
    cost: 8,
    requires: ['r_econ_softcap_permits'],
    effects: [{ id: 'COST_REDUCE_ALL', v: 0.94 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_econ_research_endowment',
    path: 'economy',
    order: 6,
    class: 'permanent',
    name: { de: 'Laborfonds', en: 'Lab Endowment' },
    desc: {
      de: 'Seed-Research kostet weitere 12 % weniger.',
      en: 'Seed research costs another 12% less.',
    },
    costType: 'seeds',
    cost: 10,
    requires: ['r_econ_bulk_routes'],
    effects: [{ id: 'RESEARCH_COST_MULT', v: 0.88 }],
    icon: researchIcons.costcut,
  },
  {
    id: 'r_pres_ascension_notes',
    path: 'prestige',
    order: 1,
    class: 'permanent',
    name: { de: 'Ascension-Notizen', en: 'Ascension Notes' },
    desc: {
      de: 'Globale Produktion +15 %. Kostet echte Ascension-Seeds.',
      en: 'Global production +15%. Costs actual ascension seeds.',
    },
    costType: 'ascension',
    cost: 2,
    unlockAny: [{ type: 'prestige_seeds', value: 1 }],
    effects: [{ id: 'BPS_MULT', v: 1.15 }],
    icon: researchIcons.growth,
  },
  {
    id: 'r_pres_active_memory',
    path: 'prestige',
    order: 2,
    class: 'permanent',
    name: { de: 'Aktive Erinnerung', en: 'Active Memory' },
    desc: {
      de: 'Klicks erhalten 0,035 Sekunden Produktion in jedem Run.',
      en: 'Clicks gain 0.035 seconds of production in every run.',
    },
    costType: 'ascension',
    cost: 3,
    requires: ['r_pres_ascension_notes'],
    effects: [{ id: 'BPC_FROM_BPS_SECONDS', v: 0.035 }],
    icon: researchIcons.overdrive,
  },
  {
    id: 'r_pres_idle_memory',
    path: 'prestige',
    order: 3,
    class: 'permanent',
    name: { de: 'Idle-Erinnerung', en: 'Idle Memory' },
    desc: {
      de: 'Automation erhält 2 % BPS-Anteil und Offline-Cap +6h.',
      en: 'Automation gains 2% BPS share and offline cap +6h.',
    },
    costType: 'ascension',
    cost: 4,
    requires: ['r_pres_ascension_notes'],
    effects: [
      { id: 'AUTOMATION_BPS_SHARE', v: 0.02 },
      { id: 'OFFLINE_CAP_HOURS_ADD', v: 6 },
    ],
    icon: researchIcons.offline,
  },
  {
    id: 'r_pres_event_memory',
    path: 'prestige',
    order: 4,
    class: 'permanent',
    name: { de: 'Event-Erinnerung', en: 'Event Memory' },
    desc: {
      de: 'Event-Frequenz +10 % und Event-Rewards +15 %.',
      en: 'Event frequency +10% and event rewards +15%.',
    },
    costType: 'ascension',
    cost: 4,
    requires: ['r_pres_ascension_notes'],
    effects: [
      { id: 'EVENT_SPAWN_RATE', v: 1.1 },
      { id: 'EVENT_REWARD_MULT', v: 1.15 },
    ],
    icon: researchIcons.seeds,
  },
  {
    id: 'r_pres_softcap_charter',
    path: 'prestige',
    order: 5,
    class: 'permanent',
    name: { de: 'Softcap-Charta', en: 'Softcap Charter' },
    desc: {
      de: 'Softcap-Strafen werden um weitere 15 % abgefedert.',
      en: 'Softcap penalties are softened by another 15%.',
    },
    costType: 'ascension',
    cost: 6,
    requires: ['r_pres_idle_memory', 'r_pres_event_memory'],
    effects: [{ id: 'SOFTCAP_RELIEF', v: 0.15 }],
    icon: researchIcons.costcut,
  },
] as const satisfies readonly ResearchNodeSpec[];

const RESEARCH_ENTRIES = [
  ...EFFICIENCY_RESEARCH,
  ...ACTIVE_RESEARCH,
  ...CONTROL_RESEARCH,
  ...EVENT_RESEARCH,
  ...STRAIN_RESEARCH,
  ...ECONOMY_RESEARCH,
  ...ADVANCED_RESEARCH,
] as const;

type RawResearchNode = (typeof RESEARCH_ENTRIES)[number];

export type ResearchId = RawResearchNode['id'];

export interface ResearchNode extends Omit<ResearchNodeSpec, 'id' | 'requires'> {
  id: ResearchId;
  requires?: readonly ResearchId[];
}

export const RESEARCH_PATHS: Record<ResearchPath, readonly ResearchNode[]> = {
  efficiency: EFFICIENCY_RESEARCH,
  active: [
    ...ACTIVE_RESEARCH,
    ...ADVANCED_RESEARCH.filter((node) => node.path === 'active'),
  ] as readonly ResearchNode[],
  automation: [
    ...CONTROL_RESEARCH,
    ...ADVANCED_RESEARCH.filter((node) => node.path === 'automation'),
  ] as readonly ResearchNode[],
  events: [
    ...EVENT_RESEARCH,
    ...ADVANCED_RESEARCH.filter((node) => node.path === 'events'),
  ] as readonly ResearchNode[],
  genetics: [
    ...STRAIN_RESEARCH,
    ...ADVANCED_RESEARCH.filter((node) => node.path === 'genetics'),
  ] as readonly ResearchNode[],
  economy: [
    ...ECONOMY_RESEARCH,
    ...ADVANCED_RESEARCH.filter((node) => node.path === 'economy'),
  ] as readonly ResearchNode[],
  prestige: ADVANCED_RESEARCH.filter((node) => node.path === 'prestige') as readonly ResearchNode[],
};

const PATH_ORDER: Record<ResearchPath, number> = {
  efficiency: 0,
  active: 1,
  automation: 2,
  events: 3,
  genetics: 4,
  economy: 5,
  prestige: 6,
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
