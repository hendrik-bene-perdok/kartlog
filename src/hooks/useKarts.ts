/**
 * useKarts Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for managing karts (query, create, update, delete)
 */

'use client';

import { useState, useEffect } from 'react';
import { getKarts, getKart, createKart as createKartRepo, updateKart as updateKartRepo, deleteKart as deleteKartRepo } from '@/lib/firestore/karts';
import type { Kart } from '@/types/maintenance';

interface UseKartsReturn {
    karts: Kart[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    createKart: (name: string) => Promise<Kart>;
    updateKart: (kartId: string, updates: Partial<Omit<Kart, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
    deleteKart: (kartId: string) => Promise<{ tasksDeleted: number; shoppingItemsDeleted: number; sessionLogsDeleted: number }>;
}

/**
 * Hook for managing all karts for current user
 * 
 * Features:
 * - Automatic loading on mount
 * - Optimistic UI updates
 * - Error handling
 * - Refetch capability
 * 
 * @returns Karts state and CRUD operations
 */
export function useKarts(): UseKartsReturn {
    const [karts, setKarts] = useState<Kart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchKarts = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedKarts = await getKarts();
            setKarts(fetchedKarts);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch karts'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKarts();
    }, []);

    const createKart = async (name: string): Promise<Kart> => {
        try {
            const newKart = await createKartRepo(name);
            setKarts(prev => [newKart, ...prev]); // Optimistic update
            return newKart;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create kart'));
            throw err;
        }
    };

    const updateKart = async (
        kartId: string,
        updates: Partial<Omit<Kart, 'id' | 'userId' | 'createdAt'>>
    ): Promise<void> => {
        try {
            await updateKartRepo(kartId, updates);

            // Optimistic update in state
            setKarts(prev =>
                prev.map(kart =>
                    kart.id === kartId ? { ...kart, ...updates } : kart
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update kart'));
            throw err;
        }
    };

    const deleteKart = async (kartId: string) => {
        try {
            const result = await deleteKartRepo(kartId);

            // Optimistic update in state
            setKarts(prev => prev.filter(kart => kart.id !== kartId));

            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete kart'));
            throw err;
        }
    };

    return {
        karts,
        loading,
        error,
        refetch: fetchKarts,
        createKart,
        updateKart,
        deleteKart,
    };
}

interface UseSingleKartReturn {
    kart: Kart | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for managing a single kart
 * 
 * @param kartId - Kart ID to fetch
 * @returns Single kart state
 */
export function useSingleKart(kartId: string): UseSingleKartReturn {
    const [kart, setKart] = useState<Kart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchKart = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedKart = await getKart(kartId);
            setKart(fetchedKart);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch kart'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (kartId) {
            fetchKart();
        }
    }, [kartId]);

    return {
        kart,
        loading,
        error,
        refetch: fetchKart,
    };
}
