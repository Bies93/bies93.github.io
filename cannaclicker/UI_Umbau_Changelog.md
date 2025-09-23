# Bisherige Aktionen und Umsetzungen:

## Hier vermerken, was bereits getan wurde:

Platzhalter
- Platzhalter


# URSPRUNGSPLAN: UI Umbau Changelog

originale ui.ts eingefroren unter ui_original.ts

## Overview of Current UI Monolith (cannaclicker/src/app/ui.ts)

The current `ui.ts` is a large monolith (~3200 lines) handling all UI creation, rendering, and event handling for the CannaClicker game. Key structure from semantic analysis:

- **UIRefs Interface**: Central refs object including:
  - `root`: Main container.
  - Header: `headerTitle`.
  - Stats: Labels and meta for buds, bps, bpc, total, seeds, seedRate, prestigeMult.
  - Clicker: `clickButton`, `clickLabel`, `clickIcon`.
  - Controls: Mute, export, import, reset buttons.
  - Announcer: For notifications.
  - Abilities: `abilityTitle`, `abilityList` (Map of buttons).
  - SidePanel: Tabs for "shop", "upgrades", "research", "prestige", "achievements"; views with lists/cards for each.
  - Shop: `shopEntries` (Map of ShopCardRefs with icons, ROI, costs, buy/max buttons).
  - Upgrades: `upgradeEntries` (Map of UpgradeCardRefs with requirements, progress, buy buttons).
  - Prestige: `prestigeModal` (overlay with preview, checkbox, confirm/cancel); panel refs in sidepanel.
  - Toasts: `toastContainer`.
  - Events: `eventLayer`.

- **Core Functions**:
  - `buildUI(state)`: Creates all DOM elements once.
  - `renderUI(state)`: Updates UI (stats, abilities, sidepanel, shop, upgrades, research, prestige, achievements, modal, toasts).
  - Event listeners: For clicks (manual buy, prestige), tab switches, filters, etc.
  - Inline utilities: Direct calls to `t()` (i18n), `asset()` (assets), `format*` functions, `preloadPlantStage()`, shortcuts.

Features are tightly coupled: e.g., sidepanel routes to shop/upgrades/research; prestige spans panel and modal; achievements/research have cards with effects/requirements. No separate services or primitives yet. ui_original.ts serves as backup.

## Feedback and Adjustments

### Strengths

- Phasenlogik ist sauber: Services zuerst, dann Primitives, Features, Overlays, Root.
- Verzeichnisstruktur sinnvoll, respektiert Domain-Grenzen.
- Risiken und Metriken abgedeckt.

### Risks / Gaps and Resolutions

- **Dependencies**: Vermeide Singletons (z.B. new I18nService()). Nutze pure Funktionen mit deps-Injection. Definiere früh ein Deps-Typobjekt (services, eventBus, selectors).
- **UIRefs**: Halte Refs lokal pro Feature. Root vermittelt nur Events und Updates, kein globaler Container.
- **State Layer**: Pro Feature: select(state) Selektoren/Adapter. Keine Game-Logik in services/format (nur pure Formatierung).
- **Render Strategy**: Batch-Updates mit Scheduler (requestAnimationFrame, Microtasks). Vermeide Layout-Thrash. Virtualisiere lange Listen (z.B. Shop/Research).
- **Events**: Typisiertes Event-Bus-Interface (emit/subscribe, Topics wie 'buy:shop', 'prestige:perform'). Keine direkten Aufrufe zwischen Features.
- **A11y & Focus**: Tastatur-Navigation, Focus-Traps in Modals, ARIA-Rollen/Labels, sichtbarer Focus (outline), zentrale Escape-Handling.
- **Theming/Tokens**: Design-Tokens in src/ui/theme/, Dark/Light-Modi, Kontrast-Checks. Kläre Tailwind-Layer (base, components, utilities).
- **Lazy Loading**: Code-Splitting für Sidepanel-Views/Overlays (dynamic imports). Assets via prefetch/preload in services.
- **Import Rules**: ESLint-Regeln gegen feature↔feature-Imports. Definiere Path-Aliases (z.B. @ui/services).
- **Tests**: Unit-Tests für Services/Primitives (Jest/Vitest), Contract-Tests für Features (create/update/destroy), visuelle Regression (e.g., Playwright), Playground/Storybook in src/ui/testing/.
- **Migrationsschutz**: Feature-Flags für Cutover (z.B. useNewUI flag, fallback zu ui_original.ts). Done-Kriterien pro Phase (Akzeptanzkriterien unten).
- **Error Handling**: Zentrale Error-Boundary in compose() mit Toast für UI-Fehler. Robustheit bei missing Assets/I18n-Keys (Defaults).
- **i18n Live-Update**: Mechanismus für Locale-Wechsel (updateLocale(newLocale) triggert partial Re-render via Event).
- **CI/Quality**: Lint, Type-Check, Bundle-Größe-Budgets (vite-plugin), Lighthouse für Performance/A11y.
- **GH Pages Base-Pfad**: Stelle sicher, withBase() läuft überall via Services. Kein harter Pfadbau in Features.

