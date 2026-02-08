# Feature Specification: Kart Maintenance Core System

**Feature Branch**: `004-maintenance-core`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Comprehensive kart maintenance and logging system for Honda GX390 engines with multi-kart management, parts shopping list with photo support, maintenance task tracking, engine hour logging, integrated manual access, and modern touch-friendly 'Garage Mode' UI"

## Clarifications

### Session 2026-02-08

- Q: Should new karts come with pre-configured standard maintenance intervals, or should users manually set them up? → A: Pre-configured standard intervals (10h oil, 25h air filter, 50h valve adjustment) that users can customize
- Q: When a user removes a shopping list item after receiving a part, should it be permanently deleted or archived for purchase history? → A: Archive with history - items move to "Purchase History" view with automatic deletion after 12 months
- Q: What priority level should automatically generated maintenance tasks have? → A: Dynamic based on threshold type with customizable warning zones per maintenance type (green=ok, yellow=soon, red=now/overdue)
- Q: What should happen when a user tries to delete a kart that has tasks, shopping items, and hour history? → A: Cascade delete with confirmation - show dialog listing what will be deleted, require explicit user confirmation
- Q: How should the Honda GX390 manual be provided to users? → A: External link - button opens manufacturer's website in browser (requires internet connection)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Kart Dashboard Overview (Priority: P1)

As a mechanic, I want to see a quick overview of all my karts' status (last maintenance, engine hours) on a single dashboard, so that I know which kart needs attention first.

**Why this priority**: This is the entry point to the application and provides immediate value by showing critical maintenance status at a glance. Without this, users cannot effectively prioritize their work.

**Independent Test**: Can be fully tested by creating two karts with different maintenance states and verifying that the dashboard displays their current status, including visual indicators for maintenance urgency.

**Acceptance Scenarios**:

1. **Given** I have multiple karts registered in the system, **When** I open the app, **Then** I see all karts with their names (e.g., "Kart #17", "Kart #80"), last maintenance date, and current engine hours
2. **Given** a kart is approaching its maintenance interval, **When** I view the dashboard, **Then** that kart is highlighted with a visual warning indicator
3. **Given** I am viewing the dashboard, **When** I tap on a kart card, **Then** I navigate to that kart's detailed view with full maintenance history and tasks

---

### User Story 2 - Engine Hour Logging (Priority: P1)

As a driver, I want to log engine hours after each session by simply entering the session duration, so that the total engine hours are automatically tracked for maintenance scheduling.

**Why this priority**: Accurate hour tracking is fundamental to maintenance scheduling. Without this, the entire maintenance system breaks down as you cannot track when services are due.

**Independent Test**: Can be fully tested by logging several sessions for a kart and verifying that total hours accumulate correctly and trigger maintenance reminders at configured intervals.

**Acceptance Scenarios**:

1. **Given** I select a specific kart, **When** I log a session with duration (e.g., "45 minutes"), **Then** the total engine hours for that kart increase by the logged amount
2. **Given** I want to log hours immediately after a session, **When** I access the hour logging feature, **Then** it opens with large, touch-friendly input fields suitable for use with dirty/gloved hands
3. **Given** I have logged multiple sessions, **When** I view the hour history, **Then** I see a chronological list of all sessions with dates, durations, and running totals
4. **Given** the engine hours reach a maintenance threshold (e.g., 10 hours for oil change), **When** I view the dashboard or kart details, **Then** an automatic maintenance task is created and displayed

---

### User Story 3 - Parts Shopping List with Photo Support (Priority: P2)

As a mechanic, I want to quickly add broken or needed parts to a shopping list with photo documentation, so that I know exactly what to order when I'm at the shop or online.

**Why this priority**: Prevents forgotten purchases and ensures correct part ordering by providing visual reference. This is a major pain point when parts need replacement but the exact specification is unclear.

**Independent Test**: Can be fully tested by adding several parts to the shopping list with and without photos, then verifying that items can be marked as ordered and removed when purchased.

**Acceptance Scenarios**:

