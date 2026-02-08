# Feature Specification: Team UX Improvements

**Feature Branch**: `003-team-ux-improvements`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: User description: "Add persistent menu, implement missing lists, add invite functionality to team management"

## Clarifications

### Session 2026-02-07
- Q: How should bottom navigation interact with the top bar on mobile? → A: Option A - Replace hamburger menu entirely for primary items; top bar simplifies to show only Context/Profile.
- Q: Separate or Unified List View? → A: Unified List with filtering (combining Todo/Shopping items into one view with filter options).
- Q: Invite Code Expiration? → A: Option B - Time-limited; codes expire after 24 hours for security.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Team Dashboard (Priority: P1)

Integrate "Todo" and "Shopping" lists directly into the Team Dashboard as tabs, ensuring they are immediately discoverable and accessible without navigating to a separate page.

**Why this priority**: Users reported "missing" lists because they were buried in a sub-page. Immediate access improves collaboration.

**Independent Test**: Open Team Dashboard. Verify "Lists" (or specific Todo/Buy) tabs are visible. Click tab to view/edit items.

**Acceptance Scenarios**:

1. **Given** a user is on the Team Dashboard, **When** they look at the navigation tabs, **Then** they see "Chat", "Lists" (or "Todo"/"Shopping"), and "Members".
2. **Given** the Lists tab is active, **When** the user adds an item to "Shopping List", **Then** it appears instantly and persists.

---

### User Story 2 - Prominent Invite Actions (Priority: P1)

Expose the "Invite Member" functionality directly on the Team Dashboard header, allowing owners to easily generate and copy invite links.

**Why this priority**: Users reported "Missing invite" functionality. Growth depends on frictionless inviting.

**Independent Test**: Navigate to Team Dashboard. Click "Invite". Verify Invite Code/Link is displayed and copyable.

**Acceptance Scenarios**:

1. **Given** a Team Owner/Admin on the Team Dashboard, **When** they look at the header, **Then** an "Invite Member" button is visible.
2. **Given** the Invite dialog/popover is open, **When** user clicks "Copy Link", **Then** the invite URL is copied to clipboard.

---

### User Story 3 - Persistent Mobile Navigation (Priority: P2)

Implement a persistent bottom navigation bar for mobile users to provide one-tap access to key sections (Dashboard, Teams, Parts, Sessions).

**Why this priority**: "Add persistent menu" request. Improves mobile usability significantly.

**Independent Test**: View app on mobile viewport. Verify bottom bar exists. Navigate between sections.

**Acceptance Scenarios**:

1. **Given** a mobile user (viewport < 640px), **When** they navigate the app, **Then** a fixed bottom navigation bar is always visible.
2. **Given** the bottom bar, **When** user clicks "Teams", **Then** they are taken to the Teams list.

### Edge Cases

- **No Teams**: When a user has no teams, the "Teams" navigation link should direct to a "Create/Join Team" or "Empty State" page.
- **Member Access**: Users who are members but not owners/admins MUST NOT see the "Invite" button or link.
- **Offline Access**: Lists should display cached content if possible, or a clear offline indicator if real-time sync is unavailable.
- **Small Screens**: On very small screens (< 320px), the bottom navigation items should degrade gracefully (e.g., hide labels, use icons only).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a unified list view combining "Todo" and "Shopping" items, with client-side filtering capabilities to toggle visibility by list type.
- **FR-002**: System MUST provide an "Invite" button in Team Header for Owners/Admins.
- **FR-003**: Invite action MUST generate a new Invite Code that is valid for exactly 24 hours.
- **FR-007**: System MUST validate invite code expiration upon usage; expired codes MUST be rejected with a clear error.
- **FR-004**: System MUST display a persistent Bottom Navigation Bar on mobile devices for authenticated users.
- **FR-005**: Bottom Navigation MUST include links to: Dashboard, Teams, Parts, Sessions.
- **FR-006**: On mobile, the global top navigation/hamburger menu MUST be hidden/replaced, showing only secondary actions (e.g., Profile/Auth).

### Non-Functional Requirements
### Security & Privacy ([Constitution IV])
- **SEC-001**: AuthZ [Invite button visible only to Owners/Admins]
- **SEC-002**: Input Validation [Validate list items (already implemented)]

### Performance & Scalability ([Constitution II])
- **PERF-001**: Latency [Tab switching should be instantaneous (client-side state)]

### Accessibility ([Constitution II])
- **A11Y-001**: WCAG 2.1 AA Compliance [Nav bar items must have clear labels/ARIA]

### Key Entities *(include if feature involves data)*

- **Team**: Updated to store `inviteCode` and `inviteCodeExpiresAt` timestamp.
- **List**: Displayed in new UI location.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access Team Lists with 0 clicks (if default) or 1 click (if tab) from Team Dashboard.
- **SC-002**: Invite Link generation/retrieval takes < 3 clicks.
- **SC-003**: Mobile users have 100% visibility of primary navigation at all times.