### Plan Adjustments

- **Phase 2**: Keine Klassen, nur Module + deps-Injection.
- **Phase 3**: Primitives strikt "dumb" (keine Spielbegriffe, nur props/events).
- **Phases 4–5**: Pro Feature Kontrakt: create(container, deps) -> { mount(), update(selectedState), destroy() }. Dokumentiere select(state).
- Zwischen Phase 4-Schritten: Messen FPS/Reflows (PerformanceObserver), Bundle-Diffs (vite build).
- Neue Phase: Accessibility zwischen 6 und 7 einfügen.
- Akzeptanzkriterien pro Phase definieren und prüfen.

## Phased Refactoring Plan

Break down the boss's 8 phases into actionable, sequential steps. Each phase focuses on extraction without breaking functionality. Test after each phase (e.g., run game, verify UI renders/updates). Use ui_original.ts for reference. Document changes here per phase.

### Phase 1: Stabilisieren (Freeze ui.ts and Mark Candidates)

Goal: Prepare ui.ts by commenting sections for easy identification/extraction. Do not change logic.

1. Read full ui.ts content.
2. Identify and mark sections with comments:
   - // START HEADER (headerTitle, controls like mute/export/import/reset)
   - // END HEADER
   - // START CLICKER (clickButton, announcer, floating values)
   - // END CLICKER
   - // START SIDE PANEL (tabList, views for shop/upgrades/research/prestige/achievements)
   - // END SIDE PANEL
   - // START SHOP (shopEntries creation/update)
   - // END SHOP
   - // START UPGRADES (upgradeEntries)
   - // END UPGRADES
   - // START RESEARCH (research filters, entries)
   - // END RESEARCH
   - // START PRESTIGE (prestige panel, modal)
   - // END PRESTIGE
   - // START ACHIEVEMENTS (entries)
   - // END ACHIEVEMENTS
   - // START EVENTS (eventLayer, computeEventPath)
   - // END EVENTS
   - // START ABILITIES (abilityList)
   - // END ABILITIES
   - // START TOASTS (toastContainer, showToast)
   - // END TOASTS
   - Mark inline classes/styles for primitives (e.g., Button, Card classes).
3. Mark service calls: e.g., // SERVICE: i18n t() calls
4. Commit marked ui.ts.

### Phase 2: Services Extrahieren (Extract Services First)

Goal: Extrahiere Utilities als pure Funktionen/Module in src/ui/services/. Nutze deps-Injection (Deps-Typ definieren: { format: FormatDeps, i18n: I18nDeps, ... }). Reine Module, kein new oder Singletons. Ersetze direkte Aufrufe.

