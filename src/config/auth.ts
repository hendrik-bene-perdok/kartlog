export const AUTH_CONFIG = {
    // Set to false to enable Dev Login button and bypass Google Auth
    ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== 'true',
    // The ID used for the dev user - matches Firestore rules bypass
    DEV_USER_ID: 'local-user-001'
};
