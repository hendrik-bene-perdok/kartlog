# Feature Specification: Complete Application UI/UX Refactor

**Feature Branch**: `001-dashboard-refactor`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Refactor all application interfaces to implement new UI/UX design with improved visual hierarchy, status indicators, and user experience based on reference implementation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Karts List with Visual Status Indicators (Priority: P1)

As a user, I want to browse all my karts in a grid or list view with clear visual indicators of their maintenance status so I can quickly identify which karts need attention without opening individual detail pages.

**Why this priority**: This is the entry point to the kart management system. Users need to see all their karts at a glance and identify which ones require maintenance. Without this, users have no way to navigate to specific kart details or understand their fleet status.

## Clarifications

### Session 2026-02-08

- Q1: Service Interval Configuration?
  - A: **Per-Kart Customization**. Users add specific trackers to each kart with custom names and intervals (e.g., "My Race Piston" - 6h). Flexible data model.
- Q2: Maintenance Automation Logic?
  - A: **Smart Linkage**. When creating a task, user can select "Resets [Component]" option. Completing the task auto-resets that timer.

**Independent Test**: Can be fully tested by navigating to the karts page (`/karts`) and verifying all karts display with status badges, key metrics, and maintenance warnings. Delivers immediate value by providing fleet-wide visibility.

**Acceptance Scenarios**:

1. **Given** I have multiple karts in my garage, **When** I navigate to `/karts`, **Then** I see all karts displayed in a responsive grid with cards showing kart name, status badge, and key metrics
2. **Given** viewing the karts list, **When** a kart has maintenance due soon, **Then** the kart card shows a yellow/orange warning indicator with "Due Soon" status
3. **Given** viewing the karts list, **When** a kart is overdue for maintenance, **Then** the kart card shows a red alert indicator with "Overdue" status
4. **Given** viewing the karts list, **When** all kart maintenance is current, **Then** the kart card shows a green "Ready" status badge
5. **Given** I have no karts yet, **When** I visit `/karts`, **Then** I see an empty state with a prominent "Add Your First Kart" call-to-action
6. **Given** viewing the karts list, **When** I click on a kart card, **Then** I navigate to that kart's detail page
7. **Given** viewing karts, **When** I click "Add Kart" button, **Then** a form appears to create a new kart

---

### User Story 2 - View Kart Detail with Service Status Dashboard (Priority: P1)

As a user, I want to see detailed maintenance status for a specific kart on its detail page so I can assess what work is needed and take actions like logging hours or resetting service timers.

**Why this priority**: Core functionality for managing individual kart maintenance. Users spend significant time on detail pages making decisions and taking actions based on the service status information displayed.

**Independent Test**: Can be tested by navigating to any kart detail page (`/karts/[id]`) and verifying all status sections display: engine service status, component lifetimes, maintenance history, statistics, and recent parts. Delivers detailed maintenance management capabilities.

**Acceptance Scenarios**:

1. **Given** I selected a kart, **When** I view its detail page, **Then** I see kart name, number, specifications, status badge, and location prominently at the top
2. **Given** viewing kart details, **When** looking at engine service status, **Then** I see current hours vs. maximum hours, progress bar, and percentage remaining
3. **Given** viewing kart details, **When** looking at service components, **Then** I see individual cards for piston life, gearbox oil, and other tracked components with their status
4. **Given** service components displayed, **When** a component is due soon, **Then** it shows yellow/orange warning with "Due Soon" label and progress indicatorred progress bar
5. **Given** viewing kart details, **When** looking at recent maintenance, **Then** I see a table of recent tasks with task name, technician, date, status, and actions
6. **Given** viewing recent maintenance, **When** looking at the right sidebar, **Then** I see kart statistics (lap times, gear ratios, etc.) and recently replaced parts
7. **Given** viewing kart details, **When** I click "Log Work" or "Log Meter Hours", **Then** appropriate forms/dialogs open to record maintenance
8. **Given** viewing kart details, **When** I click "Edit Specs", **Then** a form opens to update kart specifications

---

### User Story 3 - Navigate with Consistent Global Layout (Priority: P1)

As a user, I want consistent navigation and layout across all pages so I can easily move between different sections of the application (Dashboard, Karts, Inventory, Teams) and always know where I am.

**Why this priority**: Foundation for the entire application. Without consistent navigation, users get lost and the application feels disjointed. This must work before other features can be effectively used.

