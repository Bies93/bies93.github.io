import type { LocaleKey } from '../app/i18n';
import type { AchievementRequirement } from './achievements';

export type ContractId = string;
export type ContractDifficulty = 'easy' | 'medium' | 'hard';

export type ContractReward =
  | { type: 'tokens'; amount: number }
  | { type: 'nextRunBoost'; target: 'bps' | 'bpc' | 'both' | 'events'; multiplier: number }
  | { type: 'cosmetic'; id: string };

export interface ContractDefinition {
  id: ContractId;
  difficulty: ContractDifficulty;
  order: number;
  displayName: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  flavor: Record<LocaleKey, string>;
  requirement: AchievementRequirement;
  rewards: readonly ContractReward[];
}

const easyContracts: readonly ContractDefinition[] = [
  {
    id: 'contract_seedling_batch',
    difficulty: 'easy',
    order: 10,
    displayName: { de: 'Keimlingscharge', en: 'Seedling Batch' },
    description: { de: 'Besitze 25 Seedlings.', en: 'Own 25 Seedlings.' },
    flavor: { de: 'Ein geordneter Anfang zählt doppelt.', en: 'A tidy start counts twice.' },
    requirement: { itemsOwned: { seedling: 25 } },
    rewards: [{ type: 'tokens', amount: 1 }],
  },
  {
    id: 'contract_first_signal',
    difficulty: 'easy',
    order: 20,
    displayName: { de: 'Erstes Signal', en: 'First Signal' },
    description: { de: 'Klicke 2 Events.', en: 'Click 2 events.' },
    flavor: { de: 'Wer hinsieht, findet Momentum.', en: 'If you watch, you find momentum.' },
    requirement: { eventClicks: 2 },
    rewards: [{ type: 'tokens', amount: 1 }],
  },
  {
    id: 'contract_click_rhythm',
    difficulty: 'easy',
    order: 30,
    displayName: { de: 'Klickrhythmus', en: 'Click Rhythm' },
    description: { de: 'Erreiche 250 manuelle Klicks.', en: 'Reach 250 manual clicks.' },
    flavor: { de: 'Nicht hektisch. Nur konstant.', en: 'Not frantic. Just steady.' },
    requirement: { manualClicks: 250 },
    rewards: [{ type: 'tokens', amount: 1 }],
  },
  {
    id: 'contract_soft_start',
    difficulty: 'easy',
    order: 40,
    displayName: { de: 'Sanfter Start', en: 'Soft Start' },
    description: { de: 'Erreiche 20 BPS.', en: 'Reach 20 BPS.' },
    flavor: { de: 'Die Maschine summt leise genug.', en: 'The machine hums quietly enough.' },
    requirement: { bps: 20 },
    rewards: [{ type: 'tokens', amount: 1 }],
  },
  {
    id: 'contract_seed_trace',
    difficulty: 'easy',
    order: 50,
    displayName: { de: 'Seed-Spur', en: 'Seed Trace' },
    description: { de: 'Verdiene 3 Research-Seeds.', en: 'Earn 3 research seeds.' },
    flavor: { de: 'Kleine Funde, klare Richtung.', en: 'Small finds, clear direction.' },
    requirement: { seedsEarned: 3 },
    rewards: [
      { type: 'tokens', amount: 1 },
      { type: 'nextRunBoost', target: 'bpc', multiplier: 1.05 },
    ],
  },
  {
    id: 'contract_tidy_tools',
    difficulty: 'easy',
    order: 60,
    displayName: { de: 'Saubere Tools', en: 'Tidy Tools' },
    description: { de: 'Kaufe 3 Upgrades.', en: 'Buy 3 upgrades.' },
    flavor: { de: 'Kleine Verbesserungen, großer Lesefluss.', en: 'Small improvements, clearer flow.' },
    requirement: { upgradeCount: 3 },
    rewards: [{ type: 'tokens', amount: 1 }],
  },
];

