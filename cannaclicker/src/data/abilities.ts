const ABILITY_DATA = [
  {
    id: "overdrive",
    nameKey: "abilities.overdrive.name",
    descriptionKey: "abilities.overdrive.desc",
    durationSec: 10,
    cooldownSec: 60,
    baseMultiplier: 5,
    appliesTo: "bps",
  },
  {
    id: "burst",
    nameKey: "abilities.burst.name",
    descriptionKey: "abilities.burst.desc",
    durationSec: 5,
    cooldownSec: 45,
    baseMultiplier: 20,
    appliesTo: "bpc",
  },
];

type RawAbility = (typeof ABILITY_DATA)[number];

export type AbilityId = RawAbility["id"];

export type Ability = RawAbility & { id: AbilityId };

export const ABILITIES: readonly Ability[] = ABILITY_DATA;
