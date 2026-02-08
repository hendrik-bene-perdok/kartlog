/**
 * useSessionLogs Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for managing session logs with auto-task generation integration
 */

'use client';

import { useState, useEffect } from 'react';
import {
    getSessionLogs,
    createSessionLog as createSessionLogRepo,
    getLastSession
} from '@/lib/firestore/sessionLogs';
import { getKart } from '@/lib/firestore/karts';
import { checkAndCreateAutoTasks } from '@/lib/services/maintenanceEngine';
import type { SessionLog } from '@/types/maintenance';

interface UseSessionLogsReturn {
    sessions: SessionLog[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    createSessionLog: (durationMinutes: number, notes?: string) => Promise<SessionLog>;
    lastSession: SessionLog | null;
}

/**
 * Hook for managing session logs for a kart
 * 
 * Features:
 * - Automatic loading on mount
 * - Auto-task generation after session creation
 * - Optimistic UI updates
 * - Error handling
 * 
 * CRITICAL: This hook triggers auto-task generation after every session log
 * to ensure maintenance tasks are created when thresholds are crossed
 * 
 * @param kartId - Kart ID to load sessions for
 * @returns Session logs state and create operation
 */
export function useSessionLogs(kartId: string): UseSessionLogsReturn {
    const [sessions, setSessions] = useState<SessionLog[]>([]);
    const [lastSession, setLastSession] = useState<SessionLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            const [fetchedSessions, last] = await Promise.all([
                getSessionLogs(kartId),
                getLastSession(kartId)
            ]);

            setSessions(fetchedSessions);
            setLastSession(last);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (kartId) {
            fetchSessions();
        }
    }, [kartId]);

    const createSessionLog = async (durationMinutes: number, notes?: string): Promise<SessionLog> => {
        try {
            // Create session log (transaction updates kart hours atomically)
            const newSession = await createSessionLogRepo(kartId, durationMinutes, notes);

            // Optimistic update
            setSessions(prev => [newSession, ...prev]);
            setLastSession(newSession);

            // CRITICAL: Check and create auto-tasks after session logged
            // This ensures maintenance tasks are generated when thresholds crossed
            try {
                const updatedKart = await getKart(kartId);
                if (updatedKart) {
                    await checkAndCreateAutoTasks(updatedKart);
                }
            } catch (autoTaskError) {
                // Don't fail session creation if auto-task fails
                console.error('Auto-task generation failed:', autoTaskError);
            }

            return newSession;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create session log'));
            throw err;
        }
    };

    return {
        sessions,
        loading,
        error,
        refetch: fetchSessions,
        createSessionLog,
        lastSession,
    };
}
