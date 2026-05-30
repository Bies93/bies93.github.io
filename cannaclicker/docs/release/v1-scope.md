# V1 Scope

Stand: Sprint 11/12.

Release-Entscheidung: `0.9.0-rc.1` ist ein Release Candidate fuer GitHub Pages.

## V1 Muss

Diese Systeme bleiben im ersten Online-Release:

- Core Clicker mit aktivem Klickfeedback.
- Shop mit 12 Item-Tiers, Buy One/x10/x25/Max und Milestones.
- Upgrades mit Click-, Global-, Item-, Synergy-, Event-, Seed-, Automation- und Prestige-Hooks.
- 12 Events mit Gates, Rewards, Buffs, Seeds und Pity-Verhalten.
- Seeds, Prestige, Kickstart und permanenter Total-Seed-Multiplikator.
- 27 Research-Nodes.
- 120 Achievements mit Filtern, Progress und Hidden-Achievements.
- Goal-System fuer fruehe Fuehrung.
- Offline-Gain mit sichtbarer Rueckkehrmeldung.
- Export, Import, Reset und Settings.
- Mobile UI ab 320 px.
- Prozedurales Soundset und Motion-Intensity-Setting.

## Bewusst nicht in V1

- Account-System oder Cloud-Saves.
- Backend, Leaderboards oder Social Features.
- Cosmetics/Skins als vollwertiges Progressionssystem.
- Musikschleifen.
- Komplexe Achievement-Badge-Sammlungen ausserhalb der aktuellen Karten.
- Weitere Late-Game-Branches ueber die 27 Research-Nodes hinaus.
- Sichtbares Dev-Balance-Menue im Release.

## Gekuertz oder geschaerft

- Achievement-Menge bleibt bei 120 und wird nicht weiter aufgeblasen.
- Hidden Achievements sind wenige Entdeckungen, keine Pflichtliste.
- Motion-Polish ist global und datenarm, keine grossen Video-/Audioassets.
- Devtools bleiben hinter `flags.devtools = false`.
- Production-Sourcemaps sind fuer RC deaktiviert.

## Bekannte kleine Einschraenkungen

- Lange echte 4-10h-Balancing-Laeufe brauchen nach Onlinegang echte Telemetrie oder Spielerfeedback.
- iOS Safari ist in dieser Umgebung nicht real testbar.
- Firefox-Smoke ist offen, weil der Playwright-Browser nicht installiert ist und System-Firefox als Snap nicht stabil steuerbar war.
- Prozeduraler Sound startet wie ueblich erst nach Benutzerinteraktion.

## Finaler Scope-Satz

CannaClicker V1 ist ein lokales Web-Idle-Game ohne Backend. Der Release soll als fertiger, schneller, mobiltauglicher Singleplayer-Clicker wirken, nicht als Live-Service-Plattform.
