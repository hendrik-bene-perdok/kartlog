/**
 * QuickActionCard Component
 * Feature: 001-dashboard-refactor
 * 
 * Card for quick actions on the team dashboard
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: string;
    href: string;
    badge?: string | number;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    className?: string;
}

/**
 * QuickActionCard - Dashboard quick action card
 * 
 * Features:
 * - Icon display
 * - Title and description
 * - Optional badge for counts/notifications
 * - Color variants
 * - Touch-friendly
 * 
 * @param title - Card title
 * @param description - Card description
 * @param icon - Emoji or icon character
 * @param href - Link destination
 * @param badge - Optional badge text or number
 * @param variant - Color variant
 * @param className - Additional CSS classes
 */
export function QuickActionCard({
    title,
    description,
    icon,
    href,
    badge,
    variant = 'primary',
    className = ''
}: QuickActionCardProps) {
    const variantClasses = {
        primary: 'border-primary bg-white hover:bg-blue-50 ring-1 ring-primary/5',
        secondary: 'border-app-border bg-white hover:bg-app-bg',
        success: 'border-status-good bg-white hover:bg-green-50',
        warning: 'border-status-due bg-white hover:bg-red-50',
    };

    return (
        <Link
            href={href}
            className={`relative block border-2 ${variantClasses[variant]} rounded-lg p-6 transition-all hover:scale-[1.02] touch-manipulation ${className}`}
        >
            {/* Badge */}
            {badge !== undefined && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center">
                    {badge}
                </div>
            )}

            {/* Icon */}
            <div className={`text-4xl mb-3 ${variant === 'primary' ? 'text-primary' : 'text-text-subtle'}`} role="img" aria-label={`${title} icon`}>
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-app-text mb-2">{title}</h3>

            {/* Description */}
            <p className="text-text-subtle text-sm">{description}</p>
        </Link>
    );
}
