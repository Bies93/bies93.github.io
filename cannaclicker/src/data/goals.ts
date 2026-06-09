import type { LocaleKey } from '../app/i18n';
import type { AchievementRequirement } from './achievements';

export type GoalId =
  | 'first_clicks'
  | 'buy_seedlings'
  | 'unlock_planter'
  | 'reach_one_bps'
  | 'first_upgrade'
  | 'first_event'
  | 'first_seed'
  | 'first_research'
  | 'reach_hydro'
  | 'prestige_ready'
  | 'second_run'
  | 'midgame_research'
  | 'event_chain_intro'
  | 'active_build_goal'
  | 'automation_goal'
  | 'build_synergy_goal'
  | 'risk_event_goal'
  | 'season_goal'
  | 'achievement_score_goal'
  | 'prestige_loop_goal'
  | 'late_catalog_goal';

export type GoalReward =
  | { type: 'buds'; amount: number }
  | { type: 'seeds'; amount: number }
  | {
      type: 'boost';
      multiplier: number;
      durationMs: number;
      target?: 'bps' | 'bpc' | 'both' | 'cost';
    }
  | { type: 'none' };

export interface GoalDefinition {
  id: GoalId;
  title: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  rewardLabel: Record<LocaleKey, string>;
  requirement: AchievementRequirement;
  reward: GoalReward;
  order: number;
}

