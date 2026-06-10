import Decimal from 'break_infinity.js';
import { rooms, roomById, type RoomDefinition, type RoomId } from '../data/rooms';
import { strains, strainById, type StrainDefinition, type StrainId } from '../data/strains';
import {
  contracts,
  contractById,
  type ContractDefinition,
  type ContractId,
  type ContractReward,
} from '../data/contracts';
import { seasons, seasonById, type SeasonDefinition, type SeasonId } from '../data/seasons';
import { eventMasteries, eventMasteryById } from '../data/eventMastery';
import { challenges, challengeById, type ChallengeDefinition, type ChallengeId } from '../data/challenges';
import { collectionById, collections, type CollectionDefinition, type CollectionId } from '../data/collections';
import { getAchievementScore, getRequirementProgress, type AchievementProgress } from './achievements';
import type { EventId } from './events';
import { EVENT_DEFINITIONS } from './events';
import type { GameState } from './state';

export interface RoomView {
  definition: RoomDefinition;
  level: number;
  nextLevel: RoomDefinition['levels'][number] | null;
  unlocked: boolean;
  affordable: boolean;
  lockReason: string;
}

export interface StrainView {
  definition: StrainDefinition;
  level: number;
  xp: number;
  nextXp: number | null;
  selected: boolean;
  unlocked: boolean;
  lockReason: string;
}

export interface ContractView {
  definition: ContractDefinition;
  active: boolean;
  completed: boolean;
  claimed: boolean;
  progress: AchievementProgress;
}

export interface SeasonView {
  definition: SeasonDefinition;
  active: boolean;
  unlocked: boolean;
}

export interface EventMasteryView {
  id: EventId;
  clicks: number;
  level: number;
  nextThreshold: number | null;
  rewardMultiplier: number;
}

export interface ChallengeView {
  definition: ChallengeDefinition;
  active: boolean;
  completed: boolean;
  unlocked: boolean;
  progress: number;
}

export interface CollectionView {
  definition: CollectionDefinition;
  owned: boolean;
}

export function applyDepthEffects(state: GameState): void {
  resetDepthTemp(state);
  applyRoomEffects(state);
  applySelectedStrainEffects(state);
  applyContractBuff(state);
  applySeasonEffects(state);
  applyChallengeEffects(state);
  applyCompletedChallengeRewards(state);
  applyCollectionEffects(state);
  updateAutomationTier(state);
}

function resetDepthTemp(state: GameState): void {
  state.temp.depthGlobalMult = new Decimal(1);
  state.temp.depthBpcMult = new Decimal(1);
  state.temp.depthCostMult = new Decimal(1);
  state.temp.depthPrestigeSeedMult = 1;
  state.temp.strainXpMult = 1;
  state.temp.challengeDisableEvents = false;
  state.temp.challengeDisablePassiveProduction = false;
  state.temp.challengeDisableAbilities = false;
  state.temp.challengeMaxPerItem = null;
  state.temp.challengeRiskOnlyEvents = false;
}

function applyRoomEffects(state: GameState): void {
  for (const room of rooms) {
    const level = getRoomLevel(state, room.id);
    for (const levelDefinition of room.levels.filter((entry) => entry.level <= level)) {
      applyRoomEffectList(state, levelDefinition.effects);
    }
  }
}

function applyRoomEffectList(state: GameState, effects: RoomDefinition['levels'][number]['effects']): void {
  for (const effect of effects) {
    switch (effect.type) {
      case 'globalMultiplier':
        state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(effect.value);
        break;
      case 'clickMultiplier':
        state.temp.depthBpcMult = state.temp.depthBpcMult.mul(effect.value);
        break;
      case 'costMultiplier':
        state.temp.depthCostMult = state.temp.depthCostMult.mul(effect.value);
        break;
      case 'offlineCapHours':
        state.temp.offlineCapMs += effect.value * 60 * 60 * 1000;
        break;
      case 'eventRewardMultiplier':
        state.temp.eventRewardMult *= effect.value;
        break;
      case 'eventDurationMultiplier':
        state.temp.eventDurationMult *= effect.value;
        break;
      case 'eventSpawnRateMultiplier':
        state.temp.eventSpawnRateMult *= effect.value;
        break;
      case 'researchCostMultiplier':
        state.temp.researchCostMult *= effect.value;
        break;
      case 'strainXpMultiplier':
        state.temp.strainXpMult *= effect.value;
        break;
      case 'autoClickRate':
        state.temp.autoClickRate += effect.value;
        break;
      case 'automationBpsShare':
        state.temp.automationBpsShare = Math.min(0.25, state.temp.automationBpsShare + effect.value);
        break;
    }
  }
}

