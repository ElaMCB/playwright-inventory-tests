import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Angular 19 Upgrade Verification - Detail Report', () => {
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

    test('should verify Detail report page load', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Select Detail report type
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify Angular version
        const version = await page.evaluate(() => {
            // @ts-ignore
            return window.ng?.version?.full;
        });
        expect(version).toBe('19.0.0');
    });

    test('should verify Detail report standalone components', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify standalone components
        await expect(page.locator('app-detail-report')).toBeVisible();
        await expect(page.locator('app-detail-filters')).toBeVisible();
        await expect(page.locator('app-detail-table')).toBeVisible();
    });

    test('should verify Detail report signals', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Initial search
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify initial data
        await expect(page.locator('.detail-items')).toBeVisible();
        
        // Change date and verify reactive update
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'February 2024'
        });
        
        // Verify data updated
        await expect(page.locator('.detail-items')).toBeVisible();
        await expect(page.locator('.loading-state')).not.toBeVisible();
    });

    test('should verify Detail report control flow', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify @if conditions
        await expect(page.locator('.detail-table')).toBeVisible();
        await expect(page.locator('.no-items-message')).not.toBeVisible();
        
        // Verify @for loops
        await expect(page.locator('.detail-row')).toHaveCount(10); // Assuming 10 items per page
        
        // Verify @switch for status indicators
        await expect(page.locator('.status-indicator')).toBeVisible();
    });

    test('should verify Detail report pagination', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify pagination controls
        await expect(page.locator('.pagination')).toBeVisible();
        await expect(page.locator('.page-number')).toContainText('1');
        
        // Navigate to next page
        await page.click('.next-page');
        await expect(page.locator('.page-number')).toContainText('2');
    });

    test('should verify Detail report sorting', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Sort by item name
        await page.click('.sort-by-name');
        await expect(page.locator('.sort-indicator')).toContainText('Name');
        
        // Sort by quantity
        await page.click('.sort-by-quantity');
        await expect(page.locator('.sort-indicator')).toContainText('Quantity');
    });

    test('should verify Detail report error handling', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Simulate error
        await page.evaluate(() => {
            // @ts-ignore
            window.simulateDetailError();
        });
        
        await expect(page.locator('.detail-error')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Unable to load detail data');
    });

    test('should verify Detail report accessibility', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify ARIA attributes
        await expect(page.locator('.detail-table')).toHaveAttribute('aria-label', 'Detail Report Table');
        await expect(page.locator('.sort-button')).toHaveAttribute('aria-label');
        
        // Verify keyboard navigation
        await page.keyboard.press('Tab');
        await expect(page.locator('.detail-filters')).toBeFocused();
    });
}); 