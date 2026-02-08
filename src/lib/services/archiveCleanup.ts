/**
 * Archive Cleanup Service
 * Feature: 004-maintenance-core
 * 
 * Manages 12-month retention policy for archived shopping list items
 */

import { getExpiredArchivedItems, deleteShoppingItem } from '../firestore/shoppingList';
import { deletePhoto } from '../indexedDB/photoRepository';
import { hasPhoto } from '@/types/maintenance';

/**
 * Clean up archived shopping items older than 12 months
 * 
 * Deletes:
 * - Shopping list item document from Firestore
 * - Associated photo from IndexedDB (if exists)
 * 
 * @returns Number of items deleted
 */
export async function cleanupExpiredArchive(): Promise<number> {
    const expiredItems = await getExpiredArchivedItems();

    for (const item of expiredItems) {
        // Delete photo if exists
        if (hasPhoto(item)) {
            try {
                await deletePhoto(item.photoId);
            } catch (error) {
                console.error(`Failed to delete photo ${item.photoId}:`, error);
                // Continue with item deletion even if photo delete fails
            }
        }

        // Delete shopping item
        await deleteShoppingItem(item.id);
    }

    return expiredItems.length;
}

/**
 * Get count of items that would be deleted
 * 
 * Useful for showing user how many items will be cleaned up
 */
export async function getExpiredArchiveCount(): Promise<number> {
    const expiredItems = await getExpiredArchivedItems();
    return expiredItems.length;
}

/**
 * Calculate archive expiration date
 * 
 * @returns Date 12 months ago
 */
export function getArchiveExpirationDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
}

/**
 * Check if archive cleanup is needed
 * 
 * Returns true if any expired items exist
 */
export async function isCleanupNeeded(): Promise<boolean> {
    const count = await getExpiredArchiveCount();
    return count > 0;
}

/**
 * Get cleanup summary for display
 * 
 * Returns detailed information about what will be cleaned
 */
export async function getCleanupSummary(): Promise<{
    totalExpired: number;
    withPhotos: number;
    expirationDate: Date;
}> {
    const expiredItems = await getExpiredArchivedItems();
    const withPhotos = expiredItems.filter(item => hasPhoto(item)).length;

    return {
        totalExpired: expiredItems.length,
        withPhotos,
        expirationDate: getArchiveExpirationDate(),
    };
}

/**
 * Schedule automatic cleanup
 * 
 * This should be called on dashboard mount to trigger cleanup
 * in background without blocking UI
 */
export async function scheduleCleanup(): Promise<void> {
    // Run cleanup in microtask to avoid blocking render
    queueMicrotask(async () => {
        try {
            const deletedCount = await cleanupExpiredArchive();
            if (deletedCount > 0) {
                console.log(`Cleaned up ${deletedCount} expired archive items`);
            }
        } catch (error) {
            console.error('Archive cleanup failed:', error);
            // Don't throw - cleanup is optional maintenance
        }
    });
}
