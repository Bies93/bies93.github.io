# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure
- Main application code is in the `cannaclicker/` subdirectory
- The project is a cannabis-themed idle clicker game built with Vite + TypeScript
- Node.js version >=20 required (specified in engines field)

## Build Commands
- All npm commands must be run through `setup_env.bat`: `.\setup_env.bat npm --prefix cannaclicker run build`
- Development server: `.\setup_env.bat npm --prefix cannaclicker run dev`
- Build for production: `.\setup_env.bat npm --prefix cannaclicker run build`
- Preview production build: `.\setup_env.bat npm --prefix cannaclicker run preview`

## Testing Commands
- Run all tests: `.\setup_env.bat npm --prefix cannaclicker run test`
- Run tests with UI: `.\setup_env.bat npm --prefix cannaclicker run test:ui`
- Run e2e tests: `.\setup_env.bat npm --prefix cannaclicker run e2e`

## Linting & Formatting
- Lint TypeScript files: `.\setup_env.bat npm --prefix cannaclicker run lint`
- Format all files: `.\setup_env.bat npm --prefix cannaclicker run format`

## Architecture Notes
- Game state is managed in `src/app/state.ts` with save/load functionality in `src/app/save.ts`
- UI is bootstrapped via `src/app/ui.ts` and `src/app/ui/bootstrap.ts` using a mount/wire/render pattern
- Game loop runs in `src/app/loop.ts` with 10-second autosave interval
- UI updates are driven by the game loop via the render function
- The `setup_env.bat` script adds a specific path before executing commands

## UI Architecture
- UI follows a mount/wire/render pattern in `src/app/ui/`
- UI components are wired with event listeners in `src/app/ui/wire.ts`
- UI state updaters are in `src/app/ui/updaters/` directory
- DOM references are managed through `UIRefs` interface
- Accessibility focus management handled by @zag-js/focus-visible

## Code Style
- TypeScript strict mode with noUnusedLocals and noUnusedParameters enabled
- ESLint with TypeScript plugin and Prettier integration
- Tailwind CSS for styling with custom leaf and soil color palettes
- Vite build with sourcemaps enabled