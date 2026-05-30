export type AbilityTarget = 'bps' | 'bpc' | 'auto' | 'cost';

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
