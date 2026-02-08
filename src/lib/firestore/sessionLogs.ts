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
export async function getSessionLogs(kartId: string): Promise<SessionLog[]> {
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        orderBy('loggedAt', 'desc')
    );

    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));
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

    const sessionLogData = {
        kartId,
        userId,
        durationMinutes,
        durationHours,
        notes: notes || undefined,
        loggedAt: now,
        createdAt: now,
    };

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

    return { id: sessionLogId, ...sessionLogData };
}

/**
 * Get total session count for a kart
 */
export async function getSessionCount(kartId: string): Promise<number> {
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId)
    );

    const snapshot = await getDocs(sessionsQuery);
    return snapshot.size;
}

/**
 * Get most recent session for a kart
 */
export async function getLastSession(kartId: string): Promise<SessionLog | null> {
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        orderBy('loggedAt', 'desc')
    );

    const snapshot = await getDocs(sessionsQuery);

    if (snapshot.empty) {
        return null;
    }

    const firstDoc = snapshot.docs[0];
    return { id: firstDoc.id, ...firstDoc.data() } as SessionLog;
}
