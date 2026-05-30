# Early Game Balance

Stand: Sprint 3.

## Ziel der ersten 30 Minuten

Der erste Run soll aktiv starten, schnell passive Produktion zeigen und erst danach Events, Upgrades und Strategie oeffnen. Klicks bleiben mindestens 10-15 Minuten relevant; Idle-Produktion uebernimmt schrittweise.

## Zielverlauf

| Zeit     | Spielerlebnis                                      | Systemziel                                                              |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| 0-15s    | Pflanze, Buds und Klickaufforderung sind sichtbar. | 1 BPC, keine Ablenkung.                                                 |
| 15-60s   | Erstes Item wird ohne Frust gekauft.               | Keimling kostet 12 Buds.                                                |
| 1-3min   | Passive Produktion wird sichtbar.                  | Keimlinge und Toepfe erzeugen BPS, Klicks bleiben staerker.             |
| 3-6min   | Mehrere Early-Items werden gekauft.                | Topf bei 40 Gesamtbuds, Grow-Zelt bei 250.                              |
| 5-8min   | Erstes Upgrade wird erreichbar.                    | Praeziser Trim ab 125 Gesamtbuds, Kosten 170.                           |
| 8-15min  | Erster Produktionssprung.                          | Grow-Zelt, Reiche Erde und Tap-Training fuehren zu BPC/BPS-Mix.         |
| 15-30min | Events, Upgrades und fruehe Strategie sichtbar.    | Event-Gate ist offen, aber Rewards ueberspringen die Progression nicht. |

## BPC-Kurve

- Start: 1 BPC.
- Erstes Klick-Upgrade: `precision_trim`, 2x BPC, ab 125 Gesamtbuds.
- Zweites Klick-Upgrade: `tap_training`, 1.75x BPC, nach `precision_trim`.
- Klicks bleiben stark, weil fruehe BPS-Werte bewusst moderat sind.
- Midgame verschiebt Fokus auf Events plus Produktion.
- Spaeter dominieren BPS, Research und Prestige; BPC bleibt durch Multiplikatoren, Burst und Auto-Click relevant.

## BPS-Kurve Early

| Item      |  Cost |  BPS | Rolle im Early Game                                        |
| --------- | ----: | ---: | ---------------------------------------------------------- |
| Keimling  |    12 | 0.12 | erster passiver Fortschritt, aber Klicks bleiben wichtiger |
| Topf      |    65 |  0.6 | stabiler erster BPS-Anker                                  |
| Grow-Zelt |   420 |  3.8 | erster echter Produktionssprung                            |
| LED-Licht | 1,500 |   11 | erster Indoor-Verstaerker                                  |
| Gaertner  | 6,000 |   48 | Start der breiteren Shop-Strategie                         |

## Event-Gating

- Events spawnen erst, wenn mindestens ein Item gekauft wurde, 60 Gesamtbuds erreicht sind oder 75 Sekunden seit Run-Start vergangen sind.
- Golden-Bud-Fallback nutzt nicht mehr den vollen 15s-Wert, wenn noch keine BPS existiert.
- Event-Reward-Upgrades starten spaeter (`event_spotters` ab 10,000 Gesamtbuds), damit Events den Start nicht brechen.

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
- Ressourcenbereich zeigt Buds, BPS, BPC, Seeds, aktive Multiplikatoren und den naechsten Unlock-Hinweis.

## Offene Playthrough-Fragen

- Ob `precision_trim` bei 125 Gesamtbuds zu frueh oder genau richtig liegt.
- Ob das erste Event eher nach Item-Kauf oder nach 75 Sekunden erscheinen soll.
- Ob Grow-Zelt bei 420 Buds den richtigen Motivationssprung fuer Minute 8-15 liefert.
