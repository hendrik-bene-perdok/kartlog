/**
 * useMaintenanceThresholds Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for warning zone evaluation and threshold management
 */

'use client';

import { useMemo } from 'react';
import type { Kart, WarningZoneStatus, KartDashboardStatus } from '@/types/maintenance';
import {
    evaluateWarningZones,
    getHighestPriorityZone,
    hasRedWarning,
    hasYellowWarning
} from '@/lib/services/warningZones';

interface UseMaintenanceThresholdsReturn {
    zones: WarningZoneStatus[];
    highestPriorityZone: WarningZoneStatus | null;
    hasRed: boolean;
    hasYellow: boolean;
    warningColor: 'green' | 'yellow' | 'red';
}

/**
 * Hook for evaluating warning zones for a kart
 * 
 * Memoized to avoid recalculation on every render
 * 
 * @param kart - Kart to evaluate
 * @returns Warning zone status
 */
export function useMaintenanceThresholds(kart: Kart | null): UseMaintenanceThresholdsReturn {
    const zones = useMemo(() => {
        if (!kart) return [];
        return evaluateWarningZones(kart);
    }, [kart?.id, kart?.totalEngineHours, kart?.thresholds]);

    const highestPriorityZone = useMemo(() => {
        if (!kart) return null;
        return getHighestPriorityZone(kart);
    }, [zones]);

    const hasRed = useMemo(() => {
        if (!kart) return false;
        return hasRedWarning(kart);
    }, [zones]);

    const hasYellow = useMemo(() => {
        if (!kart) return false;
        return hasYellowWarning(kart);
    }, [zones]);

    const warningColor = useMemo((): 'green' | 'yellow' | 'red' => {
        if (hasRed) return 'red';
        if (hasYellow) return 'yellow';
        return 'green';
    }, [hasRed, hasYellow]);

    return {
        zones,
        highestPriorityZone,
        hasRed,
        hasYellow,
        warningColor,
    };
}

/**
 * Hook for building complete dashboard status for a kart
 * 
 * Combines kart data with warning zones and task counts
 * 
 * @param kart - Kart to evaluate
 * @param pendingTaskCount - Number of pending tasks (from useTasks hook)
 * @param lastSessionDate - Date of last session (from useSessionLogs hook)
 * @returns Complete dashboard status
 */
export function useKartDashboardStatus(
    kart: Kart | null,
    pendingTaskCount: number = 0,
    lastSessionDate?: Date
): KartDashboardStatus | null {
    const { zones } = useMaintenanceThresholds(kart);

    return useMemo(() => {
        if (!kart) return null;

        return {
            kart,
            pendingTaskCount,
            warningZones: zones,
            lastSessionDate,
        };
    }, [kart, pendingTaskCount, zones, lastSessionDate]);
}