1. **Given** I notice a broken or worn part, **When** I add it to the shopping list, **Then** I can enter a part name, description, and optionally attach a photo from my device camera
2. **Given** I have a shopping list with multiple items, **When** I view the list, **Then** I see each item with its photo thumbnail, description, and associated kart
3. **Given** I have ordered a part, **When** I mark it as "Ordered", **Then** it is visually distinguished (e.g., strikethrough or moved to "Ordered" section) to prevent duplicate purchases
4. **Given** I have received and installed a part, **When** I remove it from the shopping list, **Then** it is moved to "Purchase History" for future reference (retained for 12 months)
5. **Given** I'm at the parts store, **When** I tap on a shopping list item with a photo, **Then** the photo opens in full-screen view for easy reference

---

### User Story 4 - Maintenance Task Management (Priority: P2)

As a mechanic, I want to create and prioritize maintenance tasks for specific karts (e.g., "Replace brake pads on Kart #80"), so that we complete essential repairs before the next race day.

**Why this priority**: Organizes and prioritizes maintenance work, ensuring critical tasks aren't forgotten. This turns reactive maintenance into proactive planning.

**Independent Test**: Can be fully tested by creating tasks with different priorities for multiple karts, then completing them and verifying they are marked as done with completion timestamps.

**Acceptance Scenarios**:

1. **Given** I need to schedule maintenance, **When** I create a new task, **Then** I can specify the kart, task description, and priority level (High/Medium/Low)
2. **Given** I have multiple tasks, **When** I view the task list, **Then** tasks are sorted by priority (High first) and grouped by kart
3. **Given** I complete a maintenance task, **When** I swipe right on the task or tap a completion button, **Then** the task is marked as complete with timestamp and moved to completed tasks history
4. **Given** I want to delete an irrelevant task, **When** I swipe left on the task, **Then** it is removed from the list
5. **Given** engine hours trigger automatic maintenance tasks (e.g., oil change at 10 hours), **When** I view the task list, **Then** these auto-generated tasks appear with appropriate priority

---

### User Story 5 - Quick Manual Access (Priority: P3)

As a mechanic, I want instant access to the Honda GX390 manual (especially torque specifications and maintenance procedures), so that I have the correct technical data while wrenching.

**Why this priority**: Prevents errors during maintenance by providing immediate access to factory specifications. While valuable, karts can still be maintained without this feature if users have physical manuals.

**Independent Test**: Can be fully tested by tapping the manual access button and verifying that it opens the manufacturer's website in the device's browser.

**Acceptance Scenarios**:

1. **Given** I am working on a kart, **When** I tap the "Manual" button, **Then** the Honda GX390 manual page opens in my device's default browser
2. **Given** I am offline in the garage, **When** I tap the "Manual" button, **Then** the system shows a friendly message indicating internet is required
3. **Given** the manual link opens successfully, **When** I view the manufacturer's page, **Then** I can access all technical specifications, torque specs, and maintenance procedures

---

### User Story 6 - Touch-Friendly "Garage Mode" UI (Priority: P1)

As a user working in the garage with dirty or gloved hands, I want a UI with large touch targets, dark mode, and swipe gestures, so that I can interact with the app easily without fumbling with small buttons.

**Why this priority**: This is a foundational UX requirement that makes the app actually usable in its intended environment. Without this, adoption will fail regardless of features.

**Independent Test**: Can be fully tested by navigating through all major features using only touch gestures (no small buttons), verifying swipe actions work correctly, and confirming dark mode reduces eye strain.

**Acceptance Scenarios**:

1. **Given** I open the app, **When** the interface loads, **Then** it uses dark mode by default with high-contrast text and accent colors
2. **Given** I need to interact with any action (logging hours, adding tasks, etc.), **When** I view the UI, **Then** all interactive elements have minimum 48x48px touch targets suitable for thick fingers or gloves
3. **Given** I want to complete or delete a task, **When** I swipe right or left on the item, **Then** the swipe gesture triggers the appropriate action without requiring a precise tap
4. **Given** I complete an action (e.g., save a task, log hours), **When** the action succeeds, **Then** I receive haptic feedback (vibration) confirming the action
5. **Given** I am using the app outdoors or in bright garage lighting, **When** I view any screen, **Then** the high-contrast dark theme remains readable

