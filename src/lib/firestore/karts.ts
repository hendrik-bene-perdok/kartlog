/**
 * Kart Repository
 * Feature: 004-maintenance-core
 * 
 * Firestore CRUD operations for K art entities with cascade delete support
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db, getCurrentUserId } from '../firebase/init';
import type { Kart, MaintenanceThreshold } from '@/types/maintenance';
import { DEFAULT_MAINTENANCE_THRESHOLDS } from '@/types/maintenance';

const KARTS_COLLECTION = 'karts';
const TASKS_COLLECTION = 'maintenanceTasks';
const SHOPPING_COLLECTION = 'shoppingListItems';
const SESSIONS_COLLECTION = 'sessionLogs';

/**
 * Get all karts for current user
 */
export async function getKarts(): Promise<Kart[]> {
    const userId = getCurrentUserId();
    const kartsQuery = query(
        collection(db, KARTS_COLLECTION),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(kartsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kart));
}

/**
 * Get single kart by ID
 */
export async function getKart(kartId: string): Promise<Kart | null> {
    const kartDoc = await getDoc(doc(db, KARTS_COLLECTION, kartId));

    if (!kartDoc.exists()) {
        return null;
    }

    return { id: kartDoc.id, ...kartDoc.data() } as Kart;
}

/**
 * Create new kart with default maintenance thresholds
 * 
 * @param name - Kart name (e.g., "Kart #17")
 * @returns Created kart with ID
 */
export async function createKart(name: string): Promise<Kart> {
    const userId = getCurrentUserId();
    const now = Timestamp.now();

    const kartData = {
        userId,
        name,
        totalEngineHours: 0,
        thresholds: DEFAULT_MAINTENANCE_THRESHOLDS as MaintenanceThreshold[],
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(collection(db, KARTS_COLLECTION), kartData);

    return { id: docRef.id, ...kartData, thresholds: DEFAULT_MAINTENANCE_THRESHOLDS as MaintenanceThreshold[] };
}

/**
 * Update kart
 */
export async function updateKart(kartId: string, updates: Partial<Omit<Kart, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, KARTS_COLLECTION, kartId), {
        ...updates,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Delete kart with cascade delete of all related data
 * 
 * Deletes:
 * - Kart document
 * - All session logs
 * - All maintenance tasks
 * - All shopping list items
 * 
 * @param kartId - ID of kart to delete
 * @returns Object with counts of deleted items
 */
export async function deleteKart(kartId: string): Promise<{
    tasksDeleted: number;
    shoppingItemsDeleted: number;
    sessionLogsDeleted: number;
}> {
    const batch = writeBatch(db);

    // Delete kart
    batch.delete(doc(db, KARTS_COLLECTION, kartId));

    // Query and delete all related tasks
    const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where('kartId', '==', kartId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Query and delete all related shopping items
    const shoppingQuery = query(
        collection(db, SHOPPING_COLLECTION),
        where('kartId', '==', kartId)
    );
    const shoppingSnapshot = await getDocs(shoppingQuery);
    shoppingSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Query and delete all session logs
    const sessionsQuery = query(
        collection(db, SESSIONS_COLLECTION),
        where('kartId', '==', kartId)
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    sessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Commit batch delete
    await batch.commit();

    return {
        tasksDeleted: tasksSnapshot.size,
        shoppingItemsDeleted: shoppingSnapshot.size,
        sessionLogsDeleted: sessionsSnapshot.size,
    };
}
