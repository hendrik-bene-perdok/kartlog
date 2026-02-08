# Quick Start Guide: Kart Maintenance Core System

**Feature**: 004-maintenance-core  
**For**: Developers implementing this feature  
**Prerequisites**: Completed features 001-kartlog-mvp, 002-team-management

---

## Overview

This feature adds comprehensive kart maintenance tracking with:
- Multi-kart management with customizable maintenance thresholds
- Engine hour logging with automatic warning zones (green/yellow/red)
- Auto-generated maintenance tasks based on hour thresholds
- Parts shopping list with camera photo support and 12-month archive
- Touch-friendly "Garage Mode" UI with swipe gestures and dark theme

---

## Architecture Quick Reference

**Storage**:
- **Firestore** (offline-first): Karts, SessionLogs, MaintenanceTasks, ShoppingListItems
- **IndexedDB**: Compressed photos (<500KB JPEGs)

**Key Libraries**:
- **Zod**: Entity validation and form input schemas
- **Framer Motion**: Swipe gestures and animations
- **Web Worker**: Background photo compression

**Structure**:
```
src/
├── app/karts/         → Dashboard, hour logging, threshold config
├── components/        → Swipeable cards, touch buttons, photo capture
├── hooks/             → CRUD operations and business logic
├── lib/
│   ├── firestore/     → Repository layer (data access)
│   ├── services/      → Business logic (warning zones, auto-tasks)
│   └── validation/    → Zod schemas
└── workers/           → Photo compression worker
```

---

## Setup Steps

### 1. Install Dependencies

```bash
# Already installed in project:
# - firebase (Firestore SDK)
# - zod (validation)
# - framer-motion (gestures/animations)

# No new dependencies required
```

### 2. Enable Firestore Offline Persistence

In `lib/firebase.ts` (or equivalent initialization file):

```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
```

### 3. Initialize IndexedDB for Photos

Create `lib/indexedDB/photos.ts`:

```typescript
const DB_NAME = 'kartlog-photos';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

export function openPhotosDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}
```

### 4. Create Firestore Composite Indexes

