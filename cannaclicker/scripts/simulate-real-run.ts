import Decimal from 'break_infinity.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultState, type GameState } from '../src/app/state';
import {
  buyItem,
  buyUpgrade,
  evaluateAchievements,
  handleManualClick,
  recalcDerivedValues,
} from '../src/app/game';
import { getShopEntries } from '../src/app/shop';
import { purchaseResearch, getResearchList } from '../src/app/research';
import { advanceEventPipeline, clearExpiredEventBoost, resolveEventClick } from '../src/app/events';
import { clearExpiredKickstart } from '../src/app/milestones';
import { processSeedSystems } from '../src/app/seeds';
import { getPrestigePreview, performPrestige } from '../src/app/prestige';
import { updateAbilityTimers } from '../src/app/abilities';
import { upgrades } from '../src/data/upgrades';
import type { UpgradeId } from '../src/data/upgrades';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = resolve(root, 'docs/balance');
const originalDateNow = Date.now;
const originalRandom = Math.random;

interface Profile {
  id: string;
  name: string;
  clicksPerSecond: number;
  eventCatchRate: number;
  prestigeBias: number;
  shopAggression: number;
  upgradeReserveSeconds: number;
}

interface Checkpoint {
  minutes: number;
  buds: string;
  lifetimeBuds: string;
  bps: string;
  bpc: string;
  totalItems: number;
  upgrades: number;
  research: number;
  eventSpawns: number;
  eventClicks: number;
  seeds: number;
  ascensionSeeds: number;
  prestiges: number;
}

const profiles: Profile[] = [
  {
    id: 'semi-idle',
    name: 'Semi-idle 0.25 cps',
    clicksPerSecond: 0.25,
    eventCatchRate: 0.38,
    prestigeBias: 1.08,
    shopAggression: 0.92,
    upgradeReserveSeconds: 60,
  },
  {
    id: 'normal-active',
    name: 'Normal active 1 cps',
    clicksPerSecond: 1,
    eventCatchRate: 0.72,
    prestigeBias: 1,
    shopAggression: 1,
    upgradeReserveSeconds: 35,
  },
  {
    id: 'active-2cps',
    name: 'Active 2 cps',
    clicksPerSecond: 2,
    eventCatchRate: 0.82,
    prestigeBias: 0.96,
    shopAggression: 1.08,
    upgradeReserveSeconds: 25,
  },
  {
    id: 'event-focused',
    name: 'Event-focused 90% catch',
    clicksPerSecond: 1.25,
    eventCatchRate: 0.9,
    prestigeBias: 1,
    shopAggression: 1.02,
    upgradeReserveSeconds: 30,
  },
  {
    id: 'prestige-rusher',
    name: 'Prestige rusher',
    clicksPerSecond: 0.9,
    eventCatchRate: 0.62,
    prestigeBias: 1.32,
    shopAggression: 0.86,
    upgradeReserveSeconds: 20,
  },
  {
    id: 'mobile-slow',
    name: 'Mobile slow',
    clicksPerSecond: 0.55,
    eventCatchRate: 0.58,
    prestigeBias: 1.12,
    shopAggression: 0.95,
    upgradeReserveSeconds: 45,
  },
];

const checkpointsMinutes = [30, 90, 240, 600];

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function setSimClock(now: number): void {
  Date.now = () => now;
}

function tickState(state: GameState, seconds: number, now: number): void {
  const production = state.bps.mul(seconds);
  if (production.greaterThan(0)) {
    state.buds = state.buds.add(production);
    state.total = state.total.add(production);
    state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(production);
  }

  if (state.temp.autoClickRate > 0) {
    const autoClicks = new Decimal(state.temp.autoClickRate * seconds);
    const automationBpsGain = state.bps
      .mul(Math.max(0, state.temp.automationBpsShare ?? 0))
      .mul(seconds);
    const autoGain = state.bpc.mul(autoClicks).add(automationBpsGain);
    if (autoGain.greaterThan(0)) {
      state.buds = state.buds.add(autoGain);
      state.total = state.total.add(autoGain);
      state.prestige.lifetimeBuds = state.prestige.lifetimeBuds.add(autoGain);
    }
  }

  const abilityChanged = updateAbilityTimers(state, now);
  const eventEnded = clearExpiredEventBoost(state, now);
  const kickstartExpired = clearExpiredKickstart(state, now);
  if (abilityChanged || eventEnded || kickstartExpired || state.temp.needsRecalc) {
    state.temp.needsRecalc = false;
    recalcDerivedValues(state);
  }

  processSeedSystems(state, seconds, now);
  advanceEventPipeline(state, seconds, now);
}

