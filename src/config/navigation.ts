/**
 * Navigation Configuration
 * Feature: 001-dashboard-refactor
 * 
 * Centralized navigation routes, labels, and icons
 */

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    showInBottomNav: boolean;
    showInHeader: boolean;
}

/**
 * Main application navigation items
 * 
 * Configuration includes:
 * - Label: Display text
 * - Href: Route path
 * - Icon: Emoji or icon character
 * - showInBottomNav: Display in mobile bottom navigation
 * - showInHeader: Display in desktop header navigation
 */
export const navigationItems: NavItem[] = [
    {
        label: 'Garage',
        href: '/karts',
        icon: '🏎️',
        showInBottomNav: true,
        showInHeader: true,
    },
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        showInBottomNav: true,
        showInHeader: true,
    },
    {
        label: 'Parts',
        href: '/parts',
        icon: '🔧',
        showInBottomNav: true,
        showInHeader: true,
    },
    {
        label: 'Sessions',
        href: '/sessions',
        icon: '⏱️',
        showInBottomNav: false,
        showInHeader: true,
    },
    {
        label: 'Shopping',
        href: '/shopping',
        icon: '🛒',
        showInBottomNav: true,
        showInHeader: true,
    },
    {
        label: 'Teams',
        href: '/teams',
        icon: '👥',
        showInBottomNav: true,
        showInHeader: true,
    },
];

/**
 * Get navigation items filtered for bottom navigation
 */
export function getBottomNavItems(): NavItem[] {
    return navigationItems.filter(item => item.showInBottomNav);
}

/**
 * Get navigation items filtered for header navigation
 */
export function getHeaderNavItems(): NavItem[] {
    return navigationItems.filter(item => item.showInHeader);
}

/**
 * Find navigation item by href
 */
export function findNavItemByHref(href: string): NavItem | undefined {
    return navigationItems.find(item => item.href === href);
}