Akzeptanzkriterien: Services sind rein (kein State), 100% Test-Coverage, i18n-Live-Update funktioniert (partial render), Base-Pfade via withBase().

1. Create directory: src/ui/services/
2. Definiere Deps-Typ in src/ui/types.ts (interface Deps { i18n: { t: (locale, key) => string; updateStrings: () => void }, ... }).
3. Extract i18n: Pure functions t(), updateStrings() in services/i18n.ts (wrap i18n.ts, no class). Support Live-Update via event.
4. Extract assets: Pure functions asset(), withBase(), plantStageAsset(), buildItemSrcset() in services/assets.ts. Add prefetch/preload API.
5. Extract format: Pure functions formatRoi, formatDuration, etc. in services/format.ts (keine Game-Logik, nur Formatierung).
6. Extract shortcuts: Pure functions attachGlobalShortcuts(), detach() in services/shortcuts.ts.
7. Extract preload: Pure preloadPlantStage() in services/preload.ts.
8. Extract retina: Pure appendRetinaSuffix() in services/retina.ts.
9. Update ui.ts: Create deps = createDeps() (pure module exports), replace z.B., t() -> deps.i18n.t().
10. Test: Unit-Tests für pure functions, Integration: Strings/Assets laden, Shortcuts/Preload arbeiten. Mess Bundle-Größe.

### Phase 3: Primitives Extrahieren (Extract Primitives)

Goal: Erstelle dumb, reusable Components in src/ui/primitives/ (keine Spielbegriffe, nur props/events). Entferne inline HTML/CSS aus ui.ts. Integriere Tailwind-Layering.

Akzeptanzkriterien: Primitives sind unabhängig testbar (Storybook), A11y-konform (ARIA, Keyboard), <100 LoC pro Primitive, keine inline Styles.

1. Create directory: src/ui/primitives/
2. Setup Tailwind-Layer in theme/ (base/components/utilities), Tokens für Colors/Spacing.
3. Extract Button: primitives/button.ts (generic, props: label, onClick, disabled; events; A11y: role, aria-label).
4. Extract Card: primitives/card.ts (props: icon, title, desc, children; dumb Layout).
5. Extract Tab-Strip: primitives/tab-strip.ts (props: tabs, activeTab, onTabChange; ARIA tabs).
6. Extract Modal: primitives/modal.ts (props: open, onClose, children; Focus-Trap, Escape-Handler, Overlay).
7. Extract Toast: primitives/toast.ts (props: message, type, duration; Auto-dismiss).
8. Extract Stat-Block: primitives/stat-block.ts (props: label, value, meta; Format via deps).
9. Extract others: Icon (SVG/Sprite), Badge, Grid (CSS Grid), Progress (Bar/Fill).
10. Update ui.ts: Import/use primitives, entferne inline className/style. Add Theming-Props.
11. Test: Unit/Visual-Regression-Tests, Storybook-Demos. Check Kontrast/Dark-Mode.

### Phase 4: Feature-weise Auslagern (Extract Features Step-by-Step)

Goal: Extrahiere Features nach src/ui/features/ in Reihenfolge: Header → SidePanel → Shop → Upgrades → Research → Prestige → Events → Achievements → Clicker. Lazy-Loading für Views (dynamic import). Lokale Refs, deps-Injection.

Akzeptanzkriterien: Jede Extraction behält Funktionalität, FPS >60, Bundle < original (diff check). Feature-Flag für Fallback.