**Independent Test**: Can be tested by navigating between different sections and verifying header/footer navigation persists, highlights active section, and maintains consistent branding. Delivers coherent application experience.

**Acceptance Scenarios**:

1. **Given** I'm on any page, **When** viewing the header, **Then** I see consistent branding (KartManager logo/icon), search bar, notifications, and user profile avatar
2. **Given** I'm on any page, **When** viewing the footer navigation, **Then** I see links to Dashboard, Karts, Inventory, and Team sections
3. **Given** viewing navigation, **When** I'm on the Karts section, **Then** the "Karts" navigation item shows as active with visual indicator (bold text, primary color, underline)
4. **Given** using desktop view, **When** I look at the header, **Then** the search bar is visible and functional
5. **Given** using mobile view, **When** navigation is displayed, **Then** footer navigation adapts responsively and remains accessible
6. **Given** on any page, **When** I click a navigation link, **Then** I'm routed to the correct section with navigation updating to show new active page

---

### User Story 4 - Manage Dashboard with Quick Actions and Team Overview (Priority: P2)

As a team owner or member, I want a dashboard homepage that shows my team information, provides quick actions for common tasks, and displays team members so I can access frequently-used features quickly.

**Why this priority**: Central hub for team-based workflows. Important for team collaboration but not as critical as individual kart management (P1). Can be enhanced after core kart functionality is stable.

**Independent Test**: Can be tested by navigating to `/dashboard` and verifying team information, quick action cards, and team member list display correctly. Delivers value through centralized access to common workflows.

**Acceptance Scenarios**:

1. **Given** I'm a team member, **When** I navigate to `/dashboard`, **Then** I see my team name and creation date prominently displayed
2. **Given** viewing the dashboard, **When** looking at quick actions, **Then** I see buttons/cards for "Add New Part", "Log Session", and other common tasks
3. **Given** viewing the dashboard, **When** looking at team members section, **Then** I see a list of current team members with their roles
4. **Given** I'm a team admin, **When** viewing the dashboard, **Then** I see an "Invite Member" section/button to add new team members
5. **Given** no team exists, **When** viewing the dashboard, **Then** I see an empty state with instructions to create or join a team

---

### User Story 5 - Manage Parts Inventory (Priority: P3)

As a user, I want to view and manage my parts inventory so I can track what parts I have available and when they were last used or installed.

**Why this priority**: Supplementary feature that enhances maintenance tracking but is not essential for core kart management. Can be added incrementally after P1-P2 features are complete.

**Independent Test**: Can be tested independently by navigating to parts section and verifying list view, add/edit/delete operations, and part categorization work correctly. Delivers inventory management value.

**Acceptance Scenarios**:

1. **Given** I have parts in inventory, **When** I navigate to `/parts`, **Then** I see a list of all parts with names, categories, and quantities
2. **Given** viewing parts list, **When** I click "Add New Part", **Then** a form opens to add part details (name, category, quantity, notes)
3. **Given** viewing a part, **When** I click edit, **Then** I can update part information
4. **Given** viewing parts, **When** parts are organized by category, **Then** I can filter or group by category (engine parts, chassis parts, consumables, etc.)
5. **Given** no parts exist, **When** viewing inventory, **Then** I see an empty state encouraging me to add first part

---

### User Story 6 - Log and View Session History (Priority: P3)

As a user, I want to log racing sessions and view session history so I can track when karts were used and correlate usage with maintenance schedules.

**Why this priority**: Nice-to-have feature that provides historical context for maintenance but is not required for basic maintenance tracking. Can be developed after core features are stable.

**Independent Test**: Can be tested by creating sessions, logging session data, and viewing session history. Delivers value through usage tracking and historical analysis.

**Acceptance Scenarios**:

1. **Given** I want to log a session, **When** I navigate to `/sessions/new`, **Then** I see a form to enter session details (date, kart, duration, notes)
2. **Given** sessions have been logged, **When** I view session history, **Then** I see a chronological list of sessions with dates, karts used, and key metrics
3. **Given** viewing session history, **When** clicking on a session, **Then** I see detailed session information
4. **Given** no sessions logged, **When** viewing session history, **Then** I see an empty state with "Log First Session" call-to-action

---

### User Story 7 - Shopping List for Maintenance Needs (Priority: P3)

As a user, I want to create and manage a shopping list for parts and supplies needed for upcoming maintenance so I can plan purchases and ensure I have necessary items.

