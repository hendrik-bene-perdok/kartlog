# Implementation Plan: Team Management & Collaboration

**Branch**: `002-team-management` | **Date**: 2026-02-07 | **Spec**: [specs/002-team-management/spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-team-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement core team functionality including creation, invitation flows, role management (Owner/Admin/Member), shared lists (Todo/Buy), and basic chat. Leverages Firebase Firestore for real-time data and security rules for role-based access control.

## Technical Context

**Language/Version**: TypeScript 5.x / Node 20+
**Primary Dependencies**: Next.js 16 (React 19), Firebase v9+ (Firestore, Auth), Tailwind CSS 4
**Storage**: Firestore (NoSQL)
**Testing**: Vitest (Unit/Integration), Playwright (E2E)
**Target Platform**: Web (PWA capabilities present)
**Project Type**: Next.js Web Application
**Performance Goals**: <200ms p95 for list reads (cached), <500ms for writes (optimistic UI), Real-time updates for chat/lists
**Constraints**: Firestore quotas, Security Rules strictness
**Scale/Scope**: ~10-100 items per list, ~100s messages per chat (pagination needed eventually), small teams (2-20 members)
**Security Level**: High - Strict Role-Based Access Control (RBAC) via Firestore Security Rules
**Observability**: Console logs (dev), potential Firebase Crashlytics/Performance (if enabled)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Does the plan respect Controller/Service/Repository separation? ([Constitution I.3]) - *Next.js Server Actions or Service layer wrapping Firestore calls.*
- [x] **Dependency Inversion**: Are business rules isolated from frameworks? ([Constitution I.2]) - *Core logic in hooks/services.*

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Is input validation planned at the Controller layer? - *Zod schemas for all actions.*
- [x] **AuthZ**: Is authorization enforced server-side? - *Firestore Security Rules + Server Action checks.*
- [x] **Data Protection**: Are PII/Secrets identified and planned for encryption? - *HTTPS transport standard; invite tokens hashed if stored?*

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**: Does the plan include Unit, Integration, and Contract tests? - *Vitest for logic, Emulator for Rules/DB, Playwright for flows.*
- [x] **Coverage**: Is the 80% coverage target feasible with this design? - *Feasible for utility/service layers.*

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Can this design meet <200ms (read) / <500ms (write) p95 targets? - *Firestore real-time listeners are usually fast; Optimistic updates required.*
- [x] **Async Jobs**: Are operations >500ms planned as background jobs? - *Invitation emails (if any) or cleanup batch jobs.*

## Project Structure

### Documentation (this feature)

```text
specs/002-team-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Validation Schemas)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (authenticated)/
│   │   ├── teams/
│   │   │   ├── [teamId]/
│   │   │   │   ├── page.tsx (Overview)
│   │   │   │   ├── lists/
│   │   │   │   ├── chat/
│   │   │   │   └── settings/
│   │   │   ├── create/
│   │   │   └── page.tsx (List Teams)
│   │   └── invite/
│   │       └── [token]/
│   │           └── page.tsx
├── components/
│   ├── features/
│   │   ├── teams/
│   │   │   ├── TeamList.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── SharedList.tsx
│   │   │   └── TeamChat.tsx
│   │   └── invites/
├── lib/
│   ├── firebase/
│   │   ├── services/
│   │   │   ├── team.service.ts
│   │   │   ├── list.service.ts
│   │   │   └── chat.service.ts
│   │   └── converters/
├── types/
│   └── domain/
│       └── team.types.ts
```

**Structure Decision**: Next.js App Router structure with feature-based components and service layer for Firestore interactions.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No Controller Layer | Next.js Server Actions act as controllers | Traditional Express/API layer adds unnecessary RTT for this stack. |
