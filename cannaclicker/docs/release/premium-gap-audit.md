# Premium Gap Audit

Stand: Chef-Feedback-Pass nach Sprint 12.

Dieser Audit dokumentiert den Chef-Feedback-Pass gegen den Repo-Stand und die direkt umgesetzten Gegenmassnahmen.

## Direkt verbessert

| Bereich              | Luecke                                           | Umsetzung                                                                 |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| Optische Identität   | V1 wirkte sauber, aber kosmetisch noch flach.   | Drei leichte UI-Themes und vier Plant-Skins als erster Cosmetic-Layer.     |
| Release-Praesenz     | Settings hatten Version, aber keinen RC-Kontext. | Release Notes und Credits im Settings-Panel.                              |
| Cosmetic Scope       | Cosmetics standen nur als Post-Launch-Idee.     | Erster nicht-mechanischer Cosmetic-Layer in V1 aufgenommen.                |
| Spieltiefe im UI     | Strategie war in Systemen vorhanden, aber nicht als Spielerhinweis sichtbar. | Run Lens im Hauptscreen zeigt nächsten sinnvollen Fokus.        |
| Sound-Komfort        | Sound war nur an/aus steuerbar.                  | SFX-Lautstaerke als Settings-Regler eingebaut.                             |
| Prestige-Timing      | Erste Simulationen kamen zu früh an Prestige.   | Requirement auf 3M Lifetime-Buds gesetzt, Zielkorridor 45-90 Minuten.      |
| Event-Buffs          | Ein einzelner aktiver Boost-Slot war zu flach.   | Stackende Buff-Liste mit individuellen Timern und Refresh gleicher Buffs.  |
| Asset-Generator      | Generator konnte alte unreferenzierte Dateien erzeugen. | Generator erzeugt alle referenzierten Events und bereinigt Altdateien. |
| Mobile-Overflow      | 320px-Smoke fand horizontales Scrollen.          | Klick-Aura und Tab-Layout korrigiert; Smoke wieder ohne Overflow.          |
| Toast-Flut           | Debug-/Burst-Aktionen konnten Mobile überdecken. | Toast-Stack ist sichtbar begrenzt: 3 Mobile, 4 Desktop.                   |
| Dokumentation        | Premium-Restpunkte waren nur implizit.          | Dieser Audit ergaenzt Scope, UI-System und Roadmap.                       |

## Bleibt als echte Premium-Luecke

| Bereich        | Warum noch nicht Premium                                                               | Naechster harter Nachweis                                      |
| -------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Bespoke Assets | SVG-System ist konsistent und leicht, aber noch kein handgezeichneter Signature-Look.  | Dedizierter Key-Art/Icon-Pass mit finaler visueller QA.        |
| Sounddesign    | WebAudio-SFX sind performant, aber kein kuratiertes handgemachtes Soundpaket.          | Kleines externes SFX-Pack oder Sound-Design-Pass.              |
| Langzeit-Tiefe | Economy ist plausibel kalibriert, echte 4-10h-Spielerdaten fehlen.                    | Mehrere echte Runs oder verwertbares Spielerfeedback.          |
| Geraeteabnahme | Chromium, Firefox und WebKit sind gruen; echter iOS-Safari-Hardwaretest bleibt offen. | Physische iOS-Abnahme vor finalem 1.0-Tag.                   |

## Release-Entscheidung

Der Stand ist als `0.9.0-rc.1` weiterhin onlinefaehig. Für ein selbstbewusstes `1.0` sollte mindestens die echte iOS-Safari-Abnahme und ein kurzer echter Langzeit-Balance-Pass folgen.