1. Create directory: src/ui/features/
2. Setup Event-Bus in src/ui/events.ts (typed: type Topics = 'buy:shop' | 'prestige:perform' | ...; interface EventBus { emit<T>(topic: Topics, payload?: T): void; subscribe<T>(topic: Topics, cb: (payload: T) => void): () => void }). Subscribe on mount(), unsubscribe on destroy(). Check leaks (unsubscribe all).
3. Extract Header: features/header/index.ts (create(container, deps): { mount(), update(stateSlice), destroy() }). Local refs.
4. Extract SidePanel: features/sidepanel/ (tabs via primitive, lazy-load sub-views: await import('./shop')). Emit typed tab-change events.
5. Extract Shop: features/shop/ (getShopEntries via select, sort, cards; virtualisiere >50 Items: fixed height ~100px/item, visible window + buffer 5-10 via vanilla IntersectionObserver/scroll). Buy -> emit('buy:shop', {id}).
6. Extract Upgrades: features/upgrades/ (cards, reqs via select, celebration on buy). Subscribe to 'prestige:reset' for clear.
7. Extract Research: features/research/ (filters, cards, locks/effects via select; virtualisiere >50: fixed height ~100px/item, window + buffer 5-10).
8. Extract Prestige: features/prestige/ (panel, preview/action; exclude modal). Emit 'prestige:perform'.
9. Extract Events: features/events/ (eventLayer, computePath, click-feedback). Subscribe to game events.
10. Extract Achievements: features/achievements/ (list/badges via select). Virtualisiere if many.
11. Extract Clicker: features/clicker/ (button, plant-img, manual-click). Emit 'click:gain', subscribe to multipliers.
12. Nach jeder Extraction: Test incremental (run game, check feature), mess FPS/Reflows (PerformanceObserver), Bundle-diff (vite build). Update Feature-Flag.

### Phase 5: Pro Feature (Per Feature Refinements)

Goal: Verfeinere jedes Feature: Encapsuliere select(state) Selektoren, entferne Cross-Refs. Definiere Kontrakt: create(container, deps) -> { mount(), update(selectedState), destroy() }. Event-Bus für Kommunikation.

Akzeptanzkriterien: Features isolierbar (Contract-Tests: input state -> output DOM/events), keine globalen Queries, 80% Test-Coverage. Error-Handling (try-catch -> emit 'error:ui').

1. Pro Feature: Dokumentiere select(state): z.B., shopSelect(state) = { owned: state.shop.owned, buds: state.buds } (in features/shop/selectors.ts).
2. Passe Features an: update(selectedSlice) statt full state. Local refs (kein global UIRefs). No immediate DOM from event-handlers; requestUpdate() -> scheduler.
3. Entferne Cross-Refs: Alle Interaktionen via typed Event-Bus (emit/subscribe only).
4. Implementiere destroy() für Cleanup (event unsubscribe, DOM remove, leak-check: assert no pending subs).
5. Refactor ui.ts: Import features, wire via deps (pass eventBus, selectors).
6. Add Error-Boundary pro Feature (catch updates, show toast via deps).
7. Test: Isolation (mock deps/state), Integration (wire in Playground), Visual-Regression für Cards. Event-Leak-Tests (subscribe/unsubscribe counts).

### Phase 6: Overlays Ablösen (Detach Overlays)

Goal: Ablöse Overlays nach src/ui/overlays/ mit eigenem Lifecycle (lazy-load, independent mount).

Akzeptanzkriterien: Overlays öffnen/schließen <100ms, Focus-Trap/A11y, keine Re-render des Roots. Feature-Flag für old modals.

1. Create directory: src/ui/overlays/
2. Extract Prestige-Modal: overlays/prestige-modal/index.ts (create(deps): { open(state), close(), update(preview) }). Lazy import, Focus-Trap, ARIA-dialog.
3. Extract Toasts: overlays/toasts/index.ts (create(container, deps): { show(message, type), updateOffline() }). Queue-Management, Auto-dismiss.
4. Extract Confirm (if exists): overlays/confirm/ (generic confirm(props)).
5. Update features: Import on-demand (dynamic import), emit 'modal:open' für Trigger.
6. Lifecycle: Mount once, toggle visibility/events. Escape -> close via bus.
7. Error-Handling: Fallback-UI bei Fehlern.
8. Test: Unit für open/close, Integration mit Prestige-Buy, A11y-Audit (Focus, Screenreader).

