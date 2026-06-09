# Research

Stand: Sprint 16.

## Designziel

Research ist jetzt ein Skilltree-Fundament mit Build-Pfaden statt einer flachen Multiplikatorliste. Der Spieler soll erkennen, ob er aktiv, idle, event-orientiert, seed-orientiert, automation-lastig oder prestige-nah spielt.

## Klassen

| Klasse        | Bedeutung                                                        | Reset-Verhalten       | Währung                  |
| ------------- | ---------------------------------------------------------------- | --------------------- | ------------------------ |
| Run Tech      | starke Run-Entscheidung fuer aktive Fenster, Events oder Strains | resetet beim Prestige | Buds oder Research-Seeds |
| Permanent Lab | dauerhafte Progression fuer Idle, Automation, Seeds und Economy  | bleibt erhalten       | Research-Seeds           |
| Strain        | exklusive Spezialisierung pro Run                                | resetet beim Prestige | Research-Seeds           |
| Prestige Lab  | Ascension-nahe Forschung mit permanentem Gewicht                 | bleibt erhalten       | Ascension-Seeds          |

## Pfade

| Pfad        | Rolle                                              | Beispielknoten                                    |
| ----------- | -------------------------------------------------- | ------------------------------------------------- |
| Efficiency  | stabile globale Produktion und Item-Boni           | `r_eff_foundation`, `r_eff_genetics`              |
| Active Play | BPC, Combo, Krit und BPS-Anteil pro Klick          | `r_active_bps_tap`, `r_active_crit_glands`        |
| Automation  | Auto-Klicks, BPS-Anteil, Offline und passive Seeds | `r_auto_servo_scaling`, `r_auto_buffered_idle`    |
| Events      | Spawnrate, Dauer, Rewards und aktive Event-Fenster | `r_event_magnetics`, `r_event_quality_control`    |
| Genetics    | Strains, Seeds, passive Ernte und Softcap-Gene     | `r_strain_hybrid`, `r_gen_softcap_genes`          |
| Economy     | Kosten, Research-Rabatte und Softcap-Management    | `r_econ_bulk_routes`, `r_econ_research_endowment` |
| Prestige    | Ascension-Seeds als harte Meta-Währung             | `r_pres_active_memory`, `r_pres_softcap_charter`  |

## Knotenstand

Aktuell sind 51 Research-Knoten definiert. Frühe Knoten kosten Buds, Midgame-Knoten kosten Research-Seeds, Prestige-Lab-Knoten kosten Ascension-Seeds. Research-Seeds erhöhen den Prestige-Multiplikator nicht; dieser basiert weiterhin nur auf `totalAscensionSeeds`.

## Neue Effektfamilien

| Effekt                 | Zweck                                       | Cap/Regel                   |
| ---------------------- | ------------------------------------------- | --------------------------- |
| `BPC_FROM_BPS_SECONDS` | Klickwert erhält einen Anteil aktueller BPS | gesamt auf 0.4s begrenzt    |
| `CLICK_CRIT`           | kritische Klicks für Active Builds          | gesamt auf 45% begrenzt     |
| `COMBO_POWER`          | verstärkt Click-Combo-Stufen                | in `clickComboMult` gekappt |
| `AUTOMATION_BPS_SHARE` | Automation erntet zusätzlich BPS-Anteil     | gesamt auf 25% begrenzt     |
| `SOFTCAP_RELIEF`       | reduziert Softcap-Strafen                   | gesamt auf 80% begrenzt     |

## UI-Regeln

- Available/affordable Research erscheint zuerst.
- Jeder Pfad zeigt eine kompakte Fortschritts-Chip-Zusammenfassung.
- Locked Nodes nennen konkrete Bedingungen.
- Run-/Strain-/Permanent-Klassen werden per Card-State unterscheidbar.

## Build-Beispiele

| Build             | Prioritaet                                        | Spielgefühl                                                       |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Active Harvest    | Active Play + Event Windows + Seedling/Cultivator | manuelle Klicks bleiben durch BPS-Anteil, Combo und Krit relevant |
| Idle Hydro        | Automation + Hydro/Irrigation/Climate             | Auto-Klicks und Offline-Cap skalieren in längeren Sessions        |
| Event Combo       | Events + CO2/Climate + Event Magnet               | aktive Event-Fenster werden strategische Spike-Momente            |
| Genetics Prestige | Genetics + Prestige Lab + Micro Greenhouse        | Seeds, Strains und Ascension verstärken Langzeitprogression       |

## Offene Anschlussstelle

Ein echter graphischer Research-Tree ist vorbereitet, aber noch nicht als Kanten-Layout umgesetzt. Die aktuelle Release-nahe Lösung nutzt Pfad-Chips, Sortierung und Klassenstatus, ohne das UI mit einem halbfertigen Graphen zu riskieren.
