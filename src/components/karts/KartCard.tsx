/**
 * KartCard Component
 * Feature: 004-maintenance-core
 * 
 * Dashboard card showing kart status with warning zone indicators
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { Kart } from '@/types/maintenance';
import { useMaintenanceThresholds } from '@/hooks/useMaintenanceThresholds';
import { formatHoursRemaining } from '@/lib/services/warningZones';

interface KartCardProps {
    kart: Kart;
    pendingTaskCount?: number;
    lastSessionDate?: Date;
    onClick?: () => void;
}

/**
 * KartCard - Dashboard display for single kart
 * 
 * Features:
 * - Warning zone color indicator (green/yellow/red)
 * - Engine hours display
 * - Pending task count badge
 * - Last session date
 * - Touch-friendly card (clickable)
 * 
 * @param kart - Kart to display
 * @param pendingTaskCount - Number of pending tasks
 * @param lastSessionDate - Date of last session
 * @param onClick - Optional click handler (if not using Link)
 */
export function KartCard({
    kart,
    pendingTaskCount = 0,
    lastSessionDate,
    onClick
}: KartCardProps) {
    const { warningColor, highestPriorityZone, zones } = useMaintenanceThresholds(kart);

    const colorClasses = {
        green: 'border-status-good bg-white hover:bg-green-50 shadow-sm ring-1 ring-status-good/20',
        yellow: 'border-yellow-500 bg-white hover:bg-yellow-50 shadow-sm ring-1 ring-yellow-500/20',
        red: 'border-status-due bg-white hover:bg-red-50 shadow-sm ring-1 ring-status-due/20',
    };

    const indicatorClasses = {
        green: 'bg-status-good',
        yellow: 'bg-yellow-500',
        red: 'bg-status-due',
    };

    const content = (
        <>
            {/* Warning indicator dot */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${indicatorClasses[warningColor]}`} />

            {/* Pending task badge */}
            {pendingTaskCount > 0 && (
                <div className="absolute top-4 right-12 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingTaskCount}
                </div>
            )}

            {/* Kart name */}
            <h3 className="text-xl font-bold text-app-text mb-2 pr-16">{kart.name}</h3>

            {/* Engine hours */}
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-app-text">
                    {kart.totalEngineHours.toFixed(1)}
                </span>
                <span className="text-text-subtle text-sm">hours logged</span>
            </div>

            {/* Warning zones summary */}
            {highestPriorityZone && highestPriorityZone.zone !== 'green' && (
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-app-text">
                        {highestPriorityZone.thresholdType}
                    </div>
                    <div className="text-xs text-text-subtle">
                        {highestPriorityZone.zone === 'red' ? (
                            <span className="font-bold text-status-due">Due now</span>
                        ) : (
                            <span>
                                Due in {formatHoursRemaining(highestPriorityZone.hoursUntilRed)}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* All zones green */}
            {highestPriorityZone?.zone === 'green' && (
                <div className="text-sm text-status-good font-medium">
                    All maintenance up to date
                </div>
            )}

            {/* Last session date */}
            {lastSessionDate && (
                <div className="text-xs text-text-subtle mt-2">
                    Last session: {lastSessionDate.toLocaleDateString()}
                </div>
            )}
        </>
    );

    const baseClasses = `block min-h-[120px] rounded-lg border ${colorClasses[warningColor]} p-4 transition-all hover:scale-[1.02] touch-manipulation relative text-left w-full`;

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={baseClasses}>
                {content}
            </button>
        );
    }

    return (
        <Link href={`/karts/${kart.id}`} className={baseClasses}>
            {content}
        </Link>
    );
}
