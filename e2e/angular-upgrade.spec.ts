import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Angular 19 Upgrade Verification', () => {
    let dashboardPage: DashboardPage;
    let inventorySearchPage: InventorySearchPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        inventorySearchPage = new InventorySearchPage(page);

        // Login and navigate to dashboard
        await page.goto('YOUR_APPLICATION_LOGIN_URL');
        await page.click('button:has-text("Log In")');
        await page.waitForURL(`https://${process.env.AUTH0_DOMAIN}/**`);
        await page.fill('input[name="username"]', process.env.AUTH0_USERNAME!);
        await page.fill('input[name="password"]', process.env.AUTH0_PASSWORD!);
        await page.click('button[name="action"]');
        await page.waitForURL('YOUR_DASHBOARD_URL');
    });

    test('should verify Angular version', async ({ page }) => {
        // Check Angular version in the browser console
        const version = await page.evaluate(() => {
            // @ts-ignore
            return window.ng?.version?.full;
        });
        expect(version).toBe('19.0.0');
    });

    test('should verify Ivy compilation', async ({ page }) => {
        // Check if the application is using Ivy
        const isIvy = await page.evaluate(() => {
            // @ts-ignore
            return window.ng?.ɵcompilerFacade?.ɵcompilerFacade !== undefined;
        });
        expect(isIvy).toBe(true);
    });

    test('should verify standalone components', async ({ page }) => {
        // Navigate to a page that uses standalone components
        await dashboardPage.navigateToInventorySearch();
        
        // Check if standalone components are properly loaded
        await expect(page.locator('app-inventory-search')).toBeVisible();
        await expect(page.locator('app-search-filters')).toBeVisible();
    });

    test('should verify signals implementation', async ({ page }) => {
        // Navigate to a page that uses signals
        await dashboardPage.navigateToInventorySearch();
        
        // Check if signals are working correctly
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify that the UI updates reactively
        await expect(page.locator('.search-results')).toBeVisible();
        await expect(page.locator('.loading-state')).not.toBeVisible();
    });

    test('should verify hydration', async ({ page }) => {
        // Check if hydration is working correctly
        const isHydrated = await page.evaluate(() => {
            return document.body.getAttribute('ng-version') !== null;
        });
        expect(isHydrated).toBe(true);
    });

    test('should verify new control flow syntax', async ({ page }) => {
        // Navigate to a page that uses the new control flow syntax
        await dashboardPage.navigateToInventorySearch();
        
        // Check if @if, @for, and @switch are working
        await expect(page.locator('.report-type-selector')).toBeVisible();
        await expect(page.locator('.carrier-options')).toBeVisible();
        await expect(page.locator('.date-selector')).toBeVisible();
    });

    test('should verify deferrable views', async ({ page }) => {
        // Check if deferrable views are working
        await dashboardPage.navigateToInventorySearch();
        
        // Verify that deferred content loads correctly
        await expect(page.locator('.deferred-content')).toBeVisible({
            timeout: 10000 // Give more time for deferred content to load
        });
    });

    test('should verify performance improvements', async ({ page }) => {
        // Measure initial page load time
        const startTime = Date.now();
        await dashboardPage.navigateToInventorySearch();
        const loadTime = Date.now() - startTime;
        
        // Verify that the page loads within acceptable time
        expect(loadTime).toBeLessThan(2000); // Adjust threshold as needed
    });

    test('should verify error handling', async ({ page }) => {
        // Test error boundary handling
        await dashboardPage.navigateToInventorySearch();
        
        // Simulate an error condition
        await page.evaluate(() => {
            // @ts-ignore
            window.simulateError();
        });
        
        // Verify that the error is handled gracefully
        await expect(page.locator('.error-boundary')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Something went wrong');
    });

    test('should verify accessibility improvements', async ({ page }) => {
        // Check for ARIA attributes and accessibility features
        await dashboardPage.navigateToInventorySearch();
        
        // Verify ARIA attributes
        await expect(page.locator('select[name="reportType"]')).toHaveAttribute('aria-label');
        await expect(page.locator('button:has-text("Search")')).toHaveAttribute('aria-label');
        
        // Verify keyboard navigation
        await page.keyboard.press('Tab');
        await expect(page.locator('select[name="reportType"]')).toBeFocused();
    });
}); 