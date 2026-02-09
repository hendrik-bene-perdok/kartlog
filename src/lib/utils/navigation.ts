/**
 * Navigation Utilities
 * Feature: 001-dashboard-refactor
 * 
 * Helper functions for navigation state and active route detection
 */

import { usePathname } from 'next/navigation';
import { navigationItems, type NavItem } from '@/config/navigation';

/**
 * Check if a navigation item is currently active
 * 
 * @param itemHref - The href of the navigation item
 * @param currentPath - Current pathname
 * @returns True if active
 */
export function isNavItemActive(itemHref: string, currentPath: string): boolean {
    // Exact match for home/root paths
    if (itemHref === '/' || itemHref === '/dashboard') {
        return currentPath === itemHref;
    }

    // Prefix match for other routes
    return currentPath.startsWith(itemHref);
}

/**
 * Get the active navigation item based on current path
 * 
 * @param currentPath - Current pathname
 * @returns Active nav item or undefined
 */
export function getActiveNavItem(currentPath: string): NavItem | undefined {
    return navigationItems.find(item => isNavItemActive(item.href, currentPath));
}

/**
 * Custom hook to get current active navigation item
 * 
 * @returns Active nav item or undefined
 */
export function useActiveNavItem(): NavItem | undefined {
    const pathname = usePathname();
    return getActiveNavItem(pathname);
}

/**
 * Custom hook to check if a specific nav item is active
 * 
 * @param itemHref - The href to check
 * @returns True if active
 */
export function useIsNavItemActive(itemHref: string): boolean {
    const pathname = usePathname();
    return isNavItemActive(itemHref, pathname);
}

/**
 * Get CSS classes for navigation item based on active state
 * 
 * @param isActive - Whether the item is active
 * @param baseClasses - Base CSS classes
 * @returns Combined CSS classes
 */
export function getNavItemClasses(
    isActive: boolean,
    baseClasses: string = ''
): string {
    const activeClasses = isActive
        ? 'text-blue-400 font-semibold'
        : 'text-gray-400 hover:text-gray-200';

    return `${baseClasses} ${activeClasses}`.trim();
}

/**
 * Get aria-current attribute value for navigation item
 * 
 * @param isActive - Whether the item is active
 * @returns 'page' if active, undefined otherwise
 */
export function getNavItemAriaCurrent(isActive: boolean): 'page' | undefined {
    return isActive ? 'page' : undefined;
}
