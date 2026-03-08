import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Dashboard Navigation
 * Covers: Page navigation, authentication state, layout
 */

test.describe('Dashboard Navigation', () => {
  /**
   * Test: Access dashboard home page
   */
  test('should load dashboard home page', async ({ page }) => {
    await page.goto('/');

    // Check page title or main heading
    await expect(page).toHaveTitle(/Dashboard|Home|OUTE/i);

    // Check for main content area
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  /**
   * Test: Navigate to login page
   */
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();

    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  /**
   * Test: Navigate from login to home
   */
  test('should navigate from login page to home', async ({ page }) => {
    await page.goto('/login');

    // Check if there's a link or button to go home
    const homeLink = page.locator('a[href="/"]');

    // If home link exists, click it
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  /**
   * Test: Page layout is responsive
   */
  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');

    // Check desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    let mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Check mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  /**
   * Test: Page has proper semantic HTML
   */
  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for header
    const header = page.locator('header');
    if (await header.count() > 0) {
      await expect(header).toBeVisible();
    }

    // Check for main
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for navigation
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
  });
});

/**
 * E2E Tests: Login Flow
 * Covers: Form submission, error handling, success redirect
 */

test.describe('Login Flow', () => {
  /**
   * Test: Submit login form with valid credentials
   */
  test('should submit login form with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');

    // Fill password
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for navigation or success message
    // This depends on your app implementation
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
      // Ignore if no navigation happens (SPA behavior)
    });
  });

  /**
   * Test: Show error for invalid email format
   */
  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Fill password
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Try to submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for error message (adjust selector based on your app)
    const errorMessage = page.locator('[role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  /**
   * Test: Require email field
   */
  test('should require email field', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without email
    await page.fill('input[type="password"]', 'SecurePass123!');

    const emailInput = page.locator('input[type="email"]');
    const isRequired = await emailInput.evaluate((el) =>
      (el as HTMLInputElement).required
    );

    expect(isRequired).toBe(true);
  });

  /**
   * Test: Require password field
   */
  test('should require password field', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without password
    await page.fill('input[type="email"]', 'test@example.com');

    const passwordInput = page.locator('input[type="password"]');
    const isRequired = await passwordInput.evaluate((el) =>
      (el as HTMLInputElement).required
    );

    expect(isRequired).toBe(true);
  });

  /**
   * Test: Password field is masked
   */
  test('should mask password input', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    const inputType = await passwordInput.evaluate((el) =>
      (el as HTMLInputElement).type
    );

    expect(inputType).toBe('password');
  });

  /**
   * Test: Submit button is visible and clickable
   */
  test('should have visible and clickable submit button', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });
});

/**
 * E2E Tests: Dashboard Accessibility
 * Covers: Keyboard navigation, form labels, contrast
 */

test.describe('Dashboard Accessibility', () => {
  /**
   * Test: All form inputs have labels
   */
  test('should have labels for all form inputs', async ({ page }) => {
    await page.goto('/login');

    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        expect(await label.count()).toBeGreaterThan(0);
      }
    }
  });

  /**
   * Test: Can navigate with keyboard
   */
  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto('/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() =>
      document.activeElement?.tagName
    );

    expect(focusedElement).toBeTruthy();
  });

  /**
   * Test: Links are focusable
   */
  test('should have focusable links', async ({ page }) => {
    await page.goto('/login');

    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      const tabIndex = await firstLink.getAttribute('tabindex');

      // tabindex should not be -1 (unless intentionally hidden)
      if (tabIndex !== null) {
        expect(parseInt(tabIndex, 10)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
