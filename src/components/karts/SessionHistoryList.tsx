/**
 * SessionHistoryList Component
 * Feature: 004-maintenance-core
 * 
 * Displays chronological list of session logs
 */

'use client';

import React from 'react';
import type { SessionLog } from '@/types/maintenance';

interface SessionHistoryListProps {
    sessions: SessionLog[];
    loading?: boolean;
}

/**
 * SessionHistoryList - Shows all logged sessions in reverse chronological order
 * 
 * Features:
 * - Newest sessions first
 * - Running total hours display
 * - Date and time formatting
 * - Notes display
 * - Empty state
 * 
 * @param sessions - Array of session logs
 * @param loading - Loading state
 */
export function SessionHistoryList({ sessions, loading = false }: SessionHistoryListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold text-white mb-2">No Sessions Yet</h3>
                <p className="text-gray-400 text-sm">
                    Session logs will appear here after you log your first session
                </p>
            </div>
        );
    }

    // Calculate running total for each session
    let runningTotal = 0;
    const sessionsWithTotal = sessions.map((session) => {
        runningTotal += session.durationHours;
        return {
            ...session,
            runningTotal,
        };
    }).reverse(); // Reverse again to show running total correctly

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">
                Session History ({sessions.length} sessions)
            </h2>

            {sessions.map((session, index) => {
                const date = session.loggedAt.toDate();
                const runningTotal = sessions
                    .slice(index)
                    .reduce((sum, s) => sum + s.durationHours, 0);

                return (
                    <div
                        key={session.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-sm text-gray-400">
                                    {date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                    {' at '}
                                    {date.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    {session.durationMinutes}
                                    <span className="text-sm text-gray-400 ml-1">min</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {session.durationHours.toFixed(2)}h
                                </div>
                            </div>
                        </div>

                        {session.notes && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                                <p className="text-sm text-gray-300 italic">
                                    "{session.notes}"
                                </p>
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Running total after this session</span>
                                <span className="text-blue-400 font-medium">
                                    {runningTotal.toFixed(2)}h
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