const mediumContracts: readonly ContractDefinition[] = [
  {
    id: 'contract_event_hunter',
    difficulty: 'medium',
    order: 110,
    displayName: { de: 'Event Hunter', en: 'Event Hunter' },
    description: { de: 'Klicke 8 Events.', en: 'Click 8 events.' },
    flavor: { de: 'Kurz aufgetaucht, sauber genutzt.', en: 'Appeared briefly, used cleanly.' },
    requirement: { eventClicks: 8 },
    rewards: [
      { type: 'tokens', amount: 2 },
      { type: 'nextRunBoost', target: 'events', multiplier: 1.06 },
    ],
  },
  {
    id: 'contract_budget_botanist',
    difficulty: 'medium',
    order: 120,
    displayName: { de: 'Budget Botanist', en: 'Budget Botanist' },
    description: { de: 'Erreiche 100 BPS und 100 Achievement-Score.', en: 'Reach 100 BPS and 100 achievement score.' },
    flavor: { de: 'Nicht alles kaufen. Das Richtige kaufen.', en: 'Do not buy everything. Buy the right things.' },
    requirement: { bps: 100, achievementScore: 100 },
    rewards: [{ type: 'tokens', amount: 2 }],
  },
  {
    id: 'contract_research_line',
    difficulty: 'medium',
    order: 130,
    displayName: { de: 'Research-Linie', en: 'Research Line' },
    description: { de: 'Kaufe 8 Research-Knoten.', en: 'Buy 8 research nodes.' },
    flavor: { de: 'Ein Build ist mehr als eine Richtung.', en: 'A build is more than a direction.' },
    requirement: { researchCount: 8 },
    rewards: [
      { type: 'tokens', amount: 2 },
      { type: 'nextRunBoost', target: 'both', multiplier: 1.04 },
    ],
  },
  {
    id: 'contract_automation_spin',
    difficulty: 'medium',
    order: 140,
    displayName: { de: 'Automation anlaufen', en: 'Automation Spin' },
    description: { de: 'Nutze Fähigkeiten 20-mal.', en: 'Use abilities 20 times.' },
    flavor: { de: 'Regeln sind nur dann gut, wenn sie Arbeit sparen.', en: 'Rules are good when they save work.' },
    requirement: { abilityUses: 20 },
    rewards: [{ type: 'tokens', amount: 2 }],
  },
  {
    id: 'contract_wide_shelf',
    difficulty: 'medium',
    order: 150,
    displayName: { de: 'Breites Regal', en: 'Wide Shelf' },
    description: { de: 'Besitze 150 Items insgesamt.', en: 'Own 150 total items.' },
    flavor: { de: 'Breite ist eine Strategie, wenn sie bewusst passiert.', en: 'Breadth is strategy when it is intentional.' },
    requirement: { totalItemsOwned: 150 },
    rewards: [{ type: 'tokens', amount: 2 }],
  },
  {
    id: 'contract_seed_sprint',
    difficulty: 'medium',
    order: 160,
    displayName: { de: 'Seed Sprint', en: 'Seed Sprint' },
    description: { de: 'Verdiene 12 Research-Seeds.', en: 'Earn 12 research seeds.' },
    flavor: { de: 'Kurz sammeln, lange planen.', en: 'Collect briefly, plan longer.' },
    requirement: { seedsEarned: 12 },
    rewards: [
      { type: 'tokens', amount: 2 },
      { type: 'nextRunBoost', target: 'bpc', multiplier: 1.08 },
    ],
  },
  {
    id: 'contract_goal_keeper',
    difficulty: 'medium',
    order: 170,
    displayName: { de: 'Zielhüter', en: 'Goal Keeper' },
    description: { de: 'Schließe 8 Ziele ab.', en: 'Complete 8 goals.' },
    flavor: { de: 'Die Liste führt, aber du entscheidest.', en: 'The list guides, but you decide.' },
    requirement: { achievementScore: 140 },
    rewards: [{ type: 'tokens', amount: 2 }],
  },
];

