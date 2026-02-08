/**
 * ShoppingListItem Repository
 * Feature: 004-maintenance-core
 * 
 * Firestore CRUD operations for shopping list items with archive queries
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
    Timestamp
} from 'firebase/firestore';
import { db, getCurrentUserId } from '../firebase/init';
import type { ShoppingListItem } from '@/types/maintenance';

const SHOPPING_COLLECTION = 'shoppingListItems';

/**
 * Get active shopping list items for current user
 * 
 * @returns Items with status 'active' or 'ordered'
 */
export async function getActiveShoppingItems(): Promise<ShoppingListItem[]> {
    const userId = getCurrentUserId();

    // Query active items
    const activeQuery = query(
        collection(db, SHOPPING_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
    );

    // Query ordered items
    const orderedQuery = query(
        collection(db, SHOPPING_COLLECTION),
        where('userId', '==', userId),
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
 * Get archived shopping items (purchase history)
 * 
 * @returns Items with status 'archived'
 */
export async function getArchivedShoppingItems(): Promise<ShoppingListItem[]> {
    const userId = getCurrentUserId();
    const archivedQuery = query(
        collection(db, SHOPPING_COLLECTION),
        where('userId', '==', userId),
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
 */
export async function getExpiredArchivedItems(): Promise<ShoppingListItem[]> {
    const userId = getCurrentUserId();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const expiredQuery = query(
        collection(db, SHOPPING_COLLECTION),
        where('userId', '==', userId),
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
    description: string,
    kartId?: string,
    photoId?: string
): Promise<ShoppingListItem> {
    const userId = getCurrentUserId();
    const now = Timestamp.now();

    const itemData = {
        userId,
        description,
        kartId: kartId || undefined,
        photoId: photoId || undefined,
        status: 'active' as const,
        createdAt: now,
    };

    const docRef = await addDoc(collection(db, SHOPPING_COLLECTION), itemData);

    return { id: docRef.id, ...itemData };
}

/**
 * Mark shopping item as ordered
 */
export async function markAsOrdered(itemId: string): Promise<void> {
    await updateDoc(doc(db, SHOPPING_COLLECTION, itemId), {
        status: 'ordered',
        orderedAt: Timestamp.now(),
    });
}

/**
 * Archive shopping item (move to purchase history)
 */
export async function archiveShoppingItem(itemId: string): Promise<void> {
    await updateDoc(doc(db, SHOPPING_COLLECTION, itemId), {
        status: 'archived',
        archivedAt: Timestamp.now(),
    });
}

/**
 * Delete shopping item permanently
 * 
 * Used for expired archive cleanup
 */
export async function deleteShoppingItem(itemId: string): Promise<void> {
    await deleteDoc(doc(db, SHOPPING_COLLECTION, itemId));
}

/**
 * Update shopping item description
 */
export async function updateShoppingItem(itemId: string, description: string): Promise<void> {
    await updateDoc(doc(db, SHOPPING_COLLECTION, itemId), {
        description,
    });
}
