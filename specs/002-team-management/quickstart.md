# Quickstart: Team Management

## Prerequisites

- **Firebase Project**: Configured with Authentication and Firestore.
- **Environment**: `.env.local` must contain Firebase config keys.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`.
4. Sign in (using email/password or Google).
5. Navigate to `/teams`.

## Verification Steps

### 1. Team Creation
- Go to `/teams` -> Click "Create Team".
- Enter Name: "My Kart Team".
- Click "Create".
- **Expectation**: Redirect to `/teams/[teamId]` (Overview). You are the Owner.

### 2. Invitations
- On Team Overview, find "Invite Link".
- Copy the link (e.g., `/invite/ABC12345`).
- Open a new Incognito window or different browser.
- Sign in as a **different user**.
- Paste the Invite Link.
- Click "Request to Join".
- **Expectation**: Success message "Request sent".

### 3. Approval
- Go back to the **Owner's window**.
- Refresh or check "Manage Members".
- See the pending request.
- Click "Approve".
- **Expectation**: Member status changes to `active`.

### 4. Shared Lists
- As **Member**, go to "To Do" list.
- Add "Check tire pressure".
- **Expectation**: Item appears.
- As **Owner**, refresh or check list.
- **Expectation**: "Check tire pressure" is visible. Mark it as done.

### 5. Chat
- As **Owner**, type "Welcome to the team" in chat.
- **Expectation**: Message appears instantly.
- As **Member**, verify message visibility.

## Security Checks
- Try to access `/teams/[teamId]` with a non-member account. **Expectation**: Access Denied / Redirect.
- Try to delete the team as a non-owner Admin. **Expectation**: Button hidden or Action fails.
