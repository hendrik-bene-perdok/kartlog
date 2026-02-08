# Technical Research: Kart Maintenance Core System

**Feature**: 004-maintenance-core  
**Date**: 2026-02-08  
**Phase**: 0 - Research & Technology Decisions

## Research Questions

This document resolves technical unknowns from the specification and plan to enable Phase 1 design.

---

## R1: Offline-First Data Storage Strategy

**Question**: How should we implement offline-first data storage for karts, tasks, and shopping lists to ensure the app works without internet?

**Research Findings**:
- **Firestore Offline Persistence**: Firebase SDK provides built-in offline persistence with automatic sync when online
- **IndexedDB Fallback**: Browser-native storage for photos and large data that shouldn't sync
- **Service Worker**: PWA service worker can cache app shell and assets for true offline experience

**Decision**: Use Firestore with offline persistence enabled + IndexedDB for photo storage

**Rationale**:
- Firestore offline cache handles CRUD operations seamlessly without custom sync logic
- Automatic conflict resolution when back online
- QuerySnapshot listeners work offline with cached data
- IndexedDB for photos prevents Firestore quota issues (photos compressed to <500KB each)

**Alternatives Considered**:
- **Pure IndexedDB**: More control but requires manual sync logic, conflict resolution, and migration management
  - Rejected: Too much complexity for MVP, reinventing Firestore's battle-tested offline support
- **LocalStorage**: Simple but 5-10MB limit insufficient for photos and ~500 session logs per kart/year
  - Rejected: Storage limits too restrictive

**Implementation Notes**:
```typescript
// Initialize Firestore with offline persistence
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
```

---

## R2: Photo Compression & Storage

**Question**: How should photos be compressed to <500KB and stored for offline access?

**Research Findings**:
- **Browser Canvas API**: Can resize/compress images client-side synchronously (blocks UI)
- **Web Workers + OffscreenCanvas**: Enables background compression without UI jank
- **IndexedDB with Blob storage**: Can store compressed images as Blobs with kart/item references

**Decision**: Use Web Worker with Canvas API for compression + IndexedDB Blob storage

**Rationale**:
- Web Worker prevents UI blocking during 3-second compression window (PERF-003 requirement)
- Canvas API widely supported, no external dependencies
- Target: 1920x1080 max resolution, 80% JPEG quality → typically 200-400KB
- IndexedDB Blobs don't count against Firestore quota

**Alternatives Considered**:
- **Synchronous compression**: Simple but blocks UI thread
  - Rejected: Violates "touch-friendly" requirement - user can't interact during compression
- **External compression library (e.g., Browser Image Compression)**: Better quality/size ratio
  - Deferred: Built-in Canvas sufficient for MVP, can upgrade if users report quality issues

**Implementation Notes**:
```typescript
// src/workers/photoCompressor.worker.ts
self.onmessage = async (e) => {
  const { imageFile } = e.data;
  const bitmap = await createImageBitmap(imageFile);
  const canvas = new OffscreenCanvas(Math.min(bitmap.width, 1920), ...);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
  self.postMessage({ compressedBlob: blob });
};
```

---

## R3: Swipe Gesture Implementation

**Question**: How should swipe-to-complete and swipe-to-delete gestures be implemented for task/shopping list items?

**Research Findings**:
- **Framer Motion**: Popular animation library with `drag` support and layout animations
- **React Swipeable**: Lightweight hook for detecting swipe gestures
- **Custom Touch Event Handlers**: Full control but requires handling edge cases (momentum, thresholds, cancel)

**Decision**: Use Framer Motion with drag constraints

**Rationale**:
- Provides smooth animations out-of-the-box (aligns with "fancy" UI requirement)
- `drag="x"` with `dragConstraints` prevents vertical scroll interference
- `onDragEnd` callback can trigger complete/delete based on drag distance threshold
- Visual feedback (element follows finger) improves "garage mode" usability
- Already popular in React ecosystem, well-maintained

**Alternatives Considered**:
- **React Swipeable**: Lighter (7KB vs 50KB) but requires custom animations
  - Rejected: Animations are core to "fancy & handy" requirement
- **Custom Implementation**: Maximum control, zero dependencies
  - Rejected: Gesture edge cases (tap vs drag, cancel on scroll) complex to get right

**Implementation Notes**:
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(_, info) => {
    if (info.offset.x > 80) handleComplete();
    if (info.offset.x < -80) handleDelete();
  }}
>
  {taskContent}
