/**
 * Firebase Initialization with Offline Persistence
 * Feature: 004-maintenance-core
 * 
 * Initializes Firestore with offline persistence enabled for offline-first functionality
 */

import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
export const auth = getAuth(app);

let db: import('firebase/firestore').Firestore;

try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
} catch (e) {
    // If Firestore is already initialized (e.g. during HMR), use the existing instance
    db = getFirestore(app);
}

export { db };

/**
 * Get current user ID from Firebase Auth
 */
export function getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User must be authenticated to access this resource');
    }
    return user.uid;
}
