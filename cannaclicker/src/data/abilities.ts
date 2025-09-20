export type AbilityId = "overdrive" | "burst";

export type Ability = {
  id: AbilityId;
  nameKey: string;
  descriptionKey: string;
  durationSec: number;
  cooldownSec: number;
  baseMultiplier: number;
  appliesTo: "bps" | "bpc";
};

export const ABILITIES: Ability[] = [
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
