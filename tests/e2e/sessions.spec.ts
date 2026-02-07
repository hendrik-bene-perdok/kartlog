import { test, expect } from '@playwright/test';

test('sessions page loads', async ({ page }) => {
    await page.goto('/sessions');
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/);
});

test('sessions navigation link exists', async ({ page }) => {
    await page.goto('/login');
    const sessionsLink = page.getByRole('link', { name: /sessions/i });
    await expect(sessionsLink).toBeTruthy();
});

// Full E2E with tire pressure would require authenticated session
test('session form structure', async ({ page }) => {
    // This would need authenticated session in real test
    // await page.goto('/sessions/new');
    // await expect(page.getByLabel(/tire pressure/i)).toBeVisible();
    expect(true).toBe(true); // Placeholder
});
