# UI Naming & Styling Conventions

To keep the in-game HUD predictable and testable, all UI code must follow these rules:

## Utility-First Styling
- Use Tailwind utility classes for layout, spacing, color and effects.
- Legacy BEM classes remain for compatibility, but new styling tweaks must be added through Tailwind utilities instead of ad-hoc class names.
- Prefer composition of utilities over authoring new CSS selectors. If a new utility is missing, add it to `tailwind.config.js` rather than shipping bespoke styles.

## Data Attributes as Hooks
- Every interactive node must expose a semantic `data-ui-role` describing its purpose (e.g. `data-ui-role="ability-button"`).
- Provide `data-testid` on the same node for stable automated testing hooks.
- Avoid overloading `id` for automation; IDs remain reserved for accessibility relationships.

## Accessibility Metadata
- Regions rendered by JavaScript must carry an `aria-label` or `aria-labelledby` reference so assistive tech can understand their purpose.
- When dynamic content is inserted (toasts, event icons, etc.) ensure the parent region exposes the correct `role` (`region`, `status`, `alert`, …) so announcements fire reliably.

These conventions are enforced in `mountRoot`, `mountPanels` and component factories. New components **must** adopt the same attributes before merging.
