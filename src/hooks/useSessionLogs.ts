/**
 * useSessionLogs Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for managing session logs with auto-task generation integration
 * Refactored for Team Ownership
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

export function useSessionLogs(teamId: string, kartId: string): UseSessionLogsReturn {
    const [sessions, setSessions] = useState<SessionLog[]>([]);
    const [lastSession, setLastSession] = useState<SessionLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSessions = async () => {
        if (!teamId || !kartId) return;

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
        fetchSessions();
    }, [teamId, kartId]);

    const createSessionLog = async (durationMinutes: number, notes?: string): Promise<SessionLog> => {
        try {
            // Create session log (transaction updates kart hours atomically)
            // Now requires teamId to find the kart
            const newSession = await createSessionLogRepo(teamId, kartId, durationMinutes, notes);

            // Optimistic update
            setSessions(prev => [newSession, ...prev]);
            setLastSession(newSession);

            // CRITICAL: Check and create auto-tasks after session logged
            try {
                // getKart now requires teamId
                const updatedKart = await getKart(teamId, kartId);
                if (updatedKart) {
                    await checkAndCreateAutoTasks(updatedKart);
                }
            } catch (autoTaskError) {
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
