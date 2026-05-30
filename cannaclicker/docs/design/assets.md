# Asset System

## Ziel

Alle sichtbaren Bilder laufen über ein klares, web-optimiertes Asset-System. Es gibt keine alten @2x-Fantasien, keine schwarzen Kachelbilder und keine schweren PNG-Icons für kleine UI-Elemente.

## Ordnerstruktur

```text
public/img/items
public/img/upgrades
public/img/research
public/img/events
public/img/ui
public/img/plant
public/img/backgrounds
public/sounds
```

## Manifest

`src/app/assetManifest.ts` ist die zentrale Zuordnung für:

- 12 Item-Icons
- 5 Upgrade-Iconfamilien
- 7 Research-Icons
- 12 Event-Icons
- UI-Icons inklusive Ressourcen, Controls und Achievement-Badges
- 11 Pflanzenstadien
- Desktop/Mobile/Texture-Backgrounds

## Generierung

Die aktuellen SVG-Assets werden über `scripts/generate-assets.mjs` erzeugt.

```bash
npm --prefix cannaclicker run assets:generate
```

Die SVGs sind bewusst vektorbasiert, damit 32px UI-Icons und größere Shop-/Plant-Darstellungen ohne separate riesige PNGs funktionieren.

Der Generator entfernt bekannte nicht mehr referenzierte Altdateien (`public/img/fx`, alte UI-Controls wie `buy.svg`, `locked.svg`, `settings.svg`, `stats.svg` und `achievement-pot.svg`) automatisch. `npm run assets:generate` darf dadurch keine neuen untracked Dateien erzeugen.

## Naming

- Items: `snake_case.svg`, passend zur Item-ID.
- Events: `kebab-case.svg`, im Manifest auf Event-IDs gemappt.
- UI: kurze Funktionsnamen wie `export.svg`, `sound-on.svg`, `bps.svg`.
- Plant: `stage-01.svg` bis `stage-11.svg`.

## srcset-Regel

`createItemSrcset()` gibt aktuell nur die vorhandene URL zurück. Damit sind alte defekte `@2x`-Ableitungen entfernt. Echte responsive Rastervarianten dürfen später nur eingetragen werden, wenn die Dateien wirklich existieren.

## Cleanup-Regel

Nicht referenzierte Legacy-Ordner wie `public/icons`, `public/achievements`, `public/plant-stages` und `public/img/fx` dürfen nicht zurückkehren. Neue Assets müssen über das Manifest referenziert werden.

## Abnahme

- `npm --prefix cannaclicker run build`
- Lokaler Start
- Browser-Konsole ohne offensichtliche Runtime-Fehler
- Manuelle Sichtpruefung: Shop, Events, Prestige, Achievements, Pflanze, Controls
