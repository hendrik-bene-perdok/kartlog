/**
 * Format Utilities
 * Feature: 001-dashboard-refactor
 * 
 * Common formatting functions for dates, numbers, and text
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore timestamp to a readable date string
 * 
 * @param timestamp - Firestore timestamp
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatTimestamp(
    timestamp: Timestamp | { seconds: number } | Date,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string {
    const date = timestamp instanceof Date
        ? timestamp
        : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * 
 * @param timestamp - Firestore timestamp or Date
 * @returns Relative time string
 */
export function formatRelativeTime(
    timestamp: Timestamp | { seconds: number } | Date
): string {
    const date = timestamp instanceof Date
        ? timestamp
        : new Date(timestamp.seconds * 1000);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

    return formatTimestamp(timestamp);
}

/**
 * Format hours with proper decimal places
 * 
 * @param hours - Hour value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted hour string
 */
export function formatHours(hours: number, decimals: number = 1): string {
    return hours.toFixed(decimals);
}

/**
 * Format hours with unit label
 * 
 * @param hours - Hour value
 * @param decimals - Number of decimal places
 * @returns Formatted string with "hours" or "hour"
 */
export function formatHoursWithUnit(hours: number, decimals: number = 1): string {
    const formatted = formatHours(hours, decimals);
    const unit = hours === 1 ? 'hour' : 'hours';
    return `${formatted} ${unit}`;
}

/**
 * Format minutes to hours
 * 
 * @param minutes - Minutes value
 * @returns Hours with 2 decimal places
 */
export function minutesToHours(minutes: number): number {
    return minutes / 60;
}

/**
 * Format priority level with emoji
 * 
 * @param priority - Priority level
 * @returns Priority with emoji prefix
 */
export function formatPriorityWithEmoji(priority: 'High' | 'Medium' | 'Low'): string {
    const emojiMap = {
        High: '🔴',
        Medium: '🟡',
        Low: '🔵',
    };
    return `${emojiMap[priority]} ${priority}`;
}

/**
 * Truncate text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format percentage value
 * 
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places
 * @returns Percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * 
 * @param value - Number value
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('en-US');
}

/**
 * Capitalize first letter of string
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeFirst(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert kebab-case to Title Case
 * 
 * @param text - Kebab-case text
 * @returns Title Case text
 */
export function kebabToTitleCase(text: string): string {
    return text
        .split('-')
        .map(word => capitalizeFirst(word))
        .join(' ');
}