</motion.div>
```

---

## R4: Warning Zone Calculation & Auto-Task Generation

**Question**: How should we calculate green/yellow/red zones and trigger automatic maintenance task creation?

**Research Findings**:
- **Client-side calculation**: Compute warning zones in React hooks on every render
- **Firestore computed fields**: Store pre-calculated aggregates (total hours, next threshold) in kart documents
- **Cloud Functions**: Server-side triggers when session logs added (requires Firebase Blaze plan)

**Decision**: Hybrid - Firestore computed fields + client-side zone evaluation

**Rationale**:
- Pre-calculate `totalEngineHours` in kart document (updated via Firestore transaction when logging sessions)
- Store `thresholds` array with `{ type, redHours, yellowHours }` in kart document
-Client hook (`useMaintenanceThresholds`) evaluates zones on dashboard render:
  - `totalHours >= redHours` → Red zone → Create High priority task (if not exists)
  - `totalHours >= yellowHours` → Yellow zone → Create Medium priority task (if not exists)
  - Otherwise → Green zone
- No external triggers needed, works offline

**Alternatives Considered**:
- **Cloud Functions**: Automatic but requires Blaze plan, doesn't work offline
  - Rejected: MVP must work offline (requirement)
- **Pure client-side calculation on every render**: Simple but recalculates even when hours unchanged
  - Rejected: Unnecessary computation, storing totalHours in doc is cleaner

**Implementation Notes**:
```typescript
// lib/services/maintenanceEngine.ts
export function evaluateWarningZones(kart: Kart): MaintenanceStatus[] {
  return kart.thresholds.map(threshold => {
    if (kart.totalEngineHours >= threshold.redHours) {
      return { type: threshold.type, zone: 'red', priority: 'High' };
    }
    if (kart.totalEngineHours >= threshold.yellowHours) {
      return { type: threshold.type, zone: 'yellow', priority: 'Medium' };
    }
    return { type: threshold.type, zone: 'green', priority: null };
  });
}
```

---

## R5: 12-Month Shopping List Archive Cleanup

**Question**: How should archived shopping list items be automatically deleted after 12 months?

**Research Findings**:
- **Cloud Scheduler + Functions**: Runs cron jobs server-side (requires Firebase Blaze plan)
- **App-triggered cleanup**: Check archive ages on app launch, delete old items
- **Firestore TTL (Time-To-Live)**: Not available in Firestore (exists in Realtime Database only)

**Decision**: App-triggered cleanup on dashboard mount

**Rationale**:
- Runs whenever user opens app (likely daily/weekly for active users)
- No server costs, works offline (deletes from cache, syncs when online)
- Query archive items where `archivedAt < (now - 12 months)`, batch delete
- Acceptable tradeoff: Cleanup delayed until next app open (vs exact 12-month timestamp)

**Alternatives Considered**:
- **Cloud Scheduler**: Precise timing but adds Firebase costs, requires Blaze plan
  - Rejected: MVP should minimize external dependencies and costs
- **Background Sync API**: Periodic background cleanup even when app closed
  - Rejected: Limited browser support, requires service worker complexity, overkill for non-critical cleanup

**Implementation Notes**:
```typescript
// lib/services/archiveCleanup.ts
export async function cleanupExpiredArchive(userId: string) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const querySnapshot = await getDocs(
    query(
      collection(db, 'shoppingListArchive'),
      where('userId', '==', userId),
      where('archivedAt', '<', Timestamp.fromDate(twelveMonthsAgo))
    )
  );
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

---

## R6: Dark Mode & Touch Target Implementation

**Question**: How should we implement dark mode by default and ensure 48x48px touch targets across the app?

**Research Findings**:
- **Tailwind CSS Dark Mode**: Built-in `dark:` variant with media query or class-based strategy
- **CSS Custom Properties**: Manual theme switching via CSS variables
- **Touch Target Enforcement**: Use base button component with minimum sizing

**Decision**: Tailwind `dark` class strategy (forced dark mode) + TouchButton base component

**Rationale**:
- Tailwind's class strategy: Add `dark` class to `<html>` tag → all `dark:` variants active
- Simpler than media query (user preference might be "light" but we force dark for garage)
- Create `<TouchButton>` component with `min-w-[48px] min-h-[48px]` as primitive
- All interactive elements extend TouchButton → guarantees touch target compliance

**Alternatives Considered**:
- **Media query dark mode**: Respects user OS preference
  - Rejected: Garage environment demands dark mode regardless of user's phone settings
- **Manual CSS variables**: Full control
  - Rejected: Tailwind dark mode already comprehensive, no need to reinvent

**Implementation Notes**:
```typescript
// components/ui/TouchButton.tsx
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function TouchButton({ children, className, ...props }: TouchButtonProps) {
  return (
    <button
      className={cn(
        'min-w-[48px] min-h-[48px] touch-manipulation',
        'rounded-lg transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Summary

All technical unknowns resolved. Key decisions:
1. **Storage**: Firestore offline persistence + IndexedDB for photos
2. **Photo Compression**: Web Worker + Canvas API → ~300KB JPEGs
3. **Swipe Gestures**: Framer Motion with drag constraints
4. **Warning Zones**: Pre-calculated totalHours + client-side zone evaluation
5. **Archive Cleanup**: App-triggered batch delete on dashboard mount
6. **Dark Mode**: Tailwind `dark` class forced on app root
7. **Touch Targets**: Base `TouchButton` component with 48x48px minimum

**Next Phase**: Proceed to Phase 1 (Data Model & Contracts)
