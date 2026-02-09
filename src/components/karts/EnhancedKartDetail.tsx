/**
 * Enhanced Kart Detail Component
 * Feature: 001-dashboard-refactor
 * 
 * Kart detail view with service intervals and maintenance history
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ServiceIntervalCard } from '@/components/karts/ServiceIntervalCard';
import { MaintenanceHistoryTable } from '@/components/karts/MaintenanceHistoryTable';
import { KartStatusBadge, type KartStatus } from '@/components/karts/KartStatusBadge';
import { TouchButton } from '@/components/ui/TouchButton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Kart, MaintenanceTask } from '@/types/maintenance';
import { calculateOverallStatus, getStatusSummary } from '@/lib/utils/kartStatus';
import { sortByUrgency } from '@/lib/utils/serviceIntervals';

interface ServiceInterval {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: 'hours';
}

interface EnhancedKartDetailProps {
    kart: Kart;
    tasks: MaintenanceTask[];
    serviceIntervals?: ServiceInterval[];
    onResetInterval?: (intervalId: string) => void;
    onTaskClick?: (taskId: string) => void;
}

/**
 * EnhancedKartDetail - Modern kart detail view with service intervals
 * 
 * Features:
 * - Service interval cards with progress
 * - Maintenance history table
 * - Overall status summary
 * - Quick actions
 * 
 * @param kart - Kart data
 * @param tasks - Maintenance tasks
 * @param serviceIntervals - Service intervals (optional)
 * @param onResetInterval - Callback for resetting intervals
 * @param onTaskClick - Callback for task clicks
 */
export function EnhancedKartDetail({
    kart,
    tasks,
    serviceIntervals = [],
    onResetInterval,
    onTaskClick
}: EnhancedKartDetailProps) {
    const [activeTab, setActiveTab] = useState<'intervals' | 'history'>('intervals');

    // Calculate status summary
    const statusSummary = getStatusSummary(serviceIntervals);
    const sortedIntervals = sortByUrgency(serviceIntervals);
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Get gradient color based on overall status
    const gradientColors = {
        ok: 'from-green-900 to-gray-900',
        due: 'from-yellow-900 to-gray-900',
        overdue: 'from-red-900 to-gray-900',
    };

    return (
        <div className="min-h-screen bg-app-bg p-4 pb-24">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <Link
                    href="/karts"
                    className="text-primary hover:text-blue-600 mb-4 inline-block transition-colors"
                >
                    ← Back to Garage
                </Link>

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-app-text mb-2">{kart.name}</h1>
                        <p className="text-2xl text-text-subtle">
                            {kart.totalEngineHours.toFixed(1)} hours logged
                        </p>
                    </div>
                    <KartStatusBadge status={statusSummary.overallStatus as KartStatus} />
                </div>

                {/* Status Summary */}
                <div className="bg-white border border-app-border rounded-lg p-4 grid grid-cols-3 gap-4 shadow-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-status-good">{statusSummary.okCount}</div>
                        <div className="text-sm text-text-subtle">OK</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">{statusSummary.dueCount}</div>
                        <div className="text-sm text-text-subtle">Due Soon</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-status-due">{statusSummary.overdueCount}</div>
                        <div className="text-sm text-text-subtle">Overdue</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="flex gap-2 bg-white border border-app-border rounded-lg p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('intervals')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'intervals'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-subtle hover:bg-gray-50'
                            }`}
                    >
                        Service Intervals ({serviceIntervals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'history'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-subtle hover:bg-gray-50'
                            }`}
                    >
                        History ({tasks.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto mb-6">
                {activeTab === 'intervals' ? (
                    serviceIntervals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedIntervals.map(interval => (
                                <ServiceIntervalCard
                                    key={interval.id}
                                    interval={interval}
                                    onReset={onResetInterval}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="🔧"
                            title="No Service Intervals"
                            description="Configure maintenance intervals for this kart to track component health"
                            action={
                                <Link href={`/karts/${kart.id}/settings`}>
                                    <TouchButton variant="primary" size="lg">
                                        Configure Intervals
                                    </TouchButton>
                                </Link>
                            }
                        />
                    )
                ) : (
                    <div className="space-y-4">
                        {pendingTasks.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-app-text mb-3">
                                    Pending Tasks ({pendingTasks.length})
                                </h3>
                                <MaintenanceHistoryTable
                                    tasks={pendingTasks}
                                    onTaskClick={onTaskClick}
                                />
                            </div>
                        )}

                        {completedTasks.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-app-text mb-3">
                                    Completed Tasks ({completedTasks.length})
                                </h3>
                                <MaintenanceHistoryTable
                                    tasks={completedTasks}
                                    onTaskClick={onTaskClick}
                                />
                            </div>
                        )}

                        {tasks.length === 0 && (
                            <EmptyState
                                icon="📋"
                                title="No Maintenance History"
                                description="Tasks and maintenance work will appear here once you start logging them"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/karts/${kart.id}/hours`}>
                    <TouchButton variant="primary" size="lg" className="w-full">
                        📝 Log Hours
                    </TouchButton>
                </Link>
                <Link href={`/karts/${kart.id}/tasks`}>
                    <TouchButton variant="secondary" size="lg" className="w-full">
                        ✓ Add Task
                    </TouchButton>
                </Link>
            </div>
        </div>
    );
}
