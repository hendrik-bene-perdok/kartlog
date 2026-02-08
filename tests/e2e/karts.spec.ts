import { test, expect } from '@playwright/test';

test.describe('Kart Management', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to karts page before each test
        await page.goto('/karts');
    });

    test('should allow creating a new kart', async ({ page }) => {
        // Check if "Add Kart" button exists
        const addKartButton = page.getByRole('button', { name: /Add Kart/i });
        await expect(addKartButton).toBeVisible();
        await addKartButton.click();

        // Fill in kart name
        const nameInput = page.getByPlaceholder('e.g., Kart #17');
        await expect(nameInput).toBeVisible();
        await nameInput.fill('E2E Test Kart');

        // Submit form
        const createButton = page.getByRole('button', { name: 'Create Kart' });
        await createButton.click();

        // Verify kart appears in list
        const kartCard = page.getByText('E2E Test Kart');
        await expect(kartCard).toBeVisible();
    });

    test('should allow viewing kart details', async ({ page }) => {
        // Assumes a kart exists (or we create one)
        // For robustness, let's create one first
        await page.getByRole('button', { name: /Add Kart/i }).click();
        await page.getByPlaceholder('e.g., Kart #17').fill('Detail View Kart');
        await page.getByRole('button', { name: 'Create Kart' }).click();

        // Click on the kart card
        await page.getByText('Detail View Kart').first().click();

        // Verify we are on details page
        await expect(page).toHaveURL(/\/karts\/.+/);
        await expect(page.getByText('Detail View Kart')).toBeVisible();
        await expect(page.getByText('hours logged')).toBeVisible();
    });

    test('should allow logging hours', async ({ page }) => {
        // Create kart
        await page.getByRole('button', { name: /Add Kart/i }).click();
        await page.getByPlaceholder('e.g., Kart #17').fill('Hour Log Kart');
        await page.getByRole('button', { name: 'Create Kart' }).click();

        // Click kart
        await page.getByText('Hour Log Kart').first().click();

        // Click Log Hours
        await page.getByRole('button', { name: /Log Hours/i }).click();

        // Check if we are on log page
        await expect(page).toHaveURL(/\/karts\/.+\/hours/);

        // Click 60m preset
        await page.getByRole('button', { name: '60m' }).click();

        // Verify input value
        const durationInput = page.getByLabel('Session Duration');
        await expect(durationInput).toHaveValue('60');

        // Submit
        await page.getByRole('button', { name: 'Log Session' }).click();

        // Verify success message
        await expect(page.getByText('Session logged successfully')).toBeVisible();

        // Check history
        await expect(page.getByText('60min')).toBeVisible();
    });

    test('should allow deleting a kart', async ({ page }) => {
        // Create kart to delete
        await page.getByRole('button', { name: /Add Kart/i }).click();
        await page.getByPlaceholder('e.g., Kart #17').fill('Delete Me Kart');
        await page.getByRole('button', { name: 'Create Kart' }).click();

        // Navigate to details
        await page.getByText('Delete Me Kart').first().click();

        // Click Delete
        await page.getByRole('button', { name: 'Delete Kart' }).click();

        // Click Confirm Delete in dialog
        // The dialog has a "Delete" button as well, possibly with ID or specific text
        // Let's target the button inside the dialog
        const deleteConfirmButton = page.getByRole('button', { name: 'Delete', exact: true });
        await expect(deleteConfirmButton).toBeVisible();
        await deleteConfirmButton.click();

        // Verify redirected to /karts and kart is gone
        await expect(page).toHaveURL(/\/karts$/); // Strict URL check?
        // Wait for list to update
        await expect(page.getByText('Delete Me Kart')).not.toBeVisible();
    });
});
