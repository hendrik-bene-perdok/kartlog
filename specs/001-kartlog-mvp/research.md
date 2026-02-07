# Research & Technical Decisions: Kartlog MVP

## 1. Architecture: Serverless PWA
**Decision:** use **Next.js** (Frontend) + **Firebase** (Backend-as-a-Service) + **PWA** (Offline).
**Rationale:**
- **Offline Requirement**: PWA with Service Workers and IndexedDB is the standard web approach. Next.js has excellent PWA plugins (`@ducanh2912/next-pwa` or similar).
- **Speed to Market**: Firebase provides Auth, Database (Firestore), and Hosting out of the box, reducing infrastructure work.
- **Realtime/Sync**: Firestore has built-in offline persistence and synchronization, solving the hardest part of the "offline sync" requirement.

## 2. Database: Firestore (NoSQL)
**Decision:** **Cloud Firestore**.
**Rationale:**
- **Flexible Schema**: Perfect for "Polymorphic" parts (Engines vs Tires have different fields).
- **Offline SDK**: Native support for local caching and background/online sync.
- **Security**: Granular security rules allow "Owner vs Member" logic without a custom backend.

## 3. Styling: Tailwind CSS
**Decision:** **Tailwind CSS**.
**Rationale:**
- **Mobile-First**: Utility classes make responsive design significantly faster.
- **Standard**: Industry standard for React/Next.js ecosystem.
- **Performance**: Zero runtime overhead, small CSS bundle.

## 4. State Management
**Decision:** **React Context + Firebase Hooks**.
**Rationale:**
- **Server State**: Managed by Firebase SDK (subscription listeners).
- **Client State**: Minimal global state needed (mostly UI state), can use React Context or lightweight store like Zustand if needed. For MVP, Context + Hooks is likely sufficient.

## 5. Testing Strategy
**Decision:** **Vitest** (Unit/Integration) + **Playwright** (E2E).
**Rationale:**
- **Vitest**: Fast, compatible with Vite/Next.js ecosystem.
- **Playwright**: Reliable E2E testing for PWA features (offline mode simulation).

## 6. Project Structure (Next.js App Router)
**Decision:** Standard **App Router** structure.
- `app/`: Routes and Pages.
- `components/`: UI building blocks.
- `lib/`: Firebase init, helper functions.
- `hooks/`: Custom hooks for data access (encapsulating Firebase logic).
- `types/`: TypeScript definitions (Data Model).
