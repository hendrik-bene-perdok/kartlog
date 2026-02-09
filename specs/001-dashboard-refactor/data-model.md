# Data Model: Dashboard Refactor

## Firestore Collections

### `karts` (Updated)
Racing karts with custom service intervals.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated ID |
| `name` | string | Display name (e.g., "Tony Kart 2024") |
| `number` | string | Race number |
| `serviceIntervals` | `ServiceInterval[]` | **[NEW]** Customizable maintenance trackers |
| `totalEngineHours` | number | Total aggregated engine runtime |
| `teamId` | string | Team ownership (optional) |
| `userId` | string | Owner ID |

#### Type: `ServiceInterval`
```typescript
{
  id: string;          // UUID
  name: string;        // "Piston", "Chain"
  currentValue: number;// Current usage (hours)
  targetValue: number; // Maintenance threshold
  unit: 'hours';       // Future proofing
  status: 'ok' | 'due' | 'overdue'; // Computed
}
```

### `maintenanceTasks` (Updated)
Tasks to perform on karts.

| Field | Type | Description |
|-------|------|-------------|
| `kartId` | string | Reference to Kart |
| `type` | string | Task type |
| `description` | string | Details |
| `status` | 'pending' \| 'completed' | Workflow state |
| `linkedIntervalId` | string \| null | **[NEW]** ID of `ServiceInterval` to reset |
| `completedAt` | Timestamp | When work was done |

### `parts` (New)
Inventory management.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Owner ID |
| `teamId` | string | Team ID (optional) |
| `name` | string | "Spark Plug NGK-10" |
| `category` | string | "Engine", "Chassis", "Consumable" |
| `quantity` | number | Current stock |
| `minQuantity` | number | Reorder point |
| `location` | string | Shelf/Bin location |

### `sessions` (New)
Racing session logs.

| Field | Type | Description |
|-------|------|-------------|
| `kartId` | string | Reference to Kart |
| `date` | Timestamp | Session date |
| `duration` | number | Duration in minutes |
| `trackId` | string | Optional track reference |
| `notes` | string | Session notes |

### `shoppingList` (New/Updated)
Items needed for purchase.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Owner ID |
| `teamId` | string | Team ID |
| `name` | string | Item name |
| `status` | 'active' \| 'purchased' | State |
| `linkedPartId` | string | Optional link to inventory |

## Validation Rules (Zod)

### Service Interval
- `name`: min 1 char, max 50 chars
- `targetValue`: positive number

### Part
- `name`: required
- `quantity`: non-negative integer
