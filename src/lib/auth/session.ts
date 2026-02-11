/**
 * Session Management Utilities
 * Feature: 005-require-auth
 * 
 * Manages the client-side session marker cookie used by the middleware.
 */

const SESSION_COOKIE_NAME = '__session';

/**
 * Sets the session cookie to signal the middleware that the user is authenticated.
 * This is a lightweight marker. The actual security is enforced by Firebase Auth 
 * on the client and Firestore Rules on the backend.
 * 
 * @param user The Firebase User object (currently unused but kept for interface consistency)
 */
export function startSession(user: any) {
    // Set a cookie that expires in 14 days (typical persistent session length)
    // Note: We are setting this client-side.
    // For production with stricter security, this should be an HTTP-only cookie set by a Server Action.
    // However, for this MVP and Firebase client-side auth pattern, a client-visible cookie 
    // is sufficient for the middleware to know "should I let them in?".
    const days = 14;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();

    // We set a simple "true" flag. Middleware just checks existence.
    // Secure flag is important, but localhost might not be https.
    // We add SameSite=Lax for general security.
    document.cookie = `${SESSION_COOKIE_NAME}=true${expires}; path=/; SameSite=Lax`;
}

/**
 * Clears the session cookie to signal the middleware that the user is logged out.
 */
export function endSession() {
    document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

/**
 * Checks if the session cookie exists (client-side helper)
 */
export function hasSession(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some((item) => item.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}
