---
description: "Task list for Team Management feature implementation"
---

# Tasks: Team Management & Collaboration

**Input**: Design documents from `/specs/002-team-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/schemas.ts
**Tests**: MANDATORY (Vitest/Playwright)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and type definitions.

- [x] T001 Create folder structure for teams feature in `src/app/(authenticated)/teams` and `src/components/features/teams`
- [x] T002 [P] Create domain types in `src/types/domain/team.types.ts` (from data-model.md)
- [x] T003 [P] Create validation schemas in `src/lib/contracts/team.schema.ts` (from contracts/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Firebase services and security rules required for all stories.

- [x] T004 Create Firestore data converters in `src/lib/firebase/converters/team.converters.ts`
- [x] T005 Setup Base Team Service skeleton in `src/lib/firebase/services/team.service.ts`
- [x] T006 [P] Implement initial Firestore Security Rules for Teams collection in `firestore.rules`
- [x] T007 [P] Create generic Service/Server Action error handling wrapper in `src/lib/utils/service-result.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Team Lifecycle (Priority: P1) 🎯 MVP

**Goal**: Create, view, update, and disband teams.

**Independent Test**: User can create a team, see it in the list, rename it, and delete it.

### Tests for User Story 1
- [x] T008 [P] [US1] Create unit tests for TeamService (lifecycle methods) in `src/lib/firebase/services/team.service.test.ts`

### Implementation for User Story 1
- [x] T009 [P] [US1] Implement `createTeam` and `getUserTeams` in `src/lib/firebase/services/team.service.ts`
- [x] T010 [P] [US1] Implement `updateTeam` and `deleteTeam` in `src/lib/firebase/services/team.service.ts`
- [x] T011 [US1] Create Team Creation Page UI in `src/app/(authenticated)/teams/create/page.tsx`
- [x] T012 [US1] Create Team List Page UI in `src/app/(authenticated)/teams/page.tsx`
- [x] T013 [US1] Create Team Settings Page UI (Rename/Disband) in `src/app/(authenticated)/teams/[teamId]/settings/page.tsx`
- [x] T014 [US1] Integrate `TeamList` component in `src/components/features/teams/TeamList.tsx`

---

## Phase 4: User Story 2 - Member Management & Roles (Priority: P1)

**Goal**: Invite users via link, approve requests, manage roles (Promote/Transfer), and remove members.

**Independent Test**: User A shares link, User B requests, User A approves. User A promotes User B to Admin.

### Tests for User Story 2
- [x] T015 [P] [US2] Create unit tests for MemberService logic in `src/lib/firebase/services/member.service.test.ts`
- [x] T016 [P] [US2] Create E2E test for Invite Flow in `tests/e2e/invite-flow.spec.ts`

### Implementation for User Story 2
- [x] T017 [P] [US2] Implement `generateInviteLink` (update Team doc) in `src/lib/firebase/services/team.service.ts`
- [x] T018 [P] [US2] Implement `requestJoinTeam` (create pending member) in `src/lib/firebase/services/member.service.ts`
- [x] T019 [P] [US2] Implement `approveMember`, `rejectMember`, `removeMember` in `src/lib/firebase/services/member.service.ts`
- [x] T020 [P] [US2] Implement `assignRole` (Promote) and `transferOwnership` in `src/lib/firebase/services/member.service.ts`
- [x] T021 [US2] Create Public Invite Landing Page in `src/app/invite/[code]/page.tsx`
- [x] T022 [US2] Create Member Management UI (List/Approve/Remove) in `src/components/features/teams/MemberList.tsx`
- [x] T023 [US2] Add Role Management Actions to Member List in `src/components/features/teams/MemberActions.tsx`
- [x] T024 [US2] Update Firestore Rules for Member logic (invite/approve/role checks) in `firestore.rules`

---

## Phase 5: User Story 3 - Shared Lists (Priority: P2)

**Goal**: Manage shared Todo and Shopping lists.

**Independent Test**: User A adds item, User B sees item. User B marks done, User A sees update.

### Tests for User Story 3
- [x] T025 [P] [US3] Create unit tests for ListService in `src/lib/firebase/services/list.service.test.ts`

### Implementation for User Story 3
- [x] T026 [P] [US3] Implement `addListItem`, `updateListItem`, `deleteListItem` in `src/lib/firebase/services/list.service.ts`
- [x] T027 [US3] Create Shared List Component (Generic for Todo/Buy) in `src/components/features/teams/SharedList.tsx`
- [x] T028 [US3] Integrate Lists into Team Dashboard in `src/app/(authenticated)/teams/[teamId]/lists/page.tsx`

---

## Phase 6: User Story 4 - Team Chat (Priority: P3)

**Goal**: Basic text chat for team members.

**Independent Test**: User A posts message, User B sees it in real-time.

### Implementation for User Story 4
- [x] T029 [P] [US4] Implement `sendMessage` and `subscribeToMessages` in `src/lib/firebase/services/chat.service.ts`
- [x] T030 [US4] Create Chat UI Component in `src/components/features/teams/TeamChat.tsx`
- [x] T031 [US4] Integrate Chat into Team Dashboard in `src/app/(authenticated)/teams/[teamId]/chat/page.tsx`
- [x] T032 [US4] Update Firestore Rules for Chat collection in `firestore.rules`

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Security hardening, navigation, and validation.

- [x] T033 Update App Navigation to include "Teams" link in `src/components/layout/MainLayout.tsx`
- [x] T034 [P] Audit Firestore Rules for all collections (Security Check)
- [x] T035 [P] Run E2E tests for full lifecycle (Create -> Invite -> List -> Chat)
- [x] T036 Verify Accessibility (Tab navigation on forms)
