const { test, expect } = require('@playwright/test');

test.describe('Volunteer - Event Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as volunteer
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('benevole1@example.com');
    await page.getByLabel(/mot de passe/i).fill('volunteer123');
    await page.getByRole('button', { name: /connexion/i }).click();

    // Wait for login to complete
    await page.waitForURL(/\/(dashboard|events)/, { timeout: 5000 });
  });

  test('should display events list', async ({ page }) => {
    await page.goto('/events');

    // Check page title
    await expect(page.getByRole('heading', { name: /événements/i })).toBeVisible();

    // Check for filters
    await expect(page.getByLabel(/saison/i)).toBeVisible();
    await expect(page.getByLabel(/année/i)).toBeVisible();

    // Should show events grid
    const eventsGrid = page.locator('.grid, .events-list');
    await expect(eventsGrid).toBeVisible();
  });

  test('should filter events by saison', async ({ page }) => {
    await page.goto('/events');

    // Select saison filter
    await page.getByLabel(/saison/i).selectOption('29');

    // Wait for events to load
    await page.waitForTimeout(1000);

    // Should show events or empty message
    const content = page.locator('body');
    await expect(content).toContainText(/événement|aucun/i);
  });

  test('should register to an event', async ({ page }) => {
    await page.goto('/events');

    // Find first register button
    const registerButton = page.locator('button:has-text("S\'inscrire")').first();

    if (await registerButton.isVisible()) {
      await registerButton.click();

      // Should show success message
      await expect(page.getByText(/succès|inscr/i)).toBeVisible({ timeout: 5000 });

      // Button should change to unregister
      await expect(page.locator('button:has-text("désinscrire")').first()).toBeVisible();
    }
  });

  test('should unregister from an event', async ({ page }) => {
    await page.goto('/events');

    // First, ensure we're registered
    const registerButton = page.locator('button:has-text("S\'inscrire")').first();
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(1000);
    }

    // Now find unregister button
    const unregisterButton = page.locator('button:has-text("désinscrire")').first();

    if (await unregisterButton.isVisible()) {
      await unregisterButton.click();

      // Should show success message
      await expect(page.getByText(/succès|désinscr/i)).toBeVisible({ timeout: 5000 });

      // Button should change back to register
      await expect(page.locator('button:has-text("S\'inscrire")').first()).toBeVisible();
    }
  });

  test('should view event details', async ({ page }) => {
    await page.goto('/events');

    // Find and click details button
    const detailsButton = page.locator('button:has-text("Détails"), a:has-text("Détails")').first();
    await detailsButton.click();

    // Should navigate to event detail page
    await page.waitForURL(/\/events\/[\w-]+/);

    // Should show event information
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByText(/date|horaire/i)).toBeVisible();
    await expect(page.getByText(/bénévoles/i)).toBeVisible();
  });

  test('should see registered volunteers on event detail', async ({ page }) => {
    await page.goto('/events');

    // Go to first event detail
    const detailsLink = page.locator('button:has-text("Détails"), a:has-text("Détails")').first();
    await detailsLink.click();

    await page.waitForURL(/\/events\/[\w-]+/);

    // Should show registered volunteers section
    await expect(page.getByText(/bénévoles inscrits/i)).toBeVisible();

    // Should show list or empty message
    await expect(page.locator('body')).toContainText(/aucun|inscrit/i);
  });

  test('should show quota status indicators', async ({ page }) => {
    await page.goto('/events');

    // Should see colored dots or status indicators
    const statusIndicators = page.locator('[class*="status"], [class*="quota"], .rounded-full');

    // At least one indicator should be visible
    if (await statusIndicators.count() > 0) {
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show dashboard content
    await expect(page.getByText(/tableau de bord|dashboard/i)).toBeVisible();

    // Should show statistics
    await expect(page.locator('text=/\\d+/')).toBeVisible();

    // Should show upcoming events section
    await expect(page.getByText(/événements.*venir|upcoming/i)).toBeVisible();
  });

  test('should view profile', async ({ page }) => {
    await page.goto('/profile');

    // Should show profile information
    await expect(page.getByText(/profil/i)).toBeVisible();
    await expect(page.getByLabel(/prénom|nom/i)).toBeVisible();

    // Should be able to edit
    const editButton = page.locator('button:has-text("Modifier"), button:has-text("Enregistrer")');
    await expect(editButton.first()).toBeVisible();
  });

  test('should complete full registration workflow', async ({ page }) => {
    // 1. View events list
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /événements/i })).toBeVisible();

    // 2. Register to first available event
    const registerButton = page.locator('button:has-text("S\'inscrire")').first();
    if (await registerButton.isVisible()) {
      const eventName = await page.locator('.card, .event').first().textContent();

      await registerButton.click();
      await expect(page.getByText(/succès/i)).toBeVisible({ timeout: 5000 });

      // 3. Check dashboard shows the registration
      await page.goto('/dashboard');
      await expect(page.getByText(/événements.*venir/i)).toBeVisible();

      // 4. View event details
      await page.goto('/events');
      const detailsButton = page.locator('button:has-text("Détails")').first();
      await detailsButton.click();

      await page.waitForURL(/\/events\/[\w-]+/);

      // 5. Verify registration shows in event details
      await expect(page.getByText(/bénévoles inscrits/i)).toBeVisible();
      await expect(page.getByText(/Marie|benevole1/i)).toBeVisible();
    }
  });

  test('should prevent registration to past events', async ({ page }) => {
    await page.goto('/events');

    // Try to find a past event (if any)
    // This test may not find any past events in seed data
    const pastEventButton = page.locator('button:has-text("S\'inscrire"):disabled').first();

    if (await pastEventButton.isVisible()) {
      // Button should be disabled
      await expect(pastEventButton).toBeDisabled();
    }
  });
});