**Required indexes** (add to `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "maintenanceTasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "kartId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sessionLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "kartId", "order": "ASCENDING" },
        { "fieldPath": "loggedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shoppingListItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "archivedAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## Implementation Order

### Phase 1: Core Data Layer (Priority: P1)

1. **Create Firestore repositories** (`lib/firestore/`):
   - `karts.ts`: CRUD + cascade delete
   - `sessionLogs.ts`: Create with transaction to update totalEngineHours
   - `tasks.ts`: Create with duplicate prevention for auto-tasks
   - `shoppingList.ts`: CRUD + archive cleanup query

2. **Create validation schemas** (`lib/validation/schemas.ts`):
   - Import from `specs/004-maintenance-core/contracts/schemas.ts`
   - Add to project (copy file to src/types/)

3. **Create business logic services** (`lib/services/`):
   - `warningZones.ts`: Evaluate green/yellow/red zones from kart data
   - `maintenanceEngine.ts`: Auto-task generation when thresholds crossed
   - `photoCompressor.ts`: Web Worker wrapper for image compression
   - `archiveCleanup.ts`: Query and batch delete old shopping items

### Phase 2: UI Components (Priority: P1)

4. **Create base UI components** (`components/ui/`):
   - `TouchButton.tsx`: 48x48px minimum with touch-manipulation CSS
   - `SwipeableCard.tsx`: Framer Motion drag wrapper with left/right callbacks

5. **Create domain components**:
   - `components/karts/KartCard.tsx`: Dashboard card with warning zone indicators
   - `components/karts/HourLogForm.tsx`: Session duration input (with glove-friendly number pad)
   - `components/tasks/TaskList.tsx`: Swipeable task items (right=complete, left=delete)
   - `components/shopping/PhotoCapture.tsx`: Camera button → compress → store in IndexedDB

### Phase 3: Custom Hooks (Service Layer)

6. **Create data hooks** (`hooks/`):
   - `useKarts.ts`: Query karts, create kart, delete kart (with cascade)
   - `useSessionLogs.ts`: Create session log with hour update transaction
   - `useTasks.ts`: Query tasks, create task, complete task, delete task
   - `useShoppingList.ts`: Query items, create item with photo, archive item
   - `useMaintenanceThresholds.ts`: Evaluate zones, trigger auto-task creation
   - `usePhotoCompression.ts`: Web Worker integration for background compression

### Phase 4: Pages (App Router)

7. **Create pages** (`app/`):
   - `app/karts/page.tsx`: Dashboard (User Story 1)
   - `app/karts/[kartId]/hours/page.tsx`: Hour logging (User Story 2)
   - `app/karts/[kartId]/settings/page.tsx`: Threshold customization
   - `app/tasks/page.tsx`: Task management (User Story 4)
   - `app/shopping/page.tsx`: Shopping list (User Story 3)
   - `app/shopping/history/page.tsx`: Purchase history (12-month archive)
   - `app/manual/page.tsx`: External manual link (User Story 5)

### Phase 5: Dark Mode & PWA

8. **Force dark mode**:
   - In `app/layout.tsx`, add `className="dark"` to `<html>` tag
   - All components use Tailwind `dark:` variants

9. **Web Worker for photo compression**:
   - Create `src/workers/photoCompressor.worker.ts`
   - Use OffscreenCanvas to resize and compress images
   - Return compressed Blob to main thread

---

## Key Implementation Patterns

### Pattern 1: Session Logging with Hour Update

**Critical**: Use Firestore transaction to atomically create log AND update kart hours.

```typescript
// hooks/useSessionLogs.ts
import { runTransaction, doc, collection, Timestamp } from 'firebase/firestore';

export async function logSession(kartId: string, durationMinutes: number) {
  const kartRef = doc(db, 'karts', kartId);
  const sessionLogRef = doc(collection(db, 'sessionLogs'));
  
  await runTransaction(db, async (txn) => {
    const kartDoc = await txn.get(kartRef);
    if (!kartDoc.exists()) throw new Error('Kart not found');
    
    const currentHours = kartDoc.data().totalEngineHours || 0;
    const addedHours = durationMinutes / 60;
    const newTotal = currentHours + addedHours;
    
    txn.update(kartRef, {
      totalEngineHours: newTotal,
      updatedAt: Timestamp.now()
    });
    
    txn.set(sessionLogRef, {
      kartId,
      userId: getCurrentUserId(),
      durationMinutes,
      durationHours: addedHours,
      loggedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    });
  });
  
  // After transaction, trigger warning zone check
  await checkAndCreateAutoTasks(kartId);
}
```

### Pattern 2: Auto-Task Generation (Duplicate Prevention)

**Critical**: Check for existing pending tasks before creating auto-tasks.

```typescript
// lib/services/maintenanceEngine.ts
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function checkAndCreateAutoTasks(kartId: string) {
  // 1. Get kart with thresholds
  const kartDoc = await getDoc(doc(db, 'karts', kartId));
  const kart = kartDoc.data() as Kart;
  
  // 2. Evaluate warning zones
  const zones = evaluateWarningZones(kart);
  
  // 3. For each red/yellow zone, create task if not exists
  for (const zone of zones.filter(z => z.zone !== 'green')) {
    // Check existing tasks
    const existingTasksQuery = query(
      collection(db, 'maintenanceTasks'),
      where('kartId', '==', kartId),
      where('status', '==', 'pending'),
      where('isAutoGenerated', '==', true),
      where('autoGeneratedType', '==', zone.thresholdType)
    );
    
    const existingTasks = await getDocs(existingTasksQuery);
    
    if (existingTasks.empty) {
      // Create auto-task
      await addDoc(collection(db, 'maintenanceTasks'), {
        kartId,
        userId: kart.userId,
        description: `${zone.thresholdType} due (${kart.totalEngineHours}h logged)`,
        priority: zone.priority,
        status: 'pending',
        isAutoGenerated: true,
        autoGeneratedType: zone.thresholdType,
        createdAt: Timestamp.now()
      });
    }
  }
}
```

### Pattern 3: Photo Compression in Web Worker

```typescript
// src/workers/photoCompressor.worker.ts
self.onmessage = async (e: MessageEvent<{ imageFile: File }>) => {
  const { imageFile } = e.data;
  
  // Create bitmap from file
  const bitmap = await createImageBitmap(imageFile);
  
  // Calculate dimensions (max 1920x1080, preserve aspect ratio)
  const maxWidth = 1920;
  const maxHeight = 1080;
  let width = bitmap.width;
  let height = bitmap.height;
  
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }
  
  // Create offscreen canvas and draw
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  // Convert to JPEG blob (80% quality)
  const blob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.8
  });
  
  // Send back compressed blob
  self.postMessage({
    compressedBlob: blob,
    compressedSizeKB: Math.round(blob.size / 1024)
  });
};
```

Usage in component:
```typescript
// hooks/usePhotoCompression.ts
export function usePhotoCompression() {
  const compressPhoto = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/photoCompressor.worker.ts', import.meta.url));
      
      worker.onmessage = (e) => {
        resolve(e.data.compressedBlob);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
      
      worker.postMessage({ imageFile: file });
    });
  };
  
  return { compressPhoto };
}
```

### Pattern 4: Swipeable Task Card

```typescript
// components/tasks/TaskCard.tsx
import { motion } from 'framer-motion';

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) {
          onComplete(task.id);
        } else if (info.offset.x < -80) {
          onDelete(task.id);
        }
      }}
      className="relative bg-gray-800 rounded-lg p-4 touch-manipulation"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{task.description}</h3>
          <p className="text-sm text-gray-400">{task.kartName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          task.priority === 'High' ? 'bg-red-900 text-red-200' :
          task.priority === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
          'bg-green-900 text-green-200'
        }`}>
          {task.priority}
        </span>
      </div>
    </motion.div>
  );
}
```

