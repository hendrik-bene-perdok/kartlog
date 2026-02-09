/**
 * ServiceIntervalCard Component
 * Feature: 001-dashboard-refactor
 * 
 * Card displaying individual service interval status and progress
 */

'use client';

import React from 'react';
import { KartStatusBadge, type KartStatus } from './KartStatusBadge';

interface ServiceInterval {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: 'hours';
}

interface ServiceIntervalCardProps {
    interval: ServiceInterval;
    onReset?: (intervalId: string) => void;
    className?: string;
}

/**
 * ServiceIntervalCard - Display service interval with progress indicator
 * 
 * Features:
 * - Visual progress bar
 * - Status badge (ok/due/overdue)
 * - Current vs target values
 * - Optional reset action
 * 
 * @param interval - Service interval data
 * @param onReset - Optional callback when reset is clicked
 * @param className - Additional CSS classes
 */
export function ServiceIntervalCard({ interval, onReset, className = '' }: ServiceIntervalCardProps) {
    const { name, currentValue, targetValue, unit } = interval;

    // Calculate progress percentage and status
    const progress = Math.min((currentValue / targetValue) * 100, 150);
    const status: KartStatus =
        progress >= 100 ? 'overdue' :
            progress >= 80 ? 'due' :
                'ok';

    const progressBarColor =
        status === 'overdue' ? 'bg-red-600' :
            status === 'due' ? 'bg-yellow-600' :
                'bg-green-600';

    const borderColor =
        status === 'overdue' ? 'border-red-600' :
            status === 'due' ? 'border-yellow-600' :
                'border-green-600';

    return (
        <div className={`border-2 ${borderColor} bg-white rounded-lg p-4 ${className} shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-app-text">{name}</h3>
                <KartStatusBadge status={status} />
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-100">
                    <div
                        className={`h-full ${progressBarColor} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>

            {/* Values */}
            <div className="flex justify-between items-baseline mb-3">
                <span className="text-2xl font-bold text-app-text">
                    {currentValue.toFixed(1)}
                </span>
                <span className="text-sm text-text-subtle">
                    / {targetValue} {unit}
                </span>
            </div>

            {/* Hours Remaining */}
            <div className="text-sm text-text-subtle mb-3">
                {currentValue >= targetValue ? (
                    <span className="text-status-due font-semibold">
                        {(currentValue - targetValue).toFixed(1)} {unit} overdue
                    </span>
                ) : (
                    <span>
                        {(targetValue - currentValue).toFixed(1)} {unit} remaining
                    </span>
                )}
            </div>

            {/* Reset Button */}
            {onReset && (
                <button
                    onClick={() => onReset?.(interval.id)}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors touch-manipulation shadow-sm"
                >
                    Reset Interval
                </button>
            )}
        </div>
    );
}
