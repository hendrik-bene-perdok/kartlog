# Data Model: Team UX Improvements

**Feature Branch**: `003-team-ux-improvements`
**Description**: Updates to Team entity for time-limited invites.

## Entities

### `Team` (Updated)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inviteCodeExpiresAt` | `Timestamp` | Yes | Expiration timestamp for the current invite code. |

**Example Firestore Document (`teams/{teamId}`)**:
```json
{
  "name": "My Team",
  "ownerId": "user123",
  "inviteCode": "A1B2C3D4",
  "inviteCodeExpiresAt": "2026-02-08T12:00:00Z"
}
```

### `List` (Unchanged)
- Use filtering on existing `lists/{listType}/items` subcollections.
