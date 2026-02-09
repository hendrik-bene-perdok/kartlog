/**
 * Kart Status Utilities
 * Feature: 001-dashboard-refactor
 * 
 * Helper functions for calculating kart status from service intervals
 */

import { ServiceInterval, ServiceIntervalStatus, calculateIntervalStatus } from './serviceIntervals';

export type KartOverallStatus = 'ok' | 'due' | 'overdue';

interface StatusSummary {
    overallStatus: KartOverallStatus;
    overdueCount: number;
    dueCount: number;
    okCount: number;
    mostUrgentInterval?: ServiceInterval;
}

/**
 * Calculate overall kart status from all service intervals
 * 
 * @param intervals - Array of service intervals
 * @returns Overall status (worst status among all intervals)
 */
export function calculateOverallStatus(
    intervals: ServiceInterval[]
): KartOverallStatus {
    if (intervals.length === 0) return 'ok';

    const hasOverdue = intervals.some(
        interval => calculateIntervalStatus(interval.currentValue, interval.targetValue) === 'overdue'
    );

    if (hasOverdue) return 'overdue';

    const hasDue = intervals.some(
        interval => calculateIntervalStatus(interval.currentValue, interval.targetValue) === 'due'
    );

    return hasDue ? 'due' : 'ok';
}

/**
 * Get comprehensive status summary for a kart
 * 
 * @param intervals - Array of service intervals
 * @returns Status summary object
 */
export function getStatusSummary(intervals: ServiceInterval[]): StatusSummary {
    const statusCounts = intervals.reduce(
        (counts, interval) => {
            const status = calculateIntervalStatus(
                interval.currentValue,
                interval.targetValue
            );
            counts[status]++;
            return counts;
        },
        { ok: 0, due: 0, overdue: 0 }
    );

    // Find most urgent interval (highest percentage of target)
    const mostUrgent = intervals.length > 0
        ? intervals.reduce((most, current) => {
            const mostPercent = (most.currentValue / most.targetValue) * 100;
            const currentPercent = (current.currentValue / current.targetValue) * 100;
            return currentPercent > mostPercent ? current : most;
        })
        : undefined;

    return {
        overallStatus: calculateOverallStatus(intervals),
        overdueCount: statusCounts.overdue,
        dueCount: statusCounts.due,
        okCount: statusCounts.ok,
        mostUrgentInterval: mostUrgent,
    };
}

/**
 * Get status color for UI display
 * 
 * @param status - Kart status
 * @returns Tailwind color class prefix
 */
export function getStatusColor(status: KartOverallStatus): string {
    const colorMap: Record<KartOverallStatus, string> = {
        ok: 'green',
        due: 'yellow',
        overdue: 'red',
    };
    return colorMap[status];
}

/**
 * Get status message for display
 * 
 * @param summary - Status summary
 * @returns Human-readable status message
 */
export function getStatusMessage(summary: StatusSummary): string {
    const { overallStatus, overdueCount, dueCount } = summary;

    if (overallStatus === 'overdue') {
        return `${overdueCount} component${overdueCount !== 1 ? 's' : ''} overdue`;
    }

    if (overallStatus === 'due') {
        return `${dueCount} component${dueCount !== 1 ? 's' : ''} due soon`;
    }

    return 'All maintenance up to date';
}

/**
 * Check if kart needs attention (has due or overdue intervals)
 * 
 * @param intervals - Array of service intervals
 * @returns True if attention needed
 */
export function needsAttention(intervals: ServiceInterval[]): boolean {
    const status = calculateOverallStatus(intervals);
    return status === 'due' || status === 'overdue';
}

/**
 * Get next maintenance due (earliest interval to reach target)
 * 
 * @param intervals - Array of service intervals
 * @returns Next due interval or undefined
 */
export function getNextDue(
    intervals: ServiceInterval[]
): ServiceInterval | undefined {
    const okIntervals = intervals.filter(
        interval => calculateIntervalStatus(interval.currentValue, interval.targetValue) === 'ok'
    );

    if (okIntervals.length === 0) return undefined;

    return okIntervals.reduce((next, current) => {
        const nextRemaining = next.targetValue - next.currentValue;
        const currentRemaining = current.targetValue - current.currentValue;
        return currentRemaining < nextRemaining ? current : next;
    });
}
