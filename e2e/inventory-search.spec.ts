import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Inventory Search Flow', () => {
    let dashboardPage: DashboardPage;
    let inventorySearchPage: InventorySearchPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        inventorySearchPage = new InventorySearchPage(page);

        // Login and navigate to dashboard
        await page.goto(process.env.LOGIN_URL!);
        await page.click('button:has-text("Log In")');
        await page.waitForURL(`https://${process.env.AUTH0_DOMAIN}/**`);
        await page.fill('input[name="username"]', process.env.AUTH0_USERNAME!);
        await page.fill('input[name="password"]', process.env.AUTH0_PASSWORD!);
        await page.click('button[name="action"]');
        await page.waitForURL(process.env.DASHBOARD_URL!);
    });

    test('should perform inventory search with all criteria', async ({ page }) => {
        // Navigate to inventory search page
        await dashboardPage.navigateToInventorySearch();
        
        // Verify we're on the inventory search page
        await expect(page).toHaveURL(process.env.INVENTORY_SEARCH_URL!);
        
        // Perform search with all criteria
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            carrier: 'SHIPPER',
            shipper: 'Test Shipper',
            date: 'January 2024',
            location: 'Main Warehouse'
        });
        
        // Verify search results
        await inventorySearchPage.verifySearchResults();
        
        // Verify summary report specific elements
        await expect(page.locator('.summary-report')).toBeVisible();
        await expect(page.locator('.total-items')).toContainText(/Total Items: \d+/);
        await expect(page.locator('.inventory-value')).toContainText(/\$[\d,]+/);
    });

    test('should perform inventory search with minimal criteria', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        
        await inventorySearchPage.verifySearchResults();
        
        // Verify detail report specific elements
        await expect(page.locator('.detail-report')).toBeVisible();
        await expect(page.locator('.item-list')).toBeVisible();
        await expect(page.locator('.item-row')).toHaveCount(10); // Assuming 10 items per page
    });

    test('should perform search with different carrier types', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Test with SHIPPER carrier
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            carrier: 'SHIPPER',
            date: 'January 2024'
        });
        await inventorySearchPage.verifySearchResults();
        await expect(page.locator('.carrier-filter')).toContainText('Shipper');
        
        // Test with CARRIER2
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            carrier: 'CARRIER2',
            date: 'January 2024'
        });
        await inventorySearchPage.verifySearchResults();
        await expect(page.locator('.carrier-filter')).toContainText('Carrier2');
    });

    test('should validate search results for different report types', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Test SUMMARY report
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        await expect(page.locator('.summary-report')).toBeVisible();
        await expect(page.locator('.detail-report')).not.toBeVisible();
        
        // Test DETAIL report
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });
        await expect(page.locator('.detail-report')).toBeVisible();
        await expect(page.locator('.summary-report')).not.toBeVisible();
    });

    test('should validate search results with different locations', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        const locations = ['Main Warehouse', 'East Warehouse', 'West Warehouse'];
        
        for (const location of locations) {
            await inventorySearchPage.performSearch({
                reportType: 'SUMMARY',
                date: 'January 2024',
                location: location
            });
            
            await inventorySearchPage.verifySearchResults();
            await expect(page.locator('.location-filter')).toContainText(location);
            
            // Verify location-specific data
            await expect(page.locator('.warehouse-name')).toContainText(location);
            await expect(page.locator('.inventory-count')).toBeVisible();
        }
    });

    test('should validate search results with different dates', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        const months = ['January 2024', 'February 2024', 'March 2024'];
        
        for (const month of months) {
            await inventorySearchPage.performSearch({
                reportType: 'SUMMARY',
                date: month
            });
            
            await inventorySearchPage.verifySearchResults();
            await expect(page.locator('.date-filter')).toContainText(month);
            
            // Verify date-specific data
            await expect(page.locator('.monthly-total')).toBeVisible();
            await expect(page.locator('.inventory-trend')).toBeVisible();
        }
    });
}); 