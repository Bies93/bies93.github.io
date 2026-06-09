# Shop Economy

Stand: Sprint 18.

## Designziel

Der Shop ist nicht mehr nur eine Progressionsleiter aus größeren BPS-Zahlen. Jedes Item hat eine Rolle, eigene Milestone-Schwellen, spätere Synergien und mindestens einen Weg, im Midgame wieder relevant zu werden.

## Item-Tabelle

| id                 | role                            |    baseCost |   baseBps | costFactor | unlockCondition        | milestones                    | synergyHooks                    |
| ------------------ | ------------------------------- | ----------: | --------: | ---------: | ---------------------- | ----------------------------- | ------------------------------- |
| seedling           | Early mass, click/seed synergy  |          12 |      0.12 |      1.130 | Start                  | 10/25/50/100/200/350/600/1000 | Cultivator, Robot, Genetics     |
| planter            | Stable early BPS                |          65 |       0.6 |      1.150 | 40 total Buds          | 10/25/50/100/150/250/400/650  | Irrigation, Seedling            |
| grow_tent          | First production jump           |         420 |       3.8 |      1.170 | 250 total Buds         | 5/15/35/75/125/200/320/500    | Grow Light, CO2                 |
| grow_light         | Indoor amplifier                |       1,500 |        11 |      1.180 | 2 Grow Tents           | 5/15/35/75/125/200/320/500    | Grow Tent, CO2                  |
| cultivator         | Breadth scaler                  |       6,000 |        48 |      1.200 | 4,500 total Buds       | 10/25/50/100/150/250/400/650  | Seedling mass, Robot            |
| irrigation_system  | Infrastructure and cost control |      28,000 |       240 |      1.215 | 20,000 total Buds      | 5/10/25/50/100/150/250/400    | Planter, Hydro, Softcap         |
| co2_tank           | Buff/event amplifier            |     120,000 |     1,100 |      1.235 | 90,000 total Buds      | 5/10/25/50/100/150/250/400    | Indoor, Events, Climate         |
| climate_controller | Event/offline stabiliser        |     520,000 |     5,200 |      1.250 | 400,000 total Buds     | 5/10/25/50/100/150/250/400    | CO2, Hydro, Event duration      |
| hydroponic_rack    | Idle production core            |   2,500,000 |    28,000 |      1.265 | 2,000,000 total Buds   | 3/10/25/50/100/150/250/400    | Irrigation, Climate             |
| genetics_lab       | Seeds, Research, Strains        |  12,000,000 |   160,000 |      1.280 | 9,000,000 total Buds   | 3/10/25/50/100/150/250/400    | Seedling, Robot, Prestige       |
| trimming_robot     | Automation                      |  70,000,000 | 1,000,000 |      1.295 | 55,000,000 total Buds  | 3/10/25/50/100/150/250/400    | Cultivator, Micro, Auto-click   |
| micro_greenhouse   | Late compact multiplier         | 450,000,000 | 7,500,000 |      1.310 | 350,000,000 total Buds | 1/3/10/25/50/100/150/250      | Climate, Genetics, Hydro, Robot |

## Synergie-Matrix

