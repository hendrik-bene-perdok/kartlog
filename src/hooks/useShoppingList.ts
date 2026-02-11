/**
 * useShoppingList Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for managing shopping list items
 * Refactored for Team Ownership
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
    createItem: (description: string, photoId?: string) => Promise<ShoppingListItem>;
    markItemOrdered: (itemId: string) => Promise<void>;
    archiveItem: (itemId: string) => Promise<void>;
    updateItem: (itemId: string, description: string) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
}

export function useShoppingList(teamId: string, kartId: string): UseShoppingListReturn {
    const [activeItems, setActiveItems] = useState<ShoppingListItem[]>([]);
    const [archivedItems, setArchivedItems] = useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchItems = async () => {
        if (!teamId || !kartId) return;

        try {
            setLoading(true);
            setError(null);

            const [active, archived] = await Promise.all([
                getActiveShoppingItems(teamId, kartId),
                getArchivedShoppingItems(teamId, kartId),
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
    }, [teamId, kartId]);

    const createItem = async (
        description: string,
        photoId?: string
    ): Promise<ShoppingListItem> => {
        try {
            const newItem = await createShoppingItemRepo(teamId, kartId, description, photoId);
            setActiveItems(prev => [newItem, ...prev]); // Optimistic update
            return newItem;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create item'));
            throw err;
        }
    };

    const markItemOrdered = async (itemId: string): Promise<void> => {
        try {
            await markAsOrdered(teamId, kartId, itemId);

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
            await archiveShoppingItemRepo(teamId, kartId, itemId);

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
            await updateShoppingItemRepo(teamId, kartId, itemId, description);

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
            await deleteShoppingItem(teamId, kartId, itemId);

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