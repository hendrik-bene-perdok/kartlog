# Data Model: Kartlog MVP

## Overview

- **Database**: Firebase Cloud Firestore (NoSQL)
- **Schema**: Implicit (managed via TypeScript interfaces)
- **Validation**: Enforced via Firestore Security Rules + Zod Schema (Client)

## Collections Structure

### 1. Users

**Path**: `/users/{userId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | User ID (Auth UID). |
| `displayName` | `string` | User's full name. |
| `email` | `string` | User's email address. |
| `photoURL` | `string` | Profile picture (optional). |
| `defaultTeamId` | `string` | ID of the primary/personal team. |
| `createdAt` | `timestamp` | Server timestamp. |
| `updatedAt` | `timestamp` | Server timestamp. |

### 2. Teams

**Path**: `/teams/{teamId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID (Auto-generated). |
| `name` | `string` | Team Name (e.g., "Max's Racing"). |
| `ownerId` | `string` | ID of the User who owns the team. |
| `members` | `map<string, Role>` | Map of UserID -> Role (`"owner"`, `"editor"`, `"viewer"`). |
| `inviteCode` | `string` | (Optional) Code for team invites. |
| `createdAt` | `timestamp` | Server timestamp. |

### 3. Parts (Sub-collection)

**Path**: `/teams/{teamId}/parts/{partId}`

Since parts are polymorphic, they share common fields but have `type`-specific fields stored in a `specs` map or top-level fields (for simplicity in querying, top-level is better if few fields overlap).

**Common Fields**:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID. |
| `type` | `enum` | `"engine"`, `"chassis"`, `"tire"`. |
| `name` | `string` | Example: "Rotax Max Evo #1". |
| `serialNumber` | `string` | Manufacturer serial. |
| `status` | `enum` | `"active"`, `"maintenance"`, `"retired"`. |
| `notes` | `string` | Additional info. |
| `acquisitionDate` | `timestamp` | When acquired. |

**Type-Specific Fields (merged into document)**:

- **Engine**:
  - `hours`: `number` (Running hours).
  - `lastRebuild`: `timestamp` (Date of last service).

- **Chassis**:
  - `modelYear`: `number`.
  - `setupNotes`: `string` (Defaults).

- **Tire**:
  - `compound`: `string` (e.g., "Mojo D5").
  - `condition`: `enum` (`"new"`, `"scrubbed"`, `"worn"`).
  - `installDate`: `timestamp`.

### 4. Sessions (Sub-collection)

**Path**: `/teams/{teamId}/sessions/{sessionId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID. |
| `date` | `timestamp` | Session date. |
| `trackName` | `string` | Location. |
| `weather` | `map` | `{ temp: number, conditions: string }`. |
| `driverId` | `string` | User ID of the driver. |
| `notes` | `string` | General session notes. |
| `setup` | `map` | Configuration snapshot. |

**Setup Object Structure (Example)**:
```json
{
  "engineId": "ref/to/part",
  "chassisId": "ref/to/part",
  "tireSetId": "ref/to/part",
  "tirePressure": {
    "fl": 12.5,
    "fr": 12.5,
    "rl": 11.0,
    "rr": 11.0
  },
  "gearing": "12/84"
}
```

## Security Rules (High-Level)

1. **Users**:
   - `read/write`: Only `request.auth.uid == userId`.

2. **Teams**:
   - `create`: Authenticated users.
   - `read`: User ID must trigger in `resource.data.members`.
   - `update`: User ID in `members` AND role is `"owner"`/`"admin"`.
   - `delete`: Only `"owner"`.

3. **Sub-collections (Parts/Sessions)**:
   - `read`: Parent team access.
   - `write`: Parent team access AND role is `"owner"`/`"editor"`.

## Indexing Requirements

- `parts`: Composite index on `type` + `status` (typical filter).
- `sessions`: Index on `date` (descending) + `driverId` (filter by driver).
