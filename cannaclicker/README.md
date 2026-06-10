# BiesyClicker

BiesyClicker is a stylised botanical idle clicker built with Vite, TypeScript and Tailwind CSS. The current release candidate focuses on gameplay clarity, polished feedback, a manifest-driven asset system, improved progression, expanded random events and a clearer prestige loop.

## Requirements

- Node.js 20 or newer
- npm

## Scripts

Run commands from the repository root:

```bash
npm --prefix cannaclicker install
npm --prefix cannaclicker run dev
npm --prefix cannaclicker run build
npm --prefix cannaclicker run preview
npm --prefix cannaclicker run lint
npm --prefix cannaclicker run test
npm --prefix cannaclicker run e2e
npm --prefix cannaclicker run assets:generate
```

No Windows setup wrapper is required.

## Current Game Features

- Active clicking and passive buds per second
- 12 item tiers with escalating costs and unlock requirements
- Upgrades, 27 research nodes, 4 active abilities, 120 achievements and guided goals
- 12 random event types with instant rewards, seeds, chains, discounts or temporary boosts
- Prestige reset that awards spendable seeds while total seeds keep permanent power
- Guided goals, polished feedback, procedural SFX and motion intensity settings
- Manifest-driven SVG assets for items, events, UI, research, plant stages and backgrounds
- Autosave, manual export/import, offline progress and lightweight audio feedback

## Design Docs

- [Vision](docs/design/vision.md)
- [Art Direction](docs/design/art-direction.md)
- [Balance Targets](docs/design/balance-targets.md)
- [Early Game Balance](docs/design/early-game-balance.md)
- [Progression Model](docs/design/progression-model.md)
- [Asset System](docs/design/assets.md)
- [Shop Economy](docs/design/shop-economy.md)
- [UI System](docs/design/ui-system.md)
- [Game Feel](docs/design/game-feel.md)
- [Events And Abilities](docs/design/events-abilities.md)
- [Prestige](docs/design/prestige.md)
- [Seeds](docs/design/seeds.md)
- [Research](docs/design/research.md)
- [Achievements And Goals](docs/content/achievements.md)
- [Flavor Style](docs/content/flavor-style.md)
- [Phase Targets](docs/balance/phase-targets.md)
- [Economy Tables](docs/balance/economy-tables.md)
- [Final V1 Balance](docs/balance/final-v1-balance.md)
- [Playthrough Notes](docs/balance/playthrough-notes.md)
- [V1 Scope](docs/release/v1-scope.md)
- [Release Checklist](docs/release/checklist.md)
- [Known Issues](docs/release/known-issues.md)
- [Post-Launch Roadmap](docs/release/post-launch-roadmap.md)
- [Premium Gap Audit](docs/release/premium-gap-audit.md)
