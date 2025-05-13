import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './mobile',
  testMatch: '**/*.mobile.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report/mobile' }]],
  use: {
    baseURL: process.env.MOBILE_APP_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'iOS',
      use: {
        ...devices['iPhone 13'],
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Android',
      use: {
        ...devices['Pixel 5'],
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
}); 