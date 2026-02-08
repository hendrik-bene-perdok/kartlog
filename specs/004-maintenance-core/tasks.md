---
description: "Implementation tasks for Kart Maintenance Core System"
---

# Tasks: Kart Maintenance Core System

**Input**: Design documents from `/specs/004-maintenance-core/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/schemas.ts, quickstart.md

**Tests**: Tests are included following Constitution Section III requirements.
- **Unit Tests**: Required for business logic (warning zones, auto-task generation, archive cleanup)
- **Integration Tests**: Required for Firestore operations, photo compression
- **E2E Tests**: Required for critical user journeys (hour logging triggers auto-task creation)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Using Next.js App Router structure (see plan.md):
- `src/app/`: Page components
- `src/components/`: UI components
- `src/hooks/`: Custom hooks (service layer)
- `src/lib/`: Infrastructure (repositories, services, validation)
- `src/types/`: TypeScript types
- `src/workers/`: Web Workers
- `tests/`: Unit, integration, and E2E tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Copy type definitions from specs/004-maintenance-core/contracts/schemas.ts to src/types/maintenance.ts
- [ ] T002 [P] Create Firestore initialization with offline persistence in src/lib/firebase/init.ts
- [ ] T003 [P] Create IndexedDB initialization for photo storage in src/lib/indexedDB/photos.ts
- [ ] T004 [P] Create base TouchButton component with 48x48px minimum in src/components/ui/TouchButton.tsx
- [ ] T005 [P] Create base SwipeableCard component using Framer Motion in src/components/ui/SwipeableCard.tsx
- [ ] T006 Force dark mode by adding className="dark" to app/layout.tsx HTML tag
- [ ] T007 [P] Create photo compression Web Worker in src/workers/photoCompressor.worker.ts
- [ ] T008 [P] Deploy Firestore composite indexes from specs/004-maintenance-core/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create Kart repository with CRUD operations in src/lib/firestore/karts.ts
- [ ] T010 [P] Create SessionLog repository with transaction support in src/lib/firestore/sessionLogs.ts
- [ ] T011 [P] Create MaintenanceTask repository with duplicate prevention in src/lib/firestore/tasks.ts
- [ ] T012 [P] Create ShoppingListItem repository with archive queries in src/lib/firestore/shoppingList.ts
- [ ] T013 [P] Create Photo repository for IndexedDB operations in src/lib/indexedDB/photoRepository.ts
- [ ] T014 Implement warning zone evaluation service in src/lib/services/warningZones.ts
- [ ] T015 [P] Implement maintenance engine for auto-task generation in src/lib/services/maintenanceEngine.ts
- [ ] T016 [P] Implement photo compression service wrapper in src/lib/services/photoCompressor.ts
- [ ] T017 [P] Implement archive cleanup service in src/lib/services/archiveCleanup.ts
- [ ] T018 [P] Create validation schemas from types in src/lib/validation/schemas.ts
- [ ] T019 Create error boundary component for React in src/components/ui/ErrorBoundary.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Multi-Kart Dashboard Overview (Priority: P1) 🎯 MVP

**Goal**: Display all karts with their current status, engine hours, pending task count, and warning zone indicators on a single dashboard.

**Independent Test**: Create two karts with different maintenance states and verify dashboard displays status correctly with visual indicators for urgency.

### Tests for User Story 1 🛡️

- [ ] T020 [P] [US1] Unit test for warning zone evaluation in tests/unit/services/warningZones.test.ts
- [ ] T021 [P] [US1] Integration test for Kart CRUD operations in tests/integration/firestore/karts.test.ts
- [ ] T022 [P] [US1] E2E test for kart dashboard display in tests/e2e/kart-dashboard.spec.ts

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create useKarts hook with query, create, delete operations in src/hooks/useKarts.ts
- [ ] T024 [P] [US1] Create useMaintenanceThresholds hook for warning zone evaluation in src/hooks/useMaintenanceThresholds.ts
- [ ] T025 [US1] Create KartCard component with warning zone indicators in src/components/karts/KartCard.tsx
- [ ] T026 [US1] Create KartForm component for kart creation in src/components/karts/KartForm.tsx
- [ ] T027 [US1] Implement karts dashboard page in src/app/karts/page.tsx
- [ ] T028 [US1] Implement kart detail page in src/app/karts/[kartId]/page.tsx
- [ ] T029 [US1] Add cascade delete confirmation dialog component in src/components/karts/DeleteKartDialog.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create karts, view dashboard with warning zones, and delete karts with confirmation

---

## Phase 4: User Story 2 - Engine Hour Logging (Priority: P1)

**Goal**: Allow users to log session durations which automatically update kart engine hours and trigger maintenance warnings/auto-tasks.

**Independent Test**: Log several sessions for a kart, verify hours accumulate correctly, and auto-tasks are created when thresholds crossed.

### Tests for User Story 2 🛡️

- [ ] T030 [P] [US2] Unit test for maintenance engine auto-task logic in tests/unit/services/maintenanceEngine.test.ts
- [ ] T031 [P] [US2] Integration test for session log transaction in tests/integration/firestore/sessionLogs.test.ts
- [ ] T032 [P] [US2] E2E test for hour logging triggering auto-task in tests/e2e/hour-logging.spec.ts

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create useSessionLogs hook with transaction-based creation in src/hooks/useSessionLogs.ts
- [ ] T034 [P] [US2] Create HourLogForm component with touch-friendly number input in src/components/karts/HourLogForm.tsx
- [ ] T035 [P] [US2] Create SessionHistoryList component showing chronological logs in src/components/karts/SessionHistoryList.tsx
- [ ] T036 [US2] Implement hour logging page in src/app/karts/[kartId]/hours/page.tsx
- [ ] T037 [US2] Integrate auto-task generation after session log creation in useSessionLogs hook
- [ ] T038 [US2] Update KartCard to refresh warning zones after logging hours

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can log hours, see accumulated totals, and auto-tasks are created when thresholds crossed

---

## Phase 5: User Story 3 - Parts Shopping List with Photo Support (Priority: P2)

**Goal**: Enable users to add parts to a shopping list with optional photo documentation, mark items as ordered, and archive them to purchase history.

**Independent Test**: Add several parts with and without photos, mark as ordered, remove to archive, and verify 12-month retention.

### Tests for User Story 3 🛡️

- [ ] T039 [P] [US3] Unit test for photo compression logic in tests/unit/services/photoCompressor.test.ts
- [ ] T040 [P] [US3] Unit test for archive cleanup (12-month filter) in tests/unit/services/archiveCleanup.test.ts
- [ ] T041 [P] [US3] Integration test for shopping list with IndexedDB photos in tests/integration/shoppingList-with-photos.test.ts
- [ ] T042 [P] [US3] E2E test for shopping list CRUD operations in tests/e2e/shopping-list.spec.ts

### Implementation for User Story 3

- [ ] T043 [P] [US3] Create useShoppingList hook with archive operations in src/hooks/useShoppingList.ts
- [ ] T044 [P] [US3] Create usePhotoCompression hook wrapping Web Worker in src/hooks/usePhotoCompression.ts
- [ ] T045 [P] [US3] Create PhotoCapture component with camera integration in src/components/shopping/PhotoCapture.tsx
- [ ] T046 [P] [US3] Create ShoppingListItem component in src/components/shopping/ShoppingListItem.tsx
- [ ] T047 [P] [US3] Create PurchaseHistory component for archived items in src/components/shopping/PurchaseHistory.tsx
- [ ] T048 [US3] Implement shopping list page in src/app/shopping/page.tsx
- [ ] T049 [US3] Implement purchase history page in src/app/shopping/history/page.tsx
- [ ] T050 [US3] Add archive cleanup trigger on dashboard mount in src/app/karts/page.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work - users can manage shopping lists with photos and view purchase history

---

## Phase 6: User Story 4 - Maintenance Task Management (Priority: P2)

**Goal**: Allow users to create, prioritize, complete, and delete maintenance tasks for specific karts using swipe gestures.

**Independent Test**: Create tasks with different priorities for multiple karts, complete with swipe gesture, and verify completion timestamps.

### Tests for User Story 4 🛡️

- [ ] T051 [P] [US4] Integration test for task CRUD with duplicate prevention in tests/integration/firestore/tasks.test.ts
- [ ] T052 [P] [US4] E2E test for task creation and swipe gestures in tests/e2e/task-management.spec.ts

### Implementation for User Story 4

- [ ] T053 [P] [US4] Create useTasks hook with complete/delete operations in src/hooks/useTasks.ts
- [ ] T054 [P] [US4] Create TaskCard component with swipe gestures (Framer Motion) in src/components/tasks/TaskCard.tsx
- [ ] T055 [P] [US4] Create TaskList component with priority sorting in src/components/tasks/TaskList.tsx
- [ ] T056 [P] [US4] Create TaskForm component for task creation in src/components/tasks/TaskForm.tsx
- [ ] T057 [US4] Implement tasks page in src/app/tasks/page.tsx
- [ ] T058 [US4] Update KartCard to display pending task count badge

**Checkpoint**: At this point, User Stories 1-4 should work - users can manage tasks with swipe gestures and see auto-generated tasks from hour logging

---

## Phase 7: User Story 5 - Quick Manual Access (Priority: P3)

**Goal**: Provide instant access to Honda GX390 manual via external link to manufacturer's website.

**Independent Test**: Tap manual button and verify it opens manufacturer's website in default browser, with offline message when no internet.

### Tests for User Story 5 🛡️

- [ ] T059 [P] [US5] E2E test for manual link opening in browser in tests/e2e/manual-access.spec.ts

### Implementation for User Story 5

- [ ] T060 [P] [US5] Create useOnlineStatus hook for detecting internet connection in src/hooks/useOnlineStatus.ts
- [ ] T061 [US5] Implement manual access page with external link in src/app/manual/page.tsx
- [ ] T062 [US5] Add offline indicator message when user is offline
- [ ] T063 [US5] Add manual access button to kart detail page navigation

**Checkpoint**: All 5 user stories should now be independently functional

---

## Phase 8: Threshold Customization (Additional Feature)

**Goal**: Allow users to customize maintenance threshold intervals and warning zones (green/yellow/red) per kart.

**Independent Test**: Change threshold values for a kart, log hours, and verify warning zones update correctly.

### Tests for Threshold Customization 🛡️

- [ ] T064 [P] Unit test for threshold validation schema in tests/unit/validation/schemas.test.ts

### Implementation for Threshold Customization

- [ ] T065 [P] Create ThresholdConfig component for editing warning zones in src/components/karts/ThresholdConfig.tsx
- [ ] T066 Implement threshold settings page in src/app/karts/[kartId]/settings/page.tsx
- [ ] T067 Add settings link to kart detail page navigation

**Checkpoint**: Users can now customize maintenance intervals for their specific karts

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T068 [P] Add loading skeletons for dashboard and lists in src/components/ui/Skeleton.tsx
- [ ] T069 [P] Add toast notifications for user actions in src/components/ui/Toast.tsx
- [ ] T070 [P] Add haptic feedback for swipe gestures (mobile devices)
- [ ] T071 [P] Optimize dashboard query performance with batch reads
- [ ] T072 [P] Add progressive image loading for shopping list photos
- [ ] T073 [P] Add data export functionality for maintenance logs
- [ ] T074 Add comprehensive README section for feature in README.md
- [ ] T075 Security Audit: Input validation at all form boundaries
- [ ] T076 Security Audit: Photo upload size limits enforced
- [ ] T077 Accessibility Audit: Keyboard navigation for all interactive elements
- [ ] T078 Accessibility Audit: Screen reader labels for warning zones
- [ ] T079 Performance Audit: Dashboard load time < 1s on 3G
- [ ] T080 Performance Audit: Photo compression time < 3s
- [ ] T081 Run quickstart.md validation - verify all setup steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T008) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion (T009-T019)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Threshold Customization (Phase 8)**: Depends on US1 and US2 completion
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (updates KartCard) but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (displays task count) and US2 (auto-tasks) but independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **Threshold Customization**: Depends on US1 (uses KartCard) and US2 (threshold changes affect hour logging)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hooks/Services before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

#### Setup Phase (Phase 1)
- T002, T003 (Database initialization) - different files
- T004, T005 (UI components) - different files
- T007, T008 (Worker and indexes) - different files

#### Foundational Phase (Phase 2)
- T010, T011, T012, T013 (All repositories) - different files
- T014, T015, T016, T017 (All services) - different files
- T018, T019 (Validation and error boundary) - different files

#### User Story 1
- T020, T021, T022 (All tests) - different files
- T023, T024 (Hooks) - different files

#### User Story 2
- T030, T031, T032 (All tests) - different files
- T033, T034, T035 (Hooks and components) - different files

#### User Story 3
- T039, T040, T041, T042 (All tests) - different files
- T043, T044, T045, T046, T047 (Hooks and components) - different files

#### User Story 4
- T051, T052 (All tests) - different files
- T053, T054, T055, T056 (Hooks and components) - different files

#### User Story 5
- T060, T062 (Hook and message) - different files

#### Polish Phase
- Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T020: "Unit test for warning zone evaluation"
Task T021: "Integration test for Kart CRUD operations"
Task T022: "E2E test for kart dashboard display"

# Launch all hooks for User Story 1 together:
Task T023: "Create useKarts hook"
Task T024: "Create useMaintenanceThresholds hook"
```

