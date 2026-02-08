/**
 * SessionLog Repository
 * Feature: 004-maintenance-core
 * 
 * Firestore CRUD operations for session logs with transaction support
 * for atomic hour updates on kart documents
 */

import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    runTransaction
} from 'firebase/firestore';
import { db, getCurrentUserId } from '../firebase/init';
import type { SessionLog } from '@/types/maintenance';

const SESSIONS_COLLECTION = 'sessionLogs';
const KARTS_COLLECTION = 'karts';

/**
 * Get session logs for a specific kart
 * 
 * @param kartId - Kart ID
 * @returns Array of session logs ordered by logged date (newest first)
 */
/**
 * Get session logs for a specific kart
 * 
 * @param kartId - Kart ID
 * @returns Array of session logs ordered by logged date (newest first)
 */
export async function getSessionLogs(kartId: string): Promise<SessionLog[]> {
    const userId = getCurrentUserId();
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(sessionsQuery);
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));

    // Sort in memory to avoid composite index requirement
    return logs.sort((a, b) => b.loggedAt.seconds - a.loggedAt.seconds);
}

/**
 * Create session log with atomic kart hour update
 * 
 * CRITICAL: Uses Firestore transaction to atomically:
 * 1. Create session log document
 * 2. Update kart totalEngineHours
 * 
 * This prevents race conditions if multiple sessions logged simultaneously
 * 
 * @param kartId - Kart ID
 * @param durationMinutes - Session duration in minutes
 * @param notes - Optional session notes
 * @returns Created session log
 */
export async function createSessionLog(
    kartId: string,
    durationMinutes: number,
    notes?: string
): Promise<SessionLog> {
    const userId = getCurrentUserId();
    const durationHours = durationMinutes / 60;
    const now = Timestamp.now();

    const sessionLogData: Record<string, any> = {
        kartId,
        userId,
        durationMinutes,
        durationHours,
        loggedAt: now,
        createdAt: now,
    };

    if (notes) {
        sessionLogData.notes = notes;
    }

    // Use transaction to atomically update both session log and kart hours
    const sessionLogId = await runTransaction(db, async (transaction) => {
        const kartRef = doc(db, KARTS_COLLECTION, kartId);
        const kartDoc = await transaction.get(kartRef);

        if (!kartDoc.exists()) {
            throw new Error('Kart not found');
        }

        const currentHours = kartDoc.data().totalEngineHours || 0;
        const newTotal = currentHours + durationHours;

        // Update kart total hours
        transaction.update(kartRef, {
            totalEngineHours: newTotal,
            updatedAt: now,
        });

        // Create session log
        const sessionLogRef = doc(collection(db, SESSIONS_COLLECTION));
        transaction.set(sessionLogRef, sessionLogData);

        return sessionLogRef.id;
    });

    return { id: sessionLogId, ...sessionLogData } as SessionLog;
}

/**
 * Get total session count for a kart
 */
export async function getSessionCount(kartId: string): Promise<number> {
    const userId = getCurrentUserId();
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(sessionsQuery);
    return snapshot.size;
}

/**
 * Get most recent session for a kart
 */
export async function getLastSession(kartId: string): Promise<SessionLog | null> {
    const userId = getCurrentUserId();
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(sessionsQuery);

    if (snapshot.empty) {
        return null;
    }

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));
    // Sort in memory to find newest
    logs.sort((a, b) => b.loggedAt.seconds - a.loggedAt.seconds);

    return logs[0];
}
