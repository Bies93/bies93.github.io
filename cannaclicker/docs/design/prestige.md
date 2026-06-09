# Prestige

Stand: Sprint 15

## Modell

Prestige ist ein bewusster Soft-Reset:

| Reset                     | Bleibt                                                     |
| ------------------------- | ---------------------------------------------------------- |
| Buds                      | Research-Seeds                                             |
| Shop-Items                | Ascension-Seeds                                            |
| normale Upgrades          | Prestige-Multiplikator                                     |
| aktueller Run-Fortschritt | Research ohne `resetsOnPrestige`, Achievements, Milestones |

Seeds sind seit Sprint 15 sauber getrennt:

| Wert                  | Quelle                               | Zweck                                       |
| --------------------- | ------------------------------------ | ------------------------------------------- |
| Research-Seeds        | Events, Klicks, Synergien, Idle-Seed | Research-Kosten und Run-nahe Entscheidungen |
| Ascension-Seeds       | Nur Prestige                         | Ascension-Tree und Prestige-Macht           |
| Total Ascension Seeds | Summe aller Prestige-Seeds           | Dauerhafter globaler Multiplikator          |

## Formel

| Wert           | Definition                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Mindestwert    | `3,000,000` Lifetime-Buds im aktuellen Run                                                                   |
| Seed-Gain      | `floor(sqrt(lifetimeRunBuds / 3,000,000))`, mindestens 1 ab Mindestwert, danach Ascension-Tree-Multiplikator |
| Naechster Seed | `(aktuellerGain + 1)^2 * 3,000,000` Lifetime-Buds                                                            |
| Multiplikator  | `1 + totalAscensionSeeds * 0.05`                                                                             |

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
- Research-Seeds getrennt von Ascension-Seeds,
- nächste Seed-Schwelle,
- Multiplikator nach Prestige,
- permanente Milestone-/Kickstart-Boni,
- Ascension-Tree mit 24 permanenten Nodes,
- klare Checkbox vor Ausloesung.

Sehr frühes Prestige bleibt blockiert, bis mindestens ein Seed gewonnen wird.
