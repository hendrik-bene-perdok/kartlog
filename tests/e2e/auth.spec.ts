import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Kartlog/);
});

test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
});

// Mocking Google Auth is complex; for MVP we check the flow existence
test('login button exists', async ({ page }) => {
    await page.goto('/login');
    const loginButton = page.getByRole('button', { name: /Sign in with Google/i });
    await expect(loginButton).toBeVisible();
});
