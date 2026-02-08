/**
 * Firebase Initialization with Offline Persistence
 * Feature: 004-maintenance-core
 * 
 * Initializes Firestore with offline persistence enabled for offline-first functionality
 */

import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase app (singleton pattern)
 */
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Initialize Firestore with offline persistence
 * 
 * Configuration:
 * - persistentLocalCache: Enables offline data persistence
 * - persistentMultipleTabManager: Allows multiple tabs to share the same cache
 * 
 * This ensures that:
 * 1. CRUD operations work without internet connection
 * 2. Changes sync automatically when connection restored
 * 3. Query results are cached for instant reads
 */
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

/**
 * Get current user ID
 * TODO: Replace with actual Firebase Auth when feature 002 is integrated
 */
export function getCurrentUserId(): string {
    // For MVP, use a consistent local user ID
    // This will be replaced with Firebase Auth user ID in the team management feature
    const localUserId = 'local-user-001';

    if (typeof window !== 'undefined') {
        // Store in localStorage for consistency across sessions
        const storedUserId = localStorage.getItem('kartlog_user_id');
        if (!storedUserId) {
            localStorage.setItem('kartlog_user_id', localUserId);
        }
        return storedUserId || localUserId;
    }

    return localUserId;
}
