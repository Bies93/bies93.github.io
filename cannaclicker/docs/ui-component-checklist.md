# UI Component Checklist

Use this checklist before shipping any UI component or HUD change.

## Accessibility & Semantics
- [ ] Provide an `aria-label`/`aria-labelledby` describing the component's purpose.
- [ ] Define focus order and keyboard interactions; ensure focus is restored when popovers/modals close.
- [ ] Expose semantic `role` attributes (`region`, `button`, `status`, etc.) that match the behaviour.

## Internationalisation
- [ ] All visible copy and announcements use registered i18n keys.
- [ ] Placeholder text is avoided; load the correct locale before mounting.

## Testing Hooks
- [ ] Add `data-ui-role` for semantic identification.
- [ ] Add `data-testid` for automated testing.
- [ ] Keep hooks stable—prefer descriptive values over generated hashes.

## Resilience
- [ ] Guard against `null` DOM lookups. Provide safe fallbacks instead of throwing.
- [ ] When data is missing, render a neutral fallback state (empty lists, disabled buttons, etc.).
- [ ] Log degraded modes in the HUD via `showHudNotice` so QA can spot issues quickly.

## Focus Management
- [ ] When opening overlays, trap focus and restore the previous active element on close.
- [ ] Ensure programmatic focus shifts remain within the viewport and are announced if needed.
