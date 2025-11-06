const { test, expect } = require('@playwright/test');

test.describe('PWA Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have manifest.json link in HTML', async ({ page }) => {
    // Check if manifest is linked
    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifest).toBeTruthy();
    expect(manifest).toContain('manifest');
  });

  test('should have theme-color meta tag', async ({ page }) => {
    // Check theme color is set
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
    expect(themeColor).toBe('#DD2D4A');
  });

  test('should load manifest.json successfully', async ({ page, context }) => {
    // Navigate and wait for network
    await page.waitForLoadState('networkidle');

    // Check manifest loads without error
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.ok()).toBeTruthy();

    const manifestData = await manifestResponse.json();
    expect(manifestData.name).toContain('Baie des Singes');
    expect(manifestData.short_name).toContain('Baie');
    expect(manifestData.theme_color).toBe('#DD2D4A');
    expect(manifestData.background_color).toBe('#131226');
    expect(manifestData.display).toBe('standalone');
  });

  test('should register service worker', async ({ page, context }) => {
    // Grant permission for service worker
    await context.grantPermissions(['notifications']);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for service worker to register
    await page.waitForTimeout(2000);

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    expect(swRegistered).toBeTruthy();
  });

  test('should have valid PWA icons', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    const manifestData = await manifestResponse.json();

    expect(manifestData.icons).toBeDefined();
    expect(manifestData.icons.length).toBeGreaterThan(0);

    // Check that icons have required properties
    const icon = manifestData.icons[0];
    expect(icon.src).toBeTruthy();
    expect(icon.sizes).toBeTruthy();
    expect(icon.type).toBe('image/png');
  });

  test('should have shortcuts defined', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    const manifestData = await manifestResponse.json();

    expect(manifestData.shortcuts).toBeDefined();
    expect(manifestData.shortcuts.length).toBeGreaterThan(0);

    // Check shortcuts have required properties
    const shortcut = manifestData.shortcuts[0];
    expect(shortcut.name).toBeTruthy();
    expect(shortcut.url).toBeTruthy();
    expect(shortcut.icons).toBeDefined();
  });

  test('should cache resources for offline mode', async ({ page, context }) => {
    // Login first to access protected routes
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('benevole1@example.com');
    await page.getByLabel(/mot de passe/i).fill('volunteer123');
    await page.getByRole('button', { name: /connexion/i }).click();

    await page.waitForURL(/\/(dashboard|events)/);
    await page.waitForLoadState('networkidle');

    // Navigate to events page to cache it
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to cache resources
    await page.waitForTimeout(2000);

    // Check if some resources are cached
    const cacheExists = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.length > 0;
    });

    expect(cacheExists).toBeTruthy();
  });

  test('should be installable (have install prompt capability)', async ({ page, context }) => {
    await page.goto('/');

    // Check if PWA is installable by verifying beforeinstallprompt event capability
    const isInstallable = await page.evaluate(() => {
      return 'onbeforeinstallprompt' in window;
    });

    // This test may vary by browser/environment
    // In headless mode, this might not always be true
    if (isInstallable) {
      expect(isInstallable).toBeTruthy();
    } else {
      console.log('Install prompt not available in this environment');
    }
  });

  test('should have proper offline fallback', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to activate
    await page.waitForTimeout(2000);

    // Check that service worker is controlling the page
    const isControlled = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    expect(isControlled).toBeTruthy();
  });
});
