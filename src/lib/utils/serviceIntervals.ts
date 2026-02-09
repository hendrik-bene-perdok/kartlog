/**
 * Service Interval Utilities
 * Feature: 001-dashboard-refactor
 * 
 * Helper functions for service interval calculations and management
 */

export interface ServiceInterval {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: 'hours';
}

export type ServiceIntervalStatus = 'ok' | 'due' | 'overdue';

/**
 * Calculate service interval status based on current vs target values
 * 
 * @param currentValue - Current usage in hours
 * @param targetValue - Target maintenance threshold
 * @returns Status ('ok' | 'due' | 'overdue')
 */
export function calculateIntervalStatus(
    currentValue: number,
    targetValue: number
): ServiceIntervalStatus {
    const percentage = (currentValue / targetValue) * 100;

    if (percentage >= 100) return 'overdue';
    if (percentage >= 80) return 'due';
    return 'ok';
}

/**
 * Calculate progress percentage for a service interval
 * 
 * @param currentValue - Current usage
 * @param targetValue - Target threshold
 * @returns Progress percentage (0-150, capped at 150 for UI display)
 */
export function calculateProgress(
    currentValue: number,
    targetValue: number
): number {
    return Math.min((currentValue / targetValue) * 100, 150);
}

/**
 * Calculate remaining hours until maintenance is due
 * 
 * @param currentValue - Current usage
 * @param targetValue - Target threshold
 * @returns Hours remaining (negative if overdue)
 */
export function calculateRemainingHours(
    currentValue: number,
    targetValue: number
): number {
    return targetValue - currentValue;
}

/**
 * Format hours remaining for display
 * 
 * @param hours - Hours remaining (can be negative)
 * @returns Formatted string
 */
export function formatRemainingHours(hours: number): string {
    if (hours < 0) {
        return `${Math.abs(hours).toFixed(1)}h overdue`;
    }
    if (hours === 0) {
        return 'Due now';
    }
    return `${hours.toFixed(1)}h remaining`;
}

/**
 * Sort service intervals by urgency (most urgent first)
 * 
 * @param intervals - Array of service intervals
 * @returns Sorted array
 */
export function sortByUrgency(intervals: ServiceInterval[]): ServiceInterval[] {
    return [...intervals].sort((a, b) => {
        const aPercentage = (a.currentValue / a.targetValue) * 100;
        const bPercentage = (b.currentValue / b.targetValue) * 100;
        return bPercentage - aPercentage;
    });
}

/**
 * Get the most urgent service interval
 * 
 * @param intervals - Array of service intervals
 * @returns Most urgent interval or undefined
 */
export function getMostUrgent(
    intervals: ServiceInterval[]
): ServiceInterval | undefined {
    if (intervals.length === 0) return undefined;
    return sortByUrgency(intervals)[0];
}

/**
 * Filter intervals by status
 * 
 * @param intervals - Array of service intervals
 * @param status - Status to filter by
 * @returns Filtered intervals
 */
export function filterByStatus(
    intervals: ServiceInterval[],
    status: ServiceIntervalStatus
): ServiceInterval[] {
    return intervals.filter(interval =>
        calculateIntervalStatus(interval.currentValue, interval.targetValue) === status
    );
}

/**
 * Get count of intervals by status
 * 
 * @param intervals - Array of service intervals
 * @returns Object with counts for each status
 */
export function getStatusCounts(intervals: ServiceInterval[]): {
    ok: number;
    due: number;
    overdue: number;
} {
    return intervals.reduce(
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
}

/**
 * Reset a service interval (set current value to 0)
 * 
 * @param interval - Service interval to reset
 * @returns New interval with reset value
 */
export function resetInterval(interval: ServiceInterval): ServiceInterval {
    return {
        ...interval,
        currentValue: 0,
    };
}

/**
 * Update service interval current value
 * 
 * @param interval - Service interval to update
 * @param hoursToAdd - Hours to add to current value
 * @returns Updated interval
 */
export function updateIntervalHours(
    interval: ServiceInterval,
    hoursToAdd: number
): ServiceInterval {
    return {
        ...interval,
        currentValue: Math.max(0, interval.currentValue + hoursToAdd),
    };
}

/**
 * Generate unique ID for new service interval
 * 
 * @param name - Interval name
 * @returns Kebab-case ID
 */
export function generateIntervalId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
}
