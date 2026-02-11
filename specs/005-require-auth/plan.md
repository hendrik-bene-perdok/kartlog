# Implementation Plan: Require Authentication

**Branch**: `005-require-auth` | **Date**: 2026-02-11 | **Spec**: [Require Authentication](./spec.md)
**Input**: Feature specification from `/specs/005-require-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the technical approach to restrict application access to authenticated users only. The application root `/` will become a public landing page, and the protected application logic will be moved to a subpath (e.g., `/app`). A middleware-based authentication guard will be implemented to redirect unauthenticated users from protected routes to the login page.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (React 19)
**Primary Dependencies**: Firebase v9 (Auth), Tailwind CSS 4, Zod 4.x
**Storage**: Firestore (existing), IndexedDB (existing)
**Testing**: Jest, Cypress/Playwright (Needs Confirmation on existing setup)
**Target Platform**: Web (Next.js Edge Runtime for Middleware)
**Project Type**: Web Application
**Performance Goals**: Authentication check < 100ms latency impact.
**Constraints**: Must work with existing Firebase Authentication.
**Scale/Scope**: Impacts global routing and all application pages.
**Security Level**: High-Sensitivity (Core Authentication Gate)
**Observability**: Logging of auth failures/redirects (if achievable in middleware without perf penalty).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Does the plan respect Controller/Service/Repository separation? ([Constitution I.3])
    - *Plan relies on standardized Middleware (Infrastructure layer) protecting Services/UI.*
- [x] **Dependency Inversion**: Are business rules isolated from frameworks? ([Constitution I.2])
    - *Auth logic is centralized in a service/hook, middleware consumes it.*

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Is input validation planned at the Controller layer?
    - *Middleware acts as the gatekeeper for all protected routes.*
- [x] **AuthZ**: Is authorization enforced server-side?
    - *Middleware runs on the server (Edge) before rendering.*
- [x] **Data Protection**: Are PII/Secrets identified and planned for encryption?
    - *Uses existing securely managed Firebase tokens.*

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**: Does the plan include Unit, Integration, and Contract tests?
    - *Unit tests for middleware logic, E2E for full redirection flows.*
- [ ] **Coverage**: Is the 80% coverage target feasible with this design?
    - *Middleware is hard to unit test in isolation in some Next.js versions, but logic can be extracted and tested.*

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Can this design meet <200ms (read) / <500ms (write) p95 targets?
    - *Middleware adds minimal overhead.*
- [x] **Async Jobs**: Are operations >500ms planned as background jobs?
    - *N/A for this feature.*

## Project Structure

### Documentation (this feature)

```text
specs/005-require-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/        # Landing page, layout
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/          # Login, signup
│   │   ├── login/
│   │   └── register/
│   └── app/             # Protected Application Routes
│       ├── layout.tsx   # Authenticated Layout (Sidebar, etc.)
│       ├── dashboard/
│       └── teams/
├── middleware.ts        # Auth Guard Middleware
└── lib/
    ├── auth/
    │   └── session.ts   # Session verification logic
```

**Structure Decision**: We will adopt a Route Group strategy `(public)` vs `app` (or just `app` subpath) to clearly separate protected vs public areas in the Next.js App Router.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