function applySelectedStrainEffects(state: GameState): void {
  const selected = state.strains.selected;
  if (!selected) {
    return;
  }
  const definition = strainById.get(selected);
  if (!definition || !isStrainUnlocked(state, definition)) {
    return;
  }
  const index = Math.max(0, Math.min(2, getStrainLevel(state, selected) - 1));
  for (const effect of definition.effects) {
    const value = effect.values[index];
    switch (effect.type) {
      case 'clickMultiplier':
        state.temp.depthBpcMult = state.temp.depthBpcMult.mul(value);
        break;
      case 'globalMultiplier':
        state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(value);
        break;
      case 'eventRewardMultiplier':
        state.temp.eventRewardMult *= value;
        break;
      case 'eventDurationMultiplier':
        state.temp.eventDurationMult *= value;
        break;
      case 'offlineCapHours':
        state.temp.offlineCapMs += value * 60 * 60 * 1000;
        break;
      case 'autoClickRate':
        state.temp.autoClickRate += value;
        break;
      case 'automationBpsShare':
        state.temp.automationBpsShare = Math.min(0.25, state.temp.automationBpsShare + value);
        break;
      case 'prestigeSeedMultiplier':
        state.temp.depthPrestigeSeedMult *= value;
        break;
      case 'strainXpMultiplier':
        state.temp.strainXpMult *= value;
        break;
    }
  }
}

function applyContractBuff(state: GameState): void {
  const buff = state.contracts.activeBuff;
  if (!buff || buff.remainingRuns <= 0) {
    return;
  }
  switch (buff.target) {
    case 'bps':
      state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(buff.multiplier);
      break;
    case 'bpc':
      state.temp.depthBpcMult = state.temp.depthBpcMult.mul(buff.multiplier);
      break;
    case 'both':
      state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(buff.multiplier);
      state.temp.depthBpcMult = state.temp.depthBpcMult.mul(buff.multiplier);
      break;
    case 'events':
      state.temp.eventRewardMult *= buff.multiplier;
      state.temp.eventDurationMult *= Math.sqrt(buff.multiplier);
      break;
  }
}

function applySeasonEffects(state: GameState): void {
  const definition = seasonById.get(state.seasons.active);
  if (!definition || !state.seasons.unlocked.includes(definition.id)) {
    state.seasons.active = 'evergreen';
    return;
  }
  state.temp.eventRewardMult *= definition.rewardMultiplier;
}

function applyChallengeEffects(state: GameState): void {
  const id = state.challenges.activeId;
  if (!id) {
    return;
  }
  const definition = challengeById.get(id);
  if (!definition) {
    state.challenges.activeId = null;
    return;
  }
  for (const rule of definition.rules) {
    switch (rule.type) {
      case 'disableEvents':
        state.temp.challengeDisableEvents = true;
        break;
      case 'disablePassiveProduction':
        state.temp.challengeDisablePassiveProduction = true;
        break;
      case 'disableAbilities':
        state.temp.challengeDisableAbilities = true;
        break;
      case 'costMultiplier':
        state.temp.depthCostMult = state.temp.depthCostMult.mul(rule.value);
        break;
      case 'eventCategoryFocus':
        state.temp.challengeRiskOnlyEvents = true;
        break;
      case 'maxPerItem':
        state.temp.challengeMaxPerItem = rule.value;
        break;
    }
  }
}

function applyCompletedChallengeRewards(state: GameState): void {
  for (const challenge of challenges) {
    if (!state.challenges.completed[challenge.id]) {
      continue;
    }
    for (const reward of challenge.rewards) {
      switch (reward.type) {
        case 'globalMultiplier':
          state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(reward.value);
          break;
        case 'clickMultiplier':
          state.temp.depthBpcMult = state.temp.depthBpcMult.mul(reward.value);
          break;
        case 'offlineCapHours':
          state.temp.offlineCapMs += reward.value * 60 * 60 * 1000;
          break;
        case 'eventRewardMultiplier':
          state.temp.eventRewardMult *= reward.value;
          break;
        case 'cosmetic':
          unlockCollection(state, reward.id);
          break;
      }
    }
  }
}