const hardContracts: readonly ContractDefinition[] = [
  {
    id: 'contract_fast_trim',
    difficulty: 'hard',
    order: 210,
    displayName: { de: 'Fast Trim', en: 'Fast Trim' },
    description: { de: 'Erreiche 1.000 BPS.', en: 'Reach 1,000 BPS.' },
    flavor: { de: 'Schneller, aber nicht blind.', en: 'Faster, but not blind.' },
    requirement: { bps: 1_000 },
    rewards: [
      { type: 'tokens', amount: 3 },
      { type: 'nextRunBoost', target: 'bps', multiplier: 1.1 },
    ],
  },
  {
    id: 'contract_quiet_grow',
    difficulty: 'hard',
    order: 220,
    displayName: { de: 'Quiet Grow', en: 'Quiet Grow' },
    description: { de: 'Sammle 2h Offline-Ertrag.', en: 'Collect 2h of offline gains.' },
    flavor: { de: 'Nicht jeder Fortschritt muss laut sein.', en: 'Not every gain needs to be loud.' },
    requirement: { offlineBuds: 100_000 },
    rewards: [
      { type: 'tokens', amount: 3 },
      { type: 'cosmetic', id: 'frame_quiet_grower' },
    ],
  },
  {
    id: 'contract_chain_reader',
    difficulty: 'hard',
    order: 230,
    displayName: { de: 'Kettenleser', en: 'Chain Reader' },
    description: { de: 'Klicke 8 Chain-Events.', en: 'Click 8 chain events.' },
    flavor: { de: 'Ein gutes Event kündigt manchmal das nächste an.', en: 'A good event sometimes hints at the next.' },
    requirement: { eventTypeClicks: { trail_marker: 3, cascade_bloom: 3, echo_harvest: 2 } },
    rewards: [{ type: 'tokens', amount: 3 }],
  },
  {
    id: 'contract_risk_market',
    difficulty: 'hard',
    order: 240,
    displayName: { de: 'Risk Market', en: 'Risk Market' },
    description: { de: 'Klicke 12 Risk-Events.', en: 'Click 12 risk events.' },
    flavor: { de: 'Risiko ist nur schlecht, wenn es ungeplant ist.', en: 'Risk is bad only when it is unplanned.' },
    requirement: { eventTypeClicks: { volatile_growth: 4, blackout_sale: 4, pest_scare: 4 } },
    rewards: [{ type: 'tokens', amount: 3 }],
  },
  {
    id: 'contract_prestige_signal',
    difficulty: 'hard',
    order: 250,
    displayName: { de: 'Prestige-Signal', en: 'Prestige Signal' },
    description: { de: 'Führe 2 Prestiges durch.', en: 'Perform 2 prestiges.' },
    flavor: { de: 'Reset ist hier kein Ende, sondern Timing.', en: 'Reset is timing, not an ending.' },
    requirement: { prestigeCount: 2 },
    rewards: [
      { type: 'tokens', amount: 3 },
      { type: 'cosmetic', id: 'badge_root_signal' },
    ],
  },
  {
    id: 'contract_late_unlock',
    difficulty: 'hard',
    order: 260,
    displayName: { de: 'Katalog öffnen', en: 'Open the Catalogue' },
    description: { de: 'Schalte alle Shop-Items sichtbar frei.', en: 'Make every shop item visible.' },
    flavor: { de: 'Jetzt beginnt die eigentliche Optimierung.', en: 'Now the actual optimisation begins.' },
    requirement: { allItemsUnlocked: true },
    rewards: [
      { type: 'tokens', amount: 3 },
      { type: 'nextRunBoost', target: 'both', multiplier: 1.08 },
    ],
  },
  {
    id: 'contract_deep_pocket',
    difficulty: 'hard',
    order: 270,
    displayName: { de: 'Deep Pocket', en: 'Deep Pocket' },
    description: { de: 'Halte 50 Mio Buds gleichzeitig.', en: 'Hold 50M buds at once.' },
    flavor: { de: 'Geduld ist manchmal der teuerste Button.', en: 'Patience is sometimes the most expensive button.' },
    requirement: { currentBuds: 50_000_000 },
    rewards: [{ type: 'tokens', amount: 3 }],
  },
];

export const contracts: readonly ContractDefinition[] = [
  ...easyContracts,
  ...mediumContracts,
  ...hardContracts,
].sort((a, b) => a.order - b.order);

export const contractById = new Map<ContractId, ContractDefinition>(
  contracts.map((contract) => [contract.id, contract]),
);
