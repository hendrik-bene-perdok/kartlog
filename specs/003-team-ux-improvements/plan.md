# Implementation Plan: Team UX Improvements

**Branch**: `003-team-ux-improvements` | **Date**: 2026-02-07 | **Spec**: [003-team-ux-improvements/spec.md](../spec.md)
**Input**: Feature specification from `/specs/003-team-ux-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enhances the Team Management experience by unifying shared lists into the Team Dashboard, adding prominent invite functionality, and implementing a persistent bottom navigation for mobile users.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16 (React 19)
**Primary Dependencies**: Firebase v9 (Firestore, Auth), Tailwind CSS 4
**Storage**: Firestore (Team metadata, Lists)
**Testing**: Vitest (Unit), Playwright (E2E)
**Target Platform**: Responsive Web (Mobile & Desktop)
**Project Type**: Web Application
**Performance Goals**: Instant tab switching (client-side state), <200ms list type toggle
**Constraints**: Mobile-first responsive design, offline-capable list viewing
**Scale/Scope**: ~3 new key components, updates to 2 existing pages
**Security Level**: Standard (Auth required for all team features)
**Observability**: Standard Firebase logging

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Architecture & Code Quality
- [x] **Layered Architecture**: Does the plan respect Controller/Service/Repository separation? (Service layer handles Firestore logic)
- [x] **Dependency Inversion**: Are business rules isolated from frameworks? (Services abstract Firebase SDK)

### II. Security & Privacy ([Constitution IV])
- [x] **Zero Trust**: Is input validation planned at the Controller layer? (Zod schemas for inputs)
- [x] **AuthZ**: Is authorization enforced server-side? (Firestore Rules enforced)
- [x] **Data Protection**: Are PII/Secrets identified and planned for encryption? (Invite codes are public-read but time-limited)

### III. Testing Strategy ([Constitution III])
- [x] **Test Pyramid**: Does the plan include Unit, Integration, and Contract tests? (Unit for services, E2E for flows)
- [x] **Coverage**: Is the 80% coverage target feasible with this design? (Yes, clear service logic)

### IV. Performance ([Constitution II])
- [x] **SLO Check**: Can this design meet <200ms (read) / <500ms (write) p95 targets? (Firestore real-time listeners are performant)
- [x] **Async Jobs**: Are operations >500ms planned as background jobs? (N/A)

## Project Structure

### Documentation (this feature)

```text
specs/003-team-ux-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (authenticated)/
│   │   ├── teams/
│   │   │   ├── [teamId]/
│   │   │   │   └── page.tsx        # Update: Unified Dashboard
├── components/
│   ├── features/
│   │   ├── teams/
│   │   │   ├── InviteButton.tsx    # New: Invite Action Component
│   │   │   ├── SharedList.tsx      # Update: Add filtering support
│   │   │   └── TeamTabs.tsx        # New: Tab navigation component
│   ├── layout/
│   │   ├── BottomNav.tsx           # New: Mobile Bottom Navigation
│   │   └── MainLayout.tsx          # Update: Integrate BottomNav
├── lib/
│   ├── firebase/
│   │   ├── services/
│   │   │   └── team.service.ts     # Update: Invite code validation logic
```

**Structure Decision**: Integrated within existing Next.js App Router structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
