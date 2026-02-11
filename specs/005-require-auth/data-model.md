# Data Model: Require Authentication

**Feature**: `005-require-auth`  
**Date**: 2026-02-11

## Overview

No structural changes to Firestore schema are required for this feature.
Authentication data (users, teams) already exists.

## Session Model

### Authentication Marker (Browser Cookie)

This cookie is used by the middleware for fast access decisions.

| Attribute | Type | Description |
|-----------|------|-------------|
| `__session` | `string` | Contains the user's Firebase ID Token or a lightweight session marker. |
| `path` | `string` | `/` (entire domain) |
| `secure` | `boolean` | `true` |
| `httpOnly` | `boolean` | `true` (if set by server) or `false` (if set by client for simple marker) |

*Decision:* For MVP simplicity and cross-runtime compatibility, we will use a client-side set cookie `auth_token` (or `__session`) to signal "probably logged in" to the middleware, while the actual security is enforced by Firestore Rules and API route checks using the ID token. The middleware is primarily for UX redirection, not hard security (which remains at data access layer).

---

## Entity Relationships

No changes.
