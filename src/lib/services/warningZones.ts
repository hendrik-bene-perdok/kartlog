/**
 * Warning Zone Evaluation Service
 * Feature: 004-maintenance-core
 * 
 * Evaluates warning zones (green/yellow/red) based on kart engine hours
 * and maintenance thresholds
 */

import type { Kart, WarningZoneStatus, MaintenanceThreshold } from '@/types/maintenance';

/**
 * Evaluate warning zones for a kart
 * 
 * Logic:
 * - Green: hours < yellowWarningHours
 * - Yellow: yellowWarningHours <= hours < redWarningHours (Medium priority)
 * - Red: hours >= redWarningHours (High priority)
 * 
 * @param kart - Kart with totalEngineHours and thresholds
 * @returns Array of warning zone statuses for each threshold type
 */
export function evaluateWarningZones(kart: Kart): WarningZoneStatus[] {
    return kart.thresholds.map(threshold => {
        const hoursUntilYellow = Math.max(0, threshold.yellowWarningHours - kart.totalEngineHours);
        const hoursUntilRed = Math.max(0, threshold.redWarningHours - kart.totalEngineHours);

        let zone: 'green' | 'yellow' | 'red';
        let priority: 'High' | 'Medium' | null;

        if (kart.totalEngineHours >= threshold.redWarningHours) {
            zone = 'red';
            priority = 'High';
        } else if (kart.totalEngineHours >= threshold.yellowWarningHours) {
            zone = 'yellow';
            priority = 'Medium';
        } else {
            zone = 'green';
            priority = null;
        }

        return {
            thresholdType: threshold.type,
            zone,
            priority,
            hoursUntilYellow,
            hoursUntilRed,
        };
    });
}

/**
 * Get highest priority warning zone for a kart
 * 
 * Used for dashboard display to show most urgent maintenance need
 * 
 * Priority order: Red > Yellow > Green
 */
export function getHighestPriorityZone(kart: Kart): WarningZoneStatus | null {
    const zones = evaluateWarningZones(kart);

    // Find first red zone
    const redZone = zones.find(z => z.zone === 'red');
    if (redZone) return redZone;

    // Find first yellow zone
    const yellowZone = zones.find(z => z.zone === 'yellow');
    if (yellowZone) return yellowZone;

    // Return first green zone
    return zones[0] || null;
}

/**
 * Check if kart has any red warning zones
 */
export function hasRedWarning(kart: Kart): boolean {
    const zones = evaluateWarningZones(kart);
    return zones.some(z => z.zone === 'red');
}

/**
 * Check if kart has any yellow warning zones
 */
export function hasYellowWarning(kart: Kart): boolean {
    const zones = evaluateWarningZones(kart);
    return zones.some(z => z.zone === 'yellow');
}

/**
 * Get warning zones that require auto-task generation
 * 
 * Returns zones in yellow or red state
 */
export function getWarningZonesNeedingTasks(kart: Kart): (WarningZoneStatus & { zone: 'yellow' | 'red' })[] {
    const zones = evaluateWarningZones(kart);
    return zones.filter((z): z is WarningZoneStatus & { zone: 'yellow' | 'red' } => z.zone === 'yellow' || z.zone === 'red');
}

/**
 * Calculate progress percentage for a threshold
 * 
 * @param currentHours - Current engine hours
 * @param threshold - Maintenance threshold
 * @returns Percentage (0-100) of progress toward interval
 */
export function calculateThresholdProgress(
    currentHours: number,
    threshold: MaintenanceThreshold
): number {
    const progress = (currentHours / threshold.intervalHours) * 100;
    return Math.min(100, Math.max(0, progress));
}

/**
 * Format hours until next maintenance
 * 
 * @param hoursRemaining - Hours until threshold
 * @returns Human-readable string (e.g., "2.5h", "0h")
 */
export function formatHoursRemaining(hoursRemaining: number): string {
    if (hoursRemaining <= 0) {
        return 'Due now';
    }

    if (hoursRemaining < 1) {
        const minutes = Math.round(hoursRemaining * 60);
        return `${minutes}m`;
    }

    return `${hoursRemaining.toFixed(1)}h`;
}
