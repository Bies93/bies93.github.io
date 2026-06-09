# Known Issues

Stand: Sprint 26 / `1.0.0-rc.1`.

## Release Candidate Einschränkungen

- iOS Safari konnte in dieser Ubuntu-Umgebung nicht direkt getestet werden.
- Android Chrome wurde als Chromium-Mobile-Viewport geprüft, aber nicht auf physischer Android-Hardware.
- Firefox-Smoke ist via Playwright gruen; der alte System-Firefox/Snap-Prozess war nicht stabil steuerbar und wird nicht als Release-Abnahme genutzt.
- WebKit-Smoke ist gruen, ersetzt aber keinen echten iOS-Safari-Test auf Hardware.
- Lange 4-20h-Realtime-Runs sind durch heuristische Simulationen vorbereitet, aber noch nicht durch echte Spielerzeit ersetzt.
- Prozeduraler Sound startet erst nach erster User-Interaktion, wie bei Browser-Audio ueblich.
- Keine Cloud-Saves; Export/Import bleibt der vorgesehene Weg zum Sichern.

## Nicht als Blocker bewertet

- Kein Cloud- oder Account-Save in V1.
- Vollwertige Cosmetic-Progression bleibt Post-Launch; leichte Themes, Plant-Skins und Badge-Score sind enthalten.
- Keine Account- oder Backend-Funktionen.
- Keine umfangreiche automatisierte Test-Suite.

## Beobachten nach Launch

- Event-Erwartungswert für sehr aktive Spieler.
- Prestige-Timing nach zweitem und drittem Run.
- Mobile Performance bei sehr starkem Klickspam.
- Ob 160 Achievements motivierend oder für manche Spieler zu viel wirken.
- Ob die zusätzlichen Event-Kategorien in sehr langen Sessions klar genug bleiben.
