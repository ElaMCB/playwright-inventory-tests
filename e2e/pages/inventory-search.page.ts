import { Page, expect } from '@playwright/test';

export interface SearchCriteria {
    reportType: 'SUMMARY' | 'DETAIL';
    carrier?: string;
    shipper?: string;
    date?: string;
    location?: string;
}

export class InventorySearchPage {
    private page: Page;

    // Selectors
    private readonly reportTypeDropdown = 'select[name="reportType"]';
    private readonly carrierDropdown = 'select[name="carrier"]';
    private readonly shipperDropdown = 'select[name="shipper"]';
    private readonly dateDropdown = 'select[name="date"]';
    private readonly locationDropdown = 'select[name="location"]';
    private readonly searchButton = 'button[type="submit"]';
    
    // Summary Report selectors
    private readonly summaryReport = '.summary-report';
    private readonly summaryTotal = '.summary-total';
    private readonly summaryChart = '.summary-chart';
    private readonly summaryTable = '.summary-table';
    
    // Detail Report selectors
    private readonly detailReport = '.detail-report';
    private readonly detailTable = '.detail-table';
    private readonly detailRow = '.detail-row';
    private readonly pagination = '.pagination';
    private readonly pageNumber = '.page-number';
    private readonly nextPageButton = '.next-page';
    private readonly firstPageButton = '.first-page';
    private readonly sortByNameButton = '.sort-by-name';
    private readonly sortByQuantityButton = '.sort-by-quantity';
    private readonly sortIndicator = '.sort-indicator';
    
    // Common selectors
    private readonly errorMessage = '.error-message';
    private readonly loadingSpinner = '.loading-spinner';

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo() {
        await this.page.goto('/inventory-search');
        await this.waitForPageLoad();
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator(this.reportTypeDropdown)).toBeVisible();
    }

    async verifyDefaultReportType() {
        // Verify the dropdown is visible and has the correct options
        await expect(this.page.locator(this.reportTypeDropdown)).toBeVisible();
        await expect(this.page.locator(`${this.reportTypeDropdown} option[value="SUMMARY"]`)).toBeVisible();
        await expect(this.page.locator(`${this.reportTypeDropdown} option[value="DETAIL"]`)).toBeVisible();
        
        // Verify Summary is selected by default
        const selectedValue = await this.page.locator(this.reportTypeDropdown).inputValue();
        expect(selectedValue).toBe('SUMMARY');
    }

    async performSearch(criteria: SearchCriteria) {
        // Select report type
        await this.page.selectOption(this.reportTypeDropdown, criteria.reportType);

        // Fill in optional criteria
        if (criteria.carrier) {
            await this.page.selectOption(this.carrierDropdown, criteria.carrier);
        }
        if (criteria.shipper) {
            await this.page.selectOption(this.shipperDropdown, criteria.shipper);
        }
        if (criteria.date) {
            await this.page.selectOption(this.dateDropdown, criteria.date);
        }
        if (criteria.location) {
            await this.page.selectOption(this.locationDropdown, criteria.location);
        }

        // Click search button and wait for results
        await this.page.click(this.searchButton);
        await this.waitForSearchResults(criteria.reportType);
    }

    async waitForSearchResults(reportType: 'SUMMARY' | 'DETAIL') {
        // Wait for loading spinner to disappear
        await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });

        // Wait for appropriate report to be visible
        if (reportType === 'SUMMARY') {
            await expect(this.page.locator(this.summaryReport)).toBeVisible();
        } else {
            await expect(this.page.locator(this.detailReport)).toBeVisible();
        }
    }

    // Summary Report methods
    async getSummaryTotal() {
        return await this.page.locator(this.summaryTotal).textContent();
    }

    async verifySummaryChartVisible() {
        await expect(this.page.locator(this.summaryChart)).toBeVisible();
    }

    // Detail Report methods
    async getDetailRowCount() {
        return await this.page.locator(this.detailRow).count();
    }

    async navigateToNextPage() {
        await this.page.click(this.nextPageButton);
        await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    }

    async navigateToFirstPage() {
        await this.page.click(this.firstPageButton);
        await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    }

    async sortByName() {
        await this.page.click(this.sortByNameButton);
        await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    }

    async sortByQuantity() {
        await this.page.click(this.sortByQuantityButton);
        await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
    }

    async getFirstItemName() {
        return await this.page.locator(`${this.detailRow}:first-child .item-name`).textContent();
    }

    // Common methods
    async verifyErrorMessage(message: string) {
        await expect(this.page.locator(this.errorMessage)).toBeVisible();
        await expect(this.page.locator(this.errorMessage)).toContainText(message);
    }

    async verifyAccessibility() {
        // Verify ARIA attributes
        await expect(this.page.locator(this.summaryTable)).toHaveAttribute('aria-label', 'Summary Report Table');
        await expect(this.page.locator(this.detailTable)).toHaveAttribute('aria-label', 'Detail Report Table');
        
        // Verify keyboard navigation
        await this.page.keyboard.press('Tab');
        await expect(this.page.locator(this.reportTypeDropdown)).toBeFocused();
    }
} 