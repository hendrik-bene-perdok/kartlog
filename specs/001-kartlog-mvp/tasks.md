# Implementation Tasks: Kartlog MVP

**Feature**: `001-kartlog-mvp`
**Spec**: [specs/001-kartlog-mvp/spec-final.md](specs/001-kartlog-mvp/spec-final.md)
**Plan**: [specs/001-kartlog-mvp/plan.md](specs/001-kartlog-mvp/plan.md)

## Phase 1: Setup & Configuration
**Goal**: Initialize the project structure, install dependencies, and configure the development environment.

- [x] T001 Initialize Next.js app with TypeScript and Tailwind CSS in `src/`
- [x] T002 [P] Install Firebase SDK and configure initialization in `src/lib/firebase.ts`
- [x] T003 [P] Configure Environment Variables (`.env.local`)
- [x] T004 Install and configure `@ducanh2912/next-pwa` in `next.config.js`
- [x] T005 [P] Setup Vitest for unit testing in `vitest.config.ts`
- [x] T006 [P] Setup Playwright for E2E testing in `playwright.config.ts`
- [x] T007 Create project directory structure (`components`, `hooks`, `types`, `lib`) in `src/`

## Phase 2: Foundational Architecture
**Goal**: Establish core authentication, data models, and security rules.

- [x] T008 Define TypeScript Interfaces (User, Team, Part, Session) in `src/types/index.ts`
- [x] T009 [P] Deploy Firestore Security Rules from `specs/001-kartlog-mvp/contracts/firestore.rules`
- [x] T010 Implement `AuthContext` provider for session management in `src/components/providers/AuthProvider.tsx`
- [x] T011 Create `PrivateRoute` wrapper or middleware for protected routes in `src/components/auth/PrivateRoute.tsx`
- [x] T012 Enable Firestore Offline Persistence in `src/lib/firebase.ts`
- [x] T013 Create Main Layout (Navbar with Mobile support) in `src/components/layout/MainLayout.tsx`

## Phase 3: Team & User Setup (US1)
**Goal**: Allow users to sign up, strictly enforcing "Personal Team" creation, and manage basic profile.
**Priority**: P1

- [x] T014 [US1] Create Login Page with Google OAuth button in `src/app/login/page.tsx`
- [x] T015 [US1] Implement `useUser` hook for profile management in `src/hooks/useUser.ts`
- [x] T016 [US1] Implement "Create Personal Team on Signup" logic in `src/lib/auth-helpers.ts` or `AuthProvider`
- [x] T017 [US1] Implement `useTeam` hook for fetching team details in `src/hooks/useTeam.ts`
- [x] T018 [US1] Create Dashboard Page (Team Overview) in `src/app/dashboard/page.tsx`
- [x] T019 [US1] Create "Invite Member" UI (modal/form) in `src/components/teams/InviteMember.tsx`
- [x] T020 [US1] E2E Test: User Sign Up > Auto-Team Creation > Dashboard Access in `tests/e2e/auth.spec.ts`

## Phase 4: Parts Inventory Management (US2)
**Goal**: implement CRUD for engines, chassis, and tires with polymorphic fields.
**Priority**: P1

- [x] T021 [US2] [P] Implement `useParts` hook (CRUD operations) in `src/hooks/useParts.ts`
- [x] T022 [US2] Create re-usable `PartCard` component in `src/components/parts/PartCard.tsx`
- [x] T023 [US2] Create Parts List Page in `src/app/parts/page.tsx`
- [x] T024 [US2] Create `PartForm` component with Type Selector (Engine/Chassis/Tire) in `src/components/parts/PartForm.tsx`
- [x] T025 [US2] Implement conditional fields for Engine (Hours, Rebuild Date) in `src/components/parts/forms/EngineFields.tsx`
- [x] T026 [US2] Implement conditional fields for Chassis (Model Year, Notes) in `src/components/parts/forms/ChassisFields.tsx`
- [x] T027 [US2] Implement conditional fields for Tires (Compound, Condition) in `src/components/parts/forms/TireFields.tsx`
- [x] T028 [US2] Create Add Part Page in `src/app/parts/new/page.tsx`
- [x] T029 [US2] Create Edit Part Page in `src/app/parts/[id]/edit/page.tsx`
- [x] T030 [US2] E2E Test: Create Engine, Check Inventory, Edit Status in `tests/e2e/parts.spec.ts`

## Phase 5: Session Logging (US3)
**Goal**: Log track sessions with setup details (specifically tire pressure).
**Priority**: P1

- [x] T031 [US3] [P] Implement `useSessions` hook (Create, List, Read) in `src/hooks/useSessions.ts`
- [x] T032 [US3] Create Session List item component in `src/components/sessions/SessionItem.tsx`
- [x] T033 [US3] Create Sessions History Page in `src/app/sessions/page.tsx`
- [x] T034 [US3] Create `SessionForm` (Date, Track, Notes) in `src/components/sessions/SessionForm.tsx`
- [x] T035 [US3] Implement Setup Configuration Input (Tire Pressure FL/FR/RL/RR) in `src/components/sessions/SetupInput.tsx`
- [x] T036 [US3] Create Log Session Page in `src/app/sessions/new/page.tsx`
- [x] T037 [US3] E2E Test: Log Session with Tire Pressure setup in `tests/e2e/sessions.spec.ts`

## Phase 6: Offline Access & PWA (US4)
**Goal**: Ensure app works without network and syncs when reconnected.
**Priority**: P2

- [x] T038 [US4] Create `OfflineIndicator` component (Toast/Banner) in `src/components/ui/OfflineIndicator.tsx`
- [x] T039 [US4] Implement "Pending Sync" visual state in Lists (Parts/Sessions) in `src/components/ui/SyncStatus.tsx`
- [x] T040 [US4] Verify PWA Manifest icons and colors in `public/manifest.json`
- [x] T041 [US4] E2E Test: Offline Write > Online Sync simulation in `tests/e2e/offline.spec.ts`

## Phase 7: Polish & Deployment
**Goal**: Final cleanup and production readiness.

- [x] T042 Configure `firebase.json` for Hosting and Firestore indexes
- [x] T043 Run full linting and type checking (fix any strict mode errors)
- [x] T044 Create `README.md` with setup instructions (based on quickstart)
- [ ] T045 Final Manual Q/A: Install PWA on a mobile device simulator

## Dependencies

- **US1 (Team)**: Blocks US2 and US3 (Need Team ID to save parts/sessions)
- **US2 (Parts)**: Soft dependency for US3 (Sessions usually reference parts, but can be optional for MVP)
- **US4 (Offline)**: Can be implemented incrementally, but full verification happens last.

## Implementation Strategy

1. **Skeleton First**: Get the Auth -> Team creation flow working immediately. This is the "Identity" layer.
2. **Data Layer**: Build the Parts CRUD. This tests the Schema/Polymorphism.
3. **Complex Forms**: Build the Session logging with Setup inputs.
4. **Offline Hardening**: Since we use Firestore SDK with persistence enabled from T012, offline support is "mostly free", but Phase 6 ensures we explicitly test and handle UX edge cases.
