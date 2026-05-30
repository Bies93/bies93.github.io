# Shop Economy

Stand: Sprint 4.

## Designziel

Der Shop ist das Kernsystem von CannaClicker. Items sind nicht nur groessere Zahlen, sondern Rollen in einer Progressionsleiter. Milestones halten alte Items relevant; Upgrades und Synergien erzeugen Build-Identitaet.

## Item-Tabelle

| id                 | displayName        | role                            |    baseCost |   baseBps | costFactor | unlockCondition        | milestones                   | synergyHooks                                |
| ------------------ | ------------------ | ------------------------------- | ----------: | --------: | ---------: | ---------------------- | ---------------------------- | ------------------------------------------- |
| seedling           | Seedling           | Early mass, click/seed synergy  |          12 |      0.12 |       1.13 | Start                  | 10/25/50/100/150/200/300/500 | Seed sorting, click value, base multipliers |
| planter            | Planter            | Stable early BPS                |          65 |       0.6 |       1.15 | 40 total buds          | 10/25/50/100/150/200/300/500 | Soil, irrigation, global upgrades           |
| grow_tent          | Grow Tent          | First production jump           |         420 |       3.8 |       1.17 | 250 total buds         | 10/25/50/100/150/200/300/500 | Indoor, light, CO2                          |
| grow_light         | Grow Light         | Indoor amplifier                |       1,500 |        11 |       1.18 | 2 Grow Tents           | 10/25/50/100/150/200/300/500 | Tent, CO2, buff strategy                    |
| cultivator         | Cultivator         | Breadth scaler                  |       6,000 |        48 |       1.20 | 4,500 total buds       | 10/25/50/100/150/200/300/500 | Multi-item milestones, global bonuses       |
| irrigation_system  | Irrigation System  | Infrastructure and cost control |      28,000 |       240 |      1.215 | 20,000 total buds      | 10/25/50/100/150/200/300/500 | Planter, hydro, climate cost hooks          |
| co2_tank           | CO2 Tank           | Buff/event amplifier            |     120,000 |     1,100 |      1.235 | 90,000 total buds      | 10/25/50/100/150/200/300/500 | Tent, light, event rewards                  |
| climate_controller | Climate Controller | Buff/event stabiliser           |     520,000 |     5,200 |       1.25 | 400,000 total buds     | 10/25/50/100/150/200/300/500 | CO2, hydro, events                          |
| hydroponic_rack    | Hydroponic Rack    | High production thresholds      |   2,500,000 |    28,000 |      1.265 | 2,000,000 total buds   | 10/25/50/100/150/200/300/500 | Irrigation, climate, 100+ milestones        |
| genetics_lab       | Genetics Lab       | Research and seed synergy       |  12,000,000 |   160,000 |       1.28 | 9,000,000 total buds   | 10/25/50/100/150/200/300/500 | Seeds, strains, prestige prep               |
| trimming_robot     | Trimming Robot     | Automation and auto-click       |  70,000,000 | 1,000,000 |      1.295 | 55,000,000 total buds  | 10/25/50/100/150/200/300/500 | Auto-click, click multipliers               |
| micro_greenhouse   | Micro Greenhouse   | Late compact multiplier         | 450,000,000 | 7,500,000 |       1.31 | 350,000,000 total buds | 10/25/50/100/150/200/300/500 | Climate, genetics, automation               |

## Milestones

Alle Items nutzen die Schwellen:
`10, 25, 50, 100, 150, 200, 300, 500`.

Milestones wirken direkt ueber Item-Produktion und werden in der Shop-Karte als Fortschritt zur naechsten Schwelle angezeigt. Die Karte zeigt aktuelle Produktion, Produktion nach Kauf, Anteil an Gesamt-BPS und ROI.

## Upgrade-Tabelle

| id                           | displayName       | category   |                cost | requirement                             | effect                            | intended timing            |
| ---------------------------- | ----------------- | ---------- | ------------------: | --------------------------------------- | --------------------------------- | -------------------------- |
| precision_trim               | Precision Trim    | Click      |                 170 | 125 total buds                          | BPC x2                            | Minute 5-8                 |
| starter_auto                 | Auto Nudge        | Automation |                 420 | 260 total buds                          | +0.35 auto-click/s                | Minute 8-12                |
| rich_soil                    | Rich Soil         | Global     |                 820 | 620 total buds                          | Global x1.25                      | Minute 10-15               |
| tap_training                 | Tap Training      | Click      |               1,900 | 1,500 total buds + Precision Trim       | BPC x1.75                         | Minute 15-25               |
| canopy_math                  | Canopy Math       | Global     |               5,500 | 4,000 total buds                        | Global x1.2                       | Minute 25-40               |
| event_spotters               | Event Spotters    | Event      |              13,000 | 10,000 total buds                       | Event instant rewards x1.25       | After early loop           |
| seed_sorting                 | Seed Sorting      | Seed       |              36,000 | 28,000 total buds                       | +1pp click seed chance            | Early-mid bridge           |
| prestige_journal             | Prestige Journal  | Prestige   |             520,000 | 420,000 total buds                      | Global x1.1                       | First prestige preparation |
| \*\_boost_1                  | Item Boost 1      | Item       |         baseCost x7 | 10 owned                                | Item production x1.75             | First item commitment      |
| \*\_boost_2                  | Item Boost 2      | Item       |        baseCost x46 | 50 owned + prior boost                  | Item production x2.1              | Mid commitment             |
| \*\_boost_3                  | Item Boost 3      | Item       |       baseCost x320 | 150 owned + prior boost                 | Item production x2.65             | Long-run commitment        |
| synergy_closed_loop          | Closed Loop Cycle | Synergy    |       CO2 base x120 | Tent 40, Light 40, CO2 15               | Tent/Light/CO2 x1.2               | Indoor build               |
| synergy_root_network         | Root Network      | Synergy    |      Hydro base x18 | Seedling 100, Planter 75, Irrigation 25 | Seedling/Planter/Irrigation x1.35 | Old item reactivation      |
| synergy_precision_irrigation | Fine Tuning       | Synergy    | high infra base x95 | Climate 20, Hydro 35, Irrigation 60     | Cost -5% for infra items          | Infrastructure build       |
| synergy_lab_pipeline         | Lab Pipeline      | Synergy    |   Genetics base x42 | Genetics 25, Robot 15, Hydro 50         | Lab/Robot/Hydro x1.3              | Late production build      |
| synergy_micro_cycle          | Micro Cycle       | Prestige   |      Micro base x38 | Micro 10, Climate 60, Genetics 40       | Micro/Climate/Genetics x1.4       | Prestige prep hook         |

## Shop-UI

Jede Karte zeigt:

- Icon, Name, Rolle und Synergie-Hook.
- Besitz, Kosten, aktuelle Produktion, Produktion nach Kauf.
- Anteil an Gesamt-BPS.
- ROI und Effizienzstatus.
- Naechsten Milestone.
- Buy One, x10, x25 und Max.
- Locked-Hinweis mit konkreter Freischaltung.

## Balance-Risiken

- Die Item-Boost-Upgrades duerfen nicht alle gleichzeitig erschwinglich wirken.
- x25 kann im Early Game lange deaktiviert sein; das ist beabsichtigt.
- Synergie-Upgrades muessen im 60-Minuten-Playthrough beobachtet werden, damit keine Einzelstrategie dominiert.
