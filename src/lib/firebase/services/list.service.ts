// List Service - Shared list operations
// Implements Todo and Shopping list management (US3)

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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listItemConverter } from '../converters/team.converters';
import type { ListItem, ListType } from '@/types/domain/team.types';

/**
 * Get the collection path for a list type
 */
function getListCollectionPath(teamId: string, listType: ListType): string {
    return `teams/${teamId}/lists/${listType}/items`;
}

/**
 * Add a new item to a list
 */
export async function addListItem(
    teamId: string,
    listType: ListType,
    content: string,
    createdBy: string
): Promise<string> {
    const itemsRef = collection(db, getListCollectionPath(teamId, listType))
        .withConverter(listItemConverter);

    const newItem = {
        content,
        isCompleted: false,
        createdBy,
        createdAt: new Date(),
    };

    const docRef = await addDoc(itemsRef, newItem as any);
    return docRef.id;
}

/**
 * Update an existing list item
 */
export async function updateListItem(
    teamId: string,
    listType: ListType,
    itemId: string,
    updates: { content?: string; isCompleted?: boolean }
): Promise<void> {
    const itemRef = doc(db, getListCollectionPath(teamId, listType), itemId);
    await updateDoc(itemRef, updates);
}

/**
 * Toggle item completion status
 */
export async function toggleItemComplete(
    teamId: string,
    listType: ListType,
    itemId: string
): Promise<void> {
    const itemRef = doc(db, getListCollectionPath(teamId, listType), itemId);
    const snapshot = await getDoc(itemRef);

    if (!snapshot.exists()) {
        throw new Error('Item not found');
    }

    const currentStatus = snapshot.data().isCompleted || false;
    await updateDoc(itemRef, {
        isCompleted: !currentStatus,
    });
}

/**
 * Delete a list item
 */
export async function deleteListItem(
    teamId: string,
    listType: ListType,
    itemId: string
): Promise<void> {
    const itemRef = doc(db, getListCollectionPath(teamId, listType), itemId);
    await deleteDoc(itemRef);
}

/**
 * Get all items in a list
 * Returns items ordered by creation time (newest first)
 */
export async function getListItems(
    teamId: string,
    listType: ListType
): Promise<ListItem[]> {
    const itemsRef = collection(db, getListCollectionPath(teamId, listType))
        .withConverter(listItemConverter);

    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data());
}

/**
 * Get a single list item by ID
 */
export async function getListItem(
    teamId: string,
    listType: ListType,
    itemId: string
): Promise<ListItem | null> {
    const itemRef = doc(db, getListCollectionPath(teamId, listType), itemId)
        .withConverter(listItemConverter);

    const snapshot = await getDoc(itemRef);
    return snapshot.exists() ? snapshot.data() : null;
}

/**
 * Clear all completed items from a list
 */
export async function clearCompletedItems(
    teamId: string,
    listType: ListType
): Promise<number> {
    const items = await getListItems(teamId, listType);
    const completedItems = items.filter(item => item.isCompleted);

    for (const item of completedItems) {
        await deleteListItem(teamId, listType, item.id);
    }

    return completedItems.length;
}
