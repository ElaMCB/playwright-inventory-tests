import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Angular 19 Upgrade Verification - Summary Report', () => {
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

    test('should verify Summary report page load', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Select Summary report type
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify Angular version
        const version = await page.evaluate(() => {
            // @ts-ignore
            return window.ng?.version?.full;
        });
        expect(version).toBe('19.0.0');
    });

    test('should verify Summary report standalone components', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify standalone components
        await expect(page.locator('app-summary-report')).toBeVisible();
        await expect(page.locator('app-summary-filters')).toBeVisible();
        await expect(page.locator('app-summary-charts')).toBeVisible();
    });

    test('should verify Summary report signals', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Initial search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify initial data
        await expect(page.locator('.summary-total')).toBeVisible();
        
        // Change date and verify reactive update
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'February 2024'
        });
        
        // Verify data updated
        await expect(page.locator('.summary-total')).toBeVisible();
        await expect(page.locator('.loading-state')).not.toBeVisible();
    });

    test('should verify Summary report control flow', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify @if conditions
        await expect(page.locator('.summary-data')).toBeVisible();
        await expect(page.locator('.no-data-message')).not.toBeVisible();
        
        // Verify @for loops
        await expect(page.locator('.summary-row')).toHaveCount(5); // Assuming 5 summary rows
    });

    test('should verify Summary report performance', async ({ page }) => {
        const startTime = Date.now();
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(2000);
    });

    test('should verify Summary report error handling', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Simulate error
        await page.evaluate(() => {
            // @ts-ignore
            window.simulateSummaryError();
        });
        
        await expect(page.locator('.summary-error')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Unable to load summary data');
    });

    test('should verify Summary report accessibility', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify ARIA attributes
        await expect(page.locator('.summary-table')).toHaveAttribute('aria-label', 'Summary Report Table');
        await expect(page.locator('.summary-chart')).toHaveAttribute('aria-label', 'Summary Chart');
        
        // Verify keyboard navigation
        await page.keyboard.press('Tab');
        await expect(page.locator('.summary-filters')).toBeFocused();
    });
}); 