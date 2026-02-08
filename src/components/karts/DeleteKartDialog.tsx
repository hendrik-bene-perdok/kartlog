/**
 * DeleteKartDialog Component
 * Feature: 004-maintenance-core
 * 
 * Confirmation dialog for cascade delete with data summary
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useKarts } from '@/hooks/useKarts';
import { TouchButton } from '@/components/ui/TouchButton';
import { getPendingTaskCount } from '@/lib/firestore/tasks';
import { getSessionCount } from '@/lib/firestore/sessionLogs';
import type { Kart } from '@/types/maintenance';

interface DeleteKartDialogProps {
    kart: Kart;
    onClose: () => void;
    onDeleted: () => void;
}

/**
 * DeleteKartDialog - Confirmation dialog with cascade delete preview
 * 
 * Shows user what data will be deleted:
 * - Session logs count
 * - Maintenance tasks count
 * - Shopping list items count
 * 
 * @param kart - Kart to delete
 * @param onClose - Callback when dialog closed
 * @param onDeleted - Callback after successful deletion
 */
export function DeleteKartDialog({ kart, onClose, onDeleted }: DeleteKartDialogProps) {
    const { deleteKart } = useKarts();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState<{
        tasks: number;
        sessions: number;
    } | null>(null);

    useEffect(() => {
        // Load counts of data to be deleted
        const loadCounts = async () => {
            try {
                const [taskCount, sessionCount] = await Promise.all([
                    getPendingTaskCount(kart.id),
                    getSessionCount(kart.id),
                ]);

                setCounts({
                    tasks: taskCount,
                    sessions: sessionCount,
                });
            } catch (err) {
                console.error('Failed to load counts:', err);
            }
        };

        loadCounts();
    }, [kart.id]);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await deleteKart(kart.id);
            onDeleted();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete kart');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Delete {kart.name}?</h2>
                </div>

                {/* Warning message */}
                <p className="text-gray-300 mb-4">
                    This action cannot be undone. The following data will be permanently deleted:
                </p>

                {/* Data summary */}
                <div className="bg-gray-900 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Kart information</span>
                        <span className="text-white font-medium">1 kart</span>
                    </div>
                    {counts && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Session logs</span>
                                <span className="text-white font-medium">{counts.sessions} sessions</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Maintenance tasks</span>
                                <span className="text-white font-medium">{counts.tasks} tasks</span>
                            </div>
                        </>
                    )}
                    {!counts && (
                        <div className="text-sm text-gray-500">Loading data...</div>
                    )}
                    <div className="border-t border-gray-700 pt-2 flex justify-between text-sm font-bold">
                        <span className="text-gray-300">Total engine hours</span>
                        <span className="text-white">{kart.totalEngineHours.toFixed(1)}h</span>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-900 border border-red-600 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                    <TouchButton
                        variant="secondary"
                        size="lg"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </TouchButton>

                    <TouchButton
                        variant="danger"
                        size="lg"
                        onClick={handleDelete}
                        disabled={loading || !counts}
                        className="flex-1"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </TouchButton>
                </div>
            </div>
        </div>
    );
}
