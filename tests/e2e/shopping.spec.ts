import { test, expect } from '@playwright/test';

test.describe('Shopping List', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/shopping');
    });

    test('should allow adding a new item', async ({ page }) => {
        // Toggle view to active (default)
        // Check "Active" button is selected

        // Click Add Item button (if form not visible)
        if (await page.getByRole('button', { name: '+ Add Item' }).isVisible()) {
            await page.getByRole('button', { name: '+ Add Item' }).click();
        }

        // Fill item
        await page.getByPlaceholder('Part or item description').fill('E2E Test Part');

        // Submit
        await page.getByRole('button', { name: 'Add Item' }).click();

        // Verify item appears
        await expect(page.getByText('E2E Test Part')).toBeVisible();
    });

    test('should allow toggling between active and archive', async ({ page }) => {
        // Ensure we are on active
        await page.getByRole('button', { name: 'Active' }).click();

        // Add item to verify it's in active
        await page.getByRole('button', { name: '+ Add Item' }).click();
        await page.getByPlaceholder('Part or item description').fill('Active Item');
        await page.getByRole('button', { name: 'Add Item' }).click();

        // Switch to archive
        await page.getByRole('button', { name: 'Archive' }).click();

        // Verify active item is NOT visible
        await expect(page.getByText('Active Item')).not.toBeVisible();

        // Switch back to active
        await page.getByRole('button', { name: 'Active' }).click();
        await expect(page.getByText('Active Item')).toBeVisible();
    });
});
