const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  const timestamp = Date.now();
  const testEmail = `e2e-user-${timestamp}@example.com`;
  const testPassword = 'Test123!Password';

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Baie des Singes/);

    // Check login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.getByLabel(/prénom/i).fill('Test');
    await page.getByLabel(/nom/i).fill('User');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/téléphone/i).fill('0612345678');

    // Fill password fields
    const passwordFields = await page.getByLabel(/mot de passe/i).all();
    await passwordFields[0].fill(testPassword);
    await passwordFields[1].fill(testPassword);

    // Submit form
    await page.getByRole('button', { name: /inscription/i }).click();

    // Wait for redirect to dashboard or events
    await page.waitForURL(/\/(dashboard|events)/, { timeout: 5000 });

    // Should see success message or user name
    await expect(page.getByText(/test/i)).toBeVisible();
  });

  test('should login with existing credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with seeded user
    await page.getByLabel(/email/i).fill('benevole1@example.com');
    await page.getByLabel(/mot de passe/i).fill('volunteer123');

    // Submit form
    await page.getByRole('button', { name: /connexion/i }).click();

    // Wait for redirect
    await page.waitForURL(/\/(dashboard|events)/, { timeout: 5000 });

    // Should see user content
    await expect(page.getByText(/événements/i)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/mot de passe/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /connexion/i }).click();

    // Should show error message
    await expect(page.getByText(/erreur|invalide|incorrect/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    // Fill with invalid email
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/prénom/i).fill('Test');

    // Try to submit
    await page.getByRole('button', { name: /inscription/i }).click();

    // Should show validation error or prevent submission
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('benevole1@example.com');
    await page.getByLabel(/mot de passe/i).fill('volunteer123');
    await page.getByRole('button', { name: /connexion/i }).click();

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard|events)/, { timeout: 5000 });

    // Find and click logout button
    await page.getByRole('button', { name: /déconnexion|logout/i }).click();

    // Should redirect to login or home
    await page.waitForURL(/\/(login|\/)/);

    // Should not see authenticated content
    await expect(page.getByText(/événements/i)).not.toBeVisible();
  });

  test('should protect dashboard route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('should protect admin routes', async ({ page }) => {
    // Login as regular volunteer
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('benevole1@example.com');
    await page.getByLabel(/mot de passe/i).fill('volunteer123');
    await page.getByRole('button', { name: /connexion/i }).click();

    await page.waitForURL(/\/(dashboard|events)/);

    // Try to access admin route
    await page.goto('/admin/events');

    // Should redirect or show error (depending on implementation)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin');
  });
});
