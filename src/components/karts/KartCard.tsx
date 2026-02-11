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
        green: 'border-green-600 bg-green-950',
        yellow: 'border-yellow-600 bg-yellow-950',
        red: 'border-red-600 bg-red-950',
    };

    const indicatorClasses = {
        green: 'bg-green-600',
        yellow: 'bg-yellow-600',
        red: 'bg-red-600',
    };

    const cardClassName = `block min-h-[120px] rounded-lg border-2 ${colorClasses[warningColor]} p-4 transition-all hover:scale-[1.02] touch-manipulation relative`;

    const cardContent = (
        <>
            {/* Warning indicator dot */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${indicatorClasses[warningColor]}`} />

            {/* Pending task badge */}
            {pendingTaskCount > 0 && (
                <div className="absolute top-4 right-12 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingTaskCount}
                </div>
            )}

            {/* Kart name */}
            <h3 className="text-xl font-bold text-white mb-2 pr-16">{kart.name}</h3>

            {/* Engine hours */}
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">
                    {kart.totalEngineHours.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">hours logged</span>
            </div>

            {/* Warning zones summary */}
            {highestPriorityZone && highestPriorityZone.zone !== 'green' && (
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-white">
                        {highestPriorityZone.thresholdType}
                    </div>
                    <div className="text-xs text-gray-300">
                        {highestPriorityZone.zone === 'red' ? (
                            <span className="font-bold text-red-400">Due now</span>
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
                <div className="text-sm text-green-400 font-medium">
                    All maintenance up to date
                </div>
            )}

            {/* Last session date */}
            {lastSessionDate && (
                <div className="text-xs text-gray-500 mt-2">
                    Last session: {lastSessionDate.toLocaleDateString()}
                </div>
            )}
        </>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                type="button"
                className={`w-full text-left ${cardClassName}`}
            >
                {cardContent}
            </button>
        );
    }

    return (
        <Link href={`/app/karts/${kart.id}`} className={cardClassName}>
            {cardContent}
        </Link>
    );
}