| Synergie               | Quelle             | Ziele                      | Skalierung                            |
| ---------------------- | ------------------ | -------------------------- | ------------------------------------- |
| Mass Care              | Seedling           | Cultivator, Trimming Robot | +2.5% je 50 Seedlings, max 12 Stacks  |
| Root Network           | Irrigation         | Planter, Seedling          | +3.5% je 12 Irrigation, max 10 Stacks |
| Indoor Focus           | Grow Light         | Grow Tent                  | +5% je 10 Lights, max 10 Stacks       |
| Full Spectrum Pressure | CO2 Tank           | Grow Light, Grow Tent      | +4.5% je 8 Tanks, max 10 Stacks       |
| Stable Atmosphere      | Climate Controller | CO2 Tank                   | +5% je 8 Controller, max 9 Stacks     |
| Hydro Loop             | Irrigation         | Hydroponic Rack            | +4.5% je 20 Irrigation, max 10 Stacks |
| Strain Library         | Genetics Lab       | Seedling, Planter          | +2.5% je 5 Labs, max 12 Stacks        |
| Shift Work             | Trimming Robot     | Cultivator                 | +4% je 5 Robots, max 10 Stacks        |
| Lab Pipeline           | Genetics Lab       | Trimming Robot             | +3.5% je 6 Labs, max 9 Stacks         |
| Microclimate Matrix    | Micro Greenhouse   | Climate, Genetics, Hydro   | +5.5% je 3 Micro, max 10 Stacks       |
| Hydro Balance          | Climate Controller | Hydroponic Rack            | +4% je 10 Controller, max 10 Stacks   |
| Compact Automation     | Trimming Robot     | Micro Greenhouse           | +4.5% je 4 Robots, max 8 Stacks       |

Aktive Synergien erscheinen direkt im Shop-Hinweistext der betroffenen Karte.

## Upgrades

| Gruppe                |    Anzahl | Zweck                                                                         |
| --------------------- | --------: | ----------------------------------------------------------------------------- |
| Item Boosts           | 5 je Item | Commitment-Stufen bei 10/50/150/300/500 Besitz                                |
| Trimmer Automation    |         6 | Auto-Klick-Progression und Automations-Build                                  |
| Legacy Early Upgrades |         8 | Early BPC, Global, Event, Seed und Prestige-Brücke                            |
| Synergy Upgrades      |         5 | stärkere Build-Identität für Root, Indoor, Lab, Micro                         |
| Archetype Upgrades    |         5 | neue Mechaniken: BPC aus BPS, Krit, Eventrate, BPS-Automation, Softcap-Relief |

Wichtige neue Upgrades:

| id                   | category   | effect                                     | intended timing         |
| -------------------- | ---------- | ------------------------------------------ | ----------------------- |
| active_harvest_chain | click      | +0.02s BPS pro Klick, +2pp Krit            | aktiver Midgame-Build   |
| servo_feedback       | automation | +0.75 Auto-Klick/s, +1.2% BPS-Anteil       | Robot-/Cultivator-Build |
| event_magnet_array   | event      | Eventrate +12%, Dauer +10%, Rewards +12%   | CO2-/Climate-Build      |
| softcap_tuning       | utility    | Softcap-Strafen -8%                        | breite Late-Run-Shops   |
| seed_focus_lenses    | seed       | Seed-Chance +1.5pp, Seedling/Genetics +20% | Genetics-/Seed-Build    |

## Softcaps

Softcaps bleiben sichtbar, werden aber jetzt spielbar:

- Softcap-Badges zeigen aktive Stackzahl und effektive Produktionsreduktion.
- Research und Upgrades geben `SOFTCAP_RELIEF` bzw. `softcapRelief`.
- Relief reduziert nicht die Stackzahl, sondern mildert die pro-Stack-Strafe.
- Cap: maximal 80% Relief, damit Softcaps als Balancing-Instrument erhalten bleiben.

## Shop-UI

Jede Karte zeigt weiterhin Icon, Name, Rolle, Besitz, Kosten, aktuelle Produktion, Produktion nach Kauf, BPS-Anteil, ROI, Milestone und Buy One/x10/x25/Max. Neu ist, dass aktive Cross-Synergien in der Hook-Zeile sichtbar werden.

## Balance-Risiken

- Synergien stapeln multiplikativ über Item-Basisproduktion; extreme Late-Game-Runs müssen nach Sprint 19-20 erneut simuliert werden.
- Fünf Boost-Stufen pro Item erhöhen Content-Dichte. Die Sortierung zeigt verfügbare/erschwingliche Upgrades zuerst, damit keine Upgrade-Flut entsteht.
- Softcap-Relief darf breite Shops stärken, aber späte Items nicht komplett entwerten.
