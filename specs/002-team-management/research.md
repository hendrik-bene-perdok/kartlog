# Research: Team Management & Collaboration

**Status**: Phase 0 Complete
**Date**: 2026-02-07

## Decisions & Rationale

### 1. Firestore Schema Design

**Decision**: Use a root `teams` collection with subcollections for `lists`, `chat`, and `members` (or an array for members depending on scale).

**Rationale**:
- **Scalability**: Subcollections allow for unlimited lists and chat messages without hitting document size limits (1MB).
- **Security**: Granular security rules can be applied to subcollections.
- **Querying**: Fetching a team doesn't need to load all chat history.

**Structure**:
- `teams/{teamId}`: Metadata (name, description, ownerId).
- `teams/{teamId}/members/{userId}`: Role (owner/admin/member), joinDate, status. (Using userId as document ID ensures uniqueness and fast lookups).
- `teams/{teamId}/lists/{listId}`: Items (array or subcollection depending on item count - likely subcollection `items` if collaborative editing is heavy, but single doc for list metadata + items array is simpler for MVP if <100 items).
    - *Correction*: Collaborative lists are better as collections of items `teams/{teamId}/lists/{listId}/items/{itemId}` to avoid race conditions on array updates, or use `arrayUnion`/`arrayRemove` carefully. Given "concurrent edits" edge case, individual item documents are safer for "last write wins" on specific fields rather than overwriting the whole array.
- `teams/{teamId}/chat/{messageId}`: Messages (senderId, content, timestamp).

### 2. Role-Based Access Control (RBAC)

**Decision**: Store user roles in `teams/{teamId}/members/{userId}` and use Firestore Security Rules `get()` to verify permissions.

**Strategy**:
- `isOwner(teamId)`: Checks if `request.auth.uid == resource.data.ownerId` (on team doc) OR fetches member doc.
- `isAdmin(teamId)`: Fetches `members/{auth.uid}` and checks `role == 'admin'`.
- `isMember(teamId)`: Fetches `members/{auth.uid}` and checks `status == 'active'`.

**Constraint**: `get()` calls in rules cost 1 read. To optimize, we might replicate `ownerId` on the team doc (already planned). For admins, the read is unavoidable for privileged actions. For read access, we can rely on `members/{auth.uid}` existence.

### 3. Invitation System

**Decision**: Use a root `invitations` collection for link lookups + `teams/{teamId}/joinRequests` for approval queue.

**Flow**:
1.  **Generate**: Owner creates `invitations/{token}` doc with `teamId`, `expiresAt`, `createdBy`.
    - *Alternative*: If the link is just a generic "join link" (not one-time use), the token can be stored on the `team` doc itself (`inviteCode`).
    - *Refinement*: User story implies "generate an invite link" which might be rotated. Storing an `inviteCode` on the Team doc is simpler and saves reads.
2.  **Access**: User visits `/invite/{inviteCode}`.
3.  **Request**: User clicks "Join". System creates doc in `teams/{teamId}/members/{userId}` with `status: 'pending'`.
4.  **Approve**: Owner updates `status: 'active'` and sets `role: 'member'`.

**Revised Decision**: Store `inviteCode` on `teams/{teamId}`.
- PRO: Zero extra storage cost, fast validation (just read team doc).
- CON: Shared link. If leaked, anyone can *request* to join (but Owner still must approve).
- **Verdict**: Valid for MVP. `inviteCode` is a random string on the Team document.

### 4. Shared Lists Concurrency

**Decision**: Use subcollection `items` for list contents. `teams/{teamId}/lists/{listType}/items/{itemId}`.

**Rationale**:
- **Concurrency**: Two users editing different items won't conflict.
- **Simplicity**: Real-time listeners on the collection return all items.
- **Granularity**: "Mark done" updates a single small document.

### 5. Chat Persistence

**Decision**: `teams/{teamId}/chat` collection.

**Rationale**:
- **Scalability**: Can use cursors/pagination easily.
- **Ordering**: `orderBy('timestamp', 'desc')`.
- **Limits**: MVP can limit query to last 50 messages.

## Alternatives Considered

- **Realtime Database**: Faster for chat/presence, but adds another DB to manage/secure. Firestore is sufficient for MVP chat.
- **Array for Members**: `members: [{uid, role}]` on Team doc.
    - *Rejected*: Security rules hard to write for "remove self" or "modify other member" inside an array. Document-per-member is much cleaner for RBAC rules.

