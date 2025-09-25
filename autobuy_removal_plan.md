# Plan zur vollständigen Entfernung des AutoBuy-Features

## Übersicht
Dieses Dokument beschreibt alle notwendigen Änderungen, um das AutoBuy-Feature vollständig aus dem Projekt zu entfernen, ohne andere Funktionen zu beeinträchtigen.

## Datei: cannaclicker/src/app/autobuy.ts
Diese Datei sollte vollständig gelöscht werden, da sie ausschließlich das AutoBuy-Feature implementiert.

## Datei: cannaclicker/src/app/state.ts
### Zu entfernende Interfaces und Konstanten:
- Interface `AutoBuyRoiConfig` (Zeilen 118-121)
- Interface `AutoBuyReserveConfig` (Zeilen 123-126)
- Interface `AutoBuyState` (Zeilen 128-132)
- Interface `AutomationState` (Zeilen 134-136) - Falls keine anderen Automatisierungen geplant sind
- Konstanten `AUTO_BUY_ROI_MIN`, `AUTO_BUY_ROI_MAX`, `AUTO_BUY_RESERVE_MIN`, `AUTO_BUY_RESERVE_MAX` (Zeilen 149-152)
- Funktion `createDefaultAutomation` (Zeilen 158-166) - Anpassen, falls keine anderen Automatisierungen geplant sind

### Anpassung der Funktion createDefaultAutomation:
Wenn keine anderen Automatisierungen geplant sind, sollte die Funktion angepasst werden zu:
```typescript
export function createDefaultAutomation(): AutomationState {
  return {
    // Falls keine Automatisierung mehr benötigt wird, kann dies angepasst werden
    // oder falls andere Automatisierungen kommen, entsprechend anpassen
  } satisfies AutomationState;
}
```

## Datei: cannaclicker/src/app/loop.ts
### Zu entfernende Elemente:
- Import `runAutoBuy, AUTO_BUY_INTERVAL_SECONDS` aus './autobuy' (Zeile 5)
- Variable `autoBuyTimer` (Zeile 30)
- Inkrementierung `autoBuyTimer += delta` (Zeile 83)
- Bedingte Ausführung des AutoBuy (Zeilen 90-92):
```typescript
if (autoBuyTimer >= AUTO_BUY_INTERVAL_SECONDS) {
  autoBuyTimer = 0;
  runAutoBuy(state);
}
```

## Datei: cannaclicker/src/app/save/migrations.ts
### Zu entfernende Elemente:
- Funktion `normaliseAutomation` muss angepasst werden, um AutoBuy-Logik zu entfernen (Zeilen 340-368)
- Import von AutoBuy-Konstanten (Zeilen 2-5)

### Anpassung der Funktion normaliseAutomation:
Die Funktion sollte angepasst werden, um keine AutoBuy-Logik mehr zu enthalten.

## Datei: cannaclicker/src/app/game.ts
### Anpassung der Funktion buyItem:
- Parameter `source: 'manual' | 'auto'` kann entfernt werden
- Der Teil, der `recordInteraction(state)` nur bei 'manual' aufruft, sollte angepasst werden, um es immer aufzurufen oder nur noch bei manuellen Käufen

## Zusammenfassung der zu löschenden Elemente
1. Komplette Datei `cannaclicker/src/app/autobuy.ts`
2. Alle AutoBuy-bezogenen Interfaces in `state.ts`
3. AutoBuy-bezogene Logik in `loop.ts`
4. AutoBuy-bezogene Migrationen in `migrations.ts`
5. Anpassung der `buyItem`-Funktion in `game.ts`

Diese Änderungen sollten das AutoBuy-Feature vollständig entfernen, ohne andere Funktionen des Spiels zu beeinträchtigen.