### Phase 7: Accessibility Enhancements

Goal: Integriere A11y und Focus-Management zentral. Audit und fix für alle Components/Features.

Akzeptanzkriterien: Lighthouse A11y Score >95, Keyboard-only Navigation (Tab/Arrow/Escape), Screenreader-kompatibel (NVDA/VoiceOver), Focus-Indicators sichtbar.

1. Zentrale A11y-Utils in src/ui/a11y.ts (focusTrap, ariaAnnounce, keyboardNav).
2. Audit Primitives: Add ARIA-Rollen/Labels, Keyboard-Events (e.g., Tab-Strip: Arrow-Keys).
3. Audit Features/Overlays: Focus-Trap in Modals/Toasts, Escape-Handler global (bus.emit('escape')).
4. Theming: Kontrast-Checks (Tools: WAVE), Dark-Mode Toggle via Flag.
5. Global: Skip-Links, Semantic HTML (nav, main, aside), Reduced-Motion Support (@media prefers-reduced-motion).
6. Update Tailwind: Custom Focus-Styles (ring, outline).
7. Test: Manual Keyboard-Test, Automated (axe-core in CI), A11y-Plugin für Storybook.

### Phase 8: Composition-Root Neu Aufsetzen (Rebuild Composition Root)

Goal: Ersetze buildUI() durch kleinen compose() in src/ui/app/. Render-Scheduler (rAF-Loop, dirty-set, features requestUpdate(), no immediate DOM from handlers), Error-Boundary. Local Refs, Event-Mediation.

Akzeptanzkriterien: Compose <200 LoC, Scheduler batcht ohne Thrash, Error-Boundary catches, Full-Assembly. Feature-Flag für Monolith-Fallback.

1. Create directory: src/ui/app/
2. Implement Deps-Creation: createDeps() -> { services, eventBus, selectors, theme }.
3. Implement Render-Scheduler: Global dirty-set (Map<featureId, true>), rAF-loop: if dirty, forEach dirty feature: f.update(select(f)); clear dirty.
4. Features register requestUpdate(): add to dirty-set, scheduler.next().
5. Implement compose(deps): Erstelle root (mount-container), init scheduler, lazy mount Features/Overlays, wire Bus/Selectors. Return { root, eventBus, scheduler } (no central refs).
6. Implement mount(root): Append to DOM.
7. Add Batch-Update: In renderLoop: queueUpdates(state) -> scheduler.requestBatch(state).
8. Add Error-Boundary: Wrap compose/scheduler in try-catch, emit 'error:ui' -> Toast.
9. Migrate root/UI-Creation aus ui.ts zu compose(). Update main.ts: const ui = compose(createDeps()); ui.mount(); renderLoop(state) -> ui.scheduler.requestBatch(state).
10. Wire: Root subscribed to Bus, mediates (z.B., on 'buy' -> relevant features requestUpdate()).
11. Virtualisierung: Konkret für Shop/Research: Wenn >50 Items, virtualisiere (fixed height ~100px/item, visible window + buffer 5-10 elements, vanilla IntersectionObserver/scroll-calc).
12. Test: E2E-Assembly, Performance (FPS >60 on updates, no leaks), Bundle-Optim (Lazy-Imports).

### Phase 9: Aufräumen (Cleanup)

Goal: Entferne Dead Code, konsolidiere Assets. Setup CI/Tests, final Audit.

Akzeptanzkriterien: Kein Dead Code (coverage >90%), Bundle < original, Lighthouse Scores >90 (Perf/A11y), CI-Pipeline grün.