**Why this priority**: Workflow enhancement that improves maintenance planning but is not critical for core functionality. Can be added as a polish feature.

**Independent Test**: Can be tested by adding items to shopping list, marking items as purchased, and viewing the list. Delivers planning and organizational value.

**Acceptance Scenarios**:

1. **Given** I need to purchase parts, **When** I navigate to `/shopping`, **Then** I see my current shopping list with items, quantities, and status (needed/purchased)
2. **Given** viewing shopping list, **When** I click "Add Item", **Then** I can enter item details to add to the list
3. **Given** items on shopping list, **When** I mark an item as purchased, **Then** it visually indicates completion or moves to "purchased" section
4. **Given** empty shopping list, **When** viewing the page, **Then** I see an empty state with prompt to add first item

---

### Edge Cases

- What happens when a kart has no engine hours logged? (Display 0.0 hours with "No usage yet" indicator, show all maintenance as "Ready")
- How does the system handle karts with partial specification data? (Display available fields, show placeholders for missing data like "Not specified")
- What happens when maintenance history table has many tasks? (Paginate or use "View All" link to show complete history on separate page)
- How does navigation handle very long team names or kart names? (Truncate with ellipsis, show full name on hover)
- What happens when images fail to load (user avatars, part images)? (Show fallback placeholders with user initials or generic icons)
- How does the system handle switching teams? (Provide team selector if user is member of multiple teams, persist selection)
- What happens on mobile when header search is not visible? (Provide search icon that expands search bar or opens search modal)
- How does the layout adapt to very small mobile screens (320px)? (Stack all grid layouts to single column, collapse sidebar content, simplify header)

## Requirements *(mandatory)*

### Functional Requirements

**Global Layout & Navigation**

- **FR-001**: System MUST provide consistent header across all pages with logo/brand, search functionality, notifications icon, and user profile avatar
- **FR-002**: System MUST provide persistent footer navigation with links to Dashboard, Karts, Inventory, and Team sections
- **FR-003**: System MUST visually indicate the current active section in navigation (bold text, color accent, underline, or indicator bar)
- **FR-004**: System MUST implement responsive navigation that adapts for mobile (<768px), tablet (768-1024px), and desktop (>1024px) screens
- **FR-005**: Navigation MUST persist across all authenticated pages
- **FR-006**: System MUST provide working search functionality in header for finding karts quickly
- **FR-007**: User avatar in header MUST provide access to profile menu/settings

**Karts List View (`/karts`)**

- **FR-008**: System MUST display all user's karts in a responsive grid (1 column mobile, 2 columns tablet, 2-3 columns desktop)
- **FR-009**: Each kart card MUST show kart name/number, status badge (Ready/Due Soon/Overdue), and key metrics (engine hours, pending tasks)
- **FR-010**: Kart cards MUST use consistent status color coding: green for Ready, yellow/orange for Due Soon, red for Overdue
- **FR-011**: System MUST provide "Add Kart" button prominently at top of page
- **FR-012**: Empty state MUST display when no karts exist with prominent "Add Your First Kart" call-to-action
- **FR-013**: Kart cards MUST be clickable to navigate to kart detail page
- **FR-014**: System MUST display summary statistics at bottom of page (total karts, total hours, active karts)

**Kart Detail View (`/karts/[id]`)**

- **FR-015**: Detail page header MUST display kart name, number, specifications (chassis, engine, tires), status badge, and location
- **FR-016**: System MUST provide "Edit Specs" and "Log Work" primary action buttons in header
- **FR-017**: Engine Service Status section MUST display current hours vs. maximum hours, visual progress bar, and percentage remaining
- **FR-018**: System MUST support **customizable** service component trackers per kart (e.g., user can add "Piston", "Chain", "Tires" with specific max hour intervals for that kart)
- **FR-019**: Component status indicators MUST use color coding: green for Good, yellow/orange for Due Soon, red for Overdue
- **FR-020**: System MUST provide quick action buttons: "Reset Piston Timer", "Update Gearbox Oil", "Log Meter Hours"
- **FR-021**: Recent Maintenance section MUST display recent tasks in table with columns: Task, Technician, Date, Status, Action
- **FR-022**: Maintenance tasks MUST show status badges (Done, Pending, In Progress) with appropriate color coding
- **FR-023**: System MUST support **linking** tasks to service components, where completing the task automatically resets the associated component timer (e.g., "Replace Piston" task resets "Piston Life" tracker)
- **FR-024**: System MUST provide "View All History" link to access complete maintenance log
- **FR-025**: Right sidebar MUST display Kart Stats panel with: last session best, gear ratio, main jet, total distance, tire heat cycles
- **FR-026**: Right sidebar MUST display Recent Parts panel showing 3-4 most recent part replacements with icons and timestamps
- **FR-027**: Recent Parts panel MUST include "Log Part Replacement" action button
- **FR-028**: Detail page layout MUST use responsive design: sidebar below main content on mobile, sidebar on right for desktop

