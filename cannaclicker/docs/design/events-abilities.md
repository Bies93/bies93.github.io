# Events And Abilities

Stand: Sprint 19

## Event-Regeln

| Regel           | Wert                                                                                   |
| --------------- | -------------------------------------------------------------------------------------- |
| Erste Events    | Gate bis erstes Item, 120 Gesamtbuds oder 90 Sekunden Runzeit.                         |
| Aktive Events   | 1 im Early Game, 2 ab 2.5 Mio Gesamtbuds oder `Event-Scouts`.                          |
| Spawn-Intervall | Basis 14-26 Sekunden nach Gate, skaliert mit Event-Research.                           |
| Pity            | Global 55 Sekunden plus getrennte Kategorie-Pity fuer Minor/Chain/Risk/Major/Seasonal. |
| Sichtbarkeit    | 7-12 Sekunden, skaliert mit Event-Dauer-Research.                                      |
| Stack-Regel     | Unterschiedliche Event-Buffs stacken mit eigenen Timern; gleiche Buffs refreshen.      |
| Qualität        | Event-Research und Event-Upgrades gewichten Chain/Major/Seasonal etwas hoeher.         |

## Kategorien

| Kategorie | Rolle                          | Pity-Ziel | Balance-Notiz                                          |
| --------- | ------------------------------ | --------: | ------------------------------------------------------ |
| Minor     | Kleine Bud-/Seed-/Buff-Fenster |       52s | Haelt aktive Spieler wach, bricht Early nicht.         |
| Chain     | Mehrstufige Event-Folge        |       92s | Gibt aktive Aufmerksamkeit eine klare Belohnung.       |
| Risk      | Win/Soft-Fail mit Warnstil     |      124s | Nie harter Verlust, aber kurze Malus-Fenster moeglich. |
| Major     | Seltene starke Momente         |      160s | Gated ab Strategy-/Prestige-Phase.                     |
| Seasonal  | Spaetere Stimmungssets         |      190s | Kein Kalenderzwang; ueber Fortschritt freigeschaltet.  |

## Event-Tabelle

| id                 | Kategorie | Gewicht | Min Stage            | Reward / Effekt                                  |
| ------------------ | --------- | ------: | -------------------- | ------------------------------------------------ |
| `golden_bud`       | Minor     |    1.00 | Gate offen           | 12s Produktion oder BPC-Fallback                 |
| `tiny_spark`       | Minor     |    0.95 | Gate offen           | 5s Produktion, sehr klein                        |
| `dew_drop`         | Minor     |    0.86 | Gate offen           | 7s Produktion + kurzer BPS-Tropfen               |
| `lucky_joint`      | Minor     |    0.75 | Gate offen           | BPS/BPC x2 fuer 15s                              |
| `fertile_rain`     | Minor     |    0.75 | Gate offen           | 10s Produktion + BPS x1.25                       |
| `compost_cache`    | Minor     |    0.70 | 600 Gesamtbuds       | 8s Produktion + Shopkosten x0.92                 |
| `sunbeam`          | Minor     |    0.68 | 1.2k Gesamtbuds      | BPC x1.45 + kleiner Bud-Reward                   |
| `market_rush`      | Minor     |    0.55 | Gate offen           | BPS/BPC x1.6                                     |
| `seed_pack`        | Minor     |    0.55 | Gate offen           | 1-5 Seeds, Cap respektiert                       |
| `supply_drop`      | Minor     |    0.50 | Gate offen           | 12s Produktion + Shopkosten x0.85                |
| `green_surge`      | Minor     |    0.45 | Gate offen           | BPC x2.5                                         |
| `calm_growth`      | Minor     |    0.40 | 2.5k Gesamtbuds      | BPS x1.85, besser nach Idle                      |
| `flash_harvest`    | Chain     |    0.35 | 2.5k Gesamtbuds      | 18s Produktion + zwei Golden Buds                |
| `trail_marker`     | Chain     |    0.32 | 8k Gesamtbuds        | Startet oft `cascade_bloom`                      |
| `cascade_bloom`    | Chain     |    0.20 | 18k Gesamtbuds       | BPS x1.5, kann `echo_harvest` starten            |
| `echo_harvest`     | Chain     |    0.14 | 75k Gesamtbuds       | 24s Produktion + Seed-Chance                     |
| `pest_scare`       | Risk      |    0.15 | 22k Gesamtbuds       | Win: BPC-Bonus; Soft-Fail: kurzer BPC-Malus      |
| `volatile_growth`  | Risk      |    0.17 | 30k Gesamtbuds       | Win: 52s Produktion + BPS; Soft-Fail klein       |
| `blackout_sale`    | Risk      |    0.13 | 85k Gesamtbuds       | Win: Kostenfenster; Soft-Fail kurzer Kostenmalus |
| `mutant_sprout`    | Major     |    0.25 | 50k oder Prestige    | 24s Produktion + hohe Seed-Chance                |
| `mega_bud`         | Major     |    0.14 | 110k Gesamtbuds      | 42s Produktion                                   |
| `overgrowth`       | Major     |    0.18 | 250k Gesamtbuds      | 30s Produktion + BPS x1.35                       |
| `seed_bloom`       | Major     |    0.28 | 50k oder Prestige    | Seed garantiert + BPC x1.5                       |
| `aurora_bloom`     | Major     |    0.10 | 650k Gesamtbuds      | 18s Produktion + Global x2.05                    |
| `jackpot_canopy`   | Major     |    0.08 | 1.8M oder Prestige 2 | 70s Produktion + Seeds                           |
| `solstice_seed`    | Seasonal  |    0.16 | 180k Gesamtbuds      | Seed garantiert + BPS x1.45                      |
| `night_market`     | Seasonal  |    0.14 | 420k Gesamtbuds      | Kostenfenster + moeglicher Supply Drop           |
| `festival_lantern` | Seasonal  |    0.12 | 1.2M oder Prestige   | 35s Produktion + Global x1.7 + Follow-up         |

## Sprint-19-Balance

- Early Events bleiben erst nach erstem Item, 120 Gesamtbuds oder 90 Sekunden aktiv.
- Major Events sind durch niedrige Gewichte, Stage-Gates und 160s Kategorie-Pity von der ersten Progression entkoppelt.
- Risk Events verlieren keine Buds; Soft-Fails sind kurze Malusfenster, damit der Klick nie hart bestraft.
- Chain-Events belohnen aktives Hinschauen, werden aber durch Stage-Gates und Chain-Chance kontrolliert.
- Seasonal Events sind Fortschrittssets ohne Kalenderabhaengigkeit und koennen spaeter ueber Prestige/Research erweitert werden.

## Abilities

| id                | Unlock          | Cooldown | Dauer | Effekt                                  | Einsatz                                       |
| ----------------- | --------------- | -------: | ----: | --------------------------------------- | --------------------------------------------- |
| `overdrive`       | Start           |      75s |   12s | BPS x3.2, skaliert mit Ability-Research | Produktionsfenster planen.                    |
| `burst`           | Start           |      70s |   10s | BPC x7                                  | Aktive Klickphasen und Green Surge nutzen.    |
| `auto_burst`      | 2.5k Gesamtbuds |     110s |   14s | +6 Auto-Klicks/s                        | Kurze aktive Session ohne hektisches Klicken. |
| `discount_window` | 15k Gesamtbuds  |     140s |   12s | Shopkosten x0.85                        | Buy-Max/x25-Fenster vorbereiten.              |