function clickForProfile(state: GameState, profile: Profile, clickAccumulator: number): number {
  let nextAccumulator = clickAccumulator + profile.clicksPerSecond;
  while (nextAccumulator >= 1) {
    handleManualClick(state);
    nextAccumulator -= 1;
  }
  return nextAccumulator;
}

function catchEvents(state: GameState, profile: Profile, rng: () => number, now: number): void {
  for (const event of [...state.events.active]) {
    if (rng() <= profile.eventCatchRate) {
      resolveEventClick(state, event.token, now);
    }
  }
}

function buyBestShopOptions(state: GameState, profile: Profile): void {
  let purchases = 0;
  while (purchases < 3) {
    const entries = getShopEntries(state)
      .filter((entry) => entry.unlocked && entry.affordable)
      .sort((a, b) => {
        const aRoi = a.roi ?? Number.POSITIVE_INFINITY;
        const bRoi = b.roi ?? Number.POSITIVE_INFINITY;
        return aRoi - bRoi || a.cost.cmp(b.cost);
      });
    const best = entries[0];
    if (!best) {
      return;
    }
    const reserve = state.bps.mul(profile.upgradeReserveSeconds);
    if (state.buds.lessThan(best.cost.mul(profile.shopAggression)) && state.buds.lessThan(reserve)) {
      return;
    }
    if (!buyItem(state, best.definition.id, 1)) {
      return;
    }
    purchases += 1;
  }
}

function buyAvailableUpgrades(state: GameState): void {
  const affordable = upgrades
    .filter((upgrade) => !state.upgrades[upgrade.id] && state.buds.greaterThanOrEqualTo(upgrade.cost))
    .sort((a, b) => a.cost - b.cost);

  for (const upgrade of affordable.slice(0, 4)) {
    buyUpgrade(state, upgrade.id as UpgradeId);
  }
}

function buyAvailableResearch(state: GameState): void {
  const available = getResearchList(state, 'available')
    .filter((entry) => entry.affordable)
    .sort((a, b) => a.node.cost - b.node.cost);

  for (const entry of available.slice(0, 3)) {
    purchaseResearch(state, entry.node.id);
  }
}

function maybePrestige(state: GameState, profile: Profile, elapsedMinutes: number): void {
  const preview = getPrestigePreview(state);
  if (!preview.requirementMet || preview.seedGain <= 0) {
    return;
  }

  const targetMinutes = 82 * profile.prestigeBias;
  const worthwhileGain = state.meta.prestigeCount === 0 ? preview.seedGain >= 1 : preview.seedGain >= 2;
  if (elapsedMinutes >= targetMinutes && worthwhileGain) {
    performPrestige(state);
    recalcDerivedValues(state);
  }
}

function snapshot(state: GameState, minutes: number): Checkpoint {
  return {
    minutes,
    buds: state.buds.toString(),
    lifetimeBuds: state.prestige.lifetimeBuds.toString(),
    bps: state.bps.toString(),
    bpc: state.bpc.toString(),
    totalItems: Object.values(state.items).reduce((sum, amount) => sum + (amount ?? 0), 0),
    upgrades: Object.values(state.upgrades).filter(Boolean).length,
    research: state.researchOwned.length,
    eventSpawns: state.meta.eventStats.totalSpawns,
    eventClicks: state.meta.eventStats.totalClicks,
    seeds: state.prestige.seeds,
    ascensionSeeds: state.prestige.ascensionSeeds,
    prestiges: state.meta.prestigeCount,
  } satisfies Checkpoint;
}

function runProfile(profile: Profile): Checkpoint[] {
  const rng = createRng(profile.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 1337));
  Math.random = rng;
  const start = 1_800_000_000_000;
  setSimClock(start);
  const state = createDefaultState({ time: start });
  state.prestige.lastResetAt = start;
  state.lastSeenAt = start;
  recalcDerivedValues(state);

  const checkpoints = new Map(checkpointsMinutes.map((minutes) => [minutes, false]));
  const results: Checkpoint[] = [];
  let clickAccumulator = 0;
  const stepSeconds = 5;

  for (let second = stepSeconds; second <= 600 * 60; second += stepSeconds) {
    const now = start + second * 1000;
    setSimClock(now);
    tickState(state, stepSeconds, now);
    for (let i = 0; i < stepSeconds; i += 1) {
      clickAccumulator = clickForProfile(state, profile, clickAccumulator);
    }
    catchEvents(state, profile, rng, now);

    if (second % 30 === 0) {
      buyAvailableUpgrades(state);
      buyAvailableResearch(state);
      buyBestShopOptions(state, profile);
    }

    if (second % 120 === 0) {
      evaluateAchievements(state);
    }

    if (second % 30 === 0) {
      maybePrestige(state, profile, second / 60);
    }

    const minute = second / 60;
    if (Number.isInteger(minute) && checkpoints.has(minute) && !checkpoints.get(minute)) {
      checkpoints.set(minute, true);
      results.push(snapshot(state, minute));
    }
  }

  return results;
}