function applyCollectionEffects(state: GameState): void {
  const score = computeCollectionScore(state);
  state.collections.score = score;
  const multiplier = 1 + Math.min(0.03, score * 0.0005);
  state.temp.depthGlobalMult = state.temp.depthGlobalMult.mul(multiplier);
}

function updateAutomationTier(state: GameState): void {
  let tier = 0;
  if ((state.prestige.totalAscensionSeeds ?? 0) >= 1) tier = Math.max(tier, 1);
  if (getRoomLevel(state, 'automation_garage') >= 1) tier = Math.max(tier, 2);
  if (getRoomLevel(state, 'automation_garage') >= 3) tier = Math.max(tier, 3);
  if (state.meta.abilityUsesTotal >= 50) tier = Math.max(tier, 4);
  if (getRoomLevel(state, 'event_observatory') >= 3) tier = Math.max(tier, 5);
  state.automation.unlockedTier = Math.max(state.automation.unlockedTier ?? 0, tier);
  if (state.automation.unlockedTier < 2) {
    state.automation.autoBuyMode = 'off';
  }
  if (state.automation.unlockedTier < 4) {
    state.automation.abilityMode = 'manual';
  }
}

export function getRoomLevel(state: GameState, id: RoomId): number {
  return Math.max(0, Math.min(5, Math.floor(state.rooms.levels[id] ?? 0)));
}

export function getRoomViews(state: GameState): RoomView[] {
  return rooms.map((definition) => {
    const level = getRoomLevel(state, definition.id);
    const nextLevel = definition.levels.find((entry) => entry.level === level + 1) ?? null;
    const unlocked = isRoomUnlocked(state, definition);
    return {
      definition,
      level,
      nextLevel,
      unlocked,
      affordable: Boolean(nextLevel && unlocked && canAffordRoomLevel(state, nextLevel.cost)),
      lockReason: unlocked ? '' : definition.unlockHint[state.locale],
    };
  });
}

export function upgradeRoom(state: GameState, id: RoomId): boolean {
  const definition = roomById.get(id);
  if (!definition || !isRoomUnlocked(state, definition)) {
    return false;
  }
  const level = getRoomLevel(state, id);
  const next = definition.levels.find((entry) => entry.level === level + 1);
  if (!next || !canAffordRoomLevel(state, next.cost)) {
    return false;
  }
  if (next.cost.buds) state.buds = state.buds.sub(next.cost.buds);
  if (next.cost.ascensionSeeds) {
    state.prestige.ascensionSeeds -= next.cost.ascensionSeeds;
    state.prestige.ascensionSpent += next.cost.ascensionSeeds;
  }
  if (next.cost.contractTokens) state.contracts.tokens -= next.cost.contractTokens;
  state.rooms.levels[id] = next.level;
  state.rooms.lastUpgradedAt = Date.now();
  state.temp.needsRecalc = true;
  return true;
}

function canAffordRoomLevel(state: GameState, cost: RoomDefinition['levels'][number]['cost']): boolean {
  if (cost.buds && state.buds.lessThan(cost.buds)) return false;
  if (cost.ascensionSeeds && (state.prestige.ascensionSeeds ?? 0) < cost.ascensionSeeds) return false;
  if (cost.achievementScore && getAchievementScore(state) < cost.achievementScore) return false;
  if (cost.contractTokens && state.contracts.tokens < cost.contractTokens) return false;
  return true;
}

function isRoomUnlocked(state: GameState, definition: RoomDefinition): boolean {
  switch (definition.id) {
    case 'starter_corner':
      return state.total.greaterThanOrEqualTo(25_000) || (state.prestige.totalAscensionSeeds ?? 0) > 0;
    case 'hydro_bay':
      return state.total.greaterThanOrEqualTo(1_000_000) || (state.prestige.totalAscensionSeeds ?? 0) >= 1;
    case 'climate_room':
      return state.meta.eventStats.totalClicks >= 10 || (state.prestige.totalAscensionSeeds ?? 0) >= 1;
    case 'genetics_lab_wing':
      return state.researchOwned.length >= 8 || (state.prestige.totalAscensionSeeds ?? 0) >= 2;
    case 'automation_garage':
      return state.meta.abilityUsesTotal >= 25 || (state.prestige.totalAscensionSeeds ?? 0) >= 2;
    case 'event_observatory':
      return state.meta.eventStats.totalClicks >= 35 || state.meta.prestigeCount >= 2;
  }
}

