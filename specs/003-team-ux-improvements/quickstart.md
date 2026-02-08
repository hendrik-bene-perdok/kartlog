# QuickStart Guide: Team UX Improvements

**Feature**: Unified Team Dashboard & Mobile Nav
**Branch**: `003-team-ux-improvements`
**Command**: `npm run dev`

This feature consolidates team collaboration (Lists, Chat, Members) into a single unified dashboard and improves mobile navigation.

## Setup

1. **Checkout Branch**:
   ```bash
   git checkout -b 003-team-ux-improvements
   ```
2. **Install Dependencies**:
   (No new packages required)

## Key Components

- **`src/app/(authenticated)/teams/[teamId]/page.tsx`**: The main entry point for the new Team Dashboard.
- **`src/components/layout/BottomNav.tsx`**: New persistent navigation for mobile.
- **`src/components/features/teams/TeamTabs.tsx`**: Reusable tab container for Chat/Lists/Members.
- **`src/components/features/teams/InviteButton.tsx`**: New invite action component.

## Testing Steps

1. **Verify Mobile Navigation**:
   - Open app on small screen (Chrome DevTools -> Mobile View).
   - Confirm Bottom Navigation appears.
   - Click "Teams", "Dashboard", "Parts" to verify routing.

2. **Verify Unified Dashboard**:
   - Go to a Team.
   - See Tabs: Chat | Lists | Members.
   - Click "Lists". Should see Todo/Shopping items.
   - Toggle Filter: Look for active/completed items.

3. **Verify Invite**:
   - Click "Invite" button (as Owner).
   - Copy Link.
   - Verify code expiration logic (requires creating a code and waiting/mocking time).

## Deployment

- **Firestore Rules**: Ensure updated rules (deployed in previous step) allow reading Invite Codes.
- **Indexes**: Check for index alerts in console when filtering lists.