function formatNumber(value: string | number): string {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  if (numeric >= 1_000_000_000_000) {
    return `${(numeric / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (numeric >= 1_000_000_000) {
    return `${(numeric / 1_000_000_000).toFixed(2)}B`;
  }
  if (numeric >= 1_000_000) {
    return `${(numeric / 1_000_000).toFixed(2)}M`;
  }
  if (numeric >= 1_000) {
    return `${(numeric / 1_000).toFixed(1)}k`;
  }
  return numeric.toFixed(numeric >= 10 ? 0 : 2);
}

function renderResults(allResults: { profile: Profile; checkpoints: Checkpoint[] }[]): string {
  const rows = allResults
    .flatMap(({ profile, checkpoints }) =>
      checkpoints.map(
        (row) =>
          `| ${profile.name} | ${row.minutes} | ${formatNumber(row.buds)} | ${formatNumber(row.lifetimeBuds)} | ${formatNumber(row.bps)} | ${formatNumber(row.bpc)} | ${row.totalItems} | ${row.upgrades} | ${row.research} | ${row.eventClicks}/${row.eventSpawns} | ${row.seeds} | ${row.ascensionSeeds} | ${row.prestiges} |`,
      ),
    )
    .join('\n');

  return `# Real Balance Simulation Results

Generated by \`npm run balance:simulate\`.

This pass uses the real game state and core gameplay functions:

- \`createDefaultState()\`
- \`recalcDerivedValues()\`
- \`handleManualClick()\`
- \`buyItem()\`
- \`buyUpgrade()\`
- \`purchaseResearch()\`
- \`advanceEventPipeline()\`
- \`resolveEventClick()\`
- \`performPrestige()\`

It is deterministic and intentionally lightweight. It is not a unit-test suite.

| Profile | Minutes | Buds held | Run lifetime Buds | BPS | BPC | Items | Upgrades | Research | Events clicked/spawned | Run Seeds | Ascension Seeds | Prestiges |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Release Checks

- First 30 minutes are simulated for semi-idle, normal active, active, event-focused, prestige-rusher, and mobile-slow profiles.
- First prestige timing is checked through 90 minutes and longer 4h/10h runs.
- Event-focused profile uses 90% event catch rate to stress event acceleration and seed drops.
- Event rewards now run through a phase budget before being applied.
- Early events require first item ownership, 90 seconds of run time, and at least 120 total Buds.
`;
}

function renderTargets(): string {
  return `# Phase Targets: 2-20 Hour Release Curve

Generated by \`npm run balance:simulate\`.

| Window | Phase | Target Buds | Target BPS | Target BPC | Items | Upgrades | Research | Events | Seeds | Prestige | Active Share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-5 min | First Click / First Item | 80-650 | 0.2-5 | 1-3 | 1-6 | 0-1 | 0 | 0 | 0 | 0 | 80% |
| 5-30 min | Early Automation | 5k-180k | 35-1.8k | 5-28 | 18-80 | 3-12 | 0-3 | 2-7 | 0-2 | 0 | 55-70% |
| 30-90 min | First Strategy | 300k-6M | 3k-55k | 35-180 | 85-260 | 12-28 | 4-14 | 8-20 | 2-8 | 0-1 ready | 35-55% |
| 1.5-4 h | Post-Prestige Acceleration | 8M-180M | 80k-1.5M | 220-900 | 240-620 | 25-52 | 12-28 | 18-55 | 8-35 | 1-3 | 25-45% |
| 4-10 h | Release Midgame | 220M-18B | 2M-110M | 1.2k-9k | 620-1.4k | 48-82 | 26-44 | 55-140 | 35-130 | 3-8 | 18-35% |

## Event Budget

Event rewards are budgeted per 5-minute rolling phase window:

- 0-5 min: max 15% progress acceleration.
- 5-30 min: max 35% progress acceleration.
- 30-90 min: max 60% progress acceleration.
- Post-prestige/event-build states can exceed this only through purchased Research or Ascension investment.
`;
}

try {
  const allResults = profiles.map((profile) => ({ profile, checkpoints: runProfile(profile) }));
  mkdirSync(docsDir, { recursive: true });
  writeFileSync(resolve(docsDir, 'phase-targets-2-20h.md'), renderTargets());
  writeFileSync(resolve(docsDir, 'simulation-results.md'), renderResults(allResults));
  console.log(
    `Real balance simulation written: ${profiles.length} profiles, ${
      profiles.length * checkpointsMinutes.length
    } checkpoints.`,
  );
} finally {
  Date.now = originalDateNow;
  Math.random = originalRandom;
}
