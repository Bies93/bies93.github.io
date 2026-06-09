export const ascensionNodeIds = [
  'root_spark',
  'greenhouse_memory',
  'faster_first_steps',
  'click_resonance',
  'seedling_cache',
  'steady_canopy',
  'event_attunement',
  'research_discount_i',
  'idle_reserve_i',
  'golden_pulse',
  'automation_wake',
  'cost_discipline',
  'prestige_focus',
  'research_discount_ii',
  'offline_vault',
  'event_echo',
  'click_to_canopy',
  'shop_momentum',
  'permanent_slot_i',
  'permanent_slot_ii',
  'ascended_events',
  'meta_greenhouse',
  'runway_protocol',
  'botanical_legacy',
] as const;

export type AscensionNodeId = (typeof ascensionNodeIds)[number];

export type AscensionEffect =
  | { type: 'globalMultiplier'; value: number }
  | { type: 'clickMultiplier'; value: number }
  | { type: 'eventRewardMultiplier'; value: number }
  | { type: 'eventSpawnRateMultiplier'; value: number }
  | { type: 'globalCostMultiplier'; value: number }
  | { type: 'researchCostMultiplier'; value: number }
  | { type: 'offlineCapHours'; value: number }
  | { type: 'startingBuds'; value: number }
  | { type: 'startingItem'; itemId: 'seedling'; value: number }
  | { type: 'autoClickRate'; value: number }
  | { type: 'permanentUpgradeSlot'; value: number }
  | { type: 'prestigeSeedMultiplier'; value: number };

export interface AscensionNodeDefinition {
  id: AscensionNodeId;
  order: number;
  tier: 1 | 2 | 3 | 4;
  category: 'core' | 'active' | 'idle' | 'events' | 'research' | 'shop' | 'prestige' | 'utility';
  cost: number;
  requires?: readonly AscensionNodeId[];
  name: Record<'de' | 'en', string>;
  description: Record<'de' | 'en', string>;
  effectSummary: Record<'de' | 'en', string>;
  effects: readonly AscensionEffect[];
}

