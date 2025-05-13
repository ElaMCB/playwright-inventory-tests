import { Page } from '@playwright/test';

export class BasePage {
    constructor(protected page: Page) {}

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async navigateTo(url: string) {
        await this.page.goto(url);
        await this.waitForPageLoad();
    }
} 