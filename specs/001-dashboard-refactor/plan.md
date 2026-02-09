# Implementation Plan: Dashboard & UI Refactor

**Branch**: `001-dashboard-refactor` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dashboard-refactor/spec.md`

## Summary

Refactor the entire application UI to a modern dashboard specification with a new design system. Key technical changes include migrating to a flexible "Per-Kart" service interval data model, implementing smart linkage between tasks and component timers, and comprehensive updates to Karts, Parts, and Sessions interfaces.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (React 19)
**Primary Dependencies**: Tailwind CSS v4, Firebase v9 (Firestore), Zod 4.x
**Storage**: Firestore (Persistence Enabled), IndexedDB
**Testing**: Playwright (E2E), Jest/Vitest (Unit - assumed)
**Target Platform**: Responsive Web (Mobile First PWA)
**Performance Goals**: <200ms interactions, <2s LCP on Mobile
**Constraints**: Offline capability required for logging data at the track
**Security Level**: Private Data (User/Team Isolation)

## Constitution Check

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Service/Repo pattern used in `src/lib/firestore` is preserved and extended.
- [x] **Dependency Inversion**: UI components depend on Hooks, which depend on Services.

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Zod schemas used for all form inputs (Part, Session, Kart).
- [x] **AuthZ**: Firestore Security Rules (row-level security) enforce `userId`/`teamId` checks.

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**:
    - Unit: Zod schemas, Utility functions
    - Integration: Firestore hook tests
    - E2E: Playwright flows for Critical User Journeys (Karts, Parts, Dashboard)
- [x] **Coverage**: Focusing on new critical paths (Smart Linkage logic).

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Optimistic UI updates in Hooks ensure <200ms perceived latency.
- [x] **Async Jobs**: N/A (Firestore writes are direct, no heavy backend processing).

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Data Model**: Defined in `data-model.md`.
    - Key Change: `thresholds` -> `serviceIntervals` migration.
    - Key Change: `linkedIntervalId` in Tasks.

2. **API Contracts** (Firestore Services)
    - `PartsService`: CRUD for Inventory.
    - `SessionsService`: CRUD for Racing Logs.
    - `KartService`: Extended with `addServiceInterval`, `resetServiceInterval`.

## Phase 2: Implementation Steps

1.  **Foundation**:
    -   Update `globals.css` with Design System tokens (colors, typography).
    -   Create `Navigation` config and update `MainLayout` / `BottomNav`.

2.  **Core Domain (Karts)**:
    -   Update `Kart` type and Zod schema.
    -   Migrate `useKarts` to support `serviceIntervals`.
    -   Refactor `/karts` List View (Grid, Cards).
    -   Refactor `/karts/[id]` Detail View (Status Dashboard).

3.  **Features (Inventory & Sessions)**:
    -   Implement `Parts` module (Service, Page, Forms).
    -   Implement `Sessions` module (Service, Page, Forms).

4.  **Integration (Smart Linkage)**:
    -   Update `MaintenanceTask` creation flow to allow linking to Components.
    -   Implement "Complete Task" logic to reset linked Component.

5.  **Dashboard**:
    -   Implement Team Overview and User Dashboard.

## Complexity Tracking

No violations found.

## Project Structure

```text
specs/001-dashboard-refactor/
├── plan.md              # This file
├── research.md          # Tech decisions
├── data-model.md        # Schema definitions
└── tasks.md             # Execution steps
```
