# Quickstart: Kartlog MVP

## Prerequisites

- **Node.js**: v18.17.0+ (LTS)
- **npm** or **pnpm** (preferred)
- **Firebase CLI**: `npm install -g firebase-tools`

## Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd kartlog
   pnpm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Firebase Emulators (Local Backend)**:
   Start the local Firestore and Auth emulators:
   ```bash
   firebase emulators:start
   ```
   *Note: Ensure `firebase.json` is configured for emulators.*

4. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Testing

- **Unit Tests**:
  ```bash
  pnpm test
  ```

- **E2E Tests**:
  ```bash
  pnpm test:e2e
  ```

## Deployment

1. **Build**:
   ```bash
   pnpm build
   ```

2. **Deploy via Firebase**:
   ```bash
   firebase deploy
   ```
   *Or push to GitHub for connected Vercel/Firebase Hosting CI/CD.*
