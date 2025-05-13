import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Inventory Search - Detail Report', () => {
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

    test('should load Detail report with basic criteria', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify detail report elements
        await expect(page.locator('.detail-report')).toBeVisible();
        await expect(page.locator('.detail-table')).toBeVisible();
        const rowCount = await inventorySearchPage.getDetailRowCount();
        expect(rowCount).toBe(10); // Assuming 10 items per page
    });

    test('should load Detail report with all criteria', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            carrier: 'SHIPPER',
            shipper: 'Test Shipper',
            date: 'January 2024',
            location: 'Main Warehouse'
        });
        
        // Verify all filters are applied
        await expect(page.locator('.carrier-filter')).toContainText('Shipper');
        await expect(page.locator('.shipper-filter')).toContainText('Test Shipper');
        await expect(page.locator('.date-filter')).toContainText('January 2024');
        await expect(page.locator('.location-filter')).toContainText('Main Warehouse');
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
        await inventorySearchPage.navigateToNextPage();
        await expect(page.locator('.page-number')).toContainText('2');
        const rowCount = await inventorySearchPage.getDetailRowCount();
        expect(rowCount).toBe(10);
        
        // Navigate back to first page
        await inventorySearchPage.navigateToFirstPage();
        await expect(page.locator('.page-number')).toContainText('1');
    });

    test('should verify Detail report sorting', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Sort by item name
        await inventorySearchPage.sortByName();
        await expect(page.locator('.sort-indicator')).toContainText('Name');
        
        // Get first item name
        const firstItemName = await inventorySearchPage.getFirstItemName();
        
        // Sort by quantity
        await inventorySearchPage.sortByQuantity();
        await expect(page.locator('.sort-indicator')).toContainText('Quantity');
        
        // Verify the first item changed
        const newFirstItemName = await inventorySearchPage.getFirstItemName();
        expect(newFirstItemName).not.toBe(firstItemName);
    });

    test('should verify Detail report item details', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        // Verify item details are displayed
        await expect(page.locator('.detail-row:first-child .item-name')).toBeVisible();
        await expect(page.locator('.detail-row:first-child .item-quantity')).toBeVisible();
        await expect(page.locator('.detail-row:first-child .item-location')).toBeVisible();
        await expect(page.locator('.detail-row:first-child .item-status')).toBeVisible();
    });

    test('should handle Detail report errors gracefully', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Test with invalid date
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'Invalid Date'
        });
        
        await inventorySearchPage.verifyErrorMessage('Invalid date range');
    });

    test('should verify Detail report accessibility', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        await inventorySearchPage.verifyAccessibility();
    });
}); 