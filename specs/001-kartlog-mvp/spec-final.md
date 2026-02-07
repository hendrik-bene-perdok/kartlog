# Feature Specification: Kartlog MVP

**Feature Branch**: `001-kartlog-mvp`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "kartlog is a modern minimilistic responsive(primairy focus is mobile) web application that helps you or team maintain a kartparts(engine, chassis, tire pressure, etc) , kart sessions, parts management, basic user account management, team management. - frontend with local storage(offline modes), modern framework - backend with api's - database for persistants"

## Clarifications

### Session 2026-02-07
- Q: How should different part types (Engine vs Tires) generally be modeled? -> A: **Hybrid**: Fixed common fields (Name, Serial) + one "Notes" text field for extras.
- Q: What is the preferred offline strategy? -> A: **PWA using IndexedDB for storage and Service Workers for sync**.
- Q: What authentication method? -> A: **OAuth Only (Google/Apple)**. No stored passwords.
- Q: Automatic Team creation? -> A: **Personal Team**: Every user gets a default team on sign-up; can invite others.
- Q: Role Granularity? -> A: **Simple**: Owner (Admin) vs Member (Editor).
- Q: Tech Stack? -> A: **Next.js (React)**.
- Q: Database for persistence? -> A: **Firebase (Firestore)**.
- Q: Styling approach? -> A: **Tailwind CSS**.
- Q: API Strategy? -> A: **Direct Client SDK** (No separate backend; Firestore Rules for security).
- Q: Hosting? -> A: **Firebase Hosting**.





## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE.
-->

### User Story 1 - Team & User Setup (Priority: P1)

As a Team Manager, I want to create an account and set up my racing team so that I can manage my drivers and equipment.

**Why this priority**: Foundation for all other features; establishes the ownership model.

**Independent Test**: Can register, login, create a team, and invite a member (or adding a member).

**Acceptance Scenarios**:

1. **Given** a visitor, **When** they sign up with email/password, **Then** a user account is created.
2. **Given** a new user, **When** they complete onboarding, **Then** a "Team" is created with them as owner.
3. **Given** a logged-in owner, **When** they invite a user by email, **Then** the user receives an invite (or is added to team).

---

### User Story 2 - Parts Inventory Management (Priority: P1)

As a Mechanic/Driver, I want to catalog my kart parts (Engines, Chassis, Tires) so that I can track their usage and status.

**Why this priority**: Core value proposition ("maintain kartparts").

**Independent Test**: Can add, list, update, and retire parts.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they add a new Engine with serial number and hours, **Then** it appears in the Engine inventory.
2. **Given** an inventory list, **When** a user clicks a Chassis, **Then** they see its details (Manufacturer, Model, Setup notes).
3. **Given** a set of Tires, **When** a user logs their condition (e.g. "New", "Used"), **Then** the status is updated.

---

### User Story 3 - Session Logging (Priority: P1)

As a Driver, I want to log details of a track session (including specific setup like tire pressure) so that I can analyze performance later.

**Why this priority**: Core value proposition ("kart sessions").

**Independent Test**: Can create a session entry with setup data and save it.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they start a "New Session", **Then** they can select a Track and Date.
2. **Given** a session form, **When** they enter setup details (Tire Pressures, Engine used), **Then** the data is validated and saved.
3. **Given** offline mode, **When** they save a session, **Then** it is stored locally and synced when online.

---

### User Story 4 - Offline Access (Priority: P2)

As a Mobile User at a track with bad reception, I want to view my parts and log sessions without internet so that the app remains usable.

**Why this priority**: Explicit user requirement ("offline modes").

**Independent Test**: App loads and functions (Read/Write) with network disabled.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** network is disconnected, **Then** the user can still navigate to Parts and Sessions.
2. **Given** offline mode, **When** a user creates a session, **Then** it is visually marked as "Pending Sync".
3. **Given** a "Pending Sync" item, **When** network is restored, **Then** it automatically syncs to the backend.

---

### Edge Cases

- **Offline Sync Conflict**: Two users edit the same Part (e.g., Engine hours) while offline/online. Strategy: Last-Write-Wins (Server timestamp authority).
- **Storage Limits**: Local browser storage quota exceeded. Strategy: Graceful degradation (alert user, clear old session cache).
- **Invalid Data Input**: Tire pressure inputs < 0 or > 100 PSI (unrealistic). Strategy: Validation error on input.
- **Account Deletion**: User deletes account. Strategy: Remove personal data, keep anonymized team data if team has other members (or delete entirely if sole owner).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register and login via **OAuth Providers** (Google/Apple) ONLY. No local passwords.
- **FR-002**: System MUST automatically create a "Personal Team" for new users on signup. (Invites add other users to this team).
- **FR-003**: Users MUST be able to Create, Read, Update, and Delete (CRUD) Parts (Engine, Chassis, Tires).
    - **Constraint**: Parts share common fields (Name, Serial, Status) plus a "Notes" field; no complex custom schemas for MVP.
- **FR-004**: System MUST allow logging of Sessions linked to a Team and Date.
- **FR-005**: Session logs MUST support dynamic setup fields (specifically Tire Pressure).
- **FR-006**: The Frontend MUST function offline (PWA standards), caching data locally via IndexedDB.
- **FR-007**: The System MUST synchronize local data with the **Cloud Store** (Firestore) when connectivity is available (handled via SDK).

### Non-Functional Requirements

### Security & Privacy ([Constitution IV])
- **SEC-001**: AuthZ [Must enforce Owner vs Member roles via **Firestore Security Rules**: Owners write team capabilities; Members read/update specific collections].
- **SEC-002**: Data Protection [Encrypt passwords at rest; HTTPS for all transport].
- **SEC-003**: Input Validation [Validate all form inputs (serial numbers, pressures) on client and server].

### Performance & Scalability ([Constitution II])
- **PERF-001**: Latency [p95 < 200ms for read operations (local cache should be instant)].
- **PERF-002**: First Contentful Paint [Mobile load < 1.5s on 4G].

### Accessibility ([Constitution II])
- **A11Y-001**: WCAG 2.1 AA Compliance [High contrast for outdoor use at tracks, large touch targets for mobile].

### Key Entities *(include if feature involves data)*

- **User**: Authentication profile.
- **Team**: Ownership container.
- **Part**: Polymorphic entity (Type: Engine, Chassis, Tire) with specific attributes.
- **Session**: Event log (Date, Track, weather notes) + Setup configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can log a session (start to finish) in under 1 minute on mobile.
- **SC-002**: App loads interactive UI in < 2 seconds on "3G Fast" network simulation.
- **SC-003**: 100% of offline-created records sync successfully upon reconnection.
- **SC-004**: Users report "Easy to use on phone" (Qualitative: >4/5 in beta feedback).

## Assumptions

- **Framework**: `Next.js (React)` (Unified Frontend/Backend + PWA). Verified in clarifications.
- **Database**: `Firebase/Firestore` (NoSQL, Realtime, simplifies Offline). Verified in clarifications.
- **Styling**: `Tailwind CSS`. Verified in clarifications.
- **Architecture**: `Direct Client SDK` (Serverless, uses Firestore Security Rules). Validated in clarifications.
- **Hosting**: `Firebase Hosting` (Single platform for Data/Auth/Hosting).
- "Kartparts" data structure needs flexibility (different attributes for Engines vs Tires).
