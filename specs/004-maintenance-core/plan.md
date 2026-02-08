# Implementation Plan: Kart Maintenance Core System

**Branch**: `004-maintenance-core` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-maintenance-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a comprehensive kart maintenance and logging system for managing Honda GX390-powered go-karts with multi-kart support, engine hour tracking, maintenance task management, parts shopping list with photo support, and a touch-friendly "Garage Mode" UI optimized for use with dirty hands/gloves. The system will operate offline-first with local-only data storage, featuring pre-configured maintenance thresholds with customizable warning zones (green/yellow/red), automatic task generation based on engine hours, and a 12-month purchase history archive.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16 (React 19), Firebase v9 (Firestore), Zod 4.x for validation, Tailwind CSS 4  
**Storage**: Firestore (offline persistence enabled), IndexedDB for local-first storage, Device file system for photos  
**Testing**: Vitest (unit/integration), Playwright (E2E), React Testing Library  
**Target Platform**: Progressive Web App (PWA) for mobile devices (iOS/Android/desktop browsers)  
**Project Type**: Web application (Next.js app with PWA capabilities)  
**Performance Goals**: 
- Dashboard load < 1s on 3G connection
- Hour logging/task creation actions complete within 300ms
- Photo compression < 3s
- Support 10 karts with 100+ combined tasks/items without lag

**Constraints**: 
- Offline-first: Core features must work without internet (manual access requires online)
- Touch-optimized: 48x48px minimum touch targets
- Dark mode by default for garage environments
- Photo storage: Images compressed to <500KB each
- Data retention: Shopping list archive auto-deletes after 12 months

**Scale/Scope**: 
- Single-user initially (team collaboration in separate feature 002)
- Up to 10 karts per user
- ~50-100 tasks and shopping items active at any time
- Session logs: ~500 entries per kart per year

**Security Level**: Internal (user data stored locally, no PII transmission for MVP)  

**Observability**: 
- Structured logging via console (development)
- Error boundaries for React components
- Performance monitoring via Next.js built-in metrics
- Offline/online state tracking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Yes - React components (UI layer) → Custom hooks (Service layer) → Firestore/IndexedDB repositories (Data layer). Business logic (threshold calculations, warning zones) will be isolated in service modules.
- [x] **Dependency Inversion**: Yes - Business rules (maintenance scheduling, auto-task generation) will be framework-agnostic. Firestore details hidden behind repository interfaces.

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Yes - All form inputs validated using Zod schemas at component boundaries before passing to service layer
- [x] **AuthZ**: N/A for MVP - Offline-first with local-only data. No server-side auth required. Future team feature (002) will add Firebase Auth.
- [x] **Data Protection**: Yes - No PII collected in MVP. Photo storage uses app-isolated file system. Data never leaves device.

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**: Yes
  - Unit: Threshold calculation logic, warning zone evaluation, date/time utilities, validation schemas
  - Integration: Firestore repository operations, photo compression, offline persistence
  - E2E: Critical flows (create kart, log hours, add tasks, trigger auto-tasks)
- [x] **Coverage**: Yes - Core business logic (maintenance thresholds, auto-task generation) is pure TypeScript, easily testable to >80%

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Yes
  - Reads: Firestore offline cache provides instant (<50ms) reads
  - Writes: Firestore batch writes + optimistic UI keeps perceived latency <300ms
  - Dashboard: Pre-calculated aggregates (total hours, task count) cached in Firestore docs
- [x] **Async Jobs**: Yes - Photo compression runs in Web Worker (non-blocking). Shopping list archive cleanup scheduled as background task.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── karts/                    # Kart management pages
│   │   ├── page.tsx              # Kart dashboard (User Story 1)
│   │   ├── [kartId]/
│   │   │   ├── page.tsx          # Kart detail view
│   │   │   ├── hours/page.tsx    # Hour logging (User Story 2)
│   │   │   └── settings/page.tsx # Threshold configuration
│   ├── tasks/                    # Task management (User Story 4)
│   │   └── page.tsx
│   ├── shopping/                 # Shopping list (User Story 3)
│   │   ├── page.tsx
│   │   └── history/page.tsx      # 12-month archive
│   └── manual/page.tsx           # External manual link (User Story 5)
│
├── components/
│   ├── karts/
│   │   ├── KartCard.tsx          # Dashboard card with warning zones
│   │   ├── KartForm.tsx
│   │   ├── HourLogForm.tsx
│   │   └── ThresholdConfig.tsx   # Warning zone editor (green/yellow/red)
│   ├── tasks/
│   │   ├── TaskList.tsx          # Swipeable task items
│   │   ├── TaskCard.tsx          # Priority-colored cards
│   │   └── TaskForm.tsx
│   ├── shopping/
│   │   ├── ShoppingListItem.tsx
│   │   ├── PhotoCapture.tsx      # Camera integration
│   │   └── PurchaseHistory.tsx
│   └── ui/
│       ├── SwipeableCard.tsx     # Reusable swipe gesture component
│       └── TouchButton.tsx       # 48x48px touch target wrapper
│
├── hooks/
│   ├── useKarts.ts               # Kart CRUD operations
│   ├── useSessionLogs.ts         # Hour logging service
│   ├── useTasks.ts               # Task management + auto-generation
│   ├── useShoppingList.ts        # Shopping list + archive
│   ├── useMaintenanceThresholds.ts # Warning zone calculations
│   └── usePhotoCompression.ts    # Web Worker wrapper
│
├── lib/
│   ├── firestore/
│   │   ├── karts.ts              # Kart repository
│   │   ├── sessionLogs.ts        # Session log repository
│   │   ├── tasks.ts              # Task repository
│   │   └── shoppingList.ts       # Shopping list repository
│   ├── services/
│   │   ├── maintenanceEngine.ts  # Auto-task generation logic
│   │   ├── warningZones.ts       # Green/yellow/red evaluation
│   │   ├── photoCompressor.ts    # Image compression service
│   │   └── archiveCleanup.ts     # 12-month cleanup scheduler
│   └── validation/
│       └── schemas.ts            # Zod schemas for all entities
│
├── types/
│   ├── kart.ts
│   ├── sessionLog.ts
│   ├── task.ts
│   ├── shoppingListItem.ts
│   └── maintenanceThreshold.ts
│
└── workers/
    └── photoCompressor.worker.ts # Background photo processing

tests/
├── unit/
│   ├── services/
│   │   ├── maintenanceEngine.test.ts
│   │   ├── warningZones.test.ts
│   │   └── archiveCleanup.test.ts
│   └── validation/
│       └── schemas.test.ts
├── integration/
│   ├── firestore/
│   │   ├── karts.test.ts
│   │   └── tasks.test.ts
│   └── photoCompression.test.ts
└── e2e/
    ├── kart-management.spec.ts
    ├── hour-logging.spec.ts
    └── auto-task-generation.spec.ts
```

**Structure Decision**: Next.js App Router with feature-based organization. UI components grouped by domain (karts, tasks, shopping), business logic in hooks/services layer, and data access in Firestore repositories. This aligns with existing 002-team-management structure while maintaining clear separation of concerns (Constitution I.3).

## Complexity Tracking

No violations - all Constitution Check gates passed.
