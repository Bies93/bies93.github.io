# CannaClicker Reboot Vision

Stand: Sprint 1/2 Reboot.

## Produktziel

CannaClicker ist ein kurzes, gut lesbares Idle-Clicker-Spiel mit Premium-UI, klarer Progression und humorvoll-abstrakter Counterculture-Identitaet. Das Spiel bleibt eine reine Spielmechanik-Fantasie: keine realistische Anleitung, keine Simulation echter Anbauablaeufe.

## Design-Saeulen

- Gameplay zuerst: Jede UI-Entscheidung muss den naechsten sinnvollen Kauf, Boost oder Reset besser sichtbar machen.
- Lesbarkeit vor Dekoration: Zahlen, Kosten, Status und Fortschritt muessen auf Desktop und Mobile sofort scannbar sein.
- Botanischer Premium-Look: dunkle neutrale Flaechen, frisches Gruen, warme Akzente, klare Icon-Silhouetten.
- Kurze aktive Sessions: Klicks, Events und Faehigkeiten sollen in 2-10 Minuten Fortschritt erzeugen.
- Idle-tauglich: Offline-Ertrag, Autosave und Prestige sollen die Rueckkehr ins Spiel belohnen.

## Zielgruppe und Ton

Das Spiel richtet sich an Spieler, die Clicker-/Idle-Progression moegen und eine stilisierte, leicht freche Thematik akzeptieren. Texte bleiben knapp, trocken-humorvoll und mechanisch klar. Keine langen Erklaertexte im UI.

## UX-Struktur

- Kopfbereich: aktueller Vorrat, BPS, BPC, Gesamtfortschritt, Seeds und Prestige-Multiplikator.
- Hauptflaeche: grosse Pflanze als Fortschrittssignal, Klickaktion und aktive Faehigkeiten.
- Seitenbereich: Tabs fuer Anbau, Upgrades, Forschung, Prestige und Erfolge.
- Event-Layer: kurzlebige Icons mit eindeutigem Reward-Feedback.
- Modals: nur fuer riskante Aktionen wie Import, Reset und Prestige.

## Sprint-Entscheidungen

- Prestige nutzt Option A: klassischer Soft-Reset zahlt Seeds aus.
- Seeds erhoehen dauerhaft den globalen Produktionsmultiplikator.
- Events wurden von 3 auf 8 Varianten erweitert.
- Assets werden ueber ein zentrales Manifest verdrahtet.
- Alte Windows-Workarounds und schwere PNG-Altassets werden nicht weitergefuehrt.

## Definition of Done fuer diese Phase

- Das Projekt baut erfolgreich.
- Das Spiel startet lokal ohne offensichtliche Browser-Konsolenfehler.
- Sichtbare Bilder stammen aus dem neuen Asset-System.
- Keine kaputten srcset-/@2x-Verweise.
- Zahlenwerte fuer Items, Events und Prestige sind dokumentiert.
