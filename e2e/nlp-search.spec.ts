import { test, expect } from '@playwright/test';
import { InventorySearchPage } from './pages/inventory-search.page';
import { NLPUtils } from './utils/nlp.utils';
import { DashboardPage } from './pages/dashboard.page';
import dotenv from 'dotenv';

dotenv.config();

test.describe('NLP-Enhanced Inventory Search', () => {
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

    test('should analyze search results using NLP', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform a search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });

        // Get the search results text
        const resultsText = await page.locator('.search-results').textContent();
        expect(resultsText).toBeTruthy();

        // Extract key phrases from results
        const keyPhrases = NLPUtils.extractKeyPhrases(resultsText!);
        console.log('Key phrases:', keyPhrases);

        // Extract entities
        const entities = NLPUtils.extractEntities(resultsText!);
        console.log('Entities:', entities);

        // Verify dates in results
        const dates = NLPUtils.extractDates(resultsText!);
        expect(dates).toContain('January 2024');

        // Extract numbers and verify inventory counts
        const numbers = NLPUtils.extractNumbers(resultsText!);
        expect(numbers.length).toBeGreaterThan(0);
    });

    test('should verify search result similarity', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform first search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'January 2024'
        });
        const results1 = await page.locator('.search-results').textContent();

        // Perform second search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'February 2024'
        });
        const results2 = await page.locator('.search-results').textContent();

        // Calculate similarity between results
        const similarity = NLPUtils.calculateSimilarity(results1!, results2!);
        console.log('Results similarity:', similarity);

        // Verify similarity is within expected range
        expect(similarity).toBeGreaterThan(0);
        expect(similarity).toBeLessThanOrEqual(1);
    });

    test('should analyze sentiment of error messages', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform invalid search
        await inventorySearchPage.performSearch({
            reportType: 'SUMMARY',
            date: 'Invalid Date'
        });

        // Get error message
        const errorMessage = await page.locator('.error-message').textContent();
        expect(errorMessage).toBeTruthy();

        // Analyze sentiment
        const sentiment = NLPUtils.analyzeSentiment(errorMessage!);
        console.log('Error message sentiment:', sentiment);

        // Verify sentiment score
        expect(sentiment.score).toBeLessThan(0); // Error messages should have negative sentiment
    });

    test('should extract and verify keywords in search results', async ({ page }) => {
        await dashboardPage.navigateToInventorySearch();
        
        // Perform search
        await inventorySearchPage.performSearch({
            reportType: 'DETAIL',
            date: 'January 2024'
        });

        // Get results text
        const resultsText = await page.locator('.search-results').textContent();
        expect(resultsText).toBeTruthy();

        // Extract keywords
        const keywords = NLPUtils.extractKeywords(resultsText!);
        console.log('Keywords:', keywords);

        // Verify important keywords are present
        const importantKeywords = ['inventory', 'items', 'total', 'date'];
        const hasImportantKeywords = NLPUtils.containsKeywords(resultsText!, importantKeywords);
        expect(hasImportantKeywords).toBeTruthy();
    });
}); 