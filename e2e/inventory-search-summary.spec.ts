import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { InventorySearchPage } from './pages/inventory-search.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Inventory Search - Summary Report', () => {
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

    test('should display Summary as default report type', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        await inventorySearchPage.verifyDefaultReportType();
    });

    test('should load Summary report with basic criteria', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        // Verify summary report elements
        await expect(page.locator('.summary-report')).toBeVisible();
        await expect(page.locator('.summary-total')).toBeVisible();
        await inventorySearchPage.verifySummaryChartVisible();
    });

    test('should load Summary report with all criteria', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
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

    test('should update Summary report when changing date', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Initial search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        const initialTotal = await inventorySearchPage.getSummaryTotal();
        
        // Change date
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'February 2024'
        });
        
        const newTotal = await inventorySearchPage.getSummaryTotal();
        expect(newTotal).not.toBe(initialTotal);
    });

    test('should show correct Summary data for different locations', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        const locations = ['Main Warehouse', 'East Warehouse', 'West Warehouse'];
        
        for (const location of locations) {
            await inventorySearchPage.performSearch({
                reportType: 'SUMMARY',
                date: 'January 2024',
                location: location
            });
            
            await expect(page.locator('.location-name')).toContainText(location);
            await expect(page.locator('.inventory-count')).toBeVisible();
        }
    });

    test('should handle Summary report errors gracefully', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Test with invalid date
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'Invalid Date'
        });
        
        await inventorySearchPage.verifyErrorMessage('Invalid date range');
    });

    test('should verify Summary report accessibility', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        
        await inventorySearchPage.verifyAccessibility();
    });
}); 