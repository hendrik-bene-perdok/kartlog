# Implementation Plan: Kartlog MVP

**Branch**: `001-kartlog-mvp` | **Date**: 2026-02-07 | **Spec**: [specs/001-kartlog-mvp/spec-final.md](specs/001-kartlog-mvp/spec-final.md)
**Input**: Feature specification from `/specs/001-kartlog-mvp/spec-final.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Kartlog MVP using **Next.js (React)** as a Progressive Web App (PWA). The system leverages **Firebase** (Authentication, Firestore, Hosting) to provide a serverless backend with critical offline capabilities and realtime synchronization. The UI will be styled with **Tailwind CSS**.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.0+ (Strict Mode)
**Primary Dependencies**: Next.js 14+ (App Router), React 18, Firebase SDK 10, Tailwind CSS 3
**Storage**: Cloud Firestore (NoSQL) with Offline Persistence enabled
**Testing**: Vitest (Unit/Integration), Playwright (E2E)
**Target Platform**: Mobile Web (PWA), Desktop Web
**Project Type**: Single Application (Next.js)
**Performance Goals**: Time to Interactive < 1.5s (Mobile 4G), Offline Init < 500ms
**Constraints**: Must function completely offline (Read/Write)
**Scale/Scope**: MVP (Personal Teams, <1000 users)
**Security Level**: Public (OAuth), Firestore Security Rules for Authorization
**Observability**: Firebase Performance Monitoring & Crashlytics

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Does the plan respect Controller/Service/Repository separation? ([Constitution I.3]) *Implemented via UI Components / Custom Hooks (Service) / Firebase SDK (Repo)*
- [x] **Dependency Inversion**: Are business rules isolated from frameworks? ([Constitution I.2]) *Business logic in hooks/utils, separate from UI.*

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Is input validation planned at the Controller layer? *Zod validation on client forms + Firestore Rules validation.*
- [x] **AuthZ**: Is authorization enforced server-side? *Yes, via Firestore Security Rules.*
- [x] **Data Protection**: Are PII/Secrets identified and planned for encryption? *Managed by Google Identity (Auth), HTTPS only.*

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**: Does the plan include Unit, Integration, and Contract tests? *Unit (Utils), Integration (Hooks), E2E (Critical Flows).*
- [x] **Coverage**: Is the 80% coverage target feasible with this design? *Yes, focus on shared logic.*

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Can this design meet <200ms (read) / <500ms (write) p95 targets? *Local reads are instant via Firestore Cache.*
- [x] **Async Jobs**: Are operations >500ms planned as background jobs? *Sync operations handled by SDK background workers.*

## Project Structure

### Documentation (this feature)

```text
specs/001-kartlog-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── firestore.rules  # Security Contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/                  # Next.js App Router (Pages/Layouts)
├── components/           # Reusable UI Components
├── lib/                  # Utilities (Firebase Init, Zod Schemas)
├── hooks/                # Custom React Hooks (Data Access Layer)
└── types/                # TypeScript Domain Interfaces

tests/
├── e2e/                  # Playwright Tests
└── unit/                 # Vitest Tests for Libs/Hooks
```

**Structure Decision**: Selected standard Next.js App Router structure ("Single Project") tailored for PWA development.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No Backend Service | Offline-first requirement | Building custom sync engine is complex/error-prone; Firestore SDK handles it natively. |
