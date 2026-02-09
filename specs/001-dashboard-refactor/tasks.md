---
description: "Implementation tasks for Dashboard & UI Refactor"
---

# Tasks: Complete Dashboard & UI Refactor

**Input**: Design documents from `/specs/001-dashboard-refactor/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Organization**: Grouped by User Stories (P1 -> P3). Tests are integrated into each story phase.

## Phase 1: Setup & Core Data (Foundation)

**Purpose**: Establish design system and data model primitives required by all features.

- [x] T001 [P] Update `src/app/globals.css` with new Design System token variables (colors, status, spacing) per spec
- [ ] T002 Update `src/lib/firestore/karts.ts` to support `serviceIntervals` array (replacing fixed thresholds)
- [ ] T003 Update `src/lib/firestore/tasks.ts` schema to include `linkedIntervalId` for smart linkage
- [ ] T004 create `src/lib/firestore/parts.ts` for Inventory CRUD operations
- [ ] T005 Update `Kart` and `Part` interfaces in `src/types/maintenance.ts` to match new data model
- [ ] T006 [P] Update `src/hooks/useKarts.ts` to expose new service interval CRUD methods

---

## Phase 2: User Story 1 - Browse Karts List (Priority: P1)

**Goal**: Users can see all karts with status indicators.

- [x] T007 [P] [US1] Create `KartStatusBadge` component in `src/components/karts/KartStatusBadge.tsx`
- [x] T008 [P] [US1] Create `KartCard` component in `src/components/karts/KartCard.tsx` implementing new design
- [x] T009 [US1] Refactor `src/app/karts/page.tsx` to use grid layout and new `KartCard`
- [x] T010 [US1] Implement Empty State component in `src/components/ui/EmptyState.tsx`
- [x] T011 [US1] Verify Karts List matches design requirements (responsive grid, status colors)

---

## Phase 3: User Story 2 - Kart Detail Dashboard (Priority: P1)

**Goal**: Detailed maintenance status and actions for a specific kart.

- [x] T012 [P] [US2] Create `ServiceIntervalCard` component in `src/components/karts/ServiceIntervalCard.tsx`
- [x] T013 [P] [US2] Create `MaintenanceHistoryTable` component in `src/components/karts/MaintenanceHistoryTable.tsx`
- [x] T014 [US2] Refactor `src/app/karts/[id]/page.tsx` to implement new sidebar layout and dashboard sections
- [ ] T015 [US2] Implement logic in `TaskForm` to support linking tasks to service intervals
- [ ] T016 [US2] Implement logic in `useKarts` (or service) to auto-reset intervals when linked task completes
- [ ] T017 [US2] Verify Smart Linkage works: completing a linked task resets the component timer

---

## Phase 4: User Story 3 - Global Navigation (Priority: P1)

**Goal**: Consistent navigation across all pages.

- [x] T018 [US3] Create navigation config in `src/config/navigation.ts` (defining routes, labels, icons)
- [x] T019 [US3] Refactor `src/components/layout/MainLayout.tsx` to use config and new header design
- [ ] T020 [US3] Refactor `src/components/layout/BottomNav.tsx` to use config and active state indicators
- [ ] T021 [US3] Verify navigation responsiveness on Mobile vs Desktop

---

## Phase 5: User Story 4 - Team Dashboard (Priority: P2)

**Goal**: Team overview and quick actions.

- [x] T022 [P] [US4] Create `QuickActionCard` component in `src/components/dashboard/QuickActionCard.tsx`
- [x] T023 [P] [US4] Create `TeamMemberList` component in `src/components/team/TeamMemberList.tsx`
- [x] T024 [US4] Refactor `src/app/dashboard/page.tsx` to display team info, quick actions, and members
- [ ] T025 [US4] Implement "Invite Member" UI (if missing) or link to team settings

---

## Phase 6: User Story 5 - Parts Inventory (Priority: P3)

**Goal**: Manage parts supply.

- [x] T026 [US5] Create `src/hooks/useParts.ts` for managing inventory logic
- [x] T027 [US5] Create `PartForm` validation schema (Zod) and component
- [ ] T028 [US5] Implement `src/app/parts/page.tsx` with list view and filtering
- [ ] T029 [US5] Verify Add/Edit/Delete part flows

---

## Phase 7: User Story 6 - Session Logging (Priority: P3)

**Goal**: Log racing activity.

- [x] T030 [US6] Create `src/hooks/useSessions.ts` (if needed to wrap `sessionLogs.ts`)
- [x] T031 [US6] Create `SessionForm` validation schema (Zod) and component
- [ ] T032 [US6] Implement `src/app/sessions/page.tsx` with session history list
- [ ] T033 [US6] Verify creating session updates linked Kart engine hours (existing logic check)

---

## Phase 8: User Story 7 - Shopping List (Priority: P3)

**Goal**: Track needed supplies.

- [x] T034 [P] [US7] Update `src/lib/firestore/shoppingList.ts` to support `teamId` based queries
- [x] T035 [US7] Update `src/hooks/useShoppingList.ts` (create if missing)
- [ ] T036 [US7] Refactor `src/app/shopping/page.tsx` to match design system
- [ ] T037 [US7] Verify Shopping items are team-scoped

---

## Phase 9: Polish & Cross-Cutting

- [ ] T038 Conduct Accessibility Audit (Contrast, Aria Labels)
- [ ] T039 Verify Offline Mode behavior (Optimistic UI fallback)
- [ ] T040 Final E2E test run of critical paths (Add Kart -> Log Session -> Check Status)