const GOAL_DATA = [
  {
    id: 'first_clicks',
    title: { de: 'Ernte die ersten Buds', en: 'Harvest the first buds' },
    description: { de: 'Klicke 10-mal auf die Pflanze.', en: 'Click the plant 10 times.' },
    rewardLabel: { de: '+15 Buds', en: '+15 buds' },
    requirement: { manualClicks: 10 },
    reward: { type: 'buds', amount: 15 },
    order: 10,
  },
  {
    id: 'buy_seedlings',
    title: { de: 'Baue eine Basis', en: 'Build a base' },
    description: { de: 'Besitze 10 Keimlinge.', en: 'Own 10 seedlings.' },
    rewardLabel: { de: '+75 Buds', en: '+75 buds' },
    requirement: { itemsOwned: { seedling: 10 } },
    reward: { type: 'buds', amount: 75 },
    order: 20,
  },
  {
    id: 'unlock_planter',
    title: { de: 'Mehr als Keimlinge', en: 'More than seedlings' },
    description: { de: 'Besitze 5 Töpfe.', en: 'Own 5 planters.' },
    rewardLabel: { de: '+150 Buds', en: '+150 buds' },
    requirement: { itemsOwned: { planter: 5 } },
    reward: { type: 'buds', amount: 150 },
    order: 30,
  },
  {
    id: 'reach_one_bps',
    title: { de: 'Passive Produktion', en: 'Passive production' },
    description: { de: 'Erreiche 1 Bud pro Sekunde.', en: 'Reach 1 bud per second.' },
    rewardLabel: { de: '+250 Buds', en: '+250 buds' },
    requirement: { bps: 1 },
    reward: { type: 'buds', amount: 250 },
    order: 40,
  },
  {
    id: 'first_upgrade',
    title: { de: 'Erstes Upgrade', en: 'First upgrade' },
    description: { de: 'Kaufe 1 Upgrade.', en: 'Buy 1 upgrade.' },
    rewardLabel: { de: '+400 Buds', en: '+400 buds' },
    requirement: { upgradeCount: 1 },
    reward: { type: 'buds', amount: 400 },
    order: 50,
  },
  {
    id: 'first_event',
    title: { de: 'Nutze ein Event', en: 'Use an event' },
    description: { de: 'Klicke 1 Zufallsevent.', en: 'Click 1 random event.' },
    rewardLabel: { de: '+750 Buds', en: '+750 buds' },
    requirement: { eventClicks: 1 },
    reward: { type: 'buds', amount: 750 },
    order: 60,
  },
  {
    id: 'first_seed',
    title: { de: 'Finde Seeds', en: 'Find seeds' },
    description: { de: 'Verdiene deinen ersten Seed.', en: 'Earn your first seed.' },
    rewardLabel: { de: '+1 Seed', en: '+1 seed' },
    requirement: { seedsEarned: 1 },
    reward: { type: 'seeds', amount: 1 },
    order: 70,
  },
  {
    id: 'first_research',
    title: { de: 'Erforsche eine Richtung', en: 'Research a direction' },
    description: { de: 'Schließe 1 Research-Knoten ab.', en: 'Complete 1 research node.' },
    rewardLabel: { de: '+1.500 Buds', en: '+1,500 buds' },
    requirement: { researchCount: 1 },
    reward: { type: 'buds', amount: 1_500 },
    order: 80,
  },
  {
    id: 'reach_hydro',
    title: { de: 'Hydro freilegen', en: 'Reach hydro' },
    description: { de: 'Mache Hydroponik-Racks sichtbar.', en: 'Make hydroponic racks visible.' },
    rewardLabel: { de: '+25.000 Buds', en: '+25,000 buds' },
    requirement: { totalBuds: 2_000_000 },
    reward: { type: 'buds', amount: 25_000 },
    order: 90,
  },
  {
    id: 'prestige_ready',
    title: { de: 'Prestige vorbereiten', en: 'Prepare prestige' },
    description: {
      de: 'Erreiche 3 Mio Lifetime-Buds im Run.',
      en: 'Reach 3M lifetime buds this run.',
    },
    rewardLabel: { de: 'Prestige wird sinnvoll', en: 'Prestige becomes worthwhile' },
    requirement: { totalBuds: 3_000_000 },
    reward: { type: 'none' },
    order: 100,
  },
  {
    id: 'second_run',
    title: { de: 'Zweiter Lauf', en: 'Second run' },
    description: { de: 'Führe dein erstes Prestige durch.', en: 'Perform your first prestige.' },
    rewardLabel: { de: '+2 Seeds', en: '+2 seeds' },
    requirement: { prestigeCount: 1 },
    reward: { type: 'seeds', amount: 2 },
    order: 110,
  },
  {
    id: 'midgame_research',
    title: { de: 'Build formen', en: 'Shape a build' },
    description: { de: 'Schließe 12 Research-Knoten ab.', en: 'Complete 12 research nodes.' },
    rewardLabel: { de: '+100.000 Buds', en: '+100,000 buds' },
    requirement: { researchCount: 12 },
    reward: { type: 'buds', amount: 100_000 },
    order: 120,
  },
  {
    id: 'event_chain_intro',
    title: { de: 'Ketten lesen', en: 'Read the chain' },
    description: { de: 'Klicke 5 Chain-Events.', en: 'Click 5 chain events.' },
    rewardLabel: { de: 'BPS-Boost x1,35 für 45s', en: 'BPS boost x1.35 for 45s' },
    requirement: { eventTypeClicks: { trail_marker: 2, cascade_bloom: 2, echo_harvest: 1 } },
    reward: { type: 'boost', multiplier: 1.35, durationMs: 45_000, target: 'bps' },
    order: 130,
  },
  {
    id: 'active_build_goal',
    title: { de: 'Aktive Linie', en: 'Active line' },
    description: { de: 'Erreiche 500 Klicks und 100 BPC.', en: 'Reach 500 clicks and 100 BPC.' },
    rewardLabel: { de: 'Klickboost x1,5 für 60s', en: 'Click boost x1.5 for 60s' },
    requirement: { manualClicks: 500, bpc: 100 },
    reward: { type: 'boost', multiplier: 1.5, durationMs: 60_000, target: 'bpc' },
    order: 140,
  },
  {
    id: 'automation_goal',
    title: { de: 'Automation anlaufen lassen', en: 'Spin up automation' },
    description: { de: 'Nutze aktive Fähigkeiten 25-mal.', en: 'Use active abilities 25 times.' },
    rewardLabel: { de: '+2 Seeds', en: '+2 seeds' },
    requirement: { abilityUses: 25 },
    reward: { type: 'seeds', amount: 2 },
    order: 150,
  },
  {
    id: 'build_synergy_goal',
    title: { de: 'Shop-Synergie', en: 'Shop synergy' },
    description: {
      de: 'Besitze 50 Grow Lights und 25 Grow Tents.',
      en: 'Own 50 Grow Lights and 25 Grow Tents.',
    },
    rewardLabel: { de: '+250.000 Buds', en: '+250,000 buds' },
    requirement: { itemsOwned: { grow_light: 50, grow_tent: 25 } },
    reward: { type: 'buds', amount: 250_000 },
    order: 160,
  },
  {
    id: 'risk_event_goal',
    title: { de: 'Risiko einordnen', en: 'Read the risk' },
    description: { de: 'Klicke 10 Risk-Events.', en: 'Click 10 risk events.' },
    rewardLabel: { de: 'Kostenfenster x0,85 für 45s', en: 'Cost window x0.85 for 45s' },
    requirement: { eventTypeClicks: { volatile_growth: 4, blackout_sale: 3, pest_scare: 3 } },
    reward: { type: 'boost', multiplier: 0.85, durationMs: 45_000, target: 'cost' },
    order: 170,
  },
  {
    id: 'season_goal',
    title: { de: 'Saisonfenster', en: 'Season window' },
    description: { de: 'Klicke 5 Seasonal-Events.', en: 'Click 5 seasonal events.' },
    rewardLabel: { de: '+3 Seeds', en: '+3 seeds' },
    requirement: { eventTypeClicks: { solstice_seed: 2, night_market: 2, festival_lantern: 1 } },
    reward: { type: 'seeds', amount: 3 },
    order: 180,
  },
  {
    id: 'achievement_score_goal',
    title: { de: 'Meta-Score starten', en: 'Start meta score' },
    description: { de: 'Erreiche 100 Achievement-Score.', en: 'Reach 100 achievement score.' },
    rewardLabel: { de: '+500.000 Buds', en: '+500,000 buds' },
    requirement: { achievementScore: 100 },
    reward: { type: 'buds', amount: 500_000 },
    order: 190,
  },
  {
    id: 'prestige_loop_goal',
    title: { de: 'Prestige-Schleife', en: 'Prestige loop' },
    description: { de: 'Führe 2 Prestiges durch.', en: 'Perform 2 prestiges.' },
    rewardLabel: { de: '+5 Seeds', en: '+5 seeds' },
    requirement: { prestigeCount: 2 },
    reward: { type: 'seeds', amount: 5 },
    order: 200,
  },
  {
    id: 'late_catalog_goal',
    title: { de: 'Katalog schließen', en: 'Close the catalogue' },
    description: {
      de: 'Schalte alle Shop-Items sichtbar frei.',
      en: 'Make every shop item visible.',
    },
    rewardLabel: { de: 'Global x1,25 für 90s', en: 'Global x1.25 for 90s' },
    requirement: { allItemsUnlocked: true },
    reward: { type: 'boost', multiplier: 1.25, durationMs: 90_000, target: 'both' },
    order: 210,
  },
] as const satisfies readonly GoalDefinition[];

export const goals: readonly GoalDefinition[] = [...GOAL_DATA].sort((a, b) => a.order - b.order);

export const goalById = new Map<GoalId, GoalDefinition>(goals.map((goal) => [goal.id, goal]));
