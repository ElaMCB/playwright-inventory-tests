import { test, expect } from '@playwright/test';
import { InventorySearchPage } from './pages/inventory-search.page';
import { NLPUtils } from './utils/nlp.utils';
import { DashboardPage } from './pages/dashboard.page';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Inventory NLP Analysis', () => {
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

    test('should analyze inventory summary report', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform summary search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });

        // Get summary report text
        const summaryText = await page.locator('.summary-report').textContent();
        expect(summaryText).toBeTruthy();

        // Extract and verify inventory numbers
        const numbers = NLPUtils.extractNumbers(summaryText!);
        expect(numbers.length).toBeGreaterThan(0);
        
        // Verify total inventory count is present
        const hasTotalCount = NLPUtils.containsKeywords(summaryText!, ['total', 'count', 'items']);
        expect(hasTotalCount).toBeTruthy();

        // Extract and verify dates
        const dates = NLPUtils.extractDates(summaryText!);
        expect(dates).toContain('January 2024');
    });

    test('should analyze inventory detail report', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform detail search
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });

        // Get detail report text
        const detailText = await page.locator('.detail-report').textContent();
        expect(detailText).toBeTruthy();

        // Extract key phrases to verify report structure
        const keyPhrases = NLPUtils.extractKeyPhrases(detailText!);
        console.log('Detail report key phrases:', keyPhrases);

        // Verify important inventory terms
        const inventoryTerms = ['item', 'quantity', 'location', 'status'];
        const hasInventoryTerms = NLPUtils.containsKeywords(detailText!, inventoryTerms);
        expect(hasInventoryTerms).toBeTruthy();

        // Extract and verify item numbers
        const itemNumbers = NLPUtils.extractNumbers(detailText!);
        expect(itemNumbers.length).toBeGreaterThan(0);
    });

    test('should compare inventory reports across locations', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Get inventory for Main Warehouse
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            location: 'Main Warehouse',
            date: 'January 2024'
        });
        const mainWarehouseText = await page.locator('.summary-report').textContent();

        // Get inventory for East Warehouse
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            location: 'East Warehouse',
            date: 'January 2024'
        });
        const eastWarehouseText = await page.locator('.summary-report').textContent();

        // Calculate similarity between warehouse reports
        const similarity = NLPUtils.calculateSimilarity(mainWarehouseText!, eastWarehouseText!);
        console.log('Warehouse reports similarity:', similarity);

        // Verify reports have some similarity but are not identical
        expect(similarity).toBeGreaterThan(0.3); // At least 30% similar
        expect(similarity).toBeLessThan(1); // Not identical
    });

    test('should analyze inventory trends', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Get current month's inventory
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        const currentMonthText = await page.locator('.summary-report').textContent();

        // Get previous month's inventory
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'December 2023'
        });
        const previousMonthText = await page.locator('.summary-report').textContent();

        // Extract numbers from both reports
        const currentNumbers = NLPUtils.extractNumbers(currentMonthText!);
        const previousNumbers = NLPUtils.extractNumbers(previousMonthText!);

        // Verify we have comparable data
        expect(currentNumbers.length).toBeGreaterThan(0);
        expect(previousNumbers.length).toBeGreaterThan(0);

        // Extract key phrases to identify trends
        const currentPhrases = NLPUtils.extractKeyPhrases(currentMonthText!);
        const previousPhrases = NLPUtils.extractKeyPhrases(previousMonthText!);
        
        console.log('Current month key phrases:', currentPhrases);
        console.log('Previous month key phrases:', previousPhrases);
    });

    test('should verify inventory search filters', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Test with carrier filter
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            carrier: 'SHIPPER',
            date: 'January 2024'
        });
        const carrierText = await page.locator('.summary-report').textContent();
        
        // Verify carrier-specific terms
        const carrierTerms = ['shipper', 'carrier', 'transport'];
        const hasCarrierTerms = NLPUtils.containsKeywords(carrierText!, carrierTerms);
        expect(hasCarrierTerms).toBeTruthy();

        // Test with shipper filter
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            shipper: 'Test Shipper',
            date: 'January 2024'
        });
        const shipperText = await page.locator('.summary-report').textContent();
        
        // Verify shipper-specific terms
        const shipperTerms = ['shipper', 'consignor', 'sender'];
        const hasShipperTerms = NLPUtils.containsKeywords(shipperText!, shipperTerms);
        expect(hasShipperTerms).toBeTruthy();
    });
}); 