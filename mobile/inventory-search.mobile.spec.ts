import { test, expect } from '@playwright/test';
import { MobileAppPage } from './pages/mobile-app.page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.describe('Mobile App - Inventory Search', () => {
    let mobileApp: MobileAppPage;

    test.beforeEach(async ({ page }) => {
        mobileApp = new MobileAppPage(page);
        
        // Login and navigate to dashboard
        await mobileApp.login(
            process.env.AUTH0_USERNAME!,
            process.env.AUTH0_PASSWORD!
        );
    });

    test('should handle mobile gestures', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        
        // Test pull-to-refresh
        await mobileApp.swipeToRefresh();
        await expect(page.locator('.loading-indicator')).toBeVisible();
        
        // Test swipe navigation
        await page.evaluate(() => {
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 300, clientY: 200 }]
            });
            const touchEnd = new TouchEvent('touchend', {
                touches: [{ clientX: 100, clientY: 200 }]
            });
            document.dispatchEvent(touchStart);
            document.dispatchEvent(touchEnd);
        });
    });

    test('should handle mobile permissions', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        await mobileApp.handlePermissionPrompt();
        
        // Verify app behavior after permission handling
        await expect(page.locator('.permission-status')).toBeVisible();
    });

    test('should work in offline mode', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        await mobileApp.verifyOfflineMode();
        
        // Verify offline mode UI
        await expect(page.locator('.offline-indicator')).toBeVisible();
        await expect(page.locator('.offline-message')).toContainText('You are offline');
    });

    test('should handle mobile keyboard', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        
        // Test keyboard interactions
        await page.fill('input[name="shipper"]', 'Test Shipper');
        await page.keyboard.press('Enter');
        
        // Verify keyboard handling
        await expect(page.locator('.keyboard-dismissed')).toBeVisible();
    });

    test('should handle mobile orientation changes', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        
        // Test orientation change
        await page.setViewportSize({ width: 812, height: 375 }); // Landscape
        await expect(page.locator('.responsive-layout')).toBeVisible();
        
        await page.setViewportSize({ width: 375, height: 812 }); // Portrait
        await expect(page.locator('.responsive-layout')).toBeVisible();
    });

    test('should handle mobile network conditions', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        
        // Simulate slow 3G
        await page.route('**/*', route => 
            route.continue({ 
                url: route.request().url(),
                headers: { ...route.request().headers(), 'X-Network-Condition': 'slow-3g' }
            })
        );
        
        // Verify slow network handling
        await expect(page.locator('.loading-indicator')).toBeVisible();
        await expect(page.locator('.network-warning')).toBeVisible();
    });

    test('should handle mobile app state', async ({ page }) => {
        await mobileApp.navigateToInventorySearch();
        
        // Test app background/foreground
        await page.evaluate(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });
        
        // Verify app state handling
        await expect(page.locator('.app-state-indicator')).toBeVisible();
    });
}); 