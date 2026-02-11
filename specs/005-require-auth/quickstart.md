# Quickstart: Require Authentication

**Feature**: `005-require-auth`  
**Date**: 2026-02-11

## Overview

This guide explains how to authenticate effectively with the new protected route structure.

## New Application Structure

The application is now split:

- **Public**: `http://localhost:3000/` (Landing Page)
- **Protected**: `http://localhost:3000/app` (Application Dashboard)

## How to Test

### 1. New User / Unauthenticated
1. Visit `http://localhost:3000/`. You should see the Landing Page.
2. Try visiting `http://localhost:3000/app`. You should be redirected to `/login`.

### 2. Login Flow
1. Visit `/login` or click "Login" from the Landing Page.
2. Sign in with Google or Email.
3. Upon success, you are redirected to `/app`.

### 3. Verify Persistence
1. Close the tab or browser.
2. Reopen `http://localhost:3000/app`.
3. You should remain logged in.

## Development Notes

- **Middleware**: Located at `src/middleware.ts`. Handles redirects.
- **Session**: Uses a client-side set cookie `session` on login to hint middleware.
- **Logout**: Ensure you clear cookies on logout to trigger redirection.
