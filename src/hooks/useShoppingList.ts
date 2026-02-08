/**
 * useShoppingList Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for managing shopping list items
 */

'use client';

import { useState, useEffect } from 'react';
import {
    getActiveShoppingItems,
    getArchivedShoppingItems,
    createShoppingItem as createShoppingItemRepo,
    markAsOrdered,
    archiveShoppingItem as archiveShoppingItemRepo,
    updateShoppingItem as updateShoppingItemRepo,
    deleteShoppingItem,
} from '@/lib/firestore/shoppingList';
import type { ShoppingListItem } from '@/types/maintenance';

interface UseShoppingListReturn {
    activeItems: ShoppingListItem[];
    archivedItems: ShoppingListItem[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    createItem: (description: string, kartId?: string, photoId?: string) => Promise<ShoppingListItem>;
    markItemOrdered: (itemId: string) => Promise<void>;
    archiveItem: (itemId: string) => Promise<void>;
    updateItem: (itemId: string, description: string) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
}

/**
 * Hook for managing shopping list items
 * 
 * Features:
 * - Separate active and archived lists
 * - Optimistic UI updates
 * - Error handling
 * - Photo attachment support
 * 
 * @returns Shopping list state and CRUD operations
 */
export function useShoppingList(): UseShoppingListReturn {
    const [activeItems, setActiveItems] = useState<ShoppingListItem[]>([]);
    const [archivedItems, setArchivedItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);

            const [active, archived] = await Promise.all([
                getActiveShoppingItems(),
                getArchivedShoppingItems(),
            ]);

            setActiveItems(active);
            setArchivedItems(archived);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch shopping list'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const createItem = async (
        description: string,
        kartId?: string,
        photoId?: string
    ): Promise<ShoppingListItem> => {
        try {
            const newItem = await createShoppingItemRepo(description, kartId, photoId);
            setActiveItems(prev => [newItem, ...prev]); // Optimistic update
            return newItem;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create item'));
            throw err;
        }
    };

    const markItemOrdered = async (itemId: string): Promise<void> => {
        try {
            await markAsOrdered(itemId);

            // Optimistic update
            setActiveItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, status: 'ordered' as const } : item
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to mark as ordered'));
            throw err;
        }
    };

    const archiveItem = async (itemId: string): Promise<void> => {
        try {
            await archiveShoppingItemRepo(itemId);

            // Optimistic update: move from active to archived
            const item = activeItems.find(i => i.id === itemId);
            if (item) {
                setActiveItems(prev => prev.filter(i => i.id !== itemId));
                setArchivedItems(prev => [{ ...item, status: 'archived' as const }, ...prev]);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to archive item'));
            throw err;
        }
    };

    const updateItem = async (itemId: string, description: string): Promise<void> => {
        try {
            await updateShoppingItemRepo(itemId, description);

            // Optimistic update
            setActiveItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, description } : item
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update item'));
            throw err;
        }
    };

    const deleteItem = async (itemId: string): Promise<void> => {
        try {
            await deleteShoppingItem(itemId);

            // Optimistic update
            setActiveItems(prev => prev.filter(i => i.id !== itemId));
            setArchivedItems(prev => prev.filter(i => i.id !== itemId));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete item'));
            throw err;
        }
    };

    return {
        activeItems,
        archivedItems,
        loading,
        error,
        refetch: fetchItems,
        createItem,
        markItemOrdered: markItemOrdered,
        archiveItem,
        updateItem,
        deleteItem,
    };
}