export function getStrainLevel(state: GameState, id: StrainId): number {
  const definition = strainById.get(id);
  const xp = state.strains.xp[id] ?? 0;
  if (!definition) return 1;
  const earned = definition.xpThresholds.filter((threshold) => xp >= threshold).length;
  const stored = Math.max(1, Math.floor(state.strains.levels[id] ?? 1));
  return Math.max(stored, Math.max(1, earned));
}

export function getStrainViews(state: GameState): StrainView[] {
  return strains.map((definition) => {
    const xp = state.strains.xp[definition.id] ?? 0;
    const level = getStrainLevel(state, definition.id);
    const nextXp = definition.xpThresholds[level - 1] ?? null;
    const unlocked = isStrainUnlocked(state, definition);
    return {
      definition,
      level,
      xp,
      nextXp,
      selected: state.strains.selected === definition.id,
      unlocked,
      lockReason: unlocked ? '' : definition.unlockHint[state.locale],
    };
  });
}

export function selectStrain(state: GameState, id: StrainId): boolean {
  const definition = strainById.get(id);
  if (!definition || !isStrainUnlocked(state, definition)) {
    return false;
  }
  state.strains.selected = id;
  state.strains.selections[id] = (state.strains.selections[id] ?? 0) + 1;
  state.strains.levels[id] = getStrainLevel(state, id);
  state.temp.needsRecalc = true;
  return true;
}

export function awardStrainXp(state: GameState, baseAmount: number): void {
  const selected = state.strains.selected;
  if (!selected || baseAmount <= 0) {
    return;
  }
  const multiplier = Math.max(1, state.temp.strainXpMult ?? 1);
  const nextXp = (state.strains.xp[selected] ?? 0) + Math.max(1, Math.round(baseAmount * multiplier));
  state.strains.xp[selected] = nextXp;
  state.strains.levels[selected] = getStrainLevel(state, selected);
}

function isStrainUnlocked(state: GameState, definition: StrainDefinition): boolean {
  switch (definition.id) {
    case 'sativa_spark':
      return true;
    case 'indica_canopy':
      return state.bps.greaterThanOrEqualTo(1) || state.total.greaterThanOrEqualTo(10_000);
    case 'hybrid_bloom':
      return state.meta.eventStats.totalClicks >= 3 || state.total.greaterThanOrEqualTo(100_000);
    case 'ruderalis_loop':
      return state.meta.abilityUsesTotal >= 10 || state.researchOwned.includes('r_ctrl_routines');
    case 'deep_root':
      return state.meta.prestigeCount >= 1 || (state.prestige.totalAscensionSeeds ?? 0) >= 1;
  }
}

export function ensureContractOffers(state: GameState): void {
  state.contracts.offers = state.contracts.offers.filter(
    (id) => contractById.has(id) && !state.contracts.claimed[id],
  );
  if (state.contracts.offers.length >= 3) {
    return;
  }
  const completedCount = Object.values(state.contracts.completed).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );
  const seed = state.meta.prestigeCount + completedCount;
  const byDifficulty = (difficulty: ContractDefinition['difficulty']) => {
    const unclaimed = contracts.filter(
      (contract) =>
        contract.difficulty === difficulty &&
        !state.contracts.claimed[contract.id] &&
        !state.contracts.offers.includes(contract.id) &&
        state.contracts.activeId !== contract.id,
    );
    return unclaimed.length > 0
      ? unclaimed
      : contracts.filter((contract) => contract.difficulty === difficulty);
  };
  const choose = (list: ContractDefinition[], offset: number) => {
    const selected = list[(seed + offset) % list.length] ?? list[0];
    return selected?.id ?? contracts[0]!.id;
  };
  state.contracts.offers = [
    choose(byDifficulty('easy'), 0),
    choose(byDifficulty('medium'), 1),
    choose(byDifficulty('hard'), 2),
  ];
}

export function getContractViews(state: GameState): ContractView[] {
  ensureContractOffers(state);
  const ids = new Set<ContractId>([...state.contracts.offers]);
  if (state.contracts.activeId) ids.add(state.contracts.activeId);
  return [...ids]
    .map((id) => contractById.get(id))
    .filter((definition): definition is ContractDefinition => Boolean(definition))
    .sort((a, b) => a.order - b.order)
    .map((definition) => {
      const progress = getRequirementProgress(state, definition.requirement);
      return {
        definition,
        active: state.contracts.activeId === definition.id,
        completed: progress.complete,
        claimed: Boolean(state.contracts.claimed[definition.id]),
        progress,
      };
    });
}