---

## Testing Strategy

### Unit Tests (`tests/unit/`)

**Critical business logic**:
- `services/warningZones.test.ts`: Zone evaluation with various hour values
- `services/maintenanceEngine.test.ts`: Auto-task creation logic, duplicate prevention
- `services/archiveCleanup.test.ts`: 12-month date filtering
- `validation/schemas.test.ts`: Zod schema validation edge cases

Example:
```typescript
// services/warningZones.test.ts
import { evaluateWarningZones } from '@/lib/services/warningZones';
import { Kart } from '@/types';

describe('evaluateWarningZones', () => {
  it('returns green zone when hours below yellow threshold', () => {
    const kart: Kart = {
      id: '1',
      totalEngineHours: 5,
      thresholds: [{ type: 'Oil Change', intervalHours: 10, yellowWarningHours: 8, redWarningHours: 10 }],
      // ... other fields
    };
    
    const zones = evaluateWarningZones(kart);
    expect(zones[0].zone).toBe('green');
    expect(zones[0].priority).toBeNull();
  });
  
  it('returns yellow zone and Medium priority when hours >= yellow threshold', () => {
    const kart: Kart = {
      id: '1',
      totalEngineHours: 8.5,
      thresholds: [{ type: 'Oil Change', intervalHours: 10, yellowWarningHours: 8, redWarningHours: 10 }],
      // ... other fields
    };
    
    const zones = evaluateWarningZones(kart);
    expect(zones[0].zone).toBe('yellow');
    expect(zones[0].priority).toBe('Medium');
  });
});
```

### Integration Tests (`tests/integration/`)

**Firestore operations**:
- `firestore/karts.test.ts`: Create kart with default thresholds, cascade delete
- `firestore/sessionLogs.test.ts`: Transaction integrity (hour update + log creation)
- `firestore/tasks.test.ts`: Query pending tasks, auto-task duplicate prevention
- `photoCompression.test.ts`: Web Worker compresses images to <500KB

### E2E Tests (`tests/e2e/`)

