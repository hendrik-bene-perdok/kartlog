# Data Model: Team Management

## Firestore Schema

### Root Collections

#### `teams/{teamId}`
- **Permissions**:
  - `create`: Authenticated users.
  - `read`: Users in `members` subcollection.
  - `update`: `ownerId == auth.uid` or `members/{auth.uid}.role == 'admin'`.
  - `delete`: `ownerId == auth.uid`.
- **Fields**:
  - `name` (string): Team name.
  - `description` (string): Team description.
  - `ownerId` (string): UID of the creator/owner.
  - `inviteCode` (string, optional): Random token for join links.
  - `createdAt` (timestamp).
  - `updatedAt` (timestamp).

#### `teams/{teamId}/members/{userId}`
- **Permissions**:
  - `read`: `auth.uid` is a member of the team.
  - `create`: `auth.uid == userId` (Request to join).
  - `update`: `ownerId == auth.uid` OR (`members/{auth.uid}.role == 'admin'` AND `resource.data.role != 'owner'`).
  - `delete`: `ownerId == auth.uid` OR (`members/{auth.uid}.role == 'admin'` AND `resource.data.role != 'owner'`) OR `auth.uid == userId` (Leave team).
- **Fields**:
  - `uid` (string): User ID (redundant but useful).
  - `displayName` (string): Cached user name.
  - `email` (string, optional): Cached email (if privacy allows).
  - `role` (enum: 'owner', 'admin', 'member').
  - `status` (enum: 'pending', 'active').
  - `joinedAt` (timestamp).

#### `teams/{teamId}/lists/{listId}`
- **Note**: `listId` can be 'todo' and 'tobuy' or dynamic.
- **Permissions**: `read, write` for active members.
- **Fields**:
  - `name` (string): "To Do" or "Shopping List".
  - `type` (enum: 'todo', 'buy').

#### `teams/{teamId}/lists/{listId}/items/{itemId}`
- **Permissions**: `read, write` for active members.
- **Fields**:
  - `content` (string): Task/Item description.
  - `isCompleted` (boolean): Done status.
  - `createdBy` (string): UID.
  - `createdAt` (timestamp).

#### `teams/{teamId}/chat/{messageId}`
- **Permissions**: `read, write` for active members.
- **Fields**:
  - `content` (string): Message text.
  - `senderId` (string): UID.
  - `senderName` (string): Display name.
  - `timestamp` (timestamp).

## TypeScript Interfaces

```typescript
export type TeamRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'pending' | 'active';

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  uid: string;
  role: TeamRole;
  status: MemberStatus;
  displayName: string;
  email?: string;
  joinedAt: Date;
}

export interface ListItem {
  id: string; // Generated
  content: string;
  isCompleted: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}
```
