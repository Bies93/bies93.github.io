export type AbilityTarget =
  | 'bps'
  | 'bpc'
  | 'auto'
  | 'cost'
  | 'event'
  | 'seed'
  | 'chain'
  | 'cooldown';

export interface AbilityUnlock {
  totalBuds?: number;
  prestigeSeeds?: number;
}

const ABILITY_DATA = [
  {
    id: 'overdrive',
    nameKey: 'abilities.overdrive.name',
    descriptionKey: 'abilities.overdrive.desc',
    durationSec: 12,
    cooldownSec: 75,
    baseMultiplier: 3.2,
    appliesTo: 'bps',
  },
  {
    id: 'burst',
    nameKey: 'abilities.burst.name',
    descriptionKey: 'abilities.burst.desc',
    durationSec: 10,
    cooldownSec: 70,
    baseMultiplier: 7,
    appliesTo: 'bpc',
  },
  {
    id: 'auto_burst',
    nameKey: 'abilities.autoBurst.name',
    descriptionKey: 'abilities.autoBurst.desc',
    durationSec: 14,
    cooldownSec: 110,
    baseMultiplier: 6,
    appliesTo: 'auto',
    unlock: { totalBuds: 2_500 },
  },
  {
    id: 'discount_window',
    nameKey: 'abilities.discountWindow.name',
    descriptionKey: 'abilities.discountWindow.desc',
    durationSec: 12,
    cooldownSec: 140,
    baseMultiplier: 0.85,
    appliesTo: 'cost',
    unlock: { totalBuds: 15_000 },
  },
  {
    id: 'event_magnet',
    nameKey: 'abilities.eventMagnet.name',
    descriptionKey: 'abilities.eventMagnet.desc',
    durationSec: 18,
    cooldownSec: 180,
    baseMultiplier: 1.9,
    appliesTo: 'event',
    unlock: { totalBuds: 120_000 },
  },
  {
    id: 'seed_focus',
    nameKey: 'abilities.seedFocus.name',
    descriptionKey: 'abilities.seedFocus.desc',
    durationSec: 16,
    cooldownSec: 210,
    baseMultiplier: 2,
    appliesTo: 'seed',
    unlock: { totalBuds: 650_000 },
  },
  {
    id: 'harvest_chain',
    nameKey: 'abilities.harvestChain.name',
    descriptionKey: 'abilities.harvestChain.desc',
    durationSec: 14,
    cooldownSec: 170,
    baseMultiplier: 1.65,
    appliesTo: 'chain',
    unlock: { prestigeSeeds: 2 },
  },
  {
    id: 'cooldown_sync',
    nameKey: 'abilities.cooldownSync.name',
    descriptionKey: 'abilities.cooldownSync.desc',
    durationSec: 2,
    cooldownSec: 260,
    baseMultiplier: 0.55,
    appliesTo: 'cooldown',
    unlock: { prestigeSeeds: 4 },
  },
] as const satisfies readonly {
  id: string;
  nameKey: string;
  descriptionKey: string;
  durationSec: number;
  cooldownSec: number;
  baseMultiplier: number;
  appliesTo: AbilityTarget;
  unlock?: AbilityUnlock;
}[];

type RawAbility = (typeof ABILITY_DATA)[number];

export type AbilityId = RawAbility['id'];

export type Ability = RawAbility & { id: AbilityId; appliesTo: AbilityTarget };

export const ABILITIES: readonly Ability[] = ABILITY_DATA;