1. Remove unused aus ui.ts (ESLint no-unused-vars, grep).
2. Consolidate Icons/Assets: Nach src/ui/theme/ (Sprites), Preload via services.
3. Delete root-ui.ts nach Migration (Feature-Flag off).
4. Setup Import-Lint: No feature-cross, Aliases (@ui/... in tsconfig/vite).
5. Run Linter/Type-Check, remove Duplicates (z.B., format-Fns).
6. Add Tests: Unit/Contract/Visual in src/ui/testing/, Storybook Setup.
7. CI: vite-plugin-bundle-size, Lighthouse-CI, axe-a11y in GitHub Actions.
8. Final E2E-Test: Voll-Game-Flow (Click/Buy/Prestige/Events), Multi-Device.
9. Update Docs: Final Structure, Migration-Notes hier.

## Sinnvolle Ordnerstruktur

As proposed, erweitert um a11y, events, types:

- `src/ui/app/`: compose.ts, mount.ts (Root holds only mount-container and event-bus; no central ui-refs).

- `src/ui/primitives/`: button.ts, icon.ts, card.ts, badge.ts, stat-block.ts, tab-strip.ts, modal.ts, toast.ts, grid.ts, progress.ts.

- `src/ui/services/`: i18n.ts, assets.ts, format.ts, shortcuts.ts, preload.ts, retina.ts (pure functions).

- `src/ui/features/`: header/, clicker/, stats/, shop/, upgrades/, research/, prestige/, achievements/, events/, sidepanel/ (je: index.ts, selectors.ts, events.ts).

- `src/ui/overlays/`: prestige-modal/, toasts/, confirm/ (lazy-load).

- `src/ui/theme/`: tokens.css, variables.css, backgrounds.svg (Dark/Light).

- `src/ui/testing/`: stories/ (Storybook), playgrounds/ (isolated Features), tests/ (unit/integration).

- `src/ui/a11y/`: utils.ts (focusTrap, announce).

- `src/ui/events/`: bus.ts (EventBus).

- `src/ui/types/`: deps.ts, events.ts (Typings).

This promotes modularity, Testability, Performance.

## Next Steps

- Implement phases sequentially, mit Feature-Flags (z.B., in state.ui.newStructure).
- Track changes: "## Phase X Completed - Date" mit Diffs, Metrics (FPS/Bundle).
- Tests: Setup Vitest/Jest, Storybook, axe-core. Run pro Phase.
- CI: GitHub Actions für Lint/Type/Build/Lighthouse/A11y.
- Migrations: Stepwise, Fallback zu ui_original.ts hinter Flag. Done pro Phase: Funktionalität = Original, Metrics besser.

### Acceptance Criteria per Phase

- Phase 1: Alle Sections markiert, ui.ts läuft identisch.
- Phase 2: Services pure, Calls ersetzt, Tests >90% Coverage.
- Phase 3: Primitives dumb/A11y-ready, Render konsistent.
- Phase 4: Features extrahiert, Lazy-OK, FPS stable.
- Phase 5: Selektoren/Events wirken, Isolation-Tests pass.
- Phase 6: Overlays independent, <100ms Toggle.
- Phase 7: A11y Score >95, Keyboard-Test pass.
- Phase 8: Compose batcht, Error-Boundary catches.
- Phase 9: Clean, CI green, E2E pass.

### Potential Risks (Expanded)

- Event wiring breaks: -> Typed Topics, Subscribe-Tests.
- State selectors miss: -> Snapshot-Tests für select().
- Asset paths: -> Services wrap, Mock in Tests.
- Performance Thrash: -> rAF-Scheduler, Virtualisiere Lists.
- A11y Regression: -> Automated Audits pro Commit.
- Bundle Bloat: -> Tree-Shaking, Lazy, Size-Budgets.

### Success Metrics (Expanded)

- UI identisch funktional.
- Modular: <300 LoC/Feature, Testable isolation.
- Perf: FPS >60 on updates, Bundle < original.
- Quality: Coverage >90%, A11y/Perf Lighthouse >90.
- Maintainable: Lint/Types strict, Docs vollständig.