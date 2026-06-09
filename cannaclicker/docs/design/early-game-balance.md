# Early Game Balance

Stand: Sprint 3.

## Ziel der ersten 30 Minuten

Der erste Run soll aktiv starten, schnell passive Produktion zeigen und erst danach Events, Upgrades und Strategie öffnen. Klicks bleiben mindestens 10-15 Minuten relevant; Idle-Produktion übernimmt schrittweise.

## Zielverlauf

| Zeit     | Spielerlebnis                                      | Systemziel                                                             |
| -------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| 0-15s    | Pflanze, Buds und Klickaufforderung sind sichtbar. | 1 BPC, keine Ablenkung.                                                |
| 15-60s   | Erstes Item wird ohne Frust gekauft.               | Keimling kostet 12 Buds.                                               |
| 1-3min   | Passive Produktion wird sichtbar.                  | Keimlinge und Toepfe erzeugen BPS, Klicks bleiben staerker.            |
| 3-6min   | Mehrere Early-Items werden gekauft.                | Topf bei 40 Gesamtbuds, Grow-Zelt bei 250.                             |
| 5-8min   | Erstes Upgrade wird erreichbar.                    | Praeziser Trim ab 260 Gesamtbuds, Kosten 420.                          |
| 8-15min  | Erster Produktionssprung.                          | Grow-Zelt, Reiche Erde und Tap-Training fuehren zu BPC/BPS-Mix.        |
| 15-30min | Events, Upgrades und frühe Strategie sichtbar.     | Event-Gate ist offen, aber Rewards überspringen die Progression nicht. |

## BPC-Kurve

- Start: 1 BPC.
- Erstes Klick-Upgrade: `precision_trim`, 2x BPC, ab 260 Gesamtbuds.
- Zweites Klick-Upgrade: `tap_training`, 1.75x BPC, nach `precision_trim`.
- Sprint 17: Midgame-Klicks können zusätzlich einen Anteil aktueller BPS erhalten (`clickBpsSeconds`).
- Active-Research und `active_harvest_chain` öffnen BPC = Basis + bis zu 0.4s aktueller BPS, multipliziert mit BPC-Multiplikatoren.
- Click-Combo startet nach 5 schnellen Klicks und wächst in kleinen Stufen; `Harvest Chain` und Active-Research verstärken die Kurve.
- Kritische Klicks zahlen doppelt und werden erst über Research/Upgrades freigeschaltet.
- Später dominieren BPS, Research und Prestige; BPC bleibt durch BPS-Anteil, Combo, Krit, Burst und Automation relevant.

## Active-/Idle-Zielkurve

| Phase         | Klickrolle                                            | Idle-/Automation-Rolle                                   |
| ------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| 0-15min       | Primärer Fortschrittsmotor plus erste Klick-Upgrades  | erste Items zeigen passive Produktion                    |
| 15-60min      | Klicks bleiben durch BPC-Upgrades und Events sinnvoll | Shop, Buy Max und erste Automation tragen den Run        |
| 60-120min     | Active-Build nutzt BPS-Anteil, Combo und Krit         | Automation erhält Auto-Klicks und später BPS-Anteil      |
| Post-Prestige | Active ist eine Strategie, nicht Pflicht              | Prestige, Research, Ascension und Offline werden stärker |

## BPS-Kurve Early

| Item      |  Cost |  BPS | Rolle im Early Game                                        |
| --------- | ----: | ---: | ---------------------------------------------------------- |
| Keimling  |    12 | 0.12 | erster passiver Fortschritt, aber Klicks bleiben wichtiger |
| Topf      |    65 |  0.6 | stabiler erster BPS-Anker                                  |
| Grow-Zelt |   420 |  3.8 | erster echter Produktionssprung                            |
| LED-Licht | 1,500 |   11 | erster Indoor-Verstaerker                                  |
| Gaertner  | 6,000 |   48 | Start der breiteren Shop-Strategie                         |

## Event-Gating

- Events spawnen erst, wenn mindestens ein Item gekauft wurde, 120 Gesamtbuds erreicht sind oder 90 Sekunden seit Run-Start vergangen sind.
- Golden Bud nutzt 12s Produktion; der Fallback bleibt niedriger, wenn noch keine BPS existiert.
- Event-Reward-Upgrades starten später (`event_spotters` ab 10,000 Gesamtbuds), damit Events den Start nicht brechen.

## Kauf-Flow

Shop-Karten bieten:

- Buy One
- Buy x10
- Buy x25
- Buy Max

Jede Option wird nur aktiviert, wenn sie bezahlbar und freigeschaltet ist. Tooltips zeigen Kosten und erwarteten BPS-Zuwachs.

## UI-Feedback

- Jeder Klick spielt Sound, erzeugt Floating Numbers und pulst das Klickobjekt subtil.
- Shop-Kaeufe pulsen die jeweilige Karte und zeigen die gekaufte Menge.
- Ressourcenbereich zeigt Buds, BPS, BPC, Seeds, aktive Multiplikatoren und den nächsten Unlock-Hinweis.

## Offene Playthrough-Fragen

- `precision_trim` wurde von 125/170 auf 260/420 verschoben, damit das erste Upgrade im 5-8-Minuten-Korridor bleibt.
- Das erste Event ist auf Item-Kauf, 120 Gesamtbuds oder 90 Sekunden gegated.
- Ob Grow-Zelt bei 420 Buds den richtigen Motivationssprung für Minute 8-15 liefert.
