# Research & Findings

## Technical Context Analysis

### 1. Technology Stack
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4 (configured via CSS imports)
- **State Management**: React Hooks + Context (UserContext)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

### 2. Current Architecture
- **Navigation**:
  - `MainLayout.tsx` handles responsive layout
  - `BottomNav.tsx` handles mobile navigation
  - Hardcoded links need updates for new routes (/shopping)
- **Data Access**:
  - `src/lib/firestore/*` contains Service/Repository logic
  - Hooks (`useKarts`, `useTeam`) wrap these for components
  - "Repository" pattern is loose but present in `lib/firestore`

### 3. Data Model Analysis
- **Karts**:
  - Currently uses fixed `maintenanceThresholds` array
  - **Gap**: Need migration to flexible `serviceIntervals` array for Q1
- **Tasks**:
  - Simple status tracking
  - **Gap**: No linking logic for Q2 (Smart Linkage)
- **Missing Modules**:
  - `parts.ts` (Inventory) does not exist in `lib/firestore`
  - `teams.ts` (Management) logic exists but might need expansion

## Decisions & Recommendations

### Decision 1: Service Interval Data Structure
- **Decision**: Use an array field `serviceIntervals` on the `Kart` document.
- **Rationale**:
  - Supports "Per-Kart Customization" (Q1)
  - Low cardinality (< 20 items per kart typical)
  - Simplifies offline sync (one document read)
- **Structure**:
  ```typescript
  interface ServiceInterval {
    id: string;
    name: string; // e.g. "Piston"
    currentValue: number; // hours
    targetValue: number; // max hours
    unit: 'hours' | 'distance';
  }
  ```

### Decision 2: Task-Component Linkage
- **Decision**: Add `linkedIntervalId` to `MaintenanceTask`.
- **Rationale**:
  - Supports "Smart Linkage" (Q2)
  - When task completes, finding the interval to reset is O(1) inside the Kart doc.

### Decision 3: Design System Implementation
- **Decision**: Extend Tailwind v4 theme in `globals.css` with new semantic tokens.
- **Rationale**:
  - `globals.css` already uses `@theme`.
  - Add `--color-status-ready`, `--color-status-warning`, etc. to match Spec FR-048.

### Decision 4: Navigation Refactor
- **Decision**: Create config-driven `Navigation` component.
- **Rationale**:
  - Central place to define routes, icons, labels for both Desktop and Mobile navs.
  - Easier to maintain than duplicated links in `MainLayout` and `BottomNav`.

## Action Items
1. Create `data-model.md` reflecting new Schema.
2. Draft API contracts for new endpoints (Parts, Shopping).
3. Plan migration script for existing Karts (Fixed -> Flexible intervals).