**Dashboard View (`/dashboard`)**

- **FR-029**: Dashboard MUST display team name and creation date prominently
- **FR-030**: System MUST provide Quick Actions cards/section with links to common tasks (Add Part, Log Session, etc.)
- **FR-031**: Dashboard MUST display Team Members section showing all members with their roles
- **FR-032**: Team admins MUST see "Invite Member" functionality on dashboard
- **FR-033**: Empty state MUST display when user has no team with instructions to create/join
- **FR-034**: Dashboard layout MUST be responsive with cards stacking on mobile

**Parts Management (`/parts`)**

- **FR-035**: Parts page MUST display list of all parts with name, category, and relevant metadata
- **FR-036**: System MUST provide "Add New Part" button/form
- **FR-037**: Parts MUST support categorization (engine parts, chassis parts, consumables, etc.)
- **FR-038**: Each part MUST support edit and delete operations
- **FR-039**: Empty state MUST display when no parts exist with "Add First Part" call-to-action

**Sessions Management (`/sessions`)**

- **FR-040**: Sessions page MUST allow logging new sessions with date, kart selection, duration, and notes
- **FR-041**: System MUST display chronological list of logged sessions
- **FR-042**: Session list MUST show date, kart used, duration, and key metrics for each session
- **FR-043**: Empty state MUST display when no sessions logged

**Shopping List (`/shopping`)**

- **FR-044**: Shopping list page MUST display all shopping items with name, quantity, and status
- **FR-045**: System MUST allow adding new items to shopping list
- **FR-046**: Items MUST support marking as "purchased" or completed
- **FR-047**: Empty state MUST encourage users to add first item

**Visual Design System**

- **FR-048**: System MUST use consistent color palette throughout:
  - Primary: #3B82F6 (blue)
  - Status Good/Ready: #22C55E (green)
  - Status Due/Warning: #EF4444 (red) or yellow/orange for "Due Soon"
  - Status Info: #0EA5E9 (light blue)
  - Backgrounds: #F5F7FA (light gray), #FFFFFF (white), #F9FAFB (subtle gray)
  - Text: #1F2937 (dark), #6B7280 (subtle/secondary)
  - Borders: #E5E7EB (light gray)
- **FR-049**: System MUST use Inter font family consistently across all text elements
- **FR-050**: UI components MUST use consistent border radius: default 0.25rem, lg 0.5rem, xl 0.75rem, full for circles
- **FR-051**: Cards MUST have consistent styling: white background, border with #E5E7EB, subtle shadow, rounded corners
- **FR-052**: Buttons MUST follow two-tier hierarchy:
  - Primary: filled with primary blue color (#3B82F6), white text, shadow
  - Secondary: outlined or light gray background with border
- **FR-053**: All icons MUST use Material Symbols icon library for consistency
- **FR-054**: Interactive elements MUST provide hover states (brightness change, color transition, shadow adjustment)
- **FR-055**: System MUST use consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px multiples)

**Forms & Modals**

- **FR-056**: All forms MUST have clear labels, placeholders, and validation messages
- **FR-057**: Modal dialogs MUST have consistent styling with header, body, and action buttons
- **FR-058**: Forms MUST show loading states during submission
- **FR-059**: Forms MUST display clear success/error feedback after submission

**Responsive Behavior**

- **FR-060**: System MUST support mobile-first responsive design with breakpoints:
  - Mobile: < 768px (single column layouts)
  - Tablet: 768px - 1024px (2-column grids)
  - Desktop: > 1024px (multi-column grids, sidebars)
- **FR-061**: Grid layouts MUST collapse to single column on mobile devices
- **FR-062**: Sidebar content MUST stack below main content on mobile/tablet
- **FR-063**: Header search MAY collapse to icon on mobile with expandable search bar
- **FR-064**: Tables MUST adapt responsively (card view on mobile, table on desktop)

### Non-Functional Requirements

