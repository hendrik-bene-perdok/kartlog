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
// KARTS_COLLECTION removed as we construct path dynamically

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

    // Sort in memory
    return logs.sort((a, b) => b.loggedAt.seconds - a.loggedAt.seconds);
}

/**
 * Get last session for a kart
 */
export async function getLastSession(kartId: string): Promise<SessionLog | null> {
    const userId = getCurrentUserId();
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId),
        where('userId', '==', userId),
        orderBy('loggedAt', 'desc')
        // limit(1) - avoiding limit due to index requirements potentially
    );

    const snapshot = await getDocs(sessionsQuery);
    if (snapshot.empty) return null;
    
    // Manual sort if not using efficient orderBy limit
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));
    docs.sort((a, b) => b.loggedAt.seconds - a.loggedAt.seconds);
    
    return docs[0];
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
 * @param teamId - Team ID (for finding the kart)
 * @param kartId - Kart ID
 * @param durationMinutes - Session duration in minutes
 * @param notes - Optional session notes
 * @returns Created session log
 */
export async function createSessionLog(
    teamId: string,
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
        // Point to the correct Kart document path
        const kartRef = doc(db, 'teams', teamId, 'karts', kartId);
        const kartDoc = await transaction.get(kartRef);

        if (!kartDoc.exists()) {
            throw new Error('Kart not found');
        }

        const currentHours = kartDoc.data().totalEngineHours || 0;
        const newTotal = currentHours + durationHours;

        // Create session log ref
        const newSessionRef = doc(collection(db, SESSIONS_COLLECTION));
        
        // Writes
        transaction.set(newSessionRef, sessionLogData);
        transaction.update(kartRef, { 
            totalEngineHours: newTotal,
            updatedAt: now
        });

        return newSessionRef.id;
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

