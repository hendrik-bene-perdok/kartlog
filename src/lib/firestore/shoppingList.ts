/**
 * ShoppingListItem Repository
 * Feature: 004-maintenance-core
 * 
 * Firestore CRUD operations for shopping list items with duplicate prevention
 * Refactored for Team Ownership
 */

import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    collectionGroup
} from 'firebase/firestore';
import { db } from '../firebase/init';
import type { ShoppingListItem } from '@/types/maintenance';

// Helper for subcollection path
const getShoppingCollection = (teamId: string, kartId: string) => 
    collection(db, 'teams', teamId, 'karts', kartId, 'shopping');

/**
 * Get active shopping list items for a kart
 * 
 * @returns Items with status 'active' or 'ordered'
 */
export async function getActiveShoppingItems(teamId: string, kartId: string): Promise<ShoppingListItem[]> {
    const coll = getShoppingCollection(teamId, kartId);

    // Query active items
    const activeQuery = query(
        coll,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
    );

    // Query ordered items
    const orderedQuery = query(
        coll,
        where('status', '==', 'ordered'),
        orderBy('orderedAt', 'desc')
    );

    const [activeSnapshot, orderedSnapshot] = await Promise.all([
        getDocs(activeQuery),
        getDocs(orderedQuery)
    ]);

    const activeItems = activeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
    const orderedItems = orderedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));

    return [...activeItems, ...orderedItems];
}

/**
 * Get archived shopping items (purchase history) for a kart
 */
export async function getArchivedShoppingItems(teamId: string, kartId: string): Promise<ShoppingListItem[]> {
    const archivedQuery = query(
        getShoppingCollection(teamId, kartId),
        where('status', '==', 'archived'),
        orderBy('archivedAt', 'desc')
    );

    const snapshot = await getDocs(archivedQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
}

/**
 * Get expired archived items (older than 12 months)
 * 
 * Used for cleanup - items to be deleted
 * Uses Collection Group Query to find items across all teams/karts
 */
export async function getExpiredArchivedItems(): Promise<ShoppingListItem[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Note: This requires a composite index on 'shopping' collection group
    // status ASC, archivedAt ASC
    const expiredQuery = query(
        collectionGroup(db, 'shopping'),
        where('status', '==', 'archived'),
        where('archivedAt', '<', Timestamp.fromDate(twelveMonthsAgo))
    );

    const snapshot = await getDocs(expiredQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingListItem));
}

/**
 * Create shopping list item
 */
export async function createShoppingItem(
    teamId: string,
    kartId: string,
    description: string,
    photoId?: string
): Promise<ShoppingListItem> {
    const now = Timestamp.now();

    const itemData = {
        teamId,
        kartId,
        description,
        photoId: photoId || undefined,
        status: 'active' as const,
        createdAt: now,
    };

    const docRef = await addDoc(getShoppingCollection(teamId, kartId), itemData);

    return { id: docRef.id, ...itemData };
}

/**
 * Mark shopping item as ordered
 */
export async function markAsOrdered(teamId: string, kartId: string, itemId: string): Promise<void> {
    await updateDoc(doc(db, 'teams', teamId, 'karts', kartId, 'shopping', itemId), {
        status: 'ordered',
        orderedAt: Timestamp.now(),
    });
}

/**
 * Archive shopping item (move to purchase history)
 */
export async function archiveShoppingItem(teamId: string, kartId: string, itemId: string): Promise<void> {
    await updateDoc(doc(db, 'teams', teamId, 'karts', kartId, 'shopping', itemId), {
        status: 'archived',
        archivedAt: Timestamp.now(),
    });
}

/**
 * Delete shopping item permanently
 */
export async function deleteShoppingItem(teamId: string, kartId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'karts', kartId, 'shopping', itemId));
}

/**
 * Update shopping item description
 */
export async function updateShoppingItem(teamId: string, kartId: string, itemId: string, description: string): Promise<void> {
    await updateDoc(doc(db, 'teams', teamId, 'karts', kartId, 'shopping', itemId), {
        description,
    });
}