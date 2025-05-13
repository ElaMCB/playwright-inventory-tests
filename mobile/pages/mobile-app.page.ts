import { Page, expect } from '@playwright/test';

export class MobileAppPage {
    constructor(private page: Page) {}

    // Selectors
    private readonly loginButton = 'button:has-text("Log In")';
    private readonly usernameInput = 'input[name="username"]';
    private readonly passwordInput = 'input[name="password"]';
    private readonly submitButton = 'button[name="action"]';
    private readonly inventorySearchButton = 'button:has-text("Inventory Search")';
    private readonly reportTypeDropdown = 'select[name="reportType"]';
    private readonly searchButton = 'button:has-text("Search")';
    private readonly errorMessage = '.error-message';

    // Actions
    async login(username: string, password: string) {
        await this.page.click(this.loginButton);
        await this.page.waitForURL(`https://${process.env.AUTH0_DOMAIN}/**`);
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.submitButton);
        await this.page.waitForURL('YOUR_DASHBOARD_URL');
    }

    async navigateToInventorySearch() {
        await this.page.click(this.inventorySearchButton);
        await this.page.waitForLoadState('networkidle');
    }

    async selectReportType(type: 'SUMMARY' | 'DETAIL') {
        await this.page.selectOption(this.reportTypeDropdown, type);
    }

    async performSearch(criteria: {
        reportType: 'SUMMARY' | 'DETAIL';
        carrier?: string;
        shipper?: string;
        date?: string;
        location?: string;
    }) {
        await this.selectReportType(criteria.reportType);
        
        if (criteria.carrier) {
            await this.page.selectOption('select[name="carrier"]', criteria.carrier);
        }
        
        if (criteria.shipper) {
            await this.page.fill('input[name="shipper"]', criteria.shipper);
        }
        
        if (criteria.date) {
            await this.page.fill('input[name="date"]', criteria.date);
        }
        
        if (criteria.location) {
            await this.page.selectOption('select[name="location"]', criteria.location);
        }

        await this.page.click(this.searchButton);
        await this.page.waitForLoadState('networkidle');
    }

    // Verifications
    async verifyErrorMessage(message: string) {
        await expect(this.page.locator(this.errorMessage)).toContainText(message);
    }

    async verifyReportType(type: 'SUMMARY' | 'DETAIL') {
        const selectedValue = await this.page.evaluate(
            (selector) => (document.querySelector(selector) as HTMLSelectElement).value,
            this.reportTypeDropdown
        );
        expect(selectedValue).toBe(type);
    }

    async verifySearchResults() {
        await expect(this.page.locator('.search-results')).toBeVisible();
    }

    // Mobile-specific methods
    async swipeToRefresh() {
        await this.page.evaluate(() => {
            // Simulate pull-to-refresh gesture
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }]
            });
            const touchEnd = new TouchEvent('touchend', {
                touches: [{ clientX: 100, clientY: 300 }]
            });
            document.dispatchEvent(touchStart);
            document.dispatchEvent(touchEnd);
        });
    }

    async handlePermissionPrompt() {
        // Handle iOS/Android permission prompts
        this.page.on('dialog', async dialog => {
            if (dialog.type() === 'prompt') {
                await dialog.accept();
            }
        });
    }

    async verifyOfflineMode() {
        // Simulate offline mode
        await this.page.route('**/*', route => route.abort());
        await this.verifyErrorMessage('No internet connection');
    }
} 