---

### User Story 7 - Kart Context Switching (Priority: P2)

As a mechanic managing multiple karts, I want to easily switch between kart profiles (e.g., Kart #17 and Kart #80), so that I keep data and tasks separated and organized.

**Why this priority**: Essential for managing multiple karts without confusion, but can be worked around initially by filtering views.

**Independent Test**: Can be fully tested by creating two karts, adding different tasks and hours to each, then switching between them and verifying data isolation.

**Acceptance Scenarios**:

1. **Given** I am viewing one kart's details, **When** I tap a kart switcher control, **Then** I see a list of all my karts and can select a different one
2. **Given** I switch to a different kart, **When** the interface updates, **Then** all displayed data (tasks, hours, shopping list items) reflects only the selected kart
3. **Given** I am on the main dashboard, **When** I view all karts simultaneously, **Then** I can quickly tap on any kart card to drill into its specific details

---

### Edge Cases

- What happens when a user tries to log negative or extremely large hour values (e.g., "999 hours" in one session)?
  - System should validate input and reject impossible values, showing a friendly error message
  
- How does the system handle photos that are very large (e.g., 10MB+ images from high-resolution cameras)?
  - System should automatically compress/resize images to reasonable dimensions (e.g., 1920x1080 max) before storage
  
- What happens when a maintenance threshold is reached but the automatic task already exists?
  - System should not create duplicate tasks; it should check for existing similar tasks before auto-generation
  
- How does the system handle concurrent editing if multiple team members work on the same kart?
  - For MVP, assume single-user operation; multi-user sync will be addressed in future team collaboration features
  
- What happens when a user deletes a kart that has associated tasks, shopping list items, and hour history?
  - System performs cascade delete of all associated data, but requires explicit confirmation via dialog that lists what will be deleted (e.g., "Delete Kart #17? This will permanently delete: 5 tasks, 3 shopping items, 45 hours of session logs")

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create, manage, and delete kart profiles, each with a unique identifier/name (e.g., "Kart #17", "Kart #80"); kart deletion MUST cascade to all associated data (tasks, shopping items, session logs) and require confirmation dialog listing what will be deleted
- **FR-002**: System MUST allow users to log engine hours for each kart by entering session duration (in minutes or hours)
- **FR-003**: System MUST automatically calculate and display cumulative engine hours for each kart from session logs
- **FR-004**: System MUST provide pre-configured standard maintenance thresholds for new karts (10h oil change, 25h air filter, 50h valve adjustment) and allow users to customize these thresholds
- **FR-005**: System MUST automatically create maintenance tasks when engine hour thresholds are reached, with task priority determined dynamically based on the maintenance type and warning zone (green=ok, yellow=Medium priority, red=High priority)
- **FR-006**: Users MUST be able to create custom maintenance tasks with description, priority (High/Medium/Low), and kart association
- **FR-007**: Users MUST be able to mark tasks as complete, which records completion timestamp
- **FR-008**: Users MUST be able to delete tasks via swipe gesture or explicit delete action
- **FR-009**: System MUST allow users to add items to a shopping list with description, optional photo, and kart association
- **FR-010**: Users MUST be able to capture photos directly from device camera or select from gallery for shopping list items
- **FR-011**: System MUST allow users to mark shopping list items as "Ordered" to prevent duplicate purchases
- **FR-012**: System MUST archive shopping list items to "Purchase History" when removed, retaining them for 12 months before automatic deletion
- **FR-013**: System MUST provide a button to access the Honda GX390 service manual via external link to the manufacturer's website (requires internet connection)
- **FR-014**: System MUST display a dashboard showing all karts with their current status: last maintenance, total engine hours, and pending task count
- **FR-015**: System MUST provide visual indicators (e.g., color coding, icons) for karts requiring urgent maintenance
- **FR-016**: System MUST allow users to switch between kart contexts to view kart-specific data
- **FR-017**: System MUST persist all data (karts, tasks, shopping list, hour logs) locally on the device
- **FR-018**: System MUST validate hour logging inputs to reject negative values and unreasonably large values (e.g., >24 hours per session)
- **FR-019**: System MUST compress uploaded photos to reasonable file sizes (target: <500KB per image) to conserve storage
- **FR-020**: System MUST support swipe gestures for common actions: swipe right to complete tasks, swipe left to delete
- **FR-021**: System MUST allow users to configure warning zone thresholds for each maintenance type (e.g., oil change: yellow at 8h, red at 10h)
- **FR-022**: System MUST visually indicate maintenance status using color-coded zones: green (OK), yellow (approaching - Medium priority task), red (due/overdue - High priority task)

### Non-Functional Requirements

#### Security & Privacy

- **SEC-001**: System MUST store all user data locally on the device with no external transmission (offline-first architecture)
- **SEC-002**: System MUST validate all user inputs at entry points to prevent malformed data (e.g., SQL injection if using local database)
- **SEC-003**: Photo storage MUST be isolated to application storage to prevent unauthorized access from other apps

#### Performance & Scalability

- **PERF-001**: Dashboard MUST load and display all karts and their status within 1 second on standard mobile hardware
- **PERF-002**: Hour logging and task creation actions MUST provide feedback within 300ms to feel instant
- **PERF-003**: Photo capture and compression MUST complete within 3 seconds to avoid user frustration
- **PERF-004**: System MUST support management of at least 10 karts with 100+ tasks and shopping items combined without performance degradation

#### Accessibility

- **A11Y-001**: All interactive elements MUST have minimum 48x48 pixel touch targets for easy interaction with gloves or dirty hands
- **A11Y-002**: UI MUST use high-contrast color schemes (dark background with bright text/accents) for readability in various lighting
- **A11Y-003**: Text MUST be readable at minimum font size of 16px for body text, 20px for headings
- **A11Y-004**: Swipe gestures MUST have visual affordances (e.g., slight element movement) to indicate swipe-ability
- **A11Y-005**: Haptic feedback MUST be provided for all completion/deletion actions when supported by device

#### Usability

- **UX-001**: Application MUST default to dark mode optimized for garage environments
- **UX-002**: Navigation MUST use large, clearly labeled buttons and cards rather than small icons
- **UX-003**: Common actions (log hours, add task, add part) MUST be accessible within 2 taps from dashboard
- **UX-004**: Manual access button MUST open the manufacturer's Honda GX390 manual page in the device's default browser

### Key Entities

- **Kart**: Represents a go-kart unit with unique identifier (name/number), total engine hours, configured maintenance thresholds, and creation date
- **Session Log**: Represents a single driving session with duration (in minutes), timestamp, and association to a specific kart
- **Maintenance Task**: Represents a maintenance or repair task with description, priority level (High/Medium/Low), kart association, creation timestamp, completion status, and optional completion timestamp; can be manually created or automatically generated
- **Shopping List Item**: Represents a part or component to purchase with description, optional photo, kart association, ordered status, and creation timestamp
- **Maintenance Threshold**: Configuration for automatic task generation, including threshold type (e.g., "Oil Change"), hour interval (e.g., every 10 hours), customizable warning zones (yellow threshold hour value, red threshold hour value), and association to a specific kart

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new kart profile and log their first session within 1 minute of opening the app
- **SC-002**: Users can add a part to the shopping list with photo in under 30 seconds while wearing work gloves
- **SC-003**: Dashboard provides at-a-glance status for all karts without requiring scrolling or navigation (for up to 4 karts on standard phone screen)
- **SC-004**: 95% of common actions (log hours, create task, add shopping item) are completable using swipe gestures and large touch targets without requiring precise taps
- **SC-005**: Application remains responsive (actions complete within 500ms) even with 10 karts, 50 tasks, and 50 shopping items
- **SC-006**: Users successfully locate Honda GX390 torque specifications in the integrated manual within 15 seconds
- **SC-007**: Zero instances of duplicate automatic maintenance tasks being created for the same kart and threshold
- **SC-008**: Photo uploads are compressed to average 400KB or less while maintaining readable quality for part identification