export const ascensionNodes: readonly AscensionNodeDefinition[] = [
  {
    id: 'root_spark',
    order: 1,
    tier: 1,
    category: 'core',
    cost: 1,
    name: { de: 'Root Spark', en: 'Root Spark' },
    description: {
      de: 'Der erste Meta-Anker. Jeder neue Run startet etwas klarer.',
      en: 'The first meta anchor. Every new run starts a little cleaner.',
    },
    effectSummary: { de: '+5 % globale Produktion', en: '+5% global production' },
    effects: [{ type: 'globalMultiplier', value: 1.05 }],
  },
  {
    id: 'greenhouse_memory',
    order: 2,
    tier: 1,
    category: 'shop',
    cost: 1,
    requires: ['root_spark'],
    name: { de: 'Greenhouse Memory', en: 'Greenhouse Memory' },
    description: {
      de: 'Die ersten Handgriffe sitzen direkt nach einem Prestige.',
      en: 'The first moves settle in immediately after prestige.',
    },
    effectSummary: { de: 'Starte mit 25 Buds', en: 'Start with 25 buds' },
    effects: [{ type: 'startingBuds', value: 25 }],
  },
  {
    id: 'faster_first_steps',
    order: 3,
    tier: 1,
    category: 'shop',
    cost: 1,
    requires: ['greenhouse_memory'],
    name: { de: 'Fast First Steps', en: 'Fast First Steps' },
    description: {
      de: 'Der nächste Run überspringt nicht das Spiel, aber die ersten Sekunden.',
      en: 'The next run skips the wait, not the game.',
    },
    effectSummary: { de: 'Starte mit 1 Seedling', en: 'Start with 1 Seedling' },
    effects: [{ type: 'startingItem', itemId: 'seedling', value: 1 }],
  },
  {
    id: 'click_resonance',
    order: 4,
    tier: 1,
    category: 'active',
    cost: 2,
    requires: ['root_spark'],
    name: { de: 'Click Resonance', en: 'Click Resonance' },
    description: {
      de: 'Aktives Spielen bleibt auch nach den ersten Automationen relevant.',
      en: 'Active play stays relevant after the first automation steps.',
    },
    effectSummary: { de: '+12 % BPC', en: '+12% BPC' },
    effects: [{ type: 'clickMultiplier', value: 1.12 }],
  },
  {
    id: 'seedling_cache',
    order: 5,
    tier: 1,
    category: 'shop',
    cost: 2,
    requires: ['faster_first_steps'],
    name: { de: 'Seedling Cache', en: 'Seedling Cache' },
    description: {
      de: 'Ein kleiner Vorrat macht den Shopstart runder.',
      en: 'A tiny cache makes the shop start smoother.',
    },
    effectSummary: { de: 'Starte mit 2 weiteren Seedlings', en: 'Start with 2 more Seedlings' },
    effects: [{ type: 'startingItem', itemId: 'seedling', value: 2 }],
  },
  {
    id: 'steady_canopy',
    order: 6,
    tier: 1,
    category: 'idle',
    cost: 2,
    requires: ['root_spark'],
    name: { de: 'Steady Canopy', en: 'Steady Canopy' },
    description: {
      de: 'Passive Produktion bekommt einen frühen, aber kontrollierten Schub.',
      en: 'Passive output gets an early but controlled lift.',
    },
    effectSummary: { de: '+8 % globale Produktion', en: '+8% global production' },
    effects: [{ type: 'globalMultiplier', value: 1.08 }],
  },
  {
    id: 'event_attunement',
    order: 7,
    tier: 1,
    category: 'events',
    cost: 2,
    requires: ['root_spark'],
    name: { de: 'Event Attunement', en: 'Event Attunement' },
    description: {
      de: 'Events bleiben ein Bonus, fühlen sich aber etwas bedeutsamer an.',
      en: 'Events remain bonus moments but feel a little more meaningful.',
    },
    effectSummary: { de: '+10 % Event-Rewards', en: '+10% event rewards' },
    effects: [{ type: 'eventRewardMultiplier', value: 1.1 }],
  },
  {
    id: 'research_discount_i',
    order: 8,
    tier: 1,
    category: 'research',
    cost: 3,
    requires: ['steady_canopy'],
    name: { de: 'Clean Notes I', en: 'Clean Notes I' },
    description: {
      de: 'Research-Entscheidungen werden früher erreichbar.',
      en: 'Research decisions become reachable a little earlier.',
    },
    effectSummary: { de: '-6 % Seed-Research-Kosten', en: '-6% seed research costs' },
    effects: [{ type: 'researchCostMultiplier', value: 0.94 }],
  },
  {
    id: 'idle_reserve_i',
    order: 9,
    tier: 2,
    category: 'idle',
    cost: 3,
    requires: ['steady_canopy'],
    name: { de: 'Idle Reserve I', en: 'Idle Reserve I' },
    description: {
      de: 'Offline-Rückkehr bleibt nützlich, ohne aktives Spiel zu ersetzen.',
      en: 'Offline return stays useful without replacing active play.',
    },
    effectSummary: { de: '+2h Offline-Cap', en: '+2h offline cap' },
    effects: [{ type: 'offlineCapHours', value: 2 }],
  },
  {
    id: 'golden_pulse',
    order: 10,
    tier: 2,
    category: 'events',
    cost: 3,
    requires: ['event_attunement'],
    name: { de: 'Golden Pulse', en: 'Golden Pulse' },
    description: {
      de: 'Reward-Events bekommen etwas mehr Gewicht im Midgame.',
      en: 'Reward events carry slightly more weight in the midgame.',
    },
    effectSummary: { de: '+12 % Event-Rewards', en: '+12% event rewards' },
    effects: [{ type: 'eventRewardMultiplier', value: 1.12 }],
  },
  {
    id: 'automation_wake',
    order: 11,
    tier: 2,
    category: 'utility',
    cost: 4,
    requires: ['click_resonance'],
    name: { de: 'Automation Wake', en: 'Automation Wake' },
    description: {
      de: 'Ein sanfter Auto-Klick hält die frühe Energie in Bewegung.',
      en: 'A gentle auto-click keeps early momentum moving.',
    },
    effectSummary: { de: '+0.25 Auto-Klicks/s', en: '+0.25 auto-clicks/s' },
    effects: [{ type: 'autoClickRate', value: 0.25 }],
  },
  {
    id: 'cost_discipline',
    order: 12,
    tier: 2,
    category: 'shop',
    cost: 4,
    requires: ['seedling_cache'],
    name: { de: 'Cost Discipline', en: 'Cost Discipline' },
    description: {
      de: 'Frühe Shop-Entscheidungen bleiben enger beieinander.',
      en: 'Early shop decisions stay closer together.',
    },
    effectSummary: { de: '-3 % globale Shop-Kosten', en: '-3% global shop costs' },
    effects: [{ type: 'globalCostMultiplier', value: 0.97 }],
  },
  {
    id: 'prestige_focus',
    order: 13,
    tier: 2,
    category: 'prestige',
    cost: 5,
    requires: ['research_discount_i', 'golden_pulse'],
    name: { de: 'Prestige Focus', en: 'Prestige Focus' },
    description: {
      de: 'Gute Prestige-Runs zahlen etwas sauberer in Ascension ein.',
      en: 'Good prestige runs feed into ascension a little more cleanly.',
    },
    effectSummary: { de: '+10 % Ascension-Seed-Ertrag', en: '+10% ascension seed gain' },
    effects: [{ type: 'prestigeSeedMultiplier', value: 1.1 }],
  },
  {
    id: 'research_discount_ii',
    order: 14,
    tier: 2,
    category: 'research',
    cost: 5,
    requires: ['research_discount_i'],
    name: { de: 'Clean Notes II', en: 'Clean Notes II' },
    description: {
      de: 'Research-Pfade öffnen sich ohne Seed-Dürre.',
      en: 'Research paths open without a seed drought.',
    },
    effectSummary: {
      de: 'Weitere -8 % Seed-Research-Kosten',
      en: 'Additional -8% seed research costs',
    },
    effects: [{ type: 'researchCostMultiplier', value: 0.92 }],
  },
  {
    id: 'offline_vault',
    order: 15,
    tier: 2,
    category: 'idle',
    cost: 5,
    requires: ['idle_reserve_i'],
    name: { de: 'Offline Vault', en: 'Offline Vault' },
    description: {
      de: 'Längere Pausen fühlen sich fairer an.',
      en: 'Longer breaks feel fairer.',
    },
    effectSummary: { de: '+4h Offline-Cap', en: '+4h offline cap' },
    effects: [{ type: 'offlineCapHours', value: 4 }],
  },
  {
    id: 'event_echo',
    order: 16,
    tier: 3,
    category: 'events',
    cost: 6,
    requires: ['golden_pulse'],
    name: { de: 'Event Echo', en: 'Event Echo' },
    description: {
      de: 'Aktive Event-Spieler sehen etwas häufiger Chancen.',
      en: 'Active event players see opportunities a little more often.',
    },
    effectSummary: { de: '+8 % Event-Spawnrate', en: '+8% event spawn rate' },
    effects: [{ type: 'eventSpawnRateMultiplier', value: 1.08 }],
  },
  {
    id: 'click_to_canopy',
    order: 17,
    tier: 3,
    category: 'active',
    cost: 6,
    requires: ['automation_wake'],
    name: { de: 'Click to Canopy', en: 'Click to Canopy' },
    description: {
      de: 'Aktive Runs behalten auch nach Prestige eine eigene Identität.',
      en: 'Active runs keep their own identity after prestige.',
    },
    effectSummary: { de: '+18 % BPC', en: '+18% BPC' },
    effects: [{ type: 'clickMultiplier', value: 1.18 }],
  },
  {
    id: 'shop_momentum',
    order: 18,
    tier: 3,
    category: 'shop',
    cost: 7,
    requires: ['cost_discipline'],
    name: { de: 'Shop Momentum', en: 'Shop Momentum' },
    description: {
      de: 'Der zweite Shopbogen zieht schneller an.',
      en: 'The second shop arc picks up faster.',
    },
    effectSummary: { de: '+14 % globale Produktion', en: '+14% global production' },
    effects: [{ type: 'globalMultiplier', value: 1.14 }],
  },
  {
    id: 'permanent_slot_i',
    order: 19,
    tier: 3,
    category: 'utility',
    cost: 8,
    requires: ['prestige_focus'],
    name: { de: 'Permanent Slot I', en: 'Permanent Slot I' },
    description: {
      de: 'Grundlage für spätere dauerhaft ausgerüstete Upgrades.',
      en: 'Foundation for later permanently equipped upgrades.',
    },
    effectSummary: { de: '+1 Permanent-Slot', en: '+1 permanent slot' },
    effects: [{ type: 'permanentUpgradeSlot', value: 1 }],
  },
  {
    id: 'permanent_slot_ii',
    order: 20,
    tier: 3,
    category: 'utility',
    cost: 10,
    requires: ['permanent_slot_i', 'research_discount_ii'],
    name: { de: 'Permanent Slot II', en: 'Permanent Slot II' },
    description: {
      de: 'Mehr Raum für spätere Build-Identität.',
      en: 'More room for future build identity.',
    },
    effectSummary: { de: '+1 Permanent-Slot', en: '+1 permanent slot' },
    effects: [{ type: 'permanentUpgradeSlot', value: 1 }],
  },
  {
    id: 'ascended_events',
    order: 21,
    tier: 4,
    category: 'events',
    cost: 12,
    requires: ['event_echo', 'prestige_focus'],
    name: { de: 'Ascended Events', en: 'Ascended Events' },
    description: {
      de: 'Events sind seltener Build-Hebel statt reiner Zufall.',
      en: 'Events become build levers rather than pure chance.',
    },
    effectSummary: {
      de: '+18 % Event-Rewards, +6 % Spawnrate',
      en: '+18% event rewards, +6% spawn rate',
    },
    effects: [
      { type: 'eventRewardMultiplier', value: 1.18 },
      { type: 'eventSpawnRateMultiplier', value: 1.06 },
    ],
  },
  {
    id: 'meta_greenhouse',
    order: 22,
    tier: 4,
    category: 'prestige',
    cost: 14,
    requires: ['shop_momentum', 'permanent_slot_i'],
    name: { de: 'Meta Greenhouse', en: 'Meta Greenhouse' },
    description: {
      de: 'Jeder weitere Run profitiert stärker von echter Ascension.',
      en: 'Every later run benefits more from actual ascension.',
    },
    effectSummary: { de: '+22 % globale Produktion', en: '+22% global production' },
    effects: [{ type: 'globalMultiplier', value: 1.22 }],
  },
  {
    id: 'runway_protocol',
    order: 23,
    tier: 4,
    category: 'prestige',
    cost: 16,
    requires: ['meta_greenhouse', 'offline_vault'],
    name: { de: 'Runway Protocol', en: 'Runway Protocol' },
    description: {
      de: 'Prestige-Runs starten fokussierter, ohne den Core Loop zu brechen.',
      en: 'Prestige runs start focused without breaking the core loop.',
    },
    effectSummary: {
      de: 'Starte mit 250 Buds und +1 Seedling',
      en: 'Start with 250 buds and +1 Seedling',
    },
    effects: [
      { type: 'startingBuds', value: 250 },
      { type: 'startingItem', itemId: 'seedling', value: 1 },
    ],
  },
  {
    id: 'botanical_legacy',
    order: 24,
    tier: 4,
    category: 'core',
    cost: 20,
    requires: ['ascended_events', 'runway_protocol', 'permanent_slot_ii'],
    name: { de: 'Botanical Legacy', en: 'Botanical Legacy' },
    description: {
      de: 'Ein Release-Midgame-Ziel: stark, sichtbar, aber nicht endlos.',
      en: 'A release-midgame goal: strong, visible, but not endless.',
    },
    effectSummary: {
      de: '+35 % global, +15 % Ascension-Seed-Ertrag',
      en: '+35% global, +15% ascension seed gain',
    },
    effects: [
      { type: 'globalMultiplier', value: 1.35 },
      { type: 'prestigeSeedMultiplier', value: 1.15 },
    ],
  },
];

export const ascensionNodeById = new Map(ascensionNodes.map((node) => [node.id, node]));
