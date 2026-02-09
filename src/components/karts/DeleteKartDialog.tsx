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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="max-w-md w-full bg-white rounded-lg p-6 shadow-xl border border-app-border">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-status-due"
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
                    <h2 className="text-xl font-bold text-app-text">Delete {kart.name}?</h2>
                </div>

                {/* Warning message */}
                <p className="text-text-subtle mb-4">
                    This action cannot be undone. The following data will be permanently deleted:
                </p>

                {/* Data summary */}
                <div className="bg-app-bg rounded-lg p-4 mb-4 space-y-2 border border-app-border">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-subtle">Kart information</span>
                        <span className="text-app-text font-medium">1 kart</span>
                    </div>
                    {counts && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-subtle">Session logs</span>
                                <span className="text-app-text font-medium">{counts.sessions} sessions</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-subtle">Maintenance tasks</span>
                                <span className="text-app-text font-medium">{counts.tasks} tasks</span>
                            </div>
                        </>
                    )}
                    {!counts && (
                        <div className="text-sm text-text-subtle">Loading data...</div>
                    )}
                    <div className="border-t border-app-border pt-2 flex justify-between text-sm font-bold">
                        <span className="text-text-subtle">Total engine hours</span>
                        <span className="text-app-text">{kart.totalEngineHours.toFixed(1)}h</span>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-600">{error}</p>
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
