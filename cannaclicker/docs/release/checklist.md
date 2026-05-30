# Release Checklist

Stand: Sprint 12.

## Build

- [x] Node.js `>=20` in `package.json`.
- [x] GitHub-Pages-kompatibler relativer Vite-Base-Path `./`.
- [x] Production-Sourcemaps für RC deaktiviert.
- [x] Cache-Busting über Vite-Dateihashes.
- [x] Titel und Meta Description gesetzt.
- [x] Version sichtbar in Settings.

## Assets

- [x] `public/img` ist deutlich unter 10 MB.
- [x] Icons sind SVG-basiert und transparent.
- [x] Event-, Item-, Research-, UI- und Ability-Pfade sind manifestiert.
- [x] Keine WAV-SFX mehr im Release-Assetpfad.
- [x] Audio wird prozedural erzeugt und blockiert den Start nicht.

## Gameplay

- [x] Core Clicker startet ohne externes Setup.
- [x] Shop, Upgrades, Events, Seeds, Prestige, Research, Achievements und Offline-Gain sind aktiv.
- [x] Goals fuehren den Early Game Flow.
- [x] Prestige-Modal erklaert Reset und Belohnung.
- [x] Export, Import und Reset sind erreichbar.

## UI/UX

- [x] Desktop und Mobile Layouts vorhanden.
- [x] 320px, 390px, 768px und 1440px Smoke-Ziele definiert.
- [x] Keine sichtbaren Devtools bei `flags.devtools = false`.
- [x] Motion-Intensity-Setting vorhanden.
- [x] UI-Theme-Setting vorhanden.
- [x] Plant-Skin-Setting vorhanden.
- [x] Sound-Toggle vorhanden.
- [x] SFX-Lautstaerke vorhanden.
- [x] Release Notes und Credits im Settings-Panel vorhanden.
- [x] Offline-Gain-Hinweis optional abschaltbar.

## Abnahme

- [x] Finaler Build nach letztem Commit.
- [x] Browser-Smoke: Chromium Desktop.
- [x] Browser-Smoke: Mobile Viewports `320px`, `390px`, `768px`, `1440px`.
- [x] Browser-Smoke: Firefox via Playwright.
- [x] Browser-Smoke: WebKit via Playwright als Safari-nahe Engine.
- [x] Production-Preview-Smoke am Artefakt-Root `http://127.0.0.1:4173/`.
- [ ] iOS Safari auf echtem Gerät: in Ubuntu nicht direkt testbar.
- [x] GitHub Pages Deployment-Pfad geprueft: Workflow deployt `cannaclicker/dist` als Pages-Artefakt-Root.
- [x] Release-Smoke mit leerem LocalStorage durchgefuehrt.