#### Security & Privacy

- **SEC-001**: System MUST enforce authentication for all pages except login/public routes
- **SEC-002**: System MUST restrict data access based on team membership (users only see their team's data)
- **SEC-003**: System MUST validate all user inputs to prevent XSS and injection attacks
- **SEC-004**: User role permissions MUST be enforced (team admins have additional capabilities)

#### Performance & Scalability

- **PERF-001**: Pages MUST load and render within 2 seconds on standard mobile network (3G)
- **PERF-002**: Server-side rendering or static generation MUST be used where possible to improve initial load time
- **PERF-003**: Images MUST be optimized (compressed, appropriately sized, lazy loaded where applicable)
- **PERF-004**: List views MUST support pagination or infinite scroll for large datasets (>100 items)
- **PERF-005**: Page transitions MUST feel instant with optimistic UI updates

#### Accessibility

- **A11Y-001**: All status indicators MUST not rely solely on color (include text labels, icons, or patterns)
- **A11Y-002**: All interactive elements MUST be keyboard navigable with visible focus indicators
- **A11Y-003**: All icons MUST have appropriate aria-labels or titles for screen readers
- **A11Y-004**: Form inputs MUST have associated labels and error messages announced to assistive technologies
- **A11Y-005**: Color contrast MUST meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
- **A11Y-006**: Heading hierarchy MUST be semantic (h1, h2, h3 in proper order)
- **A11Y-007**: Focus management MUST be appropriate for modals and dynamic content

#### Usability

- **UX-001**: Visual hierarchy MUST prioritize critical information (status, urgent actions) over supplementary data
- **UX-002**: Empty states MUST provide clear, actionable guidance on next steps
- **UX-003**: Error messages MUST be specific, helpful, and suggest corrective actions
- **UX-004**: Loading states MUST be clear with spinners, skeletons, or progress indicators
- **UX-005**: Success feedback MUST be immediate and noticeable (toasts, inline messages, visual confirmations)

#### Consistency

- **CONS-001**: All pages MUST use the same design system (colors, typography, spacing, components)
- **CONS-002**: Component patterns MUST be reusable across different pages (card layouts, navigation, form styles)
- **CONS-003**: Interaction patterns MUST be consistent (button behaviors, form submissions, navigation)

### Key Entities

- **Kart**: Racing kart with specifications (number, name, chassis, engine, tires), total engine hours, status, location
- **ServiceComponent**: Trackable maintenance component (engine, piston, gearbox oil) with current hours, maximum threshold, calculated status
- **MaintenanceTask**: Work item with description, assigned technician, scheduled/completed date, status
- **PartReplacement**: Part installation record with part name, category, installation date
- **KartStatistics**: Performance metrics (lap times, gear ratios, distances, tire cycles, jet settings)
- **Session**: Racing session record with date, kart used, duration, notes, potentially lap times
- **Part**: Inventory item with name, category, quantity, notes
- **ShoppingItem**: Shopping list entry with item name, quantity, purchase status
- **Team**: Group entity with name, creation date, member roster
- **TeamMember**: User within team with assigned role (admin, member)

## Success Criteria *(mandatory)* ### Measurable Outcomes

- **SC-001**: Users can identify kart maintenance status within 5 seconds on either list view or detail view
- **SC-002**: All pages load and display content in under 2 seconds on mobile devices (3G network)
- **SC-003**: 95% of users can successfully navigate between all primary sections (Dashboard, Karts, Inventory, Teams) without confusion
- **SC-004**: 90% of users can complete common tasks (add kart, log hours, add part) without requiring documentation
- **SC-005**: Time to complete maintenance logging reduces by 40% compared to previous interface
- **SC-006**: Application maintains visual consistency across all pages with 100% adoption of design system colors, typography, and component patterns
- **SC-007**: All interactive elements meet WCAG 2.1 AA contrast ratio requirements (4.5:1 normal text, 3:1 large text)
- **SC-008**: Application remains fully functional across modern browsers (Chrome, Firefox, Safari, Edge) and mobile devices (iOS 14+, Android 10+)
- **SC-009**: Users report 80%+ satisfaction with new UI/UX design in post-launch surveys
- **SC-010**: Zero critical accessibility violations when tested with automated tools (axe, Lighthouse)
- **SC-011**: Mobile users can access all features available on desktop (feature parity across viewports)
- **SC-012**: Page navigations feel instant with perceived load time under 500ms through optimistic routing
