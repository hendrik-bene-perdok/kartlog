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
    updateKart: (kartId: string, updates: Partial<Omit<Kart, 'id' | 'teamId' | 'createdAt'>>) => Promise<void>;
    deleteKart: (kartId: string) => Promise<{ tasksDeleted: number; shoppingItemsDeleted: number }>;
}

/**
 * Hook for managing all karts for a team
 * 
 * Features:
 * - Automatic loading on mount when teamId is present
 * - Optimistic UI updates
 * - Error handling
 * - Refetch capability
 * 
 * @param teamId - The ID of the team to fetch karts for
 * @returns Karts state and CRUD operations
 */
export function useKarts(teamId: string): UseKartsReturn {
    const [karts, setKarts] = useState<Kart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchKarts = async () => {
        if (!teamId) {
            setLoading(false);
            return;
        }
        
        try {
            console.log(`[useKarts] Fetching karts for teamId: ${teamId}`);
            setLoading(true);
            setError(null);
            const fetchedKarts = await getKarts(teamId);
            setKarts(fetchedKarts);
        } catch (err: any) {
            console.error('useKarts fetch error:', err);
            // Permission denied usually comes with a code
            if (err?.code === 'permission-denied') {
                console.error(`Permission denied accessing team: ${teamId}. Check if user is active member.`);
            }
            setError(err instanceof Error ? err : new Error('Failed to fetch karts'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKarts();
    }, [teamId]);

    const createKart = async (name: string): Promise<Kart> => {
        if (!teamId) throw new Error("Cannot create kart without teamId");
        
        try {
            const newKart = await createKartRepo(teamId, name);
            setKarts(prev => [newKart, ...prev]); // Optimistic update
            return newKart;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err : new Error('Failed to create kart'));
            throw err;
        }
    };

    const updateKart = async (
        kartId: string,
        updates: Partial<Omit<Kart, 'id' | 'teamId' | 'createdAt'>>
    ): Promise<void> => {
        if (!teamId) throw new Error("Cannot update kart without teamId");

        try {
            await updateKartRepo(teamId, kartId, updates);

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
        if (!teamId) throw new Error("Cannot delete kart without teamId");

        try {
            const result = await deleteKartRepo(teamId, kartId);

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
export function useSingleKart(teamId: string, kartId: string): UseSingleKartReturn {
    const [kart, setKart] = useState<Kart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchKart = async () => {
        if (!teamId || !kartId) return;
        try {
            setLoading(true);
            setError(null);
            const fetchedKart = await getKart(teamId, kartId);
            setKart(fetchedKart);
        } catch (err: any) {
            console.error('useKarts fetch error:', err);
            setError(err instanceof Error ? err : new Error(`Failed to fetch karts: ${err?.message || 'Unknown error'}`));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKart();
    }, [teamId, kartId]);

    return {
        kart,
        loading,
        error,
        refetch: fetchKart,
    };
}
