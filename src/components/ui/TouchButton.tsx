/**
 * TouchButton Component
 * Feature: 004-maintenance-core
 * 
 * Base button component with 48x48px minimum touch target for garage-friendly UI
 */

import React from 'react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

/**
 * TouchButton - Garage-optimized button with large touch targets
 * 
 * Features:
 * - Minimum 48x48px touch target (WCAG 2.1 AAA compliant)
 * - Dark mode optimized colors
 * - High contrast for garage lighting conditions
 * - Touch-manipulation CSS for better mobile responsiveness
 * 
 * @param variant - Visual style ('primary' | 'secondary' | 'danger')
 * @param size - Button size ('sm' | 'md' | 'lg')
 * @param className - Additional CSS classes
 * @param children - Button content
 * @param props - Standard button HTML attributes
 */
export function TouchButton({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: TouchButtonProps) {
    const baseClasses = 'min-w-[48px] min-h-[48px] touch-manipulation rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            className={combinedClasses}
            {...props}
        >
            {children}
        </button>
    );
}
