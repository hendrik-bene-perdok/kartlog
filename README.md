# Kartlog MVP

> A Progressive Web App for tracking karting parts inventory and track sessions.

## Features

- **Authentication**: Google OAuth login with automatic "Personal Team" creation
- **Parts Inventory**: Manage engines, chassis, and tires with status tracking
- **Session Logging**: Record track sessions with setup details (tire pressure, weather)
- **Offline Support**: Full offline functionality with automatic sync
- **PWA**: Install on mobile devices for native-like experience

## Tech Stack

- **Frontend**: Next.js 16 (React 19) + TypeScript + Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **PWA**: @ducanh2912/next-pwa
- **Testing**: Vitest (Unit) + Playwright (E2E)

## Prerequisites

- **Node.js**: v18.17.0+ (LTS recommended)
- **pnpm**: v9+ (or npm/yarn)
- **Firebase CLI**: `npm install -g firebase-tools`

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd kartlog
pnpm install
```

### 2. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Setup Firebase

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Authentication in Firebase Console
3. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages)
│   ├── login/           # Authentication
│   ├── dashboard/       # Team overview
│   ├── parts/           # Parts inventory
│   └── sessions/        # Session logging
├── components/          # React components
│   ├── auth/           # PrivateRoute
│   ├── layout/         # MainLayout + Nav
│   ├── parts/          # Part forms & cards
│   ├── sessions/       # Session forms & items
│   ├── teams/          # Team management
│   ├── providers/      # AuthProvider
│   └── ui/             # Shared UI (OfflineIndicator, etc.)
├── hooks/              # Custom React hooks (useParts, useSessions)
├── lib/                # Firebase config & helpers
└── types/              # TypeScript interfaces

tests/
├── e2e/                # Playwright tests
└── unit/               # Vitest tests
```

## Testing

### Unit Tests
```bash
pnpm test
pnpm test:coverage   # With coverage report
```

### E2E Tests
```bash
pnpm test:e2e
pnpm test:e2e:ui    # Interactive UI mode
```

## Deployment

### Build
```bash
pnpm build
```

### Deploy to Firebase Hosting
```bash
firebase deploy
```

### Alternative: Vercel
Push to GitHub and connect to Vercel for automatic deployments.

## Development Guidelines

- **TypeScript**: Strict mode enabled
- **Linting**: Run `pnpm lint` before committing
- **Security**: All data access enforced via Firestore Security Rules
- **Offline**: Firestore offline persistence enabled by default

## Key Features

### Parts Management
- Add engines (with hours tracking and rebuild dates)
- Add chassis (with model year and setup notes)
- Add tires (with compound and condition tracking)
- Filter by status: Active, Maintenance, Retired

### Session Logging
- Record track name and date
- Log weather conditions (temperature, conditions)
- Track tire pressure (FL/FR/RL/RR)
- Add session notes and observations

### Maintenance Core (New!)
- **Garage**: Manage multiple karts with maintenance status indicators
- **Engine Hours**: Log operating hours with automatic accumulation
- **Auto-Tasks**: Maintenance tasks created automatically based on engine hours
- **Shopping**: Track parts to buy with photo attachments (compressed offline)
- **Tasks**: Priority-based maintenance to-do list with swipe actions


### Offline Mode
- All data cached locally via IndexedDB
- Visual offline indicator banner
- Automatic sync when connection restored
- Optimistic UI updates

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and coding standards.

## License

MIT
