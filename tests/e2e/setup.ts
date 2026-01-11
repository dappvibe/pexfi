import { test as base } from '@playwright/test';

/**
 * Custom test extension to set up E2E environment.
 * It injects a script into the page to set `window.E2E = true`
 * so that the application can detect it's running in an E2E test context.
 */

export const test = base.extend<{any}>({
  page: async ({ page }, next) => {
    await page.addInitScript(() => {
      window.E2E = true
    });

    await next(page);
  },
});

// Re-export expect from Playwright for convenience
export { expect } from '@playwright/test';
