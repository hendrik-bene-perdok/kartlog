# Research: Require Authentication

**Feature**: `005-require-auth`  
**Date**: 2026-02-11

## Decisions

### 1. Authentication Middleware Strategy
- **Decision:** Use Next.js Middleware with `firebase-admin` (Edge-compatible) or cookie session verification to protect `/app` routes.
- **Rationale:** 
  - Standard pattern for Next.js 14+.
  - `firebase-admin` is now verified installed.
  - Prevents "content flash" by handling redirect server-side (at Edge).
- **Alternatives Considered:**
  - *Client-side `useEffect` check:* Simpler but causes UI flash and poor UX.
  - *Server Components check:* Good, but middleware covers all assets/routes more broadly.

### 2. Route Structure
- **Decision:** Move all protected routes to `src/app/app/`.
- **Rationale:**
  - Clearly separates public (`/`) vs private space.
  - Simplifies middleware matcher configuration (`matcher: ['/app/:path*']`).
- **Dependencies:**
  - Need to update all internal links.

## Outstanding Questions (Resolved)
- **Q:** Can we use `firebase-admin` in Edge Middleware?
- **A:** Standard `firebase-admin` is Node.js only. We might need `firebase-admin/app` or just standard cookie verification.
- **Refinement:** We will use a session cookie managed by the login flow, verified by middleware. The official Firebase pattern for Next.js often uses `next-firebase-auth-edge` or similar, but for now we'll stick to a custom middleware checking for a `__session` cookie if standard auth is used, or just checking for the token.
- **Correction:** Since `firebase-admin` is fully Node.js, we cannot use it directly in Edge Middleware.
- **Revised Strategy:**
  1. Login page sets a secure cookie (via Server Action or API Route) upon successful Firebase client-side login.
  2. Middleware checks for existence/validity of this cookie.
  3. *Simplification:* For MVP, we can check for a simple "auth marker" cookie set by the client on login, and do full verification in step 1 of the layout. Or efficiently, use `firebase/auth` REST API in middleware if needed, but cookie is standard.
  4. **Chosen Approach:** Client sets `__session` cookie on login. Middleware checks for it.
