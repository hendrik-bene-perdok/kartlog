/**
 * Kart Repository
 * Feature: 004-maintenance-core
 * 
 * Firestore CRUD operations for Kart entities with cascade delete support
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
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/init';
import type { Kart, MaintenanceThreshold } from '@/types/maintenance';
import { DEFAULT_MAINTENANCE_THRESHOLDS } from '@/types/maintenance';

// Helper to get collection paths
const getKartsCollection = (teamId: string) => collection(db, 'teams', teamId, 'karts');
const getTasksCollection = (teamId: string, kartId: string) => collection(db, 'teams', teamId, 'karts', kartId, 'tasks');
const getShoppingCollection = (teamId: string, kartId: string) => collection(db, 'teams', teamId, 'karts', kartId, 'shopping');

/**
 * Get all karts for a team
 */
export async function getKarts(teamId: string): Promise<Kart[]> {
    if (!teamId) {
        console.warn('getKarts called with empty teamId');
        return [];
    }
    
    // Explicitly create reference to debug errors
    try {
        const ref = getKartsCollection(teamId);
        const kartsQuery = query(
            ref,
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(kartsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kart));
    } catch (error) {
        console.error('Error in getKarts:', error);
        throw error;
    }
}

/**
 * Get single kart by ID
 */
export async function getKart(teamId: string, kartId: string): Promise<Kart | null> {
    const kartDoc = await getDoc(doc(db, 'teams', teamId, 'karts', kartId));

    if (!kartDoc.exists()) {
        return null;
    }

    return { id: kartDoc.id, ...kartDoc.data() } as Kart;
}

/**
 * Create new kart with default maintenance thresholds
 * 
 * @param teamId - Team ID owning the kart
 * @param name - Kart name (e.g., "Kart #17")
 * @returns Created kart with ID
 */
export async function createKart(teamId: string, name: string): Promise<Kart> {
    const now = Timestamp.now();

    const kartData = {
        teamId,
        name,
        totalEngineHours: 0,
        thresholds: DEFAULT_MAINTENANCE_THRESHOLDS as MaintenanceThreshold[],
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(getKartsCollection(teamId), kartData);

    return { id: docRef.id, ...kartData, thresholds: DEFAULT_MAINTENANCE_THRESHOLDS as MaintenanceThreshold[] } as Kart;
}

/**
 * Update kart
 */
export async function updateKart(teamId: string, kartId: string, updates: Partial<Omit<Kart, 'id' | 'teamId' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, 'teams', teamId, 'karts', kartId), {
        ...updates,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Delete kart with cascade delete of all related data
 */
export async function deleteKart(teamId: string, kartId: string): Promise<{
    tasksDeleted: number;
    shoppingItemsDeleted: number;
}> {
    const batch = writeBatch(db);

    // Delete kart
    batch.delete(doc(db, 'teams', teamId, 'karts', kartId));

    // Delete tasks
    const tasksSnapshot = await getDocs(getTasksCollection(teamId, kartId));
    tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete shopping items
    const shoppingSnapshot = await getDocs(getShoppingCollection(teamId, kartId));
    shoppingSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    return {
        tasksDeleted: tasksSnapshot.size,
        shoppingItemsDeleted: shoppingSnapshot.size,
    };
}