export function acceptContract(state: GameState, id: ContractId): boolean {
  ensureContractOffers(state);
  if (state.contracts.activeId || !state.contracts.offers.includes(id)) {
    return false;
  }
  state.contracts.activeId = id;
  return true;
}

export function claimActiveContract(state: GameState): boolean {
  const id = state.contracts.activeId;
  if (!id) {
    return false;
  }
  const definition = contractById.get(id);
  if (!definition || state.contracts.claimed[id]) {
    return false;
  }
  const progress = getRequirementProgress(state, definition.requirement);
  if (!progress.complete) {
    return false;
  }
  for (const reward of definition.rewards) {
    applyContractReward(state, reward);
  }
  state.contracts.completed[id] = (state.contracts.completed[id] ?? 0) + 1;
  state.contracts.claimed[id] = true;
  state.contracts.activeId = null;
  state.contracts.offers = state.contracts.offers.filter((offer) => offer !== id);
  ensureContractOffers(state);
  state.temp.needsRecalc = true;
  return true;
}

function applyContractReward(state: GameState, reward: ContractReward): void {
  switch (reward.type) {
    case 'tokens':
      state.contracts.tokens += reward.amount;
      break;
    case 'nextRunBoost':
      state.contracts.pendingBuff = {
        target: reward.target,
        multiplier: reward.multiplier,
        remainingRuns: 1,
      };
      break;
    case 'cosmetic':
      unlockCollection(state, reward.id);
      break;
  }
}

export function getSeasonViews(state: GameState): SeasonView[] {
  refreshSeasonUnlocks(state);
  return seasons.map((definition) => ({
    definition,
    active: state.seasons.active === definition.id,
    unlocked: state.seasons.unlocked.includes(definition.id),
  }));
}

export function activateSeason(state: GameState, id: SeasonId): boolean {
  refreshSeasonUnlocks(state);
  if (!state.seasons.unlocked.includes(id)) {
    return false;
  }
  state.seasons.active = id;
  state.temp.needsRecalc = true;
  return true;
}

export function refreshSeasonUnlocks(state: GameState): void {
  const unlocked = new Set<SeasonId>(state.seasons.unlocked.length ? state.seasons.unlocked : ['evergreen']);
  if (getAchievementScore(state) >= 150) unlocked.add('sunshift');
  if (state.meta.prestigeCount >= 1 || (state.prestige.totalAscensionSeeds ?? 0) >= 1) unlocked.add('nightMarket');
  if (state.meta.prestigeCount >= 2 || state.contracts.tokens >= 8) unlocked.add('festival');
  state.seasons.unlocked = [...unlocked];
  if (!state.seasons.unlocked.includes(state.seasons.active)) {
    state.seasons.active = 'evergreen';
  }
}

export function getSeasonEventWeightMultiplier(state: GameState, id: EventId): number {
  const season = seasonById.get(state.seasons.active);
  if (!season) {
    return 1;
  }
  const definition = EVENT_DEFINITIONS[id];
  let multiplier = season.eventWeights[id] ?? 1;
  if (definition.season === season.id && season.id !== 'evergreen') {
    multiplier *= 1.4;
  }
  if (state.temp.challengeRiskOnlyEvents) {
    multiplier *= definition.category === 'risk' ? 3 : 0.2;
  }
  return Math.max(0.05, multiplier);
}

export function getEventMasteryViews(state: GameState): EventMasteryView[] {
  return eventMasteries.map((definition) => {
    const clicks = state.meta.eventStats.perEvent[definition.id]?.clicks ?? 0;
    const level = getEventMasteryLevel(state, definition.id);
    const nextThreshold = definition.thresholds[level] ?? null;
    return {
      id: definition.id,
      clicks,
      level,
      nextThreshold,
      rewardMultiplier: getEventMasteryRewardMultiplier(state, definition.id),
    };
  });
}

export function getEventMasteryLevel(state: GameState, id: EventId): number {
  const definition = eventMasteryById.get(id);
  if (!definition) {
    return 0;
  }
  const clicks = state.meta.eventStats.perEvent[id]?.clicks ?? 0;
  return definition.thresholds.filter((threshold) => clicks >= threshold).length;
}