**Critical user flows** (Playwright):
- `kart-management.spec.ts`: Create kart → appears on dashboard
- `hour-logging.spec.ts`: Log 9 hours → yellow warning → auto-task created
- `auto-task-generation.spec.ts`: Cross red threshold → High priority task created → no duplicate

Example:
```typescript
// e2e/hour-logging.spec.ts
import { test, expect } from '@playwright/test';

test('logging hours triggers warning zone and creates auto-task', async ({ page }) => {
  await page.goto('/karts');
  
  // Create new kart
  await page.click('text=Add Kart');
  await page.fill('input[name="name"]', 'Kart #17');
  await page.click('button[type="submit"]');
  
  // Log 9 hours (crosses yellow threshold at 8h)
  await page.click('text=Kart #17');
  await page.click('text=Log Hours');
  await page.fill('input[name="durationMinutes"]', '540'); // 9 hours
  await page.click('button[type="submit"]');
  
  // Verify yellow warning appears
  await expect(page.locator('text=Oil Change').locator('..').locator('[data-zone="yellow"]')).toBeVisible();
  
  // Verify auto-task created
  await page.goto('/tasks');
  await expect(page.locator('text=Oil Change due')).toBeVisible();
  await expect(page.locator('text=Oil Change due').locator('..').locator('text=Medium')).toBeVisible();
});
```

---

## Common Pitfalls

### 1. ❌ Forgetting Firestore Transaction for Hour Updates

**Wrong**:
```typescript
// This creates race condition if multiple sessions logged simultaneously
await updateDoc(kartRef, { totalEngineHours: kart.totalEngineHours + addedHours });
await addDoc(sessionLogsRef, sessionLogData);
```

**Right**:
```typescript
await runTransaction(db, async (txn) => {
  const kartDoc = await txn.get(kartRef);
  txn.update(kartRef, { totalEngineHours: kartDoc.data().totalEngineHours + addedHours });
  txn.set(sessionLogRef, sessionLogData);
});
```

### 2. ❌ Creating Duplicate Auto-Tasks

**Wrong**:
```typescript
// This creates new task every time warning zone is checked
if (zone.zone === 'red') {
  await createMaintenanceTask({ ... });
}
```

**Right**:
```typescript
// Query existing tasks first
const existing = await getDocs(query(
  collection(db, 'maintenanceTasks'),
  where('kartId', '==', kartId),
  where('autoGeneratedType', '==', zone.thresholdType),
  where('status', '==', 'pending')
));

if (existing.empty) {
  await createMaintenanceTask({ ... });
}
```

### 3. ❌ Blocking UI During Photo Compression

**Wrong**:
```typescript
// Synchronous compression blocks UI thread
const canvas = document.createElement('canvas');
// ... draw image ...
const blob = await new Promise(resolve => canvas.toBlob(resolve));
```

**Right**:
```typescript
// Offload to Web Worker
const worker = new Worker(/* ... */);
worker.postMessage({ imageFile });
const blob = await new Promise(resolve => {
  worker.onmessage = (e) => resolve(e.data.compressedBlob);
});
```

---

## Developer Workflow

1. **Start dev server**: `npm run dev`
2. **Run tests**: `npm run test` (Vitest watch mode)
3. **Run E2E tests**: `npm run test:e2e`
4. **Lint**: `npm run lint`

**Recommended dev flow**:
1. Implement repository layer (Firestore CRUD)
2. Write unit tests for business logic (warning zones, auto-tasks)
3. Implement custom hooks (integrate repos + services)
4. Build UI components (test in Storybook if available)
5. Assemble pages
6. Write E2E tests for critical flows
7. Test offline mode (disable network in DevTools)

---

## Next Steps

After completing this feature:
- [ ] Run full E2E suite to verify all user stories
- [ ] Test offline functionality (disable network, verify CRUD works)
- [ ] Verify photo compression produces <500KB images
- [ ] Test swipe gestures on actual mobile device
- [ ] Verify dark mode in bright sunlight (real garage environment)
- [ ] Deploy Firestore indexes
- [ ] Update `GEMINI.md` with new technologies (run `.specify/scripts/powershell/update-agent-context.ps1`)

Ready to implement! 🏁
