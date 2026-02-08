/**
 * SwipeableCard Component
 * Feature: 004-maintenance-core
 * 
 * Reusable swipeable card using Framer Motion for task/shopping list items
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
    swipeThreshold?: number;
    className?: string;
    disabled?: boolean;
}

/**
 * SwipeableCard - Touch-friendly swipeable component
 * 
 * Features:
 * - Swipe right to complete/confirm
 * - Swipe left to delete/remove
 * - Visual feedback (card follows finger)
 * - Haptic feedback on action (if available)
 * - Customizable swipe threshold
 * 
 * @param children - Card content
 * @param onSwipeRight - Callback for right swipe (typically "complete" action)
 * @param onSwipeLeft - Callback for left swipe (typically "delete" action)
 * @param swipeThreshold - Distance in pixels to trigger action (default: 80)
 * @param className - Additional CSS classes
 * @param disabled - Disable swipe gestures
 */
export function SwipeableCard({
    children,
    onSwipeRight,
    onSwipeLeft,
    swipeThreshold = 80,
    className = '',
    disabled = false,
}: SwipeableCardProps) {
    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const { offset } = info;

        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        if (offset.x > swipeThreshold && onSwipeRight) {
            onSwipeRight();
        } else if (offset.x < -swipeThreshold && onSwipeLeft) {
            onSwipeLeft();
        }
    };

    if (disabled) {
        return (
            <div className={`touch-manipulation ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`relative touch-manipulation cursor-grab active:cursor-grabbing ${className}`}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.div>
    );
}
