# Prestige

Stand: Sprint 7

## Modell

Prestige ist ein bewusster Soft-Reset:

| Reset                     | Bleibt                                                     |
| ------------------------- | ---------------------------------------------------------- |
| Buds                      | Spendable Seeds                                            |
| Shop-Items                | Total Seeds Earned                                         |
| normale Upgrades          | Prestige-Multiplikator                                     |
| aktueller Run-Fortschritt | Research ohne `resetsOnPrestige`, Achievements, Milestones |

## Formel

| Wert           | Definition                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Mindestwert    | `1,000,000` Lifetime-Buds im aktuellen Run                              |
| Seed-Gain      | `floor(sqrt(lifetimeRunBuds / 1,000,000))`, mindestens 1 ab Mindestwert |
| Naechster Seed | `(aktuellerGain + 1)^2 * 1,000,000` Lifetime-Buds                       |
| Multiplikator  | `1 + totalSeedsEarned * 0.05`                                           |

Zielzeit:

| Prestige         | Ziel                                                                |
| ---------------- | ------------------------------------------------------------------- |
| Erstes Prestige  | ca. 45-90 Minuten                                                   |
| Zweites Prestige | ca. 25-60 Minuten durch Seeds, Research und Kickstart               |
| Drittes Prestige | Spieler erkennt Build-Schwerpunkt: aktiv, idle, events oder economy |

## UI-Anforderungen

Der Prestige-Screen zeigt:

- aktuellen Run-Fortschritt gegen Mindestwert,
- moeglichen Seed-Gain,
- Seeds vor/nach Prestige,
- naechste Seed-Schwelle,
- Multiplikator nach Prestige,
- permanente Milestone-/Kickstart-Boni,
- klare Checkbox vor Ausloesung.

Sehr fruehes Prestige bleibt blockiert, bis mindestens ein Seed gewonnen wird.
