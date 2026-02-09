/**
 * KartStatusBadge Component
 * Feature: 001-dashboard-refactor
 * 
 * Reusable status badge showing kart maintenance status
 */

'use client';

import React from 'react';

export type KartStatus = 'ok' | 'due' | 'overdue';

interface KartStatusBadgeProps {
    status: KartStatus;
    componentName?: string;
    className?: string;
}

/**
 * KartStatusBadge - Visual indicator for kart maintenance status
 * 
 * Features:
 * - Color-coded status (green/yellow/red)
 * - Optional component name display
 * - Accessible with proper ARIA labels
 * 
 * @param status - Current status ('ok' | 'due' | 'overdue')
 * @param componentName - Optional name of the component (e.g., "Oil Change")
 * @param className - Additional CSS classes
 */
export function KartStatusBadge({ status, componentName, className = '' }: KartStatusBadgeProps) {
    const statusConfig = {
        ok: {
            label: 'OK',
            bgColor: 'bg-green-600',
            textColor: 'text-white',
            ariaLabel: 'Status: OK'
        },
        due: {
            label: 'Due Soon',
            bgColor: 'bg-yellow-600',
            textColor: 'text-black',
            ariaLabel: 'Status: Due Soon'
        },
        overdue: {
            label: 'Overdue',
            bgColor: 'bg-red-600',
            textColor: 'text-white',
            ariaLabel: 'Status: Overdue'
        }
    };

    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor} ${className}`}
            role="status"
            aria-label={componentName ? `${componentName}: ${config.ariaLabel}` : config.ariaLabel}
        >
            {componentName && <span className="font-medium">{componentName}</span>}
            <span className="font-bold">{config.label}</span>
        </span>
    );
}
