import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Navigation menu selectors
    private readonly inventoryMenu = 'nav >> text=Inventory';
    private readonly searchOption = 'nav >> text=Search';

    async hoverOverInventory() {
        await this.page.hover(this.inventoryMenu);
    }

    async clickSearch() {
        await this.page.click(this.searchOption);
    }

    async navigateToInventorySearch() {
        await this.hoverOverInventory();
        await this.clickSearch();
        await this.waitForPageLoad();
    }
} 