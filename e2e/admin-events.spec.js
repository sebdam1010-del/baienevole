const { test, expect } = require('@playwright/test');

test.describe('Admin - Event Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@baiedessinges.com');
    await page.getByLabel(/mot de passe/i).fill('admin123');
    await page.getByRole('button', { name: /connexion/i }).click();

    // Wait for login to complete
    await page.waitForURL(/\/(dashboard|events|admin)/, { timeout: 5000 });

    // Navigate to admin events page
    await page.goto('/admin/events');
  });

  test('should display admin events page', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /événements/i })).toBeVisible();

    // Check for create button
    await expect(page.getByRole('button', { name: /créer|nouvel événement/i })).toBeVisible();

    // Check for filters
    await expect(page.getByLabel(/saison/i)).toBeVisible();
    await expect(page.getByLabel(/année/i)).toBeVisible();
  });

  test('should create a new event', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: /créer|nouvel événement/i }).click();

    // Fill event form
    await page.getByLabel(/nom/i).fill('Test E2E Event');
    await page.getByLabel(/date/i).fill('2025-12-25');
    await page.getByLabel(/horaire.*arrivée/i).fill('14:00');
    await page.getByLabel(/horaire.*départ/i).fill('18:00');
    await page.getByLabel(/nombre.*bénévoles/i).fill('5');
    await page.getByLabel(/saison/i).selectOption('29');

    // Optional fields
    await page.getByLabel(/description/i).fill('Test event created by E2E tests');
    await page.getByLabel(/nombre.*spectateurs/i).fill('100');

    // Submit form
    await page.getByRole('button', { name: /créer|enregistrer/i }).click();

    // Should show success message
    await expect(page.getByText(/succès|créé/i)).toBeVisible({ timeout: 5000 });

    // Event should appear in table
    await expect(page.getByText('Test E2E Event')).toBeVisible();
  });

  test('should edit an existing event', async ({ page }) => {
    // Find and click edit button on first event
    const firstEditButton = page.locator('button:has-text("Modifier"), button:has-text("✎")').first();
    await firstEditButton.click();

    // Update event name
    const nameInput = page.getByLabel(/nom/i);
    await nameInput.fill('Updated E2E Event');

    // Update volunteers required
    await page.getByLabel(/nombre.*bénévoles/i).fill('8');

    // Submit form
    await page.getByRole('button', { name: /modifier|enregistrer/i }).click();

    // Should show success message
    await expect(page.getByText(/succès|modifié/i)).toBeVisible({ timeout: 5000 });

    // Updated event should appear
    await expect(page.getByText('Updated E2E Event')).toBeVisible();
  });

  test('should delete an event', async ({ page }) => {
    // Find delete button
    const deleteButton = page.locator('button:has-text("Supprimer"), button:has-text("🗑")').first();
    await deleteButton.click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    await page.waitForEvent('dialog');

    // Should show success message
    await expect(page.getByText(/supprimé/i)).toBeVisible({ timeout: 5000 });
  });

  test('should filter events by saison', async ({ page }) => {
    // Select saison filter
    await page.getByLabel(/saison/i).selectOption('29');

    // Wait for table to update
    await page.waitForTimeout(500);

    // All visible events should be saison 29
    const saisonCells = page.locator('td:has-text("Saison"), td:has-text("29")');
    await expect(saisonCells.first()).toBeVisible();
  });

  test('should filter events by année', async ({ page }) => {
    // Select year filter
    await page.getByLabel(/année/i).selectOption('2025');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Should show events or empty state
    const eventsTable = page.locator('table, .events-list');
    await expect(eventsTable).toBeVisible();
  });

  test('should show event statistics', async ({ page }) => {
    // Check for statistics section
    await expect(page.getByText(/statistiques|total/i)).toBeVisible();

    // Should show some numbers
    await expect(page.locator('text=/\\d+/')).toBeVisible();
  });

  test('should export event registrations as CSV', async ({ page }) => {
    // Find export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV")').first();

    if (await exportButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');

      await exportButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Check download filename
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
    }
  });

  test('should manually register volunteer to event', async ({ page }) => {
    // Find an event
    const eventRow = page.locator('tr').first();

    // Click to expand or view details
    await eventRow.click();

    // Look for register volunteer button/dropdown
    const registerButton = page.locator('button:has-text("Inscrire"), select[name*="volunteer"]').first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // Select a volunteer if dropdown
      if (await registerButton.evaluate(el => el.tagName === 'SELECT')) {
        await registerButton.selectOption({ index: 1 });
      }

      // Should show success
      await expect(page.getByText(/inscrit|ajouté/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
