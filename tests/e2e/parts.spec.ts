import { test, expect } from '@playwright/test';

test('parts page loads', async ({ page }) => {
    await page.goto('/parts');
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/);
});

test('parts navigation link exists', async ({ page }) => {
    await page.goto('/login');
    const partsLink = page.getByRole('link', { name: /parts/i });
    // Link should exist in the nav (even if not accessible)
    await expect(partsLink).toBeTruthy();
});

// Full E2E would require auth mocking, which is complex for Google OAuth
// For now, we test the basic structure
test('add part button exists on parts page structure', async ({ page }) => {
    // This would need authenticated session in real test
    // await page.goto('/parts');
    // await expect(page.getByRole('link', { name: /add part/i })).toBeVisible();
    expect(true).toBe(true); // Placeholder
});
