# kartlog Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-07

## Active Technologies
- Firestore (002-team-management)
- TypeScript 5.x + Next.js 16 (React 19), Firebase v9 (Firestore), Zod 4.x for validation, Tailwind CSS 4 (004-maintenance-core)
- Firestore (offline persistence enabled), IndexedDB for local-first storage, Device file system for photos (004-maintenance-core)

- TypeScript 5.x + Next.js 16 (React 19) + Firebase v9 + Tailwind CSS 4 (002-team-management)

## Project Structure

```text
specs/
src/
  app/
  components/
  lib/
  types/
tests/
```

## Commands

npm run dev; npm run lint; npm run test; npm run test:e2e

## Code Style

TypeScript: Follow standard conventions (strict mode, interfaces for domain objects)
React: Functional components, Hooks for logic, Context for global state

## Recent Changes
- 004-maintenance-core: Added TypeScript 5.x + Next.js 16 (React 19), Firebase v9 (Firestore), Zod 4.x for validation, Tailwind CSS 4
- 002-team-management: Added TypeScript 5.x + Next.js 16 (React 19) + Firebase v9 + Tailwind CSS 4
- 003-team-ux-improvements: Unified Team Dashboard (Lists + Chat + Members), Persistent Mobile Nav, Invite Expiration

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