## Parallel Example: User Story 3

```bash
# Launch all hooks and components for User Story 3 together:
Task T043: "Create useShoppingList hook"
Task T044: "Create usePhotoCompression hook"
Task T045: "Create PhotoCapture component"
Task T046: "Create ShoppingListItem component"
Task T047: "Create PurchaseHistory component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T019) - CRITICAL
3. Complete Phase 3: User Story 1 (T020-T029)
4. Complete Phase 4: User Story 2 (T030-T038)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

**Result**: Users can create karts, view dashboard, log hours, and auto-tasks are created when thresholds crossed.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic dashboard MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Hour logging MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Shopping list added!)
5. Add User Story 4 → Test independently → Deploy/Demo (Task management added!)
6. Add User Story 5 → Test independently → Deploy/Demo (Manual access added!)
7. Add Threshold Customization → Test → Deploy/Demo (Full feature complete!)
8. Polish phase → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T019)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T020-T029)
   - **Developer B**: User Story 2 (T030-T038)
   - **Developer C**: User Story 3 (T039-T050)
3. After P1 stories complete (US1, US2):
   - **Developer A**: User Story 4 (T051-T058)
   - **Developer B**: User Story 5 (T059-T063)
   - **Developer C**: Threshold Customization (T064-T067)
4. All developers: Polish phase together (T068-T081)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 11 tasks
- **Phase 3 (US1 - P1)**: 10 tasks
- **Phase 4 (US2 - P1)**: 9 tasks
- **Phase 5 (US3 - P2)**: 12 tasks
- **Phase 6 (US4 - P2)**: 8 tasks
- **Phase 7 (US5 - P3)**: 5 tasks
- **Phase 8 (Threshold Customization)**: 3 tasks
- **Phase 9 (Polish)**: 14 tasks

**Total**: 80 tasks

**Parallel Opportunities**: 42 tasks marked [P] (52.5% of tasks can run in parallel within their phase)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical paths**: T001-T019 (Foundation) must complete before any user story work
- **MVP recommendation**: Complete through Phase 4 (US1 + US2) for minimal viable product
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
