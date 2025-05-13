import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Auth0 Authentication', () => {
  test('should login successfully with Auth0', async ({ page }) => {
    // Navigate to your application's login page
    await page.goto('YOUR_APPLICATION_LOGIN_URL');

    // Click the login button that redirects to Auth0
    await page.click('button:has-text("Log In")');

    // Wait for Auth0 login page to load
    await page.waitForURL(`https://${process.env.AUTH0_DOMAIN}/**`);

    // Fill in Auth0 credentials
    await page.fill('input[name="username"]', process.env.AUTH0_USERNAME!);
    await page.fill('input[name="password"]', process.env.AUTH0_PASSWORD!);

    // Click the login button on Auth0 page
    await page.click('button[name="action"]');

    // Wait for redirect back to your application
    await page.waitForURL('YOUR_APPLICATION_URL_AFTER_LOGIN');

    // Verify successful login by checking for a logged-in user element
    await expect(page.locator('.user-profile')).toBeVisible();
  });
}); 