/**
 * EmptyState Component
 * Feature: 001-dashboard-refactor
 * 
 * Reusable empty state component for lists and collections
 */

'use client';

import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

/**
 * EmptyState - Display when no data is available
 * 
 * Features:
 * - Optional icon/emoji display
 * - Title and description text
 * - Optional action button
 * - Responsive padding and spacing
 * 
 * @param icon - Emoji or icon character (optional)
 * @param title - Main heading
 * @param description - Explanatory text
 * @param action - Optional action button or component
 * @param className - Additional CSS classes
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`bg-white border border-app-border rounded-lg p-12 text-center shadow-sm ${className}`}>
            {icon && (
                <div className="text-6xl mb-4" role="img" aria-label={`${title} icon`}>
                    {icon}
                </div>
            )}
            <h2 className="text-2xl font-bold text-app-text mb-2">{title}</h2>
            <p className="text-text-subtle mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
