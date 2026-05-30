# Economy Tables

Stand: Sprint 9.

## Shop Baseline

ROI ist hier `baseCost / baseBps` in Sekunden ohne Multiplikatoren. Spätere Items dürfen effizienter werden, weil Unlocks, Cost-Factors und Milestones den Einstieg kontrollieren.

| id                 |    baseCost |   baseBps | costFactor | base ROI | unlock                 |
| ------------------ | ----------: | --------: | ---------: | -------: | ---------------------- |
| seedling           |          12 |      0.12 |      1.130 |     100s | Start                  |
| planter            |          65 |       0.6 |      1.150 |     108s | 40 total Buds          |
| grow_tent          |         420 |       3.8 |      1.170 |     111s | 250 total Buds         |
| grow_light         |       1,500 |        11 |      1.180 |     136s | 2 Grow Tents           |
| cultivator         |       6,000 |        48 |      1.200 |     125s | 4,500 total Buds       |
| irrigation_system  |      28,000 |       240 |      1.215 |     117s | 20,000 total Buds      |
| co2_tank           |     120,000 |     1,100 |      1.235 |     109s | 90,000 total Buds      |
| climate_controller |     520,000 |     5,200 |      1.250 |     100s | 400,000 total Buds     |
| hydroponic_rack    |   2,500,000 |    28,000 |      1.265 |      89s | 2,000,000 total Buds   |
| genetics_lab       |  12,000,000 |   160,000 |      1.280 |      75s | 9,000,000 total Buds   |
| trimming_robot     |  70,000,000 | 1,000,000 |      1.295 |      70s | 55,000,000 total Buds  |
| micro_greenhouse   | 450,000,000 | 7,500,000 |      1.310 |      60s | 350,000,000 total Buds |

## Milestones

Alle Items nutzen `10, 25, 50, 100, 150, 200, 300, 500`.

- Early Items haben größere strategische Relevanz durch Klick-, Seed- und Root-Network-Synergien.
- Spaete Items haben bessere Basis-ROI, aber hoehere Cost-Factors und spaete Unlocks.
- Milestones sollen starke Kaufmomente sein, aber nicht einzelne Itemklassen dauerhaft dominieren lassen.

## Early Upgrade Timing

| Upgrade          |    Cost | Requirement                       | Timing-Ziel           | Balance-Rolle                                     |
| ---------------- | ------: | --------------------------------- | --------------------- | ------------------------------------------------- |
| precision_trim   |     420 | 260 total Buds                    | Minute 5-8            | BPC bleibt relevant, aber kommt nicht zu früh.   |
| starter_auto     |     420 | 260 total Buds                    | Minute 8-12           | Erste Automation ohne Idle-Dominanz.              |
| rich_soil        |     820 | 620 total Buds                    | Minute 10-15          | Globaler Produktionsanker.                        |
| tap_training     |   1,900 | 1,500 total Buds + precision_trim | Minute 15-25          | Aktives Spiel bleibt belohnend.                   |
| canopy_math      |   5,500 | 4,000 total Buds                  | Minute 25-40          | Bruecke zu Research.                              |
| event_spotters   |  13,000 | 10,000 total Buds                 | Nach Early Loop       | Events werden staerker, aber nicht startbrechend. |
| seed_sorting     |  36,000 | 28,000 total Buds                 | Early Midgame         | Seeds werden sichtbar.                            |
| prestige_journal | 520,000 | 420,000 total Buds                | Prestige-Vorbereitung | Erster Reset wird planbarer.                      |

## Event Rewards

| Event         | Gate                         | Reward-Wert                                | Balance-Absicht                          |
| ------------- | ---------------------------- | ------------------------------------------ | ---------------------------------------- |
| golden_bud    | Early Gate                   | 12s Produktion oder BPC-Fallback           | Sofort gut, aber kein Tier-Skip.         |
| seed_pack     | Early Gate                   | 1-5 Seeds, cap-respektierend               | Meta-Hook ohne Pflicht.                  |
| lucky_joint   | Early Gate                   | x2 BPS/BPC für 15s                        | Kurzes aktives Fenster.                  |
| fertile_rain  | Early Gate                   | 10s Produktion + x1.25 BPS für 12s        | Belohnung plus kleiner Buff.             |
| market_rush   | Early Gate                   | x1.6 BPS/BPC für 20s                      | Kauf- und Klickfenster.                  |
| green_surge   | Early Gate                   | x2.5 BPC für 10s                          | Aktives Klicken bleibt sichtbar.         |
| supply_drop   | Early Gate                   | 12s Produktion + Shopkosten x0.85 für 16s | Buy-Max-Moment.                          |
| flash_harvest | 2.5k total Buds              | 18s Produktion + schnelle Golden Buds      | Mid-Early Spike.                         |
| calm_growth   | 2.5k total Buds              | x1.85 BPS für 24s                         | Idle-Spieler bekommen ein gutes Fenster. |
| mutant_sprout | 50k total Buds oder Prestige | 24s Produktion + hohe Seed-Chance          | Seltene Meta-Belohnung.                  |
| overgrowth    | 250k total Buds              | 30s Produktion + x1.35 BPS für 20s        | Späterer Reward-Spike.                  |
| seed_bloom    | 50k total Buds oder Prestige | Seed + x1.5 BPC für 18s                   | Seeds und aktives Spiel verbinden.       |

## Seeds, Prestige, Offline

| System               | Wert                                                                 | Ziel                                                          |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| Prestige Requirement | 3,000,000 Lifetime-Buds im Run                                       | Erstes Prestige nicht vor dem Kernloop.                       |
| Seed Gain            | `floor(sqrt(lifetimeBuds / 3,000,000))`, mindestens 1 ab Requirement | Zu frühes Prestige gibt wenig, zu spaetes mehr.              |
| Prestige Mult        | `1 + 0.05 * totalSeeds`                                              | Zweiter Run spuerbar schneller, aber nicht trivial.           |
| Offline Gain         | 20% der BPS-Produktion                                               | Rueckkehr lohnt, aktives Spielen bleibt besser.               |
| Offline Cap          | 8 Stunden Basis, erweiterbar per Research                            | Cap ist klar und upgradebar.                                  |
| Seed Cap             | 25/h bis 10M Lifetime, 60/h bis 3B, danach 110/h                     | Events können Seeds geben, aber nicht unbegrenzt eskalieren. |

## Dev Balance Tools

Bei aktiviertem `flags.devtools` wird im Browser `window.__cannaBalance` installiert.

| Command                                             | Zweck                                                  |
| --------------------------------------------------- | ------------------------------------------------------ |
| `__cannaBalance.snapshot()`                         | Aktuelle Economy-Werte anzeigen.                       |
| `__cannaBalance.addBuds(100000)`                    | Buds für Schwellen pruefen.                           |
| `__cannaBalance.addSeeds(10)`                       | Seed-/Research-Kosten pruefen.                         |
| `__cannaBalance.simulateSeconds(600)`               | Zeitraffer ohne Test-Suite.                            |
| `__cannaBalance.forceEvent('golden_bud')`           | Event-UI und Reward pruefen.                           |
| `__cannaBalance.unlockItem('hydroponic_rack', 10)`  | Item-Rollen und Shop-Lesbarkeit pruefen.               |
| `__cannaBalance.unlockUpgrade('rich_soil')`         | Upgrade-Effekte pruefen.                               |
| `__cannaBalance.unlockResearch('r_eff_foundation')` | Research-Pfade pruefen.                                |
| `__cannaBalance.prestige()`                         | Prestige-Schwelle setzen, Reset und Kickstart pruefen. |
