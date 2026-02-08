# Tasks: Team UX Improvements

**Input**: Design documents from `/specs/003-team-ux-improvements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are **MANDATORY** per Constitution Section III.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Ensure branch `003-team-ux-improvements` is checked out

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Update Team type definition to include `inviteCodeExpiresAt` in `src/types/index.ts` (or wherever Team interface lives)

## Phase 3: User Story 1 - Prominent Invite Actions (Priority: P1)

**Goal**: Expose invite functionality in Team Header with secure, time-limited codes.

**Independent Test**: Click "Invite" on Team Dashboard -> Copy Code -> Wait 24h -> Verify Code Invalid (Mocked)

### Implementation for User Story 1

- [x] T003 [US1] Update `team.service.ts` to implement `generateInviteCode` with 24h expiration in `src/lib/firebase/services/team.service.ts`
- [x] T004 [US1] Update `team.service.ts` to validate expiration in `joinTeam` function using `inviteCodeExpiresAt` in `src/lib/firebase/services/team.service.ts`
- [x] T005 [P] [US1] Create `InviteButton` component with Popover/Dialog in `src/components/features/teams/InviteButton.tsx`
- [x] T006 [US1] Integrate `InviteButton` into Team Dashboard header in `src/app/(authenticated)/teams/[teamId]/page.tsx`

## Phase 4: User Story 2 - Unified Team Dashboard (Priority: P1)

**Goal**: Integrate Lists and Chat into a single dashboard view with tabs.

**Independent Test**: Navigate to Team -> Switch Tabs -> Add List Item -> Filter List

### Implementation for User Story 2

- [x] T007 [P] [US2] Create `TeamTabs` component (UI shell) in `src/components/features/teams/TeamTabs.tsx`
- [x] T008 [US2] Update `SharedList` to support rendering specific list types via props in `src/components/features/teams/SharedList.tsx`
- [x] T009 [US2] Update `SharedList` to implement "Unified" mode with client-side filtering in `src/components/features/teams/SharedList.tsx`
- [x] T010 [US2] Refactor `src/app/(authenticated)/teams/[teamId]/page.tsx` to Implement Tabs (Chat, Lists, Members) and render components conditionally
- [x] T011 [US2] Remove old List/Chat sub-pages (cleanup routes) if no longer needed (optional/check legacy)

## Phase 5: User Story 3 - Persistent Mobile Navigation (Priority: P2)

**Goal**: Provide bottom navigation bar on mobile devices.

**Independent Test**: Resize to mobile width -> Verify Bottom Bar -> Navigate

### Implementation for User Story 3

- [x] T012 [P] [US3] Create `BottomNav` component in `src/components/layout/BottomNav.tsx`
- [x] T013 [US3] Update `MainLayout` to render `BottomNav` on mobile and hide Hamburger menu for primary items in `src/components/layout/MainLayout.tsx`

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 Check and fix any accessibility issues (ARIA labels for tabs/nav)
- [x] T015 Verify E2E flows (Create Team -> Invite -> Join -> Chat -> List)

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**:
  - **US1 (Invites)**: Depends on Phase 2 (Team type update)
  - **US2 (Unified Dash)**: Independent of US1, depends on Phase 2
  - **US3 (Mobile Nav)**: Independent, depends on Phase 2

### Implementation Strategy

1. **Foundational**: Update type definitions first.
2. **US1 (Invites)**: High value, easy to implement. Secure the growth loop.
3. **US2 (Dashboard)**: Major UI refactor. Do this after invites to avoid merge conflicts in `page.tsx`.
4. **US3 (Mobile Nav)**: Isolated layout change, can be done last or parallel.