export function getEventMasteryRewardMultiplier(state: GameState, id: EventId): number {
  const level = getEventMasteryLevel(state, id);
  return 1 + Math.min(0.06, level * 0.02);
}

export function getChallengeViews(state: GameState): ChallengeView[] {
  refreshChallengeUnlocks(state);
  return challenges.map((definition) => {
    const progress = definition.targetLifetimeBuds > 0
      ? Math.min(1, state.prestige.lifetimeBuds.toNumber() / definition.targetLifetimeBuds)
      : 0;
    return {
      definition,
      active: state.challenges.activeId === definition.id,
      completed: Boolean(state.challenges.completed[definition.id]),
      unlocked: state.challenges.unlocked.includes(definition.id),
      progress,
    };
  });
}

export function startChallenge(state: GameState, id: ChallengeId): boolean {
  refreshChallengeUnlocks(state);
  if (!state.challenges.unlocked.includes(id) || state.challenges.activeId) {
    return false;
  }
  state.challenges.activeId = id;
  state.challenges.startedAt = Date.now();
  state.challenges.attempts[id] = (state.challenges.attempts[id] ?? 0) + 1;
  state.temp.needsRecalc = true;
  return true;
}

export function abandonChallenge(state: GameState): boolean {
  if (!state.challenges.activeId) {
    return false;
  }
  state.challenges.activeId = null;
  state.challenges.startedAt = 0;
  state.temp.needsRecalc = true;
  return true;
}

export function completeActiveChallengeIfMet(state: GameState): ChallengeId | null {
  const id = state.challenges.activeId;
  if (!id) {
    return null;
  }
  const definition = challengeById.get(id);
  if (!definition) {
    state.challenges.activeId = null;
    return null;
  }
  const lifetimeMet = state.prestige.lifetimeBuds.greaterThanOrEqualTo(definition.targetLifetimeBuds);
  const riskMet =
    id === 'risk_market' &&
    ['volatile_growth', 'blackout_sale', 'pest_scare'].reduce(
      (sum, eventId) => sum + (state.meta.eventStats.perEvent[eventId as EventId]?.clicks ?? 0),
      0,
    ) >= 20;
  const manualMet = id === 'manual_garden' && state.bpc.greaterThanOrEqualTo(750);
  if (!lifetimeMet && !riskMet && !manualMet) {
    return null;
  }
  state.challenges.completed[id] = true;
  state.challenges.activeId = null;
  state.challenges.startedAt = 0;
  for (const reward of definition.rewards) {
    if (reward.type === 'cosmetic') {
      unlockCollection(state, reward.id);
    }
  }
  return id;
}

function refreshChallengeUnlocks(state: GameState): void {
  const unlocked = new Set<ChallengeId>(state.challenges.unlocked);
  if (state.meta.prestigeCount >= 1) unlocked.add('no_events');
  if (state.meta.manualClicks >= 500) unlocked.add('manual_garden');
  if (state.meta.abilityUsesTotal >= 25) unlocked.add('silent_greenhouse');
  if (getAchievementScore(state) >= 100) unlocked.add('budget_run');
  const riskClicks = ['volatile_growth', 'blackout_sale', 'pest_scare'].reduce(
    (sum, eventId) => sum + (state.meta.eventStats.perEvent[eventId as EventId]?.clicks ?? 0),
    0,
  );
  if (riskClicks >= 10) unlocked.add('risk_market');
  if (state.total.greaterThanOrEqualTo(2_000_000) || state.meta.prestigeCount >= 1) unlocked.add('tiny_pot');
  state.challenges.unlocked = [...unlocked];
}

export function getCollectionViews(state: GameState): CollectionView[] {
  return collections.map((definition) => ({
    definition,
    owned: state.collections.owned.includes(definition.id),
  }));
}

export function unlockCollection(state: GameState, id: string): void {
  const definition = collectionById.get(id as CollectionId);
  if (!definition || state.collections.owned.includes(definition.id)) {
    return;
  }
  state.collections.owned = [...state.collections.owned, definition.id];
  state.collections.score = computeCollectionScore(state);
}

function computeCollectionScore(state: GameState): number {
  return state.collections.owned.reduce((score, id) => score + (collectionById.get(id)?.score ?? 0), 0);
}
