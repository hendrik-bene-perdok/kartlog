# Research & Technical Decisions: Team UX Improvements

**Feature**: Team Dashboard Unification & Mobile Navigation
**Date**: 2026-02-07

## Key Decisions

### 1. Mobile Navigation Strategy
- **Decision**: Replace top hamburger menu with **Bottom Navigation Bar** for primary actions (Dashboard, Teams, Parts, Sessions). Top bar retains only Context/Profile.
- **Rationale**: Improves thumb-reachability on mobile devices and aligns with modern app patterns.
- **Alternatives Considered**: 
  - *Hamburger Menu*: Hidden behind a click, harder to discover.
  - *Scrollable Top Tabs*: Consumes vertical space and gets cluttered.

### 2. Unified List View
- **Decision**: Combine Todo and Shopping lists into a single `SharedList` component with client-side filtering tabs/toggles.
- **Rationale**: Reduces navigation depth. Users can see all tasks in context without page reloads.
- **Technical**: Fetch all list items for the team (filtered by type at query level if volume is high, but for MVP fetching both collections is acceptable as they are separate subcollections).
  - *Refinement*: `SharedList` component currently fetches a specific `listType`. We can either instantiate it twice (in tabs) or modify it to handle multiple types.
  - *Selected Approach*: Render two instances of `SharedList` inside a client-side tab container (Tabs component). This keeps the service logic simple and component reusable.

### 3. Invite Code Expiration
- **Decision**: Implement expiration (24h) logic in `team.service.ts`.
- **Rationale**: Security best practice for public shareable links.
- **Implementation**:
  - Add `inviteCodeExpiresAt` (Timestamp) to Team document.
  - On `joinTeam`, check if `now() < inviteCodeExpiresAt`.
  - Add `regenerateInviteCode` function to create new code + new timestamp.

## Implementation Details

### Data Model Updates (Teams)
- `inviteCode`: String (Existing)
- `inviteCodeExpiresAt`: Timestamp (New)

### Security Rules (Firestore)
- **Join**: Validate code expiration in security rules?
  - *Limitation*: Firestore rules can read `resource.data.inviteCodeExpiresAt`, but comparing `request.time` is supported.
  - *Decision*: Enforce expiration in **Security Rules** AND client/service layer for robust security.
  
  `allow get: if ... || (resource.data.inviteCode == request.resource.data.code && request.time < resource.data.inviteCodeExpiresAt);`
  
  *Correction*: Invite codes usually accessed via `get` on the team doc. The user doesn't send the code in `request.resource` during a READ.
  - The user has the code in the URL. They query for team with that code.
  - A `list` query `where('inviteCode', '==', providedCode)` is typical.
  - Rules should allow list/get if the invite code matches AND is not expired.
  
  *Refined Rule*:
  `allow list: if isActiveMember(teamId) || (resource.data.inviteCode != null && request.time < resource.data.inviteCodeExpiresAt);` Note: We can't check if "provided code matches" in a list rule easily without custom claims or careful query constraints.
  
  *Simpler Approach*: Allow read if `inviteCode` exists (as we have now). Validate expiration in the **Service Layer** (Application Logic) before adding the member. Security rules mainly prevent unauthorized access *after* joining or to private data.
